<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();

useHead({
    title: 'Sorry...',
});
</script>

<template>
    <div class="error-page">
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
        <div class="error-card">
            <div class="error-content">
                <h1>{{ error.status }}</h1>
                <p>
                    {{ error.message ?? 'Sorry, something went wrong.' }}
                </p>
                <p>
                    <NuxtLink to="/" class="punch-link"
                        >Back to the homepage.</NuxtLink
                    >
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.error-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
}

.error-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 16rem;
    color: var(--bg);
    isolation: isolate;
}

.error-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('~/assets/images/blend.jpeg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: url(#grainy);
    z-index: -1;
}

.error-content {
}
</style>
