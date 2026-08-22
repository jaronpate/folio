<script setup lang="ts">
defineProps<{
    pages: Array<{
        path: string;
        title: string;
        date: string | Date;
    }>;
}>();

const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
};
</script>

<template>
    <template v-if="pages.length">
        <NuxtLink
            v-for="page in pages"
            :key="page.path"
            :to="'/writing' + page.path"
            class="listing"
        >
            <span class="listing__title">{{ page.title }}</span>
            <span class="listing__rule" aria-hidden="true"></span>
            <time :datetime="new Date(page.date).toISOString()">{{
                formatDate(page.date)
            }}</time>
        </NuxtLink>
    </template>
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
