import { tokensIn, type SpokenToken } from './spokenAlign';

export type VttCue = {
    start: number;
    end: number;
    text: string;
};

const TIMESTAMP = /^(?:(\d{2,}):)?(\d{2}):(\d{2})[.,](\d{1,3})$/;
const TIMING = /^(\S+)\s+-->\s+(\S+)/;
const INNER_TIMESTAMP = /<((?:\d{2,}:)?\d{2}:\d{2}[.,]\d{1,3})>/g;

export function parseTimestamp(value: string): number | null {
    const match = TIMESTAMP.exec(value.trim());
    if (!match) return null;
    const hours = match[1] ? Number(match[1]) : 0;
    const minutes = Number(match[2]);
    const seconds = Number(match[3]);
    const fraction = (match[4] ?? '').padEnd(3, '0');
    if (minutes > 59 || seconds > 59) return null;
    return hours * 3600 + minutes * 60 + seconds + Number(fraction) / 1000;
}

function decodeEntities(value: string) {
    return value
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&apos;/gi, "'")
        .replace(/&#(\d+);/g, (entity, digits: string) => {
            const code = Number(digits);
            return code > 0 && code < 0x110000
                ? String.fromCodePoint(code)
                : entity;
        });
}

type Piece = {
    start: number;
    end: number;
    text: string;
};

function piecesOf(cue: VttCue): Piece[] {
    INNER_TIMESTAMP.lastIndex = 0;
    const marks: { index: number; time: number; length: number }[] = [];
    for (const match of cue.text.matchAll(INNER_TIMESTAMP)) {
        const time = parseTimestamp(match[1] ?? '');
        if (time === null || match.index === undefined) continue;
        marks.push({
            index: match.index,
            time,
            length: match[0].length,
        });
    }
    if (!marks.length) {
        return [{ start: cue.start, end: cue.end, text: cue.text }];
    }

    const pieces: Piece[] = [];
    let cursor = 0;
    let start = cue.start;
    for (const mark of marks) {
        const text = cue.text.slice(cursor, mark.index);
        const end = Math.min(cue.end, Math.max(start, mark.time));
        if (text.trim() && end > start) pieces.push({ start, end, text });
        start = Math.min(cue.end, Math.max(start, mark.time));
        cursor = mark.index + mark.length;
    }
    const tail = cue.text.slice(cursor);
    if (tail.trim() && cue.end > start) {
        pieces.push({ start, end: cue.end, text: tail });
    }
    return pieces;
}

function plainText(value: string) {
    return decodeEntities(value.replace(/<[^>]*>/g, ' '));
}

export function parseVtt(source: string): VttCue[] {
    const lines = source
        .replace(/^\uFEFF/, '')
        .replace(/\r\n?/g, '\n')
        .split('\n');

    let index = 0;
    if (lines[0]?.startsWith('WEBVTT')) {
        index = 1;
        while (index < lines.length && lines[index]?.trim() !== '') index += 1;
    }

    const cues: VttCue[] = [];
    while (index < lines.length) {
        while (index < lines.length && lines[index]?.trim() === '') index += 1;
        if (index >= lines.length) break;

        const block: string[] = [];
        while (index < lines.length && lines[index]?.trim() !== '') {
            block.push(lines[index] ?? '');
            index += 1;
        }

        const head = block[0]?.trim() ?? '';
        if (
            head.startsWith('NOTE') ||
            head.startsWith('STYLE') ||
            head.startsWith('REGION')
        ) {
            continue;
        }

        let timingAt = 0;
        if (!TIMING.test(head) && block[1] && TIMING.test(block[1].trim())) {
            timingAt = 1;
        }

        const timing = TIMING.exec(block[timingAt]?.trim() ?? '');
        if (!timing) continue;
        const start = parseTimestamp(timing[1] ?? '');
        const end = parseTimestamp(timing[2] ?? '');
        if (start === null || end === null || end <= start) continue;

        cues.push({
            start,
            end,
            text: block.slice(timingAt + 1).join('\n'),
        });
    }

    return cues;
}

type TranscriptWord = {
    text?: unknown;
    start_time?: unknown;
    end_time?: unknown;
    start?: unknown;
    end?: unknown;
};

function finiteNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function transcriptWords(data: unknown): TranscriptWord[] {
    if (!data || typeof data !== 'object') return [];
    const record = data as { segments?: unknown; words?: unknown };
    if (Array.isArray(record.segments)) {
        const words: TranscriptWord[] = [];
        for (const segment of record.segments) {
            if (!segment || typeof segment !== 'object') continue;
            const segmentWords = (segment as { words?: unknown }).words;
            if (!Array.isArray(segmentWords)) continue;
            words.push(...segmentWords);
        }
        return words;
    }
    return Array.isArray(record.words) ? record.words : [];
}

export function spokenTokensFromTranscript(source: string): SpokenToken[] {
    let data: unknown;
    try {
        data = JSON.parse(source);
    } catch {
        return [];
    }

    const tokens: SpokenToken[] = [];
    for (const word of transcriptWords(data)) {
        if (!word || typeof word !== 'object') continue;
        const text = typeof word.text === 'string' ? word.text : '';
        if (!text.trim()) continue;
        const start = finiteNumber(word.start_time) ?? finiteNumber(word.start);
        const end = finiteNumber(word.end_time) ?? finiteNumber(word.end);
        if (start === null || end === null || end <= start) continue;
        for (const token of tokensIn(text)) {
            tokens.push({ norm: token.norm, start, end });
        }
    }
    return tokens;
}

export function spokenTokensFromTrack(source: string): SpokenToken[] {
    const trimmed = source.trimStart();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return spokenTokensFromTranscript(source);
    }
    return spokenTokens(parseVtt(source));
}

export function spokenTokens(cues: VttCue[]): SpokenToken[] {
    const tokens: SpokenToken[] = [];
    for (const cue of cues) {
        for (const piece of piecesOf(cue)) {
            for (const token of tokensIn(plainText(piece.text))) {
                tokens.push({
                    norm: token.norm,
                    start: piece.start,
                    end: piece.end,
                });
            }
        }
    }
    return tokens;
}
