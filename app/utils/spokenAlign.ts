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

function bestRun<T extends { norm: string }>(
    spoken: SpokenToken[],
    spokenIndex: number,
    article: T[],
    cursor: number,
): { length: number; at: number } {
    let bestLength = 0;
    let bestAt = -1;
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
        if (length > bestLength) {
            bestLength = length;
            bestAt = start;
            if (length === remaining) break;
        }
    }

    return { length: bestLength, at: bestAt };
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
