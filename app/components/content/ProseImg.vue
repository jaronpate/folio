<script setup lang="ts">
import { withTrailingSlash, withLeadingSlash, joinURL } from 'ufo';
import ImageComponent from '#build/mdc-image-component.mjs';

const props = defineProps<{
    src?: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
    title?: string;
    caption?: string;
}>();

const refinedSrc = computed(() => {
    if (props.src?.startsWith('/') && !props.src.startsWith('//')) {
        const base = withLeadingSlash(
            withTrailingSlash(useRuntimeConfig().app.baseURL),
        );
        if (base !== '/' && !props.src.startsWith(base)) {
            return joinURL(base, props.src);
        }
    }
    return props.src ?? '';
});

const caption = computed(() => {
    const value = props.caption || props.title;
    return value?.trim() ? value : '';
});
</script>

<template>
    <figure class="article-figure">
        <component
            :is="ImageComponent"
            :src="refinedSrc"
            :alt="props.alt ?? ''"
            :width="props.width"
            :height="props.height"
        />
        <figcaption v-if="caption">{{ caption }}</figcaption>
    </figure>
</template>

<style scoped>
.article-figure {
    display: block;
    width: fit-content;
    max-width: 100%;
    margin: 1.25rem 0;
}

.article-figure :deep(img) {
    display: block;
    width: auto;
    max-width: 100%;
    height: auto;
    border-radius: var(--radius);
    background: var(--img-matte);
}

.article-figure figcaption {
    position: relative;
    width: 0;
    min-width: 100%;
    margin: 0 0 0 1rem;
    padding: 0.5rem 0 0 2rem;
    color: var(--muted);
    font-size: 0.8rem;
    font-style: italic;
    line-height: 1.4;
}

.article-figure figcaption::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0.4rem;
    width: 0.75rem;
    height: 0.95rem;
    border-left: 1px solid var(--muted);
    border-bottom: 1px solid var(--muted);
    border-bottom-left-radius: 0.5rem;
    pointer-events: none;
}
</style>
