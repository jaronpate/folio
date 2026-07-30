<script lang="ts" setup>
import {
    DEFAULT_IMAGE,
    SITE_NAME,
    SITE_URL,
    personId,
    websiteId,
} from '~/utils/site';

const route = useRoute();
const articleUrl = `${SITE_URL}${route.path}`;
const webpageId = `${articleUrl}#webpage`;
const articleId = `${articleUrl}#article`;
const blogId = `${SITE_URL}/writing#blog`;
const { data: page } = await useAsyncData(route.path, () => {
    return queryCollection('writing')
        .path(route.path.replace('/writing/', ''))
        .first();
});

if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' });
}

const articleTitle = page.value.title;
const articleDescription = page.value.description;

useSeoMeta({
    title: articleTitle,
    ogTitle: articleTitle,
    description: articleDescription,
    ogDescription: articleDescription,
    ogUrl: articleUrl,
    ogType: 'article',
    ogImage: DEFAULT_IMAGE,
    ogImageAlt: articleTitle,
    twitterCard: 'summary',
    twitterTitle: articleTitle,
    twitterDescription: articleDescription,
    twitterImage: DEFAULT_IMAGE,
    articlePublishedTime: new Date(page.value.date).toISOString(),
    articleModifiedTime: new Date(page.value.date).toISOString(),
    articleAuthor: [SITE_NAME],
});

useHead({
    link: [{ rel: 'canonical', href: articleUrl }],
    script: [
        {
            key: 'json-ld-article',
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': [
                    {
                        '@type': 'WebPage',
                        '@id': webpageId,
                        url: articleUrl,
                        name: articleTitle,
                        description: articleDescription,
                        inLanguage: 'en-US',
                        isPartOf: { '@id': websiteId },
                        breadcrumb: { '@id': `${articleUrl}#breadcrumb` },
                        mainEntity: { '@id': articleId },
                    },
                    {
                        '@type': 'Blog',
                        '@id': blogId,
                        url: `${SITE_URL}/writing`,
                        name: 'Jaron Pate Writing',
                        inLanguage: 'en-US',
                        isPartOf: { '@id': websiteId },
                        publisher: {
                            '@type': 'Person',
                            '@id': personId,
                            name: SITE_NAME,
                        },
                    },
                    {
                        '@type': 'BlogPosting',
                        '@id': articleId,
                        url: articleUrl,
                        headline: articleTitle,
                        description: articleDescription,
                        datePublished: new Date(page.value.date).toISOString(),
                        dateModified: new Date(page.value.date).toISOString(),
                        image: {
                            '@type': 'ImageObject',
                            '@id': `${articleUrl}#article-image`,
                            url: DEFAULT_IMAGE,
                        },
                        inLanguage: 'en-US',
                        isPartOf: { '@id': blogId },
                        mainEntityOfPage: { '@id': webpageId },
                        author: {
                            '@type': 'Person',
                            '@id': personId,
                            name: SITE_NAME,
                            url: SITE_URL,
                        },
                        publisher: {
                            '@type': 'Person',
                            '@id': personId,
                            name: SITE_NAME,
                        },
                    },
                    {
                        '@type': 'BreadcrumbList',
                        '@id': `${articleUrl}#breadcrumb`,
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
                                name: 'Writing',
                                item: `${SITE_URL}/writing`,
                            },
                            {
                                '@type': 'ListItem',
                                position: 3,
                                name: articleTitle,
                                item: articleUrl,
                            },
                        ],
                    },
                ],
            }),
        },
    ],
});

definePageMeta({
    layout: false,
});
</script>

<template>
    <div>
        <NuxtLayout
            name="main"
            :title="page?.title"
            :description="page?.description"
        >
            <template #header-upper>
                <div class="header-upper-inner">
                    <NuxtLink
                        to="/writing"
                        class="back-link"
                        aria-label="Back to writing"
                    >
                        <span class="arrow">←</span>
                        <span>Back</span>
                    </NuxtLink>
                </div>
            </template>
            <ContentRenderer
                class="writing__content"
                v-if="page"
                :value="page"
            />
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

.writing__content {
    padding: 2rem;
}

.writing__content :deep(> :first-child) {
    margin-top: 0;
}
</style>
