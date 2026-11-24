"use client";

import Link from "next/link";
import { PartyPage } from "@/components/party/PartyPage";
import { Balloons, Bunting } from "@/components/party/Decor";
import { track } from "@/lib/track";

export interface ExpiredWishProps {
    wishId?: string;
    wishType?: "birthday" | "anniversary";
    style?: string;
    gamesCount?: number;
    views?: number;
}

const STYLE_LABELS: Record<string, string> = {
    cinematic: "Cinematic Story",
    storybook: "Storybook",
    messenger: "Secret Chat",
    galaxy: "Space Odyssey",
    terminal: "Hacker Terminal",
    gallery: "Museum Exhibition",
};

export function ExpiredWishScreen({
    wishId,
    wishType = "birthday",
    style,
    gamesCount = 0,
    views = 0,
}: ExpiredWishProps) {
    const isAnniv = wishType === "anniversary";
    const createHref = `/create?${isAnniv ? "type=anniversary&" : ""}ref=wish&via=expired`;
    const styleLabel = style ? STYLE_LABELS[style] || "Interactive Story" : "Interactive Story";

    return (
        <PartyPage>
            <section className="bw-hero bw-page-hero is-center" style={{ minHeight: "calc(100svh - 76px)", padding: "32px 0 40px", display: "flex", alignItems: "center" }}>
                <Bunting />
                <Balloons count={6} />
                <div className="bw-container bw-page-hero-in" style={{ maxWidth: 680 }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 14px",
                            borderRadius: 999,
                            background: "color-mix(in srgb, var(--p-pink) 14%, var(--p-card))",
                            border: "1px solid color-mix(in srgb, var(--p-pink) 36%, transparent)",
                            color: "var(--p-pink)",
                            fontWeight: 900,
                            fontSize: 12,
                            letterSpacing: 0.4,
                            marginBottom: 10,
                        }}
                    >
                        <span aria-hidden="true">⏳</span>
                        <span>00:00:00 · 10-Hour Timer Ended · Self-Destructed</span>
                    </div>

                    <div style={{ fontSize: 54, lineHeight: 1, marginBottom: 8 }} aria-hidden="true">
                        {isAnniv ? "💍" : "🎂"}
                    </div>

                    <h1 style={{ fontSize: "clamp(28px, 5.4vw, 44px)", lineHeight: 1.08 }}>
                        {isAnniv
                            ? "You just missed this 10-hour anniversary surprise!"
                            : "You just missed this 10-hour birthday surprise!"}
                    </h1>

                    <p className="bw-sub" style={{ maxWidth: 560, margin: "10px auto 0", fontSize: 16 }}>
                        Every surprise on <b>BirthdayWisher.fun</b> is a private {styleLabel.toLowerCase()} with music, mini-games, and a live fireworks finale that{" "}
                        <b>permanently vanishes 10 hours after opening</b> for privacy.
                        {views > 0 ? ` This link was opened and celebrated (${views} ${views === 1 ? "view" : "views"}) before self-destructing.` : ""}
                    </p>

                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            gap: 8,
                            margin: "16px auto 20px",
                            maxWidth: 580,
                        }}
                    >
                        <span className="bw-pill">🎆 Live Name-in-Sky Fireworks</span>
                        <span className="bw-pill">
                            {gamesCount > 0 ? `🎮 Included ${gamesCount} Interactive Mini-${gamesCount === 1 ? "Game" : "Games"}` : "🕯️ Blow-the-Candles Mic Game"}
                        </span>
                        <span className="bw-pill">🔒 10-Hour Auto-Delete</span>
                        <span className="bw-pill">🎉 100% Free · No Signup</span>
                    </div>

                    <div className="bw-hero-ctas" style={{ justifyContent: "center", gap: 12 }}>
                        <Link
                            href={createHref}
                            className="bw-btn bw-btn-primary"
                            onClick={() => track("wish_make_own", { from: "expired" }, wishId)}
                        >
                            🎁 {isAnniv ? "Make a Free Anniversary Surprise in 60s →" : "Make a Free Birthday Surprise in 60s →"}
                        </Link>
                        <Link
                            href="/birthday-wishes-game?ref=wish&via=expired"
                            className="bw-btn bw-btn-ghost"
                        >
                            🎮 Try Live Mini-Games
                        </Link>
                    </div>
                </div>
            </section>
        </PartyPage>
    );
}
