<script setup lang="ts">
const { data: home } = await useAsyncData(() =>
    queryCollection('writing').path('/writing').first(),
);

useSeoMeta({
    title: home.value?.title,
    description: home.value?.description,
});
</script>

<template>
    <NuxtLayout
        name="writing"
        :title="home?.title"
        :description="home?.description"
    >
        <ContentRenderer v-if="home" :value="home" />
        <div v-else>Home not found</div>
    </NuxtLayout>
</template>
