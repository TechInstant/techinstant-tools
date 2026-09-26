import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/categories";
import { countByCategory } from "@/lib/tools";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CategoryCard({ category }: { category: Category }) {
  const Icon = category.icon;
  const count = countByCategory(category.id);

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          category.accent
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
        {category.name}
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {category.description}
      </p>

      <div className="mt-4 flex items-center justify-between pt-3">
        <span className="text-xs font-medium text-muted-foreground">
          {count === 0 ? "In progress" : `${count} ${count === 1 ? "tool" : "tools"}`}
        </span>
        {/* An empty category has nothing to view yet, so it says so rather than
            offering a link into a blank page. */}
        {count === 0 ? (
          <Badge variant="soon">Coming soon</Badge>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
            View tools
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </Link>
  );
}
