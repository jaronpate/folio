import { BODY_FONT_STORAGE_KEY, DEFAULT_BODY_FONT } from './app/utils/fonts';
import { bgThemeBootScript } from './app/utils/themes';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2026-04-28',
    devtools: { enabled: true },

    routeRules: {
        '/dnd/2026/oct-25-30': {
            redirect: {
                to: '/dnd/2026/broindor-oct-25-30',
                statusCode: 301,
            },
        },
    },

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
                    innerHTML: bgThemeBootScript({
                        storageKey: BODY_FONT_STORAGE_KEY,
                        fallback: DEFAULT_BODY_FONT,
                    }),
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
