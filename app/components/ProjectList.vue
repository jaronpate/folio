<script setup lang="ts">
import { isExternalHref, projectEntryHref } from '~/utils/projects';

const props = defineProps<{
    pages: Array<{
        path: string;
        title: string;
        description: string;
        href?: string | null;
        image?: string | null;
    }>;
}>();

const entries = computed(() =>
    props.pages.map((page) => {
        const to = projectEntryHref(page);
        const external = isExternalHref(to);
        return { page, to, external };
    }),
);

onMounted(() => {
    for (const { image } of props.pages) {
        if (!image) continue;
        new Image().src = image;
    }
});

const preview = ref<string | null>(null);
const cursor = ref({ x: 0, y: 0 });
const previewEl = ref<HTMLElement | null>(null);

const previewStyle = computed(() => {
    const pad = 16;
    const ox = 20;
    const oy = 20;
    const el = previewEl.value;
    const w = el?.offsetWidth ?? 320;
    const h = el?.offsetHeight ?? 200;
    let x = cursor.value.x + ox;
    let y = cursor.value.y + oy;
    if (import.meta.client) {
        if (x + w > window.innerWidth - pad) x = cursor.value.x - w - ox;
        if (y + h > window.innerHeight - pad) y = cursor.value.y - h - oy;
    }
    x = Math.max(pad, x);
    y = Math.max(pad, y);
    return {
        transform: `translate3d(${x}px, ${y}px, 0)`,
    };
});

function onMove(event: MouseEvent, image: string) {
    if (!image) return;
    preview.value = image;
    cursor.value = { x: event.clientX, y: event.clientY };
}

function onLeave() {
    preview.value = null;
}
</script>

<template>
    <template v-if="entries.length">
        <NuxtLink
            v-for="{ page, to, external } in entries"
            :key="page.path"
            :to="to"
            :external="external"
            :target="external ? '_blank' : undefined"
            :rel="external ? 'noopener' : undefined"
            class="project"
            @mousemove="page.image ? onMove($event, page.image) : undefined"
            @mouseleave="page.image ? onLeave() : undefined"
        >
            <span class="project__title">
                {{ page.title }}
                <span v-if="external" class="project__ext" aria-hidden="true"
                    >↗</span
                >
            </span>
            <span class="project__desc">{{ page.description }}</span>
        </NuxtLink>
        <Teleport to="body">
            <div
                v-show="preview"
                ref="previewEl"
                class="project-preview"
                aria-hidden="true"
                :style="previewStyle"
            >
                <img v-if="preview" :src="preview" alt="" />
            </div>
        </Teleport>
    </template>
    <p v-else class="empty-state">Nothing here yet.</p>
</template>

<style scoped>
.project {
    display: block;
    margin: 0 0 1.15rem;
    text-decoration: none;
    color: inherit;
}

.project:hover {
    text-decoration: none;
}

.project:hover .project__title {
    text-decoration: underline;
    text-underline-offset: 3px;
}

.project__title {
    display: block;
    color: var(--text);
    font-size: 1.15rem;
    line-height: 1.3;
}

.project__ext {
    font-size: 0.75em;
    color: var(--muted);
}

.project__desc {
    display: block;
    margin: 0.35rem 0 0;
    color: var(--muted);
}

.empty-state {
    color: var(--muted);
    font-style: italic;
}

.project-preview {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 40;
    pointer-events: none;
    will-change: transform;
}

.project-preview img {
    display: block;
    width: auto;
    height: auto;
    max-width: min(25rem, 80vw);
    max-height: min(20rem, 50vh);
    object-fit: cover;
    border: 1px solid color-mix(in srgb, var(--text) 40%, transparent);
    border-radius: var(--radius);
    box-shadow:
        0 2px 6px rgba(0, 0, 0, 0.28),
        0 18px 40px rgba(0, 0, 0, 0.42);
}

@media (hover: none) {
    .project-preview {
        display: none;
    }
}
</style>
