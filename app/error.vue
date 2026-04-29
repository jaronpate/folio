<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();

useHead({
    title: 'Sorry...',
});
</script>

<template>
    <div class="error-page">
        <div class="error-card">
            <div class="error-bg"></div>
            <div class="error-content">
                <h1>{{ error.status }}</h1>
                <p>Sorry, something went wrong.</p>
                <NuxtLink to="/">Back to the homepage.</NuxtLink>
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
    background: url('/blend.jpeg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: url(#grainy);
}

.error-bg {
    pointer-events: none;
    position: absolute;
    inset: 0;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /* glass effect on background */
    /* background: rgba(0, 0, 0, 0.16);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(5px); */
}

.error-content {
    z-index: 1;
}

a {
    position: relative;
    color: var(--bg);
    text-decoration: underline;
    text-underline-offset: 4px;
    z-index: 1;
}

a::before {
    content: '';
    background-color: var(--bg);
    position: absolute;
    top: -3px;
    /* left: -4px; */
    left: 0;
    right: 0;
    bottom: 0;
    /* width: calc(100% + 8px); */
    width: 100%;
    /* height: 0; */
    height: calc(100% + 6px);
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 200ms ease;
}

a:hover::before {
    /* transform: scaleY(1); */
}

a:hover {
    mix-blend-mode: screen;
    color: var(--text);
    background-color: var(--bg);
}
</style>
