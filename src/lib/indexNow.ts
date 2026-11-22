import { SITEMAP_PAGES } from "@/app/sitemap";
import { SITE_URL } from "@/lib/site";

export const INDEXNOW_KEY = "b7d9e41a82c04f6b93e5d10728a4c9f1";

export interface IndexNowResult {
    ok: boolean;
    status: number;
    submittedCount: number;
    message: string;
}

/**
 * Submits all public sitemap URLs + AI markdown endpoints (/llms.txt, /llms-full.txt)
 * to IndexNow (which syndicates directly to Bing -> ChatGPT Search, Copilot, DuckDuckGo AI, Yandex, Naver, Seznam).
 */
export async function submitAllToIndexNow(): Promise<IndexNowResult> {
    const host = new URL(SITE_URL).host; // www.birthdaywisher.fun
    const urlList = [
        ...SITEMAP_PAGES.map((p) => `${SITE_URL}${p.path || "/"}`),
        `${SITE_URL}/llms.txt`,
        `${SITE_URL}/llms-full.txt`,
    ];

    const payload = {
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
    };

    const res = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
    });

    if (res.status === 200 || res.status === 202) {
        return {
            ok: true,
            status: res.status,
            submittedCount: urlList.length,
            message: `Submitted ${urlList.length} URLs to IndexNow (Bing / ChatGPT / Copilot) — HTTP ${res.status}`,
        };
    }

    const errText = await res.text().catch(() => "");
    return {
        ok: false,
        status: res.status,
        submittedCount: 0,
        message: `IndexNow returned HTTP ${res.status}${errText ? `: ${errText.slice(0, 120)}` : ""}`,
    };
}
