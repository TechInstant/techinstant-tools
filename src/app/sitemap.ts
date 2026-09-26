import type { MetadataRoute } from "next";
import { TOOLS } from "@/lib/tools";
import { CATEGORIES } from "@/lib/categories";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/tools", priority: 0.9 },
    { path: "/categories", priority: 0.8 },
    { path: "/popular", priority: 0.7 },
    { path: "/about", priority: 0.5 },
    { path: "/privacy", priority: 0.3 },
  ];

  return [
    ...staticRoutes.map((r) => ({
      url: `${SITE.url}${r.path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: r.priority,
    })),
    ...CATEGORIES.map((c) => ({
      url: `${SITE.url}/categories/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...TOOLS.map((t) => ({
      url: `${SITE.url}/tools/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: t.popular ? 0.8 : 0.6,
    })),
  ];
}
