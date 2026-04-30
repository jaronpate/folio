<script setup lang="ts">
defineProps<{
    title?: string;
    description?: string;
}>();
</script>

<template>
    <div>
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
        <div class="page-wrapper">
            <div class="trace left"></div>

            <div class="trace right"></div>

            <header class="header">
                <h1 class="name">{{ title || 'Jaron' }}</h1>
                <p v-if="description" class="title">
                    {{ description }}
                </p>
                <p v-else class="title">
                    Software Engineer by trade &mdash; builder by nature.
                </p>
            </header>

            <main>
                <slot />
                <div style="flex: 1"></div>
            </main>

            <footer class="footer">
                <div class="footer-upper">
                    <div class="flex-center">
                        <p>
                            <a class="punch-link" href="mailto:yo@jp.wtf"
                                >Say hi.</a
                            >
                        </p>
                        <div class="flex-ff"></div>
                        <p style="text-align: right">
                            Let's make something cool.
                        </p>
                    </div>
                </div>
                <div class="footer-lower">
                    <div class="flex-center">
                        <p style="text-align: right">Est. 2003</p>
                        <div class="flex-ff"></div>
                        <p style="text-align: right">Austin, TX</p>
                    </div>
                </div>
            </footer>
        </div>
    </div>
</template>

<style>
.page-wrapper {
    --main-width: 50vw;
    width: var(--main-width);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
}

main {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.trace {
    position: absolute;
    top: 0;
    height: 100%;
    width: 1px;
    background: var(--muted);
    z-index: 1;
}

.trace.left {
    left: 0;
}

.trace.right {
    right: 0;
}

svg[height='0'] {
    position: fixed;
}

.name {
    font-size: 4rem;
    font-weight: 400;
    line-height: 1.2;
    margin: 0;
}

.title {
    font-weight: 300;
    margin: 0;
    font-style: italic;
}

.header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;

    border-top: 1px solid var(--muted);
    border-bottom: 1px solid var(--muted);
    padding: 2rem;
    color: var(--bg);

    margin-top: 8vh;
    position: relative;
    isolation: isolate;
}

.header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('/blend.jpeg');
    background-size: cover;
    background-position: left top;
    background-repeat: no-repeat;
    filter: url(#grainy);
    z-index: -1;
}

.footer-upper {
    border-top: 1px solid var(--muted);
    border-bottom: 1px solid var(--muted);
    padding: 2rem;
    color: var(--bg);
    min-height: 10vh;
    position: relative;
    isolation: isolate;
}

.footer-upper::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('/blend.jpeg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: url(#grainy);
    z-index: -1;
}

.footer-lower {
    padding: 1rem;
    height: 8vh;
    font-size: small;
}

@media (max-width: 1024px) {
    .page-wrapper {
        --main-width: 80vw;
    }
}

@media (max-width: 768px) {
    .page-wrapper {
        --main-width: 100vw;
    }

    .trace {
        display: none;
    }
}
</style>
