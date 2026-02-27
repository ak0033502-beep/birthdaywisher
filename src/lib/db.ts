import fs from 'fs/promises';
import path from 'path';
import { WishData } from '@/lib/WishContext';
import crypto from 'crypto';

// Path to our local JSON database for dev storage
const DATA_FILE = path.join(process.cwd(), 'data', 'wishes.json');

// Initialize the data file if it doesn't exist
async function ensureDb() {
    try {
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
        try {
            await fs.access(DATA_FILE);
        } catch {
            await fs.writeFile(DATA_FILE, JSON.stringify({}));
        }
    } catch (error) {
        console.error("Error setting up DB:", error);
    }
}

export async function saveWish(data: WishData): Promise<string> {
    await ensureDb();

    // Generate a short 6-character random ID
    const id = crypto.randomBytes(3).toString('hex');

    try {
        const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
        const db = JSON.parse(fileContent);

        db[id] = {
            ...data,
            createdAt: new Date().toISOString()
        };

        await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2));
        return id;
    } catch (error) {
        console.error("Error saving wish:", error);
        throw new Error("Failed to save wish");
    }
}

export async function getWish(id: string): Promise<WishData | null> {
    await ensureDb();
    try {
        const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
        const db = JSON.parse(fileContent);
        return db[id] || null;
    } catch (error) {
        console.error("Error getting wish:", error);
        return null;
    }
}
