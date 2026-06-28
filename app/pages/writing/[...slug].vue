<script lang="ts" setup>
const route = useRoute();
const siteUrl = 'https://jaron.sh';
const personId = `${siteUrl}/#person`;
const websiteId = `${siteUrl}/#website`;
const articleUrl = `${siteUrl}${route.path}`;
const webpageId = `${articleUrl}#webpage`;
const articleId = `${articleUrl}#article`;
const blogId = `${siteUrl}/writing#blog`;
const { data: page } = await useAsyncData(route.path, () => {
    return queryCollection('writing')
        .path(route.path.replace('/writing/', ''))
        .first();
});

if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' });
}

useSeoMeta({
    title: page.value?.title,
    ogTitle: page.value?.title,
    description: page.value?.description,
    ogDescription: page.value?.description,
    ogUrl: useRequestURL().href,
});

useHead({
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
                        name: page.value.title,
                        description: page.value.description,
                        inLanguage: 'en-US',
                        isPartOf: { '@id': websiteId },
                        breadcrumb: { '@id': `${articleUrl}#breadcrumb` },
                        mainEntity: { '@id': articleId },
                    },
                    {
                        '@type': 'Blog',
                        '@id': blogId,
                        url: `${siteUrl}/writing`,
                        name: 'Jaron Pate Writing',
                        inLanguage: 'en-US',
                        isPartOf: { '@id': websiteId },
                        publisher: { '@id': personId },
                    },
                    {
                        '@type': 'BlogPosting',
                        '@id': articleId,
                        url: articleUrl,
                        headline: page.value.title,
                        description: page.value.description,
                        datePublished: new Date(page.value.date).toISOString(),
                        dateModified: new Date(page.value.date).toISOString(),
                        image: {
                            '@type': 'ImageObject',
                            '@id': `${articleUrl}#article-image`,
                            url: `${siteUrl}/favicon.png`,
                        },
                        inLanguage: 'en-US',
                        isPartOf: { '@id': blogId },
                        mainEntityOfPage: { '@id': webpageId },
                        author: { '@id': personId },
                        publisher: { '@id': personId },
                    },
                    {
                        '@type': 'BreadcrumbList',
                        '@id': `${articleUrl}#breadcrumb`,
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
                                item: `${siteUrl}/writing`,
                            },
                            {
                                '@type': 'ListItem',
                                position: 3,
                                name: page.value.title,
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
