<script setup lang="ts">
import '~/assets/css/main.css';

useHead({
    link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
});
</script>

<template>
    <svg width="0" height="0" aria-hidden="true" style="position: absolute">
        <filter id="grainy" x="0" y="0" width="100%" height="100%">
            <feTurbulence
                type="fractalNoise"
                baseFrequency=".85"
                numOctaves="3"
            ></feTurbulence>
            <feColorMatrix type="saturate" values="0"></feColorMatrix>
            <feBlend mode="multiply" in="SourceGraphic"></feBlend>
        </filter>
    </svg>
    <NuxtPage />
</template>
