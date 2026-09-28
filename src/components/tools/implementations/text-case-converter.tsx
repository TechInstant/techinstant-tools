"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolPanel, CopyButton } from "@/components/tools/tool-ui";

/** Words kept lowercase in title case unless they open or close the title. */
const MINOR = new Set([
  "a", "an", "the", "and", "but", "or", "nor", "for", "so", "yet",
  "at", "by", "in", "of", "on", "to", "up", "via", "as", "per", "vs",
]);

const words = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const CASES: { id: string; label: string; fn: (s: string) => string }[] = [
  { id: "sentence", label: "Sentence case", fn: (s) =>
      s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase()) },
  { id: "title", label: "Title Case", fn: (s) => {
      const w = s.toLowerCase().split(/(\s+)/);
      const lastIndex = w.map((x, i) => (x.trim() ? i : -1)).filter((i) => i >= 0).pop();
      return w
        .map((part, i) => {
          if (!part.trim()) return part;
          const first = w.findIndex((x) => x.trim());
          const keepLower = MINOR.has(part.replace(/[^a-z]/g, "")) && i !== first && i !== lastIndex;
          return keepLower ? part : part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join("");
    } },
  { id: "upper", label: "UPPERCASE", fn: (s) => s.toUpperCase() },
  { id: "lower", label: "lowercase", fn: (s) => s.toLowerCase() },
  { id: "camel", label: "camelCase", fn: (s) =>
      words(s).map((w, i) =>
        i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join("") },
  { id: "pascal", label: "PascalCase", fn: (s) =>
      words(s).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("") },
  { id: "snake", label: "snake_case", fn: (s) => words(s).map((w) => w.toLowerCase()).join("_") },
  { id: "kebab", label: "kebab-case", fn: (s) => words(s).map((w) => w.toLowerCase()).join("-") },
  { id: "constant", label: "CONSTANT_CASE", fn: (s) => words(s).map((w) => w.toUpperCase()).join("_") },
  { id: "alternate", label: "aLtErNaTiNg", fn: (s) =>
      [...s].map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join("") },
];

export default function TextCaseConverter() {
  const [text, setText] = useState("");

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="tc-in" className="text-sm font-medium text-foreground">
            Your text
          </label>
          {text && (
            <Button variant="ghost" size="sm" onClick={() => setText("")}>
              Clear
            </Button>
          )}
        </div>
        <Textarea
          id="tc-in"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text — every case below updates as you go."
          className="min-h-32"
        />
      </ToolPanel>

      {text.trim() && (
        <div className="space-y-2">
          {CASES.map((c) => {
            const out = c.fn(text);
            return (
              <ToolPanel key={c.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="w-36 shrink-0 text-sm font-semibold text-foreground">
                  {c.label}
                </span>
                <span className="min-w-0 flex-1 break-words font-mono text-[13px] text-muted-foreground">
                  {out.length > 220 ? `${out.slice(0, 220)}…` : out}
                </span>
                <CopyButton value={out} label="" className="shrink-0 px-2.5" />
              </ToolPanel>
            );
          })}
        </div>
      )}

      {!text.trim() && (
        <p className="text-sm text-muted-foreground">
          Type something above to see it in every case at once.
        </p>
      )}
    </div>
  );
}
