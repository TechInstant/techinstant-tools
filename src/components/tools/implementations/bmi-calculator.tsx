"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ToolPanel, Field, ErrorNote } from "@/components/tools/tool-ui";
import { HealthNotice } from "@/components/tools/health-notice";
import { cn } from "@/lib/utils";

type Units = "metric" | "imperial";

/** WHO adult categories. Boundaries are the standard cut-offs. */
const BANDS = [
  { max: 18.5, label: "Underweight", tone: "text-sky-600 dark:text-sky-400" },
  { max: 25, label: "Healthy weight", tone: "text-brand" },
  { max: 30, label: "Overweight", tone: "text-amber-600 dark:text-amber-400" },
  { max: Infinity, label: "Obese", tone: "text-red-600 dark:text-red-400" },
];

export default function BmiCalculator() {
  const [units, setUnits] = useState<Units>("metric");
  const [cm, setCm] = useState("");
  const [kg, setKg] = useState("");
  const [ft, setFt] = useState("");
  const [inches, setInches] = useState("");
  const [lb, setLb] = useState("");

  const result = useMemo(() => {
    let metres = 0;
    let kilos = 0;

    if (units === "metric") {
      metres = Number(cm) / 100;
      kilos = Number(kg);
    } else {
      const totalInches = Number(ft) * 12 + (Number(inches) || 0);
      metres = totalInches * 0.0254;
      kilos = Number(lb) * 0.45359237;
    }

    if (!metres || !kilos || !Number.isFinite(metres) || !Number.isFinite(kilos)) {
      return null;
    }
    if (metres < 0.6 || metres > 2.5) {
      return { error: "Please check the height — that value looks out of range." };
    }
    if (kilos < 10 || kilos > 400) {
      return { error: "Please check the weight — that value looks out of range." };
    }

    const bmi = kilos / (metres * metres);
    const band = BANDS.find((b) => bmi < b.max)!;

    /* The weight range that would put this height in the healthy band. */
    const lower = 18.5 * metres * metres;
    const upper = 24.9 * metres * metres;
    const toKg = (v: number) =>
      units === "metric" ? `${v.toFixed(1)} kg` : `${(v / 0.45359237).toFixed(0)} lb`;

    return {
      bmi,
      band,
      healthyRange: `${toKg(lower)} – ${toKg(upper)}`,
      /* Position on a 15–40 scale for the meter. */
      pct: Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100)),
    };
  }, [units, cm, kg, ft, inches, lb]);

  const hasError = result != null && "error" in result;

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <div className="flex rounded-lg border border-border bg-muted p-0.5">
          {(["metric", "imperial"] as Units[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnits(u)}
              aria-pressed={units === u}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-semibold capitalize transition-colors",
                units === u
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {u === "metric" ? "Metric (cm / kg)" : "Imperial (ft / lb)"}
            </button>
          ))}
        </div>

        {units === "metric" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Height (cm)" htmlFor="bmi-cm">
              <Input
                id="bmi-cm"
                type="number"
                inputMode="decimal"
                value={cm}
                onChange={(e) => setCm(e.target.value)}
                placeholder="170"
              />
            </Field>
            <Field label="Weight (kg)" htmlFor="bmi-kg">
              <Input
                id="bmi-kg"
                type="number"
                inputMode="decimal"
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                placeholder="65"
              />
            </Field>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Height (ft)" htmlFor="bmi-ft">
              <Input
                id="bmi-ft"
                type="number"
                inputMode="numeric"
                value={ft}
                onChange={(e) => setFt(e.target.value)}
                placeholder="5"
              />
            </Field>
            <Field label="Height (in)" htmlFor="bmi-in">
              <Input
                id="bmi-in"
                type="number"
                inputMode="numeric"
                value={inches}
                onChange={(e) => setInches(e.target.value)}
                placeholder="7"
              />
            </Field>
            <Field label="Weight (lb)" htmlFor="bmi-lb">
              <Input
                id="bmi-lb"
                type="number"
                inputMode="decimal"
                value={lb}
                onChange={(e) => setLb(e.target.value)}
                placeholder="145"
              />
            </Field>
          </div>
        )}
      </ToolPanel>

      {hasError && <ErrorNote>{(result as { error: string }).error}</ErrorNote>}

      {result && !("error" in result) && (
        <ToolPanel>
          <p className="text-sm font-medium text-muted-foreground">Your BMI</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-3">
            <span className="text-4xl font-extrabold tabular-nums text-foreground">
              {result.bmi.toFixed(1)}
            </span>
            <span className={cn("text-lg font-bold", result.band.tone)}>
              {result.band.label}
            </span>
          </p>

          <div className="relative mt-5 h-2.5 overflow-hidden rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-[55%] to-red-400">
            <div
              className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-foreground shadow"
              style={{ left: `${result.pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
            <span>15</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>40</span>
          </div>

          <p className="mt-5 rounded-lg bg-background-subtle p-3 text-sm text-muted-foreground">
            A BMI in the healthy range for your height corresponds to roughly{" "}
            <span className="font-semibold text-foreground">{result.healthyRange}</span>.
          </p>

          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            BMI compares weight to height and nothing else. It does not know the
            difference between muscle and fat, and it is not a good guide during
            pregnancy, for children, for athletes, or for older adults.
          </p>
        </ToolPanel>
      )}

      <HealthNotice />
    </div>
  );
}
