/**
 * Per-style gentle background music engine for the wish viewer & wizard preview.
 * Each of the 6 presentation styles has its own warm, drum-free CC0 recording in /public/bgm/<style>.mp3:
 *  - cinematic : Warm Soulful Piano (/bgm/cinematic.mp3)
 *  - terminal  : Dreamy Warm Synth Pad (/bgm/terminal.mp3)
 *  - storybook : Fairytale Music Box (/bgm/storybook.mp3)
 *  - messenger : Sweet Acoustic Guitar (/bgm/messenger.mp3)
 *  - galaxy    : Deep Space Ambient (/bgm/galaxy.mp3)
 *  - gallery   : Peaceful Concert Harp (/bgm/gallery.mp3)
 *
 * Emotion-first mix:
 *  - Soft background gain so heartfelt birthday messages always stay center-stage.
 *  - Warm low-pass tone filter softens upper frequencies on emotional text slides.
 *  - Seamlessly loops via Web Audio AudioBufferSourceNode, crossfades when switching styles,
 *    auto-ducks whenever any <audio> or <video> plays, and fades out on Grand Finale.
 */
import type { StyleId } from "@/components/viewer/styles";
import { isMutedPref } from "./sfx";
import { unlockUi } from "./uiSound";

export const STYLE_BGM_FILES: Record<StyleId, string> = {
    cinematic: "/bgm/cinematic.mp3",
    terminal: "/bgm/terminal.mp3",
    storybook: "/bgm/storybook.mp3",
    messenger: "/bgm/messenger.mp3",
    galaxy: "/bgm/galaxy.mp3",
    gallery: "/bgm/gallery.mp3",
};

const rawCache = new Map<StyleId, Promise<ArrayBuffer | null>>();
const decodedCache = new Map<StyleId, Promise<AudioBuffer | null>>();

/** Start downloading the style's music track in the background (safe before user gesture). */
export function prefetchStyleBgm(style: StyleId): Promise<ArrayBuffer | null> {
    if (typeof fetch === "undefined") return Promise.resolve(null);
    let p = rawCache.get(style);
    if (!p) {
        p = fetch(STYLE_BGM_FILES[style])
            .then((r) => (r.ok ? r.arrayBuffer() : null))
            .catch(() => null);
        rawCache.set(style, p);
    }
    return p;
}

function decodeStyleBgm(ctx: AudioContext, style: StyleId): Promise<AudioBuffer | null> {
    let p = decodedCache.get(style);
    if (!p) {
        p = prefetchStyleBgm(style).then((ab) =>
            ab
                ? new Promise<AudioBuffer | null>((res) => {
                    try { ctx.decodeAudioData(ab.slice(0), res, () => res(null)); } catch { res(null); }
                })
                : null,
        );
        decodedCache.set(style, p);
    }
    return p;
}

export interface BgmController {
    setStyle(style: StyleId): void;
    /** 0 = silent (finale), ~0.76 = gentle emotional reading cushion, 1 = normal. */
    setIntensity(level: number): void;
    setMuted(muted: boolean): void;
    stop(): void;
}

export function startBgm(initialStyle: StyleId, ignoreGlobalMute = false): BgmController | null {
    const ctx = unlockUi();
    if (!ctx) return null;

    let currentStyle: StyleId = initialStyle;
    let muted = ignoreGlobalMute ? false : isMutedPref();
    let intensity = 1;
    let ducked = false;
    let alive = true;
    let activeTrack: { style: StyleId; src: AudioBufferSourceNode; gain: GainNode } | null = null;
    let reqId = 0;

    // Warm low-pass filter keeps upper frequencies silky and softens further during text reading
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.Q.value = 0.5;
    tone.frequency.setValueAtTime(5600, ctx.currentTime);

    const master = ctx.createGain();
    tone.connect(master);
    master.connect(ctx.destination);

    // Gentle background cushion so emotional birthday words always shine clearly
    const baseVol = ignoreGlobalMute ? 0.28 : 0.21;
    const syncGain = (ramp = 0.65) => {
        if (!alive) return;
        const t = ctx.currentTime;
        const want = muted ? 0 : (ducked ? baseVol * 0.1 : baseVol * intensity);
        const cutoff = ducked ? 2000 : intensity > 0 && intensity < 0.85 ? 3400 : 5600;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(want, t + ramp);
        tone.frequency.cancelScheduledValues(t);
        tone.frequency.setValueAtTime(tone.frequency.value, t);
        tone.frequency.linearRampToValueAtTime(cutoff, t + ramp);
    };
    master.gain.setValueAtTime(0, ctx.currentTime);
    syncGain(1.2);

    const fadeOutTrack = (tr: { src: AudioBufferSourceNode; gain: GainNode }, sec = 0.65) => {
        const t = ctx.currentTime;
        try {
            tr.gain.gain.cancelScheduledValues(t);
            tr.gain.gain.setValueAtTime(tr.gain.gain.value, t);
            tr.gain.gain.linearRampToValueAtTime(0.0001, t + sec);
            tr.src.stop(t + sec + 0.05);
        } catch { /* already stopped */ }
    };

    const loadAndPlay = (style: StyleId) => {
        const myReq = ++reqId;
        void decodeStyleBgm(ctx, style).then((buffer) => {
            if (!alive || myReq !== reqId || !buffer) return;
            if (activeTrack && activeTrack.style === style) return;
            if (activeTrack) fadeOutTrack(activeTrack, 0.7);

            const src = ctx.createBufferSource();
            src.buffer = buffer;
            src.loop = true;
            const g = ctx.createGain();
            const t = ctx.currentTime;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.linearRampToValueAtTime(1, t + 0.8);
            src.connect(g).connect(tone);
            src.start(t);
            activeTrack = { style, src, gain: g };
        });
    };

    loadAndPlay(currentStyle);

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
            if (style === currentStyle && activeTrack?.style === style) return;
            currentStyle = style;
            loadAndPlay(style);
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
