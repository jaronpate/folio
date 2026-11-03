import { defineContentConfig, defineCollection, z } from '@nuxt/content';
import { BG_THEMES, type BgThemeId } from './app/utils/themes';

const bgThemeIds = BG_THEMES.map((theme) => theme.id) as [
    BgThemeId,
    ...BgThemeId[],
];
const bgThemeSchema = z.enum(bgThemeIds);

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
                date: z.string(),
                description: z.string(),
                hidden: z.boolean().optional(),
                audio: z.string().optional(),
                audioTitle: z.string().optional(),
                audioDownload: z.boolean().optional(),
                audioVtt: z.string().optional(),
                /** Square image for Now Playing / compact share cards. */
                logo: z.string().optional(),
                /** Wide image for link previews. */
                banner: z.string().optional(),
                /** Open this page in a theme without changing the visitor's saved theme. */
                theme: bgThemeSchema.optional(),
            }),
        }),
        dnd: defineCollection({
            type: 'page',
            source: {
                include: 'dnd/**/*.md',
                prefix: '',
            },
            schema: z.object({
                title: z.string(),
                date: z.string(),
                description: z.string(),
                hidden: z.boolean().optional(),
                audio: z.string().optional(),
                audioTitle: z.string().optional(),
                audioDownload: z.boolean().optional(),
                audioVtt: z.string().optional(),
                /** Square image for Now Playing / compact share cards. */
                logo: z.string().optional(),
                /** Wide image for link previews. */
                banner: z.string().optional(),
                /** Open this page in a theme without changing the visitor's saved theme. */
                theme: bgThemeSchema.optional(),
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
                date: z.string().optional(),
                image: z.string().optional(),
                /** Open this page in a theme without changing the visitor's saved theme. */
                theme: bgThemeSchema.optional(),
            }),
        }),
    },
});
