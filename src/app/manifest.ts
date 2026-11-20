import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: `${SITE_NAME} — Interactive Birthday & Anniversary Wishes`,
        short_name: "BirthdayWisher",
        description: "Create free interactive birthday and anniversary surprise links with games, photos, voice notes, and confetti.",
        start_url: "/",
        display: "standalone",
        background_color: "#FFF8F0",
        theme_color: "#FF5C8A",
        icons: [
            { src: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
            { src: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
            { src: "/favicon-144x144.png", sizes: "144x144", type: "image/png" },
            { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
    };
}
