import { NextResponse } from "next/server";
import { adminConfigured, checkPassword, makeSessionToken, sessionCookie } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Brute-force protection: max 5 wrong passwords per IP per 15 minutes (per server instance)
const fails = new Map<string, { n: number; until: number }>();

export async function POST(req: Request) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    const now = Date.now();
    const f = fails.get(ip);
    if (f && f.n >= 5 && f.until > now) {
        return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
    }
    if (!adminConfigured()) {
        return NextResponse.json({ error: "Admin is not set up. Add ADMIN_PASSWORD (8+ characters) to the environment variables." }, { status: 503 });
    }
    let password = "";
    try { password = String((await req.json()).password || "").trim(); } catch { /* empty */ }
    if (!checkPassword(password)) {
        const cur = f && f.until > now ? f : { n: 0, until: now + 15 * 60 * 1000 };
        fails.set(ip, { n: cur.n + 1, until: cur.until });
        await new Promise((r) => setTimeout(r, 700));
        return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }
    fails.delete(ip);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookie(makeSessionToken()));
    return res;
}

export async function DELETE() {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookie("", 0));
    return res;
}
