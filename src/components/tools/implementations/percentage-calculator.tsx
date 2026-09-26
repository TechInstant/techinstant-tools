"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ToolPanel, Field } from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

type Mode = "of" | "isWhat" | "change";

const MODES: { id: Mode; label: string }[] = [
  { id: "of", label: "What is X% of Y?" },
  { id: "isWhat", label: "X is what % of Y?" },
  { id: "change", label: "Increase / decrease" },
];

const format = (n: number) =>
  Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 4 })
    : "—";

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const x = parseFloat(a);
  const y = parseFloat(b);
  const ready = Number.isFinite(x) && Number.isFinite(y);

  let result: string | null = null;
  let explanation = "";

  if (ready) {
    if (mode === "of") {
      result = format((x / 100) * y);
      explanation = `${format(x)}% of ${format(y)}`;
    } else if (mode === "isWhat") {
      if (y === 0) {
        result = null;
        explanation = "Cannot divide by zero — the second value must not be 0.";
      } else {
        result = `${format((x / y) * 100)}%`;
        explanation = `${format(x)} out of ${format(y)}`;
      }
    } else {
      if (x === 0) {
        result = null;
        explanation = "The starting value must not be 0.";
      } else {
        const diff = ((y - x) / Math.abs(x)) * 100;
        result = `${diff >= 0 ? "+" : ""}${format(diff)}%`;
        explanation = `${format(x)} → ${format(y)} is ${
          diff >= 0 ? "an increase" : "a decrease"
        } of ${format(Math.abs(diff))}%`;
      }
    }
  }

  const labels: Record<Mode, [string, string]> = {
    of: ["Percentage (X)", "Of value (Y)"],
    isWhat: ["Value (X)", "Out of (Y)"],
    change: ["From", "To"],
  };

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                mode === m.id
                  ? "border-brand/40 bg-brand/10 text-brand"
                  : "border-border bg-background-subtle text-muted-foreground hover:text-foreground"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={labels[mode][0]} htmlFor="pc-a">
            <Input
              id="pc-a"
              type="number"
              inputMode="decimal"
              value={a}
              onChange={(e) => setA(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label={labels[mode][1]} htmlFor="pc-b">
            <Input
              id="pc-b"
              type="number"
              inputMode="decimal"
              value={b}
              onChange={(e) => setB(e.target.value)}
              placeholder="0"
            />
          </Field>
        </div>
      </ToolPanel>

      <ToolPanel>
        <div className="text-sm font-medium text-muted-foreground">Result</div>
        <div className="mt-1 text-3xl font-extrabold tabular-nums text-foreground">
          {result ?? "—"}
        </div>
        {explanation && (
          <p className="mt-2 text-sm text-muted-foreground">{explanation}</p>
        )}
        {!ready && (
          <p className="mt-2 text-sm text-muted-foreground">
            Enter both values to see the answer.
          </p>
        )}
      </ToolPanel>
    </div>
  );
}
