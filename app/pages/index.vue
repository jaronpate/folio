<script lang="ts">
// module-scoped so the reveal only plays once per visit
let sectionsRevealed = false;
</script>

<script setup lang="ts">
import { ref } from 'vue';

useSeoMeta({
    title: "Hey, I'm Jaron.",
    ogTitle: "Hey, I'm Jaron.",
    description:
        'Software Engineer. I build things to solve problems from the ground up.',
    ogDescription:
        'Software Engineer. I build things to solve problems from the ground up.',
    ogUrl: useRequestURL().href,
});

const titles = [
    "Hey, I'm Jaron.",
    'Nice to meet you.',
    'Welcome.',
    'Willkommen.',
    'Bienvenue.',
];

const selectedWorks = [
    {
        title: 'Edlink',
        description:
            "I built many things I'm proud of at Edlink. Notably, I designed and shipped Edlink’s internal billing platform for ~150 clients, a flat file ingestion engine that enabled arbitrary data mapping, client-embedded UI widgets, user onboarding flows, and a secure sandbox for running untrusted code with a live data-preview service.",
        link: 'https://ed.link',
        images: [
            {
                src: '/work/edlink/embedded-onboarding.gif',
                alt: 'Embedded Onboarding',
            },
            {
                src: '/work/edlink/authentication-widget.gif',
                alt: 'Auth Widget',
            },
            {
                src: '/work/edlink/integration-sharing-rules-widget.png',
                alt: 'Data Sharing Editor Widget',
            },
            {
                src: '/work/edlink/billing-overview.png',
                alt: 'Billing Overview',
            },
            {
                src: '/work/edlink/invoice-sheet.png',
                alt: 'Invoice View',
            },
            {
                src: '/work/edlink/add-payment-method.png',
                alt: 'Add Payment Method',
            },
            {
                src: '/work/edlink/onboarding-select-provider.png',
                alt: 'Provider Selection',
            },
            {
                src: '/work/edlink/onboarding-edit-source.png',
                alt: 'Source Creation',
            },
            {
                src: '/work/edlink/onboarding-start.png',
                alt: 'Onboarding Start',
            },
            {
                src: '/work/edlink/custom-code-editor.png',
                alt: 'Custom Code Editor',
            },
            {
                src: '/work/edlink/edit-licensing-rules.png',
                alt: 'Licensing Editor',
            },
            {
                src: '/work/edlink/materialization-preview.png',
                alt: 'Pending Data Change Preview',
            },
        ],
    },
];

const projects = [
    {
        title: 'Unicord',
        href: 'https://unicord.hat.fish/',
        description: 'Discord bot SDK inspired by webserver architecture.',
    },
    {
        title: 'Mystwright',
        href: 'https://mystwright.com/',
        description:
            'An AI-driven mystery detective game. Generate, investigate, solve.',
    },
    {
        title: 'Rune Buddy',
        href: 'https://github.com/jaronpate/rift-buddy',
        description:
            'League of Legends runepage manager. Save & organise your pages for free.',
    },
];

const photos = [
    {
        src: '/photography/athens_red_scooter.jpg',
        alt: 'Red scooter in Athens',
        location: 'Athens',
        year: '2026',
    },
    {
        src: '/photography/athens_subway.jpg',
        alt: 'Athens metro station',
        location: 'Athens',
        year: '2026',
    },
    {
        src: '/photography/athens_sunset.jpg',
        alt: 'Athens at sunset',
        location: 'Athens',
        year: '2026',
    },
    {
        src: '/photography/london_porsche.jpg',
        alt: 'Porsche shop in London',
        location: 'London',
        year: '2025',
    },
    {
        src: '/photography/underground.jpg',
        alt: 'Entrace to the London underground',
        location: 'London',
        year: '2026',
    },
    {
        src: '/photography/austin_parking.jpg',
        alt: 'Parking garage in Austin',
        location: 'Austin',
        year: '2024',
    },
];

const pageTitle = ref(titles[0]);

const rotateTitle = () => {
    setTimeout(() => {
        const i = titles.findIndex((t) => t === pageTitle.value);
        pageTitle.value = titles[i + 1] ?? titles[0] ?? 'Oops!';
        rotateTitle();
    }, 2000);
};

definePageMeta({
    layout: false,
});

const { $gsap } = useNuxtApp();
const pageRoot = ref<HTMLElement | null>(null);

onMounted(() => {
    rotateTitle();

    useHead({
        title: pageTitle,
    });

    if (!$gsap || !pageRoot.value || sectionsRevealed) return;
    sectionsRevealed = true;

    const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
    ).matches;

    const ctx = $gsap.context(() => {
        if (reduced) return;

        // sections in view on load are revealed by the layout's intro;
        // below-the-fold sections rise in as they enter the viewport
        $gsap.utils.toArray<HTMLElement>('main section').forEach((el) => {
            const inView = el.getBoundingClientRect().top < window.innerHeight;
            if (inView) return;

            $gsap.from(el, {
                autoAlpha: 0,
                y: 24,
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 92%',
                },
            });
        });
    }, pageRoot.value);

    onBeforeUnmount(() => ctx.revert());
});
</script>

<template>
    <div ref="pageRoot">
        <NuxtLayout name="main">
            <section class="selected-work">
                <h5>Selected Work</h5>
                <div class="section__content">
                    <a
                        v-for="work in selectedWorks"
                        :key="work.title"
                        class="work"
                        :href="work.link"
                        target="_blank"
                    >
                        <h3 class="work__title">{{ work.title }}</h3>
                        <p class="work__description">
                            {{ work.description }}
                        </p>
                        <div class="work__images">
                            <figure
                                v-for="image in work.images"
                                :key="image.src"
                                class="work__image"
                            >
                                <img :src="image.src" :alt="image.alt" />
                            </figure>
                        </div>
                    </a>
                </div>
            </section>
            <section class="projects">
                <h5>Projects</h5>
                <div class="section__content">
                    <a
                        v-for="project in projects"
                        :key="project.href"
                        :href="project.href"
                        target="_blank"
                        class="project"
                    >
                        <h3 class="project__title">{{ project.title }}</h3>
                        <p class="project__description">
                            {{ project.description }}
                        </p>
                    </a>
                </div>
            </section>
            <section class="about">
                <h5>About</h5>
                <div class="section__content">
                    <p>I build things to solve problems from the ground up.</p>
                    <p>
                        I left school and my job at Chick-fil-A in 2022 to write
                        code full time. It's definitely one of the best
                        decisions I've ever made. I've learned a lot since then
                        and
                        <em>still</em> much to learn and build.
                    </p>
                    <p>
                        If you want to build something cool or connect hit me up
                        — we'll grab a coffee or beer in you're in Austin! I
                        still dont know enough people to form a band yet ;)
                    </p>
                </div>
            </section>
            <!-- <section class="photos">
                <h5>Photos</h5>
                <div class="section__content">
                    <div class="photo-grid">
                        <div
                            v-for="photo in photos"
                            :key="photo.src"
                            class="photo-grid__item"
                        >
                            <div class="photo__image">
                                <img :src="photo.src" :alt="photo.alt" />
                            </div>
                            <div class="photo__overlay">
                                <p>{{ photo.location }}</p>
                                <p>{{ photo.year }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section> -->
        </NuxtLayout>
    </div>
</template>

<style scoped>
section {
    margin-top: 2rem;
}

section > .section__content {
    padding: 0 2rem;
}

/* section:not(:has(h5)) > .section__content {
    padding: 2rem;
} */

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

.work {
}

.work__images {
    /*display: flex;
    flex-wrap: no-wrap;
    align-items: center;
    justify-content: center;*/
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    gap: var(--gap);
    overflow-x: auto;
    overflow-y: hidden;
    margin-top: var(--gap);
}

.work__image {
    --dot-size: 6%;

    margin: 0;
    /*padding: calc(var(--gap) * 2) var(--gap) var(--gap);*/
    padding: var(--gap);
    flex-shrink: 0;
    border-radius: var(--radius);
    background-image: radial-gradient(
        circle at 4px 4px,
        var(--dot-color) var(--dot-size),
        transparent calc(var(--dot-size) + 1%)
    );

    background-position: 4px 4px;
    background-size: 12px 12px;
    background-repeat: repeat;
    background-color: var(--bg-secondary);

    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: var(--gap);
}

.work__image img {
    border-radius: var(--radius);
    object-fit: cover;
    max-height: 350px;
}

@media screen and (max-width: 750px) {
    .work__image img {
        max-height: 300px;
    }
}

.work__image figcaption {
    font-size: 0.6rem;
    line-height: 1;
    font-family: var(--font-plain);
    background: var(--bg-secondary);
    border-radius: 2px;
    padding: 3px 4px;
    background: var(--dot-color);
    /*border: 1px solid var(--dot-color);*/

    display: flex;
    align-items: center;
    justify-content: center;
}

.project,
.work {
    /*border-bottom: 1px solid var(--muted);*/
    padding: var(--gap) 0;
    display: block;
    text-decoration: none;
    color: inherit;
}

.work {
    border: 0;
}

.project:first-of-type,
.work:first-of-type {
    padding-top: 0;
}

.project:last-of-type,
.work:last-of-type {
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

.project__title,
.work__title {
    margin: 0;
    font-weight: 400;
    margin-bottom: calc(var(--gap) * 0.5);
}

.project__title::after,
.work__title::after {
    content: '↗';
    position: relative;
    display: inline-block;
    margin-left: 0.4em;
    font-size: 0.75em;
    opacity: 0;
    vertical-align: center;
    transform: translate(-6px, 6px);
    transition:
        opacity 0.25s ease,
        transform 0.25s ease;
}

.project:hover .project__title::after,
.work:hover .work__title::after {
    opacity: 1;
    transform: translate(0, 0);
}

.project__description,
.work__description {
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
    color: var(--color-white-500);
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
    font-size: small;
}

.about p:last-child {
    margin: 0;
}

@media (max-width: 768px) {
    .photo-grid {
        grid-template-columns: 1fr;
    }
}
</style>
