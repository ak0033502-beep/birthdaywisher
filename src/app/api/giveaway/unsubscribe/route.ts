import { NextResponse } from "next/server";
import { unsubscribeGiveawayEmail } from "@/lib/giveaway";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const token = new URL(req.url).searchParams.get("token") || "";
    const ok = await unsubscribeGiveawayEmail(token).catch(() => false);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Unsubscribed | BirthdayWisher.fun</title>
</head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#FFF8F0;font-family:system-ui,sans-serif;color:#2B2240;padding:20px;">
  <div style="max-width:420px;background:#fff;padding:28px 24px;border-radius:24px;border:1px solid rgba(43,34,64,0.12);text-align:center;box-shadow:0 12px 30px rgba(255,92,138,0.12);">
    <div style="font-size:42px;">${ok ? "✅" : "ℹ️"}</div>
    <h1 style="margin:10px 0 8px;font-size:22px;">${ok ? "You're Unsubscribed" : "Link Already Used"}</h1>
    <p style="margin:0 0 18px;color:#6B6380;font-size:14.5px;line-height:1.5;">
      ${ok ? "You won't receive future giveaway reminder emails, while your submitted Reel entry stays 100% valid!" : "This unsubscribe link was already processed or is invalid."}
    </p>
    <a href="${SITE_URL}/giveaway" style="display:inline-block;padding:11px 22px;border-radius:999px;background:#FF5C8A;color:#fff;text-decoration:none;font-weight:800;font-size:14px;">Back to Giveaway →</a>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
}
