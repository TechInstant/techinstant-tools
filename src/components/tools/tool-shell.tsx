import Link from "next/link";
import { ChevronRight, ShieldCheck, Upload, Cog, Download } from "lucide-react";
import { getCategory } from "@/lib/categories";
import { type Tool, toolsByCategory } from "@/lib/tools";
import { getToolContent } from "@/lib/tool-content";
import { LOCAL_PROCESSING_NOTE } from "@/lib/site";
import { ToolCard } from "@/components/tools/tool-card";
import { ShareRow } from "@/components/tools/share-row";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: "01", label: "Choose", Icon: Upload },
  { n: "02", label: "Process", Icon: Cog },
  { n: "03", label: "Download", Icon: Download },
];

/**
 * The shared layout every tool page uses (§16): breadcrumb, header, the tool
 * itself, then how-it-works, privacy, explanatory content, FAQ and related
 * tools. Individual tools only supply their interactive part.
 */
export function ToolShell({
  tool,
  children,
}: {
  tool: Tool;
  children: React.ReactNode;
}) {
  const category = getCategory(tool.category);
  const Icon = tool.icon;
  const content = getToolContent(tool.slug);
  const related = toolsByCategory(tool.category)
    .filter((t) => t.id !== tool.id)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <li>
            <Link
              href={`/categories/${category?.slug}`}
              className="hover:text-foreground"
            >
              {category?.name}
            </Link>
          </li>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <li className="font-medium text-foreground">{tool.name}</li>
        </ol>
      </nav>

      <header className="mt-6 flex items-start gap-4">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            category?.accent
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {tool.name}
          </h1>
          <p className="mt-1.5 text-muted-foreground">{tool.description}</p>
        </div>
      </header>

      {/* the interactive tool */}
      <div className="mt-8">{children}</div>

      {/* how it works */}
      <section className="mt-12">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          How it works
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {STEPS.map(({ n, label, Icon: StepIcon }) => (
            <li
              key={n}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <StepIcon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-xs font-semibold text-muted-foreground">
                  {n}
                </span>
                <span className="block text-sm font-semibold text-foreground">
                  {label}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* privacy — only claimed where it is actually true (§19) */}
      {tool.localProcessing && (
        <section className="mt-8 flex items-start gap-3 rounded-xl border border-brand/25 bg-brand/5 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div>
            <h2 className="text-sm font-bold text-foreground">Your privacy</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {LOCAL_PROCESSING_NOTE}
            </p>
          </div>
        </section>
      )}

      {/* explanatory content (§24) */}
      {content.about && content.about.length > 0 && (
        <section className="mt-12 space-y-6">
          {content.about.map((block) => (
            <div key={block.heading}>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {block.heading}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {block.body}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* FAQ */}
      {content.faq && content.faq.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
            {content.faq.map((item) => (
              <details key={item.q} className="group p-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground marker:content-none">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* share — on every tool, so nobody has to copy the URL by hand */}
      <section className="mt-12">
        <ShareRow title={tool.name} text={tool.description} />
      </section>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Related tools
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
