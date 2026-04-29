// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2026-04-28',
    devtools: { enabled: true },
    nitro: {
        prerender: {
            autoSubfolderIndex: false,
        },
    },
    app: {
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
});
