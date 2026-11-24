import { describe, expect, test } from 'bun:test';
import {
    alignSpokenWords,
    realignAfterEdit,
    tokensIn,
} from '../app/utils/spokenAlign.ts';
import {
    parseVtt,
    spokenTokens,
    spokenTokensFromTrack,
    spokenTokensFromTranscript,
} from '../app/utils/vtt.ts';

function align(spoken: string, article: string) {
    const cues = spoken
        .split(/\s+/)
        .filter(Boolean)
        .map((word, index) => ({
            start: index,
            end: index + 1,
            text: word,
        }));
    return alignSpokenWords(spokenTokens(cues), tokensIn(article)).map(
        (token) => token.norm,
    );
}

describe('parseVtt', () => {
    test('reads cues, identifiers, notes, and settings', () => {
        const cues = parseVtt(`WEBVTT
Kind: captions

NOTE
ignore me

1
00:00:01.000 --> 00:00:02.500 align:start
<v Speaker>Hello</v>

00:01:02,250 --> 00:01:03.000
rock &amp; roll
`);
        expect(cues).toHaveLength(2);
        expect(cues[0]).toMatchObject({ start: 1, end: 2.5 });
        expect(
            spokenTokens(cues.slice(0, 1)).map((token) => token.norm),
        ).toEqual(['hello']);
        expect(spokenTokens(cues.slice(1)).map((token) => token.norm)).toEqual([
            'rock',
            'and',
            'roll',
        ]);
        expect(cues[1]?.start).toBeCloseTo(62.25);
    });

    test('splits a cue on inner timestamps', () => {
        const tokens = spokenTokens(
            parseVtt(`WEBVTT

00:00:00.000 --> 00:00:02.000
Hello <00:00:01.000>world
`),
        );
        expect(tokens).toEqual([
            { norm: 'hello', start: 0, end: 1 },
            { norm: 'world', start: 1, end: 2 },
        ]);
    });

    test('keeps every word in one cue on the cue clock', () => {
        const tokens = spokenTokens(
            parseVtt(`WEBVTT

00:00:01.000 --> 00:00:03.000
hello world
`),
        );
        expect(tokens).toEqual([
            { norm: 'hello', start: 1, end: 3 },
            { norm: 'world', start: 1, end: 3 },
        ]);
    });
});

describe('spokenTokensFromTranscript', () => {
    test('reads word timings and skips spaces', () => {
        const tokens = spokenTokensFromTranscript(
            JSON.stringify({
                language_code: 'eng',
                segments: [
                    {
                        text: 'The Ring,',
                        words: [
                            { text: 'The', start_time: 0.16, end_time: 0.24 },
                            { text: ' ', start_time: 0.24, end_time: 0.32 },
                            { text: 'Ring,', start_time: 0.32, end_time: 0.64 },
                        ],
                    },
                ],
            }),
        );
        expect(tokens).toEqual([
            { norm: 'the', start: 0.16, end: 0.24 },
            { norm: 'ring', start: 0.32, end: 0.64 },
        ]);
    });

    test('detects json and vtt from the file body', () => {
        expect(
            spokenTokensFromTrack(`WEBVTT

00:00:00.000 --> 00:00:01.000
Hello
`).map((token) => token.norm),
        ).toEqual(['hello']);
        expect(
            spokenTokensFromTrack(
                JSON.stringify({
                    words: [{ text: 'Hello', start: 1, end: 2 }],
                }),
            ),
        ).toEqual([{ norm: 'hello', start: 1, end: 2 }]);
    });
});

describe('alignSpokenWords', () => {
    test('reads straight through when the words agree', () => {
        expect(align('the cat sat', 'The cat sat.')).toEqual([
            'the',
            'cat',
            'sat',
        ]);
    });

    test('skips a word the recording never says and continues', () => {
        const article = tokensIn(
            'The highlight follows these words, skips markup, and keeps going while the tone plays. This extra clause stays put.',
        );
        const spoken = spokenTokens(
            parseVtt(`WEBVTT

00:00:00.000 --> 00:00:01.000
The highlight follows these words skips and keeps going while the tone plays
`),
        );
        const aligned = alignSpokenWords(spoken, article);
        expect(aligned.map((token) => token.norm)).toEqual([
            'the',
            'highlight',
            'follows',
            'these',
            'words',
            'skips',
            'and',
            'keeps',
            'going',
            'while',
            'the',
            'tone',
            'plays',
        ]);
        const skips = article.findIndex((token) => token.norm === 'skips');
        const markup = article.findIndex((token) => token.norm === 'markup');
        const and = aligned.find((token) => token.norm === 'and');
        expect(markup).toBeGreaterThan(skips);
        expect(and?.start).toBeGreaterThan(article[markup]?.start ?? 0);
    });

    test('prefers a later phrase when an earlier one only shares a prefix', () => {
        const article = tokensIn('the dog sat and the cat sat');
        const spoken = spokenTokens(
            parseVtt(`WEBVTT

00:00:00.000 --> 00:00:01.000
the cat sat
`),
        );
        const aligned = alignSpokenWords(spoken, article);
        expect(aligned.map((token) => token.start)).toEqual([16, 20, 24]);
    });

    test('drops a spoken word that never appears', () => {
        expect(align('hello missing world', 'Hello, world.')).toEqual([
            'hello',
            'world',
        ]);
    });

    test('folds ordinals and drops a date word the page does not print', () => {
        expect(
            align('October 25th to 30th There', 'October 25–30. There'),
        ).toEqual(['october', '25', '30', 'there']);
    });

    test('folds case, apostrophes, and ampersands', () => {
        expect(align("Don't stop", "don't stop")).toEqual(['dont', 'stop']);
        expect(align('rock and roll', 'rock & roll')).toEqual([
            'rock',
            'and',
            'roll',
        ]);
    });

    test('jumps to a later copy when the first is interrupted and repeated', () => {
        const article = tokensIn('alpha beta xxx alpha beta gamma delta');
        const spoken = spokenTokens(
            parseVtt(`WEBVTT

00:00:00.000 --> 00:00:01.000
alpha beta gamma delta
`),
        );
        const aligned = alignSpokenWords(spoken, article);
        expect(aligned.map((token) => token.norm)).toEqual([
            'alpha',
            'beta',
            'gamma',
            'delta',
        ]);
        expect(aligned[0]?.start).toBeGreaterThan(0);
    });

    test('does not chase a short repeated phrase to the end of the page', () => {
        const article = tokensIn(
            `a modest hunt for wolf pups. ${'filler '.repeat(80)} of the adventurers of fornost`,
        );
        const spoken = spokenTokens(
            parseVtt(`WEBVTT

00:00:00.000 --> 00:00:01.000
a chronicle of the adventurers of fornost there
`),
        );
        const aligned = alignSpokenWords(spoken, article);
        const adventurers = aligned.find(
            (token) => token.norm === 'adventurers',
        );
        expect(adventurers).toBeUndefined();
        expect(aligned[0]?.norm).toBe('a');
        expect(aligned[0]?.start).toBe(0);
    });
});

function located(text: string) {
    return tokensIn(text).map((token, index) => ({ ...token, index }));
}

function spokenFrom(text: string) {
    return tokensIn(text).map((token, index) => ({
        norm: token.norm,
        start: index / 10,
        end: (index + 1) / 10,
    }));
}

describe('realignAfterEdit', () => {
    test('keeps the playhead off a later copy when an earlier phrase changes', () => {
        const beforeText =
            'the cat sat on the mat and then the cat sat on the mat again later';
        const afterText =
            'the dog sat on the mat and then the cat sat on the mat again later';
        const spoken = spokenFrom(beforeText);
        const before = located(beforeText);
        const after = located(afterText);
        const first = alignSpokenWords(spoken, before);
        const fresh = alignSpokenWords(spoken, after);
        const kept = realignAfterEdit(spoken, before, after, first);

        expect(fresh[0]?.index).toBeGreaterThan(0);
        expect(kept[0]?.index).toBe(0);
        const firstAgain = first.find((token) => token.norm === 'again');
        const keptAgain = kept.find((token) => token.norm === 'again');
        expect(keptAgain?.index).toBe(firstAgain?.index);
        expect(keptAgain?.timeStart).toBe(firstAgain?.timeStart);
        expect(kept.filter((token) => token.norm === 'cat')).toEqual([
            expect.objectContaining({
                index: 9,
                timeStart: first.filter((token) => token.norm === 'cat')[1]
                    ?.timeStart,
            }),
        ]);
    });

    test('keeps the middle when two separate spots change', () => {
        const beforeText = 'alpha beta one two three four gamma delta';
        const afterText = 'alpha zebra one two three four gamma yak';
        const spoken = spokenFrom(beforeText);
        const before = located(beforeText);
        const after = located(afterText);
        const first = alignSpokenWords(spoken, before);
        const kept = realignAfterEdit(spoken, before, after, first);
        const three = kept.find((token) => token.norm === 'three');
        expect(three?.index).toBe(4);
        expect(three?.timeStart).toBe(
            first.find((token) => token.norm === 'three')?.timeStart,
        );
        expect(kept.some((token) => token.norm === 'zebra')).toBe(false);
        expect(kept.some((token) => token.norm === 'yak')).toBe(false);
    });

    test('shifts the tail when words are inserted ahead of it', () => {
        const beforeText = 'one two three four';
        const afterText = 'one two inserted extra three four';
        const spoken = spokenFrom(beforeText);
        const before = located(beforeText);
        const after = located(afterText);
        const first = alignSpokenWords(spoken, before);
        const kept = realignAfterEdit(spoken, before, after, first);
        expect(kept.find((token) => token.norm === 'three')).toMatchObject({
            index: 4,
            timeStart: first.find((token) => token.norm === 'three')?.timeStart,
        });
        expect(kept.find((token) => token.norm === 'four')?.index).toBe(5);
    });
});
