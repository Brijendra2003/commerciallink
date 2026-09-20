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

// Uploaded listing photos are served from the project's public Storage bucket.
const supabaseHost = (() => {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    return { protocol: url.protocol.replace(":", "") as "http" | "https", hostname: url.hostname, port: url.port };
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // The seeded demo catalogue.
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...(supabaseHost
        ? [{ ...supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
      // Listing photography and video posters.
      {
        protocol: "https" as const,
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    // Listing submissions carry photos. The browser downsizes each image
    // before sending (see lib/image-compress.ts) and caps the total at 20 MB,
    // so this leaves headroom for multipart overhead.
    serverActions: { bodySizeLimit: "24mb" },
    // /admin routes pass through proxy.ts, which buffers bodies up to this.
    proxyClientMaxBodySize: "24mb",
  },

  // Don't advertise the framework version.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
