<script setup lang="ts">
import { stackMarginNotes, watchMarginNotes } from '~/utils/stackMarginNotes';

const props = defineProps<{
    src: string;
    alt?: string;
    caption?: string;
    width?: string | number;
    height?: string | number;
    maxWidth?: string | number;
    maxHeight?: string | number;
}>();

const label = computed(
    () => props.alt?.trim() || props.caption?.trim() || '',
);

function cssLength(value: string | number | undefined) {
    if (value == null) return undefined;
    const raw = String(value).trim();
    if (!raw) return undefined;
    return /^-?\d+(\.\d+)?$/.test(raw) ? `${raw}px` : raw;
}

const maxWidthCss = computed(() => cssLength(props.maxWidth));
const maxHeightCss = computed(() => cssLength(props.maxHeight));

const figureStyle = computed(() => {
    const style: Record<string, string> = {};
    if (maxWidthCss.value) style['--figure-max-width'] = maxWidthCss.value;
    if (maxHeightCss.value) style['--figure-max-height'] = maxHeightCss.value;
    return style;
});

onMounted(() => {
    watchMarginNotes();
});

function onLoad() {
    stackMarginNotes();
}
</script>

<template>
    <span class="margin-note-root" data-spoken-skip>
        <span class="margin-note-mark" aria-hidden="true"></span>
        <span
            class="margin-note margin-figure"
            :class="{ 'has-max-height': maxHeightCss }"
            :style="figureStyle"
        >
            <img
                :src="src"
                :alt="label"
                :width="width"
                :height="height"
                loading="lazy"
                decoding="async"
                @load="onLoad"
            />
            <span v-if="caption" class="margin-figure__caption">{{
                caption
            }}</span>
        </span>
    </span>
</template>

<style scoped>
.margin-note-root {
    display: block;
}

.margin-note-mark {
    display: inline;
}

.margin-figure {
    --figure-cap: var(--figure-max-width, var(--note-width));
    --figure-cap: var(--figure-max-width, 22rem);

    display: block;
    width: min(100%, var(--figure-cap));
    margin: 2.25rem auto;
}

@media (max-width: 640px) {
    .margin-figure {
        --figure-cap: 18rem;
    }
}

.margin-figure img {
    display: block;
    width: 100%;
    height: auto;
}

.margin-figure__caption {
    display: block;
    width: 0;
    min-width: 100%;
    margin-top: 0.45rem;
    font-size: 0.85rem;
    font-style: italic;
    color: var(--muted);
    line-height: 1.45;
}

@media (min-width: 1200px) {
    .margin-note-root {
        display: inline;
    }

    .margin-figure {
        position: absolute;
        left: calc(100% + var(--note-gap));
        width: var(--figure-cap);
        margin: 0;
    }

    .margin-figure__caption {
        font-size: 0.8rem;
    }
}

.margin-figure.has-max-height {
    width: fit-content;
    max-width: min(100%, var(--figure-cap));
}

.margin-figure.has-max-height img {
    width: auto;
    max-width: min(var(--col), var(--figure-cap));
    height: auto;
    max-height: var(--figure-max-height);
}
</style>
