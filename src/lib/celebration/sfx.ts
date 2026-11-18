/**
 * Sound for the Grand Finale.
 * Real recorded fireworks / party poppers / crowd cheer (CC0 recordings in /public/sfx/finale, see
 * CREDITS.txt) are prefetched when the finale slide appears and decoded on the first tap.
 * Until a recording is ready (or if it fails to load) a procedural Web Audio version is used, so
 * the finale is never silent. The Happy Birthday tune (public domain) and the heartbeat are synthesized.
 *
 * Browsers only allow sound after a user gesture, so create the engine inside a tap handler.
 * Everything goes through a compressor + master gain (smooth fade-in, mute toggle), so nothing
 * ever starts at full blast or clips.
 */

type AC = AudioContext;

const SAMPLE_NAMES = [
    "boom1", "boom2", "boom3", "boom4", "crackle1", "crackle2", "whistle1", "whistle2", "whistle3", "launch",
    "fountain", "pop1", "pop2", "pop3", "horn", "cheer", "yay",
] as const;
type SampleName = (typeof SAMPLE_NAMES)[number];

let rawSamples: Promise<Partial<Record<SampleName, ArrayBuffer>>> | null = null;
/** Start downloading the recordings (~320 KB total). Safe to call many times. */
export function prefetchFinaleSamples() {
    if (!rawSamples && typeof fetch !== "undefined") {
        rawSamples = Promise.all(SAMPLE_NAMES.map(async (n) => {
            try {
                const r = await fetch(`/sfx/finale/${n}.mp3`);
                return r.ok ? ([n, await r.arrayBuffer()] as const) : null;
            } catch { return null; }
        })).then((list) => {
            const out: Partial<Record<SampleName, ArrayBuffer>> = {};
            for (const e of list) if (e) out[e[0]] = e[1];
            return out;
        });
    }
    return rawSamples;
}

export interface Sfx {
    readonly ctx: AC;
    whistle(pan?: number, dur?: number): void;
    boom(pan?: number, size?: number): void;
    crackle(pan?: number, dur?: number): void;
    heartbeat(): void;
    hit(big?: boolean): void;
    fountain(on: boolean): void;
    applause(seconds?: number): void;
    popper(pan?: number, horn?: boolean): void;
    song(): number; // returns duration in seconds
    /** Full arranged Happy Birthday (piano + waltz chords + music box + room reverb). */
    birthdayTune(): { duration: number; stop(fade?: number): void };
    setMuted(m: boolean): void;
    close(): void;
}

const MUTE_KEY = "bw-finale-muted";
export const isMutedPref = () => {
    try { return localStorage.getItem(MUTE_KEY) === "1"; } catch { return false; }
};
export const setMutedPref = (m: boolean) => {
    try { localStorage.setItem(MUTE_KEY, m ? "1" : "0"); } catch { /* private mode */ }
};

export function createSfx(): Sfx | null {
    if (typeof window === "undefined") return null;
    const W = window as Window & { webkitAudioContext?: typeof AudioContext };
    const Ctor = window.AudioContext || W.webkitAudioContext;
    if (!Ctor) return null;
    let ctx: AC;
    try { ctx = new Ctor(); } catch { return null; }
    void ctx.resume?.();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 18; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.25;
    const master = ctx.createGain();
    const target = 0.9;
    let muted = isMutedPref();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(muted ? 0 : target, ctx.currentTime + 1.2);
    comp.connect(master).connect(ctx.destination);

    // outdoor "echo" bus for booms (delay with a lowpassed feedback loop)
    const echoIn = ctx.createGain(); echoIn.gain.value = 0.35;
    const delay = ctx.createDelay(1); delay.delayTime.value = 0.23;
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    echoIn.connect(delay); delay.connect(lp).connect(fb).connect(delay); lp.connect(comp);

    // shared white-noise buffer (2 s)
    const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    { const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }

    const panner = (pan: number): AudioNode => {
        if (typeof ctx.createStereoPanner !== "function") return comp;
        const p = ctx.createStereoPanner();
        p.pan.value = Math.max(-1, Math.min(1, pan));
        p.connect(comp);
        return p;
    };
    const noiseSrc = (offset = Math.random()) => {
        const s = ctx.createBufferSource();
        s.buffer = noise; s.loop = true;
        s.start(ctx.currentTime, offset * 1.5);
        return s;
    };

    // real recordings (decoded in the background; each call falls back to synthesis until ready)
    const buf: Partial<Record<SampleName, AudioBuffer>> = {};
    void prefetchFinaleSamples()?.then((raw) => Promise.all(Object.entries(raw).map(([n, ab]) =>
        new Promise<void>((res) => {
            try {
                ctx.decodeAudioData((ab as ArrayBuffer).slice(0), (b) => { buf[n as SampleName] = b; res(); }, () => res());
            } catch { res(); }
        }),
    )));
    const ready = (names: SampleName[]) => names.filter((n) => buf[n]);
    const play = (names: SampleName[], o: { pan?: number; gain?: number; rate?: number; loop?: boolean; delay?: number } = {}) => {
        const have = ready(names);
        if (!have.length) return null;
        const b = buf[have[Math.floor(Math.random() * have.length)]]!;
        const src = ctx.createBufferSource();
        src.buffer = b; src.loop = !!o.loop;
        src.playbackRate.value = o.rate ?? 1;
        const g = ctx.createGain(); g.gain.value = o.gain ?? 1;
        src.connect(g).connect(panner(o.pan ?? 0));
        src.start(ctx.currentTime + (o.delay ?? 0));
        return { src, g };
    };
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    const synth = {
        whistle(pan = 0, dur = 1.1) {
            const t = ctx.currentTime, out = panner(pan);
            const o = ctx.createOscillator(); o.type = "sine";
            const base = 900 + Math.random() * 500;
            o.frequency.setValueAtTime(base, t);
            o.frequency.exponentialRampToValueAtTime(base * 2.3, t + dur);
            const lfo = ctx.createOscillator(); lfo.frequency.value = 9; const lg = ctx.createGain(); lg.gain.value = 25;
            lfo.connect(lg).connect(o.frequency);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.045, t + 0.08); g.gain.linearRampToValueAtTime(0.0001, t + dur);
            o.connect(g).connect(out);
            // hiss of the rocket motor
            const n = noiseSrc(); const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 3000; bp.Q.value = 0.8;
            const ng = ctx.createGain(); ng.gain.setValueAtTime(0.05, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            n.connect(bp).connect(ng).connect(out);
            o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05); n.stop(t + dur + 0.05);
        },
        boom(pan = 0, size = 1) {
            const t = ctx.currentTime, out = panner(pan);
            const s = Math.max(0.4, Math.min(1.6, size));
            // noise body
            const n = noiseSrc(); const f = ctx.createBiquadFilter(); f.type = "lowpass";
            f.frequency.setValueAtTime(1800, t); f.frequency.exponentialRampToValueAtTime(110, t + 1.1);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.75 * s, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5 * s);
            n.connect(f).connect(g); g.connect(out); g.connect(echoIn);
            // sub thump
            const o = ctx.createOscillator(); o.type = "sine";
            o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(32, t + 0.45);
            const og = ctx.createGain(); og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.9 * s, t + 0.01); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
            o.connect(og).connect(out);
            o.start(t); o.stop(t + 0.7); n.stop(t + 1.6 * s + 0.1);
        },
        crackle(pan = 0, dur = 1.3) {
            const t0 = ctx.currentTime + 0.05, out = panner(pan);
            const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1800; hp.connect(out);
            const count = Math.round(28 + Math.random() * 30);
            for (let i = 0; i < count; i++) {
                const t = t0 + Math.random() * dur;
                const n = ctx.createBufferSource(); n.buffer = noise;
                const g = ctx.createGain(); const v = 0.08 + Math.random() * 0.16;
                g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.006 + Math.random() * 0.012);
                n.connect(g).connect(hp);
                n.start(t, Math.random() * 1.8, 0.03);
            }
        },
        heartbeat() {
            const thump = (t: number, v: number) => {
                const o = ctx.createOscillator(); o.type = "sine";
                o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.14);
                const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
                o.connect(g).connect(comp); o.start(t); o.stop(t + 0.2);
            };
            const t = ctx.currentTime; thump(t, 0.7); thump(t + 0.2, 0.45);
        },
        hit(big = false) {
            synth.boom(0, big ? 1.1 : 0.55);
        },
        fountain: (() => {
            let node: { src: AudioBufferSourceNode; g: GainNode } | null = null;
            return (on: boolean) => {
                const t = ctx.currentTime;
                if (on && !node) {
                    const src = noiseSrc(); const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 4200; bp.Q.value = 0.6;
                    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.07, t + 0.6);
                    src.connect(bp).connect(g).connect(comp);
                    node = { src, g };
                } else if (!on && node) {
                    const n = node; node = null;
                    n.g.gain.setValueAtTime(n.g.gain.value, t); n.g.gain.linearRampToValueAtTime(0, t + 0.8);
                    n.src.stop(t + 0.9);
                }
            };
        })(),
        applause(seconds = 5) {
            const t0 = ctx.currentTime;
            const claps = Math.round(seconds * 34);
            for (let i = 0; i < claps; i++) {
                const p = i / claps;
                const t = t0 + p * seconds + Math.random() * 0.03;
                const env = Math.min(1, p * 5) * Math.min(1, (1 - p) * 3); // fade in / out
                const n = ctx.createBufferSource(); n.buffer = noise;
                const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900 + Math.random() * 1800; bp.Q.value = 1.4;
                const g = ctx.createGain(); g.gain.setValueAtTime(0.06 + 0.16 * env * Math.random(), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
                const out = panner(Math.random() * 1.6 - 0.8);
                n.connect(bp).connect(g).connect(out);
                n.start(t, Math.random() * 1.8, 0.05);
            }
        },
        song() {
            // Happy Birthday in G major, 3/4. [midi, beats]
            const N: Array<[number, number]> = [
                [67, .75], [67, .25], [69, 1], [67, 1], [72, 1], [71, 2],
                [67, .75], [67, .25], [69, 1], [67, 1], [74, 1], [72, 2],
                [67, .75], [67, .25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2],
                [77, .75], [77, .25], [76, 1], [72, 1], [74, 1], [72, 3],
            ];
            const beat = 0.44;
            const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
            const bell = (m: number, t: number, len: number, v: number) => {
                const g = ctx.createGain(); g.connect(comp);
                g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.6, len * 1.6));
                [[1, 1], [2, 0.35], [3, 0.12], [4.2, 0.06]].forEach(([mult, amp]) => {
                    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = hz(m) * mult;
                    const og = ctx.createGain(); og.gain.value = amp; o.connect(og).connect(g);
                    o.start(t); o.stop(t + Math.max(0.7, len * 1.7));
                });
            };
            const pad = (m: number, t: number, len: number) => {
                const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = hz(m);
                const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06, t + 0.08); g.gain.linearRampToValueAtTime(0.0001, t + len);
                o.connect(g).connect(comp); o.start(t); o.stop(t + len + 0.05);
            };
            let t = ctx.currentTime + 0.15;
            const start = t;
            // bass on the downbeat of each phrase: G, D, G/C, C-G
            const bass: Array<[number, number]> = [[43, 3], [50, 3], [43, 3], [50, 3], [43, 3], [48, 3], [41, 3], [43, 3]];
            let bt = start + 0.25 * beat;
            for (const [m, b] of bass) { pad(m, bt, b * beat * 0.95); bt += b * beat; }
            for (const [m, b] of N) { bell(m, t, b * beat, 0.16); t += b * beat; }
            return t - ctx.currentTime;
        },
    };

    // fountain loop (recording when available)
    let fountainNode: { src: AudioBufferSourceNode; g: GainNode } | null = null;
    let fountainSynth = false;

    /* ---------- Happy Birthday: warm arranged version (public-domain melody) ---------- */
    let reverb: ConvolverNode | null = null;
    const getReverb = () => {
        if (reverb) return reverb;
        // small warm room: 2.2 s stereo noise impulse with an exponential decay
        const len = Math.floor(ctx.sampleRate * 2.2);
        const ir = ctx.createBuffer(2, len, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const d = ir.getChannelData(ch);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
        }
        reverb = ctx.createConvolver();
        reverb.buffer = ir;
        return reverb;
    };

    const birthdayTune = () => {
        const B = 0.56; // seconds per beat (~107 bpm waltz: relaxed, easy to sing along)
        const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
        const bus = ctx.createGain();
        bus.gain.value = 1;
        const wet = ctx.createGain(); wet.gain.value = 0.32;
        bus.connect(comp);
        bus.connect(getReverb()).connect(wet).connect(comp);

        /** Soft grand-piano-like tone: slightly inharmonic partials, brightness that mellows as it rings. */
        const piano = (m: number, t: number, len: number, v: number, partials = 6) => {
            const f0 = hz(m);
            const ring = Math.max(0.9, 3.2 - (m - 48) * 0.035); // low notes ring longer
            const end = t + Math.min(ring, len + 0.35);
            const lp = ctx.createBiquadFilter(); lp.type = "lowpass";
            lp.frequency.setValueAtTime(Math.min(9000, f0 * 9), t);
            lp.frequency.exponentialRampToValueAtTime(Math.max(600, f0 * 2.4), t + 0.6);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(v, t + 0.006);
            g.gain.exponentialRampToValueAtTime(v * 0.45, t + 0.35);
            g.gain.exponentialRampToValueAtTime(0.0001, end + 0.3);
            lp.connect(g).connect(bus);
            const amps = [1, 0.52, 0.3, 0.16, 0.09, 0.05];
            for (let n = 1; n <= partials; n++) {
                const o = ctx.createOscillator(); o.type = "sine";
                o.frequency.value = f0 * n * (1 + 0.00035 * n * n);
                const og = ctx.createGain(); og.gain.value = amps[n - 1];
                if (n > 2) { og.gain.setValueAtTime(amps[n - 1], t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.25 + 1.4 / n); }
                o.connect(og).connect(lp);
                o.start(t); o.stop(end + 0.35);
            }
        };
        /** Music-box / celesta sparkle an octave above the melody. */
        const celesta = (m: number, t: number, v: number) => {
            const f = hz(m + 12);
            const g = ctx.createGain(); g.connect(bus);
            g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
            [[1, 1], [4.01, 0.18]].forEach(([mult, a]) => {
                const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f * mult;
                const og = ctx.createGain(); og.gain.value = a; o.connect(og).connect(g);
                o.start(t); o.stop(t + 1.2);
            });
        };

        // Melody in C major: [start beat, midi, length in beats]. "dear ___" gets a little fermata (bar 6 = 4 beats).
        const MEL: Array<[number, number, number]> = [
            [-1, 67, 0.75], [-0.25, 67, 0.25],
            [0, 69, 1], [1, 67, 1], [2, 72, 1], [3, 71, 2],
            [5, 67, 0.75], [5.75, 67, 0.25],
            [6, 69, 1], [7, 67, 1], [8, 74, 1], [9, 72, 2],
            [11, 67, 0.75], [11.75, 67, 0.25],
            [12, 79, 1], [13, 76, 1], [14, 72, 1], [15, 71, 1], [16, 69, 2],
            [18, 77, 0.75], [18.75, 77, 0.25],
            [19, 76, 1], [20, 72, 1], [21, 74, 1], [22, 72, 3],
        ];
        // Waltz accompaniment: [start beat, beats, bass, chord tones]
        const C = [52, 55, 60], G7 = [53, 55, 59], C7 = [52, 55, 58], F = [53, 57, 60];
        const BARS: Array<[number, number, number, number[]]> = [
            [-3, 2, 48, C], // one soft intro bar before "Happy"
            [0, 3, 48, C], [3, 3, 43, G7], [6, 3, 43, G7], [9, 3, 48, C],
            [12, 3, 48, C7], [15, 4, 41, F], [19, 2, 48, C], [21, 1, 43, G7], [22, 3, 48, C],
        ];

        type Ev = { at: number; run: (t: number) => void };
        const evs: Ev[] = [];
        for (const [b, m, l] of MEL) {
            evs.push({ at: b, run: (t) => { piano(m, t, l * B, 0.24); celesta(m, t, 0.035); } });
        }
        for (const [b, len, bass, chord] of BARS) {
            evs.push({ at: b, run: (t) => piano(bass, t, len * B, 0.17, 4) });
            for (let k = 1; k < len; k++) {
                evs.push({ at: b + k, run: (t) => chord.forEach((m, j) => piano(m, t + j * 0.012, B * 0.9, 0.065, 3)) });
            }
        }
        // final rolled C chord under the last note
        evs.push({ at: 22, run: (t) => [36, 48, 55, 60, 64].forEach((m, j) => piano(m, t + j * 0.045, 3 * B, j ? 0.07 : 0.12, 4)) });
        evs.sort((a, b) => a.at - b.at);

        const t0 = ctx.currentTime + 0.12 + 3 * B; // beat 0 (intro starts at beat -3)
        const lastBeat = 25;
        const duration = 0.12 + (3 + lastBeat) * B + 1.6;

        // Schedule in small look-ahead chunks so phones never create hundreds of nodes at once
        let i = 0;
        let timer: ReturnType<typeof setInterval> | null = null;
        const pump = () => {
            const horizon = ctx.currentTime + 1.2;
            while (i < evs.length && t0 + evs[i].at * B <= horizon) {
                const e = evs[i++];
                e.run(Math.max(ctx.currentTime + 0.01, t0 + e.at * B));
            }
            if (i >= evs.length && timer) { clearInterval(timer); timer = null; }
        };
        pump();
        timer = setInterval(pump, 250);

        return {
            duration,
            stop(fade = 1.2) {
                if (timer) { clearInterval(timer); timer = null; }
                i = evs.length;
                const t = ctx.currentTime;
                try {
                    bus.gain.cancelScheduledValues(t);
                    bus.gain.setValueAtTime(bus.gain.value, t);
                    bus.gain.linearRampToValueAtTime(0.0001, t + fade);
                } catch { /* closed */ }
                setTimeout(() => { try { bus.disconnect(); wet.disconnect(); } catch { /* ignore */ } }, (fade + 0.4) * 1000);
            },
        };
    };

    const sfx: Sfx = {
        ctx,
        whistle(pan = 0, dur = 1.1) {
            const r = Math.random();
            const names: SampleName[] = r < 0.18 ? ["launch"] : r < 0.32 ? ["whistle2"] : ["whistle1", "whistle3"];
            const gain = names[0] === "launch" ? 0.32 : names[0] === "whistle2" ? 0.3 : 0.5;
            if (!play(names, { pan, gain, rate: rnd(0.92, 1.1) })) synth.whistle(pan, dur);
        },
        boom(pan = 0, size = 1) {
            const s = Math.max(0.4, Math.min(1.6, size));
            const big = s > 1.18;
            const names: SampleName[] = big ? ["boom4", "boom1"] : ["boom1", "boom2", "boom3"];
            const rate = Math.max(0.78, Math.min(1.2, 1.14 - (s - 0.5) * 0.22 + rnd(-0.05, 0.05)));
            if (!play(names, { pan, gain: (big ? 0.8 : 1.05) * Math.min(1.15, s), rate })) synth.boom(pan, size);
        },
        crackle(pan = 0, dur = 1.3) {
            if (!play(dur > 1.5 ? ["crackle1"] : ["crackle1", "crackle2"], { pan, gain: 0.85, rate: rnd(0.95, 1.08), delay: 0.12 })) synth.crackle(pan, dur);
        },
        heartbeat: synth.heartbeat,
        hit(big = false) {
            if (!play(big ? ["boom4"] : ["boom2", "boom3"], { gain: big ? 0.75 : 0.55, rate: big ? 0.92 : 1.08 })) synth.hit(big);
        },
        fountain(on: boolean) {
            const t = ctx.currentTime;
            if (on) {
                if (fountainNode || fountainSynth) return;
                const n = play(["fountain"], { gain: 0, loop: true });
                if (n) {
                    n.g.gain.setValueAtTime(0, t); n.g.gain.linearRampToValueAtTime(0.42, t + 0.5);
                    fountainNode = n;
                } else { fountainSynth = true; synth.fountain(true); }
            } else {
                if (fountainNode) {
                    const n = fountainNode; fountainNode = null;
                    n.g.gain.setValueAtTime(n.g.gain.value, t); n.g.gain.linearRampToValueAtTime(0, t + 0.8);
                    n.src.stop(t + 0.9);
                }
                if (fountainSynth) { fountainSynth = false; synth.fountain(false); }
            }
        },
        applause(seconds = 5) {
            const a = play(["yay"], { gain: 0.75 });
            const b = play(["cheer"], { gain: 0.7, delay: 0.25 });
            if (!a && !b) synth.applause(seconds);
        },
        popper(pan = 0, horn = false) {
            if (!play(["pop1", "pop2", "pop3"], { pan, gain: 0.95, rate: rnd(0.94, 1.08) })) synth.crackle(pan, 0.15);
            play(["crackle2"], { pan, gain: 0.25, rate: 1.3, delay: 0.05 }); // paper-confetti rustle
            if (horn) play(["horn"], { pan: pan * 0.5, gain: 0.45, rate: rnd(0.95, 1.05), delay: 0.12 });
        },
        song: synth.song,
        birthdayTune,
        setMuted(m: boolean) {
            muted = m; setMutedPref(m);
            const t = ctx.currentTime;
            master.gain.cancelScheduledValues(t);
            master.gain.setValueAtTime(master.gain.value, t);
            master.gain.linearRampToValueAtTime(m ? 0 : target, t + 0.25);
        },
        close() {
            const t = ctx.currentTime;
            try { master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0, t + 0.3); } catch { /* closed */ }
            setTimeout(() => { ctx.close().catch(() => {}); }, 400);
        },
    };
    return sfx;
}

/** Android vibration (iOS Safari has no Vibration API: silently ignored). */
export function buzz(pattern: number | number[]) {
    try { if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern); } catch { /* ignore */ }
}
