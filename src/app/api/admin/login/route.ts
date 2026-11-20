import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ensureAnalytics } from "@/lib/analytics";
import { adminConfigured, checkPassword, makeSessionToken, sessionCookie } from "@/lib/adminAuth";
import { getTrustedIp, hashIp, isSameOriginRequest } from "@/lib/security";

export const dynamic = "force-dynamic";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;

async function getLockState(ipHash: string): Promise<{ n: number; until: number }> {
    try {
        await ensureAnalytics();
        const { rows } = await sql`SELECT v FROM admin_kv WHERE k = ${`login_fail:${ipHash}`}`;
        const v = (rows[0]?.v || {}) as { n?: number; until?: number };
        if (typeof v.until === "number" && v.until > Date.now()) {
            return { n: Number(v.n) || 0, until: v.until };
        }
    } catch { /* fallback */ }
    return { n: 0, until: Date.now() + WINDOW_MS };
}

async function recordFailure(ipHash: string, n: number, until: number): Promise<void> {
    try {
        await ensureAnalytics();
        await sql`
            INSERT INTO admin_kv (k, v, updated_at)
            VALUES (${`login_fail:${ipHash}`}, ${JSON.stringify({ n, until })}::jsonb, NOW())
            ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v, updated_at = NOW()
        `;
    } catch { /* ignore */ }
}

async function clearFailures(ipHash: string): Promise<void> {
    try {
        await ensureAnalytics();
        await sql`DELETE FROM admin_kv WHERE k = ${`login_fail:${ipHash}`}`;
    } catch { /* ignore */ }
}

export async function POST(req: Request) {
    if (!isSameOriginRequest(req)) {
        return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }
    const ip = getTrustedIp(req);
    const ipHash = hashIp(ip, "admin_login", true);
    const state = await getLockState(ipHash);

    if (state.n >= MAX_FAILS && state.until > Date.now()) {
        return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
    }
    if (!adminConfigured()) {
        return NextResponse.json({ error: "Admin is not set up. Add ADMIN_PASSWORD (8+ characters) to the environment variables." }, { status: 503 });
    }

    let password = "";
    try {
        const raw = await req.text();
        if (raw.length <= 1024) password = String((JSON.parse(raw) as { password?: unknown }).password || "").trim();
    } catch { /* empty */ }

    if (!checkPassword(password)) {
        await recordFailure(ipHash, state.n + 1, state.until);
        await new Promise((r) => setTimeout(r, 750));
        return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    await clearFailures(ipHash);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookie(makeSessionToken()));
    return res;
}

export async function DELETE(req: Request) {
    if (!isSameOriginRequest(req)) {
        return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookie("", 0));
    return res;
}
