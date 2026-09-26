import Link from "next/link";
import { ArrowRight, Check, LayoutGrid } from "lucide-react";
import { HeroSearch } from "@/components/home/hero-search";
import { ToolCard } from "@/components/tools/tool-card";
import { CategoryCard } from "@/components/tools/category-card";
import { CATEGORIES } from "@/lib/categories";
import { TOOLS, popularTools, newTools } from "@/lib/tools";
import { TRUST_POINTS } from "@/lib/site";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const popular = popularTools().slice(0, 8);
  const recent = newTools().slice(0, 4);

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="border-b border-border bg-background-subtle">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <Badge variant="brand" className="mx-auto">
            Free Tools • Simple Solutions
          </Badge>

          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Tools that make your work easier.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Fast, simple and useful online tools for students, developers,
            creators, businesses and everyday tasks.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/tools" className={buttonVariants({ size: "lg" })}>
              Explore Tools
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/categories"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <LayoutGrid className="h-4 w-4" />
              Browse Categories
            </Link>
          </div>

          <div className="mt-10">
            <HeroSearch />
          </div>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {TRUST_POINTS.map((point) => (
              <li
                key={point}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <Check className="h-4 w-4 text-brand" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------ categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Browse by category
            </h2>
            <p className="mt-2 text-muted-foreground">
              Every tool, grouped by what you are trying to get done.
            </p>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            All categories
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- popular */}
      <section className="border-t border-border bg-background-subtle">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Popular tools
              </h2>
              <p className="mt-2 text-muted-foreground">
                The ones people reach for most.
              </p>
            </div>
            <Link
              href="/tools"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
            >
              All {TOOLS.length} tools
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- new tools */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            New tools
          </h2>
          <p className="mt-2 text-muted-foreground">Recently added.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
