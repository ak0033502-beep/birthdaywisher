"use client";

import { useState } from "react";
import { useWishContext } from "@/lib/WishContext";
import { languages, Locale } from "@/lib/i18n";
import { Globe, Check } from "lucide-react";
import { useSiteLanguage } from "@/lib/SiteLanguageContext";
import { getSiteTranslations } from "@/lib/siteTranslations";

export function StepLanguage() {
    const { wishData, updateWishData } = useWishContext();
    const { lang: siteLang, setLang: setSiteLang } = useSiteLanguage();
    const s = getSiteTranslations(siteLang);
    const [selected, setSelected] = useState<Locale>((wishData.language as Locale) || siteLang || "en");

    const handleSelect = (code: Locale) => {
        setSelected(code);
        updateWishData({ language: code });
        setSiteLang(code); // Also update site language
    };

    // Group: English first, then Indian languages, then international
    const indianCodes = ["hi", "bn", "te", "mr", "ta", "gu", "kn", "ml", "od", "pa", "ur"];
    const indian = languages.filter(l => indianCodes.includes(l.code));
    const international = languages.filter(l => ["es", "fr"].includes(l.code));
    const english = languages.filter(l => l.code === "en");

    return (
        <div className="flex flex-col gap-6">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
                    <Globe className="inline w-8 h-8 mr-2 align-middle" />
                    {s.chooseLang}
                </h2>
                <p className="text-foreground/60 text-lg">
                    {s.chooseLangSub}
                </p>
            </div>

            <div className="max-w-2xl mx-auto w-full space-y-6">
                {/* English */}
                <div className="grid grid-cols-1 gap-2">
                    {english.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${selected === lang.code
                                ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                                }`}
                        >
                            <span className="text-2xl">{lang.flag}</span>
                            <div className="text-left flex-1">
                                <p className="font-bold">{lang.name}</p>
                                <p className="text-xs text-foreground/40">{lang.nativeName}</p>
                            </div>
                            {selected === lang.code && <Check className="w-5 h-5 text-primary" />}
                        </button>
                    ))}
                </div>

                {/* Indian Languages */}
                <div>
                    <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest mb-3">🇮🇳 Indian Languages</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {indian.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${selected === lang.code
                                    ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                    }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">{lang.nativeName}</p>
                                    <p className="text-[10px] text-foreground/40">{lang.name}</p>
                                </div>
                                {selected === lang.code && <Check className="w-4 h-4 text-primary shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* International */}
                <div>
                    <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest mb-3">🌎 International</p>
                    <div className="grid grid-cols-2 gap-2">
                        {international.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${selected === lang.code
                                    ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                    }`}
                            >
                                <span className="text-xl">{lang.flag}</span>
                                <div className="text-left flex-1">
                                    <p className="font-bold text-sm">{lang.nativeName}</p>
                                    <p className="text-[10px] text-foreground/40">{lang.name}</p>
                                </div>
                                {selected === lang.code && <Check className="w-4 h-4 text-primary shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
