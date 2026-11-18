import { describe, expect, test } from 'bun:test';
import {
    SCROLL_BOTTOM,
    SCROLL_TOP,
    spokenInView,
    spokenScrollBehavior,
    spokenScrollDelta,
    spokenScrollLockMs,
} from '../app/utils/spokenScroll.ts';

const viewport = 844;

describe('spokenInView', () => {
    test('rejects empty ranges', () => {
        expect(
            spokenInView(
                { top: 200, bottom: 200, width: 0, height: 0 },
                viewport,
            ),
        ).toBe(false);
    });

    test('allows a word just inside the bottom margin', () => {
        const bottom = viewport - SCROLL_BOTTOM;
        expect(
            spokenInView(
                { top: bottom - 20, bottom, width: 40, height: 20 },
                viewport,
            ),
        ).toBe(true);
    });

    test('rejects a word past the bottom margin', () => {
        const bottom = viewport - SCROLL_BOTTOM + 8;
        expect(
            spokenInView(
                { top: bottom - 20, bottom, width: 40, height: 20 },
                viewport,
            ),
        ).toBe(false);
    });
});

describe('spokenScrollDelta', () => {
    test('returns 0 when the word is already in view', () => {
        expect(
            spokenScrollDelta(
                { top: 200, bottom: 220, width: 40, height: 20 },
                viewport,
            ),
        ).toBe(0);
    });

    test('scrolls down far enough to clear a tall mid-paragraph figure', () => {
        // Word after an in-flow margin figure sits well below the viewport.
        const delta = spokenScrollDelta(
            { top: 1164, bottom: 1184, width: 40, height: 20 },
            viewport,
        );
        expect(delta).toBeGreaterThan(300);
        const after = {
            top: 1164 - delta,
            bottom: 1184 - delta,
            width: 40,
            height: 20,
        };
        expect(spokenInView(after, viewport)).toBe(true);
        expect(after.top).toBeGreaterThanOrEqual(SCROLL_TOP);
        expect(after.bottom).toBeLessThanOrEqual(viewport - SCROLL_BOTTOM);
    });

    test('scrolls up when the word sits under the sticky player band', () => {
        const delta = spokenScrollDelta(
            { top: 80, bottom: 100, width: 40, height: 20 },
            viewport,
        );
        expect(delta).toBeLessThan(0);
        const after = {
            top: 80 - delta,
            bottom: 100 - delta,
            width: 40,
            height: 20,
        };
        expect(spokenInView(after, viewport)).toBe(true);
    });
});

describe('spokenScrollBehavior / lock', () => {
    test('uses an instant jump across a figure-sized gap', () => {
        expect(spokenScrollBehavior(700, false)).toBe('auto');
        expect(spokenScrollLockMs(700, false)).toBe(700);
    });

    test('keeps a short smooth scroll for nearby words', () => {
        expect(spokenScrollBehavior(80, false)).toBe('smooth');
        expect(spokenScrollLockMs(80, true)).toBeGreaterThanOrEqual(700);
    });

    test('holds the lock long enough for a long smooth scroll', () => {
        // A 600px smooth jump used to unlock at 700ms and drop follow while
        // the page was still moving past the figure.
        const lock = spokenScrollLockMs(600, true);
        expect(lock).toBeGreaterThan(700);
        expect(lock).toBeLessThanOrEqual(2500);
    });

    test('respects reduced motion', () => {
        expect(spokenScrollBehavior(80, true)).toBe('auto');
    });
});
