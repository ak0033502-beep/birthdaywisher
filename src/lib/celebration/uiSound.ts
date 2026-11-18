/**
 * Small shared sound player for the wish viewer (cover, intros, slide transitions).
 * Uses real CC0 recordings from /public/sfx/ui (see CREDITS.txt there).
 * The AudioContext is created on the first user gesture (pointerdown on the cover) and reused.
 * Respects the same mute preference as the Grand Finale.
 */
import { isMutedPref } from "./sfx";

export type UiSound = "rip" | "rustle" | "whoosh" | "swoosh" | "typing" | "page" | "ping" | "msg" | "projector" | "curtain" | "chime" | "launch";

const FILES: Record<UiSound, string> = {
    rip: "/sfx/ui/rip.mp3", rustle: "/sfx/ui/rustle.mp3", whoosh: "/sfx/ui/whoosh.mp3", swoosh: "/sfx/ui/swoosh.mp3",
    typing: "/sfx/ui/typing.mp3", page: "/sfx/ui/page.mp3", ping: "/sfx/ui/ping.mp3", msg: "/sfx/ui/msg.mp3",
    projector: "/sfx/ui/projector.mp3", curtain: "/sfx/ui/curtain.mp3", chime: "/sfx/ui/chime.mp3", launch: "/sfx/finale/launch.mp3",
};

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
const raw = new Map<UiSound, Promise<ArrayBuffer | null>>();
const decoded = new Map<UiSound, Promise<AudioBuffer | null>>();

/** Start downloading sounds (no audio context needed). */
export function prefetchUi(names: UiSound[]) {
    if (typeof fetch === "undefined") return;
    for (const n of names) {
        if (!raw.has(n)) raw.set(n, fetch(FILES[n]).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null));
    }
}

/** Call inside a user gesture (pointerdown/click) so sound is allowed. */
export function unlockUi(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!ctx) {
        const W = window as Window & { webkitAudioContext?: typeof AudioContext };
        const C = window.AudioContext || W.webkitAudioContext;
        if (!C) return null;
        try { ctx = new C(); } catch { return null; }
        out = ctx.createGain();
        out.gain.value = 0.9;
        out.connect(ctx.destination);
    }
    void ctx.resume?.();
    return ctx;
}

function buffer(n: UiSound): Promise<AudioBuffer | null> {
    if (!ctx) return Promise.resolve(null);
    let p = decoded.get(n);
    if (!p) {
        prefetchUi([n]);
        const c = ctx;
        p = raw.get(n)!.then((ab) => (ab ? new Promise<AudioBuffer | null>((res) => {
            try { c.decodeAudioData(ab.slice(0), res, () => res(null)); } catch { res(null); }
        }) : null));
        decoded.set(n, p);
    }
    return p;
}

export interface Playing { stop: (fadeMs?: number) => void }

/** Play a sound (no-op when muted, before unlockUi(), or if it failed to load). */
export function playUi(n: UiSound, o: { gain?: number; rate?: number; delay?: number; loop?: boolean } = {}): Playing {
    let src: AudioBufferSourceNode | null = null;
    let g: GainNode | null = null;
    let stopped = false;
    if (ctx && out && !isMutedPref()) {
        const c = ctx, dest = out;
        void buffer(n).then((b) => {
            if (!b || stopped) return;
            src = c.createBufferSource();
            src.buffer = b; src.loop = !!o.loop;
            src.playbackRate.value = o.rate ?? 1;
            g = c.createGain(); g.gain.value = o.gain ?? 1;
            src.connect(g).connect(dest);
            src.start(c.currentTime + (o.delay ?? 0) / 1000);
        });
    }
    return {
        stop(fadeMs = 120) {
            stopped = true;
            if (!ctx || !src || !g) return;
            const t = ctx.currentTime;
            try {
                g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + fadeMs / 1000);
                src.stop(t + fadeMs / 1000 + 0.02);
            } catch { /* already stopped */ }
        },
    };
}
