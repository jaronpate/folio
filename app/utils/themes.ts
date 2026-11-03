export const BG_THEMES = [
    { id: 'dusk', label: 'Dusk' },
    { id: 'paper', label: 'Paper' },
    { id: 'navy', label: 'Navy' },
    { id: 'midnight', label: 'Midnight' },
    { id: 'indigo', label: 'Indigo' },
    { id: 'slate', label: 'Slate' },
    { id: 'ink', label: 'Ink' },
    // Disabled for now, I don't like them as much
    // { id: 'storm', label: 'Storm' },
    // { id: 'pine', label: 'Pine' },
    // { id: 'wine', label: 'Wine' },
    // { id: 'cocoa', label: 'Cocoa' },
] as const;

export type BgThemeId = (typeof BG_THEMES)[number]['id'];

export const DEFAULT_BG_THEME: BgThemeId = 'dusk';
export const BG_THEME_STORAGE_KEY = 'bg-theme';
/** Set on `<html>` when a page forces a theme, so the boot script can paint it. */
export const FORCED_THEME_ATTR = 'data-forced-theme';

export function isBgThemeId(
    value: string | null | undefined,
): value is BgThemeId {
    return BG_THEMES.some((theme) => theme.id === value);
}

/** Paper is the only light theme. Every other theme is dark. */
export function colorModeForTheme(theme: BgThemeId): 'light' | 'dark' {
    switch (theme) {
        case 'paper':
            return 'light';
        case 'dusk':
        case 'navy':
        case 'midnight':
        case 'indigo':
        case 'slate':
        case 'ink':
            return 'dark';
        default: {
            const unhandled: never = theme;
            return unhandled;
        }
    }
}

/** A forced page theme wins. Otherwise the saved theme, then the default. */
export function resolveBgTheme(
    forced: string | null | undefined,
    saved: string | null | undefined,
): BgThemeId {
    if (isBgThemeId(forced)) return forced;
    if (isBgThemeId(saved)) return saved;
    return DEFAULT_BG_THEME;
}

/**
 * Blocking head script. Mirrors `resolveBgTheme` so the first paint matches
 * the theme Vue applies after hydration.
 */
export function bgThemeBootScript(font: {
    storageKey: string;
    fallback: string;
}): string {
    const ids = BG_THEMES.map((theme) => theme.id);
    const light = ids.filter((id) => colorModeForTheme(id) === 'light');
    const fallbackMode =
        colorModeForTheme(DEFAULT_BG_THEME) === 'light'
            ? 'light-mode'
            : 'dark-mode';

    return `(function(){try{var allowed=${JSON.stringify(Object.fromEntries(ids.map((id) => [id, 1])))};var light=${JSON.stringify(light)};var themes=${JSON.stringify(ids)};var root=document.documentElement;var forced=root.getAttribute(${JSON.stringify(FORCED_THEME_ATTR)});var saved=localStorage.getItem(${JSON.stringify(BG_THEME_STORAGE_KEY)});var t=(forced&&allowed[forced])?forced:((saved&&allowed[saved])?saved:${JSON.stringify(DEFAULT_BG_THEME)});var f=localStorage.getItem(${JSON.stringify(font.storageKey)})||${JSON.stringify(font.fallback)};var m=light.indexOf(t)!==-1?'light-mode':'dark-mode';root.classList.remove('light-mode','dark-mode');for(var i=0;i<themes.length;i++){root.classList.remove('theme-'+themes[i]);}root.classList.add('theme-'+t,'font-'+f,m,'is-loading');}catch(e){document.documentElement.classList.add(${JSON.stringify(`theme-${DEFAULT_BG_THEME}`)},${JSON.stringify(`font-${font.fallback}`)},${JSON.stringify(fallbackMode)},'is-loading');}setTimeout(function(){document.documentElement.classList.remove('is-loading')},4000);})();`;
}
