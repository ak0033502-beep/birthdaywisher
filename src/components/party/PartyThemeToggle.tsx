"use client";

import { usePartyTheme, type PartyMode } from "./partyTheme";

const OPTIONS: Array<{ mode: PartyMode; icon: string; label: string }> = [
    { mode: "auto", icon: "🕐", label: "Auto" },
    { mode: "day", icon: "☀️", label: "Day" },
    { mode: "night", icon: "🌙", label: "Night" },
];

/** 3-way theme switch: Auto (by local time) / Day Party / Night Party. */
export function PartyThemeToggle() {
    const { mode, setMode } = usePartyTheme();
    return (
        <div className="bw-theme-toggle" role="radiogroup" aria-label="Theme">
            {OPTIONS.map((o) => (
                <button
                    key={o.mode}
                    type="button"
                    role="radio"
                    aria-checked={mode === o.mode}
                    className={mode === o.mode ? "is-on" : ""}
                    onClick={() => setMode(o.mode)}
                    title={o.mode === "auto" ? "Auto: Day Party 6 AM–7 PM, Night Party after" : `${o.label} Party`}
                >
                    {o.icon}<span className="lbl"> {o.label}</span>
                </button>
            ))}
        </div>
    );
}
