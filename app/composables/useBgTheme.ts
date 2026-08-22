import {
    BG_THEMES,
    BG_THEME_STORAGE_KEY,
    DEFAULT_BG_THEME,
    isBgThemeId,
    type BgThemeId,
} from '~/utils/themes';

export function useBgTheme() {
    const id = useState<BgThemeId>('bg-theme', () => DEFAULT_BG_THEME);
    const colorMode = useColorMode();

    const current = computed(
        () => BG_THEMES.find((theme) => theme.id === id.value) ?? BG_THEMES[0],
    );

    const applyClass = (next: BgThemeId) => {
        if (!import.meta.client) return;
        for (const theme of BG_THEMES) {
            document.documentElement.classList.remove(`theme-${theme.id}`);
        }
        document.documentElement.classList.add(`theme-${next}`);
        colorMode.preference = next === 'paper' ? 'light' : 'dark';
    };

    const setTheme = (next: BgThemeId) => {
        id.value = next;
        applyClass(next);
        if (import.meta.client) {
            localStorage.setItem(BG_THEME_STORAGE_KEY, next);
        }
    };

    onMounted(() => {
        const saved = localStorage.getItem(BG_THEME_STORAGE_KEY);
        const next = isBgThemeId(saved) ? saved : id.value;
        setTheme(next);
    });

    return { id, current, setTheme, themes: BG_THEMES };
}
