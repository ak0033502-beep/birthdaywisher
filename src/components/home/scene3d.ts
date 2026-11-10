import * as THREE from "three";

/* =========================================================
   Homepage hero 3D scene (procedural: zero model downloads)
   - Loaded with dynamic import() only on "high" tier devices, after first paint
   - Pauses when off-screen or in a background tab
   - Adaptive quality: lowers pixel ratio, then effects, then asks to fall back to CSS 3D
   ========================================================= */

const PALETTE = [0xff5c8a, 0xff9f43, 0xffd93d, 0x2ed8b6, 0x7c5cff];

export type SceneOptions = {
    onPop?: (x: number, y: number) => void;
    onGift?: (x: number, y: number) => void;
    onTooSlow?: () => void;
};

type BalloonRec = {
    g: THREE.Group;
    str?: THREE.Line;
    home: THREE.Vector3;
    phase: number;
    popped: boolean;
    t: number;
    inCluster: boolean;
    scale: number;
    rise: number;
    respawn?: number;
};

export function initScene(container: HTMLElement, opts: SceneOptions = {}) {
    let dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const renderer = new THREE.WebGLRenderer({ antialias: dpr < 1.5, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 13);

    /* ---------- Lights ---------- */
    const hemi = new THREE.HemisphereLight(0xfff4e8, 0xffd6e4, 1.2);
    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(-4, 6, 8);
    scene.add(hemi, sun);
    const partyLights = PALETTE.slice(0, 3).map((c, i) => {
        const l = new THREE.PointLight(c, 0, 14, 1.6);
        l.position.set(-3 + i * 3, 2.5 - i, 3);
        scene.add(l);
        return l;
    });

    /* ---------- Geometry ---------- */
    const balloonGeo = (() => {
        const pts: THREE.Vector2[] = [];
        const N = 28;
        for (let i = 0; i <= N; i++) {
            const th = (i / N) * Math.PI;
            let x = Math.sin(th), y = -Math.cos(th);
            if (y < 0) { y *= 1.38; x *= 1 - (0.22 * -y) / 1.38; }
            pts.push(new THREE.Vector2(Math.max(x * 0.95, 0.001), y * 0.95));
        }
        return new THREE.LatheGeometry(pts, 32);
    })();
    const knotGeo = new THREE.ConeGeometry(0.1, 0.16, 8);
    const balloonMats = PALETTE.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.22, metalness: 0.08, emissive: c, emissiveIntensity: 0 }));
    const stringMat = new THREE.LineBasicMaterial({ color: 0x8a7fa8, transparent: true, opacity: 0.55 });

    const clickable: THREE.Object3D[] = [];
    const balloons: BalloonRec[] = [];

    function makeBalloon(colorIdx: number, scale = 1) {
        const g = new THREE.Group();
        const body = new THREE.Mesh(balloonGeo, balloonMats[colorIdx % 5]);
        const knot = new THREE.Mesh(knotGeo, balloonMats[colorIdx % 5]);
        knot.position.y = -1.36;
        knot.rotation.x = Math.PI;
        g.add(body, knot);
        g.scale.setScalar(scale);
        body.userData.balloon = g;
        clickable.push(body);
        return g;
    }
    function makeString(from: THREE.Vector3, to: THREE.Vector3) {
        const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0.25, 0, 0));
        const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
        return new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(16)), stringMat);
    }

    /* ---------- Gift + balloon cluster ---------- */
    const cluster = new THREE.Group();
    scene.add(cluster);
    const gift = new THREE.Group();
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xff5c8a, roughness: 0.45 });
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xffd93d, roughness: 0.35, metalness: 0.15 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.6), boxMat);
    const rib1 = new THREE.Mesh(new THREE.BoxGeometry(1.62, 1.42, 0.26), ribbonMat);
    const rib2 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.42, 1.62), ribbonMat);
    const lid = new THREE.Group();
    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.34, 1.78), boxMat);
    const lr1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.36, 0.26), ribbonMat);
    const lr2 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.36, 1.8), ribbonMat);
    const bowGeo = new THREE.TorusGeometry(0.28, 0.09, 10, 24);
    const bowL = new THREE.Mesh(bowGeo, ribbonMat); bowL.position.set(-0.26, 0.38, 0); bowL.rotation.set(0, 0, 0.6);
    const bowR = new THREE.Mesh(bowGeo, ribbonMat); bowR.position.set(0.26, 0.38, 0); bowR.rotation.set(0, 0, -0.6);
    lid.add(lidMesh, lr1, lr2, bowL, bowR);
    lid.position.y = 0.87;
    gift.add(box, rib1, rib2, lid);
    gift.rotation.set(0.12, -0.5, 0);
    cluster.add(gift);
    [box, lidMesh, rib1, rib2].forEach((m) => { m.userData.gift = true; clickable.push(m); });

    const tie = new THREE.Vector3(0, 1.3, 0);
    ([[-1.4, 4.6, 0.2, 0, 1], [0.1, 5.4, -0.4, 1, 1.05], [1.5, 4.5, 0.3, 3, 0.95], [-0.6, 3.6, 0.9, 2, 0.85], [0.9, 3.4, 0.9, 4, 0.8]] as const)
        .forEach(([x, y, z, c, s], i) => {
            const b = makeBalloon(c, s);
            b.position.set(x, y, z);
            const str = makeString(tie, new THREE.Vector3(x, y - 1.35 * s, z));
            cluster.add(b, str);
            balloons.push({ g: b, str, home: b.position.clone(), phase: i * 1.3, popped: false, t: 0, inCluster: true, scale: s, rise: 0 });
        });

    const free: BalloonRec[] = [];
    for (let i = 0; i < 6; i++) {
        const s = 0.45 + Math.random() * 0.45;
        const b = makeBalloon(i, s);
        b.position.set(0, (Math.random() - 0.5) * 8, -5 + Math.random() * 5);
        scene.add(b);
        const rec: BalloonRec = { g: b, home: b.position.clone(), phase: Math.random() * 6, popped: false, t: 0, inCluster: false, scale: s, rise: 0.15 + Math.random() * 0.2 };
        balloons.push(rec); free.push(rec);
    }

    /* ---------- Confetti: one instanced mesh = one draw call ---------- */
    const CONF = 140;
    const confMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    const confetti = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.14, 0.07), confMat, CONF);
    const confData = Array.from({ length: CONF }, (_, i) => {
        confetti.setColorAt(i, new THREE.Color(PALETTE[i % 5]));
        return { p: new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 10, -6 + Math.random() * 7), r: new THREE.Euler(Math.random() * 6, Math.random() * 6, 0), vr: 0.5 + Math.random() * 1.5, vy: 0.25 + Math.random() * 0.45, sway: Math.random() * 6 };
    });
    scene.add(confetti);
    const dummy = new THREE.Object3D();

    /* ---------- Layout ---------- */
    let view = { w: 1, h: 1 };
    let portrait = false;
    function layout() {
        const w = container.clientWidth || 1, h = container.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const visH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
        const visW = visH * camera.aspect;
        view = { w: visW, h: visH };
        portrait = camera.aspect <= 1.05;
        if (!portrait) { cluster.position.set(visW * 0.24, -visH * 0.2, 0); cluster.scale.setScalar(0.92); }
        else { cluster.position.set(0, -visH * 0.42, 0); cluster.scale.setScalar(Math.min(0.75, visW / 7.5)); }
        // Keep free balloons away from the headline; none on phones
        free.forEach((f, i) => { f.home.x = visW * (0.04 + ((i * 0.37) % 1) * 0.44); f.g.visible = !portrait; });
    }
    const ro = new ResizeObserver(layout);
    ro.observe(container);
    layout();

    /* ---------- Day / Night lighting (follows <html data-party>) ---------- */
    function applyTheme() {
        const night = document.documentElement.getAttribute("data-party") === "night";
        hemi.intensity = night ? 0.5 : 1.2;
        hemi.color.setHex(night ? 0x8f7fe0 : 0xfff4e8);
        hemi.groundColor.setHex(night ? 0x1a1530 : 0xffd6e4);
        sun.intensity = night ? 0.55 : 1.8;
        partyLights.forEach((l) => (l.intensity = night ? 22 : 0));
        balloonMats.forEach((m) => (m.emissiveIntensity = night ? 0.18 : 0));
        confMat.opacity = night ? 0.75 : 0.9;
    }
    const mo = new MutationObserver(applyTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-party"] });
    applyTheme();

    /* ---------- Interaction ---------- */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let lidAnim = 0;
    const hit = (e: PointerEvent) => {
        const r = renderer.domElement.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        return ray.intersectObjects(clickable, false)[0];
    };
    const onMove = (e: PointerEvent) => {
        const r = renderer.domElement.getBoundingClientRect();
        pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
        if (e.pointerType === "mouse") renderer.domElement.style.cursor = hit(e) ? "pointer" : "";
    };
    const onDown = (e: PointerEvent) => {
        const h = hit(e);
        if (!h) return;
        if (h.object.userData.gift) {
            if (lidAnim <= 0) { lidAnim = 1; opts.onGift?.(e.clientX, e.clientY); }
            return;
        }
        const rec = balloons.find((b) => b.g === h.object.userData.balloon);
        if (rec && !rec.popped) { rec.popped = true; rec.t = 0; opts.onPop?.(e.clientX, e.clientY); }
    };
    container.addEventListener("pointermove", onMove, { passive: true });
    container.addEventListener("pointerdown", onDown);

    /* ---------- Loop: pause when hidden + adaptive quality ---------- */
    let running = true, visible = true, raf = 0, last = performance.now(), elapsed = 0;
    const frameTimes: number[] = [];
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); }, { threshold: 0.01 });
    io.observe(container);
    const onVis = () => { if (!document.hidden) kick(); };
    document.addEventListener("visibilitychange", onVis);

    function kick() { if (!raf && running && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } }

    function governor(dt: number) {
        frameTimes.push(dt);
        if (frameTimes.length < 90) return;
        const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        frameTimes.length = 0;
        if (avg <= 24) return;
        if (dpr > 1) { dpr = Math.max(1, dpr - 0.35); renderer.setPixelRatio(dpr); layout(); }
        else if (confetti.count > 30) { confetti.count = 30; free.forEach((f, i) => (f.g.visible = !portrait && i < 2)); }
        else opts.onTooSlow?.();
    }

    function tick(now: number) {
        raf = 0;
        if (!running || !visible || document.hidden) return;
        const dt = Math.min(64, now - last); last = now;
        const s = dt / 1000; elapsed += s;
        governor(dt);

        pointer.x += (pointer.tx - pointer.x) * 0.06;
        pointer.y += (pointer.ty - pointer.y) * 0.06;
        camera.position.x = pointer.x * 0.9 + Math.sin(elapsed * 0.3) * 0.25;
        camera.position.y = -pointer.y * 0.6 + Math.cos(elapsed * 0.25) * 0.15;
        camera.lookAt(0, 0, 0);

        gift.rotation.y = -0.5 + Math.sin(elapsed * 0.6) * 0.18;
        if (lidAnim > 0) {
            lidAnim = Math.max(0, lidAnim - s * 0.7);
            const k = Math.sin((1 - lidAnim) * Math.PI);
            lid.position.y = 0.87 + k * 1.6;
            lid.rotation.z = k * 0.5;
            lid.rotation.y = (1 - lidAnim) * Math.PI * 2;
        }

        for (const b of balloons) {
            if (b.popped) {
                b.t += s;
                if (b.t < 0.12) b.g.scale.setScalar(b.scale * (1 + b.t * 4));
                else if (b.t < 0.2) b.g.scale.setScalar(b.scale * Math.max(0.001, (0.2 - b.t) * 15));
                else { b.g.visible = false; if (b.str) b.str.visible = false; }
                if (b.t > 2.6) { b.popped = false; b.t = 0; b.g.visible = b.inCluster || !portrait; if (b.str) b.str.visible = true; b.g.scale.setScalar(0.001); b.respawn = 0; }
                continue;
            }
            if (b.respawn !== undefined) {
                b.respawn += s;
                const k = Math.min(1, b.respawn / 0.7);
                const el = k === 1 ? 1 : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1; // easeOutElastic
                b.g.scale.setScalar(b.scale * Math.max(0.001, el));
                if (k === 1) delete b.respawn;
            }
            const bob = Math.sin(elapsed * 1.1 + b.phase) * 0.18;
            if (b.inCluster) {
                b.g.position.set(b.home.x + Math.sin(elapsed * 0.7 + b.phase) * 0.12, b.home.y + bob, b.home.z);
                b.g.rotation.z = Math.sin(elapsed * 0.8 + b.phase) * 0.08;
            } else {
                b.home.y += b.rise * s;
                if (b.home.y > view.h / 2 + 2) b.home.y = -view.h / 2 - 2;
                b.g.position.set(b.home.x + Math.sin(elapsed * 0.5 + b.phase) * 0.4, b.home.y + bob, b.home.z);
                b.g.rotation.z = Math.sin(elapsed * 0.6 + b.phase) * 0.12;
            }
        }

        for (let i = 0; i < confetti.count; i++) {
            const c = confData[i];
            c.p.y -= c.vy * s;
            c.p.x += Math.sin(elapsed + c.sway) * 0.004;
            if (c.p.y < -view.h / 2 - 1) c.p.y = view.h / 2 + 1;
            c.r.x += c.vr * s; c.r.y += c.vr * 0.7 * s;
            dummy.position.copy(c.p); dummy.rotation.copy(c.r); dummy.updateMatrix();
            confetti.setMatrixAt(i, dummy.matrix);
        }
        confetti.instanceMatrix.needsUpdate = true;

        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
    }
    kick();

    return {
        dispose() {
            running = false;
            cancelAnimationFrame(raf);
            io.disconnect(); ro.disconnect(); mo.disconnect();
            document.removeEventListener("visibilitychange", onVis);
            container.removeEventListener("pointermove", onMove);
            container.removeEventListener("pointerdown", onDown);
            scene.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); });
            [...balloonMats, stringMat, boxMat, ribbonMat, confMat].forEach((m) => m.dispose());
            renderer.dispose();
            renderer.domElement.remove();
        },
    };
}
