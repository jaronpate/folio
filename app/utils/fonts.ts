export const BODY_FONTS = [
    { id: 'plantin', label: 'Plantin' },
    { id: 'alegreya', label: 'Alegreya' },
    { id: 'redaction', label: 'Redaction' },
    { id: 'redaction-35', label: 'Redaction 35' },
    { id: 'sohne', label: 'Sohne' },
    { id: 'space', label: 'Space Mono' },
    { id: 'georgia', label: 'Georgia' },
    { id: 'palatino', label: 'Palatino' },
    { id: 'iowan', label: 'Iowan' },
    { id: 'system', label: 'System Sans' },
    { id: 'courier', label: 'Courier' },
] as const;

export type BodyFontId = (typeof BODY_FONTS)[number]['id'];

export const DEFAULT_BODY_FONT: BodyFontId = 'plantin';
export const BODY_FONT_STORAGE_KEY = 'body-font';

export function isBodyFontId(value: string | null): value is BodyFontId {
    return BODY_FONTS.some((font) => font.id === value);
}
