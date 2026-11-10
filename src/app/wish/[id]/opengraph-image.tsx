import { ImageResponse } from "next/og";
import { peekWishPreview } from "@/lib/db";

// Per-wish link preview for WhatsApp / Instagram / Telegram.
// Reads the wish without marking it opened (see peekWishPreview).
export const runtime = "nodejs";
export const alt = "You've got a birthday surprise on BirthdayWisher.fun";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The default OG font only covers Latin; other scripts (e.g. Hindi) would render as boxes.
const LATIN = /^[\u0020-\u024F\u1E00-\u1EFF'’.\- ]+$/;

const BALLOONS = [
    { x: 70, y: 70, c: "#FF5C8A" }, { x: 170, y: 150, c: "#FFC93C" }, { x: 60, y: 300, c: "#5CC8FF" },
    { x: 1040, y: 60, c: "#8B5CF6" }, { x: 960, y: 170, c: "#2ED3B7" }, { x: 1060, y: 320, c: "#FF8A3D" },
];
const CONFETTI = Array.from({ length: 26 }, (_, i) => ({
    x: (i * 173) % 1180, y: (i * 97) % 600, c: ["#FF5C8A", "#FFC93C", "#5CC8FF", "#8B5CF6", "#2ED3B7"][i % 5], r: (i * 37) % 90,
}));

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const wish = await peekWishPreview(id).catch(() => null);
    const name = wish?.name && LATIN.test(wish.name) ? wish.name : "";
    const anniversary = wish?.kind === "anniversary";
    const headline = name ? `${name}, you've got a surprise!` : anniversary ? "You've got an anniversary surprise!" : "You've got a birthday surprise!";
    const sub = name ? (anniversary ? "Someone made you an anniversary surprise." : "Someone made you a birthday surprise.") : "Someone made this just for you.";

    return new ImageResponse(
        (
            <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "linear-gradient(135deg, #FFF4E8 0%, #FFE3EC 55%, #E5DEFF 100%)", fontFamily: "sans-serif" }}>
                {CONFETTI.map((c, i) => (
                    <div key={`c${i}`} style={{ position: "absolute", left: c.x, top: c.y, width: 14, height: 26, borderRadius: 4, background: c.c, opacity: 0.55, transform: `rotate(${c.r}deg)` }} />
                ))}
                {BALLOONS.map((b, i) => (
                    <div key={`b${i}`} style={{ position: "absolute", left: b.x, top: b.y, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 92, height: 112, borderRadius: "50%", background: b.c, boxShadow: "inset -14px -18px 0 rgba(0,0,0,0.12)" }} />
                        <div style={{ width: 2, height: 90, background: "rgba(43,34,64,0.35)" }} />
                    </div>
                ))}
                <div style={{ position: "absolute", left: 200, right: 200, top: 46, bottom: 74, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FFFFFF", borderRadius: 44, border: "6px solid #FFFFFF", boxShadow: "0 30px 60px rgba(43,34,64,0.18)", padding: "24px 44px" }}>
                    {/* gift box */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 22, flexShrink: 0 }}>
                        <div style={{ display: "flex", width: 120, height: 30, background: "#FF5C8A", borderRadius: 8, justifyContent: "center" }}>
                            <div style={{ width: 20, height: 30, background: "#FFC93C" }} />
                        </div>
                        <div style={{ display: "flex", width: 106, height: 66, background: "#FF7EA3", borderRadius: "0 0 12px 12px", justifyContent: "center" }}>
                            <div style={{ width: 20, height: 66, background: "#FFC93C" }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", flexShrink: 0, justifyContent: "center", textAlign: "center", fontSize: name.length > 16 ? 46 : 56, color: "#2B2240", lineHeight: 1.15 }}>{headline}</div>
                    <div style={{ display: "flex", flexShrink: 0, marginTop: 16, fontSize: 25, color: "#6B5F80", textAlign: "center" }}>{sub}</div>
                    <div style={{ display: "flex", flexShrink: 0, marginTop: 24, padding: "12px 36px", borderRadius: 999, background: "#FF5C8A", color: "#FFFFFF", fontSize: 28, lineHeight: 1.2 }}>Open your gift</div>
                </div>
                <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, display: "flex", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#2B2240" }}>BirthdayWisher.fun</div>
            </div>
        ),
        size,
    );
}
