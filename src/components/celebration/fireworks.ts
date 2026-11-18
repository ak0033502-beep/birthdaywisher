/**
 * Lightweight canvas fireworks engine for the Grand Finale.
 * Two canvases: `sky` keeps glowing trails (fades with destination-out), `front` is cleared every
 * frame (confetti). Rockets, 5 burst types, gold fountains (anaar), a ground spinner (chakri),
 * confetti cannons and particle text ("HAPPY BIRTHDAY" + the name).
 * Particle budget depends on the device tier; nothing flashes the whole screen.
 */
export type Tier = "high" | "mid" | "low";
export type BurstKind = "peony" | "willow" | "ring" | "heart" | "crackle";

export interface FireworksOptions {
    palette: string[];
    tier: Tier;
    /** Skin accent (#rrggbb) used to tint the sky. */
    accent?: string;
    /** Called when a shell explodes (x, y in 0..1 of the canvas, size 0.5..1.5). */
    onBurst?: (x: number, y: number, size: number, kind: BurstKind) => void;
    /** Called when a rocket launches (x in 0..1). */
    onLaunch?: (x: number) => void;
}

interface Spark {
    x: number; y: number; vx: number; vy: number;
    life: number; max: number; color: string; size: number;
    drag: number; grav: number; glitter: boolean;
    crackle?: boolean;
    // text particles
    sx?: number; sy?: number; tx?: number; ty?: number; tt?: number; hold?: number;
}
interface Rocket { x: number; y: number; vx: number; vy: number; ty: number; color: string; kind: BurstKind; size: number }
interface Confetto { x: number; y: number; vx: number; vy: number; rot: number; vr: number; w: number; h: number; color: string; life: number; wob: number }
interface Emitter { kind: "fountain" | "chakri"; x: number; until: number; angle: number }

const BUDGET: Record<Tier, number> = { high: 2600, mid: 1300, low: 450 };
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
/** Mix two #rrggbb colours (t = share of a). */
function mix(a: string, b: string, t: number): string {
    const p = (c: string) => (/^#[0-9a-f]{6}$/i.test(c) ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : [255, 92, 138]);
    const A = p(a), B = p(b);
    return `rgb(${A.map((v, i) => Math.round(v * t + B[i] * (1 - t))).join(",")})`;
}

export class Fireworks {
    private sky: HTMLCanvasElement;
    private front: HTMLCanvasElement;
    private sc: CanvasRenderingContext2D;
    private fc: CanvasRenderingContext2D;
    private opts: FireworksOptions;
    private sparks: Spark[] = [];
    private rockets: Rocket[] = [];
    private confetti: Confetto[] = [];
    private emitters: Emitter[] = [];
    private raf = 0;
    private last = 0;
    private w = 0;
    private h = 0;
    private dpr = 1;
    private running = false;
    private frontDirty = false;
    private warm = false;
    private bg: HTMLCanvasElement | null = null;
    private ro?: ResizeObserver;

    constructor(sky: HTMLCanvasElement, front: HTMLCanvasElement, opts: FireworksOptions) {
        this.sky = sky; this.front = front; this.opts = opts;
        // opaque sky canvas: much cheaper to composite than a transparent full-screen layer
        this.sc = sky.getContext("2d", { alpha: false })!;
        this.fc = front.getContext("2d")!;
        this.resize();
        if (typeof ResizeObserver !== "undefined") {
            this.ro = new ResizeObserver(() => this.resize());
            this.ro.observe(sky);
        }
    }

    get width() { return this.w; }
    get height() { return this.h; }

    setPalette(p: string[]) { this.opts.palette = p; }

    /** Warm afterglow sky (true) or the night sky (false). */
    setWarm(warm: boolean) {
        if (this.warm === warm) return;
        this.warm = warm;
        this.paintBg();
    }

    private paintBg() {
        const W = Math.max(1, Math.round(this.w)), H = Math.max(1, Math.round(this.h));
        const c = this.bg || (this.bg = document.createElement("canvas"));
        c.width = W; c.height = H;
        const g = c.getContext("2d")!;
        const accent = this.opts.accent || "#ff5c8a";
        g.fillStyle = "#03020a"; g.fillRect(0, 0, W, H);
        const rg = g.createRadialGradient(W / 2, H * 1.18, 0, W / 2, H * 1.18, Math.max(W * 1.2, H * 0.95));
        rg.addColorStop(0, mix(accent, this.warm ? "#3a1430" : "#1a0b2e", this.warm ? 0.48 : 0.34));
        rg.addColorStop(0.52, "#0b0720");
        rg.addColorStop(1, "#03020a");
        g.fillStyle = rg; g.fillRect(0, 0, W, H);
        // first paint: the full sky
        this.sc.save(); this.sc.setTransform(1, 0, 0, 1, 0, 0);
        this.sc.globalAlpha = 1; this.sc.globalCompositeOperation = "source-over";
        this.sc.drawImage(c, 0, 0, this.sky.width, this.sky.height);
        this.sc.restore();
    }

    private resize() {
        const r = this.sky.getBoundingClientRect();
        const cap = this.opts.tier === "high" ? 2 : this.opts.tier === "mid" ? 1.5 : 1;
        this.dpr = Math.min(window.devicePixelRatio || 1, cap);
        this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
        for (const c of [this.sky, this.front]) {
            c.width = Math.round(this.w * this.dpr);
            c.height = Math.round(this.h * this.dpr);
        }
        this.sc.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.fc.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.paintBg();
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.last = performance.now();
        const loop = (now: number) => {
            if (!this.running) return;
            const f = Math.min(4, Math.max(0.25, (now - this.last) / 16.67));
            this.last = now;
            this.step(f);
            this.raf = requestAnimationFrame(loop);
        };
        this.raf = requestAnimationFrame(loop);
    }

    stop() {
        this.running = false;
        cancelAnimationFrame(this.raf);
    }

    destroy() {
        this.stop();
        this.ro?.disconnect();
        this.sparks = []; this.rockets = []; this.confetti = []; this.emitters = [];
    }

    clear() {
        this.sparks = []; this.rockets = []; this.confetti = []; this.emitters = [];
        this.paintBg();
        this.fc.clearRect(0, 0, this.w, this.h);
    }

    private room() { return BUDGET[this.opts.tier] - this.sparks.length; }
    private scale() { return Math.min(this.w, this.h * 0.75) / 420; }

    /** Launch a rocket from the bottom. x/y are 0..1 (y = height of the burst). */
    launch(x = rand(0.15, 0.85), y = rand(0.16, 0.42), kind: BurstKind = pick<BurstKind>(["peony", "peony", "willow", "ring", "crackle"]), size = rand(0.85, 1.25)) {
        const sx = x * this.w + rand(-30, 30);
        const ty = y * this.h;
        const dist = this.h - ty;
        const vy = -Math.sqrt(2 * 0.12 * dist) * 1.02;
        const frames = Math.abs(vy) / 0.12;
        this.rockets.push({ x: sx, y: this.h + 8, vx: (x * this.w - sx) / frames, vy, ty, color: pick(this.opts.palette), kind, size });
        this.opts.onLaunch?.(x);
    }

    /** Explode a shell right now (no rocket). */
    burst(x: number, y: number, kind: BurstKind = "peony", size = 1, color?: string) {
        this.explode(x * this.w, y * this.h, kind, size, color);
    }

    private explode(x: number, y: number, kind: BurstKind, size: number, color?: string) {
        const s = this.scale() * size;
        const pal = this.opts.palette;
        const c1 = color || pick(pal), c2 = pick(pal);
        const tierMul = this.opts.tier === "high" ? 1 : this.opts.tier === "mid" ? 0.65 : 0.35;
        const room = this.room();
        const add = (p: Spark) => { this.sparks.push(p); };
        if (room < 30) { this.opts.onBurst?.(x / this.w, y / this.h, size, kind); return; }

        if (kind === "heart") {
            const n = Math.min(room, Math.round(110 * tierMul) + 20);
            for (let i = 0; i < n; i++) {
                const t = (i / n) * Math.PI * 2;
                const hx = 16 * Math.pow(Math.sin(t), 3);
                const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                const k = 0.2 * s * rand(0.96, 1.04);
                add({ x, y, vx: hx * k, vy: hy * k, life: 0, max: rand(80, 100), color: i % 5 === 0 ? "#ffffff" : (color || "#ff4d8d"), size: 2.2, drag: 0.968, grav: 0.012, glitter: false });
            }
        } else if (kind === "ring") {
            const n = Math.min(room, Math.round(70 * tierMul) + 16);
            const tilt = rand(0.45, 1), rot = rand(0, Math.PI);
            for (let i = 0; i < n; i++) {
                const a = (i / n) * Math.PI * 2;
                const ex = Math.cos(a) * 5.2 * s, ey = Math.sin(a) * 5.2 * s * tilt;
                add({ x, y, vx: ex * Math.cos(rot) - ey * Math.sin(rot), vy: ex * Math.sin(rot) + ey * Math.cos(rot), life: 0, max: rand(70, 90), color: c1, size: 2.2, drag: 0.965, grav: 0.025, glitter: false });
            }
            // inner core
            for (let i = 0; i < Math.min(this.room(), 24 * tierMul); i++) {
                const a = rand(0, Math.PI * 2), v = rand(0.5, 1.6) * s;
                add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: rand(40, 60), color: c2, size: 1.8, drag: 0.95, grav: 0.02, glitter: true });
            }
        } else if (kind === "willow") {
            const n = Math.min(room, Math.round(100 * tierMul) + 20);
            for (let i = 0; i < n; i++) {
                const a = rand(0, Math.PI * 2), v = Math.sqrt(Math.random()) * 4.4 * s;
                add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.6, life: 0, max: rand(140, 190), color: i % 4 === 0 ? "#fff1c1" : "#ffc85c", size: 1.9, drag: 0.972, grav: 0.022, glitter: true });
            }
        } else {
            // peony / crackle
            const n = Math.min(room, Math.round(130 * tierMul) + 24);
            for (let i = 0; i < n; i++) {
                const a = rand(0, Math.PI * 2), v = (0.55 + Math.sqrt(Math.random()) * 0.45) * 5.4 * s;
                add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: rand(65, 95), color: i % 3 === 0 ? c2 : c1, size: 2.1, drag: 0.962, grav: 0.03, glitter: kind === "crackle", crackle: kind === "crackle" && Math.random() < 0.35 });
            }
        }
        this.opts.onBurst?.(x / this.w, y / this.h, size, kind);
    }

    /** Particles fly in from burst points and spell the lines, hold, then fall like glitter. */
    writeText(lines: string[], opts: { font: string; colors?: string[]; holdMs?: number; top?: number; bottom?: number } = { font: "800 10px sans-serif" }) {
        const W = Math.round(this.w), H = Math.round(this.h);
        if (W < 10 || H < 10) return;
        const off = document.createElement("canvas");
        off.width = W; off.height = H;
        const oc = off.getContext("2d", { willReadFrequently: true })!;
        const top = (opts.top ?? 0.2) * H, bottom = (opts.bottom ?? 0.56) * H;
        const avail = bottom - top;
        const sizes = lines.map((l, i) => {
            let fs = i === lines.length - 1 ? avail * 0.52 : avail * 0.3;
            oc.font = opts.font.replace(/\d+px/, `${fs}px`);
            const mw = oc.measureText(l).width;
            if (mw > W * 0.86) fs *= (W * 0.86) / mw;
            return fs;
        });
        const total = sizes.reduce((a, b) => a + b * 1.12, 0);
        let y = top + (avail - total) / 2;
        oc.fillStyle = "#fff"; oc.textAlign = "center"; oc.textBaseline = "top";
        lines.forEach((l, i) => { oc.font = opts.font.replace(/\d+px/, `${sizes[i]}px`); oc.fillText(l, W / 2, y); y += sizes[i] * 1.12; });

        const data = oc.getImageData(0, 0, W, H).data;
        const gap = this.opts.tier === "high" ? 4 : this.opts.tier === "mid" ? 6 : 8;
        const pts: Array<[number, number]> = [];
        for (let py = 0; py < H; py += gap) for (let px = 0; px < W; px += gap) if (data[(py * W + px) * 4 + 3] > 140) pts.push([px, py]);
        const maxPts = Math.max(120, Math.floor(BUDGET[this.opts.tier] * 0.75));
        const step = pts.length > maxPts ? pts.length / maxPts : 1;
        const colors = opts.colors?.length ? opts.colors : ["#ffe7a3", "#ffd166", "#ffffff"];
        const origins = [[0.22, 0.3], [0.5, 0.18], [0.78, 0.3]].map(([ox, oy]) => [ox * W, oy * H]);
        origins.forEach(([ox, oy]) => this.opts.onBurst?.(ox / W, oy / H, 1.2, "peony"));
        const hold = (opts.holdMs ?? 3800) / 16.67;
        for (let k = 0; k < pts.length; k += step) {
            const [tx, ty] = pts[Math.floor(k)];
            const [ox, oy] = origins[Math.floor(Math.random() * origins.length)];
            this.sparks.push({ x: ox, y: oy, vx: 0, vy: 0, life: 0, max: 70 + hold + 90, color: pick(colors), size: gap * 0.55 + 0.6, drag: 0.97, grav: 0.02, glitter: true, sx: ox, sy: oy, tx, ty, tt: 62 + Math.random() * 18, hold });
        }
    }

    /** Let any sky text fade out quickly (before the next act). */
    fadeText() {
        for (const p of this.sparks) if (p.tx !== undefined) { p.hold = 0; p.max = Math.min(p.max, p.life + 18); }
    }

    /** Stop all fountains / spinners right now. */
    stopEmitters() { this.emitters = []; }

    /** Gold fountain (anaar) at x (0..1) for `ms`. */
    fountain(x: number, ms: number) { this.emitters.push({ kind: "fountain", x, until: performance.now() + ms, angle: 0 }); }
    /** Ground spinner (chakri) at x (0..1) for `ms`. */
    chakri(x: number, ms: number) { this.emitters.push({ kind: "chakri", x, until: performance.now() + ms, angle: 0 }); }

    /** Party popper fired from a bottom corner: a burst of confetti + long curly streamers. */
    popper(side: "left" | "right") {
        const s = this.scale();
        const n = Math.round(70 * (this.opts.tier === "high" ? 1 : this.opts.tier === "mid" ? 0.65 : 0.35));
        const left = side === "left";
        const x0 = left ? this.w * 0.07 : this.w * 0.93, y0 = this.h - 118;
        for (let i = 0; i < n; i++) {
            const a = rand(Math.PI * 0.3, Math.PI * 0.48);
            const v = rand(9, 17) * s;
            const ribbon = i % 5 === 0;
            this.confetti.push({
                x: x0, y: y0, vx: (left ? 1 : -1) * Math.cos(a) * v, vy: -Math.sin(a) * v,
                rot: rand(0, Math.PI), vr: rand(-0.3, 0.3), w: ribbon ? rand(26, 40) : rand(6, 10), h: ribbon ? 3 : rand(3, 6),
                color: pick(this.opts.palette), life: 0, wob: rand(0, 6),
            });
        }
        this.frontDirty = true;
    }

    /** Confetti cannons from both bottom corners. */
    cannons(count = 160) {
        const n = Math.round(count * (this.opts.tier === "high" ? 1 : this.opts.tier === "mid" ? 0.6 : 0.3));
        const s = this.scale();
        for (let i = 0; i < n; i++) {
            const left = i % 2 === 0;
            const a = rand(Math.PI * 0.28, Math.PI * 0.44); // angle above the horizon
            const v = rand(11, 19) * s;
            this.confetti.push({
                x: left ? 0 : this.w, y: this.h, vx: (left ? 1 : -1) * Math.cos(a) * v, vy: -Math.sin(a) * v,
                rot: rand(0, Math.PI), vr: rand(-0.25, 0.25), w: rand(6, 11), h: rand(3, 6), color: pick(this.opts.palette), life: 0, wob: rand(0, 6),
            });
        }
    }

    private step(f: number) {
        const { sc, fc, w, h } = this;
        // fade towards the sky background (keeps glowing trails)
        if (this.bg) {
            sc.globalCompositeOperation = "source-over";
            sc.globalAlpha = Math.min(1, 0.2 * f);
            sc.drawImage(this.bg, 0, 0, w, h);
            sc.globalAlpha = 1;
        }
        sc.globalCompositeOperation = "lighter";

        const now = performance.now();
        // emitters
        for (const e of this.emitters) {
            if (now > e.until) continue;
            const s = this.scale();
            const room = this.room();
            if (room < 10) continue;
            if (e.kind === "fountain") {
                const k = Math.min(room, Math.round((this.opts.tier === "high" ? 7 : this.opts.tier === "mid" ? 4 : 2) * f));
                for (let i = 0; i < k; i++) {
                    const a = -Math.PI / 2 + rand(-0.2, 0.2), v = rand(6.5, 10) * s;
                    this.sparks.push({ x: e.x * w + rand(-4, 4), y: h - 4, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: rand(45, 70), color: Math.random() < 0.3 ? "#ffffff" : "#ffcf6b", size: 1.7, drag: 0.985, grav: 0.16, glitter: true });
                }
            } else {
                e.angle += 0.32 * f;
                const k = Math.min(room, Math.round((this.opts.tier === "low" ? 2 : 4) * f));
                for (let i = 0; i < k; i++) {
                    const a = e.angle + (i * Math.PI * 2) / k, v = rand(3, 5) * s;
                    this.sparks.push({ x: e.x * w + Math.cos(e.angle) * 10, y: h - 18 + Math.sin(e.angle) * 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 0, max: rand(25, 40), color: pick(["#ff5c8a", "#ffd166", "#7cf6ff", "#ffffff"]), size: 1.6, drag: 0.95, grav: 0.12, glitter: false });
                }
                // the wheel itself
                sc.fillStyle = "#fff6d5"; sc.beginPath(); sc.arc(e.x * w, h - 18, 4, 0, Math.PI * 2); sc.fill();
            }
        }
        this.emitters = this.emitters.filter((e) => now <= e.until);

        // rockets
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const r = this.rockets[i];
            r.x += r.vx * f; r.y += r.vy * f; r.vy += 0.12 * f;
            sc.fillStyle = "#fff3d0";
            sc.fillRect(r.x - 1.2, r.y - 1.2, 2.4, 2.4);
            if (Math.random() < 0.6 && this.room() > 5) this.sparks.push({ x: r.x, y: r.y + 3, vx: rand(-0.4, 0.4), vy: rand(0.5, 1.2), life: 0, max: rand(14, 24), color: "#ffcf6b", size: 1.3, drag: 0.94, grav: 0.02, glitter: false });
            if (r.vy >= -0.4 || r.y <= r.ty) {
                this.rockets.splice(i, 1);
                this.explode(r.x, r.y, r.kind, r.size, r.kind === "heart" ? "#ff4d8d" : r.color);
            }
        }

        // sparks
        const next: Spark[] = [];
        for (const p of this.sparks) {
            p.life += f;
            if (p.tx !== undefined && p.tt !== undefined && p.hold !== undefined) {
                // text particle: ease to target, hold with a soft twinkle, then fall
                if (p.life < p.tt) {
                    const t = p.life / p.tt, e = 1 - Math.pow(1 - t, 3);
                    p.x = p.sx! + (p.tx - p.sx!) * e; p.y = p.sy! + (p.ty! - p.sy!) * e;
                } else if (p.life < p.tt + p.hold) {
                    p.x = p.tx + Math.sin((p.life + p.tx) * 0.15) * 0.4; p.y = p.ty!;
                } else {
                    if (p.vx === 0 && p.vy === 0) { p.vx = rand(-0.4, 0.4); p.vy = rand(-0.3, 0.3); }
                    p.vx *= p.drag; p.vy = p.vy * p.drag + p.grav * f; p.x += p.vx * f; p.y += p.vy * f;
                }
            } else {
                p.vx *= Math.pow(p.drag, f); p.vy = p.vy * Math.pow(p.drag, f) + p.grav * f;
                p.x += p.vx * f; p.y += p.vy * f;
                if (p.crackle && p.life > p.max * 0.55) {
                    p.crackle = false;
                    sc.fillStyle = "#ffffff"; sc.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
                    if (this.room() > 4) for (let k = 0; k < 3; k++) next.push({ x: p.x, y: p.y, vx: rand(-1.2, 1.2), vy: rand(-1.2, 1.2), life: 0, max: rand(8, 16), color: "#fff6d5", size: 1.2, drag: 0.9, grav: 0.02, glitter: false });
                }
            }
            const left = 1 - p.life / p.max;
            if (left <= 0 || p.y > h + 20) continue;
            let a = Math.min(1, left * 1.6);
            if (p.glitter && p.tx === undefined) a *= Math.random() < 0.25 ? 0.25 : 1;
            if (p.tx !== undefined && p.life > (p.tt ?? 0) && p.life < (p.tt ?? 0) + (p.hold ?? 0)) a = 0.75 + Math.random() * 0.25;
            sc.globalAlpha = a;
            sc.fillStyle = p.color;
            const sz = p.size;
            sc.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
            next.push(p);
        }
        this.sparks = next;
        sc.globalAlpha = 1;
        sc.globalCompositeOperation = "source-over";

        // confetti (front canvas, cleared each frame; skipped entirely while there is no confetti)
        if (!this.confetti.length && !this.frontDirty) return;
        fc.clearRect(0, 0, w, h);
        this.frontDirty = this.confetti.length > 0;
        const keep: Confetto[] = [];
        for (const c of this.confetti) {
            c.life += f;
            c.vx *= Math.pow(0.985, f); c.vy = c.vy * Math.pow(0.985, f) + 0.22 * f;
            if (c.vy > 2.4) c.vy = 2.4;
            c.x += (c.vx + Math.sin((c.life + c.wob * 10) * 0.08) * 0.8) * f; c.y += c.vy * f; c.rot += c.vr * f;
            if (c.y > h + 20 || c.life > 420) continue;
            fc.save();
            fc.translate(c.x, c.y); fc.rotate(c.rot);
            fc.scale(1, Math.abs(Math.cos(c.life * 0.12 + c.wob)));
            fc.fillStyle = c.color;
            fc.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
            fc.restore();
            keep.push(c);
        }
        this.confetti = keep;
    }

    /** PNG of the current sky over a dark background (for the memory card). */
    snapshot(): HTMLCanvasElement {
        const c = document.createElement("canvas");
        c.width = this.sky.width; c.height = this.sky.height;
        const x = c.getContext("2d")!;
        x.drawImage(this.sky, 0, 0);
        x.drawImage(this.front, 0, 0);
        return c;
    }
}
