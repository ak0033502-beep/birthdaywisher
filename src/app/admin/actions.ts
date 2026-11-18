"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@vercel/postgres";
import { isAdmin } from "@/lib/adminAuth";
import { cleanupExpiredWishes, deleteWishNow } from "@/lib/db";
import { kvSet, rollupAndPrune } from "@/lib/analytics";

export type ActionResult = { ok: boolean; msg: string };

export async function deleteWishAction(_: ActionResult | null, form: FormData): Promise<ActionResult> {
    if (!(await isAdmin())) return { ok: false, msg: "Not logged in" };
    const key = String(form.get("key") || "").trim();
    if (!key) return { ok: false, msg: "Enter a wish link, id or custom slug" };
    if (String(form.get("confirm") || "") !== "DELETE") return { ok: false, msg: 'Type DELETE to confirm' };
    const r = await deleteWishNow(key);
    revalidatePath("/admin");
    return r.ok ? { ok: true, msg: `Deleted wish ${r.id} and its photos/voice notes.` } : { ok: false, msg: "No wish found with that link / id / slug (it may already be deleted)." };
}

export async function toggleReviewAction(form: FormData): Promise<void> {
    if (!(await isAdmin())) return;
    const id = Number(form.get("id"));
    const show = String(form.get("show")) === "1";
    if (!Number.isInteger(id)) return;
    await sql`UPDATE reviews SET approved = ${show} WHERE id = ${id}`;
    revalidatePath("/admin");
}

export async function runCleanupAction(_: ActionResult | null): Promise<ActionResult> {
    if (!(await isAdmin())) return { ok: false, msg: "Not logged in" };
    try {
        const deleted = await cleanupExpiredWishes();
        const prunedEvents = await rollupAndPrune().catch(() => 0);
        await kvSet("last_cleanup", { deleted, prunedEvents, at: new Date().toISOString(), manual: true });
        revalidatePath("/admin");
        return { ok: true, msg: `Cleanup done: ${deleted} expired wishes deleted.` };
    } catch (e) {
        return { ok: false, msg: `Cleanup failed: ${String(e).slice(0, 120)}` };
    }
}
