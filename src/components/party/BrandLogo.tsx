/** Custom BirthdayWisher brand icon (matches the site favicon & app icon). */
export function BrandMark({ size = 32 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 512 512"
            fill="none"
            aria-hidden="true"
            style={{ flexShrink: 0, display: "block", borderRadius: Math.round(size * 0.24), boxShadow: "0 4px 12px rgba(255, 92, 138, 0.28)" }}
        >
            <defs>
                <linearGradient id="bwm-bg" x1="40" y1="24" x2="472" y2="488" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FF5C8A" />
                    <stop offset="52%" stopColor="#FF7A59" />
                    <stop offset="100%" stopColor="#FF9F43" />
                </linearGradient>
                <linearGradient id="bwm-top" x1="140" y1="220" x2="372" y2="310" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFFDF9" />
                    <stop offset="100%" stopColor="#FFE8F0" />
                </linearGradient>
                <linearGradient id="bwm-bot" x1="104" y1="300" x2="408" y2="420" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#7C5CFF" />
                    <stop offset="100%" stopColor="#5B3DF5" />
                </linearGradient>
                <linearGradient id="bwm-fl" x1="256" y1="68" x2="256" y2="146" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFF6B3" />
                    <stop offset="45%" stopColor="#FFD93D" />
                    <stop offset="100%" stopColor="#FF6B2B" />
                </linearGradient>
            </defs>
            <rect width="512" height="512" rx="124" fill="url(#bwm-bg)" />
            <rect x="172" y="148" width="28" height="78" rx="10" fill="#2ED8B6" />
            <path d="M186 88 C170 112, 171 134, 186 142 C201 134, 202 112, 186 88 Z" fill="url(#bwm-fl)" />
            <rect x="242" y="132" width="28" height="94" rx="10" fill="#FFD93D" />
            <path d="M256 66 C238 94, 239 118, 256 127 C273 118, 274 94, 256 66 Z" fill="url(#bwm-fl)" />
            <rect x="312" y="148" width="28" height="78" rx="10" fill="#7C5CFF" />
            <path d="M326 88 C310 112, 311 134, 326 142 C341 134, 342 112, 326 88 Z" fill="url(#bwm-fl)" />
            <rect x="136" y="216" width="240" height="96" rx="26" fill="url(#bwm-top)" />
            <path d="M136 242 C156 262, 176 262, 196 242 C216 262, 236 262, 256 242 C276 262, 296 262, 316 242 C336 262, 356 262, 376 242 L376 236 C376 225, 367 216, 356 216 L156 216 C145 216, 136 225, 136 236 Z" fill="#FF3E78" />
            <rect x="104" y="300" width="304" height="114" rx="30" fill="url(#bwm-bot)" />
            <path d="M104 330 C104 313, 117 300, 134 300 L378 300 C395 300, 408 313, 408 330 L408 338 C392 338, 388 358, 372 358 C356 358, 352 334, 336 334 C320 334, 316 364, 298 364 C280 364, 276 336, 256 336 C236 336, 232 362, 214 362 C196 362, 192 334, 176 334 C160 334, 156 356, 140 356 C124 356, 120 338, 104 338 Z" fill="#FFFDF9" />
            <circle cx="156" cy="382" r="10" fill="#FFD93D" />
            <circle cx="256" cy="382" r="11" fill="#FFD93D" />
            <circle cx="356" cy="382" r="10" fill="#FFD93D" />
            <rect x="82" y="408" width="348" height="24" rx="12" fill="#FFFDF9" />
        </svg>
    );
}
