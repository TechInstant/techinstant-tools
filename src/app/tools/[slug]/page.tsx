import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TOOLS, getTool } from "@/lib/tools";
import { getToolContent } from "@/lib/tool-content";
import { getCategory } from "@/lib/categories";
import { SITE } from "@/lib/site";
import { ToolShell } from "@/components/tools/tool-shell";
import { getToolComponent, ComingSoon } from "@/components/tools/registry";

type Params = { params: Promise<{ slug: string }> };

/** Pre-render every tool page at build time. */
export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};

  const content = getToolContent(tool.slug);
  const title = content.seoTitle ?? `${tool.name} Online Free`;
  const description =
    content.seoDescription ??
    `${tool.description} Free, fast and privacy-conscious — part of ${SITE.name}.`;
  const url = `/tools/${tool.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ToolPage({ params }: Params) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const category = getCategory(tool.category);
  const ToolComponent = getToolComponent(tool.slug);

  /* Structured data so each tool can surface as an application in search. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: category?.name,
    operatingSystem: "Any",
    url: `${SITE.url}/tools/${tool.slug}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: SITE.parent, url: SITE.parentUrl },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Serialising our own static object — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolShell tool={tool}>
        {ToolComponent ? <ToolComponent /> : <ComingSoon name={tool.name} />}
      </ToolShell>
    </>
  );
}
