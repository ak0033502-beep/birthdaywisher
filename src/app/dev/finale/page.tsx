import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FinaleDemo } from "./FinaleDemo";

export const metadata: Metadata = { title: "Finale test", robots: { index: false, follow: false } };

/** Local-only test page for the Grand Finale (404 in production). */
export default async function FinaleDevPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
    if (process.env.NODE_ENV === "production") notFound();
    const sp = await searchParams;
    return <FinaleDemo effect={sp.effect || "fireworks"} theme={sp.theme || "neon"} style={sp.style || "cinematic"} name={sp.name || "Priya"} age={sp.age ?? "21"} type={sp.type === "anniversary" ? "anniversary" : "birthday"} />;
}
