const YMD = /^(\d{4})-(\d{2})-(\d{2})/;
const HAS_TZ = /(?:Z|[+-]\d{2}:?\d{2})$/i;

export function formatContentDate(value: string, month: 'short' | 'long' = 'short') {
    const match = YMD.exec(value);
    if (!match) return '';
    return new Date(Date.UTC(+match[1], +match[2] - 1, +match[3], 12)).toLocaleDateString(
        'en-US',
        { month, day: 'numeric', year: 'numeric', timeZone: 'UTC' },
    );
}

export function contentDateAttr(value: string) {
    if (HAS_TZ.test(value)) return new Date(value).toISOString();
    return YMD.exec(value)?.[0] ?? '';
}
