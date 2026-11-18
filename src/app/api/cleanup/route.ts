import { NextResponse } from 'next/server';
import { cleanupExpiredWishes, cleanupOrphanCloudinaryMedia } from '@/lib/db';
import { kvSet, rollupAndPrune } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');

        // Verify Vercel Cron Secret in production
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            if (process.env.NODE_ENV !== 'development') {
                return new NextResponse('Unauthorized', { status: 401 });
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
        await kvSet('last_cleanup', { deleted: deletedCount, orphanMedia, freedMb, prunedEvents, at: new Date().toISOString() }).catch(console.error);

        return NextResponse.json({
            success: true,
            deletedWishes: deletedCount,
            orphanMedia,
            freedMb,
            message: `Cleaned up ${deletedCount} expired wishes and ${orphanMedia} orphan uploads (${freedMb} MB freed).`
        });
    } catch (error) {
        console.error("Cleanup cron failed:", error);
        await kvSet('last_cleanup', { error: String(error), at: new Date().toISOString() }).catch(() => {});
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
