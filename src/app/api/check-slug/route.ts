import { NextResponse } from "next/server";
import { InvalidSlugError, isSlugAvailable, sanitizeCustomSlug } from "@/lib/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
        return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    try {
        const cleanSlug = sanitizeCustomSlug(slug);
        if (!cleanSlug) {
            return NextResponse.json({ available: false, error: "Slug must be 3-40 characters" });
        }
        const available = await isSlugAvailable(cleanSlug);
        return NextResponse.json({ available, slug: cleanSlug });
    } catch (e) {
        if (e instanceof InvalidSlugError) {
            return NextResponse.json({ available: false, error: e.message });
        }
        return NextResponse.json({ available: false, error: "Could not check link availability" }, { status: 500 });
    }
}
