<script setup lang="ts">
withDefaults(
    defineProps<{
        title?: string;
        description?: string;
    }>(),
    {
        title: "Hey, I'm Jaron.",
        description: 'Software engineer by trade — builder by nature.',
    },
);

const { id, themes, setTheme } = useBgTheme();
const { id: fontId, fonts, setFont } = useBodyFont();

const onThemeChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value;
    const next = themes.find((theme) => theme.id === value);
    if (next) setTheme(next.id);
};

const onFontChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value;
    const next = fonts.find((font) => font.id === value);
    if (next) setFont(next.id);
};
</script>

<template>
    <div class="site">
        <header class="hero">
            <div class="hero__inner">
                <div class="hero__nav">
                    <NuxtLink to="/" class="wordmark" aria-label="Home">
                        @jaronpate
                    </NuxtLink>
                    <nav class="site-nav">
                        <NuxtLink to="/writing">Writing</NuxtLink>
                        <a href="https://github.com/jaronpate">GitHub</a>
                        <label class="theme-picker">
                            <span class="visually-hidden">Background</span>
                            <select
                                class="theme-select"
                                :value="id"
                                @change="onThemeChange"
                            >
                                <option
                                    v-for="theme in themes"
                                    :key="theme.id"
                                    :value="theme.id"
                                >
                                    {{ theme.label }}
                                </option>
                            </select>
                        </label>
                        <!-- <label class="theme-picker">
                            <span class="visually-hidden">Font</span>
                            <select
                                class="theme-select"
                                :value="fontId"
                                @change="onFontChange"
                            >
                                <option
                                    v-for="font in fonts"
                                    :key="font.id"
                                    :value="font.id"
                                >
                                    {{ font.label }}
                                </option>
                            </select>
                        </label> -->
                    </nav>
                </div>
                <h1 class="hero__title">{{ title }}</h1>
                <p v-if="description" class="hero__sub">{{ description }}</p>
            </div>
        </header>

        <div class="page-body">
            <slot />
        </div>

        <footer class="site-footer">
            <a href="mailto:yo@jp.wtf">yo@jp.wtf</a>
            <div class="flex-ff"></div>
            <span>Est. 2003</span>
            <span>Austin, TX</span>
        </footer>
    </div>
</template>

<style scoped>
.site {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.page-body {
    flex: 1;
    padding-top: 2.25rem;
}

.hero {
    --hero-text: #fbfbf7;
    position: relative;
    isolation: isolate;
    color: var(--hero-text);
    padding: 1.25rem 0 3rem;
}

.hero::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
        linear-gradient(rgba(12, 12, 18, 0.1), rgba(12, 12, 18, 0.18)),
        url('~/assets/images/blend.jpeg') center / cover no-repeat;
}

.hero__inner {
    width: var(--col);
    margin-left: var(--col-left);
}

.hero__nav {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-bottom: 3.5rem;
    font-family: var(--font-plain);
    font-size: 0.8rem;
}

.wordmark,
.site-nav a,
.theme-select {
    color: var(--hero-text);
}

.wordmark {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    text-decoration: none;
    font-family: var(--font-mono);
    font-size: 1.15rem;
    font-weight: 400;
    line-height: 1;
}

.wordmark:hover,
.wordmark.router-link-active {
    color: var(--hero-text);
    text-decoration: none;
    opacity: 0.75;
}

.site-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: auto;
}

.site-nav a:hover,
.site-nav a.router-link-active {
    color: var(--hero-text);
    opacity: 0.7;
}

.theme-picker {
    display: inline-flex;
    align-items: center;
}

.theme-select {
    appearance: none;
    background-color: rgba(255, 255, 255, 0.14);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath fill='%23fbfbf7' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.55em center;
    background-size: 0.5em;
    border: 1px solid rgba(251, 251, 247, 0.35);
    border-radius: 4px;
    cursor: pointer;
    font-family: var(--font-plain);
    font-size: 0.8rem;
    line-height: 1;
    padding: 0.35em 1.55em 0.35em 0.65em;
}

.theme-select:hover {
    background-color: rgba(255, 255, 255, 0.22);
}

.theme-select option {
    color: #1a1a1a;
    background: #fff;
}

.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.hero__title {
    margin: 0;
    font-size: 2.75rem;
    font-weight: 400;
    line-height: 1.15;
}

.hero__sub {
    margin: 0.6rem 0 0;
    font-weight: var(--body-weight);
    font-style: italic;
    font-size: 1.05rem;
    color: rgba(251, 251, 247, 0.88);
}

.site-footer {
    --flare-length: 1.125rem;
    --flare-spread: 1.125rem;
    --flare-overhang: 1.5rem;

    position: relative;
    display: flex;
    align-items: baseline;
    gap: 1rem;
    width: var(--col);
    margin-top: 2rem;
    margin-left: var(--col-left);
    margin-right: auto;
    padding: calc(var(--flare-spread) + 0.45rem) 0 0.85rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--muted);
}

.site-footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: calc(-1 * var(--flare-overhang));
    right: calc(-1 * var(--flare-overhang));
    height: var(--flare-spread);
    background-color: var(--muted);
    pointer-events: none;
    -webkit-mask:
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 16' preserveAspectRatio='none' fill='none'%3E%3Cpath d='M20 8H10M10 8C5 8 2.5 4.5 1 2M10 8C5 8 2.5 11.5 1 14' stroke='black' stroke-width='1' stroke-linecap='round' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E")
            left center / var(--flare-length) 100% no-repeat,
        linear-gradient(#000, #000) center /
            calc(100% - var(--flare-length) * 1.55) 1px no-repeat,
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 16' preserveAspectRatio='none' fill='none'%3E%3Cpath d='M0 8H10M10 8C15 8 17.5 4.5 19 2M10 8C15 8 17.5 11.5 19 14' stroke='black' stroke-width='1' stroke-linecap='round' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E")
            right center / var(--flare-length) 100% no-repeat;
    mask:
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 16' preserveAspectRatio='none' fill='none'%3E%3Cpath d='M20 8H10M10 8C5 8 2.5 4.5 1 2M10 8C5 8 2.5 11.5 1 14' stroke='black' stroke-width='1' stroke-linecap='round' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E")
            left center / var(--flare-length) 100% no-repeat,
        linear-gradient(#000, #000) center /
            calc(100% - var(--flare-length) * 1.55) 1px no-repeat,
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 16' preserveAspectRatio='none' fill='none'%3E%3Cpath d='M0 8H10M10 8C15 8 17.5 4.5 19 2M10 8C15 8 17.5 11.5 19 14' stroke='black' stroke-width='1' stroke-linecap='round' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E")
            right center / var(--flare-length) 100% no-repeat;
}

.site-footer a {
    color: var(--muted);
}

.site-footer a:hover {
    color: var(--accent);
}

.flex-ff {
    flex: 1;
}

@media (max-width: 640px) {
    .hero {
        padding-bottom: 2.25rem;
    }

    .hero__nav {
        flex-wrap: wrap;
        margin-bottom: 1.75rem;
    }

    .hero__title {
        font-size: 2rem;
    }
}
</style>
