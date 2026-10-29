import { absoluteSiteUrl, DEFAULT_IMAGE } from '~/utils/site';

type PostImages = {
    banner?: string | null;
    logo?: string | null;
} | null;

/** Wide share image, then square logo, then the site default. */
export function postOgImage(
    page: PostImages,
    fallback: string = DEFAULT_IMAGE,
) {
    return (
        absoluteSiteUrl(page?.banner) ??
        absoluteSiteUrl(page?.logo) ??
        fallback
    );
}

/** Square artwork for Now Playing, then banner, then the site default. */
export function postArtwork(
    page: PostImages,
    fallback: string = DEFAULT_IMAGE,
) {
    return (
        absoluteSiteUrl(page?.logo) ??
        absoluteSiteUrl(page?.banner) ??
        fallback
    );
}

export function postTwitterCard(page: PostImages) {
    return page?.banner?.trim() ? 'summary_large_image' : 'summary';
}
