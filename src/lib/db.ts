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
                opened_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
                custom_slug VARCHAR(50) UNIQUE DEFAULT NULL,
                view_count INTEGER DEFAULT 0,
                creator_token VARCHAR(64) DEFAULT NULL
            );
        `;

        // Ensure existing tables are updated
        await sql`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;`;
        await sql`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS custom_slug VARCHAR(50) UNIQUE DEFAULT NULL;`;
        await sql`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;`;
        await sql`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS creator_token VARCHAR(64) DEFAULT NULL;`;

        // Analytics table
        await sql`
            CREATE TABLE IF NOT EXISTS wish_analytics (
                id SERIAL PRIMARY KEY,
                wish_id VARCHAR(10) REFERENCES wishes(id) ON DELETE CASCADE,
                event_type VARCHAR(50) NOT NULL,
                section_name VARCHAR(100) DEFAULT NULL,
                time_spent_ms INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
    } catch (error) {
        console.error("Error setting up Postgres DB:", error);
    }
}

export async function saveWish(data: WishData & { customSlug?: string }): Promise<{ id: string; creatorToken: string }> {
    await ensureDb();

    // Generate a short 6-character random ID
    const id = crypto.randomBytes(3).toString('hex');
    const creatorToken = crypto.randomBytes(32).toString('hex');
    const customSlug = data.customSlug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') || null;

    // Remove customSlug from data before storing (it's in a separate column)
    const { customSlug: _removed, ...wishData } = data;

    try {
        await sql`
            INSERT INTO wishes (id, data, custom_slug, creator_token)
            VALUES (${id}, ${JSON.stringify(wishData)}::jsonb, ${customSlug}, ${creatorToken})
        `;
        return { id, creatorToken };
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
            SET opened_at = CURRENT_TIMESTAMP, view_count = view_count + 1
            WHERE id = ${id} AND opened_at IS NULL
        `;

        // Increment view_count for already-opened wishes
        await sql`
            UPDATE wishes SET view_count = view_count + 1
            WHERE id = ${id} AND opened_at IS NOT NULL
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

// Get wish by custom slug
export async function getWishBySlug(slug: string): Promise<{ id: string; data: WishData } | null> {
    await ensureDb();
    try {
        const { rows } = await sql`
            SELECT id, data FROM wishes WHERE custom_slug = ${slug}
        `;
        if (rows.length > 0) {
            // Also trigger the same open + view_count logic
            await getWish(rows[0].id);
            return { id: rows[0].id, data: rows[0].data as WishData };
        }
        return null;
    } catch (error) {
        console.error("Error getting wish by slug:", error);
        return null;
    }
}

// Check slug availability
export async function isSlugAvailable(slug: string): Promise<boolean> {
    await ensureDb();
    try {
        const { rows } = await sql`
            SELECT id FROM wishes WHERE custom_slug = ${slug}
        `;
        return rows.length === 0;
    } catch (error) {
        console.error("Error checking slug:", error);
        return false;
    }
}

// Save analytics event
export async function saveAnalyticsEvent(wishId: string, eventType: string, sectionName?: string, timeSpentMs?: number) {
    try {
        await sql`
            INSERT INTO wish_analytics (wish_id, event_type, section_name, time_spent_ms)
            VALUES (${wishId}, ${eventType}, ${sectionName || null}, ${timeSpentMs || 0})
        `;
    } catch (error) {
        console.error("Error saving analytics:", error);
    }
}

// Get analytics for a wish (creator dashboard)
export async function getWishAnalytics(wishId: string, creatorToken: string) {
    await ensureDb();
    try {
        // Verify creator token
        const { rows: wishRows } = await sql`
            SELECT id, view_count, created_at, opened_at, custom_slug
            FROM wishes WHERE id = ${wishId} AND creator_token = ${creatorToken}
        `;
        if (wishRows.length === 0) return null;

        // Get section analytics
        const { rows: events } = await sql`
            SELECT event_type, section_name, time_spent_ms, created_at
            FROM wish_analytics
            WHERE wish_id = ${wishId}
            ORDER BY created_at ASC
        `;

        // Aggregate section times
        const sectionTimes: Record<string, number> = {};
        let totalTimeMs = 0;
        for (const event of events) {
            if (event.section_name && event.time_spent_ms) {
                sectionTimes[event.section_name] = (sectionTimes[event.section_name] || 0) + event.time_spent_ms;
                totalTimeMs += event.time_spent_ms;
            }
        }

        // Find most loved section
        let mostLovedSection = '';
        let maxTime = 0;
        for (const [section, time] of Object.entries(sectionTimes)) {
            if (time > maxTime) {
                maxTime = time;
                mostLovedSection = section;
            }
        }

        return {
            wishId,
            viewCount: wishRows[0].view_count,
            createdAt: wishRows[0].created_at,
            openedAt: wishRows[0].opened_at,
            customSlug: wishRows[0].custom_slug,
            totalTimeSpent: totalTimeMs,
            sectionTimes,
            mostLovedSection,
            events
        };
    } catch (error) {
        console.error("Error getting analytics:", error);
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
