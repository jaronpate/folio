<script setup lang="ts">
import { contentDateAttr, formatContentDate } from '~/utils/dates';

const props = withDefaults(
    defineProps<{
        pages: Array<{
            path: string;
            title: string;
            date: string;
        }>;
        base?: string;
        /** Report the story under the pointer so the page can swap its banner. */
        bannerHover?: boolean;
    }>(),
    { base: '/writing', bannerHover: false },
);

const emit = defineEmits<{
    hover: [path: string | null];
}>();

function onEnter(path: string) {
    if (!props.bannerHover) return;
    emit('hover', path);
}

function onLeaveList() {
    if (!props.bannerHover) return;
    emit('hover', null);
}

function onFocusIn(event: FocusEvent) {
    if (!props.bannerHover) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const path = target.closest<HTMLElement>('[data-path]')?.dataset.path;
    if (path) emit('hover', path);
}

function onFocusOut(event: FocusEvent) {
    if (!props.bannerHover) return;
    const current = event.currentTarget;
    const next = event.relatedTarget;
    if (
        current instanceof Node &&
        next instanceof Node &&
        current.contains(next)
    ) {
        return;
    }
    emit('hover', null);
}
</script>

<template>
    <div
        v-if="pages.length"
        @mouseleave="onLeaveList"
        @focusin="onFocusIn"
        @focusout="onFocusOut"
    >
        <NuxtLink
            v-for="page in pages"
            :key="page.path"
            :data-path="page.path"
            :to="base + page.path"
            class="listing"
            @mouseenter="onEnter(page.path)"
        >
            <span class="listing__title">{{ page.title }}</span>
            <span class="listing__rule" aria-hidden="true"></span>
            <time :datetime="contentDateAttr(page.date)">{{
                formatContentDate(page.date)
            }}</time>
        </NuxtLink>
    </div>
    <p v-else class="empty-state">No thoughts...head empty</p>
</template>

<style scoped>
.listing {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    margin: 0 0 0.65rem;
    text-decoration: none;
    color: inherit;
}

.listing:hover {
    text-decoration: none;
}

.listing:hover .listing__title {
    text-decoration: underline;
    text-underline-offset: 3px;
}

.listing__title {
    flex-shrink: 0;
    color: var(--text);
}

.listing__rule {
    flex: 1 1 auto;
    min-width: 1.25rem;
    border-bottom: 1px solid var(--hairline);
    transform: translateY(-0.35em);
}

.listing time {
    flex-shrink: 0;
    font-family: var(--font-plain);
    font-size: 0.75rem;
    font-style: italic;
    color: var(--muted);
    white-space: nowrap;
}

.empty-state {
    color: var(--muted);
    font-style: italic;
}

@media (max-width: 640px) {
    .listing {
        flex-direction: column;
        gap: 0.15rem;
    }

    .listing__rule {
        display: none;
    }
}
</style>
