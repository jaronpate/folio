<script setup lang="ts">
import '~/assets/css/main.css';

const siteUrl = 'https://jaron.sh';
const personId = `${siteUrl}/#person`;
const websiteId = `${siteUrl}/#website`;

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Person',
            '@id': personId,
            name: 'Jaron Pate',
            url: siteUrl,
            email: 'mailto:yo@jp.wtf',
            jobTitle: 'Software Engineer',
            homeLocation: {
                '@type': 'Place',
                name: 'Austin, TX',
            },
            sameAs: [
                'https://github.com/jaronpate',
                'https://www.linkedin.com/in/jaronp/',
            ],
            knowsAbout: [
                'Software engineering',
                'Frontend development',
                'Product engineering',
                'Web applications',
            ],
        },
        {
            '@type': 'WebSite',
            '@id': websiteId,
            url: siteUrl,
            name: 'Jaron Pate',
            description: 'A developer in Austin, TX.',
            inLanguage: 'en-US',
            author: { '@id': personId },
            publisher: { '@id': personId },
        },
    ],
};

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
