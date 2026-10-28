import { SITE_URL } from '~/utils/site';

function absoluteAudioUrl(src: string) {
    const raw = src.trim();
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('/')) return `${SITE_URL}${raw}`;
    return `${SITE_URL}/${raw}`;
}

function audioContentType(src: string) {
    const ext = src.split(/[?#]/)[0]?.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'mp3':
        case 'mpeg':
            return 'audio/mpeg';
        case 'ogg':
        case 'oga':
            return 'audio/ogg';
        case 'wav':
            return 'audio/wav';
        case 'm4a':
        case 'mp4':
            return 'audio/mp4';
        case 'aac':
            return 'audio/aac';
        default:
            return undefined;
    }
}

export function openGraphAudioMeta(src: string | null | undefined) {
    const raw = src?.trim();
    if (!raw) return [];
    const url = absoluteAudioUrl(raw);
    const meta = [{ key: 'og:audio', property: 'og:audio', content: url }];

    if (url.startsWith('https://')) {
        meta.push({
            key: 'og:audio:secure_url',
            property: 'og:audio:secure_url',
            content: url,
        });
    }

    const type = audioContentType(raw);
    if (type) {
        meta.push({
            key: 'og:audio:type',
            property: 'og:audio:type',
            content: type,
        });
    }

    return meta;
}
