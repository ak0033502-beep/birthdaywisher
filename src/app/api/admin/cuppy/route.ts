import "@/lib/netFix";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isSameOriginAdmin } from "@/lib/adminAuth";
import {
    CUPPY_SPICES,
    CUPPY_TASKS,
    CUPPY_TONES,
    generateCuppyIdeas,
    type CuppySpice,
    type CuppyTask,
    type CuppyTone,
    type ForcedEngineId,
} from "@/lib/cuppyAi";
import { saveCuppyConfig, type CuppyAdminConfig } from "@/lib/cuppyConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface EnginePingRow {
    id: string;
    provider: "Google AI Studio" | "Groq Open-Source";
    model: string;
    ok: boolean;
    status: number;
    ms: number;
    sample: string;
    remainingRequests?: string;
    remainingTokens?: string;
}

async function pingGeminiModel(model: string, id: string): Promise<EnginePingRow> {
    const key = (process.env.GEMINI_API_KEY || "").trim();
    if (!key) {
        return { id, provider: "Google AI Studio", model, ok: false, status: 0, ms: 0, sample: "GEMINI_API_KEY missing in env" };
    }
    const t0 = Date.now();
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: "Say ONLY: Cuppy ready 🧁" }] }],
                    generationConfig: { maxOutputTokens: 20, temperature: 0.2 },
                }),
                signal: AbortSignal.timeout(7000),
            },
        );
        const ms = Date.now() - t0;
        const j = (await res.json().catch(() => ({}))) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
            error?: { message?: string };
        };
        const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim() || j.error?.message || "";
        return {
            id,
            provider: "Google AI Studio",
            model,
            ok: res.ok,
            status: res.status,
            ms,
            sample: text.slice(0, 90),
            remainingRequests: "Free tier (~1,000+/day)",
        };
    } catch (e) {
        return {
            id,
            provider: "Google AI Studio",
            model,
            ok: false,
            status: 504,
            ms: Date.now() - t0,
            sample: String((e as Error).message || "Timeout").slice(0, 80),
        };
    }
}

async function pingGroqModel(model: string, id: string, extra?: Record<string, unknown>): Promise<EnginePingRow> {
    const key = (process.env.GROQ_API_KEY || "").trim();
    if (!key) {
        return { id, provider: "Groq Open-Source", model, ok: false, status: 0, ms: 0, sample: "GROQ_API_KEY missing in env" };
    }
    const t0 = Date.now();
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: "Say ONLY: Cuppy ready 🧁" }],
                max_completion_tokens: 120,
                temperature: 0.2,
                ...extra,
            }),
            signal: AbortSignal.timeout(7000),
        });
        const ms = Date.now() - t0;
        const remReq = res.headers.get("x-ratelimit-remaining-requests");
        const limReq = res.headers.get("x-ratelimit-limit-requests");
        const remTok = res.headers.get("x-ratelimit-remaining-tokens");
        const limTok = res.headers.get("x-ratelimit-limit-tokens");
        const j = (await res.json().catch(() => ({}))) as {
            choices?: Array<{ message?: { content?: string } }>;
            error?: { message?: string };
        };
        const text = (j.choices?.[0]?.message?.content || j.error?.message || "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
        return {
            id,
            provider: "Groq Open-Source",
            model,
            ok: res.ok,
            status: res.status,
            ms,
            sample: text.slice(0, 90),
            remainingRequests: remReq && limReq ? `${remReq} / ${limReq} reqs` : remReq || undefined,
            remainingTokens: remTok && limTok ? `${remTok} / ${limTok} TPM` : remTok || undefined,
        };
    } catch (e) {
        return {
            id,
            provider: "Groq Open-Source",
            model,
            ok: false,
            status: 504,
            ms: Date.now() - t0,
            sample: String((e as Error).message || "Timeout").slice(0, 80),
        };
    }
}

export async function POST(req: Request) {
    if (!(await isSameOriginAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
        body = (await req.json()) as Record<string, unknown>;
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const action = String(body.action || "");

    if (action === "save_config") {
        const cfg = await saveCuppyConfig(body.config as Partial<CuppyAdminConfig>);
        try {
            revalidatePath("/admin");
            revalidatePath("/api/cuppy/config");
        } catch {
            // ignore
        }
        return NextResponse.json({ ok: true, config: cfg });
    }

    if (action === "ping_engines") {
        const results = await Promise.all([
            pingGeminiModel("gemini-3.5-flash-lite", "gemini-3.5-flash-lite"),
            pingGroqModel("qwen/qwen3.8-27b", "groq-qwen3.8-27b", { reasoning_effort: "none" }),
            pingGroqModel("openai/gpt-oss-120b", "groq-gpt-oss-120b", { reasoning_effort: "low" }),
            pingGeminiModel("gemini-flash-lite-latest", "gemini-flash-lite-latest"),
            pingGroqModel("openai/gpt-oss-20b", "groq-gpt-oss-20b", { reasoning_effort: "low" }),
        ]);
        return NextResponse.json({ ok: true, results });
    }

    if (action === "playground") {
        const t0 = Date.now();
        const task: CuppyTask = CUPPY_TASKS.includes(body.task as CuppyTask) ? (body.task as CuppyTask) : "message";
        const tone: CuppyTone = CUPPY_TONES.includes(body.tone as CuppyTone) ? (body.tone as CuppyTone) : "unfiltered";
        const spice: CuppySpice = CUPPY_SPICES.includes(body.spice as CuppySpice) ? (body.spice as CuppySpice) : "brutal";
        const forcedEngine = (typeof body.forcedEngine === "string" ? body.forcedEngine : "auto") as ForcedEngineId;

        const res = await generateCuppyIdeas({
            task,
            tone,
            spice,
            wishType: body.wishType === "anniversary" ? "anniversary" : "birthday",
            name: typeof body.name === "string" ? body.name : "Aman",
            relationship: typeof body.relationship === "string" ? body.relationship : "Best Friend",
            hint: typeof body.hint === "string" ? body.hint : "",
            forcedEngine,
            fresh: true,
        });
        return NextResponse.json({
            ok: true,
            items: res.items,
            autoBuild: res.autoBuild,
            engine: res.engine,
            ms: Date.now() - t0,
        });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
