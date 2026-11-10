"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { BlockType, WishDataV2 } from "@/lib/wish/schema";
import { BLOCKS } from "@/blocks/registry";
import type { Tr } from "@/blocks/slides";
import type { StyleId } from "./styles";

const label = (t: BlockType) => BLOCKS[t]?.label ?? "Surprise";
const slug = (t: BlockType) => label(t).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
/** Current time as "hh:mm", only after mount (avoids SSR/CSR mismatch). */
function useClock() {
    const [t, setT] = useState("");
    useEffect(() => { setT(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })); }, []);
    return t;
}

const recipientName = (wish: WishDataV2) =>
    (wish.wishType === "anniversary" ? wish.recipient.coupleName || wish.recipient.name : wish.recipient.nickname || wish.recipient.name) || "you";

/** Decorative background layer for a style (pointer-events: none). */
export function StyleDecor({ style }: { style: StyleId }) {
    if (style === "terminal") return <div className="bvs-decor bvs-scan" aria-hidden="true" />;
    if (style === "galaxy") {
        return (
            <div className="bvs-decor" aria-hidden="true">
                <span className="bvs-planet p1" />
                <span className="bvs-planet p2"><i /></span>
                <span className="bvs-planet p3" />
                <span className="bvs-orbit o1" />
                <span className="bvs-orbit o2" />
                <span className="bvs-rocket">🚀</span>
                <span className="bvs-comet" />
            </div>
        );
    }
    if (style === "gallery") return <div className="bvs-decor" aria-hidden="true"><span className="bvs-spot" /><span className="bvs-rope" /></div>;
    if (style === "storybook") return <div className="bvs-decor" aria-hidden="true"><span className="bvs-book" /></div>;
    if (style === "messenger") return <div className="bvs-decor bvs-wallpaper" aria-hidden="true" />;
    return null;
}

/** Top bar for a style. Cinematic keeps the default "To: name · 3/12". */
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
                <span className="who"><b>{i.fromLabel}: {name}</b><small>online · {idx + 1}/{total}</small></span>
                <span className="ic" aria-hidden="true">📞</span>
            </div>
        );
    }
    if (style === "storybook") {
        return <div className="bvs-head bvs-book-head"><span>📖 The Story of {name}</span><span>{idx + 1} / {total}</span></div>;
    }
    if (style === "galaxy") {
        return <div className="bvs-head bvs-hud"><span>🛰️ Mission: {name}</span><span>Planet {idx + 1} of {total}{type ? ` · ${label(type)}` : ""}</span></div>;
    }
    if (style === "gallery") {
        return <div className="bvs-head bvs-museum-head"><span>🏛️ The {name} Exhibition</span><span>Room {idx + 1} / {total}</span></div>;
    }
    return <div className="bv-to"><span>{i.fromLabel}: {wish.recipient.name}</span><span>{idx + 1}/{total}</span></div>;
}

/** Wraps one slide's content in the style's frame. */
export function SlideFrame({ style, idx, type, embed = false, children }: { style: StyleId; idx: number; type: BlockType; embed?: boolean; children: ReactNode }) {
    const clock = useClock();
    const [typing, setTyping] = useState(style === "messenger" && !embed);
    useEffect(() => {
        if (style !== "messenger" || embed) return;
        setTyping(true);
        const t = setTimeout(() => setTyping(false), 750);
        return () => clearTimeout(t);
    }, [style, idx, embed]);

    if (style === "terminal") {
        return (
            <div className="bvs-term">
                <div className="bvs-prompt" key={idx}><span className="u">$</span> <span className="cmd">./open_{slug(type)}.sh</span><span className="cur" aria-hidden="true">▌</span></div>
                <div className="bvs-term-out">{children}</div>
            </div>
        );
    }
    if (style === "storybook") {
        return (
            <div className="bvs-page">
                <div className="bvs-chapter">Chapter {idx + 1} · <em>{label(type)}</em></div>
                <div className="bvs-page-body">{children}</div>
                <div className="bvs-folio">— {idx + 1} —</div>
            </div>
        );
    }
    if (style === "messenger") {
        return (
            <div className="bvs-chat">
                {typing ? (
                    <div className="bvs-bubble in typing" aria-label="typing"><i /><i /><i /></div>
                ) : (
                    <div className="bvs-bubble in">
                        <div className="bvs-bubble-body">{children}</div>
                        <span className="bvs-time">{clock} ✓✓</span>
                    </div>
                )}
            </div>
        );
    }
    if (style === "gallery") {
        return (
            <div className="bvs-exhibit">
                <div className="bvs-frame"><div className="bvs-mat">{children}</div></div>
                <div className="bvs-placard"><b>Exhibit {idx + 1}: {label(type)}</b><small>Mixed media, love &amp; memories</small></div>
            </div>
        );
    }
    if (style === "galaxy") {
        return <div className="bvs-holo">{children}</div>;
    }
    return <>{children}</>;
}

/** Cover screen (before the wish opens), one per style. */
export function StyleCover({ style, wish, i, vars, onOpen }: { style: StyleId; wish: WishDataV2; i: Tr; vars: CSSProperties; onOpen: () => void }) {
    const name = recipientName(wish);
    const clock = useClock();
    const cls = `bv-envelope bvs-cover bvs-cover-${style}`;
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
                <span className="bv-tap">[ tap to decrypt ]</span>
            </>
        );
    } else if (style === "storybook") {
        body = (
            <span className="bvs-cover-book">
                <small>A story for</small>
                <b>{name}</b>
                <span aria-hidden="true" style={{ fontSize: 46 }}>{wish.wishType === "anniversary" ? "💍" : "🎂"}</span>
                <span className="bv-tap">{i.tapToOpen}</span>
            </span>
        );
    } else if (style === "messenger") {
        body = (
            <>
                <span className="bvs-lock-time">{clock || "\u00a0"}</span>
                <span className="bvs-notif">
                    <span className="av" aria-hidden="true">🎁</span>
                    <span><b>Secret Chat</b><small>1 new message for {name} 💌</small></span>
                </span>
                <span className="bv-tap">{i.tapToOpen}</span>
            </>
        );
    } else if (style === "galaxy") {
        body = (
            <>
                <span className="bvs-cover-icon bvs-launch" aria-hidden="true">🚀</span>
                <b className="bvs-cover-title">Mission: {name}&apos;s {wish.wishType === "anniversary" ? "anniversary" : "birthday"}</b>
                <span className="bv-tap">tap to launch</span>
            </>
        );
    } else if (style === "gallery") {
        body = (
            <>
                <span className="bvs-cover-icon" aria-hidden="true">🖼️</span>
                <b className="bvs-cover-title">Welcome to the {name} Exhibition</b>
                <small className="bv-muted">A private collection of moments</small>
                <span className="bv-tap">tap to enter</span>
            </>
        );
    } else {
        body = (
            <>
                <span className="bv-muted" style={{ fontWeight: 800 }}>{i.fromLabel}: {wish.recipient.name}</span>
                <span className="bv-env" aria-hidden="true">💌</span>
                <span className="bv-tap">{i.tapToOpen}</span>
            </>
        );
    }
    return (
        <button type="button" className={cls} style={vars} data-style={style} onClick={onOpen} aria-label={i.tapToOpen}>
            <StyleDecor style={style} />
            {body}
        </button>
    );
}
