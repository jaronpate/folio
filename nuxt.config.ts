// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2026-04-28',
    devtools: { enabled: true },

    nitro: {
        preset: 'node-server',
        prerender: {
            autoSubfolderIndex: false,
            routes: ['/styleguide'],
        },
    },

    content: {
        database: {
            type: 'sqlite',
            // The server creates this from the content dump on startup.
            filename: '/tmp/contents.sqlite',
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
                    innerHTML: `(function(){try{var t=localStorage.getItem('bg-theme')||'dusk';var f=localStorage.getItem('body-font')||'plantin';var m=t==='paper'?'light-mode':'dark-mode';document.documentElement.classList.add('theme-'+t,'font-'+f,m,'is-loading');}catch(e){document.documentElement.classList.add('theme-dusk','font-plantin','dark-mode','is-loading');}setTimeout(function(){document.documentElement.classList.remove('is-loading')},4000);})();`,
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
