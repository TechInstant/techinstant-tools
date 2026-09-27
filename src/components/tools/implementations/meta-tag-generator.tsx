"use client";

import { useMemo, useState } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { ToolPanel, Field, CopyButton } from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

/* Rough truncation points used by Google and the major social cards. */
const TITLE_LIMIT = 60;
const DESC_LIMIT = 155;

const escapeAttr = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function Counter({ value, limit }: { value: string; limit: number }) {
  const n = value.length;
  const over = n > limit;
  return (
    <span
      className={cn(
        "text-xs font-medium tabular-nums",
        over ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
      )}
    >
      {n}/{limit}
      {over && " — may be cut off"}
    </span>
  );
}

export default function MetaTagGenerator() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [siteName, setSiteName] = useState("");

  const tags = useMemo(() => {
    const t = escapeAttr(title.trim());
    const d = escapeAttr(description.trim());
    const u = escapeAttr(url.trim());
    const i = escapeAttr(image.trim());
    const s = escapeAttr(siteName.trim());

    const lines: string[] = [];
    if (t) lines.push(`<title>${t}</title>`);
    if (d) lines.push(`<meta name="description" content="${d}" />`);
    if (u) lines.push(`<link rel="canonical" href="${u}" />`);

    if (t || d || u || i) {
      lines.push("");
      lines.push("<!-- Open Graph -->");
      lines.push(`<meta property="og:type" content="website" />`);
      if (t) lines.push(`<meta property="og:title" content="${t}" />`);
      if (d) lines.push(`<meta property="og:description" content="${d}" />`);
      if (u) lines.push(`<meta property="og:url" content="${u}" />`);
      if (i) lines.push(`<meta property="og:image" content="${i}" />`);
      if (s) lines.push(`<meta property="og:site_name" content="${s}" />`);

      lines.push("");
      lines.push("<!-- X / Twitter -->");
      lines.push(
        `<meta name="twitter:card" content="${i ? "summary_large_image" : "summary"}" />`
      );
      if (t) lines.push(`<meta name="twitter:title" content="${t}" />`);
      if (d) lines.push(`<meta name="twitter:description" content="${d}" />`);
      if (i) lines.push(`<meta name="twitter:image" content="${i}" />`);
    }

    return lines.join("\n");
  }, [title, description, url, image, siteName]);

  const host = (() => {
    try {
      return url ? new URL(url).hostname.replace(/^www\./, "") : "example.com";
    } catch {
      return "example.com";
    }
  })();

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="mt-title" className="text-sm font-medium text-foreground">
              Page title
            </label>
            <Counter value={title} limit={TITLE_LIMIT} />
          </div>
          <Input
            id="mt-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Compress PDF Online Free — TechInstant Tools"
            className="mt-1.5"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="mt-desc" className="text-sm font-medium text-foreground">
              Meta description
            </label>
            <Counter value={description} limit={DESC_LIMIT} />
          </div>
          <Textarea
            id="mt-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A sentence or two that makes someone want to click."
            className="mt-1.5 min-h-24"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Canonical URL" htmlFor="mt-url">
            <Input
              id="mt-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/page"
            />
          </Field>
          <Field label="Site name" htmlFor="mt-site">
            <Input
              id="mt-site"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="TechInstant"
            />
          </Field>
        </div>

        <Field
          label="Share image URL"
          htmlFor="mt-img"
          hint="1200 × 630 works well on every platform."
        >
          <Input
            id="mt-img"
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/og.png"
          />
        </Field>
      </ToolPanel>

      {/* Search result preview */}
      <ToolPanel>
        <h2 className="text-sm font-bold text-foreground">Search result preview</h2>
        <div className="mt-3 rounded-lg border border-border bg-background-subtle p-4">
          <p className="text-xs text-muted-foreground">{host}</p>
          <p className="mt-0.5 truncate text-lg text-blue-700 dark:text-blue-400">
            {title.slice(0, TITLE_LIMIT) || "Your page title appears here"}
            {title.length > TITLE_LIMIT && "…"}
          </p>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">
            {description.slice(0, DESC_LIMIT) ||
              "Your meta description appears here — this is what people read before deciding to click."}
            {description.length > DESC_LIMIT && "…"}
          </p>
        </div>
      </ToolPanel>

      {tags && (
        <ToolPanel className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">
              Paste into your &lt;head&gt;
            </span>
            <CopyButton value={tags} />
          </div>
          <pre className="max-h-96 overflow-auto rounded-lg bg-background-subtle p-3 font-mono text-[13px] leading-relaxed text-foreground">
            {tags}
          </pre>
        </ToolPanel>
      )}
    </div>
  );
}
