<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        images?: Array<{ src: string; alt?: string }> | null;
        decorative?: boolean;
    }>(),
    {
        decorative: false,
    },
);

const frames = computed(() => props.images ?? []);
</script>

<template>
    <div v-if="frames.length" class="carousel">
        <figure
            v-for="image in frames"
            :key="image.src"
            class="carousel__frame"
        >
            <img :src="image.src" :alt="decorative ? '' : (image.alt ?? '')" />
        </figure>
    </div>
</template>

<style scoped>
.carousel {
    --dot-color: #666;

    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    gap: var(--gap);
    overflow-x: auto;
    overflow-y: hidden;
    margin: 0.85rem 0 0;
    padding-bottom: 0.35rem;
    scroll-snap-type: x mandatory;
}

.carousel__frame {
    --dot-size: 6%;

    margin: 0;
    padding: var(--gap);
    flex-shrink: 0;
    border-radius: var(--radius);
    background-color: var(--bg-secondary);
    background-image: radial-gradient(
        circle at 4px 4px,
        var(--dot-color) var(--dot-size),
        transparent calc(var(--dot-size) + 1%)
    );
    background-position: 4px 4px;
    background-size: 12px 12px;
    background-repeat: repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    scroll-snap-align: start;
}

.carousel__frame img {
    max-width: none;
    width: auto;
    height: auto;
    max-height: 350px;
    object-fit: cover;
    border-radius: var(--radius);
    background: none;
}

@media screen and (max-width: 750px) {
    .carousel__frame img {
        max-height: 300px;
    }
}
</style>
