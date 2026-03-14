"use client";

import Link from "next/link";
import { Heart, Gift } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full border-t border-white/10 glass-panel mt-12 py-12 px-6">
            <div className="container max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 text-sm">
                <div>
                    <Link href="/" className="flex items-center gap-2 group mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                            <Gift className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            Birthday<span className="text-gradient">Wisher</span>
                        </span>
                    </Link>
                    <p className="text-foreground/60">The ultimate aesthetic birthday & anniversary wisher tool. Create interactive, emotional, and unforgettable web-based greeting cards & wedding anniversary wishes for couple online for free.</p>
                </div>
                <div>
                    <h4 className="font-bold mb-4 text-white">Popular Nav</h4>
                    <ul className="space-y-2 text-foreground/60">
                        <li><Link href="/create" className="hover:text-primary transition-colors">Create Birthday Wish</Link></li>
                        <li><Link href="/create?type=anniversary" className="hover:text-amber-500 transition-colors">Create Anniversary Wish</Link></li>
                        <li><Link href="/blog" className="hover:text-primary transition-colors">Birthday Wish Ideas (Blog)</Link></li>
                        <li><Link href="/blog/wedding-anniversary-wishes-for-couple" className="hover:text-primary transition-colors">Anniversary Wishes for Couple</Link></li>
                        <li><Link href="/anniversary" className="hover:text-amber-500 transition-colors">Anniversary Hub</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4 text-white">Legal & Trust</h4>
                    <ul className="space-y-2 text-foreground/60">
                        <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                        <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                        <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4 text-white">Use Cases</h4>
                    <ul className="space-y-2 text-foreground/60">
                        <li><Link href="/use-cases/unique-birthday-gift-online" className="hover:text-primary transition-colors">Unique Birthday Gift Online</Link></li>
                        <li><Link href="/use-cases/digital-story-greeting-card" className="hover:text-primary transition-colors">Digital Story Greeting Card</Link></li>
                        <li><Link href="/use-cases/boyfriend-birthday-surprise" className="hover:text-primary transition-colors">Boyfriend Birthday Surprise</Link></li>
                        <li><Link href="/use-cases/girlfriend-birthday-surprise" className="hover:text-primary transition-colors">Girlfriend Birthday Surprise</Link></li>
                        <li><Link href="/use-cases/anniversary-wishes-for-couple" className="hover:text-primary transition-colors">Anniversary Wishes for Couple</Link></li>
                    </ul>
                </div>
            </div>
            <div className="text-center pt-8 border-t border-white/10 text-foreground/40 text-sm flex flex-col gap-2">
                <p>© {new Date().getFullYear()} birthdaywisher.fun. Crafted with <Heart className="w-4 h-4 inline text-red-500 mx-1" /> to make birthdays special.</p>
                <p className="font-medium text-foreground/50">Property of Akalloverservices | Contact: <a href="mailto:akalloverservices@gmail.com" className="hover:text-primary transition-colors">akalloverservices@gmail.com</a></p>
            </div>
        </footer>
    );
}
