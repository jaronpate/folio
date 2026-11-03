import { describe, expect, test } from 'bun:test';
import {
    BODY_FONT_STORAGE_KEY,
    DEFAULT_BODY_FONT,
} from '../app/utils/fonts.ts';
import {
    BG_THEME_STORAGE_KEY,
    BG_THEMES,
    DEFAULT_BG_THEME,
    FORCED_THEME_ATTR,
    bgThemeBootScript,
    colorModeForTheme,
    resolveBgTheme,
    type BgThemeId,
} from '../app/utils/themes.ts';

const script = bgThemeBootScript({
    storageKey: BODY_FONT_STORAGE_KEY,
    fallback: DEFAULT_BODY_FONT,
});

function runBootScript(options: {
    forced?: string | null;
    saved?: string | null;
    font?: string | null;
    initialClasses?: string[];
}) {
    const classes = new Set(options.initialClasses ?? []);
    const storage = new Map<string, string>();
    if (options.saved != null) {
        storage.set(BG_THEME_STORAGE_KEY, options.saved);
    }
    if (options.font != null) {
        storage.set(BODY_FONT_STORAGE_KEY, options.font);
    }
    let wroteStorage = false;
    const document = {
        documentElement: {
            getAttribute(name: string) {
                if (name !== FORCED_THEME_ATTR) return null;
                return options.forced ?? null;
            },
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
    const localStorage = {
        getItem(key: string) {
            return storage.get(key) ?? null;
        },
        setItem() {
            wroteStorage = true;
        },
    };
    const runner = new Function(
        'document',
        'localStorage',
        'setTimeout',
        script,
    );
    runner(document, localStorage, () => 0);
    return { classes, wroteStorage };
}

describe('resolveBgTheme', () => {
    test('prefers a forced theme over the saved one', () => {
        expect(resolveBgTheme('paper', 'navy')).toBe('paper');
    });

    test('uses the saved theme when nothing is forced', () => {
        expect(resolveBgTheme(null, 'ink')).toBe('ink');
        expect(resolveBgTheme(undefined, 'slate')).toBe('slate');
    });

    test('ignores unknown ids', () => {
        expect(resolveBgTheme('storm', 'midnight')).toBe('midnight');
        expect(resolveBgTheme('nope', 'also-nope')).toBe(DEFAULT_BG_THEME);
    });
});

describe('colorModeForTheme', () => {
    test('paper is light and every other theme is dark', () => {
        for (const theme of BG_THEMES) {
            expect(colorModeForTheme(theme.id)).toBe(
                theme.id === 'paper' ? 'light' : 'dark',
            );
        }
    });
});

describe('bgThemeBootScript', () => {
    const forcedValues = [null, '', 'paper', 'navy', 'storm'] as const;
    const savedValues = [null, '', 'dusk', 'ink', 'nope'] as const;

    test('matches resolveBgTheme and does not write storage', () => {
        for (const forced of forcedValues) {
            for (const saved of savedValues) {
                const expected = resolveBgTheme(forced, saved);
                const { classes, wroteStorage } = runBootScript({
                    forced,
                    saved,
                    initialClasses: [
                        'theme-navy',
                        'light-mode',
                        'dark-mode',
                        'is-loading',
                    ],
                });
                expect(wroteStorage).toBe(false);
                expect(classes.has(`theme-${expected}`)).toBe(true);
                expect(
                    classes.has(
                        colorModeForTheme(expected) === 'light'
                            ? 'light-mode'
                            : 'dark-mode',
                    ),
                ).toBe(true);
                expect(
                    classes.has(
                        colorModeForTheme(expected) === 'light'
                            ? 'dark-mode'
                            : 'light-mode',
                    ),
                ).toBe(false);
                for (const theme of BG_THEMES) {
                    if (theme.id === expected) continue;
                    expect(classes.has(`theme-${theme.id}`)).toBe(false);
                }
            }
        }
    });

    test('keeps the saved font', () => {
        const { classes } = runBootScript({
            saved: 'dusk' satisfies BgThemeId,
            font: 'sohne',
        });
        expect(classes.has('font-sohne')).toBe(true);
    });
});
