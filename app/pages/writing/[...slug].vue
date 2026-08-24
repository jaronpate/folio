<script lang="ts" setup>
import {
    DEFAULT_IMAGE,
    SITE_NAME,
    SITE_URL,
    personId,
    websiteId,
} from '~/utils/site';

const route = useRoute();
const articleUrl = `${SITE_URL}${route.path}`;
const webpageId = `${articleUrl}#webpage`;
const articleId = `${articleUrl}#article`;
const blogId = `${SITE_URL}/writing#blog`;
const slug = computed(() =>
    Array.isArray(route.params.slug)
        ? route.params.slug.join('/')
        : String(route.params.slug ?? ''),
);
const contentPath = computed(() => '/' + slug.value);
const folderName = computed(
    () => slug.value.split('/').filter(Boolean).at(-1) ?? slug.value,
);

const { data } = await useAsyncData(
    () => `writing:${route.path}`,
    async () => {
        const all = await queryCollection('writing').order('date', 'DESC').all();
        const visible = all.filter((page) => import.meta.dev || !page.hidden);
        const article = visible.find(
            (page) =>
                page.path === contentPath.value || page.stem === slug.value,
        );

        if (article) {
            return { kind: 'article' as const, article, pages: [] };
        }

        const prefix = contentPath.value.endsWith('/')
            ? contentPath.value
            : `${contentPath.value}/`;
        const pages = visible.filter((page) => page.path.startsWith(prefix));

        if (!pages.length) return null;
        return { kind: 'folder' as const, article: null, pages };
    },
    { watch: [() => route.path] },
);

if (!data.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' });
}

const page = computed(() => data.value?.article ?? null);
const isFolder = computed(() => data.value?.kind === 'folder');
const articleTitle = page.value?.title ?? folderName.value;
const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
};
const articleDescription = page.value
    ? page.value.description
    : `Writing from ${folderName.value}`;
const layoutDescription = page.value
    ? formatDate(page.value.date)
    : articleDescription;

useSeoMeta({
    title: articleTitle,
    ogTitle: articleTitle,
    description: articleDescription,
    ogDescription: articleDescription,
    ogUrl: articleUrl,
    ogType: isFolder.value ? 'website' : 'article',
    ogImage: DEFAULT_IMAGE,
    ogImageAlt: articleTitle,
    twitterCard: 'summary',
    twitterTitle: articleTitle,
    twitterDescription: articleDescription,
    twitterImage: DEFAULT_IMAGE,
    articlePublishedTime: page.value
        ? new Date(page.value.date).toISOString()
        : undefined,
    articleModifiedTime: page.value
        ? new Date(page.value.date).toISOString()
        : undefined,
    articleAuthor: page.value ? [SITE_NAME] : undefined,
});

useHead({
    link: [{ rel: 'canonical', href: articleUrl }],
    script: page.value
        ? [
              {
                  key: 'json-ld-article',
                  type: 'application/ld+json',
                  innerHTML: JSON.stringify({
                      '@context': 'https://schema.org',
                      '@graph': [
                          {
                              '@type': 'WebPage',
                              '@id': webpageId,
                              url: articleUrl,
                              name: articleTitle,
                              description: articleDescription,
                              inLanguage: 'en-US',
                              isPartOf: { '@id': websiteId },
                              breadcrumb: { '@id': `${articleUrl}#breadcrumb` },
                              mainEntity: { '@id': articleId },
                          },
                          {
                              '@type': 'Blog',
                              '@id': blogId,
                              url: `${SITE_URL}/writing`,
                              name: 'Jaron Pate Writing',
                              inLanguage: 'en-US',
                              isPartOf: { '@id': websiteId },
                              publisher: {
                                  '@type': 'Person',
                                  '@id': personId,
                                  name: SITE_NAME,
                              },
                          },
                          {
                              '@type': 'BlogPosting',
                              '@id': articleId,
                              url: articleUrl,
                              headline: articleTitle,
                              description: articleDescription,
                              datePublished: new Date(
                                  page.value.date,
                              ).toISOString(),
                              dateModified: new Date(
                                  page.value.date,
                              ).toISOString(),
                              image: {
                                  '@type': 'ImageObject',
                                  '@id': `${articleUrl}#article-image`,
                                  url: DEFAULT_IMAGE,
                              },
                              inLanguage: 'en-US',
                              isPartOf: { '@id': blogId },
                              mainEntityOfPage: { '@id': webpageId },
                              author: {
                                  '@type': 'Person',
                                  '@id': personId,
                                  name: SITE_NAME,
                                  url: SITE_URL,
                              },
                              publisher: {
                                  '@type': 'Person',
                                  '@id': personId,
                                  name: SITE_NAME,
                              },
                          },
                          {
                              '@type': 'BreadcrumbList',
                              '@id': `${articleUrl}#breadcrumb`,
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
                                      name: 'Writing',
                                      item: `${SITE_URL}/writing`,
                                  },
                                  {
                                      '@type': 'ListItem',
                                      position: 3,
                                      name: articleTitle,
                                      item: articleUrl,
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
        :description="layoutDescription"
    >
        <article v-if="page">
            <div class="article-body">
                <p v-if="page.description">
                    <strong>{{ page.description }}</strong>
                </p>
                <ContentRenderer :value="page" />
            </div>
        </article>
        <article v-else>
            <WritingList :pages="data?.pages ?? []" />
        </article>
    </NuxtLayout>
</template>
