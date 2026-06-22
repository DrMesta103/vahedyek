import { ClassValue } from 'clsx';

declare function cn(...inputs: ClassValue[]): string;

type TokenCategory = 'color' | 'semantic' | 'typography' | 'spacing' | 'radius' | 'shadow' | 'focus' | 'motion' | 'component' | 'business-sidebar';
type TokenEntry = {
    name: string;
    cssVar: string;
    value: string;
    description: string;
    category: TokenCategory;
    preview?: 'color' | 'radius' | 'shadow' | 'spacing' | 'text' | 'none';
    themeAware?: boolean;
};
declare const TAAV_TOKEN_CATALOG: TokenEntry[];
declare const TAAV_TOKEN_SECTIONS: Array<{
    id: string;
    title: string;
    titleFa: string;
    categories: TokenCategory[];
}>;

type TaavTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
declare const TAAV_TONE_LABELS: Record<TaavTone, string>;
declare const TAAV_RADIUS: {
    readonly sm: "var(--taav-radius-sm)";
    readonly md: "var(--taav-radius-md)";
    readonly lg: "var(--taav-radius-lg)";
    readonly xl: "var(--taav-radius-xl)";
    readonly xxl: "var(--taav-radius-xxl)";
    readonly pill: "var(--taav-radius-pill)";
};
declare const TAAV_SHADOW: {
    readonly xs: "var(--taav-shadow-xs)";
    readonly sm: "var(--taav-shadow-sm)";
    readonly md: "var(--taav-shadow-md)";
    readonly lg: "var(--taav-shadow-lg)";
};
declare const TAAV_SPACING: {
    readonly 0: "var(--taav-space-0)";
    readonly 1: "var(--taav-space-1)";
    readonly 2: "var(--taav-space-2)";
    readonly 3: "var(--taav-space-3)";
    readonly 4: "var(--taav-space-4)";
    readonly 5: "var(--taav-space-5)";
    readonly 6: "var(--taav-space-6)";
    readonly 8: "var(--taav-space-8)";
    readonly 10: "var(--taav-space-10)";
    readonly 12: "var(--taav-space-12)";
};
declare const TAAV_BUTTON_HEIGHT: {
    readonly xs: "var(--taav-btn-height-xs)";
    readonly sm: "var(--taav-btn-height-sm)";
    readonly md: "var(--taav-btn-height-md)";
    readonly lg: "var(--taav-btn-height-lg)";
    readonly xl: "var(--taav-btn-height-xl)";
};
declare const TAAV_DURATION: {
    readonly fast: "var(--taav-duration-fast)";
    readonly normal: "var(--taav-duration-normal)";
    readonly slow: "var(--taav-duration-slow)";
};

export { TAAV_BUTTON_HEIGHT as T, TAAV_DURATION as a, TAAV_RADIUS as b, TAAV_SHADOW as c, TAAV_SPACING as d, TAAV_TOKEN_CATALOG as e, TAAV_TOKEN_SECTIONS as f, TAAV_TONE_LABELS as g, type TaavTone as h, type TokenCategory as i, type TokenEntry as j, cn as k };
