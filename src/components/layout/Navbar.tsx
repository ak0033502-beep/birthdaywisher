"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Gift } from "lucide-react";

export function Navbar() {
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
                    <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                    <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Link href="/create" className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:scale-105 transition-transform">
                        Create Wish
                    </Link>
                </div>
            </div>
        </motion.header>
    );
}
