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
// sentence the recording never says. A later "thousand" must not win
// because the words after it agree for longer.
const NEAR = 8;
const FAR = 24;
const FAR_MIN = 4;

const SMALL: Readonly<Record<string, number>> = {
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

const TENS: Readonly<Record<string, number>> = {
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
};

const SCALE: Readonly<Record<string, number>> = {
    hundred: 100,
    thousand: 1000,
    million: 1_000_000,
    billion: 1_000_000_000,
};

const ROMAN_PARTS: readonly (readonly [string, number])[] = [
    ['x', 10],
    ['ix', 9],
    ['v', 5],
    ['iv', 4],
    ['i', 1],
];

type Piece =
    | { kind: 'int'; value: number }
    | { kind: 'small'; value: number }
    | { kind: 'tens'; value: number }
    | { kind: 'scale'; value: number };

type Timed = {
    norm: string;
    start: number;
    end: number;
};

function lookup(table: Readonly<Record<string, number>>, word: string) {
    return Object.hasOwn(table, word) ? table[word] : undefined;
}

function romanWord(value: number) {
    let rest = value;
    let word = '';
    for (const [glyph, part] of ROMAN_PARTS) {
        while (rest >= part) {
            word += glyph;
            rest -= part;
        }
    }
    return word;
}

function romanValue(token: string) {
    if (!/^[ivx]+$/.test(token)) return null;
    let rest = token;
    let total = 0;
    for (const [glyph, value] of ROMAN_PARTS) {
        while (rest.startsWith(glyph)) {
            rest = rest.slice(glyph.length);
            total += value;
        }
    }
    if (rest.length > 0 || total < 1 || total > 20) return null;
    if (romanWord(total) !== token) return null;
    return total;
}

function tokenNode(token: object) {
    if (!('node' in token)) return undefined;
    const node = token.node;
    return typeof node === 'object' && node !== null ? node : undefined;
}

function samePlace(left: object, right: object) {
    const leftNode = tokenNode(left);
    const rightNode = tokenNode(right);
    if (leftNode === undefined && rightNode === undefined) return true;
    return leftNode !== undefined && leftNode === rightNode;
}

function pieceOf(token: string, previous: string | undefined): Piece | null {
    const clock = /^(\d{1,2}):(\d{2})$/.exec(token);
    if (clock) {
        const hour = Number(clock[1]);
        const minute = Number(clock[2]);
        if (minute === 0 && hour >= 0 && hour <= 23) {
            return { kind: 'int', value: hour };
        }
        return null;
    }

    if (/^(?:\d{1,3}(?:,\d{3})+|\d+)$/.test(token)) {
        const value = Number(token.replaceAll(',', ''));
        if (Number.isSafeInteger(value)) return { kind: 'int', value };
        return null;
    }

    const small = lookup(SMALL, token);
    if (small !== undefined) return { kind: 'small', value: small };
    const tens = lookup(TENS, token);
    if (tens !== undefined) return { kind: 'tens', value: tens };
    const scale = lookup(SCALE, token);
    if (scale !== undefined) return { kind: 'scale', value: scale };

    const roman = romanValue(token);
    if (roman === null) return null;
    const spelledOut =
        previous === 'part' ||
        previous === 'chapter' ||
        previous === 'book' ||
        previous === 'volume' ||
        previous === 'act' ||
        previous === 'scene';
    if (token.length === 1 && !spelledOut) return null;
    return { kind: 'int', value: roman };
}

function applyPiece(
    piece: Piece,
    total: number,
    current: number,
): { total: number; current: number } | null {
    switch (piece.kind) {
        case 'scale': {
            const base = current === 0 ? 1 : current;
            if (piece.value >= 1000) {
                return { total: total + base * piece.value, current: 0 };
            }
            return { total, current: base * piece.value };
        }
        case 'small': {
            if (current % 10 !== 0) return null;
            return { total, current: current + piece.value };
        }
        case 'tens': {
            if (current % 100 !== 0) return null;
            return { total, current: current + piece.value };
        }
        case 'int': {
            if (current !== 0) return null;
            return { total, current: piece.value };
        }
        default: {
            const unreachable: never = piece;
            return unreachable;
        }
    }
}

function takeNumber<T extends Timed>(tokens: T[], start: number) {
    const first = tokens[start];
    if (!first) return null;
    let total = 0;
    let current = 0;
    let seen = false;
    let index = start;

    while (index < tokens.length && index < start + 8) {
        const token = tokens[index];
        if (!token) break;
        if (index > start && !samePlace(first, token)) break;
        const word = token.norm;
        const next = tokens[index + 1];
        if (
            (word === 'a' || word === 'an') &&
            !seen &&
            next &&
            samePlace(token, next) &&
            lookup(SCALE, next.norm) !== undefined
        ) {
            current = 1;
            seen = true;
            index += 1;
            continue;
        }
        if (word === 'and' && seen && next && samePlace(token, next)) {
            const followed = pieceOf(next.norm, undefined);
            if (
                followed &&
                (followed.kind === 'small' ||
                    followed.kind === 'tens' ||
                    followed.kind === 'scale')
            ) {
                index += 1;
                continue;
            }
        }

        const piece = pieceOf(
            word,
            index === start ? tokens[start - 1]?.norm : undefined,
        );
        if (!piece) break;
        const applied = applyPiece(piece, total, current);
        if (!applied) break;
        total = applied.total;
        current = applied.current;
        seen = true;
        index += 1;
    }

    if (!seen || index === start) return null;
    return { value: total + current, count: index - start };
}

function foldNumbers<T extends Timed>(tokens: T[]): T[] {
    const folded: T[] = [];
    let index = 0;
    while (index < tokens.length) {
        const taken = takeNumber(tokens, index);
        const first = tokens[index];
        if (!taken || !first) {
            if (first) folded.push(first);
            index += 1;
            continue;
        }
        const last = tokens[index + taken.count - 1] ?? first;
        const norm = String(taken.value);
        if (taken.count === 1 && norm === first.norm) folded.push(first);
        else folded.push({ ...first, norm, end: last.end });
        index += taken.count;
    }
    return folded;
}

function matchLength<T extends { norm: string }>(
    spoken: { norm: string }[],
    spokenIndex: number,
    article: T[],
    start: number,
) {
    const remaining = spoken.length - spokenIndex;
    let length = 0;
    while (
        length < remaining &&
        start + length < article.length &&
        article[start + length]?.norm === spoken[spokenIndex + length]?.norm
    ) {
        length += 1;
    }
    return length;
}

function bestRun<T extends { norm: string }>(
    spoken: SpokenToken[],
    spokenIndex: number,
    article: T[],
    cursor: number,
): { length: number; at: number } {
    const remaining = spoken.length - spokenIndex;
    if (remaining <= 0) return { length: 0, at: -1 };

    let nearLength = 0;
    let nearAt = -1;
    let farLength = 0;
    let farAt = -1;
    const last = Math.min(article.length, cursor + FAR);

    for (let start = cursor; start < last; start += 1) {
        const length = matchLength(spoken, spokenIndex, article, start);
        if (length === 0) continue;
        const distance = start - cursor;
        if (distance < NEAR) {
            if (length > nearLength) {
                nearLength = length;
                nearAt = start;
                if (length === remaining) break;
            }
        } else if (length >= FAR_MIN && length > farLength) {
            farLength = length;
            farAt = start;
            if (length === remaining) break;
        }
    }

    if (farLength > nearLength) return { length: farLength, at: farAt };
    if (nearLength === 0) return { length: 0, at: -1 };
    return { length: nearLength, at: nearAt };
}

// Walk the spoken words in order. A later stretch of the article is used only
// when it is still close and matches a longer run, so a heading, a note, or a
// word the page leaves out can sit in between. A copy of the same word further
// down the page does not take the cursor. A spoken word the page never prints
// is dropped when skipping it lines the rest up.
export function alignSpokenWords<T extends Timed>(
    spoken: SpokenToken[],
    article: T[],
): AlignedToken<T>[] {
    const said = foldNumbers(spoken);
    const page = foldNumbers(article);
    const aligned: AlignedToken<T>[] = [];
    let spokenIndex = 0;
    let cursor = 0;

    while (spokenIndex < said.length && cursor <= page.length) {
        const run = bestRun(said, spokenIndex, page, cursor);
        const withoutThisWord = bestRun(said, spokenIndex + 1, page, cursor);
        if (withoutThisWord.length > run.length) {
            spokenIndex += 1;
            continue;
        }

        if (run.length === 0 || run.at < 0) {
            spokenIndex += 1;
            continue;
        }

        for (let offset = 0; offset < run.length; offset += 1) {
            const match = page[run.at + offset];
            const token = said[spokenIndex + offset];
            if (!match || !token) continue;
            aligned.push({
                ...match,
                timeStart: token.start,
                timeEnd: token.end,
            });
        }

        spokenIndex += run.length;
        cursor = run.at + run.length;
    }

    return aligned;
}
