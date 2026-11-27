/**
 * Per-style & multi-mode soundtrack engine for the wish viewer & wizard preview.
 * Supports:
 *  - "instrumental" (default; also used for legacy "lofi"/"piano"/""): gentle CC0 score per style (/bgm/<style>.mp3)
 *  - "vocal": custom studio vocal song tailored to each of the 6 styles (/bgm/<style>-vocal.mp3)
 *  - "hindi": universal unplugged Hindi acoustic & bansuri song (/bgm/hindi-unplugged.mp3)
 *  - "midnight-pop": euphoric Scandinavian synth-pop celebration song (/bgm/gold-in-your-eyes.mp3)
 *  - "soul-anthem": soaring soulful English ballad (/bgm/love-runs-deep.mp3)
 *  - "none": silent mode (no background music)
 *
 * Emotion-first mix:
 *  - Seamlessly loops via Web Audio AudioBufferSourceNode & crossfades smoothly when switching modes/styles
 *  - Gently softens on emotional text slides so heartfelt words stay readable
 *  - Auto-ducks 90% whenever any recorded voice note (<audio>) or memory <video> plays
 *  - Fades out cleanly on the Grand Finale (where firework SFX & Happy Birthday melody take over)
 */
import type { StyleId } from "@/components/viewer/styles";
import { isMutedPref } from "./sfx";
import { unlockUi } from "./uiSound";

export type SoundtrackMode = "instrumental" | "vocal" | "hindi" | "midnight-pop" | "soul-anthem" | "none";

export interface SoundtrackOption {
    id: SoundtrackMode;
    icon: string;
    label: string;
    sub: string;
}

export const SOUNDTRACK_OPTIONS: SoundtrackOption[] = [
    { id: "instrumental", icon: "🎹", label: "Instrumental", sub: "Soft style score · best for reading" },
    { id: "vocal", icon: "🎤", label: "Style Song", sub: "Lyrics matched to chosen style" },
    { id: "hindi", icon: "🎶", label: "Hindi Unplugged", sub: "Acoustic guitar & bansuri song" },
    { id: "midnight-pop", icon: "🎧", label: "Gold in Your Eyes", sub: "Midnight synth-pop anthem" },
    { id: "soul-anthem", icon: "💜", label: "Soulful Ballad", sub: "Emotional English anthem" },
    { id: "none", icon: "🔇", label: "No Music", sub: "Silent reading mode" },
];

export const STYLE_BGM_FILES: Record<StyleId, string> = {
    cinematic: "/bgm/cinematic.mp3",
    terminal: "/bgm/terminal.mp3",
    storybook: "/bgm/storybook.mp3",
    messenger: "/bgm/messenger.mp3",
    galaxy: "/bgm/galaxy.mp3",
    gallery: "/bgm/gallery.mp3",
};

export const STYLE_VOCAL_FILES: Record<StyleId, string> = {
    cinematic: "/bgm/cinematic-vocal.mp3",
    terminal: "/bgm/terminal-vocal.mp3",
    storybook: "/bgm/storybook-vocal.mp3",
    messenger: "/bgm/messenger-vocal.mp3",
    galaxy: "/bgm/galaxy-vocal.mp3",
    gallery: "/bgm/gallery-vocal.mp3",
};

export function normalizeSoundtrack(raw?: string | null): SoundtrackMode {
    if (raw === "vocal" || raw === "hindi" || raw === "midnight-pop" || raw === "soul-anthem" || raw === "none") {
        return raw;
    }
    return "instrumental";
}

export function resolveBgmUrl(style: StyleId, soundtrack?: string | null): string | null {
    const mode = normalizeSoundtrack(soundtrack);
    switch (mode) {
        case "none":
            return null;
        case "vocal":
            return STYLE_VOCAL_FILES[style] || STYLE_VOCAL_FILES.cinematic;
        case "hindi":
            return "/bgm/hindi-unplugged.mp3";
        case "midnight-pop":
            return "/bgm/gold-in-your-eyes.mp3";
        case "soul-anthem":
            return "/bgm/love-runs-deep.mp3";
        case "instrumental":
        default:
            return STYLE_BGM_FILES[style] || STYLE_BGM_FILES.cinematic;
    }
}

const rawCache = new Map<string, Promise<ArrayBuffer | null>>();
const decodedCache = new Map<string, Promise<AudioBuffer | null>>();

/** Start downloading a soundtrack file in the background (safe before user gesture). */
export function prefetchStyleBgm(style: StyleId, soundtrack?: string | null): Promise<ArrayBuffer | null> {
    if (typeof fetch === "undefined") return Promise.resolve(null);
    const url = resolveBgmUrl(style, soundtrack);
    if (!url) return Promise.resolve(null);
    let p = rawCache.get(url);
    if (!p) {
        p = fetch(url)
            .then((r) => (r.ok ? r.arrayBuffer() : null))
            .catch(() => null);
        rawCache.set(url, p);
    }
    return p;
}

function decodeBgmUrl(ctx: AudioContext, style: StyleId, soundtrack?: string | null): Promise<AudioBuffer | null> {
    const url = resolveBgmUrl(style, soundtrack);
    if (!url) return Promise.resolve(null);
    let p = decodedCache.get(url);
    if (!p) {
        p = prefetchStyleBgm(style, soundtrack).then((ab) =>
            ab
                ? new Promise<AudioBuffer | null>((res) => {
                    try { ctx.decodeAudioData(ab.slice(0), res, () => res(null)); } catch { res(null); }
                })
                : null,
        );
        decodedCache.set(url, p);
    }
    return p;
}

export interface BgmController {
    setStyle(style: StyleId): void;
    setTrack(style: StyleId, soundtrack?: string | null): void;
    /** 0 = silent (finale), ~0.76 = gentle emotional reading cushion, 1 = normal. */
    setIntensity(level: number): void;
    setMuted(muted: boolean): void;
    stop(): void;
}

export function startBgm(
    initialStyle: StyleId,
    ignoreGlobalMute = false,
    initialSoundtrack?: string | null,
): BgmController | null {
    const ctx = unlockUi();
    if (!ctx) return null;

    let currentStyle: StyleId = initialStyle;
    let currentMode: SoundtrackMode = normalizeSoundtrack(initialSoundtrack);
    let muted = ignoreGlobalMute ? false : isMutedPref();
    let intensity = 1;
    let ducked = false;
    let alive = true;
    let activeTrack: { url: string; src: AudioBufferSourceNode; gain: GainNode } | null = null;
    let reqId = 0;

    // Warm low-pass filter keeps upper frequencies silky while preserving vocal clarity on lyric songs
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.Q.value = 0.5;
    tone.frequency.setValueAtTime(7200, ctx.currentTime);

    const master = ctx.createGain();
    tone.connect(master);
    master.connect(ctx.destination);

    const isVocalMode = () => currentMode !== "instrumental" && currentMode !== "none";
    const calcBaseVol = () => {
        if (currentMode === "none") return 0;
        if (isVocalMode()) return ignoreGlobalMute ? 0.38 : 0.29;
        return ignoreGlobalMute ? 0.28 : 0.21;
    };

    const syncGain = (ramp = 0.65) => {
        if (!alive) return;
        const t = ctx.currentTime;
        const baseVol = calcBaseVol();
        const want = muted ? 0 : (ducked ? baseVol * 0.08 : baseVol * intensity);
        const normalCutoff = isVocalMode() ? 9200 : 5600;
        const readingCutoff = isVocalMode() ? 5800 : 3400;
        const cutoff = ducked ? 2000 : intensity > 0 && intensity < 0.85 ? readingCutoff : normalCutoff;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(want, t + ramp);
        tone.frequency.cancelScheduledValues(t);
        tone.frequency.setValueAtTime(tone.frequency.value, t);
        tone.frequency.linearRampToValueAtTime(cutoff, t + ramp);
    };
    master.gain.setValueAtTime(0, ctx.currentTime);
    syncGain(1.0);

    const fadeOutTrack = (tr: { src: AudioBufferSourceNode; gain: GainNode }, sec = 0.65) => {
        const t = ctx.currentTime;
        try {
            tr.gain.gain.cancelScheduledValues(t);
            tr.gain.gain.setValueAtTime(tr.gain.gain.value, t);
            tr.gain.gain.linearRampToValueAtTime(0.0001, t + sec);
            tr.src.stop(t + sec + 0.05);
        } catch { /* already stopped */ }
    };

    const loadAndPlay = (style: StyleId, mode: SoundtrackMode) => {
        const myReq = ++reqId;
        const url = resolveBgmUrl(style, mode);
        if (!url) {
            if (activeTrack) {
                fadeOutTrack(activeTrack, 0.45);
                activeTrack = null;
            }
            syncGain(0.35);
            return;
        }
        if (activeTrack && activeTrack.url === url) {
            syncGain(0.4);
            return;
        }
        void decodeBgmUrl(ctx, style, mode).then((buffer) => {
            if (!alive || myReq !== reqId || !buffer) return;
            if (activeTrack && activeTrack.url === url) return;
            if (activeTrack) fadeOutTrack(activeTrack, 0.65);

            const src = ctx.createBufferSource();
            src.buffer = buffer;
            src.loop = true;
            const g = ctx.createGain();
            const t = ctx.currentTime;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.linearRampToValueAtTime(1, t + 0.75);
            src.connect(g).connect(tone);
            src.start(t);
            activeTrack = { url, src, gain: g };
            syncGain(0.5);
        });
    };

    loadAndPlay(currentStyle, currentMode);

    // Auto-duck whenever a voice note (<audio>) or memory <video> plays
    const checkMedia = () => {
        if (typeof document === "undefined") return;
        const els = Array.from(document.querySelectorAll<HTMLMediaElement>("audio, video"));
        const playing = els.some((el) => !el.paused && !el.ended && !el.muted);
        if (playing !== ducked) {
            ducked = playing;
            syncGain(0.35);
        }
    };
    document.addEventListener("play", checkMedia, true);
    document.addEventListener("pause", checkMedia, true);
    document.addEventListener("ended", checkMedia, true);

    return {
        setStyle(style: StyleId) {
            currentStyle = style;
            loadAndPlay(currentStyle, currentMode);
        },
        setTrack(style: StyleId, soundtrack?: string | null) {
            currentStyle = style;
            currentMode = normalizeSoundtrack(soundtrack);
            loadAndPlay(currentStyle, currentMode);
        },
        setIntensity(level: number) {
            intensity = Math.max(0, Math.min(1.4, level));
            syncGain(0.6);
        },
        setMuted(m: boolean) {
            muted = m;
            syncGain(0.25);
        },
        stop() {
            if (!alive) return;
            alive = false;
            reqId++;
            document.removeEventListener("play", checkMedia, true);
            document.removeEventListener("pause", checkMedia, true);
            document.removeEventListener("ended", checkMedia, true);
            if (activeTrack) {
                fadeOutTrack(activeTrack, 0.35);
                activeTrack = null;
            }
            setTimeout(() => {
                try { tone.disconnect(); } catch { /* ignore */ }
                try { master.disconnect(); } catch { /* ignore */ }
            }, 450);
        },
    };
}
