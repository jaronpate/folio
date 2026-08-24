export function projectEntryHref(page: {
    path: string;
    href?: string | null;
}) {
    return page.href || `/projects${page.path}`;
}

export function isExternalHref(href: string) {
    return /^https?:\/\//i.test(href);
}

export function projectOgImage(
    src: string | undefined,
    siteUrl: string,
    fallback: string,
) {
    if (!src) return fallback;
    if (/^https?:\/\//i.test(src)) return src;
    return `${siteUrl}${src.startsWith('/') ? src : `/${src}`}`;
}
