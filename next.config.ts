import type { NextConfig } from "next";

/**
 * Security headers applied to every response.
 *
 * No Content-Security-Policy is set here on purpose: a static CSP that allows
 * `unsafe-inline`/`unsafe-eval` (which Next's inlined bootstrap and the React
 * dev runtime need) buys almost nothing. Doing it properly means a per-request
 * nonce generated in proxy.ts — see the "Content Security Policy" guide in
 * node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    // Six months. Only meaningful over HTTPS, which Vercel terminates for us.
    key: "Strict-Transport-Security",
    value: "max-age=15552000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  images: {
    // Property media stands in for the Cloudinary delivery domain that will
    // serve it in production — add `res.cloudinary.com` alongside this when the
    // media pipeline is wired up.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Don't advertise the framework version.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
