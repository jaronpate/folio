<script setup lang="ts">
import { postOgImage, postTwitterCard } from '~/utils/postMedia';
import { DEFAULT_IMAGE, SITE_URL } from '~/utils/site';

const { data: pages } = await useAsyncData('dnd-pages', async () => {
    const all = await queryCollection('dnd').order('date', 'DESC').all();
    return all.filter((page) => !page.hidden);
});

const featured = computed(() => pages.value?.[0] ?? null);
const shareImage = computed(() => postOgImage(featured.value, DEFAULT_IMAGE));

const hoveredPath = ref<string | null>(null);

const banners = computed(() => {
    const slides: { id: string; src: string; align: string | null }[] = [];
    for (const page of pages.value ?? []) {
        const src = page.banner?.trim();
        if (!src) continue;
        slides.push({
            id: page.path,
            src,
            align: page.bannerAlign ?? null,
        });
    }
    return slides;
});

const activeBannerId = computed(() => {
    if (!hoveredPath.value) return null;
    const match = banners.value.find((slide) => slide.id === hoveredPath.value);
    return match?.id ?? null;
});

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
        :banners="banners"
        :active-banner-id="activeBannerId"
        :forced-theme="featured?.theme"
        :forced-font="featured?.font"
    >
        <article>
            <WritingList
                base="/dnd"
                banner-hover
                :pages="pages ?? []"
                @hover="hoveredPath = $event"
            />
        </article>
    </NuxtLayout>
</template>
