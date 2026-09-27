import { TOOLS } from "@/lib/tools";
import { CATEGORIES } from "@/lib/categories";
import { SITE } from "@/lib/site";

/**
 * Publishes the tool registry as JSON so the main TechInstant site can render
 * an always-current directory instead of keeping its own copy of the list.
 *
 * Adding a tool in `lib/tools.ts` therefore updates both sites — no second
 * place to remember, and no drift.
 *
 * Generated at build time and served as a static file. CORS is open because
 * this is public, non-sensitive catalogue data meant to be read cross-origin.
 */
export const dynamic = "force-static";

export function GET() {
  const body = {
    site: SITE.url,
    generatedAt: new Date().toISOString(),
    categories: CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
    })),
    tools: TOOLS.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      category: t.category,
      url: `${SITE.url}/tools/${t.slug}`,
      live: t.status === "live",
      popular: !!t.popular,
      isNew: !!t.isNew,
      tags: t.tags,
    })),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
