import { NextResponse } from "next/server";
import { claimVaultSpot, getVaultStatus } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";
import {
    checkMemoryRateLimit,
    checkPersistentRateLimit,
    getTrustedIp,
    isSameOriginRequest,
} from "@/lib/security";
import {
    getVaultRegionConfig,
    resolveVaultRegion,
    type VaultPlanId,
    type VaultSurface,
} from "@/lib/vaultPricing";

export const dynamic = "force-dynamic";

const VALID_PLANS = new Set<VaultPlanId>(["30d", "1y"]);
const VALID_SURFACES = new Set<VaultSurface>(["finish", "game_finish", "finale", "dashboard"]);

const NO_STORE_HEADERS = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
};

function isLocalHostRequest(req: Request): boolean {
    if (process.env.NODE_ENV !== "production") return true;
    const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "")
        .toLowerCase()
        .split(":")[0];
    return (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "::1" ||
        host.startsWith("192.168.") ||
        host.startsWith("10.")
    );
}

async function detectTestOrAdminMode(req: Request): Promise<boolean> {
    if (isLocalHostRequest(req)) return true;
    if (req.headers.get("x-bw-owner") === "1") return true;
    try {
        if (await isAdmin()) return true;
    } catch {
        // ignore cookie parse errors
    }
    return false;
}

export async function GET(req: Request) {
    const ip = getTrustedIp(req);
    if (!checkMemoryRateLimit(`vault_get:${ip}`, 90, 60 * 1000)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: NO_STORE_HEADERS });
    }

    try {
        const { searchParams } = new URL(req.url);
        const wishId = (searchParams.get("wishId") || "").trim();
        const tz = (searchParams.get("tz") || "").trim();
        const isTestMode = await detectTestOrAdminMode(req);
        const devCountry = isTestMode ? searchParams.get("previewCountry") : null;
        const countryHeader = devCountry || req.headers.get("x-vercel-ip-country");

        const { region, country } = resolveVaultRegion(countryHeader, tz);
        const config = getVaultRegionConfig(region);
        const status = await getVaultStatus(wishId || undefined);

        return NextResponse.json(
            {
                ...status,
                isTestMode,
                region,
                country,
                config,
            },
            { headers: NO_STORE_HEADERS },
        );
    } catch (error) {
        console.error("[vault GET] error:", error);
        return NextResponse.json({ error: "Failed to load vault status" }, { status: 500, headers: NO_STORE_HEADERS });
    }
}

export async function POST(req: Request) {
    if (!isSameOriginRequest(req)) {
        return NextResponse.json({ error: "Forbidden origin" }, { status: 403, headers: NO_STORE_HEADERS });
    }

    const ip = getTrustedIp(req);
    const rl = await checkPersistentRateLimit("vault_claim", ip, 8, 10 * 60 * 1000);
    if (!rl.allowed) {
        return NextResponse.json(
            { error: "Too many attempts. Please wait a few minutes." },
            { status: 429, headers: { ...NO_STORE_HEADERS, "Retry-After": String(rl.retryAfterSec) } },
        );
    }

    try {
        const raw = await req.text();
        if (raw.length > 1024) {
            return NextResponse.json({ error: "Payload too large" }, { status: 413, headers: NO_STORE_HEADERS });
        }

        const body = JSON.parse(raw) as {
            wishId?: unknown;
            plan?: unknown;
            surface?: unknown;
            tz?: unknown;
            previewCountry?: unknown;
        };

        const wishId = typeof body.wishId === "string" ? body.wishId.trim() : "";
        const plan = (typeof body.plan === "string" ? body.plan.trim() : "") as VaultPlanId;
        const surface = (typeof body.surface === "string" ? body.surface.trim() : "") as VaultSurface;
        const tz = typeof body.tz === "string" ? body.tz.trim().slice(0, 64) : "";

        if (!/^[a-f0-9]{6,10}$/.test(wishId) || !VALID_PLANS.has(plan) || !VALID_SURFACES.has(surface)) {
            return NextResponse.json({ error: "Invalid request parameters" }, { status: 400, headers: NO_STORE_HEADERS });
        }

        const isTestMode = await detectTestOrAdminMode(req);
        const devCountry = isTestMode && typeof body.previewCountry === "string" ? body.previewCountry : null;
        const countryHeader = devCountry || req.headers.get("x-vercel-ip-country");
        const { region, country } = resolveVaultRegion(countryHeader, tz);
        const config = getVaultRegionConfig(region);

        // Localhost / Admin safety guard: NEVER consume any of the 200 real user spots during testing!
        if (isTestMode) {
            const cur = await getVaultStatus();
            const planOffer = config.plans.find((p) => p.id === plan) ?? config.plans[1];
            const simKeepUntil = new Date(Date.now() + planOffer.days * 86_400_000).toISOString();
            return NextResponse.json(
                {
                    status: "claimed",
                    isTestMode: true,
                    totalSpots: cur.totalSpots,
                    claimedSpots: cur.claimedSpots,
                    spotsLeft: cur.spotsLeft,
                    wishSaved: true,
                    savedPlan: planOffer.id,
                    keepUntil: simKeepUntil,
                    spotNumber: null,
                    region,
                    country,
                    config,
                },
                { headers: NO_STORE_HEADERS },
            );
        }

        const result = await claimVaultSpot({
            wishId,
            plan,
            region,
            country,
            surface,
        });

        if (result.status === "not_found") {
            return NextResponse.json({ ...result, error: "Wish not found" }, { status: 404, headers: NO_STORE_HEADERS });
        }

        return NextResponse.json(
            {
                ...result,
                isTestMode: false,
                region,
                country,
                config,
            },
            { headers: NO_STORE_HEADERS },
        );
    } catch (error) {
        console.error("[vault POST] error:", error);
        return NextResponse.json({ error: "Could not save wish right now" }, { status: 500, headers: NO_STORE_HEADERS });
    }
}
