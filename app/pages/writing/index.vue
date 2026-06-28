<script setup lang="ts">
const { data: pages } = await useAsyncData('writing-pages', () =>
    queryCollection('writing').order('date', 'DESC').all(),
);

const siteUrl = 'https://jaron.sh';
const writingUrl = `${siteUrl}/writing`;
const personId = `${siteUrl}/#person`;
const websiteId = `${siteUrl}/#website`;
const collectionId = `${writingUrl}#collection`;
const blogId = `${writingUrl}#blog`;

useSeoMeta({
    title: 'Writing',
    ogTitle: 'Writing',
    description:
        "Thoughts I've had here and there. Maybe you'll find something helpful or interesting here.",
    ogDescription:
        "Thoughts I've had here and there. Maybe you'll find something helpful or interesting here.",
    ogUrl: useRequestURL().href,
});

useHead({
    script: [
        {
            key: 'json-ld-writing',
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': [
                    {
                        '@type': 'CollectionPage',
                        '@id': collectionId,
                        url: writingUrl,
                        name: 'Writing',
                        description:
                            "Thoughts I've had here and there. Maybe you'll find something helpful or interesting here.",
                        inLanguage: 'en-US',
                        isPartOf: { '@id': websiteId },
                        author: { '@id': personId },
                        mainEntity: { '@id': blogId },
                        breadcrumb: { '@id': `${collectionId}#breadcrumb` },
                    },
                    {
                        '@type': 'Blog',
                        '@id': blogId,
                        url: writingUrl,
                        name: 'Jaron Pate Writing',
                        description:
                            "Thoughts I've had here and there. Maybe you'll find something helpful or interesting here.",
                        inLanguage: 'en-US',
                        isPartOf: { '@id': websiteId },
                        publisher: { '@id': personId },
                        blogPost: (pages.value ?? []).map((page) => ({
                            '@id': `${writingUrl}/${page.path}#article`,
                        })),
                    },
                    {
                        '@type': 'ItemList',
                        '@id': `${collectionId}#posts`,
                        name: 'Writing by Jaron Pate',
                        itemListElement: (pages.value ?? []).map(
                            (page, index) => ({
                                '@type': 'ListItem',
                                position: index + 1,
                                url: `${writingUrl}/${page.path}`,
                                name: page.title,
                            }),
                        ),
                    },
                    {
                        '@type': 'BreadcrumbList',
                        '@id': `${collectionId}#breadcrumb`,
                        itemListElement: [
                            {
                                '@type': 'ListItem',
                                position: 1,
                                name: 'Home',
                                item: siteUrl,
                            },
                            {
                                '@type': 'ListItem',
                                position: 2,
                                name: 'Writing',
                                item: writingUrl,
                            },
                        ],
                    },
                ],
            }),
        },
    ],
});

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // ex. May 5, 2026
    return `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
};

definePageMeta({
    layout: false,
});
</script>

<template>
    <div>
        <NuxtLayout
            name="main"
            title="Writing"
            description="Thoughts I've had here and there. Maybe you'll find something helpful or interesting here."
        >
            <template #header-upper>
                <div class="header-upper-inner">
                    <NuxtLink
                        to="/"
                        class="back-link"
                        aria-label="Back to Home"
                    >
                        <span class="arrow">←</span>
                        <span>Home</span>
                    </NuxtLink>
                </div>
            </template>
            <section>
                <div class="section__content">
                    <template v-if="pages?.length">
                        <NuxtLink
                            v-for="page in pages"
                            :to="'/writing/' + page.path"
                            :key="page.path"
                            class="article"
                        >
                            <h3 class="article__title">{{ page.title }}</h3>
                            <!-- <p class="article__date">
                            {{ formatDate(page.date) }}
                        </p> -->
                            <p class="article__description">
                                {{ page.description }}
                            </p>
                        </NuxtLink>
                    </template>
                    <template v-else>
                        <div class="empty-state">
                            <p>No thoughts...head empty</p>
                        </div>
                    </template>
                </div>
            </section>
        </NuxtLayout>
    </div>
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
