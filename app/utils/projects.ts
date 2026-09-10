export function projectEntryHref(page: {
    path: string;
    href?: string | null;
}) {
    return page.href || `/projects${page.path}`;
}

export function sortProjects<
    T extends { title: string; date?: Date | string | null },
>(pages: T[]) {
    return [...pages].sort((a, b) => {
        const aTime = a.date ? new Date(a.date).getTime() : Number.NaN;
        const bTime = b.date ? new Date(b.date).getTime() : Number.NaN;
        const aHasDate = !Number.isNaN(aTime);
        const bHasDate = !Number.isNaN(bTime);
        if (aHasDate && bHasDate && aTime !== bTime) return bTime - aTime;
        if (aHasDate !== bHasDate) return aHasDate ? -1 : 1;
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
