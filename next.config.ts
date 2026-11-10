import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // SEO: one canonical host. Permanent (308) redirect from the bare domain to www.
  // (Also set this as a permanent redirect in Vercel → Project → Domains.)
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "birthdaywisher.fun" }],
        destination: "https://www.birthdaywisher.fun/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
