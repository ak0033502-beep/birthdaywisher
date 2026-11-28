import "@/lib/netFix";
import { kvGet, kvSet } from "@/lib/analytics";

export type PausePresetId = "kitchen" | "heart" | "party" | "custom";
export type PrimaryEngineMode = "auto" | "gemini" | "groq";

export interface CuppyAdminConfig {
    enabled: boolean;
    allowNoFilter: boolean;
    primaryEngine: PrimaryEngineMode;
    rateLimit10m: 15 | 35 | 60;
    directorNote: string;
    pausePreset: PausePresetId;
    pauseCustomMessage: string;
    updatedAt?: string;
}

export const PAUSE_PRESET_MESSAGES: Record<Exclude<PausePresetId, "custom">, { label: string; text: string }> = {
    kitchen: {
        label: "🧁 Kitchen Baking Vibe (Recommended)",
        text: "🧁 Cuppy is baking fresh birthday cupcakes right now! Meanwhile, tap one of Cuppy's handpicked favourites below ❤️",
    },
    heart: {
        label: "💌 Dil Ki Baat Vibe",
        text: "💌 Little secret from Cuppy: Your own words always hit 10× deeper! Need a quick spark? Tap a handpicked line below 🎈",
    },
    party: {
        label: "🎉 Party Prep Vibe",
        text: "🎉 Cuppy is busy blowing balloons for tonight's surprises! Here are Cuppy's favourite starter lines for you 🎂",
    },
};

export const DEFAULT_CUPPY_CONFIG: CuppyAdminConfig = {
    enabled: true,
    allowNoFilter: true,
    primaryEngine: "auto",
    rateLimit10m: 35,
    directorNote: "",
    pausePreset: "kitchen",
    pauseCustomMessage: "",
};

const BANNED_EMOJI_RE = /[\u2728\u{1F31F}\u2B50\u{1F4AB}\u{1F496}\u{1F320}\u2734\u2747]\uFE0F?/gu;

export function normalizeCuppyConfig(raw?: Partial<CuppyAdminConfig> | null): CuppyAdminConfig {
    if (!raw || typeof raw !== "object") return { ...DEFAULT_CUPPY_CONFIG };
    const rate = Number(raw.rateLimit10m);
    const rateLimit10m: 15 | 35 | 60 = rate === 15 ? 15 : rate === 60 ? 60 : 35;
    const primaryEngine: PrimaryEngineMode =
        raw.primaryEngine === "gemini" || raw.primaryEngine === "groq" ? raw.primaryEngine : "auto";
    const pausePreset: PausePresetId =
        raw.pausePreset === "heart" || raw.pausePreset === "party" || raw.pausePreset === "custom"
            ? raw.pausePreset
            : "kitchen";
    return {
        enabled: raw.enabled !== false,
        allowNoFilter: raw.allowNoFilter !== false,
        primaryEngine,
        rateLimit10m,
        directorNote: typeof raw.directorNote === "string"
            ? raw.directorNote.replace(BANNED_EMOJI_RE, "").trim().slice(0, 220)
            : "",
        pausePreset,
        pauseCustomMessage: typeof raw.pauseCustomMessage === "string"
            ? raw.pauseCustomMessage.replace(BANNED_EMOJI_RE, "").trim().slice(0, 220)
            : "",
        updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
    };
}

export function resolvePauseMessage(cfg: CuppyAdminConfig): string {
    if (cfg.pausePreset === "custom" && cfg.pauseCustomMessage.trim()) {
        return cfg.pauseCustomMessage.trim();
    }
    const key = cfg.pausePreset === "custom" ? "kitchen" : cfg.pausePreset;
    return PAUSE_PRESET_MESSAGES[key].text;
}

const g = globalThis as unknown as {
    __bwCuppyCfg?: { value: CuppyAdminConfig; expiresAt: number };
};

const CONFIG_TTL_MS = 5 * 60 * 1000;

/**
 * Reads Cuppy config with a 5-minute RAM cache so normal `/api/cuppy` traffic
 * triggers ~0 Neon DB queries while still picking up Admin switchboard changes promptly.
 */
export async function getCuppyConfig(forceFresh = false): Promise<CuppyAdminConfig> {
    const now = Date.now();
    if (!forceFresh && g.__bwCuppyCfg && g.__bwCuppyCfg.expiresAt > now) {
        return g.__bwCuppyCfg.value;
    }
    try {
        const row = await Promise.race([
            kvGet<Partial<CuppyAdminConfig>>("cuppy_config"),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 1800)),
        ]);
        const cfg = normalizeCuppyConfig(row?.v ?? null);
        g.__bwCuppyCfg = { value: cfg, expiresAt: now + CONFIG_TTL_MS };
        return cfg;
    } catch {
        const fallback = g.__bwCuppyCfg?.value ?? { ...DEFAULT_CUPPY_CONFIG };
        g.__bwCuppyCfg = { value: fallback, expiresAt: now + 60_000 };
        return fallback;
    }
}

export async function saveCuppyConfig(patch: Partial<CuppyAdminConfig>): Promise<CuppyAdminConfig> {
    const current = await getCuppyConfig(true);
    const merged = normalizeCuppyConfig({
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
    });
    await kvSet("cuppy_config", merged);
    g.__bwCuppyCfg = { value: merged, expiresAt: Date.now() + CONFIG_TTL_MS };
    return merged;
}
