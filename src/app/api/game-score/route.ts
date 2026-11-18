import { NextResponse } from "next/server";

// Public quiz leaderboards have been retired to keep every wish 100% personal and private.
export async function GET() {
    return NextResponse.json({ leaderboard: [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST() {
    return NextResponse.json({ ok: true, leaderboard: [] });
}
