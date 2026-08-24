<script lang="ts" setup>
import {
    DEFAULT_IMAGE,
    SITE_NAME,
    SITE_URL,
    personId,
    websiteId,
} from '~/utils/site';
import {
    isExternalHref,
    projectEntryHref,
    projectOgImage,
} from '~/utils/projects';

const route = useRoute();
const pageUrl = `${SITE_URL}${route.path}`;
const webpageId = `${pageUrl}#webpage`;
const workId = `${pageUrl}#work`;
const slug = computed(() => {
    const raw = Array.isArray(route.params.slug)
        ? route.params.slug.join('/')
        : String(route.params.slug ?? '');
    return raw.replace(/\/+$/, '');
});
const contentPath = computed(() => '/' + slug.value);
const folderName = computed(
    () => slug.value.split('/').filter(Boolean).at(-1) ?? slug.value,
);

const { data } = await useAsyncData(
    () => `projects:${route.path}`,
    async () => {
        const all = await queryCollection('projects').order('title', 'ASC').all();
        const visible = all.filter((page) => import.meta.dev || !page.hidden);
        const project = visible.find(
            (page) =>
                page.path === contentPath.value || page.stem === slug.value,
        );

        if (project) {
            return { kind: 'project' as const, project, pages: [] };
        }

        const prefix = contentPath.value.endsWith('/')
            ? contentPath.value
            : `${contentPath.value}/`;
        const pages = visible.filter((page) => page.path.startsWith(prefix));

        if (!pages.length) return null;
        return { kind: 'folder' as const, project: null, pages };
    },
    { watch: [() => route.path] },
);

if (!data.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' });
}

const page = computed(() => data.value?.project ?? null);
const isFolder = computed(() => data.value?.kind === 'folder');
const projectTitle = page.value?.title ?? folderName.value;
const projectDescription = page.value
    ? page.value.description
    : `Projects from ${folderName.value}`;
const liveHref = computed(() => page.value?.href ?? '');
const ogImage = projectOgImage(
    page.value?.image,
    SITE_URL,
    DEFAULT_IMAGE,
);

useSeoMeta({
    title: projectTitle,
    ogTitle: projectTitle,
    description: projectDescription,
    ogDescription: projectDescription,
    ogUrl: pageUrl,
    ogType: isFolder.value ? 'website' : 'article',
    ogImage,
    ogImageAlt: projectTitle,
    twitterCard: 'summary',
    twitterTitle: projectTitle,
    twitterDescription: projectDescription,
    twitterImage: ogImage,
});

useHead({
    link: [{ rel: 'canonical', href: pageUrl }],
    script: page.value
        ? [
              {
                  key: 'json-ld-project',
                  type: 'application/ld+json',
                  innerHTML: JSON.stringify({
                      '@context': 'https://schema.org',
                      '@graph': [
                          {
                              '@type': 'WebPage',
                              '@id': webpageId,
                              url: pageUrl,
                              name: projectTitle,
                              description: projectDescription,
                              inLanguage: 'en-US',
                              isPartOf: { '@id': websiteId },
                              breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
                              mainEntity: { '@id': workId },
                          },
                          {
                              '@type': 'CreativeWork',
                              '@id': workId,
                              url: isExternalHref(projectEntryHref(page.value))
                                  ? projectEntryHref(page.value)
                                  : pageUrl,
                              name: projectTitle,
                              description: projectDescription,
                              image: {
                                  '@type': 'ImageObject',
                                  '@id': `${pageUrl}#work-image`,
                                  url: ogImage,
                              },
                              inLanguage: 'en-US',
                              mainEntityOfPage: { '@id': webpageId },
                              author: {
                                  '@type': 'Person',
                                  '@id': personId,
                                  name: SITE_NAME,
                                  url: SITE_URL,
                              },
                              creator: {
                                  '@type': 'Person',
                                  '@id': personId,
                                  name: SITE_NAME,
                              },
                          },
                          {
                              '@type': 'BreadcrumbList',
                              '@id': `${pageUrl}#breadcrumb`,
                              itemListElement: [
                                  {
                                      '@type': 'ListItem',
                                      position: 1,
                                      name: 'Home',
                                      item: SITE_URL,
                                  },
                                  {
                                      '@type': 'ListItem',
                                      position: 2,
                                      name: 'Projects',
                                      item: `${SITE_URL}/projects`,
                                  },
                                  {
                                      '@type': 'ListItem',
                                      position: 3,
                                      name: projectTitle,
                                      item: pageUrl,
                                  },
                              ],
                          },
                      ],
                  }),
              },
          ]
        : [],
});

definePageMeta({
    layout: false,
});
</script>

<template>
    <NuxtLayout
        name="main"
        :title="page ? page.title : folderName"
        :description="projectDescription"
    >
        <article v-if="page">
            <div class="article-body">
                <p v-if="page.description">
                    <strong>{{ page.description }}</strong>
                </p>
                <ContentRenderer :value="page" />
                <p v-if="liveHref">
                    <a
                        :href="liveHref"
                        target="_blank"
                        rel="noopener"
                        >See it live ↗</a
                    >
                </p>
            </div>
        </article>
        <article v-else>
            <ProjectList :pages="data?.pages ?? []" />
        </article>
    </NuxtLayout>
</template>
