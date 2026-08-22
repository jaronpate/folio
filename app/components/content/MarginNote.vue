<template>
    <span class="margin-note"><slot /></span>
</template>

<style scoped>
.margin-note {
    display: block;
    margin: 0.4rem 0 1rem;
    font-size: 0.85rem;
    font-style: italic;
    color: var(--muted);
    line-height: 1.45;
}

@media (min-width: 1200px) {
    .margin-note {
        position: absolute;
        left: calc(100% + 2rem);
        width: var(--note-width);
        margin: 0;
        font-size: 0.8rem;
    }
}
</style>
