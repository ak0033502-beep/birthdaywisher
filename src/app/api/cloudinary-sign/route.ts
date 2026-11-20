import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { checkPersistentRateLimit, getTrustedIp, isSameOriginRequest } from "@/lib/security";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    if (!isSameOriginRequest(req)) {
        return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }
    const ip = getTrustedIp(req);
    const rl = await checkPersistentRateLimit("cloudinary_sign", ip, 20, 5 * 60 * 1000);
    if (!rl.allowed) {
        return NextResponse.json(
            { error: "Too many uploads right now. Please wait a minute and try again." },
            { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
        );
    }

    try {
        const timestamp = Math.round(Date.now() / 1000).toString();
        const folder = "birthday_wishes";

        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder },
            process.env.CLOUDINARY_API_SECRET as string
        );

        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder,
        });
    } catch (error: unknown) {
        console.error("Cloudinary sign error:", error);
        return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 });
    }
}
