<script setup lang="ts">
const { data: pages } = await useAsyncData('writing-pages', () =>
    queryCollection('writing').all(),
);
</script>

<template>
    <NuxtLayout name="main"> </NuxtLayout>
</template>
