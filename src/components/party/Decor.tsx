"use client";

import { useEffect, useState } from "react";

const COLORS = ["#FF5C8A", "#FF9F43", "#FFD93D", "#2ED8B6", "#7C5CFF"];

export function BalloonSVG({ color }: { color: string }) {
    return (
        <svg viewBox="0 0 60 100" aria-hidden="true">
            <path d="M30 2 C 12 2, 2 18, 2 34 C 2 54, 20 68, 30 72 C 40 68, 58 54, 58 34 C 58 18, 48 2, 30 2 Z" fill={color} />
            <ellipse cx="20" cy="22" rx="6" ry="10" fill="#fff" opacity=".35" />
            <path d="M26 72 L34 72 L30 78 Z" fill={color} />
            <path d="M30 78 C 26 86, 34 90, 30 100" stroke={color} strokeWidth="1.5" fill="none" opacity=".7" />
        </svg>
    );
}

type B = { left: number; top: number; size: number; z: number; dur: number; delay: number; c: string };

/** Floating CSS balloons with parallax depth. Randomised after mount so SSR/CSR markup match. */
export function Balloons({ count = 6 }: { count?: number }) {
    const [items, setItems] = useState<B[]>([]);
    useEffect(() => {
        setItems(Array.from({ length: count }, (_, i) => ({
            left: (i / count) * 100 + Math.random() * 6,
            top: 10 + Math.random() * 60,
            size: 38 + Math.random() * 30,
            z: 0.3 + Math.random() * 0.9,
            dur: 9 + Math.random() * 7,
            delay: -Math.random() * 8,
            c: COLORS[i % COLORS.length],
        })));
    }, [count]);
    return (
        <div className="bw-balloons" aria-hidden="true">
            {items.map((b, i) => (
                <div
                    key={i}
                    className="bw-balloon"
                    style={{ left: `${b.left}%`, top: `${b.top}%`, width: b.size, ["--c" as string]: b.c, ["--z" as string]: b.z, ["--dur" as string]: `${b.dur}s`, ["--delay" as string]: `${b.delay}s` }}
                >
                    <BalloonSVG color={b.c} />
                </div>
            ))}
        </div>
    );
}

/** Bunting flags by day, glowing bulbs by night (CSS picks which). */
export function Bunting() {
    return (
        <div className="bw-bunting" aria-hidden="true">
            <svg viewBox="0 0 1500 60" preserveAspectRatio="xMidYMin slice">
                <path d="M0 10 Q 750 30 1500 10" stroke="currentColor" opacity=".25" fill="none" />
                {Array.from({ length: 24 }, (_, i) => {
                    const x = i * 62 + 10, y = 10 + Math.round(Math.sin(i / 2) * 4);
                    return <path key={`f${i}`} className="bw-flag" d={`M${x} ${y} L${x + 40} ${y} L${x + 20} ${y + 30} Z`} fill={COLORS[i % 5]} opacity=".85" />;
                })}
                {Array.from({ length: 24 }, (_, i) => {
                    const x = i * 62 + 10, y = 10 + Math.round(Math.sin(i / 2) * 4);
                    return <circle key={`b${i}`} className="bw-bulb" cx={x + 20} cy={y + 10} r={6} fill={COLORS[i % 5]} />;
                })}
            </svg>
        </div>
    );
}

/** Pure CSS 3D gift box (spins; `open` lifts the lid and pops the emoji out). */
export function GiftCube({ big = false, decor = false, pop = "🔗", open = false, onClick, label }: {
    big?: boolean; decor?: boolean; pop?: string; open?: boolean; onClick?: (e: React.MouseEvent) => void; label?: string;
}) {
    const Tag = onClick ? "button" : "div";
    return (
        <Tag className={`bw-gift3d ${big ? "is-big" : ""} ${open ? "is-open" : ""}`} onClick={onClick} aria-label={label} type={onClick ? "button" : undefined}>
            <span className="g3-shadow"></span>
            <span className="g3-box">
                <span className="g3-face g3-front">{decor && <span className="g3-decor">🎂</span>}</span>
                <span className="g3-face g3-back">{decor && <span className="g3-decor">📸</span>}</span>
                <span className="g3-face g3-right">{decor && <span className="g3-decor">🎈</span>}</span>
                <span className="g3-face g3-left">{decor && <span className="g3-decor">💌</span>}</span>
                <span className="g3-face g3-bottom"></span>
                <span className="g3-lid">
                    <span className="lf lf-front"></span><span className="lf lf-back"></span><span className="lf lf-right"></span><span className="lf lf-left"></span><span className="lf lf-top"></span>
                    <span className="g3-bow">🎀</span><span className="g3-bow b2">🎀</span>
                </span>
            </span>
            <span className="g3-pop">{pop}</span>
        </Tag>
    );
}
