export const BANNER_ALIGNS = ['top', 'center', 'bottom'] as const;

export type BannerAlign = (typeof BANNER_ALIGNS)[number];

export const DEFAULT_BANNER_ALIGN: BannerAlign = 'center';

export function isBannerAlign(
    value: string | null | undefined,
): value is BannerAlign {
    return BANNER_ALIGNS.some((align) => align === value);
}

export function bannerAlignOf(
    value: string | null | undefined,
): BannerAlign {
    return isBannerAlign(value) ? value : DEFAULT_BANNER_ALIGN;
}
