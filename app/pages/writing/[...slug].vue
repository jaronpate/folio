<script lang="ts" setup>
const route = useRoute();
const siteUrl = 'https://jaron.sh';
const personId = `${siteUrl}/#person`;
const articleUrl = `${siteUrl}${route.path}`;
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
                '@type': 'BlogPosting',
                '@id': `${articleUrl}#article`,
                url: articleUrl,
                headline: page.value.title,
                description: page.value.description,
                datePublished: new Date(page.value.date).toISOString(),
                dateModified: new Date(page.value.date).toISOString(),
                inLanguage: 'en-US',
                isPartOf: { '@id': `${siteUrl}/#website` },
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': articleUrl,
                },
                author: { '@id': personId },
                publisher: { '@id': personId },
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
