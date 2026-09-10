export function projectEntryHref(page: {
    path: string;
    href?: string | null;
}) {
    return page.href || `/projects${page.path}`;
}

export function sortProjects<T extends { title: string; date?: string | null }>(
    pages: T[],
) {
    return [...pages].sort((a, b) => {
        if (!a.date && !b.date) return a.title.localeCompare(b.title);
        if (!a.date) return 1;
        if (!b.date) return -1;
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return a.title.localeCompare(b.title);
    });
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
