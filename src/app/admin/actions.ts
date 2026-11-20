"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@vercel/postgres";
import { isSameOriginAdmin } from "@/lib/adminAuth";
import { cleanupExpiredWishes, cleanupOrphanCloudinaryMedia, deleteWishNow } from "@/lib/db";
import { kvSet, rollupAndPrune } from "@/lib/analytics";

export type ActionResult = { ok: boolean; msg: string };

export async function deleteWishAction(_: ActionResult | null, form: FormData): Promise<ActionResult> {
    if (!(await isSameOriginAdmin())) return { ok: false, msg: "Not authorized" };
    const key = String(form.get("key") || "").trim();
    if (!key) return { ok: false, msg: "Enter a wish link, id or custom slug" };
    if (String(form.get("confirm") || "") !== "DELETE") return { ok: false, msg: "Type DELETE to confirm" };
    const r = await deleteWishNow(key);
    revalidatePath("/admin");
    return r.ok ? { ok: true, msg: `Deleted wish ${r.id} and its photos/voice notes.` } : { ok: false, msg: "No wish found with that link / id / slug (it may already be deleted)." };
}

export async function toggleReviewAction(form: FormData): Promise<void> {
    if (!(await isSameOriginAdmin())) return;
    const id = Number(form.get("id"));
    const show = String(form.get("show")) === "1";
    if (!Number.isInteger(id)) return;
    await sql`UPDATE reviews SET approved = ${show}, hidden_by_admin = ${!show} WHERE id = ${id}`;
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/llms.txt");
}

export async function runCleanupAction(): Promise<ActionResult> {
    if (!(await isSameOriginAdmin())) return { ok: false, msg: "Not authorized" };
    try {
        const deleted = await cleanupExpiredWishes();
        const orph = await cleanupOrphanCloudinaryMedia().catch(() => ({ deletedOrphans: 0, freedMb: 0 }));
        const prunedEvents = await rollupAndPrune().catch(() => 0);
        await kvSet("last_cleanup", {
            deleted,
            orphanMedia: orph.deletedOrphans,
            freedMb: orph.freedMb,
            prunedEvents,
            at: new Date().toISOString(),
            manual: true,
        });
        revalidatePath("/admin");
        return {
            ok: true,
            msg: `Cleanup done: ${deleted} expired wishes + ${orph.deletedOrphans} orphan uploads deleted (${orph.freedMb} MB freed).`,
        };
    } catch (e) {
        return { ok: false, msg: `Cleanup failed: ${String(e).slice(0, 120)}` };
    }
}
