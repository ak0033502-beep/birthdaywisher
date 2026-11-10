/**
 * Viewer skins: colour/typography tokens for the single v2 viewer engine.
 * Maps every colour theme the v1 wizard can save (neon, elegant, pastel, monochrome, paper
 * and the 6 anniversary themes) to CSS variables. Unknown themes fall back to "neon"
 * (the same fallback today's StoryViewer uses).
 */
export interface Skin {
    bg: string;          // page background (CSS background value)
    text: string;
    muted: string;
    accent: string;
    accent2: string;
    card: string;        // card background
    cardBorder: string;
    font: string;        // CSS font-family
    dark: boolean;
}

const sans = "var(--font-nunito), var(--font-geist-sans), system-ui, sans-serif";
const display = "var(--font-baloo), var(--font-geist-sans), system-ui, sans-serif";
const serif = "Georgia, 'Times New Roman', serif";

export const SKINS: Record<string, Skin> = {
    neon: { bg: "radial-gradient(ellipse at top, #312e81 0%, #09090b 60%, #000 100%)", text: "#ffffff", muted: "rgba(255,255,255,.7)", accent: "#ec4899", accent2: "#22d3ee", card: "rgba(255,255,255,.06)", cardBorder: "rgba(255,255,255,.12)", font: sans, dark: true },
    elegant: { bg: "radial-gradient(ellipse at top, #292524 0%, #000 65%)", text: "#fefce8", muted: "rgba(254,252,232,.7)", accent: "#facc15", accent2: "#f59e0b", card: "rgba(24,24,27,.6)", cardBorder: "rgba(234,179,8,.25)", font: serif, dark: true },
    pastel: { bg: "conic-gradient(from 200deg at 100% 0%, #ffe4e6, #ccfbf1, #ede9fe, #ffe4e6)", text: "#1e293b", muted: "rgba(30,41,59,.7)", accent: "#f43f5e", accent2: "#8b5cf6", card: "rgba(255,255,255,.65)", cardBorder: "#ffffff", font: sans, dark: false },
    monochrome: { bg: "linear-gradient(180deg, #27272a, #09090b)", text: "#ffffff", muted: "rgba(255,255,255,.65)", accent: "#ffffff", accent2: "#a1a1aa", card: "rgba(0,0,0,.4)", cardBorder: "rgba(255,255,255,.12)", font: serif, dark: true },
    paper: { bg: "#d4c5b0", text: "#3e3222", muted: "rgba(62,50,34,.75)", accent: "#8b3a3a", accent2: "#5e2727", card: "rgba(253,251,247,.92)", cardBorder: "#d4c5ab", font: serif, dark: false },
    party: { bg: "radial-gradient(900px 500px at 10% -10%, #FFE3EC, transparent 60%), radial-gradient(800px 500px at 100% 0%, #FFF1C9, transparent 55%), #FFF8F0", text: "#2B2240", muted: "#6B6380", accent: "#FF5C8A", accent2: "#7C5CFF", card: "#ffffff", cardBorder: "rgba(43,34,64,.1)", font: sans, dark: false },
    // Anniversary themes
    "rosegold-elegance": { bg: "linear-gradient(160deg, #3b1d2a, #120a10)", text: "#fff1f2", muted: "rgba(255,241,242,.7)", accent: "#fda4af", accent2: "#f9a8d4", card: "rgba(255,255,255,.06)", cardBorder: "rgba(253,164,175,.3)", font: serif, dark: true },
    "golden-anniversary": { bg: "radial-gradient(ellipse at top, #3f2d0c, #0c0a05 70%)", text: "#fef9c3", muted: "rgba(254,249,195,.7)", accent: "#fbbf24", accent2: "#d97706", card: "rgba(0,0,0,.45)", cardBorder: "rgba(251,191,36,.3)", font: serif, dark: true },
    "moonlit-romance": { bg: "radial-gradient(ellipse at top, #1e1b4b, #020617 70%)", text: "#e0e7ff", muted: "rgba(224,231,255,.7)", accent: "#a5b4fc", accent2: "#f0abfc", card: "rgba(255,255,255,.06)", cardBorder: "rgba(165,180,252,.25)", font: serif, dark: true },
    "vintage-love": { bg: "#e9dcc9", text: "#4a3426", muted: "rgba(74,52,38,.75)", accent: "#9f1239", accent2: "#7c2d12", card: "rgba(255,251,245,.92)", cardBorder: "#d6c3a5", font: serif, dark: false },
    "cherry-blossom": { bg: "linear-gradient(180deg, #fff1f2, #fce7f3)", text: "#500724", muted: "rgba(80,7,36,.7)", accent: "#db2777", accent2: "#f472b6", card: "rgba(255,255,255,.75)", cardBorder: "#fbcfe8", font: sans, dark: false },
    "royal-navy": { bg: "radial-gradient(ellipse at top, #1e3a8a, #020617 70%)", text: "#f8fafc", muted: "rgba(248,250,252,.7)", accent: "#fbbf24", accent2: "#60a5fa", card: "rgba(255,255,255,.06)", cardBorder: "rgba(251,191,36,.25)", font: serif, dark: true },
};

export function getSkin(theme: string | undefined): Skin {
    return (theme && SKINS[theme]) || SKINS.neon;
}

/** CSS variables consumed by viewer.css */
export function skinVars(s: Skin): Record<string, string> {
    return {
        "--v-bg": s.bg, "--v-text": s.text, "--v-muted": s.muted, "--v-accent": s.accent, "--v-accent2": s.accent2,
        "--v-card": s.card, "--v-card-border": s.cardBorder, "--v-font": s.font, "--v-display": display,
    };
}
