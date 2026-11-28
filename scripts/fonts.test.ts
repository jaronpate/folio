import { describe, expect, test } from 'bun:test';
import {
    applyForcedFont,
    BODY_FONTS,
    isBodyFontId,
} from '../app/utils/fonts.ts';

function rootWith(initial: string[]) {
    const classes = new Set(initial);
    return {
        classes,
        root: {
            classList: {
                add(...names: string[]) {
                    for (const name of names) classes.add(name);
                },
                remove(...names: string[]) {
                    for (const name of names) classes.delete(name);
                },
            },
        },
    };
}

describe('applyForcedFont', () => {
    test('adds the forced class and clears the others', () => {
        const { classes, root } = rootWith(['font-suisse', 'theme-dusk']);
        applyForcedFont(root, 'georgia');
        expect(classes.has('font-georgia')).toBe(true);
        expect(classes.has('font-suisse')).toBe(false);
        expect(classes.has('theme-dusk')).toBe(true);
        for (const font of BODY_FONTS) {
            expect(classes.has(`font-${font.id}`)).toBe(font.id === 'georgia');
        }
    });

    test('clears font classes when nothing is forced', () => {
        const { classes, root } = rootWith(['font-plantin', 'theme-slate']);
        applyForcedFont(root, null);
        expect([...classes].some((name) => name.startsWith('font-'))).toBe(
            false,
        );
        expect(classes.has('theme-slate')).toBe(true);
        applyForcedFont(root, 'nope');
        expect([...classes].some((name) => name.startsWith('font-'))).toBe(
            false,
        );
    });

    test('accepts only listed body fonts', () => {
        expect(isBodyFontId('plantin')).toBe(true);
        expect(isBodyFontId('redaction-10')).toBe(false);
        expect(isBodyFontId(null)).toBe(false);
    });
});
