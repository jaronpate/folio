import blendSrc from '~/assets/images/blend.jpeg';

const MAX_WAIT_MS = 2500;

function sleep(ms: number) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
}

function loadSrc(src: string) {
    return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
    });
}

function settleImage(img: HTMLImageElement) {
    if (img.complete) {
        return img.decode?.().catch(() => undefined) ?? Promise.resolve();
    }
    return new Promise<void>((resolve) => {
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => resolve(), { once: true });
    });
}

async function whenReady() {
    const tasks: Promise<unknown>[] = [loadSrc(blendSrc)];
    if (document.fonts?.ready) tasks.push(document.fonts.ready);
    for (const img of document.images) {
        tasks.push(settleImage(img));
    }
    await Promise.race([Promise.all(tasks), sleep(MAX_WAIT_MS)]);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('app:mounted', async () => {
        await whenReady();
        document.documentElement.classList.remove('is-loading');
    });
});
