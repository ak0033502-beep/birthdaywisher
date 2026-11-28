import "@/lib/netFix";
import { NextResponse } from "next/server";
import { checkMemoryRateLimit, getTrustedIp, isSameOriginRequest } from "@/lib/security";
import {
    CUPPY_SPICES,
    CUPPY_TASKS,
    CUPPY_TONES,
    buildCuratedFallback,
    generateCuppyIdeas,
    normalizeAutoBuild,
    type CuppyRequest,
    type CuppySpice,
    type CuppyTask,
    type CuppyTone,
} from "@/lib/cuppyAi";
import { getCuppyConfig, resolvePauseMessage } from "@/lib/cuppyConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stateless AI endpoint for Cuppy 🧁 inside Wizard 2.0.
 * Strictly text-only (zero user photos/media ever accepted) & ~0 Neon DB queries (5-min RAM config cache).
 */
export async function POST(req: Request) {
    if (!isSameOriginRequest(req)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const t0 = Date.now();
    const cfg = await getCuppyConfig();
    const ip = getTrustedIp(req);

    if (
        !checkMemoryRateLimit(`cuppy-burst:${ip}`, 8, 15_000) ||
        !checkMemoryRateLimit(`cuppy-win:${ip}:${cfg.rateLimit10m}`, cfg.rateLimit10m, 10 * 60_000)
    ) {
        return NextResponse.json(
            { error: "Cuppy is catching a quick breath 🧁 Try again in a few seconds!" },
            { status: 429 },
        );
    }

    let body: Record<string, unknown>;
    try {
        body = (await req.json()) as Record<string, unknown>;
    } catch {
        return NextResponse.json({ error: "Invalid request JSON" }, { status: 400 });
    }

    const task = body.task as CuppyTask;
    if (!CUPPY_TASKS.includes(task)) {
        return NextResponse.json({ error: "Unsupported Cuppy task" }, { status: 400 });
    }

    const tone: CuppyTone = CUPPY_TONES.includes(body.tone as CuppyTone)
        ? (body.tone as CuppyTone)
        : "auto";
    const spice: CuppySpice = CUPPY_SPICES.includes(body.spice as CuppySpice)
        ? (body.spice as CuppySpice)
        : "medium";

    const payload: CuppyRequest = {
        task,
        tone,
        spice,
        wishType: body.wishType === "anniversary" ? "anniversary" : "birthday",
        name: typeof body.name === "string" ? body.name : "",
        nickname: typeof body.nickname === "string" ? body.nickname : "",
        age: typeof body.age === "string" ? body.age : "",
        relationship: typeof body.relationship === "string" ? body.relationship : "",
        vibe: typeof body.vibe === "string" ? body.vibe : "",
        hint: typeof body.hint === "string" ? body.hint : "",
        draft: typeof body.draft === "string" ? body.draft : "",
        storyContext: typeof body.storyContext === "string" ? body.storyContext : "",
        stepContext: typeof body.stepContext === "string" ? body.stepContext : "",
        fresh: Boolean(body.fresh),
        primaryEngine: cfg.primaryEngine,
        allowNoFilter: cfg.allowNoFilter,
        directorNote: cfg.directorNote,
    };

    // Cozy Pause Mode: if a user already had the page open when Admin paused AI, never show an error—return warm message + curated lines!
    if (!cfg.enabled) {
        const pauseMessage = resolvePauseMessage(cfg);
        if (task === "autobuild") {
            const autoBuild = normalizeAutoBuild({}, payload);
            return NextResponse.json(
                { items: [{ text: pauseMessage }], autoBuild, engine: "cuppy-cozy-pause", paused: true, pauseMessage, ms: Date.now() - t0 },
                { headers: { "Cache-Control": "no-store" } },
            );
        }
        return NextResponse.json(
            {
                items: buildCuratedFallback(payload),
                engine: "cuppy-cozy-pause",
                paused: true,
                pauseMessage,
                ms: Date.now() - t0,
            },
            { headers: { "Cache-Control": "no-store" } },
        );
    }

    const result = await generateCuppyIdeas(payload);
    return NextResponse.json(
        {
            items: result.items,
            autoBuild: result.autoBuild,
            engine: result.engine,
            cached: Boolean(result.cached),
            failover: Boolean(result.failover),
            ms: Date.now() - t0,
        },
        { headers: { "Cache-Control": "no-store" } },
    );
}
