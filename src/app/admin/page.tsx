import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/adminAuth";
import { backfillLedger, getDevices, getErrors, getFunnel, getOverview, getRecipient, getReviews, getTraffic, getVaultAdminStats, getWishOps, getWizard } from "@/lib/adminStats";
import { buildInsights, stepLabel } from "@/lib/adminInsights";
import { Bars, Card, Funnel, Kpi, LineChart, Table, fmt, pct } from "@/components/admin/charts";
import { CleanupButton, DeleteWishForm, HealthCheck, LogoutButton } from "@/components/admin/AdminClient";
import { toggleReviewAction } from "./actions";
import { BLOCKS } from "@/blocks/registry";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TABS = [
    { id: "overview", t: "📊 Overview" },
    { id: "funnel", t: "🔁 Funnel" },
    { id: "wizard", t: "🧙 Wizard" },
    { id: "recipients", t: "💌 Recipients" },
    { id: "traffic", t: "🔎 Traffic & SEO" },
    { id: "devices", t: "📱 Devices & speed" },
    { id: "errors", t: "🐞 Errors" },
    { id: "reviews", t: "💬 Reviews" },
    { id: "wishes", t: "🗂️ Wishes" },
] as const;
type TabId = (typeof TABS)[number]["id"];
const RANGES = [7, 30, 90];

const blockName = (k: string) => (BLOCKS as Record<string, { label: string; icon: string }>)[k] ? `${(BLOCKS as Record<string, { label: string; icon: string }>)[k].icon} ${(BLOCKS as Record<string, { label: string }>)[k].label}` : k;
const secs = (s: number) => (s >= 3600 ? `${(s / 3600).toFixed(1)} h` : s >= 60 ? `${Math.round(s / 60)} min` : `${Math.round(s)} s`);
const ms = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`);
const when = (iso: string) =>
    iso
        ? `${new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })} IST`
        : "—";
const VITAL: Record<string, { good: number; poor: number; unit: "ms" | "" }> = { LCP: { good: 2500, poor: 4000, unit: "ms" }, INP: { good: 200, poor: 500, unit: "ms" }, CLS: { good: 0.1, poor: 0.25, unit: "" }, FCP: { good: 1800, poor: 3000, unit: "ms" }, TTFB: { good: 800, poor: 1800, unit: "ms" } };

function AdminSkeleton() {
    return (
        <div className="adm-loading" role="status" aria-live="polite">
            <div className="adm-kpis">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="adm-card adm-skel" style={{ height: 92 }} />)}
            </div>
            <div className="adm-card adm-skel" style={{ height: 180 }} />
            <div className="adm-grid">
                <div className="adm-card adm-skel" style={{ height: 190 }} />
                <div className="adm-card adm-skel" style={{ height: 190 }} />
            </div>
        </div>
    );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string; days?: string }> }) {
    if (!(await isAdmin())) redirect("/admin/login");
    const sp = await searchParams;
    const tab: TabId = (TABS.find((t) => t.id === sp.tab)?.id ?? "overview") as TabId;
    const days = RANGES.includes(Number(sp.days)) ? Number(sp.days) : 30;
    const href = (t: string, d = days) => `/admin?tab=${t}&days=${d}`;

    return (
        <main className="adm-wrap">
            <header className="adm-top">
                <Link href="/" className="adm-logo">🎂 BirthdayWisher<b>.fun</b> <span>Admin</span></Link>
                <div className="adm-range" role="group" aria-label="Date range">
                    {RANGES.map((d) => <Link key={d} href={href(tab, d)} className={d === days ? "on" : ""}>{d} days</Link>)}
                </div>
                <LogoutButton />
            </header>
            <nav className="adm-tabs" aria-label="Sections">
                {TABS.map((t) => <Link key={t.id} href={href(t.id)} className={t.id === tab ? "on" : ""}>{t.t}</Link>)}
            </nav>
            <div className="adm-body">
                <Suspense key={`${tab}-${days}`} fallback={<AdminSkeleton />}>
                    {tab === "overview" && <OverviewTab days={days} />}
                    {tab === "funnel" && <FunnelTab days={days} />}
                    {tab === "wizard" && <WizardTab days={days} />}
                    {tab === "recipients" && <RecipientsTab days={days} />}
                    {tab === "traffic" && <TrafficTab days={days} />}
                    {tab === "devices" && <DevicesTab days={days} />}
                    {tab === "errors" && <ErrorsTab days={days} />}
                    {tab === "reviews" && <ReviewsTab />}
                    {tab === "wishes" && <WishesTab />}
                </Suspense>
            </div>
            <footer className="adm-foot">Privacy: no cookies for visitors, no IP addresses, no names or wish content are stored for analytics. Your own visits are excluded after you log in on this browser.</footer>
        </main>
    );
}

/* ---------------- 1. Overview + 10. Suggestions ---------------- */
async function OverviewTab({ days }: { days: number }) {
    await backfillLedger().catch((e) => console.error("[admin] backfill", e));
    const [overview, reviews, ops, vault] = await Promise.all([
        getOverview(days), getReviews(), getWishOps(false), getVaultAdminStats(days),
    ]);
    const o = overview;
    return (
        <>
            <div className="adm-kpis">
                <Kpi label="Wishes created" value={o.created} prev={o.createdPrev} hint={`vs previous ${days} days`} />
                <Kpi label="Opened by recipient" value={pct(o.openRate)} hint={`${o.opened} of ${o.created}`} />
                <Kpi label="Visitors" value={o.visitors} prev={o.visitorsPrev} hint={`${fmt(o.pageviews)} page views`} />
                <Kpi label="Visitor → wish" value={o.visitors ? pct(o.created / o.visitors) : "—"} hint="conversion" />
                <Kpi label="Avg views per wish" value={o.avgViews ? o.avgViews.toFixed(1) : "—"} />
                <Kpi label="Time until opened" value={o.medianOpenSecs ? secs(o.medianOpenSecs) : "—"} hint="median" />
            </div>
            <Card
                title={`💰 Memory Vault Willingness-to-Pay Test — ${vault.claimed} / ${vault.totalSpots} Paid-Intent Clicks (${vault.spotsLeft} Free Gifts Left)`}
                sub="Users see ONLY real prices (₹9 / ₹19 in India · $1.99 / $3.99 Global · £1.49 / £2.99 UK) — FREE surprise appears only AFTER they click to buy!"
                wide
            >
                <div style={{ marginBottom: 14 }}>
                    <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                        <div
                            style={{
                                width: `${Math.min(100, Math.round((vault.claimed / vault.totalSpots) * 100))}%`,
                                height: "100%",
                                borderRadius: 999,
                                background: "linear-gradient(90deg, #2ED8B6, #FF5C8A)",
                            }}
                        />
                    </div>
                </div>
                <div className="adm-grid">
                    <ul className="adm-facts">
                        <li><span>Free launch spots left</span><b>{vault.spotsLeft} / {vault.totalSpots}</b></li>
                        <li><span>Card views ({days}d) → Claims</span><b>{vault.cardViews} views → {vault.claimed} ({vault.cardViews ? pct(vault.claimed / vault.cardViews) : "—"})</b></li>
                        <li><span>Listed value unlocked</span><b>₹{vault.inrValue.toFixed(0)} · ${vault.usdValue.toFixed(2)} · £{vault.gbpValue.toFixed(2)}</b></li>
                        <li><span>Post-200 paid clicks</span><b>{fmt(vault.post200Clicks)}</b></li>
                    </ul>
                    <div>
                        {vault.plans.length > 0 ? (
                            <>
                                <p style={{ margin: "0 0 6px", fontSize: 12, opacity: 0.7 }}>Chosen Plan &amp; Region Breakdown</p>
                                <Bars items={[...vault.plans, ...vault.regions, ...vault.who]} />
                            </>
                        ) : (
                            <p className="adm-empty">Waiting for the first user to claim 1 of the 200 free spots.</p>
                        )}
                    </div>
                </div>
            </Card>
            <Suspense fallback={<Card title="💡 Suggestions" sub="Analysing funnel, wizard, speed & SEO…" wide><p className="adm-empty">Loading recommendations…</p></Card>}>
                <InsightsCard days={days} overview={overview} reviews={reviews} />
            </Suspense>
            <Card title="Daily trend" wide>
                <LineChart labels={o.series.map((s) => s.day)} series={[
                    { name: "Visitors", color: "#7C5CFF", values: o.series.map((s) => s.visitors) },
                    { name: "Wishes created", color: "#FF5C8A", values: o.series.map((s) => s.created) },
                    { name: "Wishes opened", color: "#2ED8B6", values: o.series.map((s) => s.opened) },
                ]} />
            </Card>
            <div className="adm-grid">
                <Card title="Birthday vs anniversary"><Bars items={o.types} /></Card>
                <Card title="All time" sub={o.trackingSince ? `Wish stats since ${when(o.trackingSince)}` : undefined}>
                    <ul className="adm-facts">
                        <li><span>Wishes created</span><b>{fmt(o.allTimeCreated)}</b></li>
                        <li><span>Wishes opened</span><b>{fmt(o.allTimeOpened)}</b></li>
                        <li><span>Active right now</span><b>{fmt(ops.active)}</b></li>
                        <li><span>Average rating</span><b>{reviews.total ? `${reviews.avg.toFixed(1)} / 5 (${reviews.total})` : "—"}</b></li>
                    </ul>
                </Card>
            </div>
        </>
    );
}

async function InsightsCard({ days, overview, reviews }: {
    days: number;
    overview: Awaited<ReturnType<typeof getOverview>>;
    reviews: Awaited<ReturnType<typeof getReviews>>;
}) {
    const [funnel, wizard, recipient, traffic, devices, errors, ops] = await Promise.all([
        getFunnel(days), getWizard(days), getRecipient(days), getTraffic(days), getDevices(days), getErrors(days), getWishOps(true),
    ]);
    const insights = buildInsights({ overview, funnel, wizard, recipient, traffic, devices, errors, reviews, ops });
    return (
        <Card title="💡 Suggestions" sub="Automatic, based on your data. Fix the red ones first." wide>
            {insights.length ? (
                <ul className="adm-insights">
                    {insights.map((i, n) => (
                        <li key={n} className={i.level}>
                            <span className="lvl">{i.level === "high" ? "🔴 Important" : i.level === "medium" ? "🟠 Improve" : i.level === "good" ? "🟢 Good" : "🔵 Info"} · {i.area}</span>
                            <b>{i.title}</b>
                            <p>{i.detail}</p>
                            <p className="do">👉 {i.action}</p>
                        </li>
                    ))}
                </ul>
            ) : <p className="adm-empty">No suggestions yet. They appear once there is enough data.</p>}
        </Card>
    );
}

/* ---------------- 2. Funnel ---------------- */
async function FunnelTab({ days }: { days: number }) {
    const f = await getFunnel(days);
    const r = f.recipient;
    return (
        <>
            <Card title="Creator funnel" sub="Unique visitor sessions at each stage. The red line shows where most people give up." wide><Funnel steps={f.steps} /></Card>
            <div className="adm-grid">
                <Card title="Recipient side">
                    <ul className="adm-facts">
                        <li><span>Wishes created</span><b>{fmt(r.wishesCreated)}</b></li>
                        <li><span>Wishes opened (tracked)</span><b>{fmt(r.wishesOpened)}</b></li>
                        <li><span>Opening sessions</span><b>{fmt(r.opens)}</b></li>
                        <li><span>Reached the finale</span><b>{fmt(r.finales)} {r.opens ? <small>({pct(r.finales / r.opens)})</small> : null}</b></li>
                        <li><span>&quot;Make your own&quot; clicks</span><b>{fmt(r.makeOwn)}</b></li>
                    </ul>
                </Card>
                <Card title="Viral loop" sub="People who came from a wish's finale link (?ref=wish).">
                    <ul className="adm-facts">
                        <li><span>Visitors from wishes</span><b>{fmt(f.viral.visitors)}</b></li>
                        <li><span>…who created their own</span><b>{fmt(f.viral.created)}</b></li>
                        <li><span>New wishes per 100 opened</span><b>{r.opens ? ((f.viral.created / r.opens) * 100).toFixed(1) : "—"}</b></li>
                    </ul>
                </Card>
            </div>
        </>
    );
}

/* ---------------- 3. Wizard ---------------- */
async function WizardTab({ days }: { days: number }) {
    const w = await getWizard(days);
    const first = w.steps[0]?.n || 0;
    return (
        <>
            <div className="adm-kpis">
                <Kpi label="Wishes (ledger)" value={w.wishes} />
                <Kpi label="Time to create" value={w.medianSecs ? secs(w.medianSecs) : "—"} hint="median" />
                <Kpi label="Avg blocks per wish" value={w.avgBlocks ? w.avgBlocks.toFixed(1) : "—"} />
                <Kpi label="With photos" value={pct(w.pct.media)} />
                <Kpi label="With voice note" value={pct(w.pct.voice)} />
                <Kpi label="Custom link / scheduled" value={`${pct(w.pct.slug)} / ${pct(w.pct.unlock)}`} />
            </div>
            <Card title="Step drop-off (Wizard 2.0)" sub="Sessions that reached each step, in wizard order. Big drops = steps to simplify." wide>
                <Bars items={w.steps.map((s) => ({ key: s.key, n: s.n, extra: first ? <small> · {pct(s.n / first)}</small> : null }))} label={stepLabel} limit={30} />
            </Card>
            <div className="adm-grid">
                <Card title="Mode chosen"><Bars items={w.modes} /></Card>
                <Card title="Where wishes are made"><Bars items={w.source} /></Card>
                <Card title="Most used blocks"><Bars items={w.blocks} label={blockName} limit={20} /></Card>
                <Card title="Mini-games"><Bars items={w.games} label={blockName} empty="No games used yet" /></Card>
                <Card title="Presentation styles"><Bars items={w.style} /></Card>
                <Card title="Colour skins"><Bars items={w.theme} /></Card>
                <Card title="Wish language"><Bars items={w.lang} /></Card>
                <Card title="Create failures"><Bars items={w.fails} empty="No failures 🎉" color="#f43f5e" /></Card>
                <Card title="Upload failures"><Bars items={w.uploads} empty="No failures 🎉" color="#f43f5e" /></Card>
            </div>
        </>
    );
}

/* ---------------- 4. Recipients ---------------- */
async function RecipientsTab({ days }: { days: number }) {
    const r = await getRecipient(days);
    return (
        <div className="adm-grid">
            <Card title="Slides: views & time spent" sub="Median seconds on each slide (Wizard 2.0 wishes)." wide>
                <Table head={["Slide", "Views", "Median time"]} rows={r.slides.map((s) => [blockName(s.key), fmt(s.n), ms(s.medMs)])} empty="No wish openings tracked yet" />
            </Card>
            <Card title="Where recipients stop" sub="Last slide seen by people who never reached the finale."><Bars items={r.exits} label={blockName} color="#f59e0b" empty="Nobody dropped off yet" /></Card>
            <Card title="Puzzles & quizzes" sub="Solved by the recipient vs auto-skipped after 60 s.">
                <Table head={["Gate", "Solved", "Auto-skipped"]} rows={r.gates.map((g) => [blockName(g.key), fmt(g.solved), <span key="a" className={g.auto > g.solved ? "warn" : ""}>{fmt(g.auto)}</span>])} empty="No gates tracked yet" />
            </Card>
            <Card title="By presentation style">
                <Table head={["Style", "Opened", "Finale reached"]} rows={r.byStyle.map((s) => [s.key, fmt(s.opens), s.opens ? pct(s.finales / s.opens) : "—"])} />
            </Card>
            <Card title="Blow the Candles: how"><Bars items={r.candles} empty="No candles played yet" /></Card>
            <Card title="Classic wishes (v1 viewer)" sub="Section views from wishes made with the classic wizard.">
                <Table head={["Section", "Views", "Avg time"]} rows={r.legacy.map((s) => [s.key, fmt(s.n), ms(s.ms)])} />
            </Card>
        </div>
    );
}

/* ---------------- 5. Traffic & SEO ---------------- */
async function TrafficTab({ days }: { days: number }) {
    const t = await getTraffic(days);
    return (
        <div className="adm-grid">
            <Card title="Traffic sources" sub="Unique sessions by where they came from."><Bars items={t.sources} /></Card>
            <Card title="Top pages"><Table head={["Page", "Views", "Visitors"]} rows={t.pages.map((p) => [p.key, fmt(p.n), fmt(p.u)])} /></Card>
            <Card title="Landing pages → wishes" sub="First page of a session and how many of those sessions created a wish." wide>
                <Table head={["Landing page", "Sessions", "Created a wish", "Conversion"]} rows={t.landing.map((l) => [l.key, fmt(l.n), fmt(l.conv), l.n ? pct(l.conv / l.n) : "—"])} />
            </Card>
            <Card title="Create-button clicks" sub="Page → button text."><Bars items={t.ctas} limit={15} /></Card>
            <Card title="Game pages">
                <Table head={["Game", "Demo plays", "Links made"]} rows={t.games.map((g) => [blockName(g.key), fmt(g.plays), fmt(g.makes)])} empty="No game page activity yet" />
            </Card>
            <Card title="Blog performance" sub="Readers and how many clicked a Create button." wide>
                <Table head={["Post", "Views", "Readers", "Create clicks"]} rows={t.blog.map((b) => [b.key, fmt(b.n), fmt(b.u), fmt(b.clicks)])} empty="No blog visits tracked yet" />
            </Card>
            <Card title="🩺 Site health check" sub="Checks every page in the sitemap: status, speed, title, description, canonical, H1, og:image, noindex." wide>
                <HealthCheck />
            </Card>
        </div>
    );
}

/* ---------------- 6. Devices & speed ---------------- */
async function DevicesTab({ days }: { days: number }) {
    const d = await getDevices(days);
    const metrics = ["LCP", "INP", "CLS", "FCP", "TTFB"];
    const devices = ["mobile", "desktop", "tablet"];
    const cell = (m: string, dev: string) => {
        const v = d.vitals.find((x) => x.metric === m && x.device === dev);
        if (!v) return "—";
        const th = VITAL[m];
        const cls = v.p75 <= th.good ? "good" : v.p75 <= th.poor ? "warn" : "bad";
        return <span className={`adm-tag ${cls}`}>{th.unit === "ms" ? ms(v.p75) : v.p75.toFixed(3)} <small>({v.n})</small></span>;
    };
    return (
        <div className="adm-grid">
            <Card title="Core Web Vitals (p75)" sub="Real visitors. Green = good for Google (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1)." wide>
                <Table head={["Metric", ...devices]} rows={metrics.map((m) => [m, ...devices.map((dev) => cell(m, dev))])} />
            </Card>
            <Card title="Slowest pages (LCP p75)"><Table head={["Page", "LCP p75", "Samples"]} rows={d.slowPages.map((p) => [p.key, <span key="v" className={p.p75 > 4000 ? "bad" : p.p75 > 2500 ? "warn" : ""}>{ms(p.p75)}</span>, fmt(p.n)])} empty="Needs at least 3 samples per page" /></Card>
            <Card title="Devices"><Bars items={d.device} /></Card>
            <Card title="Browsers"><Bars items={d.browser} /></Card>
            <Card title="Countries"><Bars items={d.country} /></Card>
        </div>
    );
}

/* ---------------- 7. Errors ---------------- */
async function ErrorsTab({ days }: { days: number }) {
    const e = await getErrors(days);
    return (
        <>
            <Card title="JavaScript errors in visitors' browsers" sub="Grouped by message. Fix the ones that hit the most visitors." wide>
                <Table head={["Error", "Where", "Times", "Visitors", "Page", "Browser", "Last seen"]} rows={e.js.map((x) => [<code key="m" className="adm-code">{x.msg}</code>, x.loc, fmt(x.n), fmt(x.users), x.path, x.browser, when(x.last)])} empty="No JavaScript errors 🎉" />
            </Card>
            <Card title="Failed requests" sub="Create-wish failures, API errors and upload failures." wide>
                <Table head={["Type", "Detail", "Status", "Times", "Last seen"]} rows={e.api.map((x) => [x.name, x.detail, x.status, fmt(x.n), when(x.last)])} empty="No failed requests 🎉" />
            </Card>
        </>
    );
}

/* ---------------- 8. Reviews ---------------- */
async function ReviewsTab() {
    const r = await getReviews();
    return (
        <>
            <div className="adm-kpis">
                <Kpi label="Reviews" value={r.total} />
                <Kpi label="Average rating" value={r.total ? `${r.avg.toFixed(1)} / 5` : "—"} />
                <Kpi label="Shown on site" value={r.shown} />
            </div>
            <div className="adm-grid">
                <Card title="Rating distribution"><Bars items={r.dist} max={Math.max(1, ...r.dist.map((d) => d.n))} color="#f59e0b" /></Card>
            </div>
            <Card title="All reviews" sub="Hide spam or abusive reviews from the homepage." wide>
                <Table head={["Date", "From", "Name", "Rating", "Message", "Status"]} rows={r.list.map((x) => [
                    when(x.created), x.source === "creator" ? "🎁 Creator" : x.source === "recipient" ? "🎂 Recipient" : "🌐 Website",
                    `${x.name} (${x.relationship})`, `${x.rating} / 5`, <span key="m" className="adm-msg">{x.message || "—"}</span>,
                    <form key="f" action={toggleReviewAction}>
                        <input type="hidden" name="id" value={x.id} />
                        <input type="hidden" name="show" value={x.approved ? "0" : "1"} />
                        <button type="submit" className={`adm-btn sm ${x.approved ? "ghost" : ""}`}>{x.approved ? "Hide" : "Show"}</button>
                    </form>,
                ])} empty="No reviews yet" />
            </Card>
        </>
    );
}

/* ---------------- 9. Wishes (privacy-safe) ---------------- */
async function WishesTab() {
    const w = await getWishOps();
    const lc = w.lastCleanup?.v;
    return (
        <>
            <div className="adm-kpis">
                <Kpi label="Active wishes" value={w.active} />
                <Kpi label="Not opened yet" value={w.unopened} />
                <Kpi label="Opened (self-destruct running)" value={w.opened} />
                <Kpi label="Deleting within ~2 h / 1 day" value={w.expiringSoon} />
                <Kpi label="Waiting for cleanup" value={w.waitingCleanup} hint={w.overdue ? `${w.overdue} overdue (cron missed!)` : "normal: cleanup runs daily"} />
                <Kpi label="Deleted so far" value={w.deletedTotal} />
            </div>
            <div className="adm-grid">
                <Card title="Cleanup & Cloudinary Auto-Saver" sub="Runs daily (/api/cleanup, 00:00 UTC): deletes expired wishes (>10 h opened or >7 d unopened) AND cleans abandoned wizard uploads in birthday_wishes/ older than 36 h.">
                    <ul className="adm-facts">
                        <li><span>Last run</span><b>{w.lastCleanup ? when(lc?.at || w.lastCleanup.updated_at) : "never recorded"}</b></li>
                        <li><span>Expired wishes deleted</span><b>{lc?.error ? <span className="bad">error</span> : fmt(lc?.deleted ?? 0)}</b></li>
                        <li><span>Orphan uploads cleaned</span><b>{lc?.orphanMedia !== undefined ? `${fmt(lc.orphanMedia)} (${lc.freedMb ?? 0} MB freed)` : "—"}</b></li>
                        <li><span>Oldest unopened wish</span><b>{w.oldestUnopened ? when(w.oldestUnopened) : "—"}</b></li>
                        <li><span>Custom links in use</span><b>{fmt(w.slugs)}</b></li>
                    </ul>
                    <CleanupButton />
                </Card>
                <Card title="Cloudinary storage" sub="Photos, videos and voice notes.">
                    {w.usage ? (
                        <ul className="adm-facts">
                            <li><span>Plan</span><b>{w.usage.plan || "—"}</b></li>
                            <li><span>Credits used</span><b className={w.usage.creditsUsedPct >= 80 ? "bad" : ""}>{w.usage.creditsUsedPct.toFixed(1)}%</b></li>
                            <li><span>Storage</span><b>{fmt(w.usage.storageMb)} MB</b></li>
                            <li><span>Bandwidth (this cycle)</span><b>{fmt(w.usage.bandwidthMb)} MB</b></li>
                            <li><span>Media files in active wishes</span><b>{fmt(w.activeMedia)}</b></li>
                        </ul>
                    ) : <p className="adm-empty">Usage not available (check Cloudinary keys).</p>}
                </Card>
            </div>
            <Card
                title="Active wish links (Admin Read-Only Preview)"
                sub="Opening any link while logged in as Admin will NOT start the 10-hour timer, will NOT bump views, and automatically bypasses countdown/gate locks (visitors still see their lock)."
                wide
            >
                <Table
                    head={["ID / Custom link", "Status", "Style", "Created", "Opened", "Views", "Preview"]}
                    rows={w.recent.map((r) => [
                        <span key="id">
                            <code>{r.id}</code>
                            {r.slug ? <small> · /w/{r.slug}</small> : null}
                        </span>,
                        <span key="st">
                            <span className={`adm-tag ${r.opened ? "good" : "warn"}`}>{r.opened ? "Opened" : "Unopened"}</span>
                            {r.lockedUntil ? <span className="adm-tag warn" title={`Locked until ${when(r.lockedUntil)}`}>⏳ Locked ({when(r.lockedUntil)})</span> : null}
                        </span>,
                        r.style,
                        when(r.created),
                        r.opened ? when(r.opened) : "—",
                        fmt(r.views),
                        <a key="p" href={`/wish/${r.id}`} target="_blank" rel="noopener noreferrer" className="adm-btn sm ghost">
                            Open (Read-Only)
                        </a>,
                    ])}
                    empty="No active wishes right now"
                />
            </Card>
            <Card title="Delete a wish now" sub="For privacy or DMCA requests. Deletes the wish and its photos / voice notes immediately. Wish content is never shown here." wide>
                <DeleteWishForm />
            </Card>
        </>
    );
}
