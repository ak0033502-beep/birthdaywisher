import { NextResponse } from "next/server";
import { saveWish } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Wizard 2.0 sends the v2 block format; do a light shape/size check
        if (body && body.schemaVersion === 2) {
            const okShape = Array.isArray(body.blocks) && body.blocks.length <= 40 && body.recipient && typeof body.recipient.name === "string" && body.recipient.name.trim().length > 0;
            if (!okShape || JSON.stringify(body).length > 200_000) {
                return NextResponse.json({ error: "Invalid wish data" }, { status: 400 });
            }
        }
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
