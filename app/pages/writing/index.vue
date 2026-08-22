<script setup lang="ts">
import {
    DEFAULT_IMAGE,
    SITE_NAME,
    SITE_URL,
    personId,
    websiteId,
} from '~/utils/site';

const { data: pages } = await useAsyncData('writing-pages', () =>
    queryCollection('writing').order('date', 'DESC').all(),
);

const writingUrl = `${SITE_URL}/writing`;
const collectionId = `${writingUrl}#collection`;
const blogId = `${writingUrl}#blog`;
const writingTitle = 'Writing';
const writingDescription =
    "Thoughts I've had here and there. Maybe you'll find something helpful or interesting here.";

useSeoMeta({
    title: writingTitle,
    ogTitle: writingTitle,
    description: writingDescription,
    ogDescription: writingDescription,
    ogUrl: writingUrl,
    ogType: 'website',
    ogImage: DEFAULT_IMAGE,
    ogImageAlt: writingTitle,
    twitterCard: 'summary',
    twitterTitle: writingTitle,
    twitterDescription: writingDescription,
    twitterImage: DEFAULT_IMAGE,
});

useHead({
    link: [{ rel: 'canonical', href: writingUrl }],
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
                        name: writingTitle,
                        description: writingDescription,
                        inLanguage: 'en-US',
                        isPartOf: { '@id': websiteId },
                        author: {
                            '@type': 'Person',
                            '@id': personId,
                            name: SITE_NAME,
                        },
                        mainEntity: { '@id': blogId },
                        breadcrumb: { '@id': `${collectionId}#breadcrumb` },
                    },
                    {
                        '@type': 'Blog',
                        '@id': blogId,
                        url: writingUrl,
                        name: 'Jaron Pate Writing',
                        description: writingDescription,
                        inLanguage: 'en-US',
                        isPartOf: { '@id': websiteId },
                        publisher: {
                            '@type': 'Person',
                            '@id': personId,
                            name: SITE_NAME,
                        },
                        blogPost: (pages.value ?? []).map((page) => ({
                            '@id': `${writingUrl}${page.path}#article`,
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
                                url: `${writingUrl}${page.path}`,
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
                                item: SITE_URL,
                            },
                            {
                                '@type': 'ListItem',
                                position: 2,
                                name: writingTitle,
                                item: writingUrl,
                            },
                        ],
                    },
                ],
            }),
        },
    ],
});

const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
};

definePageMeta({
    layout: false,
});
</script>

<template>
    <NuxtLayout
        name="main"
        title="Writing"
        description="Thoughts I've had here and there. Maybe you'll find something helpful or interesting here."
    >
        <article>
            <template v-if="pages?.length">
                <NuxtLink
                    v-for="page in pages"
                    :key="page.path"
                    :to="'/writing' + page.path"
                    class="listing"
                >
                    <span class="listing__title">{{ page.title }}</span>
                    <time :datetime="new Date(page.date).toISOString()">{{
                        formatDate(page.date)
                    }}</time>
                </NuxtLink>
            </template>
            <p v-else class="empty-state">No thoughts...head empty</p>
        </article>
    </NuxtLayout>
</template>

<style scoped>
.listing {
    display: flex;
    align-items: baseline;
    gap: 1rem;
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
    font-style: italic;
}

.listing__title {
    color: var(--text);
}

.listing time {
    margin-left: auto;
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

    .listing time {
        margin-left: 0;
    }
}
</style>
