"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import type { BlockType, WishDataV2 } from "@/lib/wish/schema";
import { BLOCKS } from "@/blocks/registry";
import type { Tr } from "@/blocks/slides";
import type { StyleId } from "./styles";
import { HoldToOpen } from "./HoldToOpen";
import { playUi } from "@/lib/celebration/uiSound";

const label = (t: BlockType) => BLOCKS[t]?.label ?? "Surprise";
const slug = (t: BlockType) => label(t).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

const emptySubscribe = () => () => {};
/** Current time as "hh:mm", hydrated cleanly without synchronous setState in useEffect. */
function useClock() {
    return useSyncExternalStore(
        emptySubscribe,
        () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        () => "",
    );
}

const recipientName = (wish: WishDataV2) =>
    (wish.wishType === "anniversary" ? wish.recipient.coupleName || wish.recipient.name : wish.recipient.nickname || wish.recipient.name) || "you";

function moodKey(theme: string | undefined): "party" | "neon" | "elegant" | "pastel" | "monochrome" | "paper" {
    switch (theme) {
        case "party": return "party";
        case "elegant": case "golden-anniversary": case "rosegold-elegance": case "royal-navy": return "elegant";
        case "pastel": case "cherry-blossom": return "pastel";
        case "monochrome": return "monochrome";
        case "paper": case "vintage-love": return "paper";
        default: return "neon";
    }
}

const PARTY_COLORS = ["#FF5C8A", "#7C5CFF", "#FFD93D", "#2ED8B6", "#FF9F43"];
const NEON_COLORS = ["#ec4899", "#22d3ee", "#a855f7", "#38bdf8"];

/** Ambient mood particles + lighting for the chosen colour skin. */
export function MoodDecor({ theme, style }: { theme?: string; style: StyleId }) {
    if (style === "terminal") return null; // terminal has its own CRT + code rain
    const mood = moodKey(theme);
    const count = style === "gallery" || style === "storybook" ? 7 : 12;
    return (
        <div className={`bvm-layer bvm-${mood}`} aria-hidden="true">
            <div className="bvm-vignette" />
            {Array.from({ length: count }, (_, i) => {
                const c = mood === "party" ? PARTY_COLORS[i % PARTY_COLORS.length]
                    : mood === "neon" ? NEON_COLORS[i % NEON_COLORS.length]
                    : undefined;
                return (
                    <span
                        key={i}
                        className="bvm-mote"
                        style={{
                            left: `${(i * 73 + 9) % 96}%`,
                            animationDuration: `${11 + (i % 6) * 2.4}s`,
                            animationDelay: `${-(i * 1.9)}s`,
                            ["--m-dx" as string]: `${(i % 2 ? 1 : -1) * (16 + (i % 4) * 9)}px`,
                            ...(c ? { ["--m-c" as string]: c } : {}),
                        }}
                    />
                );
            })}
        </div>
    );
}

const CODE_STREAMS = ["01001100", "01001111", "01010110", "01000101", "{wish:1}", "sudo_party", "10110010", "01001000"];

/** Decorative background layer for a style (pointer-events: none). */
export function StyleDecor({ style, theme }: { style: StyleId; theme?: string }) {
    return (
        <>
            <MoodDecor theme={theme} style={style} />
            {style === "cinematic" && <div className="bvs-decor"><span className="bvs-cine-glow" /></div>}
            {style === "terminal" && (
                <>
                    <div className="bvs-decor bvs-code-rain" aria-hidden="true">
                        {CODE_STREAMS.map((txt, n) => (
                            <span key={n} style={{ left: `${6 + n * 12.5}%`, animationDuration: `${9 + (n % 4) * 3}s`, animationDelay: `${-(n * 1.7)}s` }}>
                                {txt}
                            </span>
                        ))}
                    </div>
                    <div className="bvs-decor bvs-scan" aria-hidden="true" />
                </>
            )}
            {style === "galaxy" && (
                <div className="bvs-decor" aria-hidden="true">
                    {Array.from({ length: 18 }, (_, k) => (
                        <span
                            key={k}
                            className="bvs-dust"
                            style={{
                                left: `${(k * 53 + 7) % 97}%`,
                                top: `${(k * 41 + 11) % 92}%`,
                                width: k % 3 === 0 ? 3 : 2,
                                height: k % 3 === 0 ? 3 : 2,
                                animationDelay: `${(k % 5) * 0.7}s`,
                            }}
                        />
                    ))}
                    <span className="bvs-planet p1" />
                    <span className="bvs-planet p2"><i /></span>
                    <span className="bvs-planet p3" />
                    <span className="bvs-orbit o1" />
                    <span className="bvs-orbit o2" />
                    <span className="bvs-rocket">🚀</span>
                    <span className="bvs-comet" />
                </div>
            )}
            {style === "gallery" && <div className="bvs-decor" aria-hidden="true"><span className="bvs-spot" /><span className="bvs-rope" /></div>}
            {style === "storybook" && <div className="bvs-decor" aria-hidden="true"><span className="bvs-book" /></div>}
            {style === "messenger" && <div className="bvs-decor bvs-wallpaper" aria-hidden="true" />}
        </>
    );
}

/** Top bar for a style. */
export function StyleHeader({ style, wish, idx, total, type, i }: { style: StyleId; wish: WishDataV2; idx: number; total: number; type?: BlockType; i: Tr }) {
    const name = recipientName(wish);
    if (style === "terminal") {
        const filled = Math.round(((idx + 1) / Math.max(1, total)) * 12);
        return (
            <div className="bvs-head bvs-term-bar">
                <span className="dots" aria-hidden="true"><i /><i /><i /></span>
                <span className="ttl">{name.toLowerCase().replace(/\s+/g, "_")}@birthday: ~/surprise</span>
                <span className="prog">[{"#".repeat(filled)}{".".repeat(12 - filled)}] {idx + 1}/{total}</span>
            </div>
        );
    }
    if (style === "messenger") {
        return (
            <div className="bvs-head bvs-chat-bar">
                <span className="av" aria-hidden="true">🎁</span>
                <span className="who"><b>{i.fromLabel}: {name}</b><small>online · message {idx + 1} of {total}</small></span>
                <span className="ic" aria-hidden="true">📹</span>
            </div>
        );
    }
    if (style === "storybook") {
        return <div className="bvs-head bvs-book-head"><span>📖 The Story of {name}</span><span>Chapter {idx + 1} / {total}</span></div>;
    }
    if (style === "galaxy") {
        return <div className="bvs-head bvs-hud"><span>🛰️ Mission: {name}</span><span>Sector {idx + 1}/{total}{type ? ` · ${label(type)}` : ""}</span></div>;
    }
    if (style === "gallery") {
        return <div className="bvs-head bvs-museum-head"><span>🏛️ The {name} Exhibition</span><span>Room {idx + 1} / {total}</span></div>;
    }
    return (
        <div className="bvs-cine-head">
            <span>🎬 {i.fromLabel}: {wish.recipient.name}</span>
            <span className="bvs-cine-scene">Scene {idx + 1}/{total}{type ? ` · ${label(type)}` : ""}</span>
        </div>
    );
}

const CHAT_CHIPS: Array<[string, string]> = [
    ["🥹❤️", "🥹❤️"],
    ["😂", "😂 stoppp"],
    ["🥰", "🥰 aww!"],
    ["🔥", "🔥 best!"],
];

function ChatSlideBody({ idx, type, embed, clock, children }: { idx: number; type: BlockType; embed: boolean; clock: string; children: ReactNode }) {
    const [typing, setTyping] = useState(!embed);
    const [sent, setSent] = useState<string>("");
    const [floats, setFloats] = useState<Array<{ id: number; e: string }>>([]);

    useEffect(() => {
        if (embed) return;
        const t = setTimeout(() => setTyping(false), 620);
        return () => clearTimeout(t);
    }, [embed]);

    const react = (emoji: string, text: string) => {
        setSent(text);
        playUi("ping", { gain: 0.55 });
        setFloats((f) => [...f.slice(-4), { id: (f[f.length - 1]?.id ?? 0) + 1, e: emoji }]);
    };

    return (
        <div className="bvs-chat">
            {idx > 0 && !embed && (
                <div className="bvs-prev-msg" aria-hidden="true">
                    💌 Previous: {label(type === "finale" ? "message" : "intro")} <span className="bvs-ticks">✓✓</span>
                </div>
            )}
            {typing ? (
                <div className="bvs-bubble in typing" aria-label="typing"><i /><i /><i /></div>
            ) : (
                <>
                    <div className="bvs-bubble in">
                        <div className="bvs-bubble-body">{children}</div>
                        <span className="bvs-time">{clock} <span className="bvs-ticks">✓✓</span></span>
                    </div>
                    {sent && <div className="bvs-reply-out">{sent} <span style={{ fontSize: 11, opacity: 0.85 }}>✓✓</span></div>}
                    {!embed && type !== "finale" && (
                        <div className="bvs-react-bar" role="group" aria-label="Quick reactions">
                            {CHAT_CHIPS.map(([em, tx]) => (
                                <button
                                    key={tx}
                                    type="button"
                                    className={`bvs-react-chip ${sent === tx ? "is-sent" : ""}`}
                                    onClick={() => react(em, tx)}
                                >
                                    {tx}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
            {floats.map((f) => <span key={f.id} className="bvs-float-react" aria-hidden="true">{f.e}</span>)}
        </div>
    );
}

/** Wraps one slide's content in the style's frame. */
export function SlideFrame({ style, idx, type, embed = false, children }: { style: StyleId; idx: number; type: BlockType; embed?: boolean; children: ReactNode }) {
    const clock = useClock();

    if (style === "terminal") {
        return (
            <div className="bvs-term">
                <div className="bvs-prompt" key={idx}><span className="u">root@surprise:~$</span> <span className="cmd">./run_{slug(type)}.sh --decrypt</span><span className="cur" aria-hidden="true">▌</span></div>
                <div className="bvs-term-out">{children}</div>
            </div>
        );
    }
    if (style === "storybook") {
        return (
            <div className="bvs-page">
                <span className="bvs-bookmark" aria-hidden="true" />
                <span className="bvs-corner tl" aria-hidden="true">❦</span>
                <span className="bvs-corner tr" aria-hidden="true">❦</span>
                <span className="bvs-corner bl" aria-hidden="true">❦</span>
                <span className="bvs-corner br" aria-hidden="true">❦</span>
                <div className="bvs-chapter">Chapter {idx + 1} · <em>{label(type)}</em></div>
                <div className="bvs-page-body">{children}</div>
                <div className="bvs-folio">— Page {idx + 1} —</div>
            </div>
        );
    }
    if (style === "messenger") {
        return <ChatSlideBody key={idx} idx={idx} type={type} embed={embed} clock={clock}>{children}</ChatSlideBody>;
    }
    if (style === "gallery") {
        return (
            <div className="bvs-exhibit">
                <div className="bvs-frame"><div className="bvs-mat">{children}</div></div>
                <div className="bvs-placard">
                    <b>Exhibit No. {idx + 1} — {label(type)}</b>
                    <small>Permanent Collection · Curated with love</small>
                </div>
            </div>
        );
    }
    if (style === "galaxy") {
        return (
            <div className="bvs-holo">
                <span className="bvs-holo-tag">Telemetry · Coordinate 0{idx + 1}</span>
                {children}
            </div>
        );
    }
    return <>{children}</>;
}

/** Cover screen (before the wish opens), one per style. Opening = press & hold (see HoldToOpen), or passive in embed preview. */
export function StyleCover({ style, wish, i, vars, onOpen, embed = false }: { style: StyleId; wish: WishDataV2; i: Tr; vars: CSSProperties; onOpen: () => void; embed?: boolean }) {
    const name = recipientName(wish);
    const clock = useClock();
    const [hold, setHold] = useState({ p: 0, on: false });
    const [opening, setOpening] = useState(false);
    const onProgress = useCallback((p: number, on: boolean) => setHold({ p, on }), []);
    const open = useCallback(() => { setOpening(true); setTimeout(onOpen, 380); }, [onOpen]);
    const cls = `bv-envelope bvs-cover bvs-cover-${style} ${embed ? "bv-embed" : ""} ${hold.on ? "is-holding" : ""} ${opening ? "is-opening" : ""}`;
    const HOLD: Record<StyleId, [string, string]> = {
        cinematic: ["Hold to open your gift", "🎁"],
        terminal: ["[ hold to decrypt ]", "🔓"],
        storybook: ["Hold to open the book", "📖"],
        messenger: ["Hold to read the message", "💌"],
        galaxy: ["Hold to launch", "🚀"],
        gallery: ["Hold to enter", "🗝️"],
    };
    const holdBtn = <HoldToOpen label={HOLD[style][0]} icon={HOLD[style][1]} onOpen={open} onProgress={onProgress} />;
    let body: ReactNode;
    if (style === "terminal") {
        body = (
            <>
                <span className="bvs-cover-icon" aria-hidden="true">💾</span>
                <span className="bvs-term-lines">
                    <span>&gt; incoming transmission...</span>
                    <span>&gt; recipient: {name}</span>
                    <span>&gt; payload: birthday_surprise.zip</span>
                </span>
                {holdBtn}
            </>
        );
    } else if (style === "storybook") {
        body = (
            <span className="bvs-cover-book">
                <small>A story for</small>
                <b>{name}</b>
                <span aria-hidden="true" style={{ fontSize: 46 }}>{wish.wishType === "anniversary" ? "💍" : "🎂"}</span>
                {holdBtn}
            </span>
        );
    } else if (style === "messenger") {
        body = (
            <>
                <span className="bvs-lock-time">{clock || "12:00"}</span>
                <span className="bvs-notif">
                    <span className="av" aria-hidden="true">🎁</span>
                    <span><b>Secret Chat</b><small>1 new message for {name} 💌</small></span>
                </span>
                <span style={{ marginTop: "auto", marginBottom: embed ? "4vh" : "10vh" }}>{holdBtn}</span>
            </>
        );
    } else if (style === "galaxy") {
        body = (
            <>
                <span className="bvs-cover-icon bvs-launch" aria-hidden="true">🚀</span>
                <b className="bvs-cover-title">Mission: {name}&apos;s {wish.wishType === "anniversary" ? "anniversary" : "birthday"}</b>
                {holdBtn}
            </>
        );
    } else if (style === "gallery") {
        body = (
            <>
                <span className="bvs-cover-icon" aria-hidden="true">🏛️</span>
                <b className="bvs-cover-title">Welcome to the {name} Exhibition</b>
                <small className="bv-muted">Admit One · Private Viewing</small>
                {holdBtn}
            </>
        );
    } else {
        body = (
            <>
                <span className="bv-muted" style={{ fontWeight: 800 }}>Someone who loves you made this</span>
                <span className="bv-env" aria-hidden="true">🎁</span>
                <span className="bv-muted" style={{ fontWeight: 800 }}>{i.fromLabel}: {wish.recipient.name}</span>
                {holdBtn}
                {!embed && <small className="bv-muted" style={{ fontSize: 12, opacity: 0.78 }}>🎧 Sound on for the full surprise</small>}
            </>
        );
    }
    return (
        <div className={cls} style={{ ...vars, ...(embed ? { position: "absolute" } : {}), ["--hold" as string]: hold.p.toFixed(3) }} data-style={style} data-skin={wish.look.theme}>
            <StyleDecor style={style} theme={wish.look.theme} />
            {body}
        </div>
    );
}
