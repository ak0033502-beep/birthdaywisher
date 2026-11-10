import { SITE_NAME, SITE_URL, absUrl, toIsoDate } from "@/lib/site";

type JsonLdObject = Record<string, unknown>;

/** Renders one or more schema.org objects as a JSON-LD script tag. */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

export function breadcrumbLd(items: Array<{ name: string; path: string }>): JsonLdObject {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: absUrl(item.path),
        })),
    };
}

export function articleLd(opts: {
    title: string;
    description: string;
    path: string;
    datePublished: string;
    dateModified?: string;
    author?: string;
}): JsonLdObject {
    const published = toIsoDate(opts.datePublished);
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: opts.title,
        description: opts.description,
        datePublished: published,
        dateModified: opts.dateModified ? toIsoDate(opts.dateModified) : published,
        author: { "@type": "Organization", name: opts.author || `${SITE_NAME} Editorial`, url: SITE_URL },
        publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            logo: { "@type": "ImageObject", url: absUrl("/logo.png") },
        },
        image: absUrl("/opengraph-image.png"),
        mainEntityOfPage: { "@type": "WebPage", "@id": absUrl(opts.path) },
    };
}
