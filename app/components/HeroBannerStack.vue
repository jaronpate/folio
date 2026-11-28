<script setup lang="ts">
import { bannerAlignOf, type HeroBannerSlide } from '~/utils/banner';

const props = defineProps<{
    banners: HeroBannerSlide[];
    /** Slide to show. Empty means the first slide, the newest story. */
    activeId?: string | null;
}>();

const FADE_MS = 600;

const live = ref(false);
const loaded = ref<Record<string, true>>({});
const queued = ref<Record<string, true>>({});
/** Opaque slide underneath a fade. The page never shows through it. */
const settledId = ref<string | null>(null);

const defaultId = computed(() => props.banners[0]?.id ?? null);

const imageEls = new Map<string, HTMLImageElement>();

/** Slide on screen, including one whose fade has not finished. */
let targetId: string | null = null;
let generation = 0;
let zCounter = 1;
let safetyTimer = 0;
let idleId = 0;
let preloadTimer = 0;
let preloadCancelled = false;

function queue(id: string | null | undefined) {
    if (!id || queued.value[id]) return;
    queued.value = { ...queued.value, [id]: true };
}

function reduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function opacityOf(el: HTMLImageElement) {
    const value = Number.parseFloat(window.getComputedStyle(el).opacity);
    return Number.isFinite(value) ? value : 0;
}

/** Lock the painted opacity. Cancelling a fade must not snap it to 0 or 1. */
function stop(el: HTMLImageElement, opacity: number) {
    el.style.opacity = String(opacity);
    for (const animation of el.getAnimations()) animation.cancel();
    el.style.opacity = String(opacity);
}

function hide(el: HTMLImageElement) {
    stop(el, 0);
    el.style.zIndex = '0';
}

function playTo(
    el: HTMLImageElement,
    to: number,
    from: number,
    gen: number,
): Promise<void> {
    stop(el, from);
    if (reduceMotion() || Math.abs(from - to) < 0.015) {
        el.style.opacity = String(to);
        return Promise.resolve();
    }

    const animation = el.animate([{ opacity: from }, { opacity: to }], {
        duration: FADE_MS,
        easing: 'ease',
        fill: 'forwards',
    });

    return animation.finished.then(
        () => {
            if (gen !== generation) return;
            stop(el, to);
        },
        () => {},
    );
}

function finish(id: string, gen: number) {
    if (gen !== generation) return;
    const el = imageEls.get(id);
    if (!el) return;
    window.clearTimeout(safetyTimer);
    zCounter = 1;
    stop(el, 1);
    el.style.zIndex = '1';
    for (const [imgId, other] of imageEls) {
        if (imgId !== id) hide(other);
    }
    settledId.value = id;
}

function scheduleFinish(id: string, gen: number, pending: Promise<void>) {
    window.clearTimeout(safetyTimer);
    const done = () => finish(id, gen);
    void pending.then(done);
    safetyTimer = window.setTimeout(done, FADE_MS + 120);
}

function show(id: string) {
    if (!import.meta.client || !live.value) {
        settledId.value = id;
        targetId = id;
        return;
    }
    if (targetId === id) return;

    const incoming = imageEls.get(id);
    if (!incoming) return;

    const gen = ++generation;
    targetId = id;
    window.clearTimeout(safetyTimer);

    // Read every opacity before writing. A fast hover used to cancel the
    // in-flight fade and snap that image to fully opaque, so the next
    // slide — already the solid underlay — had nothing to animate.
    const snapshot = new Map<string, number>();
    for (const [imgId, el] of imageEls) snapshot.set(imgId, opacityOf(el));
    const incomingOpacity = snapshot.get(id) ?? 0;

    const overlays: { el: HTMLImageElement; opacity: number }[] = [];
    for (const [imgId, el] of imageEls) {
        if (imgId === id) continue;
        const opacity = snapshot.get(imgId) ?? 0;
        if (opacity < 0.02) {
            hide(el);
            continue;
        }
        const held = opacity >= 0.995 ? 1 : opacity;
        stop(el, held);
        overlays.push({ el, opacity: held });
    }

    if (overlays.length === 0) {
        stop(incoming, 1);
        incoming.style.zIndex = '1';
        settledId.value = id;
        return;
    }

    // The requested slide is already the solid image under the fade.
    // Dissolve what's on top of it instead of fading it in from black.
    if (incomingOpacity >= 0.995) {
        stop(incoming, 1);
        incoming.style.zIndex = '1';
        const fades = overlays.map((overlay) => {
            overlay.el.style.zIndex = String(++zCounter);
            return playTo(overlay.el, 0, overlay.opacity, gen);
        });
        scheduleFinish(
            id,
            gen,
            Promise.all(fades).then(() => {}),
        );
        return;
    }

    incoming.style.zIndex = String(++zCounter);
    const from = incomingOpacity < 0.02 ? 0 : incomingOpacity;
    scheduleFinish(id, gen, playTo(incoming, 1, from, gen));
}

function revealIfReady() {
    const fallback = defaultId.value;
    if (!fallback) return;
    const active = props.activeId || fallback;
    if (active === fallback || loaded.value[active]) show(active);
}

watch(
    [defaultId, () => props.activeId],
    () => {
        const fallback = defaultId.value;
        if (!fallback) return;
        queue(fallback);
        queue(props.activeId || fallback);
        if (!settledId.value) settledId.value = fallback;
        revealIfReady();
    },
    { immediate: true },
);

function markLoaded(id: string) {
    if (!loaded.value[id]) {
        loaded.value = { ...loaded.value, [id]: true };
    }
    revealIfReady();
}

function bindImage(id: string, element: unknown) {
    if (!(element instanceof HTMLImageElement)) {
        const current = imageEls.get(id);
        if (current && !current.isConnected) imageEls.delete(id);
        return;
    }
    imageEls.set(id, element);
    if (element.complete && element.naturalWidth > 0) markLoaded(id);
}

function preloadRest() {
    const rest = props.banners.slice(1);
    let index = 0;

    const step = () => {
        if (preloadCancelled) return;
        const slide = rest[index];
        index += 1;
        if (!slide) return;
        queue(slide.id);
        if (index < rest.length) schedule();
    };

    const schedule = () => {
        if (preloadCancelled) return;
        if ('requestIdleCallback' in window) {
            idleId = window.requestIdleCallback(step, { timeout: 1200 });
            return;
        }
        preloadTimer = window.setTimeout(step, 160);
    };

    schedule();
}

onMounted(() => {
    const el = settledId.value ? imageEls.get(settledId.value) : undefined;
    if (el) {
        el.style.opacity = '1';
        el.style.zIndex = '1';
    }
    live.value = true;
    preloadRest();
});

onBeforeUnmount(() => {
    preloadCancelled = true;
    generation += 1;
    window.clearTimeout(safetyTimer);
    window.clearTimeout(preloadTimer);
    if (idleId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
    }
    for (const el of imageEls.values()) {
        for (const animation of el.getAnimations()) animation.cancel();
    }
});
</script>

<template>
    <div class="hero-banners" aria-hidden="true">
        <template v-for="banner in banners" :key="banner.id">
            <img
                v-if="queued[banner.id]"
                :ref="(element) => bindImage(banner.id, element)"
                class="hero-banners__image"
                :class="{ 'is-settled': banner.id === settledId }"
                :src="banner.src"
                alt=""
                decoding="async"
                :loading="
                    banner.id === defaultId || banner.id === activeId
                        ? 'eager'
                        : 'lazy'
                "
                :fetchpriority="
                    banner.id === defaultId || banner.id === activeId
                        ? 'high'
                        : 'low'
                "
                :style="{ objectPosition: bannerAlignOf(banner.align) }"
                @load="markLoaded(banner.id)"
            />
        </template>
    </div>
</template>

<style scoped>
.hero-banners {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
}

.hero-banners__image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    border-radius: 0;
}

/* First paint, before a hover starts a fade. Later fades set opacity inline. */
.hero-banners__image.is-settled {
    z-index: 1;
    opacity: 1;
}
</style>
