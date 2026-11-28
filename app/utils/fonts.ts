export const BODY_FONTS = [
    { id: 'suisse', label: 'Suisse Intl' },
    { id: 'plantin', label: 'Plantin' },
    { id: 'palatino', label: 'Palatino' },
    { id: 'redaction', label: 'Redaction' },
    // These are to be used by components or other styles
    // { id: 'redaction-10', label: 'Redaction 10' },
    // { id: 'redaction-20', label: 'Redaction 20' },
    // { id: 'redaction-35', label: 'Redaction 35' },
    // { id: 'redaction-50', label: 'Redaction 50' },
    // { id: 'redaction-70', label: 'Redaction 70' },
    // { id: 'redaction-100', label: 'Redaction 100' },
    { id: 'sohne', label: 'Sohne' },
    { id: 'georgia', label: 'Georgia' },
    { id: 'system', label: 'System Sans' },
    { id: 'space', label: 'Space Mono' },
] as const;

export type BodyFontId = (typeof BODY_FONTS)[number]['id'];

/** Set on `<html>` when a page forces a font, so the boot script can paint it. */
export const FORCED_FONT_ATTR = 'data-forced-font';

export function isBodyFontId(
    value: string | null | undefined,
): value is BodyFontId {
    return BODY_FONTS.some((font) => font.id === value);
}

type FontClassList = {
    add: (...names: string[]) => void;
    remove: (...names: string[]) => void;
};

/** Add a forced font class, or clear them so `:root` is the page font. */
export function applyForcedFont(
    root: { classList: FontClassList },
    next: string | null | undefined,
): void {
    for (const font of BODY_FONTS) {
        root.classList.remove(`font-${font.id}`);
    }
    if (isBodyFontId(next)) {
        root.classList.add(`font-${next}`);
    }
}

/**
 * Runs inside the theme boot script. A known forced font adds `font-*`.
 * Otherwise every body font class is removed and `:root` stays in charge.
 */
export function forcedFontBootScript(): string {
    const ids = BODY_FONTS.map((font) => font.id);
    const allowed = Object.fromEntries(ids.map((id) => [id, 1]));
    return `try{var fontIds=${JSON.stringify(ids)};var fontAllowed=${JSON.stringify(allowed)};var fontRoot=document.documentElement;var fontForced=fontRoot.getAttribute(${JSON.stringify(FORCED_FONT_ATTR)});for(var fi=0;fi<fontIds.length;fi++){fontRoot.classList.remove("font-"+fontIds[fi]);}if(fontForced&&fontAllowed[fontForced]){fontRoot.classList.add("font-"+fontForced);}}catch(e){}`;
}

export const REDACTION_STRENGTHS = [0, 10, 20, 35, 50, 70, 100] as const;

export type RedactionStrength = (typeof REDACTION_STRENGTHS)[number];

export function redactionFamily(strength: RedactionStrength): string {
    return strength === 0 ? 'Redaction' : `Redaction ${strength}`;
}

export function resolveRedactionStrength(value: unknown): RedactionStrength {
    const n = Number(value);
    if (REDACTION_STRENGTHS.includes(n as RedactionStrength)) {
        return n as RedactionStrength;
    }
    if (!Number.isFinite(n)) return 35;
    return REDACTION_STRENGTHS.reduce((best, grade) =>
        Math.abs(grade - n) < Math.abs(best - n) ? grade : best,
    );
}
