"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import {
  ToolPanel,
  Field,
  CopyButton,
  DownloadButton,
} from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

type Preset = "open" | "standard" | "staging" | "custom";

interface Rule {
  id: number;
  agent: string;
  /** "disallow" | "allow" */
  kind: string;
  path: string;
}

let nextId = 1;
const rule = (agent: string, kind: string, path: string): Rule => ({
  id: nextId++,
  agent,
  kind,
  path,
});

/* Paths almost nobody wants indexed, offered as one-click additions. */
const COMMON_BLOCKS = [
  { path: "/admin/", label: "Admin area" },
  { path: "/cart/", label: "Cart" },
  { path: "/checkout/", label: "Checkout" },
  { path: "/search", label: "Search results" },
  { path: "/*?*", label: "Any URL with a query string" },
  { path: "/api/", label: "API endpoints" },
  { path: "/tmp/", label: "Temporary files" },
  { path: "/*.pdf$", label: "PDF files" },
];

/* The well-known AI training crawlers, so blocking them is a deliberate choice
   rather than something you have to go and look up. */
const AI_AGENTS = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "CCBot",
  "PerplexityBot",
  "Bytespider",
  "meta-externalagent",
];

const PRESETS: Record<Exclude<Preset, "custom">, Rule[]> = {
  open: [rule("*", "disallow", "")],
  standard: [
    rule("*", "disallow", "/admin/"),
    rule("*", "disallow", "/cart/"),
    rule("*", "disallow", "/checkout/"),
    rule("*", "disallow", "/search"),
  ],
  staging: [rule("*", "disallow", "/")],
};

export default function RobotsTxtGenerator() {
  const [preset, setPreset] = useState<Preset>("standard");
  const [rules, setRules] = useState<Rule[]>(() =>
    PRESETS.standard.map((r) => ({ ...r, id: nextId++ }))
  );
  const [sitemap, setSitemap] = useState("");
  const [crawlDelay, setCrawlDelay] = useState("");
  const [blockAi, setBlockAi] = useState(false);

  const applyPreset = (next: Preset) => {
    setPreset(next);
    if (next !== "custom") {
      setRules(PRESETS[next].map((r) => ({ ...r, id: nextId++ })));
    }
  };

  const touch = () => setPreset("custom");

  const output = useMemo(() => {
    const lines: string[] = [];

    /* Rules have to be grouped under their user-agent — a stray User-agent line
       between two Disallows silently starts a new group. */
    const groups = new Map<string, Rule[]>();
    for (const r of rules) {
      const agent = r.agent.trim() || "*";
      if (!groups.has(agent)) groups.set(agent, []);
      groups.get(agent)!.push(r);
    }

    for (const [agent, group] of groups) {
      lines.push(`User-agent: ${agent}`);
      for (const r of group) {
        const directive = r.kind === "allow" ? "Allow" : "Disallow";
        lines.push(`${directive}: ${r.path.trim()}`);
      }
      const delay = Number(crawlDelay);
      if (Number.isFinite(delay) && delay > 0) {
        lines.push(`Crawl-delay: ${delay}`);
      }
      lines.push("");
    }

    if (blockAi) {
      lines.push("# Opt out of AI training crawlers");
      for (const agent of AI_AGENTS) {
        lines.push(`User-agent: ${agent}`);
        lines.push("Disallow: /");
        lines.push("");
      }
    }

    if (sitemap.trim()) {
      for (const url of sitemap.split(/[\s,]+/).filter(Boolean)) {
        lines.push(`Sitemap: ${url}`);
      }
    }

    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  }, [rules, sitemap, crawlDelay, blockAi]);

  const blocksEverything = useMemo(
    () =>
      rules.some(
        (r) => r.kind === "disallow" && r.path.trim() === "/" && r.agent.trim() === "*"
      ),
    [rules]
  );

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <Field label="Start from" htmlFor="rb-preset">
          <Select
            id="rb-preset"
            value={preset}
            onChange={(e) => applyPreset(e.target.value as Preset)}
          >
            <option value="open">Allow everything</option>
            <option value="standard">Typical site — block admin, cart, search</option>
            <option value="staging">Block everything (staging site)</option>
            <option value="custom">Custom</option>
          </Select>
        </Field>

        {blocksEverything && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground">
                This blocks your whole site from search engines.
              </strong>{" "}
              Right for a staging server, catastrophic on a live one. If you only
              want a page kept out of results, use a{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">noindex</code>{" "}
              meta tag instead — a blocked page can still be listed if others link
              to it, because the crawler is not allowed in to read the noindex.
            </p>
          </div>
        )}
      </ToolPanel>

      <ToolPanel className="space-y-3">
        <h2 className="text-base font-bold tracking-tight text-foreground">Rules</h2>

        <div className="hidden gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_8rem_1fr_2.5rem]">
          <span>User-agent</span>
          <span>Directive</span>
          <span>Path</span>
          <span />
        </div>

        {rules.map((r) => (
          <div
            key={r.id}
            className="grid gap-2 sm:grid-cols-[1fr_8rem_1fr_2.5rem] sm:items-center"
          >
            <Input
              value={r.agent}
              onChange={(e) => {
                touch();
                setRules((x) =>
                  x.map((i) => (i.id === r.id ? { ...i, agent: e.target.value } : i))
                );
              }}
              placeholder="*"
              aria-label="User agent"
              spellCheck={false}
            />
            <Select
              value={r.kind}
              onChange={(e) => {
                touch();
                setRules((x) =>
                  x.map((i) => (i.id === r.id ? { ...i, kind: e.target.value } : i))
                );
              }}
              aria-label="Directive"
            >
              <option value="disallow">Disallow</option>
              <option value="allow">Allow</option>
            </Select>
            <Input
              value={r.path}
              onChange={(e) => {
                touch();
                setRules((x) =>
                  x.map((i) => (i.id === r.id ? { ...i, path: e.target.value } : i))
                );
              }}
              placeholder="/private/"
              aria-label="Path"
              spellCheck={false}
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove rule"
              disabled={rules.length === 1}
              onClick={() => {
                touch();
                setRules((x) => x.filter((i) => i.id !== r.id));
              }}
            >
              <Trash2 />
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={() => {
            touch();
            setRules((x) => [...x, rule("*", "disallow", "")]);
          }}
        >
          <Plus />
          Add rule
        </Button>

        <div>
          <p className="text-xs font-medium text-muted-foreground">Common blocks:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMMON_BLOCKS.map((b) => {
              const already = rules.some((r) => r.path.trim() === b.path);
              return (
                <button
                  key={b.path}
                  type="button"
                  disabled={already}
                  onClick={() => {
                    touch();
                    setRules((x) => [...x, rule("*", "disallow", b.path)]);
                  }}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors",
                    already
                      ? "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-60"
                      : "border-border bg-background-subtle text-foreground hover:border-brand hover:text-brand"
                  )}
                >
                  {already ? null : <Plus className="h-3.5 w-3.5" />}
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
      </ToolPanel>

      <ToolPanel className="space-y-4">
        <Field
          label="Sitemap URL"
          htmlFor="rb-sitemap"
          hint="Full URL, including https://. Separate several with a space or a comma."
        >
          <Input
            id="rb-sitemap"
            value={sitemap}
            onChange={(e) => setSitemap(e.target.value)}
            placeholder="https://example.com/sitemap.xml"
            spellCheck={false}
          />
        </Field>

        <Field
          label="Crawl delay (seconds)"
          htmlFor="rb-delay"
          hint="Google ignores this. Bing and Yandex honour it. Leave blank unless a crawler is overloading your server."
        >
          <Input
            id="rb-delay"
            type="number"
            inputMode="numeric"
            value={crawlDelay}
            onChange={(e) => setCrawlDelay(e.target.value)}
            placeholder="10"
          />
        </Field>

        <label
          htmlFor="rb-ai"
          className="flex min-h-11 cursor-pointer items-start gap-3 text-sm"
        >
          <input
            id="rb-ai"
            type="checkbox"
            checked={blockAi}
            onChange={(e) => setBlockAi(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border accent-[var(--color-brand-solid,#05a85a)]"
          />
          <span>
            <span className="block font-medium text-foreground">
              Opt out of AI training crawlers
            </span>
            <span className="block text-xs leading-relaxed text-muted-foreground">
              Adds blocks for {AI_AGENTS.slice(0, 3).join(", ")} and{" "}
              {AI_AGENTS.length - 3} others. This is a request, not a barrier —
              well-behaved crawlers respect it, and it does not affect your normal
              search ranking.
            </span>
          </span>
        </label>
      </ToolPanel>

      <ToolPanel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold tracking-tight text-foreground">
            robots.txt
          </h2>
          <div className="flex gap-2">
            <CopyButton value={output} />
            <DownloadButton value={output} filename="robots.txt" mime="text/plain" />
          </div>
        </div>

        <pre className="mt-3 max-h-96 overflow-auto whitespace-pre rounded-lg bg-background-subtle p-4 font-mono text-sm text-foreground">
          {output}
        </pre>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Save this as <code className="rounded bg-muted px-1 py-0.5">robots.txt</code>{" "}
          at the very root of your domain —{" "}
          <code className="rounded bg-muted px-1 py-0.5">example.com/robots.txt</code>.
          It will not work in a subfolder, and each subdomain needs its own.
          robots.txt is a public file that anyone can read, so never use it to
          point at anything you want kept private.
        </p>
      </ToolPanel>
    </div>
  );
}
