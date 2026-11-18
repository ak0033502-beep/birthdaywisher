"use client";

/**
 * A 2–3 second opening sequence per presentation style, played right after the cover is opened
 * (tap anywhere to skip). Real sounds via uiSound. Reduced motion: skipped.
 *  cinematic  "A film for NAME" with letterbox bars + light sweep
 *  terminal   fast typing, progress bar, ACCESS GRANTED
 *  storybook  leather cover swings open
 *  messenger  notification grows into the chat + typing
 *  galaxy     T-minus 3-2-1 + warp speed
 *  gallery    curtains part + spotlight
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { WishDataV2 } from "@/lib/wish/schema";
import type { StyleId } from "./styles";
import { playUi, prefetchUi, type UiSound } from "@/lib/celebration/uiSound";
import { buzz } from "@/lib/celebration/sfx";

const DURATION: Record<StyleId, number> = { cinematic: 3100, terminal: 2900, storybook: 2500, messenger: 2400, galaxy: 3000, gallery: 2800 };
const SOUNDS: Record<StyleId, Array<[UiSound, number, number]>> = {
    // [sound, delay ms, gain]
    cinematic: [["projector", 0, 0.7], ["whoosh", 1050, 0.8], ["chime", 1250, 1.4]],
    terminal: [["typing", 0, 1], ["ping", 1950, 0.8]],
    storybook: [["page", 380, 1], ["chime", 1300, 1.1]],
    messenger: [["ping", 120, 0.9], ["swoosh", 650, 0.8], ["msg", 1500, 0.8]],
    galaxy: [["ping", 0, 0.5], ["ping", 600, 0.55], ["ping", 1200, 0.6], ["launch", 1650, 0.5], ["whoosh", 1900, 0.9]],
    gallery: [["curtain", 250, 0.9], ["chime", 1350, 1.3]],
};

export const introSounds = (style: StyleId) => SOUNDS[style].map((s) => s[0]);

const recipientName = (wish: WishDataV2) =>
    (wish.wishType === "anniversary" ? wish.recipient.coupleName || wish.recipient.name : wish.recipient.nickname || wish.recipient.name) || "you";

export function StyleIntro({ style, wish, vars, onDone }: { style: StyleId; wish: WishDataV2; vars: CSSProperties; onDone: () => void }) {
    const name = recipientName(wish);
    const [count, setCount] = useState(3);
    const finished = useRef(false);
    const playing = useRef<Array<{ stop: (f?: number) => void }>>([]);

    const finish = () => {
        if (finished.current) return;
        finished.current = true;
        playing.current.forEach((p) => p.stop(250));
        onDone();
    };

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { finish(); return; }
        prefetchUi(introSounds(style));
        playing.current = SOUNDS[style].map(([s, d, g]) => playUi(s, { delay: d, gain: g }));
        const timers: number[] = [];
        if (style === "galaxy") {
            timers.push(window.setTimeout(() => setCount(2), 600), window.setTimeout(() => setCount(1), 1200), window.setTimeout(() => { setCount(0); buzz([40, 30, 80]); }, 1700));
        }
        if (style === "terminal") timers.push(window.setTimeout(() => buzz(40), 1950));
        timers.push(window.setTimeout(finish, DURATION[style]));
        return () => timers.forEach((t) => clearTimeout(t));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [style]);

    let body: React.ReactNode = null;
    if (style === "cinematic") {
        body = (
            <>
                <span className="bvi-bar top" /><span className="bvi-bar bottom" />
                <span className="bvi-grain" />
                <div className="bvi-cine">
                    <small className="l1">BirthdayWisher.fun presents</small>
                    <small className="l2">{wish.wishType === "anniversary" ? "a love story starring" : "a film for"}</small>
                    <b className="l3"><span>{name}</span></b>
                </div>
            </>
        );
    } else if (style === "terminal") {
        body = (
            <div className="bvi-term">
                <span>&gt; establishing secure connection…</span>
                <span>&gt; decrypting surprise <i className="bar"><i /></i></span>
                <span>&gt; recipient verified: {name.toLowerCase()}</span>
                <b className="granted">ACCESS GRANTED</b>
            </div>
        );
    } else if (style === "storybook") {
        body = (
            <div className="bvi-book">
                <div className="page"><em>Once upon a time…</em></div>
                <div className="cover"><small>The Story of</small><b>{name}</b><span aria-hidden="true">{wish.wishType === "anniversary" ? "💍" : "🎂"}</span></div>
            </div>
        );
    } else if (style === "messenger") {
        body = (
            <div className="bvi-chat">
                <div className="notif"><span className="av">🎁</span><span><b>Secret Chat</b><small>1 new message for {name} 💌</small></span></div>
                <div className="typing"><i /><i /><i /></div>
            </div>
        );
    } else if (style === "galaxy") {
        body = (
            <div className="bvi-space">
                <div className="warp">{Array.from({ length: 28 }, (_, k) => <i key={k} style={{ transform: `rotate(${(k * 360) / 28}deg)`, animationDelay: `${1.7 + (k % 7) * 0.04}s` }} />)}</div>
                {count > 0 ? <b key={count} className="t">T-minus {count}</b> : <b className="go">🚀 Launch!</b>}
            </div>
        );
    } else {
        body = (
            <div className="bvi-museum">
                <span className="spot" />
                <div className="welcome"><small>Private viewing</small><b>The {name} Exhibition</b></div>
                <span className="curtain left" /><span className="curtain right" />
            </div>
        );
    }

    return (
        <div className={`bvi bvi-${style}`} style={vars} onClick={finish} role="presentation">
            {body}
            <span className="bvi-skip">tap to skip</span>
        </div>
    );
}
