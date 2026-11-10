import type { Metadata } from "next";
import { getWish } from "@/lib/db";
import { migrateV1toV2 } from "@/lib/wish/migrate";
import { V2WishShell } from "@/components/viewer/V2WishShell";

/**
 * Hidden preview: open any existing wish in the NEW v2 block viewer.
 * The production link /wish/[id] is unchanged and still uses the v1 viewers.
 * Old (v1) data is converted on the fly by migrateV1toV2. Nothing is written back.
 */
export const metadata: Metadata = {
    title: "Wish preview (v2) | BirthdayWisher.fun",
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function WishV2PreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const raw = await getWish(id);
    if (!raw) {
        return (
            <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f43f5e" }}>404 - Wish Not Found</h1>
                    <p style={{ opacity: 0.7 }}>This wish link is either invalid or has self-destructed for privacy reasons.</p>
                </div>
            </div>
        );
    }
    return <V2WishShell wish={migrateV1toV2(raw)} wishId={id} />;
}
