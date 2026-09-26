"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchTools } from "@/lib/tools";
import { getCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";

const EXAMPLES = ["PDF compressor", "QR generator", "JSON formatter", "Image resizer"];

/**
 * The prominent homepage search box (§8). Results appear inline as you type;
 * Enter opens the first match.
 */
export function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const results = useMemo(
    () => (query.trim() ? searchTools(query).slice(0, 6) : []),
    [query]
  );

  return (
    <div className="mx-auto w-full max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (results[0]) router.push(`/tools/${results[0].slug}`);
        }}
        role="search"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a tool…"
            aria-label="Search for a tool"
            className="h-14 w-full rounded-xl border border-border bg-card pl-12 pr-4 text-base text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>
      </form>

      {results.length > 0 && (
        <div className="mt-2 overflow-hidden rounded-xl border border-border bg-card text-left shadow-lg">
          {results.map((tool) => {
            const category = getCategory(tool.category);
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                    category?.accent
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {tool.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {category?.name}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {!query && (
        <p className="mt-3 text-sm text-muted-foreground">
          Try{" "}
          {EXAMPLES.map((example, i) => (
            <span key={example}>
              <button
                type="button"
                onClick={() => setQuery(example)}
                className="font-medium text-brand hover:underline"
              >
                {example}
              </button>
              {i < EXAMPLES.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
