<script setup lang="ts">
const props = defineProps<{
    bleed?: boolean | string;
}>();

const isBleed = computed(
    () =>
        props.bleed === true ||
        props.bleed === '' ||
        props.bleed === 'true',
);
</script>

<template>
    <div class="notice" :class="{ 'notice--bleed': isBleed }">
        <slot />
    </div>
</template>

<style scoped>
.notice {
    background: var(--navy);
    color: #f6f7f9;
    padding: 1rem 1.15rem;
    margin: 1.5rem 0;
    border-radius: var(--radius);
}

.notice :deep(a) {
    color: var(--accent-soft);
}

.notice :deep(a:hover) {
    color: #fff;
}

.notice :deep(p:last-child) {
    margin-bottom: 0;
}

.notice--bleed {
    box-sizing: border-box;
    width: 100vw;
    max-width: 100vw;
    margin: 1.5rem 0 1.5rem calc(-1 * var(--col-left));
    padding: 1.15rem var(--col-left);
    padding-right: calc(100vw - var(--col-left) - var(--col));
    border-radius: 0;
}
</style>
