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
                hidden: z.boolean().optional(),
            }),
        }),
        projects: defineCollection({
            type: 'page',
            source: {
                include: 'projects/**/*.md',
                prefix: '',
            },
            schema: z.object({
                title: z.string(),
                description: z.string(),
                href: z.string().optional(),
                hidden: z.boolean().optional(),
                image: z.string().optional(),
            }),
        }),
    },
});
