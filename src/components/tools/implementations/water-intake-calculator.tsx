"use client";

import { useMemo, useState } from "react";
import { Droplets } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { ToolPanel, Field, ErrorNote, Stat } from "@/components/tools/tool-ui";
import { HealthNotice } from "@/components/tools/health-notice";
import { cn } from "@/lib/utils";

type Units = "metric" | "imperial";

/* Roughly 30–35 ml per kg of body weight is the usual starting point for
   healthy adults. The additions below are the common practical adjustments. */
const BASE_ML_PER_KG = 33;

const ACTIVITY = [
  { id: "sedentary", label: "Mostly sitting", extraMl: 0 },
  { id: "light", label: "Light activity or walking", extraMl: 350 },
  { id: "moderate", label: "Exercise 3–5 times a week", extraMl: 700 },
  { id: "high", label: "Daily training or physical work", extraMl: 1100 },
];

const CLIMATE = [
  { id: "temperate", label: "Temperate", extraMl: 0 },
  { id: "warm", label: "Warm", extraMl: 350 },
  { id: "hot", label: "Hot or humid", extraMl: 700 },
];

export default function WaterIntakeCalculator() {
  const [units, setUnits] = useState<Units>("metric");
  const [kg, setKg] = useState("");
  const [lb, setLb] = useState("");
  const [activity, setActivity] = useState("light");
  const [climate, setClimate] = useState("temperate");
  const [pregnant, setPregnant] = useState<"no" | "pregnant" | "breastfeeding">("no");

  const result = useMemo(() => {
    const kilos = units === "metric" ? Number(kg) : Number(lb) * 0.45359237;
    if (!kilos || !Number.isFinite(kilos)) return null;
    if (kilos < 20 || kilos > 300) {
      return { error: "Please check the weight — that value looks out of range." };
    }

    const base = kilos * BASE_ML_PER_KG;
    const act = ACTIVITY.find((a) => a.id === activity)?.extraMl ?? 0;
    const cli = CLIMATE.find((c) => c.id === climate)?.extraMl ?? 0;
    /* Commonly quoted additions during pregnancy and breastfeeding. */
    const extra = pregnant === "pregnant" ? 300 : pregnant === "breastfeeding" ? 700 : 0;

    const totalMl = base + act + cli + extra;

    return {
      totalMl,
      litres: totalMl / 1000,
      cups: totalMl / 240,
      flOz: totalMl / 29.5735,
      glasses: Math.round(totalMl / 250),
      breakdown: [
        { label: "Body weight", ml: base },
        { label: "Activity", ml: act },
        { label: "Climate", ml: cli },
        ...(extra ? [{ label: pregnant === "pregnant" ? "Pregnancy" : "Breastfeeding", ml: extra }] : []),
      ].filter((r) => r.ml > 0),
    };
  }, [units, kg, lb, activity, climate, pregnant]);

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
                "flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                units === u
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {u === "metric" ? "Metric (kg)" : "Imperial (lb)"}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {units === "metric" ? (
            <Field label="Weight (kg)" htmlFor="wi-kg">
              <Input
                id="wi-kg"
                type="number"
                inputMode="decimal"
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                placeholder="65"
              />
            </Field>
          ) : (
            <Field label="Weight (lb)" htmlFor="wi-lb">
              <Input
                id="wi-lb"
                type="number"
                inputMode="decimal"
                value={lb}
                onChange={(e) => setLb(e.target.value)}
                placeholder="145"
              />
            </Field>
          )}

          <Field label="Activity level" htmlFor="wi-act">
            <Select
              id="wi-act"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            >
              {ACTIVITY.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Climate" htmlFor="wi-cli">
            <Select id="wi-cli" value={climate} onChange={(e) => setClimate(e.target.value)}>
              {CLIMATE.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Pregnant or breastfeeding?" htmlFor="wi-preg">
            <Select
              id="wi-preg"
              value={pregnant}
              onChange={(e) => setPregnant(e.target.value as typeof pregnant)}
            >
              <option value="no">Neither</option>
              <option value="pregnant">Pregnant</option>
              <option value="breastfeeding">Breastfeeding</option>
            </Select>
          </Field>
        </div>
      </ToolPanel>

      {hasError && <ErrorNote>{(result as { error: string }).error}</ErrorNote>}

      {result && !("error" in result) && (
        <ToolPanel>
          <p className="text-sm font-medium text-muted-foreground">
            Suggested daily fluid
          </p>
          <p className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="text-4xl font-extrabold tabular-nums text-foreground">
              {result.litres.toFixed(1)}
            </span>
            <span className="text-lg font-bold text-muted-foreground">litres</span>
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Stat label="Millilitres" value={Math.round(result.totalMl).toLocaleString()} />
            <Stat label="US fluid ounces" value={Math.round(result.flOz).toLocaleString()} />
            <Stat label="Glasses (250 ml)" value={result.glasses} />
          </div>

          <div
            className="mt-5 flex flex-wrap gap-1.5"
            aria-label={`${result.glasses} glasses`}
          >
            {Array.from({ length: Math.min(result.glasses, 20) }, (_, i) => (
              <Droplets key={i} className="h-5 w-5 text-brand" aria-hidden="true" />
            ))}
          </div>

          <div className="mt-5 space-y-1.5 rounded-lg bg-background-subtle p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Where the number comes from
            </p>
            {result.breakdown.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="tabular-nums text-foreground">
                  +{Math.round(row.ml).toLocaleString()} ml
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            This counts all fluid, not just water — tea, coffee, milk and soup
            all contribute, and food accounts for roughly a fifth of most
            people&apos;s intake on top. Thirst and pale straw-coloured urine
            are better day-to-day guides than any calculation.
          </p>
        </ToolPanel>
      )}

      <HealthNotice extra="Kidney and heart conditions, and some medications, can make a fixed fluid target actively unsafe. If you have been given a fluid limit, follow that instead of this." />
    </div>
  );
}
