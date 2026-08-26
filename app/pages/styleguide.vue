<script setup lang="ts">
import {
    BODY_FONTS,
    REDACTION_STRENGTHS,
    redactionFamily,
} from '~/utils/fonts';
import { BG_THEMES } from '~/utils/themes';
import { SITE_URL } from '~/utils/site';

const TOKEN_NAMES = [
    '--bg',
    '--bg-secondary',
    '--text',
    '--muted',
    '--accent',
    '--accent-soft',
    '--navy',
    '--hairline',
    '--code-bg',
    '--img-matte',
] as const;

const tokenValues = ref<Record<string, string>>({});
const themeTokens = ref<Record<string, Record<string, string>>>({});
const { id: themeId, setTheme } = useBgTheme();
const { id: fontId, setFont } = useBodyFont();

const pageUrl = `${SITE_URL}/styleguide`;

useSeoMeta({
    title: 'Styleguide',
    ogTitle: 'Styleguide',
    description: 'Colors, type, and components used on this site.',
    ogDescription: 'Colors, type, and components used on this site.',
    ogUrl: pageUrl,
    robots: 'noindex',
});

useHead({
    link: [{ rel: 'canonical', href: pageUrl }],
});

const { data: writingPages } = await useAsyncData(
    'styleguide-writing',
    async () => {
        const all = await queryCollection('writing').order('date', 'DESC').all();
        return all.filter((page) => !page.hidden).slice(0, 4);
    },
);

const { data: projectPages } = await useAsyncData(
    'styleguide-projects',
    async () => {
        const all = await queryCollection('projects').order('title', 'ASC').all();
        return all.filter((page) => !page.hidden).slice(0, 4);
    },
);

const carouselImages = [
    {
        src: '/work/edlink/billing-overview.png',
        alt: 'Billing overview',
    },
    {
        src: '/work/edlink/invoice-sheet.png',
        alt: 'Invoice view',
    },
    {
        src: '/work/edlink/authentication-widget.gif',
        alt: 'Auth widget',
    },
];

function cssColorToHex(value: string) {
    const raw = value.trim().toLowerCase();
    if (!raw) return '';
    if (raw.startsWith('#')) {
        if (raw.length === 4) {
            const r = raw[1];
            const g = raw[2];
            const b = raw[3];
            return `#${r}${r}${g}${g}${b}${b}`;
        }
        return raw.slice(0, 7);
    }
    const parts = raw.match(/rgba?\(\s*(\d+)[\s,/]+(\d+)[\s,/]+(\d+)/);
    if (!parts) return raw;
    return (
        '#' +
        [parts[1], parts[2], parts[3]]
            .map((n) => Number(n).toString(16).padStart(2, '0'))
            .join('')
    );
}

function readCssVars(element: Element) {
    const styles = getComputedStyle(element);
    const next: Record<string, string> = {};
    for (const name of TOKEN_NAMES) {
        next[name] = cssColorToHex(styles.getPropertyValue(name));
    }
    return next;
}

function readTokens() {
    if (!import.meta.client) return;
    tokenValues.value = readCssVars(document.documentElement);
}

function readThemeTokens() {
    if (!import.meta.client) return;
    const next: Record<string, Record<string, string>> = {};
    for (const theme of BG_THEMES) {
        const probe = document.createElement('div');
        probe.className = `theme-${theme.id}`;
        probe.setAttribute('aria-hidden', 'true');
        document.body.append(probe);
        next[theme.id] = readCssVars(probe);
        probe.remove();
    }
    themeTokens.value = next;
}

function onFontSelect(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const next = BODY_FONTS.find((font) => font.id === value);
    if (next) setFont(next.id);
}

function redactionClass(grade: (typeof REDACTION_STRENGTHS)[number]) {
    return grade === 0 ? 'font-redaction' : `font-redaction-${grade}`;
}

onMounted(() => {
    readTokens();
    readThemeTokens();
    const observer = new MutationObserver(readTokens);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });
    onUnmounted(() => observer.disconnect());
});
</script>

<template>
    <NuxtLayout
        name="main"
        title="Styleguide"
        description="Everything this site knows how to look like."
    >
        <article>
            <p>
                This is the kitchen sink. Change the theme up top and the
                colors below update with it. The fonts on this page keep their
                own face so you can actually compare them.
            </p>

            <ul class="guide-toc">
                <li><a href="#color">Color</a></li>
                <li><a href="#type">Type</a></li>
                <li><a href="#prose">Prose</a></li>
                <li><a href="#components">Components</a></li>
            </ul>

            <h2 id="color">Color</h2>
            <p>
                Flip the background in the header and these chips follow.
            </p>

            <div class="swatches">
                <div
                    v-for="name in TOKEN_NAMES"
                    :key="name"
                    class="swatch"
                >
                    <div
                        class="swatch__chip"
                        :style="{ background: `var(${name})` }"
                    />
                    <code>{{ name }}</code>
                    <span class="swatch__value">{{
                        tokenValues[name] || '—'
                    }}</span>
                </div>
            </div>

            <p>
                Highlight this sentence if you want to see selection. Accent
                fill, white type.
            </p>

            <h3>Themes</h3>
            <p>
                Click a card to switch the whole site. Same thing as the
                dropdown. Current one has the outline.
            </p>

            <div class="theme-grid">
                <button
                    v-for="theme in BG_THEMES"
                    :key="theme.id"
                    type="button"
                    class="theme-card"
                    :class="[
                        `theme-${theme.id}`,
                        { 'theme-card--current': themeId === theme.id },
                    ]"
                    @click="setTheme(theme.id)"
                >
                    <span class="theme-card__name">{{ theme.label }}</span>
                    <code class="theme-card__value">{{
                        themeTokens[theme.id]?.['--bg'] || '—'
                    }}</code>
                    <span class="theme-card__chips" aria-hidden="true">
                        <span class="theme-card__chip theme-card__chip--secondary" />
                        <span class="theme-card__chip theme-card__chip--accent" />
                        <span class="theme-card__chip theme-card__chip--muted" />
                        <span class="theme-card__chip theme-card__chip--hairline" />
                    </span>
                </button>
            </div>

            <h2 id="type">Type</h2>
            <p>
                Body font is whatever you pick here.
            </p>
            <label class="guide-label">
                Body font
                <select
                    class="guide-select"
                    :value="fontId"
                    @change="onFontSelect"
                >
                    <option
                        v-for="font in BODY_FONTS"
                        :key="font.id"
                        :value="font.id"
                    >
                        {{ font.label }}
                    </option>
                </select>
            </label>

            <p>
                Three jobs: the body face you pick, Sohne for UI, Space Mono
                for code.
            </p>
            <p class="role-plain">
                Sohne for nav, dates, captions, and this line.
            </p>
            <p class="role-mono">Space Mono for the wordmark, footer, and code.</p>

            <h3>Fonts</h3>
            <div class="font-list">
                <p
                    v-for="font in BODY_FONTS"
                    :key="font.id"
                    class="font-sample"
                    :class="`font-${font.id}`"
                >
                    <span class="font-sample__name">{{ font.label }}</span>
                    The best sticking point is the way using the thing
                    <em>feels</em>.
                </p>
            </div>

            <h3>Redaction</h3>
            <p>
                You can set a span in Redaction. Strength is 0, 10, 20, 35, 50,
                70, or 100. Anything else snaps to the closest. Default is 100.
            </p>
            <ul>
                <li v-for="grade in REDACTION_STRENGTHS" :key="grade">
                    {{ grade }}:
                    <span
                        class="redaction-sample"
                        :class="redactionClass(grade)"
                    >you werent supposed to see this</span>
                    <span class="grade-face">{{ redactionFamily(grade) }}</span>
                </li>
            </ul>

            <h2 id="prose">Prose</h2>
            <p>
                Regular writing. You can <em>italicize</em>,
                <strong>bold</strong>, or
                <a href="https://jaron.sh">link out</a>. Second and third level
                headings look the same on purpose. Italic, muted, not trying to
                be a poster.
            </p>

            <h3>Still just a heading</h3>
            <p>Same size. I dont really do heading hierarchy.</p>

            <h3>Lists</h3>
            <p>Bullets, if you need them:</p>
            <ul>
                <li>Plantin for reading</li>
                <li>Space Mono for the wordmark, footer, and code</li>
                <li>Redaction only if you ask for it</li>
            </ul>
            <p>Numbers, if order matters:</p>
            <ol>
                <li>Write the thing</li>
                <li>Stick a note in the margin if you have to</li>
                <li>Redact whatever should stay almost-said</li>
            </ol>

            <h3>Blockquote</h3>
            <p>Gets a little pointing hand in the gutter.</p>
            <blockquote>
                <p>
                    The best sticking point is the way using the thing
                    <em>feels</em>. Everything else is infrastructure.
                </p>
            </blockquote>

            <h3>Code</h3>
            <p>Inline looks like <code>ping</code>. Blocks look like this:</p>
            <pre><code>client.chatCommands.register('ping', (context) => {
    context.reply('Pong!', true);
});</code></pre>
            <p>
                Code in a post also gets syntax colors. They flip with the
                theme.
            </p>

            <h3>Divider</h3>
            <hr />

            <h3>Images</h3>
            <p>
                An image never gets wider than the actual file. A caption sits
                underneath if you add one.
            </p>
            <ProseImg
                src="/work/edlink/billing-overview.png"
                alt="Billing overview"
                title="The billing screen"
            />
            <p>
                Small files stay small. This mark is 460px so it just sits
                there, not stretched.
            </p>
            <ProseImg src="/favicon.png" alt="Site mark" />

            <h2 id="components">Components</h2>
            <p>The extra bits that can show up in a post.</p>

            <h3>Margin note</h3>
            <p>
                For a thought that does not belong in the sentence.
                <MarginNote
                    >(Wide screens put it in the gutter. Narrow screens drop it
                    under the paragraph.)</MarginNote
                >
                Skip it if you want. That's kind of the point.
            </p>
            <p>
                Two in a row so you can see them stack. First one.
                <MarginNote>(Hey, I'm the first note.)</MarginNote>
                Then another.
                <MarginNote>(And I'm the second. Should not sit on top of the other one.)</MarginNote>
                The rest of the sentence just keeps going.
            </p>

            <h3>Notice</h3>
            <p>When you actually need to interrupt. Stays in the column.</p>
            <Notice>
                <p>
                    <strong>In-column.</strong> Navy, hard to miss. Use it when
                    the aside <em>is</em> the point for a minute.
                </p>
            </Notice>
            <p>And if you want it edge to edge:</p>
            <Notice bleed>
                <p>
                    <strong>Bleed.</strong> Same idea, full width. Save it for
                    the one time you actually want to shout.
                </p>
            </Notice>

            <h3>Redacted</h3>
            <p>Same phrase, every grade:</p>
            <ul>
                <li v-for="grade in REDACTION_STRENGTHS" :key="`r-${grade}`">
                    {{ grade }}:
                    <Redacted :strength="grade"
                        >you werent supposed to see this</Redacted
                    >
                </li>
            </ul>
            <p>
                Mix it into a sentence: I probably shouldnt mention
                <Redacted strength="20">the actual implementation</Redacted>,
                and later
                <Redacted strength="100">almost nothing remains</Redacted>.
                <strong
                    >Bold around
                    <Redacted strength="50">a redacted span</Redacted></strong
                >
                should pick Redaction Bold.
            </p>

            <h3>Carousel</h3>
            <p>
                The selected work scroller from the homepage. Flick it
                sideways.
            </p>
            <Carousel :images="carouselImages" />

            <h3>Writing list</h3>
            <p>How posts show up.</p>
            <WritingList :pages="writingPages ?? []" />

            <h3>Project list</h3>
            <p>
                How projects show up. Hover one that has an image.
            </p>
            <ProjectList :pages="projectPages ?? []" />
        </article>
    </NuxtLayout>
</template>

<style scoped>
.guide-toc {
    margin: 0 0 2rem;
}

.swatches {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
    gap: 0.85rem;
    margin: 1.25rem 0 1.5rem;
}

.swatch__chip {
    height: 3.1rem;
    border: 1px solid var(--hairline);
    border-radius: var(--radius);
    margin-bottom: 0.4rem;
}

.swatch code {
    display: block;
    font-size: 0.72rem;
    padding: 0;
    background: none;
}

.swatch__value {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--muted);
    margin-top: 0.15rem;
}

.theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
    gap: 0.65rem;
    margin: 1.25rem 0 1.5rem;
}

.theme-card {
    appearance: none;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    padding: 0.75rem 0.8rem 0.85rem;
    border: 1px solid var(--hairline);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text);
    cursor: pointer;
    text-align: left;
    font: inherit;
}

.theme-card--current {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
}

.theme-card__name {
    font-family: var(--font-plain);
    font-size: 0.8rem;
}

.theme-card__value {
    display: block;
    font-size: 0.72rem;
    padding: 0;
    background: none;
    color: var(--muted);
}

.theme-card__chips {
    display: flex;
    gap: 0.3rem;
}

.theme-card__chip {
    flex: 1;
    height: 0.7rem;
    border-radius: 2px;
}

.theme-card__chip--secondary {
    background: var(--bg-secondary);
}

.theme-card__chip--accent {
    background: var(--accent);
}

.theme-card__chip--muted {
    background: var(--muted);
}

.theme-card__chip--hairline {
    background: var(--hairline);
}

.guide-label {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.65rem;
    margin: 0 0 1em;
    font-family: var(--font-plain);
    font-size: 0.8rem;
    color: var(--muted);
}

.guide-select {
    appearance: none;
    background: var(--bg-secondary);
    color: var(--text);
    border: 1px solid var(--hairline);
    border-radius: var(--radius);
    font-family: var(--font-plain);
    font-size: 0.8rem;
    line-height: 1;
    padding: 0.4em 1.7em 0.4em 0.65em;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath fill='%239aa4b8' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.55em center;
    background-size: 0.5em;
    cursor: pointer;
}

.role-plain {
    font-family: var(--font-plain);
    font-size: 0.9rem;
}

.role-mono {
    font-family: var(--font-mono);
    font-size: 0.85rem;
}

.font-list {
    margin: 1rem 0 1.5rem;
}

.font-sample {
    margin: 0 0 0.85rem;
    line-height: 1.45;
    font-family: var(--font);
    font-weight: var(--body-weight);
}

.font-sample__name {
    display: block;
    font-family: var(--font-plain);
    font-size: 0.72rem;
    letter-spacing: 0.02em;
    color: var(--muted);
    margin-bottom: 0.15rem;
}

.redaction-sample {
    font-family: var(--font);
    font-weight: var(--body-weight);
}

.grade-face {
    display: inline-block;
    margin-left: 0.45rem;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--muted);
}

.guide-toc + h2,
article :deep(.article-figure) {
    scroll-margin-top: 1rem;
}
</style>
