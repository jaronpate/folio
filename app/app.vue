<script setup lang="ts">
import '~/assets/css/main.css';

const siteUrl = 'https://jaron.sh';
const personId = `${siteUrl}/#person`;
const websiteId = `${siteUrl}/#website`;
const defaultImage = `${siteUrl}/favicon.png`;

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Person',
            '@id': personId,
            name: 'Jaron Pate',
            alternateName: 'jaronpate',
            url: siteUrl,
            email: 'mailto:yo@jp.wtf',
            image: {
                '@type': 'ImageObject',
                '@id': `${siteUrl}/#person-image`,
                url: defaultImage,
                caption: 'Jaron Pate',
            },
            jobTitle: 'Software Engineer',
            description:
                'Developer. Reformed Rust enjoyer, Golang padawan. Building producst in Austin, Texas.',
            disambiguatingDescription:
                'Developer. Reformed Rust enjoyer, Golang padawan. Building producst in Austin, Texas.',
            givenName: 'Jaron',
            familyName: 'Pate',
            knowsLanguage: 'en-US',
            homeLocation: {
                '@type': 'Place',
                name: 'Austin, TX',
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Austin',
                    addressRegion: 'TX',
                    addressCountry: 'US',
                },
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
                'Developer tools',
                'Golang',
                'Rust',
                'TypeScript',
            ],
            mainEntityOfPage: { '@id': websiteId },
        },
        {
            '@type': 'WebSite',
            '@id': websiteId,
            url: siteUrl,
            name: 'Jaron Pate',
            alternateName: 'jaron.sh',
            description:
                'Developer. Reformed Rust enjoyer, Golang padawan. Building producst in Austin, Texas.',
            inLanguage: 'en-US',
            about: { '@id': personId },
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
