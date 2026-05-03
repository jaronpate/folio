<script setup lang="ts">
const { data: pages } = await useAsyncData('writing-pages', () =>
    queryCollection('writing').all(),
);
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
                <a
                    v-for="page in pages"
                    :href="page.path"
                    :key="page.path"
                    class="article"
                >
                    <h3 class="article__title">{{ page.title }}</h3>
                    <p class="article__description">{{ page.description }}</p>
                </a>
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

.article__description {
    margin: 0;
    font-size: small;
    font-weight: 400;
    font-style: italic;
    color: var(--muted);
}
</style>
