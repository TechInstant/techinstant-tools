"use client";

import { useMemo, useState } from "react";
import { Check, Printer, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  sections,
  printTitle,
}: {
  sections: ChecklistSection[];
  printTitle: string;
}) {
  const [done, setDone] = useState<Set<string>>(new Set());

  const total = useMemo(
    () => sections.reduce((n, s) => n + s.items.length, 0),
    [sections]
  );
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

      {sections.map((section) => (
        <ToolPanel key={section.title}>
          <h2 className="text-base font-bold tracking-tight text-foreground">
            {section.title}
          </h2>
          {section.intro && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {section.intro}
            </p>
          )}

          <ul className="mt-4 space-y-1.5">
            {section.items.map((item) => {
              const key = `${section.title}::${item.label}`;
              const checked = done.has(key);
              return (
                <li key={key}>
                  <label
                    className={cn(
                      "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-colors",
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
                </li>
              );
            })}
          </ul>
        </ToolPanel>
      ))}
    </div>
  );
}
