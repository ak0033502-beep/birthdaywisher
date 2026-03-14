import { NextResponse } from "next/server";
import { saveWish } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await saveWish(body);
        return NextResponse.json({ id: result.id, creatorToken: result.creatorToken });
    } catch (error) {
        console.error("Error creating wish:", error);
        return NextResponse.json(
            { error: "Failed to create wish" },
            { status: 500 }
        );
    }
}
