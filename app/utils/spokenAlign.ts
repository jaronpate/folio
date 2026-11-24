const TOKEN_RE =
    /[0-9A-Za-z\u00C0-\u024F]+(?:['’ʼ][0-9A-Za-z\u00C0-\u024F]+)*|&/g;

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

const NEAR = 48;

function bestRun<T extends { norm: string }>(
    spoken: SpokenToken[],
    spokenIndex: number,
    article: T[],
    cursor: number,
): { length: number; at: number } {
    let nearLength = 0;
    let nearAt = -1;
    let farLength = 0;
    let farAt = -1;
    const remaining = spoken.length - spokenIndex;
    if (remaining <= 0) return { length: 0, at: -1 };

    for (let start = cursor; start < article.length; start += 1) {
        let length = 0;
        while (
            length < remaining &&
            start + length < article.length &&
            article[start + length]?.norm === spoken[spokenIndex + length]?.norm
        ) {
            length += 1;
        }
        if (length === 0) continue;
        if (start - cursor <= NEAR) {
            if (length > nearLength) {
                nearLength = length;
                nearAt = start;
            }
        } else if (length > farLength) {
            farLength = length;
            farAt = start;
        }
        if (length === remaining) break;
    }

    // A repeated phrase at the other end of the page is not a reason to leave
    // the paragraph we are in. A long run still may, when the page has skipped
    // a stretch of the recording.
    if (nearLength > 0 && farLength < nearLength + 6) {
        return { length: nearLength, at: nearAt };
    }
    if (farLength >= 8 && farLength > nearLength) {
        return { length: farLength, at: farAt };
    }
    if (nearLength > 0) return { length: nearLength, at: nearAt };
    return { length: 0, at: -1 };
}

// Walk the spoken words in order. A later stretch of the article is used only
// when it matches a longer run of what is about to be said, so a heading, a
// note, or a word the page leaves out can sit in between. A spoken word the
// page never prints is dropped when skipping it lines the rest up further.
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
        if (withoutThisWord.length > run.length) {
            spokenIndex += 1;
            continue;
        }

        if (run.length === 0 || run.at < 0) {
            spokenIndex += 1;
            continue;
        }

        for (let offset = 0; offset < run.length; offset += 1) {
            const match = article[run.at + offset];
            const token = spoken[spokenIndex + offset];
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

type TokenIndex = { norm: string; index: number };

type PhraseHit = { at: number; length: number };

// Map each previous article word onto the edited article, or -1 when the
// edit removed it. Shared prefix, shared suffix, then unique phrases in
// what remains, so one changed sentence does not unlink the rest.
function mapEditedTokens(before: TokenIndex[], after: TokenIndex[]): number[] {
    const map = new Array<number>(before.length).fill(-1);
    mapTokenRange(before, after, 0, before.length, 0, after.length, map, 0);
    return map;
}

function mapTokenRange(
    before: TokenIndex[],
    after: TokenIndex[],
    b0: number,
    b1: number,
    a0: number,
    a1: number,
    map: number[],
    depth: number,
) {
    if (depth > 40 || b0 >= b1 || a0 >= a1) return;
    let b = b0;
    let a = a0;
    while (b < b1 && a < a1 && before[b]?.norm === after[a]?.norm) {
        map[b] = a;
        b += 1;
        a += 1;
    }
    let bEnd = b1;
    let aEnd = a1;
    while (
        bEnd > b &&
        aEnd > a &&
        before[bEnd - 1]?.norm === after[aEnd - 1]?.norm
    ) {
        bEnd -= 1;
        aEnd -= 1;
        map[bEnd] = aEnd;
    }
    if (b >= bEnd || a >= aEnd) return;
    const phrase = findPhrase(before, after, b, bEnd, a, aEnd);
    if (!phrase) return;
    for (let offset = 0; offset < phrase.length; offset += 1) {
        map[phrase.at + offset] = phrase.a + offset;
    }
    mapTokenRange(before, after, b, phrase.at, a, phrase.a, map, depth + 1);
    mapTokenRange(
        before,
        after,
        phrase.at + phrase.length,
        bEnd,
        phrase.a + phrase.length,
        aEnd,
        map,
        depth + 1,
    );
}

function findPhrase(
    before: TokenIndex[],
    after: TokenIndex[],
    b0: number,
    b1: number,
    a0: number,
    a1: number,
): (PhraseHit & { a: number }) | null {
    const sizes = [6, 4, 3, 2].filter(
        (size) => size <= b1 - b0 && size <= a1 - a0,
    );
    for (const size of sizes) {
        const left = uniquePhrases(before, b0, b1, size);
        const right = uniquePhrases(after, a0, a1, size);
        let best: { at: number; a: number } | null = null;
        let bestScore = Infinity;
        const mid = (b0 + b1) / 2;
        for (const [key, at] of left) {
            const other = right.get(key);
            if (other === undefined) continue;
            const score = Math.abs(at - mid);
            if (score < bestScore) {
                bestScore = score;
                best = { at, a: other };
            }
        }
        if (best) return { ...best, length: size };
    }
    return null;
}

function uniquePhrases(
    tokens: TokenIndex[],
    start: number,
    end: number,
    size: number,
) {
    const found = new Map<string, number>();
    const repeated = new Set<string>();
    for (let index = start; index + size <= end; index += 1) {
        let key = tokens[index]?.norm ?? '';
        for (let offset = 1; offset < size; offset += 1) {
            key += `\0${tokens[index + offset]?.norm ?? ''}`;
        }
        if (repeated.has(key)) continue;
        if (found.has(key)) {
            found.delete(key);
            repeated.add(key);
            continue;
        }
        found.set(key, index);
    }
    return found;
}

function spokenIndexes<T extends { norm: string }>(
    spoken: SpokenToken[],
    aligned: AlignedToken<T>[],
): number[] {
    const indexes: number[] = [];
    let spokenIndex = 0;
    for (const word of aligned) {
        while (
            spokenIndex < spoken.length &&
            (spoken[spokenIndex]?.norm !== word.norm ||
                spoken[spokenIndex]?.start !== word.timeStart ||
                spoken[spokenIndex]?.end !== word.timeEnd)
        ) {
            spokenIndex += 1;
        }
        indexes.push(spokenIndex);
        if (spokenIndex < spoken.length) spokenIndex += 1;
    }
    return indexes;
}

// A fresh alignment searches the rest of the page for the longest run, so
// editing one phrase can stick the playhead to a later copy of those words.
// Keep the previous timing on words that are still printed, and align only
// the stretch that changed.
export function realignAfterEdit<T extends TokenIndex>(
    spoken: SpokenToken[],
    before: T[],
    after: T[],
    previous: AlignedToken<T>[],
): AlignedToken<T>[] {
    if (!previous.length || !before.length) {
        return alignSpokenWords(spoken, after);
    }
    const oldToNew = mapEditedTokens(before, after);
    const indexes = spokenIndexes(spoken, previous);
    const kept: { spokenIndex: number; articleIndex: number }[] = [];
    let lastSpoken = -1;
    let lastArticle = -1;
    for (let index = 0; index < previous.length; index += 1) {
        const word = previous[index];
        const spokenIndex = indexes[index];
        if (
            !word ||
            spokenIndex === undefined ||
            spokenIndex >= spoken.length
        ) {
            continue;
        }
        const articleIndex = word.index;
        if (articleIndex < 0 || articleIndex >= oldToNew.length) continue;
        const mapped = oldToNew[articleIndex];
        if (mapped === undefined || mapped < 0) continue;
        if (spokenIndex <= lastSpoken || mapped <= lastArticle) continue;
        if (after[mapped]?.norm !== word.norm) continue;
        kept.push({ spokenIndex, articleIndex: mapped });
        lastSpoken = spokenIndex;
        lastArticle = mapped;
    }
    if (!kept.length) return alignSpokenWords(spoken, after);

    const result: AlignedToken<T>[] = [];
    let prevSpoken = -1;
    let prevArticle = -1;
    const points = kept.concat({
        spokenIndex: spoken.length,
        articleIndex: after.length,
    });
    for (const point of points) {
        if (
            point.spokenIndex > prevSpoken + 1 &&
            point.articleIndex > prevArticle + 1
        ) {
            result.push(
                ...alignSpokenWords(
                    spoken.slice(prevSpoken + 1, point.spokenIndex),
                    after.slice(prevArticle + 1, point.articleIndex),
                ),
            );
        }
        if (point.spokenIndex >= spoken.length) break;
        prevSpoken = point.spokenIndex;
        prevArticle = point.articleIndex;
        const token = after[point.articleIndex];
        const speech = spoken[point.spokenIndex];
        if (!token || !speech) continue;
        result.push({
            ...token,
            index: point.articleIndex,
            timeStart: speech.start,
            timeEnd: speech.end,
        });
    }
    return result;
}
