<script setup lang="ts">
const { data: pages } = await useAsyncData('writing-pages', () =>
    queryCollection('writing').all(),
);

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // ex. May 5, 2026
    return `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
};
</script>

<template>
    <NuxtLayout
        name="main"
        title="Writing"
        description="Thoughts I've had here and there. Maybe you'll find something helpful or interesting here."
    >
        <template #header-upper>
            <div class="header-upper-inner">
                <NuxtLink to="/" class="back-link" aria-label="Back to Home">
                    <span class="arrow">←</span>
                    <span>Home</span>
                </NuxtLink>
            </div>
        </template>
        <section>
            <div class="section__content">
                <template v-if="pages?.length">
                    <a
                        v-for="page in pages"
                        :href="page.path"
                        :key="page.path"
                        class="article"
                    >
                        <h3 class="article__title">{{ page.title }}</h3>
                        <p class="article__date">
                            {{ formatDate(page.date) }}
                        </p>
                        <p class="article__description">
                            {{ page.description }}
                        </p>
                    </a>
                </template>
                <template v-else>
                    <div class="empty-state">
                        <p>Nothing here yet.</p>
                    </div>
                </template>
            </div>
        </section>
    </NuxtLayout>
</template>

<style scoped>
.header-upper-inner {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 2rem;
}

section > .section__content {
    padding: 0 2rem;
}

section:not(:has(h5)) > .section__content {
    padding: 2rem;
}

.article {
    border-bottom: 1px solid var(--muted);
    padding: 1rem 0;
    display: block;
    text-decoration: none;
    color: inherit;
}

.article:first-of-type {
    padding-top: 0;
}

.article:last-of-type {
    padding-bottom: 0;
}

.article:last-child {
    border-bottom: none;
}

.article:hover > .article__title {
    text-decoration: underline;
    text-underline-offset: 4px;
    font-style: italic;
    font-family: var(--font-hover);
}

.article__title {
    margin: 0;
    font-weight: 400;
}

.article__date {
    margin: 0;
    font-weight: 400;
    font-size: small;
    color: var(--muted);
}

.article__description {
    margin: 0;
    font-size: small;
    font-weight: 400;
    font-style: italic;
}

.empty-state {
    color: var(--muted);
}
</style>
