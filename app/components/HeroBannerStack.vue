<script setup lang="ts">
import { bannerAlignOf, type HeroBannerSlide } from '~/utils/banner';

const props = defineProps<{
    banners: HeroBannerSlide[];
    /** Slide to show. Empty means the first slide, the newest story. */
    activeId?: string | null;
}>();

const FADE_MS = 650;

const live = ref(false);
const loaded = ref<Record<string, true>>({});
const queued = ref<Record<string, true>>({});
const visibleId = ref<string | null>(null);
const underId = ref<string | null>(null);

const defaultId = computed(() => props.banners[0]?.id ?? null);

let fadeTimer = 0;
let idleId = 0;
let preloadTimer = 0;
let preloadCancelled = false;

function queue(id: string | null | undefined) {
    if (!id || queued.value[id]) return;
    queued.value = { ...queued.value, [id]: true };
}

function show(id: string) {
    if (visibleId.value === id) return;
    const previous = visibleId.value;
    visibleId.value = id;
    if (!previous || !live.value || !import.meta.client) {
        underId.value = null;
        return;
    }
    const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduceMotion) {
        underId.value = null;
        return;
    }
    underId.value = previous;
    window.clearTimeout(fadeTimer);
    fadeTimer = window.setTimeout(() => {
        if (visibleId.value === id) underId.value = null;
    }, FADE_MS);
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
        if (!visibleId.value) visibleId.value = fallback;
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
    if (!(element instanceof HTMLImageElement)) return;
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
    live.value = true;
    preloadRest();
});

onBeforeUnmount(() => {
    preloadCancelled = true;
    window.clearTimeout(fadeTimer);
    window.clearTimeout(preloadTimer);
    if (idleId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
    }
});
</script>

<template>
    <div class="hero-banners" :class="{ 'is-live': live }" aria-hidden="true">
        <template v-for="banner in banners" :key="banner.id">
            <img
                v-if="queued[banner.id]"
                :ref="(element) => bindImage(banner.id, element)"
                class="hero-banners__image"
                :class="{
                    'is-visible': banner.id === visibleId,
                    'is-under':
                        banner.id === underId && banner.id !== visibleId,
                }"
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

/* Keep the outgoing banner opaque so the fade does not show the page behind it. */
.hero-banners__image.is-under {
    z-index: 0;
    opacity: 1;
}

.hero-banners__image.is-visible {
    z-index: 1;
    opacity: 1;
}

.hero-banners.is-live .hero-banners__image.is-visible {
    transition: opacity 0.6s ease;
}

@media (prefers-reduced-motion: reduce) {
    .hero-banners.is-live .hero-banners__image.is-visible {
        transition: none;
    }
}
</style>
