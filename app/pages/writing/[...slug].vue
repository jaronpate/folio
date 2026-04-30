<script lang="ts" setup>
const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => {
    return queryCollection('writing').path(route.path).first();
});

if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' });
}

useSeoMeta({
    title: page.value?.title,
    description: page.value?.description,
});

definePageMeta({
    layout: 'main',
});
</script>

<template>
    <NuxtLayout
        name="main"
        :title="page?.title"
        :description="page?.description"
    >
        <template #header-upper>
            <div class="header-upper-inner">
                <NuxtLink href="/writing"><-- Back</NuxtLink>
            </div>
        </template>
        <ContentRenderer class="writing__content" v-if="page" :value="page" />
    </NuxtLayout>
</template>

<style scoped>
.header-upper-inner {
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 100%;
    padding: 0 2rem;
}

.header-upper-inner a {
    font-size: small;
    color: var(--text);
    text-decoration: underline;
    text-underline-offset: 4px;
}

.writing__content {
    padding: 2rem;
}

.writing__content :deep(> :first-child) {
    margin-top: 0;
}
</style>
