import { defineContentConfig, defineCollection, z } from '@nuxt/content';
import { BANNER_ALIGNS, type BannerAlign } from './app/utils/banner';
import { BODY_FONTS, type BodyFontId } from './app/utils/fonts';
import { BG_THEMES, type BgThemeId } from './app/utils/themes';

const bgThemeIds = BG_THEMES.map((theme) => theme.id) as [
    BgThemeId,
    ...BgThemeId[],
];
const bgThemeSchema = z.enum(bgThemeIds);

const bodyFontIds = BODY_FONTS.map((font) => font.id) as [
    BodyFontId,
    ...BodyFontId[],
];
const bodyFontSchema = z.enum(bodyFontIds);

const bannerAligns = [...BANNER_ALIGNS] as [BannerAlign, ...BannerAlign[]];
const bannerAlignSchema = z.enum(bannerAligns);

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
                /** Duration in seconds so the player can show length without fetching audio. */
                audioDuration: z.number().optional(),
                audioVtt: z.string().optional(),
                /** Square image for Now Playing / compact share cards. */
                logo: z.string().optional(),
                /** Wide image for the page header and link previews. */
                banner: z.string().optional(),
                /** Crop of the header banner. Defaults to center. */
                bannerAlign: bannerAlignSchema.optional(),
                /** Open this page in a theme without changing the visitor's saved theme. */
                theme: bgThemeSchema.optional(),
                /** Open this page in a font. Other pages keep the site font. */
                font: bodyFontSchema.optional(),
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
                /** Duration in seconds so the player can show length without fetching audio. */
                audioDuration: z.number().optional(),
                audioVtt: z.string().optional(),
                /** Square image for Now Playing / compact share cards. */
                logo: z.string().optional(),
                /** Wide image for the page header and link previews. */
                banner: z.string().optional(),
                /** Crop of the header banner. Defaults to center. */
                bannerAlign: bannerAlignSchema.optional(),
                /** Open this page in a theme without changing the visitor's saved theme. */
                theme: bgThemeSchema.optional(),
                /** Open this page in a font. Other pages keep the site font. */
                font: bodyFontSchema.optional(),
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
                /** Open this page in a font. Other pages keep the site font. */
                font: bodyFontSchema.optional(),
            }),
        }),
    },
});
