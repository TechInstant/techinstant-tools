"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, CornerDownLeft } from "lucide-react";
import { searchTools } from "@/lib/tools";
import { getCategory } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { cn } from "@/lib/utils";

/**
 * Global tool search (§20). Opens with the header button or Ctrl/⌘-K, is fully
 * keyboard driven (arrows + Enter + Escape) and searches name, tags, category
 * and description via the shared registry.
 */
export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(open);

  const results = useMemo(() => searchTools(query).slice(0, 8), [query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (results.length ? (i + 1) % results.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) =>
          results.length ? (i - 1 + results.length) % results.length : 0
        );
      } else if (e.key === "Enter" && results[active]) {
        e.preventDefault();
        router.push(`/tools/${results[active].slug}`);
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, active, router, onOpenChange]);

  /* Keep the highlighted row in view while arrowing through. */
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-16 sm:px-4 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Search tools"
    >
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 cursor-default bg-foreground/25 backdrop-blur-sm dark:bg-black/60"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-2.5 border-b border-border px-3 sm:px-4">
          <Search className="h-5 w-5 shrink-0 text-brand" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a tool…"
            aria-label="Search for a tool"
            className="h-14 w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close search"
            className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              No tools match “{query}”. Try “pdf”, “image”, “json” or “qr”.
            </p>
          ) : (
            results.map((tool, i) => {
              const category = getCategory(tool.category);
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  data-index={i}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    router.push(`/tools/${tool.slug}`);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    i === active ? "bg-muted" : "hover:bg-muted/60"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      category?.accent
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-semibold text-foreground">
                        {tool.name}
                      </span>
                      <Badge variant="neutral">{category?.name}</Badge>
                      {tool.status === "soon" && (
                        <Badge variant="soon">Coming soon</Badge>
                      )}
                    </span>
                    <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
                      {tool.description}
                    </span>
                  </span>
                  {i === active && (
                    <CornerDownLeft className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
