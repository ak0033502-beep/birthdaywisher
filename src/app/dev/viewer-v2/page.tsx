import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { migrateV1toV2 } from "@/lib/wish/migrate";
import { DEMO_ANNIVERSARY, DEMO_BIRTHDAY } from "@/lib/wish/fixtures";
import { V2WishShell } from "@/components/viewer/V2WishShell";
import type { BlockInstance } from "@/lib/wish/schema";

/**
 * Local design review of the v2 viewer with sample data. Development only:
 * returns 404 in production builds. Use ?demo=anniversary|games, ?theme=pastel|elegant|paper|... and ?style=terminal|storybook|messenger|galaxy|gallery
 */
export const metadata: Metadata = { title: "Viewer v2 demo", robots: { index: false, follow: false } };

const DEMO_GAMES = [
    { id: "prank-1", type: "prank", config: { kind: "error", placement: "opener" } },
    { id: "trivia-1", type: "trivia", config: { title: "How well do you know Aarav?", leaderboard: false, placement: "fun", questions: [
        { q: "Favourite food?", options: ["Pizza", "Biryani", "Momos"], correct: 1 },
        { q: "Dream trip?", options: ["Goa", "Ladakh"], correct: 1 },
    ] } },
    { id: "candles-1", type: "candles", config: { candles: 5, message: "Make a wish!", placement: "finale" } },
] as unknown as BlockInstance[];

export default async function ViewerV2Demo({ searchParams }: { searchParams: Promise<{ demo?: string; theme?: string; style?: string }> }) {
    if (process.env.NODE_ENV === "production") notFound();
    const { demo, theme, style } = await searchParams;
    const base = demo === "anniversary" ? DEMO_ANNIVERSARY : DEMO_BIRTHDAY;
    const wish = migrateV1toV2(theme ? { ...base, theme } : base);
    if (style) wish.look.presentationStyle = style;
    if (demo === "games") {
        const [prank, trivia, candles] = DEMO_GAMES;
        const b = wish.blocks;
        const finaleIdx = b.findIndex((x) => x.type === "finale");
        const body = finaleIdx >= 0 ? b.slice(0, finaleIdx) : b;
        const tail = finaleIdx >= 0 ? b.slice(finaleIdx) : [];
        wish.blocks = [body[0], prank, ...body.slice(1, 3), trivia, ...body.slice(3), candles, ...tail].filter(Boolean);
    }
    return <V2WishShell wish={wish} />;
}
