"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X, Heart, BookOpen, Users, HelpCircle } from "lucide-react";

export function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
                    >
                        <nav className="container max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
                            <MobileLink href="/anniversary" icon={<Heart className="w-4 h-4 text-amber-500" />} label="Anniversary" onClick={() => setIsOpen(false)} />
                            <MobileLink href="/blog" icon={<BookOpen className="w-4 h-4 text-primary" />} label="Blog" onClick={() => setIsOpen(false)} />
                            <MobileLink href="/about" icon={<Users className="w-4 h-4 text-secondary" />} label="About" onClick={() => setIsOpen(false)} />
                            <MobileLink href="/faq" icon={<HelpCircle className="w-4 h-4 text-accent" />} label="FAQ" onClick={() => setIsOpen(false)} />
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MobileLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-foreground/80 hover:text-white font-medium"
        >
            {icon}
            {label}
        </Link>
    );
}
