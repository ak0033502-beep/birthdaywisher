"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale } from "@/lib/i18n";

interface SiteLanguageContextType {
    lang: Locale;
    setLang: (lang: Locale) => void;
}

const SiteLanguageContext = createContext<SiteLanguageContextType>({
    lang: "en",
    setLang: () => { },
});

export function SiteLanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Locale>("en");

    useEffect(() => {
        try {
            const saved = localStorage.getItem("bw_site_lang");
            if (saved) setLangState(saved as Locale);
        } catch { /* ignore */ }
    }, []);

    const setLang = (newLang: Locale) => {
        setLangState(newLang);
        try { localStorage.setItem("bw_site_lang", newLang); } catch { /* ignore */ }
    };

    return (
        <SiteLanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </SiteLanguageContext.Provider>
    );
}

export function useSiteLanguage() {
    return useContext(SiteLanguageContext);
}
