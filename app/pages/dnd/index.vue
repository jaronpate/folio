<script setup lang="ts">
import { postOgImage, postTwitterCard } from '~/utils/postMedia';
import { DEFAULT_IMAGE, SITE_URL } from '~/utils/site';

const { data: pages } = await useAsyncData('dnd-pages', async () => {
    const all = await queryCollection('dnd').order('date', 'DESC').all();
    return all.filter((page) => !page.hidden);
});

const featured = computed(() => pages.value?.[0] ?? null);
const shareImage = computed(() =>
    postOgImage(featured.value, DEFAULT_IMAGE),
);

const sectionUrl = `${SITE_URL}/dnd`;
const sectionTitle = 'D&D';
const sectionDescription =
    'Auto generated writeups of great tales from BROindor';

useSeoMeta({
    title: sectionTitle,
    ogTitle: sectionTitle,
    description: sectionDescription,
    ogDescription: sectionDescription,
    ogUrl: sectionUrl,
    ogType: 'website',
    ogImage: () => shareImage.value,
    ogImageAlt: sectionTitle,
    twitterCard: () => postTwitterCard(featured.value),
    twitterTitle: sectionTitle,
    twitterDescription: sectionDescription,
    twitterImage: () => shareImage.value,
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
        :banner="featured?.banner"
        :forced-theme="featured?.theme"
    >
        <article>
            <WritingList base="/dnd" :pages="pages ?? []" />
        </article>
    </NuxtLayout>
</template>
