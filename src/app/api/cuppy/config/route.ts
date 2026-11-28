import { NextResponse } from "next/server";
import { getCuppyConfig, resolvePauseMessage } from "@/lib/cuppyConfig";

export const runtime = "nodejs";

/** Public read-only status for Wizard 2.0 (CDN-cached 60s so it adds zero DB load). */
export async function GET() {
    const cfg = await getCuppyConfig();
    return NextResponse.json(
        {
            enabled: cfg.enabled,
            allowNoFilter: cfg.allowNoFilter,
            pauseMessage: resolvePauseMessage(cfg),
        },
        {
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
            },
        },
    );
}
