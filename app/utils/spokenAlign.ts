const TOKEN_RE =
    /(?:\d{1,3}(?:,\d{3})+|\d{1,2}:\d{2}|\d+(?:st|nd|rd|th)?)|[0-9A-Za-z\u00C0-\u024F]+(?:['’ʼ][0-9A-Za-z\u00C0-\u024F]+)*|&/g;

const SKIP =
    '.audio-player, [data-spoken-skip], .spoken-skip, .margin-note, pre, script, style, svg, button, textarea, input, select';

export type TextToken = {
    norm: string;
    start: number;
    end: number;
};

export type SpokenToken = {
    norm: string;
    start: number;
    end: number;
};

export function normalizeToken(raw: string): string {
    if (raw === '&') return 'and';
    const word = raw
        .normalize('NFKC')
        .replace(/[’ʼ′]/g, "'")
        .toLowerCase()
        .replace(/'/g, '');
    return word.replace(/^(\d+)(?:st|nd|rd|th)$/, '$1');
}

// Spoken captions often read numerals aloud ("three", "1,000") while the page
// prints another shape ("III", "thousand"). Those shapes compare equal, and a
// compound such as "twenty thousand" can match one spoken "20,000", but the
// printed tokens stay as they are.
const SMALL_WORDS: Readonly<Record<string, number>> = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
};

const TENS_WORDS: Readonly<Record<string, number>> = {
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
};

const SCALE_WORDS: Readonly<Record<string, number>> = {
    hundred: 100,
    thousand: 1000,
    million: 1_000_000,
    billion: 1_000_000_000,
};

const NUMBER_WORDS: Readonly<Record<string, number>> = {
    ...SMALL_WORDS,
    ...TENS_WORDS,
};

const ROMAN_RE =
    /^(?=.)m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$/;

const ROMAN_DIGIT: Record<string, number> = {
    i: 1,
    v: 5,
    x: 10,
    l: 50,
    c: 100,
    d: 500,
    m: 1000,
};

function namedValue(table: Readonly<Record<string, number>>, word: string) {
    if (!Object.hasOwn(table, word)) return undefined;
    return table[word];
}

export function numberValue(norm: string): number | null {
    const clock = /^(\d{1,2}):(\d{2})$/.exec(norm);
    if (clock) {
        const hour = Number(clock[1]);
        const minute = Number(clock[2]);
        if (minute === 0 && hour <= 23) return hour;
        return null;
    }
    if (/^\d{1,3}(?:,\d{3})+$/.test(norm)) {
        const value = Number(norm.replaceAll(',', ''));
        return Number.isSafeInteger(value) ? value : null;
    }
    if (/^\d+$/.test(norm)) {
        const value = Number(norm);
        return Number.isSafeInteger(value) ? value : null;
    }
    const named = namedValue(NUMBER_WORDS, norm);
    if (named !== undefined) return named;
    const scale = namedValue(SCALE_WORDS, norm);
    if (scale !== undefined) return scale;
    if (!ROMAN_RE.test(norm)) return null;

    let total = 0;
    for (let index = 0; index < norm.length; index += 1) {
        const current = ROMAN_DIGIT[norm[index] ?? ''];
        const next = ROMAN_DIGIT[norm[index + 1] ?? ''];
        if (current === undefined) return null;
        if (next !== undefined && current < next) {
            total += next - current;
            index += 1;
        } else {
            total += current;
        }
    }
    // Part/chapter headings stay in a small range; longer roman-shaped words
    // like "mix" stay ordinary text.
    if (total < 1 || total > 100) return null;
    return total;
}

export function tokensEqual(
    left: string | undefined,
    right: string | undefined,
): boolean {
    if (left === undefined || right === undefined) return false;
    if (left === right) return true;
    const a = numberValue(left);
    const b = numberValue(right);
    return a !== null && b !== null && a === b;
}

export function tokensIn(text: string): TextToken[] {
    TOKEN_RE.lastIndex = 0;
    const tokens: TextToken[] = [];
    for (const match of text.matchAll(TOKEN_RE)) {
        const raw = match[0];
        const norm = normalizeToken(raw);
        const start = match.index ?? 0;
        if (!norm) continue;
        tokens.push({ norm, start, end: start + raw.length });
    }
    return tokens;
}

export type ArticleToken = TextToken & {
    node: Text;
};

export function collectArticleTokens(root: ParentNode): ArticleToken[] {
    const tokens: ArticleToken[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parent = node.parentElement;
            if (!parent || parent.closest(SKIP))
                return NodeFilter.FILTER_REJECT;
            if (!node.textContent) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        },
    });

    let current = walker.nextNode();
    while (current) {
        const node = current as Text;
        for (const token of tokensIn(node.data)) {
            tokens.push({ ...token, node });
        }
        current = walker.nextNode();
    }
    return tokens;
}

export type AlignedToken<T> = T & {
    timeStart: number;
    timeEnd: number;
};

// A repeated word a few tokens ahead can be the real phrase ("the cat"
// after "the dog"). Past that, only a solid run may skip a heading or a
// sentence the recording never says.
const NEAR = 8;
const FAR = 24;
const FAR_MIN = 4;

type Phrase = {
    value: number;
    count: number;
};

type Step = {
    spokenCount: number;
    articleCount: number;
};

function canAppend(word: string, current: number) {
    const scale = namedValue(SCALE_WORDS, word);
    if (scale !== undefined) {
        const base = current === 0 ? 1 : current;
        return base < scale;
    }
    const tens = namedValue(TENS_WORDS, word);
    if (tens !== undefined) return current % 100 === 0;
    const small = namedValue(SMALL_WORDS, word);
    if (small !== undefined) return current % 10 === 0;
    return false;
}

function takeNumberPhrase<T extends { norm: string }>(
    tokens: T[],
    start: number,
): Phrase | null {
    let total = 0;
    let current = 0;
    let seen = false;
    let index = start;

    while (index < tokens.length && index - start < 8) {
        const word = tokens[index]?.norm;
        if (!word) break;
        const next = tokens[index + 1]?.norm;

        if (
            (word === 'a' || word === 'an') &&
            !seen &&
            next !== undefined &&
            namedValue(SCALE_WORDS, next) !== undefined
        ) {
            current = 1;
            seen = true;
            index += 1;
            continue;
        }
        if (
            word === 'and' &&
            seen &&
            next !== undefined &&
            canAppend(next, current)
        ) {
            index += 1;
            continue;
        }

        const scale = namedValue(SCALE_WORDS, word);
        if (scale !== undefined) {
            if (current === 0 && total !== 0) break;
            const base = current === 0 ? 1 : current;
            if (base >= scale) break;
            if (scale >= 1000) {
                total += base * scale;
                current = 0;
            } else {
                current = base * scale;
            }
            seen = true;
            index += 1;
            continue;
        }

        const tens = namedValue(TENS_WORDS, word);
        if (tens !== undefined) {
            if (current % 100 !== 0) break;
            current += tens;
            seen = true;
            index += 1;
            continue;
        }

        const small = namedValue(SMALL_WORDS, word);
        if (small !== undefined) {
            if (current % 10 !== 0) break;
            current += small;
            seen = true;
            index += 1;
            continue;
        }

        const value = numberValue(word);
        if (value === null || seen) break;
        current = value;
        seen = true;
        index += 1;
    }

    if (!seen || index === start) return null;
    return { value: total + current, count: index - start };
}

function matchStep<T extends { norm: string }>(
    spoken: T[],
    spokenIndex: number,
    article: T[],
    articleIndex: number,
): Step | null {
    const spokenPhrase = takeNumberPhrase(spoken, spokenIndex);
    const articlePhrase = takeNumberPhrase(article, articleIndex);
    if (
        spokenPhrase &&
        articlePhrase &&
        spokenPhrase.value === articlePhrase.value &&
        spokenPhrase.count !== articlePhrase.count &&
        spokenPhrase.count > 0 &&
        articlePhrase.count > 0
    ) {
        return {
            spokenCount: spokenPhrase.count,
            articleCount: articlePhrase.count,
        };
    }
    if (tokensEqual(spoken[spokenIndex]?.norm, article[articleIndex]?.norm)) {
        return { spokenCount: 1, articleCount: 1 };
    }
    return null;
}

function matchAhead<T extends { norm: string }>(
    spoken: T[],
    spokenIndex: number,
    article: T[],
    start: number,
) {
    const steps: Step[] = [];
    let spokenCursor = spokenIndex;
    let articleCursor = start;
    while (spokenCursor < spoken.length && articleCursor < article.length) {
        const step = matchStep(spoken, spokenCursor, article, articleCursor);
        if (!step) break;
        steps.push(step);
        spokenCursor += step.spokenCount;
        articleCursor += step.articleCount;
    }
    return {
        spokenLength: spokenCursor - spokenIndex,
        articleLength: articleCursor - start,
        steps,
    };
}

type Run = {
    spokenLength: number;
    articleLength: number;
    at: number;
    steps: Step[];
};

function bestRun<T extends { norm: string }>(
    spoken: SpokenToken[],
    spokenIndex: number,
    article: T[],
    cursor: number,
): Run {
    const empty: Run = {
        spokenLength: 0,
        articleLength: 0,
        at: -1,
        steps: [],
    };
    const remaining = spoken.length - spokenIndex;
    if (remaining <= 0) return empty;

    let near = empty;
    let far = empty;
    const last = Math.min(article.length, cursor + FAR);
    for (let start = cursor; start < last; start += 1) {
        const match = matchAhead(spoken, spokenIndex, article, start);
        if (match.spokenLength === 0) continue;
        const run: Run = { ...match, at: start };
        const distance = start - cursor;
        if (distance < NEAR) {
            if (match.spokenLength > near.spokenLength) {
                near = run;
                if (match.spokenLength === remaining) break;
            }
        } else if (
            match.spokenLength >= FAR_MIN &&
            match.spokenLength > far.spokenLength
        ) {
            far = run;
            if (match.spokenLength === remaining) break;
        }
    }

    if (far.spokenLength > near.spokenLength) return far;
    if (near.spokenLength === 0) return empty;
    return near;
}

function placeTimes<T extends { norm: string }>(
    spoken: SpokenToken[],
    article: T[],
    step: Step,
): AlignedToken<T>[] {
    const first = spoken[0];
    const last = spoken[spoken.length - 1];
    if (!first || !last) return [];
    if (step.spokenCount === step.articleCount) {
        return article.flatMap((match, index) => {
            const token = spoken[index];
            if (!token) return [];
            return [{ ...match, timeStart: token.start, timeEnd: token.end }];
        });
    }
    if (article.length === 1) {
        const match = article[0];
        if (!match) return [];
        return [{ ...match, timeStart: first.start, timeEnd: last.end }];
    }
    const span = last.end - first.start;
    const slice = span / article.length;
    return article.map((match, index) => ({
        ...match,
        timeStart: first.start + slice * index,
        timeEnd: first.start + slice * (index + 1),
    }));
}

// Walk the spoken words in order. A later stretch is used only when it is
// still close and matches more of what is about to be said, so a heading or a
// word the page leaves out can sit in between. A copy further down the page
// does not take the cursor. The matched article tokens keep their printed
// text. A spoken word the page never prints is dropped when skipping it lines
// the rest up.
export function alignSpokenWords<T extends { norm: string }>(
    spoken: SpokenToken[],
    article: T[],
): AlignedToken<T>[] {
    const aligned: AlignedToken<T>[] = [];
    let spokenIndex = 0;
    let cursor = 0;

    while (spokenIndex < spoken.length && cursor <= article.length) {
        const run = bestRun(spoken, spokenIndex, article, cursor);
        const withoutThisWord = bestRun(
            spoken,
            spokenIndex + 1,
            article,
            cursor,
        );
        if (withoutThisWord.spokenLength > run.spokenLength) {
            spokenIndex += 1;
            continue;
        }

        if (run.spokenLength === 0 || run.at < 0) {
            spokenIndex += 1;
            continue;
        }

        let spokenOffset = 0;
        let articleOffset = 0;
        for (const step of run.steps) {
            const spokenSlice = spoken.slice(
                spokenIndex + spokenOffset,
                spokenIndex + spokenOffset + step.spokenCount,
            );
            const articleSlice = article.slice(
                run.at + articleOffset,
                run.at + articleOffset + step.articleCount,
            );
            aligned.push(...placeTimes(spokenSlice, articleSlice, step));
            spokenOffset += step.spokenCount;
            articleOffset += step.articleCount;
        }

        spokenIndex += run.spokenLength;
        cursor = run.at + run.articleLength;
    }

    return aligned;
}
