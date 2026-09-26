import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, getCategoryBySlug } from "@/lib/categories";
import { toolsByCategory } from "@/lib/tools";
import { ToolCard } from "@/components/tools/tool-card";
import { cn } from "@/lib/utils";

type Params = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  const count = toolsByCategory(category.id).length;
  const title = category.name;
  const description = `${category.description} ${count} free ${category.name.toLowerCase()} that run in your browser.`;

  return {
    title,
    description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: { title, description, url: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const tools = toolsByCategory(category.id);
  const Icon = category.icon;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-8 flex items-start gap-4">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            category.accent
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {category.name}
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            {category.description} {tools.length}{" "}
            {tools.length === 1 ? "tool" : "tools"}.
          </p>
        </div>
      </header>

      {tools.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="font-semibold text-foreground">
            No {category.name.toLowerCase()} yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            This category is on the build list. In the meantime, browse the{" "}
            <Link href="/tools" className="font-medium text-brand hover:underline">
              full tool directory
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
