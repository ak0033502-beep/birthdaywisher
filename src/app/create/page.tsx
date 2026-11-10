import { Suspense } from "react";
import { Wizard2 } from "@/components/wizard2/Wizard2";

// Wizard 2.0 (Phase 4). The previous wizard stays available at /create/classic.
// Metadata (title, canonical) comes from ./layout.tsx.
export default function CreatePage() {
    return (
        <Suspense fallback={<div className="party wz2" />}>
            <Wizard2 />
        </Suspense>
    );
}
