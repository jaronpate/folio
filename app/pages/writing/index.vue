<script setup lang="ts">
const { data: pages } = await useAsyncData('writing-pages', () =>
    queryCollection('writing').all(),
);
</script>

<template>
    <NuxtLayout
        name="main"
        title="Writing"
        description="Some thoughts I've had over the years. Not all of them are good, but here we are."
    >
        <template #header-upper>
            <div class="header-upper-inner">
                <NuxtLink to="/" class="back-link" aria-label="Back to Home">
                    <span class="arrow">←</span>
                    <span>Home</span>
                </NuxtLink>
            </div>
        </template>
        <section>
            <a v-for="page in pages" :href="page.path" :key="page.path">
                {{ page.title }}
            </a>
        </section>
    </NuxtLayout>
</template>

<style scoped>
.header-upper-inner {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 2rem;
}
</style>
