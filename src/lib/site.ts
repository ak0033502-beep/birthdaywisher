/**
 * Central site config for SEO.
 * Google indexes the www host, so every canonical, sitemap, Open Graph and
 * JSON-LD URL must use it (non-www only redirects here).
 */
export const SITE_URL = "https://www.birthdaywisher.fun";
export const SITE_NAME = "BirthdayWisher.fun";

/** Build an absolute URL on the canonical host, e.g. absUrl("/blog") */
export function absUrl(path = "/"): string {
    return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`.replace(/\/$/, "") || SITE_URL;
}

/** Convert human dates like "Oct 24, 2024" to ISO 8601 (what Google expects in schema). */
export function toIsoDate(date: string): string {
    const d = new Date(date);
    return isNaN(d.getTime()) ? date : d.toISOString().slice(0, 10);
}
