import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import sitemap from "@/app/sitemap";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const grab = (html: string, re: RegExp) => (re.exec(html)?.[1] ?? "").trim();
const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/** SEO health check of every sitemap URL (fetched from this same deployment). */
export async function GET(req: Request) {
    if (!(await isAdmin())) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    const origin = new URL(req.url).origin;
    const urls = sitemap().map((e) => e.url.replace(SITE_URL, origin)).slice(0, 80);
    const results: unknown[] = [];
    let i = 0;
    const worker = async () => {
        while (i < urls.length) {
            const url = urls[i++];
            const t0 = Date.now();
            let status = 0, html = "";
            try {
                const res = await fetch(url, { redirect: "manual", headers: { "user-agent": "BirthdayWisher-HealthCheck" }, cache: "no-store" });
                status = res.status;
                html = status === 200 ? await res.text() : "";
            } catch { status = 0; }
            const ms = Date.now() - t0;
            const head = html.split("</head>")[0] || "";
            const title = decode(grab(head, /<title[^>]*>([^<]*)<\/title>/i));
            const desc = decode(grab(head, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i));
            const canonical = grab(head, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i);
            const path = new URL(url).pathname;
            const canonicalOk = !!canonical && new URL(canonical, origin).pathname.replace(/\/$/, "") === path.replace(/\/$/, "");
            const h1 = (html.match(/<h1[\s>]/gi) || []).length;
            const ogImage = /property="og:image"/i.test(head);
            const noindex = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(head);
            const issues: string[] = [];
            if (status !== 200) issues.push(`HTTP ${status || "error"}`);
            else {
                if (!title) issues.push("no title"); else if (title.length > 65) issues.push("title too long"); else if (title.length < 25) issues.push("title too short");
                if (!desc) issues.push("no description"); else if (desc.length > 165) issues.push("description too long"); else if (desc.length < 70) issues.push("description short");
                if (!canonical) issues.push("no canonical"); else if (!canonicalOk) issues.push("canonical points elsewhere");
                if (h1 !== 1) issues.push(`${h1} h1 tags`);
                if (!ogImage) issues.push("no og:image");
                if (noindex) issues.push("noindex!");
                if (ms > 2500) issues.push("slow");
            }
            results.push({ url, status, ms, title, titleLen: title.length, descLen: desc.length, canonical, canonicalOk, h1, ogImage, noindex, issues });
        }
    };
    await Promise.all(Array.from({ length: 6 }, worker));
    return NextResponse.json({ results });
}
