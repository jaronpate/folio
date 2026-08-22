<script setup lang="ts">
import {
    DEFAULT_IMAGE,
    SITE_NAME,
    SITE_URL,
    personId,
    websiteId,
} from '~/utils/site';

const { data: pages } = await useAsyncData('writing-pages', async () => {
    const all = await queryCollection('writing').order('date', 'DESC').all();
    return import.meta.dev ? all : all.filter((page) => !page.demo);
});

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
            <WritingList :pages="pages ?? []" />
        </article>
    </NuxtLayout>
</template>
