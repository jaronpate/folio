import {
    BG_THEMES,
    BG_THEME_STORAGE_KEY,
    DEFAULT_BG_THEME,
    colorModeForTheme,
    isBgThemeId,
    resolveBgTheme,
    type BgThemeId,
} from '~/utils/themes';

type WritableColorMode = {
    preference: string;
    value: string;
    forced: boolean;
};

let stopForcedThemeGuard: (() => void) | null = null;

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        stopForcedThemeGuard?.();
        stopForcedThemeGuard = null;
    });
}

export function useBgTheme() {
    const id = useState<BgThemeId>('bg-theme', () => DEFAULT_BG_THEME);
    const preference = useState<BgThemeId>(
        'bg-theme-preference',
        () => DEFAULT_BG_THEME,
    );
    const forced = useState<BgThemeId | null>('bg-theme-forced', () => null);
    const preferenceReady = useState('bg-theme-preference-ready', () => false);
    const colorMode = useColorMode() as WritableColorMode;

    const applyDom = (next: BgThemeId, lock: boolean) => {
        if (!import.meta.client) return;
        const root = document.documentElement;
        for (const theme of BG_THEMES) {
            root.classList.remove(`theme-${theme.id}`);
        }
        root.classList.add(`theme-${next}`);

        const mode = colorModeForTheme(next);
        if (lock) {
            // Show the page theme without writing the visitor's saved mode.
            colorMode.forced = true;
            colorMode.value = mode;
            return;
        }
        colorMode.forced = false;
        colorMode.preference = mode;
        colorMode.value = mode;
    };

    const publish = () => {
        // Wait to read localStorage before falling back, or the boot script's
        // saved theme gets replaced by the default for a frame.
        if (!forced.value && !preferenceReady.value) return;
        const active = resolveBgTheme(
            forced.value,
            preferenceReady.value ? preference.value : null,
        );
        id.value = active;
        applyDom(active, forced.value !== null);
    };

    const setTheme = (next: BgThemeId) => {
        preference.value = next;
        forced.value = null;
        preferenceReady.value = true;
        if (import.meta.client) {
            localStorage.setItem(BG_THEME_STORAGE_KEY, next);
        }
        publish();
    };

    const setForcedTheme = (next: string | null | undefined) => {
        forced.value = isBgThemeId(next) ? next : null;
        publish();
    };

    onMounted(() => {
        const saved = localStorage.getItem(BG_THEME_STORAGE_KEY);
        if (isBgThemeId(saved)) preference.value = saved;
        preferenceReady.value = true;
        publish();
    });

    installForcedThemeGuard(colorMode, () => {
        if (!forced.value) return;
        const mode = colorModeForTheme(forced.value);
        if (colorMode.forced && colorMode.value === mode) return;
        publish();
    });

    const current = computed(
        () => BG_THEMES.find((theme) => theme.id === id.value) ?? BG_THEMES[0],
    );

    return {
        id,
        current,
        setTheme,
        setForcedTheme,
        themes: BG_THEMES,
    };
}

function installForcedThemeGuard(
    colorMode: WritableColorMode,
    sync: () => void,
) {
    if (!import.meta.client || stopForcedThemeGuard) return;
    const scope = effectScope(true);
    stopForcedThemeGuard = () => scope.stop();
    scope.run(() => {
        watch(
            () => [colorMode.value, colorMode.forced] as const,
            () => sync(),
        );
    });
}
