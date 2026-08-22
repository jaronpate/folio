const WIDE = '(min-width: 1200px)';
const GAP = 8;

export function stackMarginNotes() {
    if (!import.meta.client) return;

    const notes = Array.from(
        document.querySelectorAll<HTMLElement>('.margin-note'),
    );

    if (!window.matchMedia(WIDE).matches) {
        for (const note of notes) note.style.top = '';
        return;
    }

    for (const note of notes) note.style.top = '';

    let previousBottom = Number.NEGATIVE_INFINITY;

    for (const note of notes) {
        const article = note.closest('article');
        const mark = note
            .closest('.margin-note-root')
            ?.querySelector<HTMLElement>('.margin-note-mark');
        if (!article || !mark) continue;

        const articleTop = article.getBoundingClientRect().top;
        let top = mark.getBoundingClientRect().top - articleTop;
        if (top < previousBottom + GAP) {
            top = previousBottom + GAP;
        }

        note.style.top = `${Math.max(0, top)}px`;
        previousBottom = top + note.offsetHeight;
    }
}

let listening = false;

export function watchMarginNotes() {
    if (!import.meta.client || listening) {
        stackMarginNotes();
        return;
    }

    listening = true;
    const run = () => stackMarginNotes();

    window.addEventListener('resize', run);
    document.fonts?.ready.then(run);
    new ResizeObserver(run).observe(document.documentElement);
    new MutationObserver(run).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });
    run();
}
