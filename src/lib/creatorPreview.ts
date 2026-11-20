import crypto from "crypto";
import { cookies } from "next/headers";

export const CREATOR_COOKIE = "bw_my_wishes";
const MAX_STORED_WISHES = 12;
const COOKIE_MAX_AGE = 30 * 24 * 3600; // 30 days

function getSigningSecret(): string {
    return (
        process.env.ADMIN_SECRET ||
        process.env.ADMIN_PASSWORD ||
        process.env.POSTGRES_PASSWORD ||
        "bw-creator-preview-key"
    );
}

export function signCreatorWishId(wishId: string): string {
    const cleanId = wishId.trim().toLowerCase();
    const sig = crypto
        .createHmac("sha256", getSigningSecret())
        .update(`creator|${cleanId}`)
        .digest("hex")
        .slice(0, 16);
    return `${cleanId}.${sig}`;
}

export function verifyCreatorWishToken(token: string, expectedWishId?: string): string | null {
    const parts = token.trim().split(".");
    if (parts.length !== 2) return null;
    const [id, sig] = parts;
    if (!/^[a-f0-9]{6,10}$/.test(id) || !/^[a-f0-9]{16}$/.test(sig)) return null;
    if (expectedWishId && id !== expectedWishId.toLowerCase()) return null;

    const expectedSig = crypto
        .createHmac("sha256", getSigningSecret())
        .update(`creator|${id}`)
        .digest("hex")
        .slice(0, 16);

    if (sig.length !== expectedSig.length) return null;
    const ok = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
    return ok ? id : null;
}

export function parseCreatorCookieHeader(cookieHeader: string | null): string[] {
    if (!cookieHeader) return [];
    const match = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${CREATOR_COOKIE}=`));
    if (!match) return [];
    const rawVal = decodeURIComponent(match.slice(CREATOR_COOKIE.length + 1));
    return rawVal
        .split(",")
        .map((s) => s.trim())
        .filter((tok) => verifyCreatorWishToken(tok) !== null);
}

export function appendCreatorWishCookieValue(existingCookieHeader: string | null, newWishId: string): string {
    const validExisting = parseCreatorCookieHeader(existingCookieHeader).filter(
        (tok) => !tok.startsWith(`${newWishId.toLowerCase()}.`),
    );
    const next = [...validExisting, signCreatorWishId(newWishId)].slice(-MAX_STORED_WISHES);
    return next.join(",");
}

export function creatorCookieOptions() {
    return {
        name: CREATOR_COOKIE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: COOKIE_MAX_AGE,
    };
}

export async function isCreatorOfWish(wishId: string): Promise<boolean> {
    if (!/^[a-f0-9]{6,10}$/.test(wishId)) return false;
    try {
        const jar = await cookies();
        const raw = jar.get(CREATOR_COOKIE)?.value;
        if (!raw) return false;
        const tokens = raw.split(",");
        for (const tok of tokens) {
            if (verifyCreatorWishToken(tok, wishId) === wishId.toLowerCase()) {
                return true;
            }
        }
    } catch {
        // ignore cookie parse errors
    }
    return false;
}
