"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolPanel, Field, Stat, ErrorNote } from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

interface Item {
  id: number;
  name: string;
  score: string;
  weight: string;
}

let nextId = 1;
const blank = (): Item => ({ id: nextId++, name: "", score: "", weight: "" });

export default function GradeCalculator() {
  const [items, setItems] = useState<Item[]>(() => [
    { id: nextId++, name: "Coursework", score: "72", weight: "40" },
    { id: nextId++, name: "Midterm", score: "65", weight: "20" },
  ]);
  const [target, setTarget] = useState("70");

  const result = useMemo(() => {
    let earned = 0;
    let done = 0;

    for (const i of items) {
      const s = Number(i.score);
      const w = Number(i.weight);
      if (!Number.isFinite(s) || !Number.isFinite(w) || w <= 0) continue;
      if (s < 0 || s > 100) return { error: "Scores are percentages, so they must be between 0 and 100." };
      earned += (s / 100) * w;
      done += w;
    }

    if (done === 0) return null;
    if (done > 100) return { error: "Your weights add up to more than 100%. Check the figures." };

    const remaining = 100 - done;
    const current = (earned / done) * 100;
    const t = Number(target);

    /* What the remaining work must average for the final mark to hit target. */
    let needed: number | null = null;
    if (Number.isFinite(t) && remaining > 0) {
      needed = ((t - earned) / remaining) * 100;
    }

    return {
      current,
      earned,
      done,
      remaining,
      needed,
      /* Even full marks on what's left can't reach the target. */
      impossible: needed != null && needed > 100,
      /* Target is already secured even with zero on what's left. */
      secured: Number.isFinite(t) && earned >= t,
    };
  }, [items, target]);

  const hasError = result != null && "error" in result;
  const update = (id: number, patch: Partial<Item>) =>
    setItems((l) => l.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <div className="space-y-2">
          <div className="hidden gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_6rem_6rem_2.5rem]">
            <span>Assessment</span>
            <span>Score %</span>
            <span>Weight %</span>
            <span />
          </div>

          {items.map((i) => (
            <div key={i.id} className="grid gap-2 sm:grid-cols-[1fr_6rem_6rem_2.5rem] sm:items-center">
              <Input
                value={i.name}
                onChange={(e) => update(i.id, { name: e.target.value })}
                placeholder="e.g. Essay 1"
                aria-label="Assessment name"
              />
              <Input
                type="number"
                inputMode="decimal"
                value={i.score}
                onChange={(e) => update(i.id, { score: e.target.value })}
                aria-label="Score percent"
              />
              <Input
                type="number"
                inputMode="decimal"
                value={i.weight}
                onChange={(e) => update(i.id, { weight: e.target.value })}
                aria-label="Weight percent"
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove"
                disabled={items.length === 1}
                onClick={() => setItems((l) => l.filter((x) => x.id !== i.id))}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={() => setItems((l) => [...l, blank()])}>
          <Plus />
          Add assessment
        </Button>

        <Field
          label="Target final grade (%)"
          htmlFor="gc-target"
          hint="What you're aiming for overall."
        >
          <Input
            id="gc-target"
            type="number"
            inputMode="decimal"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="sm:max-w-40"
          />
        </Field>
      </ToolPanel>

      {hasError && <ErrorNote>{(result as { error: string }).error}</ErrorNote>}

      {result && !("error" in result) && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Current average" value={`${result.current.toFixed(1)}%`} />
            <Stat label="Weight completed" value={`${result.done}%`} />
            <Stat label="Weight remaining" value={`${result.remaining}%`} />
            <Stat label="Locked in" value={`${result.earned.toFixed(1)}%`} />
          </div>

          <ToolPanel>
            {result.remaining === 0 ? (
              <>
                <p className="text-sm font-medium text-muted-foreground">Final grade</p>
                <p className="mt-1 text-3xl font-extrabold tabular-nums text-foreground">
                  {result.current.toFixed(1)}%
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  All the weight is accounted for, so this is your final mark.
                </p>
              </>
            ) : result.secured ? (
              <>
                <p className="text-sm font-medium text-muted-foreground">Good news</p>
                <p className="mt-1 text-2xl font-extrabold text-brand">
                  Target already secured
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  You have banked {result.earned.toFixed(1)}% of the final grade, which
                  already meets your {target}% target even if you score zero on the
                  remaining {result.remaining}%.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">
                  To finish on {target}%, the remaining {result.remaining}% must average
                </p>
                <p
                  className={cn(
                    "mt-1 text-4xl font-extrabold tabular-nums",
                    result.impossible ? "text-red-600 dark:text-red-400" : "text-foreground"
                  )}
                >
                  {result.needed!.toFixed(1)}%
                </p>
                {result.impossible ? (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    That is above 100%, so this target is out of reach from here.
                    The best you can now finish on is{" "}
                    {(result.earned + result.remaining).toFixed(1)}%.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Score at least that across everything still to come and you hit
                    your target.
                  </p>
                )}
              </>
            )}
          </ToolPanel>
        </>
      )}

      {!result && (
        <p className="text-sm text-muted-foreground">
          Enter a score and a weight to see where you stand.
        </p>
      )}
    </div>
  );
}
