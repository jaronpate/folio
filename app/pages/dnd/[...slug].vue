<script setup lang="ts">
import { formatContentDate } from '~/utils/dates';
import { openGraphAudioMeta } from '~/utils/openGraphAudio';
import { DEFAULT_IMAGE, SITE_URL } from '~/utils/site';

const route = useRoute();
const articleUrl = `${SITE_URL}${route.path}`;
const slug = computed(() =>
    Array.isArray(route.params.slug)
        ? route.params.slug.join('/')
        : String(route.params.slug ?? ''),
);
const contentPath = computed(() => '/' + slug.value);

const { data } = await useAsyncData(
    () => `dnd:${route.path}`,
    async () => {
        const all = await queryCollection('dnd').all();
        return (
            all.find(
                (page) =>
                    page.path === contentPath.value ||
                    page.stem === slug.value ||
                    page.stem === `dnd/${slug.value}`,
            ) ?? null
        );
    },
    { watch: [() => route.path] },
);

if (!data.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' });
}

const page = computed(() => data.value);

useSeoMeta({
    title: () => page.value?.title,
    ogTitle: () => page.value?.title,
    description: () => page.value?.description,
    ogDescription: () => page.value?.description,
    ogUrl: articleUrl,
    ogType: 'article',
    ogImage: DEFAULT_IMAGE,
    ogImageAlt: () => page.value?.title,
    twitterCard: 'summary',
    twitterTitle: () => page.value?.title,
    twitterDescription: () => page.value?.description,
    twitterImage: DEFAULT_IMAGE,
    robots: 'noindex',
});

useHead({
    link: [{ rel: 'canonical', href: articleUrl }],
    meta: () => openGraphAudioMeta(page.value?.audio),
});
</script>

<template>
    <NuxtLayout
        v-if="page"
        name="main"
        :title="page.title"
        :description="formatContentDate(page.date, 'long')"
    >
        <article>
            <div class="article-body">
                <p v-if="page.description">
                    <strong>{{ page.description }}</strong>
                </p>
                <AudioPlayer
                    v-if="page.audio"
                    sticky
                    :src="page.audio"
                    :title="page.audioTitle"
                    :download="page.audioDownload"
                />
                <ContentRenderer :value="page" />
            </div>
        </article>
    </NuxtLayout>
</template>
