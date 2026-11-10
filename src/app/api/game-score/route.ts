import { NextResponse } from "next/server";
import { getLeaderboard, saveGameScore } from "@/lib/db";

// Mini-game leaderboard. Rate limiting for /api/* is handled in middleware.
const ID = /^[a-f0-9]{6,10}$/;
const BLOCK = /^[a-z0-9-]{1,40}$/i;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const wishId = searchParams.get("wishId") || "";
    const blockId = searchParams.get("blockId") || "";
    if (!ID.test(wishId) || !BLOCK.test(blockId)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
    try {
        return NextResponse.json({ leaderboard: await getLeaderboard(wishId, blockId) }, { headers: { "Cache-Control": "no-store" } });
    } catch (e) {
        console.error("leaderboard GET failed", e);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const wishId = String(body?.wishId || "");
        const blockId = String(body?.blockId || "");
        if (!ID.test(wishId) || !BLOCK.test(blockId)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
        const res = await saveGameScore({ wishId, blockId, player: String(body?.player || ""), score: Number(body?.score) });
        return NextResponse.json(res, { status: res.ok ? 200 : 400 });
    } catch (e) {
        console.error("leaderboard POST failed", e);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
