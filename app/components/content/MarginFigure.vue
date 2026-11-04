<script setup lang="ts">
import { stackMarginNotes, watchMarginNotes } from '~/utils/stackMarginNotes';

const props = defineProps<{
    src: string;
    alt?: string;
    caption?: string;
    width?: string | number;
    height?: string | number;
}>();

const label = computed(
    () => props.alt?.trim() || props.caption?.trim() || '',
);

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
        <span class="margin-note margin-figure">
            <img
                :src="src"
                :alt="label"
                :width="width"
                :height="height"
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
    display: block;
    width: min(100%, var(--note-width));
    margin: 2.25rem auto;
}

@media (max-width: 640px) {
    .margin-figure {
        width: min(100%, 18rem);
    }
}

.margin-figure img {
    display: block;
    width: 100%;
    height: auto;
}

.margin-figure__caption {
    display: block;
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
        width: var(--note-width);
        margin: 0;
    }

    .margin-figure__caption {
        font-size: 0.8rem;
    }
}
</style>
