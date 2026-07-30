<script lang="ts">
// module-scoped so it survives client-side navigation —
// the intro should only ever play once per visit
let introPlayed = false;
</script>

<script setup lang="ts">
defineProps<{
    title?: string;
    description?: string;
}>();

const theme = useColorMode();

const toggleTheme = () => {
    theme.preference = theme.preference === 'light' ? 'dark' : 'light';
};

const { $gsap } = useNuxtApp();
const pageEl = useTemplateRef('pageEl');
const initialized = ref(false);

onMounted(() => {
    initialized.value = true;

    if (!$gsap || !pageEl.value || introPlayed) return;
    introPlayed = true;

    const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
    ).matches;

    const ctx = $gsap.context(() => {
        if (reduced) return;

        const tl = $gsap.timeline({
            defaults: { ease: 'power3.out' },
        });

        tl.from('.header-lower', {
            autoAlpha: 0,
            y: 12,
            duration: 0.9,
            ease: 'power2.out',
        })
            .from('.name', { yPercent: 110, duration: 0.9 }, 0.2)
            .from(
                '.title',
                { yPercent: 120, autoAlpha: 0, duration: 0.8 },
                0.35,
            )
            .from(
                ['.footer-upper', '.footer-lower'],
                { autoAlpha: 0, duration: 0.7, ease: 'power2.out' },
                0.55,
            )
            .from('.header-upper', { autoAlpha: 0, duration: 0.7 }, 0.55);

        tl.from(
            'main',
            { autoAlpha: 0, y: 16, duration: 0.8, ease: 'power2.out' },
            0.4,
        );
    }, pageEl.value);

    onBeforeUnmount(() => ctx.revert());
});
</script>

<template>
    <div v-show="initialized">
        <svg width="0" height="0" aria-hidden="true" style="position: absolute">
            <filter id="grainy" x="0" y="0" width="100%" height="100%">
                <feTurbulence
                    type="fractalNoise"
                    baseFrequency=".85"
                    numOctaves="3"
                ></feTurbulence>
                <feColorMatrix type="saturate" values="0"></feColorMatrix>
                <feBlend mode="multiply" in="SourceGraphic"></feBlend>
            </filter>
        </svg>
        <div class="page-wrapper" ref="pageEl">
            <header class="header">
                <div class="header-upper">
                    <slot name="header-upper">
                        <div class="flex-center header-upper-nav">
                            <button
                                class="theme-toggle"
                                @click="toggleTheme"
                                v-if="!theme.unknown"
                            >
                                {{ theme.value === 'dark' ? '🌚' : '🌝' }}
                            </button>
                            <div class="flex-ff"></div>
                            <a
                                class="basic-link"
                                href="https://github.com/jaronpate"
                            >
                                GitHub
                            </a>
                            <NuxtLink to="/writing" class="basic-link">
                                Writing
                            </NuxtLink>
                        </div>
                    </slot>
                </div>
                <div class="header-lower">
                    <slot name="header-lower">
                        <div class="mask">
                            <h1 class="name">
                                {{ title || "Hey, I'm Jaron" }}
                            </h1>
                        </div>
                        <div class="mask">
                            <p class="title">
                                {{
                                    description ||
                                    'Software Engineer by trade — builder by nature.'
                                }}
                            </p>
                        </div>
                    </slot>
                </div>
            </header>

            <main>
                <slot />
                <div style="flex: 1"></div>
            </main>

            <footer class="footer">
                <div class="footer-upper flex-center">
                    <p>
                        <a class="punch-link" href="mailto:yo@jp.wtf"
                            >Say hi.</a
                        >
                    </p>
                    <div class="flex-ff"></div>
                    <p style="text-align: right">Let's make something cool.</p>
                </div>
                <div class="footer-lower flex-center" style="gap: var(--gap)">
                    <p style="text-align: right">Est. 2003</p>
                    <!-- <p style="font-family: monospace">🐟🎩.dev</p> -->
                    <div class="flex-ff"></div>
                    <p style="text-align: right">Austin, TX</p>
                </div>
            </footer>
        </div>
    </div>
</template>

<style scoped>
.page-wrapper {
    --main-width: 50vw;
    width: var(--main-width);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    /*gap: 1.5rem;*/
    min-height: 100vh;
    position: relative;
}

main {
    flex: 1;
    display: flex;
    flex-direction: column;
}

svg[height='0'] {
    position: fixed;
}

.mask {
    overflow: hidden;
}

.name {
    font-size: 3rem;
    font-weight: 400;
    line-height: 1.2;
    margin: 0;
}

.title {
    font-weight: 300;
    margin: 0;
    font-style: italic;
    color: var(--color-white-500);
}

.header {
    display: flex;
    flex-direction: column;
}

.footer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.header-upper {
    height: 8vh;
}

.header-upper-nav {
    padding: 2rem;
    height: 100%;
    font-size: small;
    gap: 1rem;
}

.header-lower {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 16px;
    padding: 3rem 2.5rem;
    color: var(--color-white-500);
    border-radius: 16px;
    overflow: hidden;

    position: relative;
    isolation: isolate;
}

.header-lower::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('~/assets/images/blend.jpeg');
    background-size: cover;
    background-position: left top;
    background-repeat: no-repeat;
    filter: url(#grainy);
    border-radius: 16px;
    z-index: -1;
}

.footer-upper {
    padding: 3.25rem 2.5rem;
    color: var(--color-white-500);
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    isolation: isolate;
}

.footer-upper::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('~/assets/images/blend.jpeg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: url(#grainy);
    border-radius: 16px;
    z-index: -1;
}

.footer-lower {
    padding: 2rem;
    height: 8vh;
    font-size: small;
    gap: 1rem;
}

.theme-toggle {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: large;
    font-weight: bold;
    color: var(--text);
    transition: opacity 0.2s ease;
    padding: 0;
}

.theme-toggle:hover {
    opacity: 0.5;
}

.footer p {
    margin: 0;
}

@media (max-width: 1024px) {
    .page-wrapper {
        --main-width: 80vw;
    }
}

@media (max-width: 768px) {
    .page-wrapper {
        --main-width: 100vw;
        padding: 0 1rem;
    }

    .header-lower,
    .footer-upper {
        border-radius: 12px;
    }

    .header-lower::before,
    .footer-upper::before {
        border-radius: 12px;
    }
}
</style>
