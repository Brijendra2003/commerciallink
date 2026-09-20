import type { MetadataRoute } from "next";
import { getPublishedProperties } from "@/lib/data/queries";
import { MICRO_MARKET_NAMES, PROPERTY_TYPES } from "@/lib/data/taxonomy";
import { site } from "@/lib/data/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: "daily", priority: 1, lastModified: now },
    { url: `${site.url}/properties`, changeFrequency: "daily", priority: 0.9, lastModified: now },
    { url: `${site.url}/list-your-property`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${site.url}/post-requirement`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${site.url}/about`, changeFrequency: "monthly", priority: 0.6, lastModified: now },
    { url: `${site.url}/contact`, changeFrequency: "monthly", priority: 0.6, lastModified: now },
    { url: `${site.url}/privacy`, changeFrequency: "yearly", priority: 0.2, lastModified: now },
    { url: `${site.url}/terms`, changeFrequency: "yearly", priority: 0.2, lastModified: now },
  ];

  // Static routes still ship if the database is unreachable when this renders.
  const published = await getPublishedProperties().catch((error) => {
    console.error("[sitemap] listings unavailable", error);
    return [];
  });

  const listings: MetadataRoute.Sitemap = published.map((p) => ({
    url: `${site.url}/properties/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Long-tail "type in micro-market" combinations — the organic lead engine described
  // in Section 8. Filters live in the URL specifically so these are indexable.
  const landingPages: MetadataRoute.Sitemap = PROPERTY_TYPES.flatMap((type) =>
    MICRO_MARKET_NAMES.map((market) => ({
      url: `${site.url}/properties?type=${type.value}&market=${encodeURIComponent(market)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  );

  return [...staticRoutes, ...listings, ...landingPages];
}
