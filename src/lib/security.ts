import crypto from "crypto";
import { sql } from "@vercel/postgres";
import { ensureAnalytics } from "@/lib/analytics";

/**
 * Extracts client IP safely, preferring Vercel's trusted `x-real-ip` header
 * over user-spoofable leftmost `x-forwarded-for` hops.
 */
export function getTrustedIp(req: Request): string {
    const realIp = req.headers.get("x-real-ip")?.trim();
    if (realIp) return realIp;
    const xff = req.headers.get("x-forwarded-for");
    if (xff) {
        const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
        // On single-proxy / Vercel edge, use the first valid IP when x-real-ip is absent
        if (parts.length > 0) return parts[parts.length - 1] || parts[0];
    }
    return "local";
}

/**
 * Privacy-preserving one-way hash of an IP address (rotates daily unless fixedSalt is given).
 * Raw visitor IP addresses are NEVER stored in the database.
 */
export function hashIp(ip: string, scope: string, fixedSalt = false): string {
    const day = fixedSalt ? "auth" : new Date().toISOString().slice(0, 10);
    const secret = process.env.ADMIN_SECRET || process.env.POSTGRES_PASSWORD || "bw-sec";
    return crypto.createHash("sha256").update(`${scope}|${day}|${secret}|${ip}`).digest("hex").slice(0, 24);
}

/**
 * Verifies that a browser POST/GET originated from our own host (blocks cross-site script abuse).
 */
export function isSameOriginRequest(req: Request): boolean {
    if (process.env.NODE_ENV === "development") return true;
    const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").toLowerCase().replace(/^www\./, "");
    if (!host) return false;

    const secSite = req.headers.get("sec-fetch-site");
    if (secSite && secSite !== "same-origin" && secSite !== "same-site" && secSite !== "none") {
        return false;
    }

    const origin = req.headers.get("origin");
    if (origin) {
        try {
            const oh = new URL(origin).host.toLowerCase().replace(/^www\./, "");
            return oh === host;
        } catch {
            return false;
        }
    }

    const referer = req.headers.get("referer");
    if (referer) {
        try {
            const rh = new URL(referer).host.toLowerCase().replace(/^www\./, "");
            return rh === host;
        } catch {
            return false;
        }
    }

    // Require at least Origin, Referer, or Sec-Fetch-Site: same-origin in production
    return secSite === "same-origin";
}

// Fast in-memory sliding window bucket (first line of defense)
const memBuckets = new Map<string, { count: number; resetAt: number }>();

export function checkMemoryRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    if (memBuckets.size > 4000) {
        for (const [k, v] of memBuckets) {
            if (now > v.resetAt) memBuckets.delete(k);
        }
        if (memBuckets.size > 4000) memBuckets.clear();
    }
    const cur = memBuckets.get(key);
    if (!cur || now > cur.resetAt) {
        memBuckets.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    cur.count += 1;
    return cur.count <= maxRequests;
}

/**
 * Persistent Postgres-backed rate limit stored in `admin_kv` using privacy-safe hashed keys.
 * Survives serverless cold starts and multi-instance scaling.
 */
export async function checkPersistentRateLimit(
    scope: string,
    ip: string,
    maxRequests: number,
    windowMs: number,
): Promise<{ allowed: boolean; retryAfterSec: number }> {
    const memKey = `${scope}:${ip}`;
    if (!checkMemoryRateLimit(memKey, maxRequests, windowMs)) {
        return { allowed: false, retryAfterSec: Math.ceil(windowMs / 1000) };
    }

    try {
        await ensureAnalytics();
        const k = `rl:${scope}:${hashIp(ip, scope, true)}`;
        const now = Date.now();
        const { rows } = await sql`SELECT v FROM admin_kv WHERE k = ${k}`;
        const prev = (rows[0]?.v || null) as { count?: number; resetAt?: number } | null;

        let count = 1;
        let resetAt = now + windowMs;
        if (prev && typeof prev.resetAt === "number" && prev.resetAt > now) {
            count = (Number(prev.count) || 0) + 1;
            resetAt = prev.resetAt;
        }

        await sql`
            INSERT INTO admin_kv (k, v, updated_at)
            VALUES (${k}, ${JSON.stringify({ count, resetAt })}::jsonb, NOW())
            ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v, updated_at = NOW()
        `;

        // Opportunistically prune old rl:* keys (~2% of calls) so admin_kv stays tiny
        if (Math.random() < 0.02) {
            void sql`DELETE FROM admin_kv WHERE k LIKE 'rl:%' AND updated_at < NOW() - INTERVAL '2 hours'`.catch(() => {});
        }

        if (count > maxRequests) {
            return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((resetAt - now) / 1000)) };
        }
        return { allowed: true, retryAfterSec: 0 };
    } catch {
        // Fall back to the already-checked in-memory limiter if DB has a transient hiccup
        return { allowed: true, retryAfterSec: 0 };
    }
}

/** Constant-time string comparison (safe against length differences). */
export function safeEqualSecret(given: string, expected: string): boolean {
    if (!given || !expected) return false;
    const a = crypto.createHash("sha256").update(given).digest();
    const b = crypto.createHash("sha256").update(expected).digest();
    return crypto.timingSafeEqual(a, b);
}

/** Validates that a media URL is empty or strictly hosted on our HTTPS Cloudinary delivery domain. */
export function isAllowedMediaUrl(url: unknown): boolean {
    if (url === undefined || url === null || url === "") return true;
    if (typeof url !== "string" || url.length > 600) return false;
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:") return false;
        if (parsed.hostname !== "res.cloudinary.com") return false;
        const cloud = (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "").trim();
        if (cloud && !parsed.pathname.startsWith(`/${cloud}/`)) return false;
        return true;
    } catch {
        return false;
    }
}
