"use client";

import { useActionState, useState } from "react";
import { optOutOfTracking } from "@/lib/track";
import { deleteWishAction, pingIndexNowAction, runCleanupAction, type ActionResult } from "@/app/admin/actions";

export function LoginForm({ configured }: { configured: boolean }) {
    const [pw, setPw] = useState("");
    const [err, setErr] = useState("");
    const [phase, setPhase] = useState<"idle" | "checking" | "opening">("idle");
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phase !== "idle") return;
        setPhase("checking");
        setErr("");
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ password: pw.trim() }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Login failed");
            optOutOfTracking(); // the owner's own visits are not counted
            setPhase("opening");
            window.location.assign("/admin");
        } catch (e2) {
            setErr((e2 as Error).message);
            setPhase("idle");
        }
    };
    const busy = phase !== "idle";
    return (
        <form className="adm-card adm-login" onSubmit={submit}>
            <div style={{ fontSize: 44 }} aria-hidden="true">🎂</div>
            <h1>BirthdayWisher Admin</h1>
            {!configured && <p className="adm-warn">Admin is locked: set <code>ADMIN_PASSWORD</code> (8+ characters) in the environment variables, then redeploy.</p>}
            <input type="password" autoComplete="current-password" placeholder="Admin password" value={pw} onChange={(e) => setPw(e.target.value)} aria-label="Admin password" autoFocus disabled={busy} />
            {err && <p className="adm-err" role="alert">{err}</p>}
            <button type="submit" className="adm-btn" disabled={busy || !pw.trim()}>
                {phase === "checking" ? "Checking password…" : phase === "opening" ? "Opening dashboard…" : "Log in"}
            </button>
        </form>
    );
}

export function LogoutButton() {
    return (
        <button
            type="button"
            className="adm-btn ghost"
            onClick={async () => {
                await fetch("/api/admin/login", { method: "DELETE", credentials: "same-origin" });
                window.location.assign("/admin/login");
            }}
        >
            Log out
        </button>
    );
}

export function DeleteWishForm() {
    const [state, action, pending] = useActionState<ActionResult | null, FormData>(deleteWishAction, null);
    return (
        <form action={action} className="adm-form">
            <input name="key" placeholder="Wish link, id or custom slug" aria-label="Wish link, id or custom slug" />
            <input name="confirm" placeholder='Type DELETE' aria-label="Type DELETE to confirm" style={{ maxWidth: 140 }} />
            <button type="submit" className="adm-btn danger" disabled={pending}>{pending ? "Deleting…" : "Delete now"}</button>
            {state && <p className={state.ok ? "adm-ok" : "adm-err"}>{state.msg}</p>}
        </form>
    );
}

export function CleanupButton() {
    const [state, action, pending] = useActionState<ActionResult | null>(runCleanupAction, null);
    return (
        <form action={action} className="adm-form">
            <button type="submit" className="adm-btn ghost" disabled={pending}>{pending ? "Running…" : "Run cleanup now"}</button>
            {state && <p className={state.ok ? "adm-ok" : "adm-err"}>{state.msg}</p>}
        </form>
    );
}

export function IndexNowButton() {
    const [state, action, pending] = useActionState<ActionResult | null>(pingIndexNowAction, null);
    return (
        <form action={action} className="adm-form">
            <button type="submit" className="adm-btn" disabled={pending}>
                {pending ? "Submitting to IndexNow…" : "🚀 Ping AI & IndexNow (All Pages)"}
            </button>
            {state && <p className={state.ok ? "adm-ok" : "adm-err"}>{state.msg}</p>}
        </form>
    );
}

type Health = { url: string; status: number; ms: number; title: string; titleLen: number; descLen: number; canonical: string; canonicalOk: boolean; h1: number; ogImage: boolean; noindex: boolean; issues: string[] };

export function HealthCheck() {
    const [rows, setRows] = useState<Health[] | null>(null);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const run = async () => {
        setBusy(true); setErr("");
        try {
            const res = await fetch("/api/admin/health");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");
            setRows(data.results);
        } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
    };
    const bad = rows?.filter((r) => r.issues.length) ?? [];
    return (
        <div>
            <button type="button" className="adm-btn" onClick={run} disabled={busy}>{busy ? "Checking all sitemap pages…" : rows ? "Run again" : "Run site health check"}</button>
            {err && <p className="adm-err">{err}</p>}
            {rows && (
                <>
                    <p className="adm-sub" style={{ marginTop: 10 }}>{rows.length} pages checked · <b>{bad.length}</b> with issues · avg {Math.round(rows.reduce((s, r) => s + r.ms, 0) / Math.max(1, rows.length))} ms server response</p>
                    <div className="adm-table-wrap">
                        <table className="adm-table">
                            <thead><tr><th>Page</th><th>Status</th><th>Time</th><th>Title</th><th>Issues</th></tr></thead>
                            <tbody>
                                {[...rows].sort((a, b) => b.issues.length - a.issues.length).map((r) => (
                                    <tr key={r.url}>
                                        <td><a href={r.url} target="_blank" rel="noopener noreferrer">{new URL(r.url).pathname}</a></td>
                                        <td className={r.status === 200 ? "" : "bad"}>{r.status}</td>
                                        <td className={r.ms > 1500 ? "warn" : ""}>{r.ms} ms</td>
                                        <td title={r.title}>{r.titleLen} ch</td>
                                        <td>{r.issues.length ? r.issues.map((i) => <span key={i} className="adm-tag bad">{i}</span>) : <span className="adm-tag good">OK</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
