import type { MetadataRoute } from "next";
import { site } from "@/lib/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Auth screens carry no indexable content and would dilute crawl budget.
      disallow: ["/login", "/signup"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
