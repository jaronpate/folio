export const BG_THEMES = [
    { id: 'dusk', label: 'Dusk' },
    { id: 'navy', label: 'Navy' },
    { id: 'midnight', label: 'Midnight' },
    { id: 'indigo', label: 'Indigo' },
    { id: 'storm', label: 'Storm' },
    { id: 'slate', label: 'Slate' },
    { id: 'ink', label: 'Ink' },
    { id: 'pine', label: 'Pine' },
    { id: 'wine', label: 'Wine' },
    { id: 'cocoa', label: 'Cocoa' },
    { id: 'paper', label: 'Paper' },
] as const;

export type BgThemeId = (typeof BG_THEMES)[number]['id'];

export const DEFAULT_BG_THEME: BgThemeId = 'dusk';
export const BG_THEME_STORAGE_KEY = 'bg-theme';

export function isBgThemeId(value: string | null): value is BgThemeId {
    return BG_THEMES.some((theme) => theme.id === value);
}
