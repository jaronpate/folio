<script setup lang="ts">
import '~/assets/css/main.css';

useHead({
    link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: '',
        },
        {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Baskervville:ital,wght@0,400..700;1,400..700&display=swap',
        },
        {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap',
        },
    ],
});

onMounted(() => {});
</script>

<template>
    <NuxtPage />
</template>
