import type { ReactNode } from "react";
import Link from "next/link";
import { Bunting } from "./Decor";
import { PartyFooter } from "./PartyFooter";

/**
 * Shared shell for content pages in the "Joyful Party" design
 * (about, legal, blog, use-cases, anniversary...). Server component.
 */
export function PartyPage({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
    return (
        <div className="party bw-page">
            {children}
            {footer && <PartyFooter />}
        </div>
    );
}

export type Crumb = { name: string; href?: string };

/** Compact hero with bunting, breadcrumb, eyebrow, title and intro. */
export function PageHero({ crumbs, eyebrow, title, sub, center = false, children }: {
    crumbs?: Crumb[]; eyebrow?: ReactNode; title: ReactNode; sub?: ReactNode; center?: boolean; children?: ReactNode;
}) {
    return (
        <header className={`bw-hero bw-page-hero ${center ? "is-center" : ""}`}>
            <Bunting />
            <div className="bw-container bw-page-hero-in">
                {crumbs && crumbs.length > 0 && (
                    <nav aria-label="Breadcrumb" className="bw-crumbs">
                        {crumbs.map((c, i) => (
                            <span key={i}>
                                {i > 0 && <span aria-hidden="true"> › </span>}
                                {c.href ? <Link href={c.href}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
                            </span>
                        ))}
                    </nav>
                )}
                {eyebrow && <span className="bw-eyebrow">{eyebrow}</span>}
                <h1>{title}</h1>
                {sub && <p className="bw-sub">{sub}</p>}
                {children}
            </div>
        </header>
    );
}

/** Readable long-form text block. `legacy` adapts old Tailwind-styled markup to the party colours. */
export function Prose({ children, legacy = false, className = "" }: { children: ReactNode; legacy?: boolean; className?: string }) {
    return <article className={`bw-prose ${legacy ? "bw-legacy" : ""} ${className}`}>{children}</article>;
}

/** Friendly call-to-action card. */
export function CtaCard({ title, text, href = "/create", cta = "🎁 Create a birthday surprise", emoji = "🎂" }: {
    title: string; text?: string; href?: string; cta?: string; emoji?: string;
}) {
    return (
        <div className="bw-card bw-cta-card">
            <div className="e" aria-hidden="true">{emoji}</div>
            <h2>{title}</h2>
            {text && <p>{text}</p>}
            <Link href={href} className="bw-btn bw-btn-primary">{cta}</Link>
        </div>
    );
}
