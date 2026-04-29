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
    link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: '',
        },
        {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Baskervville:ital,wght@0,400..700;1,400..700&display=swap',
        },
        {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap',
        },
    ],
});
</script>

<template>
    <div>
        <svg width="0" height="0" aria-hidden="true" style="position: absolute">
            <filter id="grainy" x="0" y="0" width="100%" height="100%">
                <feTurbulence
                    type="fractalNoise"
                    baseFrequency=".85"
                    numOctaves="3"
                ></feTurbulence>
                <feColorMatrix type="saturate" values="0"></feColorMatrix>
                <feBlend mode="multiply" in="SourceGraphic"></feBlend>
            </filter>
        </svg>
        <div class="page-wrapper">
            <div class="trace left"></div>

            <div class="trace right"></div>

            <header class="header">
                <h1 class="name">Jaron</h1>
                <p class="title">
                    Software Engineer by trade &mdash; builder by nature.
                </p>
            </header>

            <main>
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
                                Discord bot SDK inspired by webserver
                                architecture.
                            </p>
                        </a>
                        <a
                            href="https://github.com/jaronpate/rift-buddy"
                            target="_blank"
                            class="project"
                        >
                            <h3 class="project__title">Rune Buddy</h3>
                            <p class="project__description">
                                League of Legends runepage manager. Save &
                                organise your pages for free.
                            </p>
                        </a>
                    </div>
                </section>
                <section class="about">
                    <h5>About</h5>
                    <div class="section__content">
                        <p>
                            I work across the full stack; backend, frontend, and
                            the product decisions in between. My favorite side
                            projects are ones that bring me new skills. Even
                            better are ones where I solve a problem or build a
                            tool I can use. I'm always open to interesting work
                            and conversations.
                        </p>
                    </div>
                </section>
                <!-- <section class="photos">
                    <h5>Photos</h5>
                    <div class="section__content">
                        <div class="photo-grid">
                            <div class="photo-grid__item">
                                <div class="photo__image">
                                    <img
                                        src="/photography/underground.jpg"
                                        alt="London Underground Sign"
                                    />
                                </div>
                                <div class="photo__overlay">
                                    <p>London, UK</p>
                                    <p>2026</p>
                                </div>
                            </div>
                            <div class="photo-grid__item">
                                <div class="photo__image">
                                    <img
                                        src="/photography/london_porsche.jpg"
                                        alt="London Porsche"
                                    />
                                </div>
                                <div class="photo__overlay">
                                    <p>London, UK</p>
                                    <p>2025</p>
                                </div>
                            </div>
                            <div class="photo-grid__item">
                                <div class="photo__image">
                                    <img
                                        src="/photography/austin_parking.jpg"
                                        alt="Austin Parking Sign"
                                    />
                                </div>
                                <div class="photo__overlay">
                                    <p>Austin, TX</p>
                                    <p>2024</p>
                                </div>
                            </div>
                            <div class="photo-grid__item">
                                <div class="photo__image">
                                    <img
                                        src="/photography/athens_red_scooter.jpg"
                                        alt="Athens Red Scooter"
                                    />
                                </div>
                                <div class="photo__overlay">
                                    <p>Athens, Greece</p>
                                    <p>2026</p>
                                </div>
                            </div>
                            <div class="photo-grid__item">
                                <div class="photo__image">
                                    <img
                                        src="/photography/athens_subway.jpg"
                                        alt="Athens Subway"
                                    />
                                </div>
                                <div class="photo__overlay">
                                    <p>Athens, Greece</p>
                                    <p>2026</p>
                                </div>
                            </div>
                            <div class="photo-grid__item">
                                <div class="photo__image">
                                    <img
                                        src="/photography/athens_sunset.jpg"
                                        alt="Athens Sunset"
                                    />
                                </div>
                                <div class="photo__overlay">
                                    <p>Athens, Greece</p>
                                    <p>2026</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section> -->
                <div style="flex: 1"></div>
            </main>

            <footer class="footer">
                <div class="footer-upper">
                    <div class="flex-center">
                        <p>
                            <a class="punch-link" href="mailto:yo@jp.wtf"
                                >Say hi.</a
                            >
                        </p>
                        <div class="flex-ff"></div>
                        <p style="text-align: right">
                            Let's make something cool.
                        </p>
                    </div>
                </div>
                <div class="footer-lower">
                    <div class="flex-center">
                        <p style="text-align: right">Est. 2003</p>
                        <div class="flex-ff"></div>
                        <p style="text-align: right">Austin, TX</p>
                    </div>
                </div>
            </footer>
        </div>
    </div>
</template>

<style>
.page-wrapper {
    --main-width: 50vw;
    width: var(--main-width);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
}

main {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.trace {
    position: absolute;
    top: 0;
    height: 100%;
    width: 1px;
    background: var(--muted);
    z-index: 1;
}

.trace.left {
    left: 0;
}

.trace.right {
    right: 0;
}

svg[height='0'] {
    position: fixed;
}

.name {
    font-size: 4rem;
    font-weight: 400;
    line-height: 1.2;
    margin: 0;
}

.title {
    font-weight: 300;
    margin: 0;
    font-style: italic;
}

.header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;

    border-top: 1px solid var(--muted);
    border-bottom: 1px solid var(--muted);
    padding: 2rem;
    color: var(--bg);

    margin-top: 8vh;
    position: relative;
    isolation: isolate;
}

.header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('/blend.jpeg');
    background-size: cover;
    background-position: left top;
    background-repeat: no-repeat;
    filter: url(#grainy);
    z-index: -1;
}

.footer-upper {
    border-top: 1px solid var(--muted);
    border-bottom: 1px solid var(--muted);
    padding: 2rem;
    color: var(--bg);
    min-height: 10vh;
    position: relative;
    isolation: isolate;
}

.footer-upper::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('/blend.jpeg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: url(#grainy);
    z-index: -1;
}

.footer-lower {
    padding: 1rem;
    height: 8vh;
    font-size: small;
}

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

@media (max-width: 1024px) {
    .page-wrapper {
        --main-width: 80vw;
    }
}

@media (max-width: 768px) {
    .page-wrapper {
        --main-width: 100vw;
    }

    .trace {
        display: none;
    }

    .photo-grid {
        grid-template-columns: 1fr;
    }
}
</style>
