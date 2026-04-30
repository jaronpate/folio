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
    layout: 'writing',
});
</script>

<template>
    <NuxtLayout name="writing" :title="page?.title" :description="page?.description">
        <ContentRenderer v-if="page" :value="page" />
    </NuxtLayout>
</template>
