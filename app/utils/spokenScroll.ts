export const SCROLL_TOP = 150;
export const SCROLL_BOTTOM = 32;
const EDGE_PAD = 24;
const LOCK_MIN_MS = 700;
const LOCK_MAX_MS = 2500;
const LOCK_MS_PER_PX = 1.25;
const INSTANT_JUMP_PX = 240;

export type ViewRect = {
    top: number;
    bottom: number;
    width: number;
    height: number;
};

export function spokenInView(
    rect: ViewRect,
    viewportHeight: number,
    scrollTop = SCROLL_TOP,
    scrollBottom = SCROLL_BOTTOM,
) {
    if (rect.width === 0 && rect.height === 0) return false;
    return (
        rect.top >= scrollTop - 1 &&
        rect.bottom <= viewportHeight - scrollBottom + 1
    );
}

export function spokenScrollDelta(
    rect: ViewRect,
    viewportHeight: number,
    scrollTop = SCROLL_TOP,
    scrollBottom = SCROLL_BOTTOM,
) {
    if (rect.width === 0 && rect.height === 0) return 0;
    const bottomLimit = viewportHeight - scrollBottom;
    if (rect.top >= scrollTop && rect.bottom <= bottomLimit) return 0;
    if (rect.top < scrollTop) return rect.top - scrollTop - EDGE_PAD;
    return rect.bottom - bottomLimit + EDGE_PAD;
}

export function spokenScrollLockMs(delta: number, smooth: boolean) {
    if (!delta) return 0;
    if (!smooth) return LOCK_MIN_MS;
    return Math.min(
        LOCK_MAX_MS,
        Math.max(LOCK_MIN_MS, Math.abs(delta) * LOCK_MS_PER_PX),
    );
}

export function spokenScrollBehavior(
    delta: number,
    preferReduceMotion: boolean,
) {
    if (!delta) return 'auto' as const;
    if (preferReduceMotion || Math.abs(delta) >= INSTANT_JUMP_PX) {
        return 'auto' as const;
    }
    return 'smooth' as const;
}
