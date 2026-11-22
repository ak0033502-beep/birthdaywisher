import { NextRequest, NextResponse } from "next/server";

// In-memory rate limiter (first line of defense per edge/node instance; bounded map size)
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute per IP
const MAX_TRACKED_IPS = 5000;

function getClientIp(req: NextRequest): string {
    const realIp = req.headers.get("x-real-ip")?.trim();
    if (realIp) return realIp;
    const xff = req.headers.get("x-forwarded-for");
    if (xff) {
        const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
        if (parts.length > 0) return parts[parts.length - 1] || parts[0];
    }
    return "unknown";
}

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    if (rateLimitMap.size > MAX_TRACKED_IPS) {
        for (const [key, value] of rateLimitMap) {
            if (now > value.expiresAt) rateLimitMap.delete(key);
        }
        if (rateLimitMap.size > MAX_TRACKED_IPS) rateLimitMap.clear();
    }

    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.expiresAt) {
        rateLimitMap.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
        return false;
    }

    entry.count++;
    return entry.count > MAX_REQUESTS;
}

export function middleware(req: NextRequest) {
    if (req.nextUrl.pathname.startsWith("/api")) {
        const ip = getClientIp(req);
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429, headers: { "Retry-After": "60" } }
            );
        }
    }

    const response = NextResponse.next();

    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon\\.ico|favicon-.*\\.png|icon-512x512\\.png|apple-touch-icon\\.png|icon\\.svg|logo\\.png|manifest\\.webmanifest|b7d9e41a82c04f6b93e5d10728a4c9f1\\.txt).*)",
    ],
};
