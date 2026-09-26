import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategory } from "@/lib/categories";
import type { Tool } from "@/lib/tools";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ToolCard({ tool }: { tool: Tool }) {
  const category = getCategory(tool.category);
  const Icon = tool.icon;
  const live = tool.status === "live";

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            category?.accent
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {tool.isNew && <Badge variant="new">New</Badge>}
          {live ? (
            <Badge variant="brand">Free</Badge>
          ) : (
            <Badge variant="soon">Coming soon</Badge>
          )}
        </div>
      </div>

      <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
        {tool.name}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
        {tool.description}
      </p>

      <div className="mt-4 flex items-center justify-between pt-3">
        <span className="text-xs font-medium text-muted-foreground">
          {category?.name}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
          {live ? "Use tool" : "Preview"}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
