import { defineContentConfig, defineCollection, z } from '@nuxt/content';

export default defineContentConfig({
    collections: {
        writing: defineCollection({
            type: 'page',
            source: {
                include: 'writing/**/*.md',
                prefix: '',
            },
            schema: z.object({
                title: z.string(),
                date: z.coerce.date(),
                description: z.string(),
            }),
        }),
    },
});
