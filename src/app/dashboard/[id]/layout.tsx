import type { Metadata } from "next";

// Creator analytics dashboard: private, never index
export const metadata: Metadata = {
    title: "Wish Dashboard | BirthdayWisher.fun",
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return children;
}
