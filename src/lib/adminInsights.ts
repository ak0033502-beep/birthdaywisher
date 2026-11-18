/**
 * Auto-suggestions for the admin dashboard: simple, explainable rules over the stats.
 * Each insight says what is happening, why it matters and what to try.
 */
import type { getDevices, getErrors, getFunnel, getOverview, getRecipient, getReviews, getTraffic, getWishOps, getWizard } from "./adminStats";

type A<T extends (...args: never[]) => unknown> = Awaited<ReturnType<T>>;
export interface Insight { level: "high" | "medium" | "good" | "info"; area: string; title: string; detail: string; action: string }

const pct = (x: number) => `${Math.round(x * 100)}%`;
const STEP_NAMES: Record<string, string> = {
    start: "Start (choose mode)", template: "Template", name: "Name", relation: "Relationship", vibe: "Vibe", ingredients: "Ingredients",
    photos: "Photos", memory: "Memory", quiz: "Quiz", message: "Message", voice: "Voice note", games: "Games", look: "Look", order: "Order",
    link: "Custom link", review: "Review", finish: "Finish",
};
export const stepLabel = (s: string) => STEP_NAMES[s] || s;

export function buildInsights(d: {
    overview: A<typeof getOverview>; funnel: A<typeof getFunnel>; wizard: A<typeof getWizard>; recipient: A<typeof getRecipient>;
    traffic: A<typeof getTraffic>; devices: A<typeof getDevices>; errors: A<typeof getErrors>; reviews: A<typeof getReviews>; ops: A<typeof getWishOps>;
}): Insight[] {
    const out: Insight[] = [];
    const { overview: o, funnel: f, wizard: w, recipient: r, traffic: t, devices: dv, errors: e, reviews: rv, ops } = d;

    if (o.visitors < 20 && o.created < 5) {
        out.push({ level: "info", area: "Data", title: "Still collecting data", detail: `Only ${o.visitors} tracked visitors and ${o.created} wishes in this period. Tracking started recently, so numbers get reliable after ~100 visitors.`, action: "Check back in a few days; meanwhile share the site and the game pages." });
    }

    // Wizard drop-off: biggest relative loss between consecutive steps
    const steps = w.steps.filter((s) => s.key !== "finish");
    let worst: { from: string; to: string; loss: number; a: number } | null = null;
    for (let i = 1; i < steps.length; i++) {
        const a = steps[i - 1].n, b = steps[i].n;
        if (a >= 10 && b < a) {
            const loss = 1 - b / a;
            if (!worst || loss > worst.loss) worst = { from: steps[i - 1].key, to: steps[i].key, loss, a };
        }
    }
    if (worst && worst.loss >= 0.2) {
        out.push({ level: worst.loss >= 0.35 ? "high" : "medium", area: "Wizard", title: `${pct(worst.loss)} of people quit after "${stepLabel(worst.from)}"`, detail: `${worst.a} sessions reached "${stepLabel(worst.from)}" but fewer continued to "${stepLabel(worst.to)}".`, action: `Make "${stepLabel(worst.from)}" easier: fewer fields, a clear Skip button, or a ready-made example.` });
    }

    // Wizard completion
    const opened = f.steps[2]?.n || 0, created = f.steps[5]?.n || 0;
    if (opened >= 20) {
        const rate = created / opened;
        if (rate < 0.25) out.push({ level: "high", area: "Funnel", title: `Only ${pct(rate)} of wizard visitors create a wish`, detail: `${opened} opened the wizard, ${created} finished.`, action: "Push Quick mode / templates, and show the live preview earlier so people see the result." });
        else if (rate >= 0.5) out.push({ level: "good", area: "Funnel", title: `${pct(rate)} of wizard visitors create a wish`, detail: "That is a healthy completion rate.", action: "Focus on bringing more visitors to /create." });
    }

    // Share rate
    if (created >= 10) {
        const shareRate = (f.steps[6]?.n || 0) / created;
        if (shareRate < 0.5) out.push({ level: "medium", area: "Funnel", title: `Only ${pct(shareRate)} share right after creating`, detail: "Many creators leave the finish screen without tapping Copy or WhatsApp (they may copy the link from the address bar).", action: "Make the WhatsApp button bigger / first, and auto-copy the link on the finish screen." });
    }

    // Open rate of created wishes
    if (o.created >= 10) {
        if (o.openRate < 0.6) out.push({ level: "high", area: "Recipients", title: `Only ${pct(o.openRate)} of wishes get opened`, detail: "Links are created but not opened (wrong number, not sent, or the preview didn't look inviting).", action: "Improve the WhatsApp message text and preview image; remind creators to send it." });
        else out.push({ level: "good", area: "Recipients", title: `${pct(o.openRate)} of wishes get opened`, detail: `Median time from creating to opening: ${Math.round(o.medianOpenSecs / 3600)} h.`, action: "Keep the WhatsApp preview as it is." });
    }

    // Recipient drop-off
    if (f.recipient.opens >= 10) {
        const fin = f.recipient.finales / f.recipient.opens;
        if (fin < 0.6) {
            const exit = r.exits[0];
            out.push({ level: "medium", area: "Recipients", title: `${pct(1 - fin)} of recipients don't reach the finale`, detail: exit ? `Most often they stop at "${exit.key}" (${exit.n} times).` : "They leave somewhere in the middle.", action: exit ? `Shorten or simplify the "${exit.key}" slide, or make its Next button clearer.` : "Look at the slides with the longest time." });
        }
    }
    // Gates auto-skipped
    for (const g of r.gates) {
        const tot = g.solved + g.auto;
        if (tot >= 8 && g.auto / tot >= 0.5) out.push({ level: "medium", area: "Recipients", title: `"${g.key}" is auto-skipped ${pct(g.auto / tot)} of the time`, detail: "Recipients can't solve it within 60 seconds.", action: "Give an easier hint or show the answer format (e.g. one word)." });
    }

    // Viral loop
    if (f.recipient.opens >= 20) {
        const k = f.viral.created / Math.max(1, f.recipient.opens);
        out.push({ level: k >= 0.05 ? "good" : "info", area: "Growth", title: `Viral loop: ${f.recipient.makeOwn} "make your own" clicks, ${f.viral.created} new wishes from recipients`, detail: `About ${(k * 100).toFixed(1)} new wishes per 100 opened wishes.`, action: k >= 0.05 ? "Great: the finale CTA works." : "Make the finale CTA more visible (button instead of link, show a mini game demo)." });
    }

    // Traffic sources
    const total = t.sources.reduce((s, x) => s + x.n, 0);
    const google = t.sources.find((s) => s.key === "google")?.n || 0;
    if (total >= 50 && google / total < 0.15) out.push({ level: "medium", area: "SEO", title: `Google brings only ${pct(google / total)} of visitors`, detail: "Most visits come from links (WhatsApp / direct).", action: "Publish more pages for searches like 'birthday wishes for sister', Hindi pages, and seasonal pages." });

    // Landing pages that get traffic but no wishes
    for (const l of t.landing.filter((x) => x.n >= 30 && x.conv === 0 && x.key !== "(a wish link)").slice(0, 2)) {
        out.push({ level: "medium", area: "Content", title: `${l.key} gets visitors but 0 wishes`, detail: `${l.n} sessions started on this page in this period and none created a wish.`, action: "Add a clear 'Make this surprise' button near the top and a mini demo." });
    }
    for (const b of t.blog.filter((x) => x.u >= 30 && x.clicks / x.u < 0.02).slice(0, 2)) {
        out.push({ level: "info", area: "Content", title: `Blog post ${b.key} rarely sends readers to Create`, detail: `${b.u} readers, ${b.clicks} create clicks.`, action: "Add a CTA card after the first section and at the end of the post." });
    }

    // Speed
    const lcpMobile = dv.vitals.find((v) => v.metric === "LCP" && v.device === "mobile");
    if (lcpMobile && lcpMobile.n >= 10) {
        if (lcpMobile.p75 > 4000) out.push({ level: "high", area: "Speed", title: `Mobile pages are slow: LCP ${(lcpMobile.p75 / 1000).toFixed(1)} s`, detail: "Google wants under 2.5 s for 75% of visits.", action: `Optimise the slowest page first: ${dv.slowPages[0]?.key || "the homepage"} (smaller images, fewer scripts, lazy-load the 3D hero).` });
        else if (lcpMobile.p75 > 2500) out.push({ level: "medium", area: "Speed", title: `Mobile LCP is ${(lcpMobile.p75 / 1000).toFixed(1)} s (needs improvement)`, detail: "Target: under 2.5 s.", action: `Start with ${dv.slowPages[0]?.key || "the homepage"}.` });
        else out.push({ level: "good", area: "Speed", title: `Mobile LCP ${(lcpMobile.p75 / 1000).toFixed(1)} s`, detail: "Fast enough for Google's 'good' rating.", action: "Keep an eye on it after adding new features." });
    }
    const cls = dv.vitals.filter((v) => v.metric === "CLS" && v.n >= 10).sort((a, b) => b.p75 - a.p75)[0];
    if (cls && cls.p75 > 0.1) out.push({ level: "medium", area: "Speed", title: `Layout shifts on ${cls.device} (CLS ${cls.p75.toFixed(2)})`, detail: "Content jumps while loading (often ads or images without size).", action: "Reserve space for ads/images; load AdSense after the page is interactive." });

    // Errors
    const topErr = e.js[0];
    if (topErr && topErr.users >= 3) out.push({ level: topErr.users >= 10 ? "high" : "medium", area: "Errors", title: `JS error hits ${topErr.users} visitors`, detail: `"${topErr.msg.slice(0, 90)}" on ${topErr.path || "?"} (${topErr.browser}).`, action: "Open the Errors tab and fix the top error first." });
    const uploadFails = w.uploads.reduce((s, x) => s + x.n, 0);
    if (uploadFails >= 5) out.push({ level: "medium", area: "Errors", title: `${uploadFails} photo/voice uploads failed`, detail: `Most common: ${w.uploads[0]?.key}.`, action: "Check Cloudinary limits and show a retry button with a smaller file." });

    // Reviews & ops
    if (rv.total >= 5 && rv.avg < 4) out.push({ level: "medium", area: "Reviews", title: `Average rating ${rv.avg.toFixed(1)} / 5`, detail: "Below 4 out of 5.", action: "Read the low ratings in the Reviews tab for concrete complaints." });
    if (ops.overdue > 0) out.push({ level: "high", area: "Privacy", title: `${ops.overdue} wishes missed their cleanup`, detail: "They are more than a day past the 10-hour self-destruct, so the daily cleanup job probably didn't run.", action: "Check the Vercel cron for /api/cleanup (and CRON_SECRET), or press 'Run cleanup now'." });
    if (ops.usage && ops.usage.creditsUsedPct >= 80) out.push({ level: "high", area: "Storage", title: `Cloudinary credits ${Math.round(ops.usage.creditsUsedPct)}% used`, detail: "Uploads may start failing when the quota is reached.", action: "Lower upload quality/size limits or upgrade the Cloudinary plan." });

    // Feature usage hints
    const gamesShare = w.wishes ? w.games.reduce((s, x) => s + x.n, 0) / w.wishes : 0;
    if (w.wishes >= 20 && gamesShare < 0.1) out.push({ level: "info", area: "Product", title: `Mini-games are used in only ${pct(gamesShare)} of wishes`, detail: "Most creators don't discover the Games step.", action: "Turn the Mini-games tile on by default in Quick mode, or add Blow the Candles to templates." });

    const order = { high: 0, medium: 1, info: 2, good: 3 };
    return out.sort((a, b) => order[a.level] - order[b.level]);
}
