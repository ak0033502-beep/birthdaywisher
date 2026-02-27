import { sql } from '@vercel/postgres';
import { WishData } from '@/lib/WishContext';
import crypto from 'crypto';
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize the database table if it doesn't exist
export async function ensureDb() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS wishes (
                id VARCHAR(10) PRIMARY KEY,
                data JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                opened_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
            );
        `;

        // Ensure existing tables are updated
        await sql`
            ALTER TABLE wishes ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        `;
    } catch (error) {
        console.error("Error setting up Postgres DB:", error);
    }
}

export async function saveWish(data: WishData): Promise<string> {
    await ensureDb();

    // Generate a short 6-character random ID
    const id = crypto.randomBytes(3).toString('hex');

    try {
        await sql`
            INSERT INTO wishes (id, data)
            VALUES (${id}, ${JSON.stringify(data)}::jsonb)
        `;
        return id;
    } catch (error) {
        console.error("Error saving wish:", error);
        throw new Error("Failed to save wish");
    }
}

export async function getWish(id: string): Promise<WishData | null> {
    await ensureDb();

    try {
        // Mark as opened if it hasn't been already. This starts the 10-hour timer.
        await sql`
            UPDATE wishes 
            SET opened_at = CURRENT_TIMESTAMP 
            WHERE id = ${id} AND opened_at IS NULL
        `;

        const { rows } = await sql`
            SELECT data FROM wishes WHERE id = ${id}
        `;

        if (rows.length > 0) {
            return rows[0].data as WishData;
        }
        return null;
    } catch (error) {
        console.error("Error getting wish:", error);
        return null;
    }
}

// Extract public_id from Cloudinary URL
function getCloudinaryPublicId(url: string) {
    if (!url || !url.includes("cloudinary.com")) return null;
    try {
        const parts = url.split("/");
        const lastPart = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        const idWithExt = `${folder}/${lastPart}`;
        return idWithExt.substring(0, idWithExt.lastIndexOf('.'));
    } catch (e) {
        return null;
    }
}

export async function cleanupExpiredWishes() {
    await ensureDb();
    try {
        // Find wishes opened > 10 hours ago OR created > 7 days ago (never opened)
        const { rows } = await sql`
            SELECT id, data FROM wishes 
            WHERE (opened_at IS NOT NULL AND opened_at < NOW() - INTERVAL '10 hours')
               OR (created_at < NOW() - INTERVAL '7 days')
        `;

        let deletedCount = 0;

        for (const row of rows) {
            const wishData = row.data as WishData;

            // Delete modern media gallery from Cloudinary
            if (wishData.mediaItems && wishData.mediaItems.length > 0) {
                for (const item of wishData.mediaItems) {
                    const publicId = getCloudinaryPublicId(item.url);
                    if (publicId) {
                        await cloudinary.uploader.destroy(publicId, {
                            resource_type: item.type === 'video' ? 'video' : 'image'
                        }).catch(console.error);
                    }
                }
            }

            // Delete legacy media from Cloudinary if exists
            if (wishData.mediaUrl) {
                const publicId = getCloudinaryPublicId(wishData.mediaUrl);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId, {
                        resource_type: wishData.mediaType === 'video' ? 'video' : 'image'
                    }).catch(console.error);
                }
            }
            // Delete audio from Cloudinary
            if (wishData.audioUrl) {
                const publicId = getCloudinaryPublicId(wishData.audioUrl);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId, {
                        resource_type: 'video' // Cloudinary treats audio as video resource type
                    }).catch(console.error);
                }
            }

            // Delete row from postgres
            await sql`
                DELETE FROM wishes WHERE id = ${row.id}
            `;
            deletedCount++;
        }

        return deletedCount;
    } catch (error) {
        console.error("Error cleaning up wishes:", error);
        throw new Error("Failed to clean up wishes");
    }
}
