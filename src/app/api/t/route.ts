import { NextResponse } from "next/server";
import { browserOf, deviceOf, isBot, recordEvents, sourceOf, type IncomingEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

/**
 * Anonymous event collector (navigator.sendBeacon). Stores no IP and no cookies:
 * only the event name, page path, traffic source, device/browser family and country code.
 * Body: { sid, ref, utm, events: [{ name, path, wishId?, props? }] }
 */
export async function POST(req: Request) {
    try {
        const ua = req.headers.get("user-agent") || "";
        if (isBot(ua)) return new NextResponse(null, { status: 204 });
        const text = await req.text();
        if (text.length > 20000) return new NextResponse(null, { status: 413 });
        const body = JSON.parse(text) as { sid?: string; ref?: string; utm?: string; events?: IncomingEvent[] };
        if (!Array.isArray(body.events) || !body.events.length) return new NextResponse(null, { status: 204 });
        const host = req.headers.get("host") || "";
        const meta = {
            src: sourceOf(typeof body.ref === "string" ? body.ref : "", typeof body.utm === "string" ? body.utm : "", host),
            device: deviceOf(ua),
            browser: browserOf(ua),
            country: (req.headers.get("x-vercel-ip-country") || "").slice(0, 4) || "??",
        };
        const events = body.events.map((e) => ({ ...e, sid: body.sid }));
        await recordEvents(events, meta);
        return new NextResponse(null, { status: 204 });
    } catch (e) {
        console.error("track failed", e);
        return new NextResponse(null, { status: 204 });
    }
}
