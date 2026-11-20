import { NextResponse } from "next/server";
import { cleanupExpiredWishes, cleanupOrphanCloudinaryMedia } from "@/lib/db";
import { kvGet, kvSet, rollupAndPrune } from "@/lib/analytics";
import { isAdmin } from "@/lib/adminAuth";
import { safeEqualSecret } from "@/lib/security";

export const dynamic = "force-dynamic";

async function isAuthorizedCleanup(req: Request): Promise<boolean> {
    if (await isAdmin()) return true;

    const cronSecret = (process.env.CRON_SECRET || "").trim();
    if (cronSecret.length >= 8) {
        const authHeader = (req.headers.get("authorization") || "").trim();
        if (!authHeader.startsWith("Bearer ")) return false;
        const token = authHeader.slice("Bearer ".length).trim();
        return safeEqualSecret(token, cronSecret);
    }

    // Fallback when CRON_SECRET is not yet configured in Vercel: only allow Vercel's cron UA
    // AND strictly cap automatic runs to at most once every 12 hours so nobody can drain Cloudinary API quota.
    const ua = (req.headers.get("user-agent") || "").trim();
    if (!ua.startsWith("vercel-cron/")) return false;
    const prev = await kvGet<{ at?: string }>("last_cleanup").catch(() => null);
    const lastMs = prev?.v?.at ? Date.parse(prev.v.at) : 0;
    if (Number.isFinite(lastMs) && Date.now() - lastMs < 12 * 3600 * 1000) {
        return false;
    }
    return true;
}

export async function GET(request: Request) {
    try {
        if (process.env.NODE_ENV !== "development") {
            if (!(await isAuthorizedCleanup(request))) {
                return new NextResponse("Unauthorized", { status: 401 });
            }
        }

        const deletedCount = await cleanupExpiredWishes();

        // Clean up orphan Cloudinary uploads (>36h old, not referenced in any active wish)
        let orphanMedia = 0, freedMb = 0;
        try {
            const orph = await cleanupOrphanCloudinaryMedia();
            orphanMedia = orph.deletedOrphans;
            freedMb = orph.freedMb;
        } catch (e) { console.error("Orphan Cloudinary cleanup failed:", e); }

        // Analytics retention: raw events older than 12 months -> daily totals
        let prunedEvents = 0;
        try { prunedEvents = await rollupAndPrune(); } catch (e) { console.error("Analytics rollup failed:", e); }

        // Shown in the admin dashboard ("last cleanup")
        await kvSet("last_cleanup", { deleted: deletedCount, orphanMedia, freedMb, prunedEvents, at: new Date().toISOString() }).catch(console.error);

        return NextResponse.json({
            success: true,
            deletedWishes: deletedCount,
            orphanMedia,
            freedMb,
            message: `Cleaned up ${deletedCount} expired wishes and ${orphanMedia} orphan uploads (${freedMb} MB freed).`,
        });
    } catch (error) {
        console.error("Cleanup cron failed:", error);
        await kvSet("last_cleanup", { error: String(error), at: new Date().toISOString() }).catch(() => {});
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
