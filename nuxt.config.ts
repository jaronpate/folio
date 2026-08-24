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
        build: {
            markdown: {
                highlight: {
                    theme: {
                        default: 'github-light',
                        'light-mode': 'github-light',
                        'dark-mode': 'github-dark',
                    },
                },
            },
        },
    },

    css: ['~/assets/css/main.css'],

    app: {
        head: {
            htmlAttrs: { lang: 'en' },
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            title: 'Jaron',
            meta: [
                {
                    name: 'description',
                    content:
                        // 'Developer. Reformed Rust enjoyer, Golang padawan.',
                        'I build software for a living, but also other things',
                },
            ],
            link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
            script: [
                {
                    innerHTML: `(function(){try{var t=localStorage.getItem('bg-theme')||'dusk';var f=localStorage.getItem('body-font')||'plantin';document.documentElement.classList.add('theme-'+t,'font-'+f);}catch(e){document.documentElement.classList.add('theme-dusk','font-plantin');}})();`,
                    tagPosition: 'head',
                },
            ],
        },
    },

    modules: ['@nuxt/content', '@nuxtjs/color-mode'],
    colorMode: {
        preference: 'dark',
        fallback: 'dark',
        classPrefix: '',
        classSuffix: '-mode',
        storageKey: 'color-mode',
    },
});
