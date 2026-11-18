import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
    title: { absolute: "Admin | BirthdayWisher.fun" },
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <div className="party adm">{children}</div>;
}
