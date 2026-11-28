import type { ReactNode } from "react";

/* Lightweight, dependency-free chart components for the admin dashboard (server-rendered SVG/HTML). */

export const fmt = (n: number) => (n >= 10000 ? `${(n / 1000).toFixed(1)}k` : Math.round(n).toLocaleString("en-IN"));
export const pct = (x: number) => `${Math.round(x * 100)}%`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-11-05" -> "5 Nov" */
const shortDay = (l: string) => { const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(l); return m ? `${Number(m[2])} ${MONTHS[Number(m[1]) - 1]}` : l; };

export function Kpi({ label, value, prev, hint, suffix = "", invert = false }: { label: string; value: number | string; prev?: number; hint?: string; suffix?: string; invert?: boolean }) {
    let delta: ReactNode = null;
    if (typeof value === "number" && typeof prev === "number" && prev > 0) {
        const d = (value - prev) / prev;
        const up = d >= 0;
        const good = invert ? !up : up;
        delta = <span className={`adm-delta ${good ? "up" : "down"}`}>{up ? "▲" : "▼"} {Math.abs(Math.round(d * 100))}%</span>;
    }
    return (
        <div className="adm-card adm-kpi">
            <span className="lbl">{label}</span>
            <b>{typeof value === "number" ? fmt(value) : value}{suffix}</b>
            <span className="sub">{delta}{hint && <span>{hint}</span>}</span>
        </div>
    );
}

export function LineChart({ labels, series, height = 200 }: { labels: string[]; series: Array<{ name: string; color: string; values: number[] }>; height?: number }) {
    const W = 720, H = height, P = { l: 34, r: 16, t: 12, b: 26 };
    const max = Math.max(1, ...series.flatMap((s) => s.values));
    const n = Math.max(1, labels.length - 1);
    const x = (i: number) => P.l + (i / n) * (W - P.l - P.r);
    const y = (v: number) => H - P.b - (v / max) * (H - P.t - P.b);
    const ticks = [...new Set([0, 0.5, 1].map((k) => Math.round(max * k)))];
    const every = Math.max(1, Math.ceil(labels.length / 8));
    return (
        <div className="adm-chart">
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={series.map((s) => s.name).join(", ")}>
                {ticks.map((t) => <g key={t}><line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="grid" /><text x={P.l - 6} y={y(t) + 4} textAnchor="end" className="ax">{fmt(t)}</text></g>)}
                {labels.map((l, i) => {
                    const last = i === labels.length - 1;
                    const show = last || (i % every === 0 && labels.length - 1 - i >= Math.max(2, Math.ceil(every * 0.6)));
                    return show && <text key={l + i} x={x(i)} y={H - 6} textAnchor={last ? "end" : i === 0 ? "start" : "middle"} className="ax">{shortDay(l)}</text>;
                })}
                {series.map((s) => {
                    const pts = s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
                    return (
                        <g key={s.name}>
                            <polygon points={`${x(0)},${y(0)} ${pts} ${x(s.values.length - 1)},${y(0)}`} fill={s.color} opacity=".10" />
                            <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                            {s.values.length <= 31 && s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="2.6" fill={s.color}><title>{`${labels[i]}: ${v} ${s.name}`}</title></circle>)}
                        </g>
                    );
                })}
            </svg>
            <div className="adm-legend">{series.map((s) => <span key={s.name}><i style={{ background: s.color }} />{s.name}</span>)}</div>
        </div>
    );
}

export function Bars({ items, empty = "No data yet", max, format = fmt, color, limit = 12, label }: {
    items: Array<{ key: string; n: number; extra?: ReactNode }>; empty?: string; max?: number; format?: (n: number) => string; color?: string; limit?: number; label?: (k: string) => string;
}) {
    if (!items.length) return <p className="adm-empty">{empty}</p>;
    const top = items.slice(0, limit);
    const m = max ?? Math.max(1, ...top.map((i) => i.n));
    return (
        <ul className="adm-bars">
            {top.map((i) => (
                <li key={i.key}>
                    <span className="k" title={i.key}>{label ? label(i.key) : i.key}</span>
                    <span className="bar"><i style={{ width: `${Math.max(2, (i.n / m) * 100)}%`, background: color }} /></span>
                    <span className="v">{format(i.n)}{i.extra}</span>
                </li>
            ))}
        </ul>
    );
}

export function Funnel({ steps }: { steps: Array<{ key: string; n: number }> }) {
    const first = steps[0]?.n || 0;
    if (!first) return <p className="adm-empty">No visits tracked in this period yet.</p>;
    return (
        <ol className="adm-funnel">
            {steps.map((s, i) => {
                const prev = i ? steps[i - 1].n : s.n;
                const drop = prev ? 1 - s.n / prev : 0;
                return (
                    <li key={s.key}>
                        <div className="row"><span className="k">{i + 1}. {s.key}</span><span className="v">{fmt(s.n)} <small>({pct(s.n / first)})</small></span></div>
                        <div className="bar"><i style={{ width: `${Math.max(1.5, (s.n / first) * 100)}%` }} /></div>
                        {i > 0 && drop > 0.001 && <div className={`drop ${drop >= 0.4 ? "bad" : drop >= 0.2 ? "warn" : ""}`}>−{pct(drop)} left at this step</div>}
                    </li>
                );
            })}
        </ol>
    );
}

export function Table({ head, rows, empty = "No data yet" }: { head: string[]; rows: ReactNode[][]; empty?: string }) {
    if (!rows.length) return <p className="adm-empty">{empty}</p>;
    return (
        <div className="adm-table-wrap">
            <table className="adm-table">
                <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
            </table>
        </div>
    );
}

export function Card({ title, sub, children, wide = false }: { title: string; sub?: string; children: ReactNode; wide?: boolean }) {
    return (
        <section className={`adm-card ${wide ? "wide" : ""}`}>
            <h3>{title}</h3>
            {sub && <p className="adm-sub">{sub}</p>}
            {children}
        </section>
    );
}
