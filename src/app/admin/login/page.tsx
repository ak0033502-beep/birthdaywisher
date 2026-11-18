import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/adminAuth";
import { LoginForm } from "@/components/admin/AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
    if (await isAdmin()) redirect("/admin");
    return (
        <main className="adm-login-wrap">
            <LoginForm configured={adminConfigured()} />
        </main>
    );
}
