import { NextResponse } from 'next/server';
import { cleanupExpiredWishes } from '@/lib/db';

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

        return NextResponse.json({
            success: true,
            message: `Cleaned up ${deletedCount} expired wishes and their media.`
        });
    } catch (error) {
        console.error("Cleanup cron failed:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
