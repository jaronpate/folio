export const BODY_FONTS = [
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

export const DEFAULT_BODY_FONT: BodyFontId = 'plantin';
export const BODY_FONT_STORAGE_KEY = 'body-font';

export function isBodyFontId(value: string | null): value is BodyFontId {
    return BODY_FONTS.some((font) => font.id === value);
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
