import { defineContentConfig, defineCollection } from '@nuxt/content';

export default defineContentConfig({
    collections: {
        writing: defineCollection({
            type: 'page',
            source: 'writing/**/*.md',
        }),
    },
});
