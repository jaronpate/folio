<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();

useHead({
    title: 'Sorry...',
});
</script>

<template>
    <NuxtLayout
        name="main"
        :title="String(props.error.statusCode ?? 500)"
        :description="props.error.message ?? 'Sorry, something went wrong.'"
    >
        <article>
            <p>
                <NuxtLink to="/">Back to the homepage.</NuxtLink>
            </p>
        </article>
    </NuxtLayout>
</template>
