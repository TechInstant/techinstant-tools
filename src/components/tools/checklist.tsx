"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Printer, RotateCcw, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolPanel, CopyButton } from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

export interface ChecklistItem {
  label: string;
  note?: string;
  /** Marks an item that should prompt contacting a professional. */
  urgent?: boolean;
}

export interface ChecklistSection {
  title: string;
  intro?: string;
  items: ChecklistItem[];
}

/**
 * Shared interactive checklist used by the guide-style tools.
 *
 * State is kept in memory only — nothing is written to storage, which matters
 * for the health checklists where the ticks themselves are personal.
 */
export function Checklist({
  sections: baseSections,
  printTitle,
  allowCustom = false,
  customTitle = "Your own items",
  onSelectionChange,
}: {
  sections: ChecklistSection[];
  printTitle: string;
  /** Adds a section people can append their own items to. */
  allowCustom?: boolean;
  customTitle?: string;
  /** Receives the ticked labels, for tools that act on the selection. */
  onSelectionChange?: (labels: string[]) => void;
}) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const sections = useMemo<ChecklistSection[]>(
    () =>
      allowCustom
        ? [...baseSections, { title: customTitle, items: custom.map((label) => ({ label })) }]
        : baseSections,
    [baseSections, allowCustom, customTitle, custom]
  );

  const addCustom = () => {
    const label = draft.trim();
    if (!label) return;
    /* Silently ignoring a duplicate would look broken, so keep the draft. */
    if (custom.some((c) => c.toLowerCase() === label.toLowerCase())) return;
    setCustom((c) => [...c, label]);
    setDraft("");
  };

  const removeCustom = (label: string) => {
    setCustom((c) => c.filter((x) => x !== label));
    setDone((prev) => {
      const next = new Set(prev);
      next.delete(`${customTitle}::${label}`);
      return next;
    });
  };

  const total = useMemo(
    () => sections.reduce((n, s) => n + s.items.length, 0),
    [sections]
  );

  /* Ticked labels in list order, so a consumer gets them the way they read on
     the page rather than in click order. */
  const selected = useMemo(
    () =>
      sections.flatMap((s) =>
        s.items.filter((i) => done.has(`${s.title}::${i.label}`)).map((i) => i.label)
      ),
    [sections, done]
  );

  useEffect(() => {
    onSelectionChange?.(selected);
  }, [selected, onSelectionChange]);
  const completed = done.size;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const toggle = (key: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const asText = useMemo(
    () =>
      [
        printTitle,
        "",
        ...sections.flatMap((s) => [
          s.title.toUpperCase(),
          ...s.items.map(
            (i) => `${done.has(`${s.title}::${i.label}`) ? "[x]" : "[ ]"} ${i.label}`
          ),
          "",
        ]),
      ].join("\n"),
    [sections, done, printTitle]
  );

  return (
    <div className="space-y-4">
      <ToolPanel className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              {completed} of {total} ticked
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
              {pct}%
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand-solid transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <CopyButton value={asText} label="Copy list" />
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer />
            Print
          </Button>
          {completed > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setDone(new Set())}>
              <RotateCcw />
              Reset
            </Button>
          )}
        </div>
      </ToolPanel>

      {sections.map((section) => {
        const isCustom = allowCustom && section.title === customTitle;
        return (
        <ToolPanel key={section.title}>
          <h2 className="text-base font-bold tracking-tight text-foreground">
            {section.title}
          </h2>
          {section.intro && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {section.intro}
            </p>
          )}
          {isCustom && section.items.length === 0 && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Anything this list has missed — add it here and it joins your
              progress, your copied text and your printout.
            </p>
          )}

          <ul className="mt-4 space-y-1.5">
            {section.items.map((item) => {
              const key = `${section.title}::${item.label}`;
              const checked = done.has(key);
              return (
                <li key={key} className={isCustom ? "flex items-center gap-1" : undefined}>
                  <label
                    className={cn(
                      "flex min-h-11 flex-1 cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-colors",
                      checked ? "bg-brand/5" : "hover:bg-muted/60",
                      item.urgent && "border border-amber-500/30 bg-amber-500/5"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                        checked
                          ? "border-brand bg-brand-solid text-brand-solid-foreground"
                          : "border-border bg-card"
                      )}
                    >
                      {checked && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(key)}
                      className="sr-only"
                    />
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block text-sm font-medium",
                          checked
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        )}
                      >
                        {item.label}
                      </span>
                      {item.note && (
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {item.note}
                        </span>
                      )}
                    </span>
                  </label>
                  {isCustom && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${item.label}`}
                      onClick={() => removeCustom(item.label)}
                    >
                      <X />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>

          {isCustom && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="Type an item…"
                aria-label="New checklist item"
              />
              <Button variant="outline" onClick={addCustom} disabled={!draft.trim()}>
                <Plus />
                Add item
              </Button>
            </div>
          )}
        </ToolPanel>
        );
      })}
    </div>
  );
}
