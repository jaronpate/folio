// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2026-04-28',
    devtools: { enabled: true },

    nitro: {
        prerender: {
            autoSubfolderIndex: false,
        },
        preset: 'cloudflare_module',
        cloudflare: {
            deployConfig: true,
            wrangler: {
                d1_databases: [
                    {
                        binding: 'DB',
                        database_name: 'folio',
                        database_id: '6fd8a531-a673-479a-9501-3b406bb9f76e',
                    },
                ],
            },
        },
    },

    content: {
        database: {
            type: 'd1',
            bindingName: 'DB',
        },
    },

    app: {
        pageTransition: { name: 'page', mode: 'out-in' },
        head: {
            htmlAttrs: { lang: 'en' },
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            title: 'Jaron',
            meta: [
                {
                    name: 'description',
                    content: 'Software Engineer by trade — tinkerer by nature.',
                },
            ],
            link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
        },
    },

    modules: ['@nuxt/content', '@nuxtjs/color-mode'],
    colorMode: {
        preference: 'system', // default value of $colorMode.preference
        fallback: 'light', // fallback value if not system preference found
        globalName: '__NUXT_COLOR_MODE__',
        componentName: 'ColorScheme',
        classPrefix: '',
        classSuffix: '-mode', // Results in .dark-mode or .light-mode
        storageKey: 'color-mode',
    },
});
