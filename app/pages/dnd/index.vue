<script setup lang="ts">
import { DEFAULT_IMAGE, SITE_URL } from '~/utils/site';

const { data: pages } = await useAsyncData('dnd-pages', async () => {
    const all = await queryCollection('dnd').order('date', 'DESC').all();
    return all.filter((page) => !page.hidden);
});

const sectionUrl = `${SITE_URL}/dnd`;
const sectionTitle = 'D&D';
const sectionDescription =
    'Stories from the table, with a reading when there is one.';

useSeoMeta({
    title: sectionTitle,
    ogTitle: sectionTitle,
    description: sectionDescription,
    ogDescription: sectionDescription,
    ogUrl: sectionUrl,
    ogType: 'website',
    ogImage: DEFAULT_IMAGE,
    ogImageAlt: sectionTitle,
    twitterCard: 'summary',
    twitterTitle: sectionTitle,
    twitterDescription: sectionDescription,
    twitterImage: DEFAULT_IMAGE,
    robots: 'noindex',
});

useHead({
    link: [{ rel: 'canonical', href: sectionUrl }],
});
</script>

<template>
    <NuxtLayout
        name="main"
        :title="sectionTitle"
        :description="sectionDescription"
    >
        <article>
            <WritingList base="/dnd" :pages="pages ?? []" />
        </article>
    </NuxtLayout>
</template>
