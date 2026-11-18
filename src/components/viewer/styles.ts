/**
 * Presentation styles for the v2 viewer engine.
 * Every style renders ALL blocks (same slides, same gates, same games) — a style changes
 * the world: cover ritual, intro sequence, frame, typography, colours, motion and sound.
 * Every skin × every style produces a distinct combination (36 unique looks).
 */
import type { Skin } from "./skins";

export type StyleId = "cinematic" | "terminal" | "storybook" | "messenger" | "galaxy" | "gallery";
export const STYLE_IDS: StyleId[] = ["cinematic", "terminal", "storybook", "messenger", "galaxy", "gallery"];

export function normalizeStyle(s: string | undefined): StyleId {
    return (STYLE_IDS as string[]).includes(s || "") ? (s as StyleId) : "cinematic";
}

export interface StyleMeta {
    e: string;
    t: string;
    d: string;
    music: string;
    tag: string;
    bestSkin: string;
    colours: "skin" | "accent" | "own";
}

/** Shown in the wizard. Every style has its own gentle, drum-free soundtrack + responds to colour mood. */
export const STYLE_INFO: Record<StyleId, StyleMeta> = {
    cinematic: { e: "🎬", t: "Cinematic", d: "Movie intro, 3D depth & spotlight", music: "🎵 Warm Soulful Piano", tag: "Most popular", bestSkin: "neon", colours: "skin" },
    messenger: { e: "💬", t: "Secret Chat", d: "Live typing bubbles & quick reactions", music: "🎵 Sweet Acoustic Guitar", tag: "Feels personal", bestSkin: "party", colours: "accent" },
    storybook: { e: "📖", t: "Storybook", d: "3D page turns, drop-caps & taped photos", music: "🎵 Fairytale Music Box", tag: "Warm & poetic", bestSkin: "paper", colours: "accent" },
    gallery: { e: "🖼️", t: "Art Museum", d: "Spotlight hall, gold frames & plaques", music: "🎵 Peaceful Concert Harp", tag: "Pure class", bestSkin: "elegant", colours: "accent" },
    galaxy: { e: "🪐", t: "Space Odyssey", d: "Rocket launch, warp speed & planets", music: "🎵 Deep Space Ambient", tag: "Sci-fi epic", bestSkin: "neon", colours: "accent" },
    terminal: { e: "💻", t: "Hacker Terminal", d: "Live decrypting code & CRT glow", music: "🎵 Dreamy Synth Pad", tag: "Geeky fun", bestSkin: "neon", colours: "accent" },
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
export function styleSkin(style: StyleId, skin: Skin, themeId?: string): Skin & { display?: string } {
    switch (style) {
        case "terminal": {
            // Phosphor palette adapts to the chosen colour mood (green, amber CRT, cyber sakura, white Apple-II, ice mainframe)
            const warm = themeId === "elegant" || themeId === "golden-anniversary" || themeId === "paper" || themeId === "vintage-love";
            const pink = themeId === "pastel" || themeId === "cherry-blossom" || themeId === "rosegold-elegance" || themeId === "party";
            const monoWhite = themeId === "monochrome";
            const ice = themeId === "moonlit-romance" || themeId === "royal-navy";
            const p = warm ? ["#ffb84d", "#ffe08a", "#0b0702"]
                : pink ? ["#ff7ac6", "#7cf6ff", "#09040c"]
                : monoWhite ? ["#f4f4f5", "#a1a1aa", "#050506"]
                : ice ? ["#67e8f9", "#a78bfa", "#030712"]
                : ["#3dff7e", "#16d9ff", "#040804"];
            return {
                bg: p[2], text: p[0], muted: `color-mix(in srgb, ${p[0]} 72%, transparent)`,
                accent: p[0], accent2: p[1],
                card: `color-mix(in srgb, ${p[0]} 6%, transparent)`,
                cardBorder: `color-mix(in srgb, ${p[0]} 50%, transparent)`,
                font: mono, display: mono, dark: true,
            };
        }
        case "storybook": {
            // Warm parchment pages; leather desk & rubric ink adapt to the user's colour mood
            const ink = onLight(skin.accent, themeId === "monochrome" ? "#27272a" : "#a8324f");
            const ink2 = onLight(skin.accent2, "#8a5a2b");
            const desk = themeId === "neon" || themeId === "moonlit-romance" || themeId === "royal-navy"
                ? "radial-gradient(ellipse at center, #2c2248 0%, #140e24 100%)"
                : themeId === "pastel" || themeId === "cherry-blossom"
                ? "radial-gradient(ellipse at center, #6e4558 0%, #3a202d 100%)"
                : themeId === "monochrome"
                ? "radial-gradient(ellipse at center, #323236 0%, #141417 100%)"
                : "radial-gradient(ellipse at center, #6b4430 0%, #3b2418 100%)";
            return {
                bg: desk, text: "#3e2c1c", muted: "rgba(62,44,28,.72)",
                accent: ink, accent2: ink2,
                card: "rgba(255,250,238,.7)", cardBorder: "#d9c6a0", font: serif, display: serif, dark: false,
            };
        }
        case "messenger":
            return skin.dark
                ? { bg: "#0b141a", text: "#e9edef", muted: "rgba(233,237,239,.65)", accent: lum(skin.accent) > 0.6 ? "#db2777" : skin.accent, accent2: lum(skin.accent2) > 0.6 ? "#6366f1" : skin.accent2, card: "#1f2c34", cardBorder: "rgba(255,255,255,.08)", font: sans, dark: true }
                : { bg: "#efeae2", text: "#111b21", muted: "rgba(17,27,33,.62)", accent: onLight(skin.accent, "#128c7e"), accent2: onLight(skin.accent2, "#075e54"), card: "#ffffff", cardBorder: "rgba(0,0,0,.08)", font: sans, dark: false };
        case "galaxy":
            return { bg: `radial-gradient(900px 600px at 15% 10%, color-mix(in srgb, ${skin.accent} 28%, transparent), transparent 60%), radial-gradient(800px 600px at 90% 90%, color-mix(in srgb, ${skin.accent2} 26%, transparent), transparent 60%), linear-gradient(180deg, #070616, #02010a)`, text: "#f4f1ff", muted: "rgba(244,241,255,.7)", accent: skin.accent, accent2: skin.accent2, card: "rgba(18,14,48,.55)", cardBorder: `color-mix(in srgb, ${skin.accent} 45%, transparent)`, font: sans, dark: true };
        case "gallery":
            return { bg: skin.dark ? "linear-gradient(180deg, #2b2724 0%, #1d1a18 78%, #3a2a1e 78%, #2a1d14 100%)" : "linear-gradient(180deg, #f1ebe2 0%, #e6ddd0 78%, #8a6446 78%, #6e4e36 100%)", text: "#2b2420", muted: "rgba(43,36,32,.7)", accent: onLight(skin.accent, "#8b3a3a"), accent2: onLight(skin.accent2, "#5e2727"), card: "rgba(43,36,32,.05)", cardBorder: "rgba(43,36,32,.14)", font: serif, display: serif, dark: false };
        default:
            return skin;
    }
}
