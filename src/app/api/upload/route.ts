import { NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { isAdmin } from "@/lib/adminAuth";
import { isSameOriginRequest } from "@/lib/security";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = /^(image|video|audio)\//;

// Legacy server-buffered upload route: locked to authenticated same-origin Admins only
// (visitor wizards use direct signed Cloudinary XHR via /api/cloudinary-sign).
export async function POST(req: Request) {
    if (!isSameOriginRequest(req) || !(await isAdmin())) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || typeof file === "string") {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        if (!file.type || !ALLOWED.test(file.type)) {
            return NextResponse.json({ error: "Only photos, videos and voice notes can be uploaded" }, { status: 415 });
        }
        if (file.size > MAX_BYTES) {
            return NextResponse.json({ error: "File is too large (max 25 MB)" }, { status: 413 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "auto", folder: "birthday_wishes" },
                (error, result) => {
                    if (error || !result) reject(error || new Error("Empty upload result"));
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        });
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
    }
}
