import {
    BODY_FONTS,
    BODY_FONT_STORAGE_KEY,
    DEFAULT_BODY_FONT,
    isBodyFontId,
    type BodyFontId,
} from '~/utils/fonts';

export function useBodyFont() {
    const id = useState<BodyFontId>('body-font', () => DEFAULT_BODY_FONT);

    const applyClass = (next: BodyFontId) => {
        if (!import.meta.client) return;
        for (const font of BODY_FONTS) {
            document.documentElement.classList.remove(`font-${font.id}`);
        }
        document.documentElement.classList.add(`font-${next}`);
    };

    const setFont = (next: BodyFontId) => {
        id.value = next;
        applyClass(next);
        if (import.meta.client) {
            localStorage.setItem(BODY_FONT_STORAGE_KEY, next);
        }
    };

    onMounted(() => {
        const saved = localStorage.getItem(BODY_FONT_STORAGE_KEY);
        const next = isBodyFontId(saved) ? saved : id.value;
        setFont(next);
    });

    return { id, setFont, fonts: BODY_FONTS };
}
