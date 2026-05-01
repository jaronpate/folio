<script setup lang="ts">
import { ref } from 'vue';

const titles = [
    "Hello, I'm Jaron.",
    'Nice to meet you.',
    'Welcome.',
    'Willkommen.',
    'Bienvenue.',
];

const pageTitle = ref(titles[0]);

const rotateTitle = () => {
    setTimeout(() => {
        const i = titles.findIndex((t) => t === pageTitle.value);
        pageTitle.value = titles[i + 1] ?? titles[0] ?? 'Oops!';
        rotateTitle();
    }, 2000);
};

rotateTitle();

useHead({
    title: pageTitle,
});

definePageMeta({
    layout: 'main',
});
</script>

<template>
    <NuxtLayout name="main">
        <section class="projects">
            <h5>Selected Work</h5>
            <div class="section__content">
                <a
                    href="https://mystwright.com/"
                    target="_blank"
                    class="project"
                >
                    <h3 class="project__title">Mystwright</h3>
                    <p class="project__description">
                        An AI-driven mystery detective game. Generate,
                        investigate, solve.
                    </p>
                </a>
                <a
                    href="https://unicord.hat.fish/"
                    target="_blank"
                    class="project"
                >
                    <h3 class="project__title">Unicord</h3>
                    <p class="project__description">
                        Discord bot SDK inspired by webserver architecture.
                    </p>
                </a>
                <a
                    href="https://github.com/jaronpate/rift-buddy"
                    target="_blank"
                    class="project"
                >
                    <h3 class="project__title">Rune Buddy</h3>
                    <p class="project__description">
                        League of Legends runepage manager. Save & organise your
                        pages for free.
                    </p>
                </a>
            </div>
        </section>
        <section class="about">
            <h5>About</h5>
            <div class="section__content">
                <p>
                    I work across the full stack; backend, frontend, and the
                    product decisions in between. My favorite side projects are
                    ones that bring me new skills. Even better are ones where I
                    solve a problem or build a tool I can use. I'm always open
                    to interesting work and conversations.
                </p>
            </div>
        </section>
    </NuxtLayout>
</template>

<style>
section {
    margin-top: 2rem;
}

section > .section__content {
    padding: 0 2rem;
}

section > h5::before {
    content: '';
    height: 1px;
    background: var(--muted);
    order: 0;
    width: 1rem;
}

section > h5::after {
    content: '';
    height: 1px;
    background: var(--muted);
    flex-grow: 1;
}

section > h5 {
    font-weight: 400;
    font-style: italic;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0;
}

section:last-of-type {
    margin-bottom: 2rem;
}

.project {
    border-bottom: 1px solid var(--muted);
    padding: 2rem 0;
    display: block;
    text-decoration: none;
    color: inherit;
}

.project:first-of-type {
    padding-top: 0;
}

.project:last-of-type {
    padding-bottom: 0;
}

.project:last-child {
    border-bottom: none;
}

.project:hover > .project__title {
    text-decoration: underline;
    text-underline-offset: 4px;
    font-style: italic;
    font-family: var(--font-hover);
}

.project__title {
    margin: 0;
    font-weight: 400;
}

.project__description {
    margin: 0;
    font-size: small;
    font-weight: 400;
    font-style: italic;
    color: var(--muted);
}

.photo-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

.photo-grid__item {
    cursor: pointer;
    position: relative;
    aspect-ratio: 1 / 1;
}

.photo-grid__item:hover > .photo__overlay {
    opacity: 1;
}

.photo__image {
    width: 100%;
    height: 100%;
}

.photo__image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.photo__overlay {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    color: var(--bg);
    z-index: 2;
    transition: opacity 0.2s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.photo__overlay p {
    font-weight: 500;
    margin: 0;
}

.photo__overlay p:nth-child(2) {
    font-weight: 300;
    font-style: italic;
}

.about p {
    margin: 0;
}

@media (max-width: 768px) {
    .photo-grid {
        grid-template-columns: 1fr;
    }
}
</style>
