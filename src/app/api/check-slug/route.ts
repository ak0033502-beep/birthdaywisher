import { NextResponse } from "next/server";
import { isSlugAvailable } from "@/lib/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
        return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Validate slug format
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (cleanSlug.length < 3 || cleanSlug.length > 40) {
        return NextResponse.json({ available: false, error: "Slug must be 3-40 characters" });
    }

    const available = await isSlugAvailable(cleanSlug);
    return NextResponse.json({ available, slug: cleanSlug });
}
