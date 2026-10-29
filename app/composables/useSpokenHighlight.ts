import {
    alignSpokenWords,
    collectArticleTokens,
    type AlignedToken,
    type ArticleToken,
    type SpokenToken,
} from '~/utils/spokenAlign';
import { spokenTokensFromTrack } from '~/utils/vtt';

type PlacedWord = AlignedToken<ArticleToken> & {
    span: HTMLElement | null;
};

const HIGHLIGHT = 'spoken';
const ROOT = '[data-spoken-root], .article-body';
const TITLE = '.hero__title';
const BLOCK =
    'p, li, h1, h2, h3, h4, h5, h6, blockquote, figcaption, .hero__title';
const WAKE = 'spoken-wake';
const SCROLL_TOP = 150;
const SCROLL_BOTTOM = 32;

function supportsHighlight() {
    return (
        typeof CSS !== 'undefined' &&
        'highlights' in CSS &&
        typeof Highlight !== 'undefined'
    );
}

function isAbort(error: unknown) {
    return error instanceof Error && error.name === 'AbortError';
}

function wordRange(word: PlacedWord): Range | null {
    if (word.span?.isConnected) {
        const range = document.createRange();
        range.selectNodeContents(word.span);
        return range;
    }
    const node = word.node;
    if (!node.isConnected || word.end > node.length) return null;
    try {
        const range = document.createRange();
        range.setStart(node, word.start);
        range.setEnd(node, word.end);
        return range;
    } catch {
        return null;
    }
}

function blockOf(range: Range) {
    const node = range.startContainer;
    const element = node instanceof Element ? node : node.parentElement;
    const block = element?.closest(BLOCK);
    if (block instanceof HTMLElement) return block;
    return element instanceof HTMLElement ? element : null;
}

// WebKit does not repaint a block whose highlight range was removed when the
// registry entry is replaced. The pixels stay until the next full paint, such
// as leaving Safari and coming back. Nudge only the block that lost the mark.
function wake(element: HTMLElement) {
    if (!element.isConnected) return;
    element.classList.add(WAKE);
    void element.offsetWidth;
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            element.classList.remove(WAKE);
        });
    });
}

function mutableHighlight(highlight: Highlight) {
    return highlight as Highlight & {
        add(range: AbstractRange): void;
        delete(range: AbstractRange): boolean;
        clear?: () => void;
    };
}

function emptyHighlight(highlight: Highlight) {
    const list = mutableHighlight(highlight);
    if (typeof list.clear === 'function') {
        list.clear();
        return;
    }
    const ranges: AbstractRange[] = [];
    list.forEach((range) => {
        ranges.push(range);
    });
    for (const range of ranges) list.delete(range);
}

function inView(range: Range) {
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    return (
        rect.top >= SCROLL_TOP &&
        rect.bottom <= window.innerHeight - SCROLL_BOTTOM
    );
}

function reveal(range: Range) {
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    const bottomLimit = window.innerHeight - SCROLL_BOTTOM;
    if (rect.top >= SCROLL_TOP && rect.bottom <= bottomLimit) return false;
    const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
    ).matches;
    let top = window.scrollY;
    if (rect.top < SCROLL_TOP) top += rect.top - SCROLL_TOP;
    else top += rect.bottom - bottomLimit;
    window.scrollTo({
        top: Math.max(0, top),
        behavior: reduce ? 'auto' : 'smooth',
    });
    return true;
}

function caretAt(x: number, y: number) {
    const doc = document as Document & {
        caretPositionFromPoint?: (
            x: number,
            y: number,
        ) => { offsetNode: Node; offset: number } | null;
        caretRangeFromPoint?: (x: number, y: number) => Range | null;
    };
    const position = doc.caretPositionFromPoint?.(x, y);
    if (position?.offsetNode) {
        return { node: position.offsetNode, offset: position.offset };
    }
    const range = doc.caretRangeFromPoint?.(x, y);
    if (!range) return null;
    return { node: range.startContainer, offset: range.startOffset };
}

export function useSpokenHighlight(options: {
    src: MaybeRefOrGetter<string>;
    audio: Ref<HTMLAudioElement | null>;
    player: Ref<HTMLElement | null>;
    playing: Ref<boolean>;
    current: Ref<number>;
    seekTo: (time: number) => void;
}) {
    let placed: PlacedWord[] = [];
    let placedSpoken: SpokenToken[] = [];
    let root: HTMLElement | null = null;
    let titleEl: HTMLElement | null = null;
    let abort: AbortController | null = null;
    let observer: MutationObserver | null = null;
    let frame = 0;
    let loadId = 0;
    let activeKey = '';
    let follow = true;
    let scrollLock = 0;
    let shown: Range | null = null;
    let ownsHighlight = false;
    let paintedBlocks = new Set<HTMLElement>();
    let retried = false;
    let rebuilding = false;
    const useRanges = supportsHighlight();

    function covering(time: number) {
        // Words are ordered by start time. Keep the latest one still sounding
        // so a short overlap does not leave the previous word lit.
        let latest = -1;
        for (let index = 0; index < placed.length; index += 1) {
            const word = placed[index];
            if (!word) continue;
            if (word.timeStart > time) break;
            if (time < word.timeEnd) latest = index;
        }
        return latest < 0 ? [] : [latest];
    }

    function clearHighlight() {
        const stale = paintedBlocks;
        paintedBlocks = new Set();
        if (ownsHighlight) CSS.highlights?.delete(HIGHLIGHT);
        ownsHighlight = false;
        for (const element of stale) wake(element);
    }

    function unwrap(host: ParentNode) {
        for (const span of host.querySelectorAll('.spoken-word')) {
            const parent = span.parentNode;
            if (!parent) continue;
            while (span.firstChild) parent.insertBefore(span.firstChild, span);
            span.remove();
            parent.normalize();
        }
    }

    function wrapAll() {
        const groups = new Map<Text, { word: PlacedWord; index: number }[]>();
        placed.forEach((word, index) => {
            const group = groups.get(word.node) ?? [];
            group.push({ word, index });
            groups.set(word.node, group);
        });
        for (const group of groups.values()) {
            group.sort((left, right) => right.word.start - left.word.start);
            for (const entry of group) {
                const word = entry.word;
                const node = word.node;
                if (!node.isConnected || word.end > node.length) continue;
                const range = document.createRange();
                range.setStart(node, word.start);
                range.setEnd(node, word.end);
                const span = document.createElement('span');
                span.className = 'spoken-word';
                span.dataset.spokenIndex = String(entry.index);
                try {
                    range.surroundContents(span);
                } catch {
                    continue;
                }
                word.span = span;
            }
        }
    }

    function paintRanges(indexes: number[]) {
        const registry = CSS.highlights;
        if (!registry) return false;
        const ranges: Range[] = [];
        const blocks = new Set<HTMLElement>();
        for (const index of indexes) {
            const word = placed[index];
            if (!word) continue;
            const range = wordRange(word);
            if (!range) continue;
            ranges.push(range);
            const block = blockOf(range);
            if (block) blocks.add(block);
        }
        if (indexes.length > 0 && ranges.length === 0) return false;

        const stale = [...paintedBlocks].filter(
            (element) => !blocks.has(element),
        );
        // Replacing the registry entry with set() leaves the previous block
        // painted in WebKit. Update the registered highlight in place instead.
        const existing = ownsHighlight ? registry.get(HIGHLIGHT) : undefined;
        if (existing) {
            emptyHighlight(existing);
            const list = mutableHighlight(existing);
            for (const range of ranges) list.add(range);
            if (!ranges.length) registry.delete(HIGHLIGHT);
        } else if (ranges.length) {
            registry.set(HIGHLIGHT, new Highlight(...ranges));
        }

        ownsHighlight = ranges.length > 0;
        paintedBlocks = blocks;
        shown = ranges[0] ?? null;
        for (const element of stale) wake(element);
        return true;
    }

    function paintSpans(indexes: number[]) {
        const active = new Set(indexes);
        placed.forEach((word, index) => {
            word.span?.classList.toggle('is-spoken', active.has(index));
        });
        const first = indexes[0];
        const word = first === undefined ? undefined : placed[first];
        shown = word ? wordRange(word) : null;
    }

    function paint(time: number, canFollow: boolean) {
        const indexes = covering(time);
        const key = indexes.join(',');
        if (key === activeKey) return;
        activeKey = key;
        const painted = useRanges ? paintRanges(indexes) : true;
        if (!painted) {
            if (!retried) {
                retried = true;
                queueRebuild();
            }
            return;
        }
        retried = false;
        if (!useRanges) paintSpans(indexes);
        if (!canFollow || !follow || !shown) return;
        if (reveal(shown)) scrollLock = performance.now() + 700;
    }

    function queueRebuild() {
        if (rebuilding) return;
        rebuilding = true;
        queueMicrotask(() => {
            rebuilding = false;
            if (root) rebuild(root);
        });
    }

    function rebuild(host: HTMLElement) {
        observer?.disconnect();
        if (!useRanges) unwrap(host);
        const spoken = placedSpoken;
        placed = alignSpokenWords(spoken, spokenPageTokens(host))
            .map((word) => ({ ...word, span: null }))
            .sort(
                (left, right) =>
                    left.timeStart - right.timeStart ||
                    left.timeEnd - right.timeEnd,
            );
        activeKey = '';
        shown = null;
        if (!useRanges) wrapAll();
        observe(host);
        const time = options.audio.value?.currentTime ?? options.current.value;
        paint(time, false);
    }

    function observe(host: HTMLElement) {
        observer?.disconnect();
        observer = new MutationObserver((records) => {
            const relevant = records.some((record) => {
                const target = record.target;
                const element =
                    target instanceof Element ? target : target.parentElement;
                if (!element || !host.contains(element)) return false;
                return !element.closest(
                    '.audio-player, [data-spoken-skip], .spoken-skip',
                );
            });
            if (!relevant) return;
            retried = false;
            queueRebuild();
        });
        observer.observe(host, {
            subtree: true,
            childList: true,
            characterData: true,
        });
    }

    function wordAt(event: PointerEvent) {
        const target = event.target;
        if (!(target instanceof Element)) return null;
        if (
            target.closest(
                'a, button, input, textarea, select, label, .audio-player',
            )
        ) {
            return null;
        }
        const span = target.closest<HTMLElement>('.spoken-word');
        if (span) {
            const index = Number(span.dataset.spokenIndex);
            return placed[index] ?? null;
        }
        const caret = caretAt(event.clientX, event.clientY);
        if (!caret || caret.node.nodeType !== Node.TEXT_NODE) return null;
        let boundary: PlacedWord | null = null;
        for (const word of placed) {
            if (word.node !== caret.node) continue;
            if (caret.offset > word.start && caret.offset < word.end)
                return word;
            if (caret.offset === word.start || caret.offset === word.end) {
                boundary = word;
            }
        }
        return boundary;
    }

    let pointer: { x: number; y: number } | null = null;

    function onPointerDown(event: PointerEvent) {
        if (event.button !== 0) return;
        pointer = { x: event.clientX, y: event.clientY };
    }

    function onPointerUp(event: PointerEvent) {
        if (!pointer) return;
        const moved = Math.hypot(
            event.clientX - pointer.x,
            event.clientY - pointer.y,
        );
        pointer = null;
        if (moved > 5) return;
        if (window.getSelection()?.toString()) return;
        const word = wordAt(event);
        if (!word) return;
        options.seekTo(word.timeStart);
    }

    function onScroll() {
        if (performance.now() < scrollLock) return;
        if (!shown) return;
        follow = inView(shown);
    }

    function spokenPageTokens(host: HTMLElement) {
        const title = document.querySelector(TITLE);
        const tokens =
            title instanceof HTMLElement && !host.contains(title)
                ? collectArticleTokens(title)
                : [];
        return tokens.concat(collectArticleTokens(host));
    }

    function listen(host: HTMLElement) {
        host.addEventListener('pointerdown', onPointerDown);
        host.addEventListener('pointerup', onPointerUp);
        const title = document.querySelector(TITLE);
        if (title instanceof HTMLElement && !host.contains(title)) {
            titleEl = title;
            titleEl.addEventListener('pointerdown', onPointerDown);
            titleEl.addEventListener('pointerup', onPointerUp);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    function unlisten(host: HTMLElement | null) {
        host?.removeEventListener('pointerdown', onPointerDown);
        host?.removeEventListener('pointerup', onPointerUp);
        titleEl?.removeEventListener('pointerdown', onPointerDown);
        titleEl?.removeEventListener('pointerup', onPointerUp);
        titleEl = null;
        window.removeEventListener('scroll', onScroll);
    }

    function loop() {
        const element = options.audio.value;
        if (!element) return;
        const media = element.currentTime;
        const intended = options.current.value;
        // A word click moves the clock immediately. The element can report the
        // old time for a moment, and painting that puts the mark back at the start.
        const slack = Math.max(0.75, element.playbackRate * 0.4);
        const time = Math.abs(media - intended) > slack ? intended : media;
        paint(time, true);
        if (!element.paused && !element.ended) {
            frame = requestAnimationFrame(loop);
        }
    }

    function stopLoop() {
        cancelAnimationFrame(frame);
    }

    function clear() {
        stopLoop();
        abort?.abort();
        abort = null;
        observer?.disconnect();
        observer = null;
        unlisten(root);
        if (root && !useRanges) unwrap(root);
        clearHighlight();
        placed = [];
        placedSpoken = [];
        root = null;
        activeKey = '';
        shown = null;
        follow = true;
    }

    function apply(spoken: SpokenToken[], host: HTMLElement) {
        unlisten(root);
        if (root && root !== host && !useRanges) unwrap(root);
        root = host;
        placedSpoken = spoken;
        listen(host);
        rebuild(host);
    }

    async function load() {
        const id = ++loadId;
        const url = toValue(options.src).trim();
        const host = options.player.value?.closest<HTMLElement>(ROOT) ?? null;
        clear();
        if (!url || !host) return;

        const controller = new AbortController();
        abort = controller;
        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) return;
            const spoken = spokenTokensFromTrack(await response.text());
            if (id !== loadId) return;
            apply(spoken, host);
        } catch (error) {
            if (isAbort(error)) return;
        }
    }

    watch(
        () => toValue(options.src),
        () => {
            if (import.meta.client) void load();
        },
    );

    watch(options.playing, (isPlaying) => {
        if (!import.meta.client) return;
        if (isPlaying) {
            follow = true;
            activeKey = '';
            loop();
            return;
        }
        stopLoop();
        paint(options.audio.value?.currentTime ?? options.current.value, false);
    });

    watch(options.current, (time) => {
        if (!import.meta.client) return;
        // timeupdate is coarse, but it still moves the mark if animation
        // frames are throttled. Following the word stays on the animation loop.
        paint(time, false);
    });

    onMounted(() => {
        void load();
    });

    onBeforeUnmount(() => {
        loadId += 1;
        clear();
    });
}
