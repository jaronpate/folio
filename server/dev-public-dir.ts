import { statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { defineEventHandler } from 'h3';

const publicRoot = join(process.cwd(), 'public');

// Dev serves `public/` with a directory redirect. A chronicle folder would
// steal its own page URL, so folder requests continue into the app instead.
export const keepPageRoutes = defineEventHandler((event) => {
    const req = event.node.req;
    const raw = req.url ?? '';
    const queryAt = raw.indexOf('?');
    const pathOnly = queryAt === -1 ? raw : raw.slice(0, queryAt);
    const search = queryAt === -1 ? '' : raw.slice(queryAt);
    if (
        !pathOnly.startsWith('/') ||
        pathOnly.endsWith('/') ||
        extname(pathOnly)
    ) {
        return;
    }

    const candidate = normalize(join(publicRoot, pathOnly));
    if (
        candidate !== publicRoot &&
        !candidate.startsWith(publicRoot + sep)
    ) {
        return;
    }

    try {
        if (!statSync(candidate).isDirectory()) return;
    } catch {
        return;
    }

    req.url = `${pathOnly}/${search}`;
});
