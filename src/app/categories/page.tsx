import type { Metadata } from "next";
import { CategoryCard } from "@/components/tools/category-card";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse TechInstant Tools by category — PDF, image, developer, QR, calculators, student and business utilities.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Categories
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Find the right tool by what you are trying to get done.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
