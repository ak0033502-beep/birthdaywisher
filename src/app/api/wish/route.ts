import { NextResponse } from "next/server";
import { saveWish } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const id = await saveWish(body);

        return NextResponse.json({ id, success: true });
    } catch (error) {
        console.error("Error saving wish API:", error);
        return NextResponse.json(
            { error: "Failed to save the wish" },
            { status: 500 }
        );
    }
}
