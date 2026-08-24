<script setup lang="ts">
import {
    DEFAULT_DESCRIPTION,
    DEFAULT_IMAGE,
    DEFAULT_TITLE,
    SITE_URL,
    personId,
    personSchema,
    websiteId,
} from '~/utils/site';

const webpageId = `${SITE_URL}/#homepage`;

useSeoMeta({
    title: DEFAULT_TITLE,
    ogTitle: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    ogDescription: DEFAULT_DESCRIPTION,
    ogUrl: SITE_URL,
    ogType: 'profile',
    ogImage: DEFAULT_IMAGE,
    ogImageAlt: DEFAULT_TITLE,
    twitterCard: 'summary',
    twitterTitle: DEFAULT_TITLE,
    twitterDescription: DEFAULT_DESCRIPTION,
    twitterImage: DEFAULT_IMAGE,
});

useHead({
    link: [{ rel: 'canonical', href: SITE_URL }],
});

const selectedWorks = [
    {
        title: 'Edlink',
        description:
            "I built many things I'm proud of at Edlink. Notably, I designed and shipped the internal billing platform for ~150 clients, a flat file ingestion engine that enabled importing of arbitrary data, client-embedded UI widgets, user onboarding flows, and a secure sandbox for running untrusted code with a live data-preview service.",
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
        // href: 'https://unicord.hat.fish/',
        href: '/projects/unicord',
        description: 'Discord bot SDK inspired by webserver architecture.',
    },
    {
        title: 'Mystwright',
        href: 'https://mystwright.com/',
        description:
            'An AI-driven mystery detective game. Generate, investigate, solve.',
    },
    {
        title: 'Rift Buddy',
        href: 'https://github.com/jaronpate/rift-buddy',
        description:
            'Save, edit, and hot-swap rune pages alongside League of Legends.',
    },
];

useHead({
    script: [
        {
            key: 'json-ld-homepage',
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': [
                    {
                        '@type': 'ProfilePage',
                        '@id': webpageId,
                        url: SITE_URL,
                        name: DEFAULT_TITLE,
                        description: DEFAULT_DESCRIPTION,
                        inLanguage: 'en-US',
                        isPartOf: { '@id': websiteId },
                        about: { '@id': personId },
                        // Google requires mainEntity to be an inline Person with name —
                        // a bare @id reference fails Rich Results validation.
                        mainEntity: personSchema(),
                        primaryImageOfPage: {
                            '@type': 'ImageObject',
                            url: DEFAULT_IMAGE,
                        },
                    },
                    {
                        '@type': 'ItemList',
                        '@id': `${webpageId}#selected-work`,
                        name: 'Selected work',
                        itemListElement: selectedWorks.map((work, index) => ({
                            '@type': 'ListItem',
                            position: index + 1,
                            item: {
                                '@type': 'CreativeWork',
                                name: work.title,
                                description: work.description,
                                url: work.link,
                                creator: { '@id': personId },
                            },
                        })),
                    },
                    {
                        '@type': 'ItemList',
                        '@id': `${webpageId}#projects`,
                        name: 'Projects',
                        itemListElement: projects.map((project, index) => ({
                            '@type': 'ListItem',
                            position: index + 1,
                            item: {
                                '@type': 'CreativeWork',
                                name: project.title,
                                description: project.description,
                                url: project.href,
                                author: { '@id': personId },
                            },
                        })),
                    },
                ],
            }),
        },
    ],
});

definePageMeta({
    layout: false,
});
</script>

<template>
    <NuxtLayout name="main"
    title="Hey, I'm Jaron"
    description="I build software for a living, but also other things">
        <article>
            <h3>Selected Work</h3>
            <template v-for="work in selectedWorks" :key="work.title">
                <p>
                    <a :href="work.link" target="_blank" rel="noopener">{{
                        work.title
                    }}</a>:
                    {{ work.description }}
                </p>
                <div class="work-carousel">
                    <Carousel :images="work.images" />
                </div>
            </template>

            <h3>Projects</h3>
            <ul>
                <li v-for="project in projects" :key="project.href">
                    <p>
                        <a :href="project.href">{{
                            project.title
                        }}</a>:
                        {{ project.description }}
                    </p>
                </li>
            </ul>

            <h3>About</h3>
            <p>
                I left school, my job, and moved to Austin in 2022 to write code
                full time. That was definitely one of the best and most life
                changing decisions I've ever made. I've learned a lot since then
                and <em>still</em> have much more to learn.
            </p>
            <p>
                These days I build things because I find joy in making something
                someone else really enjoys using. I get excited about reaching a
                level of polish that users don't even notice.
            </p>
            <p>
                In a time where code is cheap I pride myself in taste and
                execution. The best sticking point (in my limited opinion so far)
                is the way using your product <em>feels</em>. So I want
                everything I make to simply <em>feel</em> the best to use.
            </p>
            <p>
                If you want to build something cool or connect
                <a href="mailto:yo@jp.wtf">hit me up</a> — we'll grab a coffee or
                beer if you're in Austin! I still dont know enough people to form
                a band yet ;)
            </p>
        </article>
    </NuxtLayout>
</template>

<style scoped>
.work-carousel {
    margin: 1.25rem 0 1.75rem;
}

.work-carousel :deep(.carousel) {
    margin: 0;
}
</style>
