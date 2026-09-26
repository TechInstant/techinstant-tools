"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { ToolCard } from "@/components/tools/tool-card";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import { TOOLS, searchTools } from "@/lib/tools";
import { cn } from "@/lib/utils";

type Sort = "popular" | "new" | "az";

const SORTS: { value: Sort; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "new", label: "New" },
  { value: "az", label: "A–Z" },
];

export function ToolsDirectory({
  initialCategory,
}: {
  initialCategory?: CategoryId;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">(
    initialCategory ?? "all"
  );
  const [sort, setSort] = useState<Sort>("popular");

  const results = useMemo(() => {
    const pool =
      category === "all" ? TOOLS : TOOLS.filter((t) => t.category === category);

    /* When there's a query the ranking from searchTools is what matters, so we
       only apply the sort to unfiltered browsing. */
    if (query.trim()) return searchTools(query, pool);

    const sorted = [...pool];
    if (sort === "az") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "new") sorted.sort((a, b) => b.addedAt - a.addedAt);
    else
      sorted.sort(
        (a, b) => Number(!!b.popular) - Number(!!a.popular) || a.addedAt - b.addedAt
      );
    return sorted;
  }, [query, category, sort]);

  return (
    <div>
      {/* search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools by name, tag or category…"
          aria-label="Search tools"
          className="h-12 w-full rounded-xl border border-border bg-card pl-12 pr-11 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* filters */}
      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <FilterChip
            active={category === "all"}
            onClick={() => setCategory("all")}
          >
            All
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              active={category === c.id}
              onClick={() => setCategory(c.id)}
            >
              {c.name}
            </FilterChip>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort</span>
          <div className="flex rounded-lg border border-border bg-muted p-0.5">
            {SORTS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSort(s.value)}
                aria-pressed={sort === s.value}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  sort === s.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-5 text-sm text-muted-foreground" aria-live="polite">
        {results.length} {results.length === 1 ? "tool" : "tools"}
      </p>

      {results.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="font-medium text-foreground">No tools match that search.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a broader word like “pdf”, “image”, “json” or “calculator”.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand/40 bg-brand/10 text-brand"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
