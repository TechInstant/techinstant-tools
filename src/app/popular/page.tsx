import type { Metadata } from "next";
import { ToolCard } from "@/components/tools/tool-card";
import { popularTools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Popular Tools",
  description:
    "The most used free tools on TechInstant Tools — PDF compression, image compression, QR codes, JSON formatting and more.",
  alternates: { canonical: "/popular" },
};

export default function PopularPage() {
  const tools = popularTools();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Popular tools
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          The tools people reach for most often.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
