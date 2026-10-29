<script setup lang="ts">
import {
    Backward15Seconds,
    Download,
    Forward15Seconds,
    IconoirProvider,
    PauseSolid,
    PlaySolid,
    SoundHighSolid,
    SoundLowSolid,
    SoundMinSolid,
    SoundOffSolid,
} from '@iconoir/vue';
import { joinURL, withLeadingSlash, withTrailingSlash } from 'ufo';
import { absoluteSiteUrl, SITE_NAME } from '~/utils/site';

const iconSize = { width: '1.35rem', height: '1.35rem' };
const volumeIcon = { width: '1rem', height: '1rem' };
const downloadIcon = { width: '0.9rem', height: '0.9rem' };

const props = withDefaults(
    defineProps<{
        src: string;
        title?: string;
        /** When false, title stays in Media Session metadata only. */
        showTitle?: boolean;
        download?: boolean | string;
        sticky?: boolean;
        vtt?: string;
        /** Absolute or site-relative image for lock-screen / Now Playing. */
        artwork?: string;
    }>(),
    {
        title: '',
        showTitle: true,
        download: false,
        sticky: false,
        vtt: '',
        artwork: '',
    },
);

const titleId = useId();
const mediaTitle = computed(() => (props.title ?? '').trim());
const visibleTitle = computed(
    () => props.showTitle && Boolean(mediaTitle.value),
);
const regionLabel = computed(() => mediaTitle.value || 'Audio player');

const canDownload = computed(
    () =>
        props.download === true ||
        props.download === '' ||
        props.download === 'true',
);

function resolveSitePath(raw: string) {
    const trimmed = raw.trim();
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
        const base = withLeadingSlash(
            withTrailingSlash(useRuntimeConfig().app.baseURL),
        );
        if (base !== '/' && !trimmed.startsWith(base))
            return joinURL(base, trimmed);
    }
    return trimmed;
}

const resolvedSrc = computed(() => resolveSitePath(props.src ?? ''));
const resolvedVtt = computed(() => resolveSitePath(props.vtt ?? ''));
const resolvedArtwork = computed(() => absoluteSiteUrl(props.artwork));

function artworkType(src: string) {
    const ext = src.split(/[?#]/)[0]?.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'webp':
            return 'image/webp';
        case 'gif':
            return 'image/gif';
        default:
            return undefined;
    }
}

function mediaArtworkEntries(src: string) {
    const type = artworkType(src);
    const sizes = ['96x96', '128x128', '192x192', '256x256', '384x384', '512x512'];
    return sizes.map((size) => ({
        src,
        sizes: size,
        ...(type ? { type } : {}),
    }));
}

const downloadName = computed(() => {
    const path = resolvedSrc.value.split(/[?#]/)[0] ?? '';
    return path.split('/').filter(Boolean).pop() || 'audio';
});

const audio = ref<HTMLAudioElement | null>(null);
const playerEl = ref<HTMLElement | null>(null);
const sentinel = ref<HTMLElement | null>(null);
const pinned = ref(false);
const playing = ref(false);
const current = ref(0);
const duration = ref(0);
const volume = ref(1);
const lastAudible = ref(1);
const scrubbing = ref(false);
const resumeAfterSeek = ref(false);
const failed = ref(false);
let heldSeek: number | null = null;
let seekAttempts = 0;
let seekUntil = 0;
let seekTimer = 0;
let seekAssigned = false;

const PLAYBACK_RATES = [0.8, 1, 1.2, 1.5, 2] as const;
type PlaybackRate = (typeof PLAYBACK_RATES)[number];
const rate = ref<PlaybackRate>(1);

const canSeek = computed(() => duration.value > 0 && !failed.value);
const seekFill = computed(() => {
    if (duration.value <= 0) return '0%';
    const ratio = Math.min(1, Math.max(0, current.value / duration.value));
    return `${ratio * 100}%`;
});
const volumeFill = computed(() => `${volume.value * 100}%`);
const rateLabel = computed(() => `${rate.value.toFixed(1)}x`);

function formatTime(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const whole = Math.floor(seconds);
    const hours = Math.floor(whole / 3600);
    const minutes = Math.floor((whole % 3600) / 60);
    const secs = whole % 60;
    const clock = `${minutes}:${secs.toString().padStart(2, '0')}`;
    if (hours <= 0) return clock;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function applyVolume() {
    if (audio.value) audio.value.volume = volume.value;
}

function applyRate() {
    if (audio.value) audio.value.playbackRate = rate.value;
}

function syncDuration() {
    const el = audio.value;
    if (!el || !Number.isFinite(el.duration) || el.duration <= 0) return;
    duration.value = el.duration;
    failed.value = false;
}

function onLoaded() {
    syncDuration();
    applyVolume();
    applyRate();
    commitHeldSeek();
}

function onDuration() {
    syncDuration();
    commitHeldSeek();
}

function mediaTime(duration: number, time: number) {
    const safe = Math.max(0, time);
    if (!Number.isFinite(duration) || duration <= 0) return safe;
    return Math.min(safe, duration);
}

function assignTime(element: HTMLAudioElement, time: number) {
    try {
        element.currentTime = time;
    } catch {
        // Safari throws if metadata has not arrived yet.
    }
}

function seekReady(element: HTMLAudioElement) {
    return (
        element.readyState >= HTMLMediaElement.HAVE_METADATA &&
        element.seekable.length > 0
    );
}

function releaseHeldSeek() {
    heldSeek = null;
    seekAttempts = 0;
    seekUntil = 0;
    seekAssigned = false;
    window.clearTimeout(seekTimer);
}

function commitHeldSeek() {
    const element = audio.value;
    if (!element || heldSeek === null || seekAssigned) return;
    if (!seekReady(element)) return;
    if (Math.abs(element.currentTime - heldSeek) < 0.05) {
        releaseHeldSeek();
        return;
    }
    seekAssigned = true;
    assignTime(element, heldSeek);
}

function watchHeldSeek() {
    window.clearTimeout(seekTimer);
    seekTimer = window.setTimeout(() => {
        const element = audio.value;
        if (!element || heldSeek === null) return;
        if (Math.abs(element.currentTime - heldSeek) <= 0.35) {
            releaseHeldSeek();
            current.value = element.currentTime;
            return;
        }
        const waiting = performance.now() < seekUntil;
        if (waiting && seekAttempts < 6) {
            if (seekReady(element)) seekAttempts += 1;
            seekAssigned = false;
            commitHeldSeek();
            watchHeldSeek();
            return;
        }
        releaseHeldSeek();
        current.value = element.currentTime;
    }, 300);
}

function onTime() {
    if (scrubbing.value || !audio.value || heldSeek !== null) return;
    current.value = audio.value.currentTime;
}

function syncMediaSession() {
    if (!import.meta.client || !('mediaSession' in navigator)) return;
    const art = resolvedArtwork.value;
    navigator.mediaSession.metadata = new MediaMetadata({
        title: mediaTitle.value || 'Audio',
        artist: SITE_NAME,
        artwork: art ? mediaArtworkEntries(art) : [],
    });
}

function syncMediaPosition() {
    if (!import.meta.client || !('mediaSession' in navigator)) return;
    if (!Number.isFinite(duration.value) || duration.value <= 0) return;
    try {
        navigator.mediaSession.setPositionState({
            duration: duration.value,
            playbackRate: rate.value,
            position: Math.min(Math.max(0, current.value), duration.value),
        });
    } catch {
        // Some browsers reject position updates while metadata is settling.
    }
}

function bindMediaSessionActions() {
    if (!import.meta.client || !('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;
    session.setActionHandler('play', () => {
        void toggle();
    });
    session.setActionHandler('pause', () => {
        audio.value?.pause();
    });
    session.setActionHandler('seekbackward', (details) => {
        skip(-(details.seekOffset ?? 15));
    });
    session.setActionHandler('seekforward', (details) => {
        skip(details.seekOffset ?? 15);
    });
    session.setActionHandler('seekto', (details) => {
        if (typeof details.seekTime === 'number') seekTo(details.seekTime);
    });
    session.setActionHandler('stop', () => {
        const el = audio.value;
        if (!el) return;
        el.pause();
        el.currentTime = 0;
        current.value = 0;
    });
}

function onPlay() {
    playing.value = true;
    failed.value = false;
    const mine = audio.value;
    if (!mine) return;
    for (const other of document.querySelectorAll('audio')) {
        if (other !== mine) other.pause();
    }
    syncMediaSession();
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
    }
    syncMediaPosition();
}

function onPause() {
    playing.value = false;
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
    }
}

function onEnded() {
    playing.value = false;
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
    }
    if (heldSeek !== null || !audio.value) return;
    current.value = audio.value.currentTime;
}

function onSeeked() {
    const element = audio.value;
    if (!element) return;
    if (heldSeek !== null && Math.abs(element.currentTime - heldSeek) > 0.35) {
        watchHeldSeek();
        return;
    }
    if (heldSeek !== null) releaseHeldSeek();
    current.value = element.currentTime;
    if (resumeAfterSeek.value) settleSeek();
    else scrubbing.value = false;
}

function onError() {
    if (audio.value?.error?.code === MediaError.MEDIA_ERR_ABORTED) return;
    failed.value = true;
    playing.value = false;
}

async function toggle() {
    const el = audio.value;
    if (!el) return;
    if (scrubbing.value) {
        resumeAfterSeek.value = !resumeAfterSeek.value;
        return;
    }
    if (!el.paused) {
        el.pause();
        return;
    }
    if (failed.value) {
        failed.value = false;
        el.load();
    }
    try {
        await el.play();
    } catch {
        // play() rejects on an autoplay block. A bad file also emits error.
    }
}

function readInput(event: Event) {
    const next = Number((event.target as HTMLInputElement).value);
    return Number.isFinite(next) ? next : null;
}

function skip(delta: number) {
    const el = audio.value;
    if (!el || !canSeek.value) return;
    const base = scrubbing.value ? current.value : el.currentTime;
    const next = Math.min(duration.value, Math.max(0, base + delta));
    current.value = next;
    if (Math.abs(el.currentTime - next) >= 0.05) el.currentTime = next;
}

function onSeekInput(event: Event) {
    const next = readInput(event);
    if (next === null) return;
    const el = audio.value;
    releaseHeldSeek();
    if (!scrubbing.value) resumeAfterSeek.value = !!el && !el.paused;
    scrubbing.value = true;
    current.value = next;
    el?.pause();
}

function finishSeek(event: Event) {
    const next = readInput(event);
    const el = audio.value;
    if (next === null || !el) {
        settleSeek();
        return;
    }
    current.value = next;
    const pending = scrubbing.value || resumeAfterSeek.value;
    if (Math.abs(el.currentTime - next) >= 0.05) el.currentTime = next;
    if (!pending) {
        scrubbing.value = false;
        return;
    }
    if (Math.abs(el.currentTime - next) < 0.05) settleSeek();
}

function settleSeek() {
    const shouldResume = resumeAfterSeek.value;
    scrubbing.value = false;
    resumeAfterSeek.value = false;
    if (!shouldResume) return;
    audio.value?.play().catch(() => {});
}

function onVolumeInput(event: Event) {
    const next = readInput(event);
    if (next === null) return;
    volume.value = Math.min(1, Math.max(0, next));
    if (volume.value > 0) lastAudible.value = volume.value;
    applyVolume();
}

function toggleMute() {
    if (volume.value > 0) {
        lastAudible.value = volume.value;
        volume.value = 0;
    } else {
        volume.value = lastAudible.value || 1;
    }
    applyVolume();
}

function cycleRate() {
    const index = PLAYBACK_RATES.indexOf(rate.value);
    const next = PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length];
    rate.value = next ?? 1;
    applyRate();
}

function seekTo(time: number) {
    const el = audio.value;
    if (!el || failed.value || !Number.isFinite(time)) return;
    const next = mediaTime(el.duration, time);
    window.clearTimeout(seekTimer);
    seekAssigned = false;
    heldSeek = next;
    seekAttempts = 0;
    seekUntil = performance.now() + 2000;
    current.value = next;
    commitHeldSeek();
    if (heldSeek !== null) watchHeldSeek();
}

useSpokenHighlight({
    src: resolvedVtt,
    audio,
    player: playerEl,
    playing,
    current,
    seekTo,
});

watch(
    () => props.src,
    () => {
        playing.value = false;
        current.value = 0;
        duration.value = 0;
        failed.value = false;
        scrubbing.value = false;
        resumeAfterSeek.value = false;
        releaseHeldSeek();
        syncMediaSession();
    },
);

watch(
    [() => props.title, resolvedArtwork],
    () => {
        syncMediaSession();
    },
);

watch([current, duration, rate], () => {
    if (playing.value) syncMediaPosition();
});

let pinObserver: IntersectionObserver | null = null;

onMounted(() => {
    applyVolume();
    applyRate();
    syncDuration();
    syncMediaSession();
    bindMediaSessionActions();
    const el = audio.value;
    if (el) {
        current.value = el.currentTime;
        playing.value = !el.paused;
        if (playing.value) {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
            }
            syncMediaPosition();
        }
    }

    const mark = sentinel.value;
    if (!props.sticky || !mark) return;
    pinObserver = new IntersectionObserver(([entry]) => {
        pinned.value = !!entry && entry.boundingClientRect.top < 0;
    });
    pinObserver.observe(mark);
});

onBeforeUnmount(() => {
    pinObserver?.disconnect();
    window.clearTimeout(seekTimer);
    if (!('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;
    for (const action of [
        'play',
        'pause',
        'seekbackward',
        'seekforward',
        'seekto',
        'stop',
    ] as const) {
        try {
            session.setActionHandler(action, null);
        } catch {
            // Older Safari builds reject clearing some handlers.
        }
    }
});
</script>

<template>
    <div
        v-if="resolvedSrc && sticky"
        ref="sentinel"
        class="audio-player__sentinel"
        aria-hidden="true"
    />
    <div
        v-if="resolvedSrc"
        ref="playerEl"
        class="audio-player"
        :class="{
            'audio-player--sticky': sticky,
            'is-pinned': pinned,
        }"
        role="region"
        :aria-labelledby="visibleTitle ? titleId : undefined"
        :aria-label="visibleTitle ? undefined : regionLabel"
    >
        <div class="audio-player__panel">
            <audio
                ref="audio"
                class="audio-player__media"
                :src="resolvedSrc"
                preload="metadata"
                playsinline
                @loadedmetadata="onLoaded"
                @durationchange="onDuration"
                @progress="commitHeldSeek"
                @canplay="commitHeldSeek"
                @timeupdate="onTime"
                @play="onPlay"
                @pause="onPause"
                @ended="onEnded"
                @seeked="onSeeked"
                @error="onError"
            />

            <div v-if="visibleTitle || canDownload" class="audio-player__head">
                <p
                    v-if="visibleTitle"
                    :id="titleId"
                    class="audio-player__title"
                >
                    {{ mediaTitle }}
                </p>
                <a
                    v-if="canDownload"
                    class="audio-player__download"
                    :href="resolvedSrc"
                    :download="downloadName"
                >
                    <span
                        class="audio-player__download-icon"
                        aria-hidden="true"
                    >
                        <IconoirProvider :icon-props="downloadIcon">
                            <Download />
                        </IconoirProvider>
                    </span>
                    Download
                </a>
            </div>

            <div class="audio-player__bar">
                <IconoirProvider :icon-props="iconSize">
                    <div class="audio-player__transport">
                        <button
                            type="button"
                            class="audio-player__skip"
                            aria-label="Back 15 seconds"
                            :disabled="!canSeek"
                            @click="skip(-15)"
                        >
                            <Backward15Seconds />
                        </button>
                        <button
                            type="button"
                            class="audio-player__play"
                            :aria-label="playing ? 'Pause' : 'Play'"
                            @click="toggle"
                        >
                            <span
                                v-if="!playing"
                                class="audio-player__glyph--play"
                            >
                                <PlaySolid />
                            </span>
                            <PauseSolid v-else />
                        </button>
                        <button
                            type="button"
                            class="audio-player__skip"
                            aria-label="Forward 15 seconds"
                            :disabled="!canSeek"
                            @click="skip(15)"
                        >
                            <Forward15Seconds />
                        </button>
                    </div>
                </IconoirProvider>

                <div class="audio-player__timeline">
                    <span class="audio-player__time">
                        <span class="audio-player__sr">Elapsed</span>
                        {{ formatTime(current) }}
                    </span>

                    <div class="audio-player__seek">
                        <input
                            class="audio-player__range"
                            type="range"
                            min="0"
                            :max="canSeek ? duration : 0"
                            step="any"
                            :value="current"
                            :disabled="!canSeek"
                            :style="{ '--fill': seekFill }"
                            :aria-valuetext="formatTime(current)"
                            aria-label="Seek"
                            @input="onSeekInput"
                            @change="finishSeek"
                            @pointerup="finishSeek"
                            @keyup="finishSeek"
                        />
                    </div>

                    <span class="audio-player__time audio-player__time--total">
                        <span class="audio-player__sr">Duration</span>
                        {{ formatTime(duration) }}
                    </span>
                </div>

                <button
                    type="button"
                    class="audio-player__speed"
                    :aria-label="`Playback speed ${rateLabel}`"
                    :aria-valuetext="rateLabel"
                    @click="cycleRate"
                >
                    {{ rateLabel }}
                </button>

                <div class="audio-player__volume">
                    <IconoirProvider :icon-props="volumeIcon">
                        <button
                            type="button"
                            class="audio-player__mute"
                            :aria-label="volume === 0 ? 'Unmute' : 'Mute'"
                            @click="toggleMute"
                        >
                            <SoundOffSolid v-if="volume <= 0.02" />
                            <SoundMinSolid v-else-if="volume <= 0.33" />
                            <SoundLowSolid v-else-if="volume <= 0.66" />
                            <SoundHighSolid v-else />
                        </button>
                    </IconoirProvider>
                    <input
                        class="audio-player__range audio-player__level"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        :value="volume"
                        :style="{ '--fill': volumeFill }"
                        :aria-valuetext="`${Math.round(volume * 100)}%`"
                        aria-label="Volume"
                        @input="onVolumeInput"
                    />
                </div>
            </div>

            <p v-if="failed" class="audio-player__error">
                This recording didn't load.
            </p>
        </div>
    </div>
</template>

<style scoped>
.audio-player {
    position: relative;
    margin: 1.25rem 0;
}

.audio-player__panel {
    position: relative;
    z-index: 1;
    padding: 0.85rem 0.95rem 0.8rem;
    border: 1px solid var(--hairline);
    border-radius: var(--radius);
    background: var(--bg);
}

.audio-player__sentinel {
    height: 0;
    margin: 0;
    padding: 0;
    border: 0;
}

.audio-player.audio-player--sticky {
    --stick-gap: 1.5rem;
    position: sticky;
    top: var(--stick-gap);
    z-index: 5;
    margin-top: 0;
}

.audio-player.is-pinned::before {
    content: '';
    position: absolute;
    z-index: 0;
    left: -0.5rem;
    right: -0.5rem;
    top: calc(-1 * var(--stick-gap) - 0.5rem);
    bottom: -0.5rem;
    background: var(--bg);
    pointer-events: none;
}

.audio-player.is-pinned .audio-player__panel {
    box-shadow: 0 10px 22px -16px rgba(0, 0, 0, 0.7);
}

.audio-player__media {
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

.audio-player__head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.6rem;
}

.audio-player__title {
    margin: 0;
    min-width: 0;
    font-family: var(--font);
    font-style: italic;
    font-weight: 400;
    font-size: 0.98rem;
    line-height: 1.3;
    color: var(--muted);
}

.audio-player__download {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-left: auto;
    flex: none;
    padding: 0.35rem 0.6rem;
    border: 0;
    border-radius: var(--radius);
    background: var(--accent);
    color: #fff;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    line-height: 1;
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;
}

.audio-player__download:hover {
    background: var(--accent-soft);
    color: #fff;
    text-decoration: none;
}

.audio-player__download-icon {
    display: flex;
    flex: none;
    line-height: 0;
}

.audio-player__bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem;
}

.audio-player__transport {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex: none;
}

.audio-player__play,
.audio-player__skip,
.audio-player__mute,
.audio-player__speed {
    appearance: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    padding: 0;
    border: 0;
    line-height: 0;
    cursor: pointer;
}

.audio-player__play {
    padding: 0.4rem;
    border-radius: 50%;
    background: var(--text);
    color: var(--bg);
}

.audio-player__play:hover {
    background: var(--accent);
    color: #fff;
}

.audio-player__mute {
    border-radius: var(--radius);
    background: transparent;
    color: var(--text);
}

.audio-player__mute:hover {
    color: var(--accent);
}

.audio-player__speed {
    min-width: 2.6rem;
    padding: 0.3rem 0.4rem;
    border-radius: var(--radius);
    background: transparent;
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-variant-numeric: tabular-nums;
    line-height: 1;
}

.audio-player__speed:hover {
    color: var(--accent);
}

.audio-player__skip {
    background: transparent;
    color: var(--text);
}

.audio-player__skip:hover:not(:disabled) {
    color: var(--accent);
}

.audio-player__skip:disabled {
    cursor: default;
    opacity: 0.45;
}

.audio-player__play:focus-visible,
.audio-player__skip:focus-visible,
.audio-player__mute:focus-visible,
.audio-player__speed:focus-visible,
.audio-player__download:focus-visible,
.audio-player__range:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
}

.audio-player__play svg {
    width: 1.1rem;
    height: 1.1rem;
    display: block;
}

.audio-player__play svg path {
    fill: currentColor;
}

.audio-player__glyph--play {
    /* Iconoir's triangle sits left of the frame. Nudge it onto the button center. */
    display: block;
    transform: translateX(6%);
}

.audio-player__timeline {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex: 1 1 12rem;
    min-width: 0;
}

.audio-player__time {
    flex: none;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: var(--muted);
}

.audio-player__time--total {
    text-align: right;
}

.audio-player__seek {
    flex: 1 1 8rem;
    min-width: 4rem;
}

.audio-player__volume {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex: 1 1 7rem;
    width: auto;
    max-width: 7.5rem;
}

.audio-player__level {
    flex: 1;
    min-width: 0;
    width: auto;
}

.audio-player__range {
    appearance: none;
    -webkit-appearance: none;
    display: block;
    width: 100%;
    height: 1.25rem;
    margin: 0;
    padding: 0;
    background: transparent;
    cursor: pointer;
    --fill: 0%;
}

.audio-player__range:disabled {
    cursor: default;
    opacity: 0.45;
}

.audio-player__range::-webkit-slider-runnable-track {
    height: 3px;
    border-radius: 2px;
    background: linear-gradient(
        to right,
        var(--accent) var(--fill),
        var(--hairline) var(--fill)
    );
}

.audio-player__range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 0.75rem;
    height: 0.75rem;
    margin-top: calc((3px - 0.75rem) / 2);
    border: 0;
    border-radius: 50%;
    background: var(--text);
}

.audio-player__range::-moz-range-track {
    height: 3px;
    border: 0;
    border-radius: 2px;
    background: var(--hairline);
}

.audio-player__range::-moz-range-progress {
    height: 3px;
    border-radius: 2px;
    background: var(--accent);
}

.audio-player__range::-moz-range-thumb {
    width: 0.75rem;
    height: 0.75rem;
    border: 0;
    border-radius: 50%;
    background: var(--text);
}

.audio-player__error {
    margin: 0.55rem 0 0;
    font-style: italic;
    font-size: 0.85rem;
    color: var(--muted);
}

.audio-player__sr {
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

@media (max-width: 560px) {
    .audio-player__bar {
        gap: 0.55rem 0.65rem;
    }

    .audio-player__timeline {
        order: 3;
        flex: 1 1 100%;
        width: 100%;
    }

    .audio-player__speed {
        margin-left: auto;
    }

    .audio-player__volume {
        flex: none;
        width: auto;
        max-width: 6.5rem;
    }
}
</style>

<style>
::highlight(spoken) {
    background-color: var(--accent);
    color: #fff;
}

.spoken-wake {
    outline: 1px solid transparent;
}

.spoken-word.is-spoken {
    background-color: var(--accent);
    color: #fff;
}
</style>
