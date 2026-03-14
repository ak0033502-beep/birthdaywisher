"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Lightweight analytics tracker that monitors which section is visible and how long
// Automatically detects the wish ID from the URL pattern /wish/[id]
export function AnalyticsTracker() {
    const pathname = usePathname();
    const sectionStartTime = useRef<number>(Date.now());
    const currentSection = useRef<string>("intro");

    // Extract wish ID from URL
    const wishId = pathname?.match(/\/wish\/([a-f0-9]+)/)?.[1];

    useEffect(() => {
        if (!wishId) return;

        // Track page view
        fetch("/api/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wishId, eventType: "page_view" }),
        }).catch(() => { });

        // Track section changes by observing DOM mutations
        const observer = new MutationObserver(() => {
            const activeSection = document.querySelector("[data-section]");
            if (activeSection) {
                const sectionName = activeSection.getAttribute("data-section") || "unknown";
                if (sectionName !== currentSection.current) {
                    // Log time spent on previous section
                    const timeSpent = Date.now() - sectionStartTime.current;
                    if (timeSpent > 500) { // Only track if spent > 500ms
                        fetch("/api/analytics", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                wishId,
                                eventType: "section_view",
                                sectionName: currentSection.current,
                                timeSpentMs: timeSpent,
                            }),
                        }).catch(() => { });
                    }
                    currentSection.current = sectionName;
                    sectionStartTime.current = Date.now();
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-section"] });

        // Track final section on unmount
        return () => {
            observer.disconnect();
            const timeSpent = Date.now() - sectionStartTime.current;
            if (timeSpent > 500 && wishId) {
                navigator.sendBeacon(
                    "/api/analytics",
                    JSON.stringify({
                        wishId,
                        eventType: "section_view",
                        sectionName: currentSection.current,
                        timeSpentMs: timeSpent,
                    })
                );
            }
        };
    }, [wishId]);

    return null; // Invisible tracker
}
