"use client";

import { useWishContext } from "@/lib/WishContext";
import { useStepTitle } from "@/lib/useStepTitle";
import { HeartHandshake, Lightbulb } from "lucide-react";

const birthdayExamples = [
    "Happy Birthday! I just wanted to say that you mean the world to me...",
    "Here's to another year of making incredible memories together...",
];

const anniversaryExamples = [
    "Happy Anniversary, my love. Every year with you feels like a beautiful dream I never want to wake up from. You've shown me what unconditional love truly means — patient, warm, and endlessly kind. I fall in love with you a little more each day, and I can't wait to see what the next chapter holds for us.",
    "To the one who makes my heart skip a beat, even after all these years — Happy Anniversary. From our first nervous hello to building a life together, every moment with you has been worth it. You're my best friend, my partner, and my forever person.",
    "Another year of laughing at the same jokes, stealing each other's food, and loving each other through it all. Happy Anniversary to the person who makes every single day brighter just by being in it.",
];

export function Step15CoreMessage() {
    const { wishData, updateWishData } = useWishContext();
    const title = useStepTitle("Step15CoreMessage");
    const isAnniversary = wishData.wishType === "anniversary";
    const examples = isAnniversary ? anniversaryExamples : birthdayExamples;

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{title}</h2>
                <p className="text-foreground/60 text-lg">
                    {isAnniversary
                        ? "This is the main anniversary message. Pour your heart out."
                        : "This is it. The main paragraph. Pour your heart out (or roast them some more)."}
                    <br /><span className="text-sm font-medium text-primary mt-2 block">This unlocks AFTER they solve the puzzle!</span>
                </p>
            </div>

            <div className="space-y-6 mt-4">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4 text-primary" /> {isAnniversary ? "Your Anniversary Message" : "The Core Message"}
                    </label>
                    <textarea
                        value={wishData.coreMessage}
                        onChange={(e) => updateWishData({ coreMessage: e.target.value })}
                        placeholder={isAnniversary
                            ? "Happy Anniversary! Every year with you is a blessing..."
                            : "Happy Birthday! I just wanted to say that..."}
                        rows={8}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20 resize-none text-lg selection:bg-primary/30"
                    />
                    <div className="flex justify-between text-xs text-foreground/50">
                        <span>Make it count!</span>
                        <span>{wishData.coreMessage.length} chars</span>
                    </div>
                </div>

                {/* Example Messages */}
                <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                    <label className="text-xs font-medium text-foreground/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Lightbulb className="w-3 h-3" /> Example Messages — Click to use
                    </label>
                    <div className="flex flex-col gap-3 mt-2">
                        {examples.map((msg, i) => (
                            <button
                                key={i}
                                onClick={() => updateWishData({ coreMessage: msg })}
                                className="text-left text-sm text-foreground/60 hover:text-white px-3 py-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 line-clamp-3"
                            >
                                &quot;{msg.slice(0, 120)}...&quot;
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
