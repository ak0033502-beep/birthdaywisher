"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Gift, Globe, Check } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { languages } from "@/lib/i18n";
import { useSiteLanguage } from "@/lib/SiteLanguageContext";
import { getSiteTranslations } from "@/lib/siteTranslations";

export function Navbar() {
    const [langOpen, setLangOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { lang, setLang } = useSiteLanguage();
    const s = getSiteTranslations(lang);

    const currentLang = languages.find(l => l.code === lang);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setLangOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3 sm:py-4 backdrop-blur-md bg-background/50 border-b border-white/5"
        >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.3)] group-hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all">
                        <Gift className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg sm:text-xl font-bold tracking-tight">
                        Birthday<span className="text-gradient">Wisher</span>
                    </span>
                </Link>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
                    <Link href="/anniversary" className="hover:text-amber-500 transition-colors">{s.anniversary}</Link>
                    <Link href="/blog" className="hover:text-primary transition-colors">{s.blog}</Link>
                    <Link href="/about" className="hover:text-primary transition-colors">{s.about}</Link>
                </nav>
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Language Selector */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setLangOpen(!langOpen)}
                            className="flex items-center gap-1.5 px-2.5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm"
                            title="Select Language"
                        >
                            <Globe className="w-4 h-4 text-foreground/60" />
                            <span className="hidden sm:inline text-xs font-medium text-foreground/60">{currentLang?.nativeName || "EN"}</span>
                        </button>

                        {langOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="absolute right-0 top-full mt-2 w-56 max-h-80 overflow-y-auto custom-scrollbar bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 z-[100]"
                            >
                                {languages.map(l => (
                                    <button
                                        key={l.code}
                                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all text-sm ${lang === l.code
                                                ? "bg-primary/15 text-primary"
                                                : "hover:bg-white/5 text-foreground/70"
                                            }`}
                                    >
                                        <span className="text-base">{l.flag}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-xs">{l.nativeName}</p>
                                            <p className="text-[10px] opacity-50">{l.name}</p>
                                        </div>
                                        {lang === l.code && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    <ThemeToggle />
                    <Link href="/create" className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:scale-105 transition-transform">
                        {s.createWish}
                    </Link>
                </div>
            </div>
        </motion.header>
    );
}
