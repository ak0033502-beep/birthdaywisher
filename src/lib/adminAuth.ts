import crypto from "crypto";
import { cookies, headers } from "next/headers";

/**
 * Admin auth: one password from the ADMIN_PASSWORD env variable.
 * Session = signed, httpOnly, SameSite=Strict cookie "bw_admin" (expiry + HMAC), valid 7 days.
 * If ADMIN_PASSWORD is not set, the admin area stays locked.
 */
export const ADMIN_COOKIE = "bw_admin";
const MAX_AGE = 7 * 24 * 3600;

const adminPw = () => (process.env.ADMIN_PASSWORD || "").trim();

const secret = () =>
    crypto.createHash("sha256").update(`${adminPw()}|${process.env.ADMIN_SECRET || process.env.POSTGRES_PASSWORD || "bw"}`).digest();

export const adminConfigured = () => adminPw().length >= 8;

export function checkPassword(input: string): boolean {
    if (!adminConfigured() || typeof input !== "string") return false;
    const a = crypto.createHash("sha256").update(input.trim()).digest();
    const b = crypto.createHash("sha256").update(adminPw()).digest();
    return crypto.timingSafeEqual(a, b);
}

export function makeSessionToken(): string {
    const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
    const sig = crypto.createHmac("sha256", secret()).update(String(exp)).digest("hex");
    return `${exp}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
    if (!adminConfigured() || !token) return false;
    const [exp, sig] = token.split(".");
    if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
    const want = crypto.createHmac("sha256", secret()).update(exp).digest("hex");
    if (want.length !== sig.length) return false;
    return crypto.timingSafeEqual(Buffer.from(want), Buffer.from(sig));
}

export const sessionCookie = (value: string, maxAge = MAX_AGE) => ({
    name: ADMIN_COOKIE,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
});

/** For server components / route handlers. */
export async function isAdmin(): Promise<boolean> {
    const jar = await cookies();
    return verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
}

/** For mutating Server Actions: verifies both Admin session AND same-origin Origin/Host header. */
export async function isSameOriginAdmin(): Promise<boolean> {
    if (!(await isAdmin())) return false;
    if (process.env.NODE_ENV === "development") return true;
    const h = await headers();
    const host = (h.get("x-forwarded-host") || h.get("host") || "").toLowerCase().replace(/^www\./, "");
    const origin = h.get("origin");
    if (!host || !origin) return false;
    try {
        const oh = new URL(origin).host.toLowerCase().replace(/^www\./, "");
        return oh === host;
    } catch {
        return false;
    }
}
