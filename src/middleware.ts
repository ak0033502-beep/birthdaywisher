import { NextRequest, NextResponse } from "next/server";

// In-memory rate limiter (per-process; works well for serverless cold starts)
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute per IP

function getClientIp(req: NextRequest): string {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        req.headers.get("x-real-ip") ||
        "unknown"
    );
}

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.expiresAt) {
        rateLimitMap.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
        return false;
    }

    entry.count++;
    return entry.count > MAX_REQUESTS;
}

// Periodic cleanup of expired entries
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap) {
        if (now > value.expiresAt) rateLimitMap.delete(key);
    }
}, 5 * 60 * 1000); // Cleanup every 5 minutes

export function middleware(req: NextRequest) {
    // Only rate-limit API routes
    if (req.nextUrl.pathname.startsWith("/api")) {
        const ip = getClientIp(req);

        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429, headers: { "Retry-After": "60" } }
            );
        }
    }

    // Add security headers to all responses
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
        // Match all routes except static files and _next
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
