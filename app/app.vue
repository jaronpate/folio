<script setup lang="ts">
import '~/assets/css/main.css';
import {
    DEFAULT_DESCRIPTION,
    DEFAULT_IMAGE,
    DEFAULT_TITLE,
    SITE_NAME,
    SITE_URL,
    personSchema,
    websiteSchema,
} from '~/utils/site';

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        websiteSchema(),
        {
            ...personSchema(),
            mainEntityOfPage: { '@id': `${SITE_URL}/#homepage` },
        },
    ],
};

useSeoMeta({
    ogSiteName: SITE_NAME,
    ogImage: DEFAULT_IMAGE,
    ogImageAlt: SITE_NAME,
    twitterCard: 'summary',
    twitterTitle: DEFAULT_TITLE,
    twitterDescription: DEFAULT_DESCRIPTION,
    twitterImage: DEFAULT_IMAGE,
});

useHead({
    link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    script: [
        {
            key: 'json-ld-site',
            type: 'application/ld+json',
            innerHTML: JSON.stringify(jsonLd),
        },
    ],
});

onMounted(() => {});
</script>

<template>
    <NuxtPage />
</template>
