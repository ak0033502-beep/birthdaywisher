/**
 * Presentation styles for the v2 viewer engine.
 * Every style renders ALL blocks (same slides, same gates, same games) — a style only changes
 * the frame, typography, colours, cover screen and transitions. So nothing ever goes missing.
 */
import type { Skin } from "./skins";

export type StyleId = "cinematic" | "terminal" | "storybook" | "messenger" | "galaxy" | "gallery";
export const STYLE_IDS: StyleId[] = ["cinematic", "terminal", "storybook", "messenger", "galaxy", "gallery"];

export function normalizeStyle(s: string | undefined): StyleId {
    return (STYLE_IDS as string[]).includes(s || "") ? (s as StyleId) : "cinematic";
}

/** Shown in the wizard. `colours` says how the colour skin is used. */
export const STYLE_INFO: Record<StyleId, { e: string; t: string; d: string; colours: "skin" | "accent" | "own" }> = {
    cinematic: { e: "🎬", t: "Cinematic", d: "Smooth 3D slides", colours: "skin" },
    terminal: { e: "💻", t: "Hacker Terminal", d: "Green code that types itself", colours: "own" },
    storybook: { e: "📖", t: "Storybook", d: "Turn the pages of a story", colours: "own" },
    messenger: { e: "💬", t: "Secret Chat", d: "Pops in like chat messages", colours: "accent" },
    galaxy: { e: "🪐", t: "Space Odyssey", d: "Fly past planets & rockets", colours: "accent" },
    gallery: { e: "🖼️", t: "Art Museum", d: "Every moment in a gold frame", colours: "accent" },
};

const mono = "var(--font-geist-mono), ui-monospace, 'Courier New', monospace";
const serif = "Georgia, 'Times New Roman', serif";
const sans = "var(--font-nunito), var(--font-geist-sans), system-ui, sans-serif";

/** Relative luminance (0..1) of a #rrggbb colour; non-hex values count as mid-tone. */
function lum(c: string): number {
    const m = /^#([0-9a-f]{6})$/i.exec(c.trim());
    if (!m) return 0.5;
    const n = parseInt(m[1], 16);
    const ch = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
/** Accent that stays readable on a light surface (e.g. the Monochrome skin's white accent). */
const onLight = (c: string, fallback: string) => (lum(c) > 0.6 ? fallback : c);

/** Final colour tokens for a style + the user's colour skin. */
export function styleSkin(style: StyleId, skin: Skin): Skin & { display?: string } {
    switch (style) {
        case "terminal":
            return { bg: "#040804", text: "#3dff7e", muted: "rgba(61,255,126,.72)", accent: "#3dff7e", accent2: "#16d9ff", card: "rgba(61,255,126,.06)", cardBorder: "rgba(61,255,126,.5)", font: mono, display: mono, dark: true };
        case "storybook":
            return { bg: "radial-gradient(ellipse at center, #6b4430 0%, #3b2418 100%)", text: "#3e2c1c", muted: "rgba(62,44,28,.72)", accent: "#a8324f", accent2: "#8a5a2b", card: "rgba(255,250,238,.7)", cardBorder: "#d9c6a0", font: serif, display: serif, dark: false };
        case "messenger":
            return skin.dark
                ? { bg: "#0b141a", text: "#e9edef", muted: "rgba(233,237,239,.65)", accent: lum(skin.accent) > 0.6 ? "#3b4a54" : skin.accent, accent2: lum(skin.accent2) > 0.6 ? "#54656f" : skin.accent2, card: "#202c33", cardBorder: "rgba(255,255,255,.08)", font: sans, dark: true }
                : { bg: "#efeae2", text: "#111b21", muted: "rgba(17,27,33,.62)", accent: onLight(skin.accent, "#128c7e"), accent2: onLight(skin.accent2, "#075e54"), card: "#ffffff", cardBorder: "rgba(0,0,0,.08)", font: sans, dark: false };
        case "galaxy":
            return { bg: `radial-gradient(900px 600px at 15% 10%, color-mix(in srgb, ${skin.accent} 28%, transparent), transparent 60%), radial-gradient(800px 600px at 90% 90%, color-mix(in srgb, ${skin.accent2} 26%, transparent), transparent 60%), linear-gradient(180deg, #070616, #02010a)`, text: "#f4f1ff", muted: "rgba(244,241,255,.7)", accent: skin.accent, accent2: skin.accent2, card: "rgba(18,14,48,.55)", cardBorder: `color-mix(in srgb, ${skin.accent} 45%, transparent)`, font: sans, dark: true };
        case "gallery":
            return { bg: skin.dark ? "linear-gradient(180deg, #2b2724 0%, #1d1a18 78%, #3a2a1e 78%, #2a1d14 100%)" : "linear-gradient(180deg, #f1ebe2 0%, #e6ddd0 78%, #8a6446 78%, #6e4e36 100%)", text: "#2b2420", muted: "rgba(43,36,32,.7)", accent: onLight(skin.accent, "#8b3a3a"), accent2: onLight(skin.accent2, "#5e2727"), card: "rgba(43,36,32,.05)", cardBorder: "rgba(43,36,32,.14)", font: serif, display: serif, dark: false };
        default:
            return skin;
    }
}
