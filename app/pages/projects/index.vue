<script setup lang="ts">
import {
    DEFAULT_IMAGE,
    SITE_NAME,
    SITE_URL,
    personId,
    websiteId,
} from '~/utils/site';
import { isExternalHref, projectEntryHref } from '~/utils/projects';

const { data: pages } = await useAsyncData('project-pages', async () => {
    const all = await queryCollection('projects').order('title', 'ASC').all();
    return import.meta.dev ? all : all.filter((page) => !page.hidden);
});

const projectsUrl = `${SITE_URL}/projects`;
const collectionId = `${projectsUrl}#collection`;
const listId = `${projectsUrl}#list`;
const projectsTitle = 'Projects';
const projectsDescription =
    "Things I've made which you may find of some interest.";

useSeoMeta({
    title: projectsTitle,
    ogTitle: projectsTitle,
    description: projectsDescription,
    ogDescription: projectsDescription,
    ogUrl: projectsUrl,
    ogType: 'website',
    ogImage: DEFAULT_IMAGE,
    ogImageAlt: projectsTitle,
    twitterCard: 'summary',
    twitterTitle: projectsTitle,
    twitterDescription: projectsDescription,
    twitterImage: DEFAULT_IMAGE,
});

useHead({
    link: [{ rel: 'canonical', href: projectsUrl }],
    script: [
        {
            key: 'json-ld-projects',
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': [
                    {
                        '@type': 'CollectionPage',
                        '@id': collectionId,
                        url: projectsUrl,
                        name: projectsTitle,
                        description: projectsDescription,
                        inLanguage: 'en-US',
                        isPartOf: { '@id': websiteId },
                        author: {
                            '@type': 'Person',
                            '@id': personId,
                            name: SITE_NAME,
                        },
                        mainEntity: { '@id': listId },
                        breadcrumb: { '@id': `${collectionId}#breadcrumb` },
                    },
                    {
                        '@type': 'ItemList',
                        '@id': listId,
                        name: 'Projects by Jaron Pate',
                        itemListElement: (pages.value ?? []).map(
                            (page, index) => {
                                const href = projectEntryHref(page);
                                const url = isExternalHref(href)
                                    ? href
                                    : `${SITE_URL}${href}`;
                                return {
                                    '@type': 'ListItem',
                                    position: index + 1,
                                    url,
                                    name: page.title,
                                };
                            },
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
                                name: projectsTitle,
                                item: projectsUrl,
                            },
                        ],
                    },
                ],
            }),
        },
    ],
});
</script>

<template>
    <NuxtLayout
        name="main"
        :title="projectsTitle"
        :description="projectsDescription"
    >
        <article>
            <ProjectList :pages="pages ?? []" />
        </article>
    </NuxtLayout>
</template>
