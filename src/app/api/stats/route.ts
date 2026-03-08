import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export const revalidate = 0; // No cache — always fresh

export async function GET() {
    try {
        const { rows } = await sql`
            SELECT 
                COUNT(*) FILTER (WHERE data->>'wishType' = 'birthday' OR data->>'wishType' IS NULL) as birthday_count,
                COUNT(*) FILTER (WHERE data->>'wishType' = 'anniversary') as anniversary_count,
                COUNT(*) as total_count
            FROM wishes
        `;

        return NextResponse.json({
            birthday: Number(rows[0]?.birthday_count || 0),
            anniversary: Number(rows[0]?.anniversary_count || 0),
            total: Number(rows[0]?.total_count || 0),
        });
    } catch (error) {
        console.error("Error fetching wish stats:", error);
        return NextResponse.json({ birthday: 0, anniversary: 0, total: 0 });
    }
}
