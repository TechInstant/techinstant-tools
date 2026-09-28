"use client";

import { useMemo, useState } from "react";
import { Input, Select } from "@/components/ui/input";
import { ToolPanel, Field, ErrorNote, Stat } from "@/components/tools/tool-ui";
import { HealthNotice } from "@/components/tools/health-notice";
import { cn } from "@/lib/utils";

type Units = "metric" | "imperial";
type Sex = "female" | "male";

/**
 * Mifflin–St Jeor, which is the equation most dietitians use for BMR because it
 * tracks measured resting expenditure more closely than Harris–Benedict does.
 *
 *   male:   10w + 6.25h − 5a + 5
 *   female: 10w + 6.25h − 5a − 161
 *
 * The equation only has two sex terms, so it cannot represent everyone. That is
 * a limitation of the science available, and the tool says so rather than
 * pretending the number is more personal than it is.
 */
const bmr = (sex: Sex, kg: number, cm: number, age: number) =>
  10 * kg + 6.25 * cm - 5 * age + (sex === "male" ? 5 : -161);

const ACTIVITY = [
  { id: "1.2", label: "Sedentary — desk job, little exercise" },
  { id: "1.375", label: "Lightly active — 1–3 days a week" },
  { id: "1.55", label: "Moderately active — 3–5 days a week" },
  { id: "1.725", label: "Very active — 6–7 days a week" },
  { id: "1.9", label: "Extremely active — physical job or twice daily" },
];

const GOALS = [
  { id: "lose-0.5", label: "Lose 0.5 kg a week", delta: -550 },
  { id: "lose-0.25", label: "Lose 0.25 kg a week", delta: -275 },
  { id: "maintain", label: "Maintain weight", delta: 0 },
  { id: "gain-0.25", label: "Gain 0.25 kg a week", delta: 275 },
  { id: "gain-0.5", label: "Gain 0.5 kg a week", delta: 550 },
];

export default function CalorieCalculator() {
  const [units, setUnits] = useState<Units>("metric");
  const [sex, setSex] = useState<Sex>("female");
  const [age, setAge] = useState("");
  const [cm, setCm] = useState("");
  const [kg, setKg] = useState("");
  const [ft, setFt] = useState("");
  const [inches, setInches] = useState("");
  const [lb, setLb] = useState("");
  const [activity, setActivity] = useState("1.375");

  const result = useMemo(() => {
    const years = Number(age);
    const centimetres =
      units === "metric"
        ? Number(cm)
        : (Number(ft) * 12 + (Number(inches) || 0)) * 2.54;
    const kilos = units === "metric" ? Number(kg) : Number(lb) * 0.45359237;

    if (!years || !centimetres || !kilos) return null;
    if (years < 15 || years > 100) {
      return {
        error:
          "This equation is for adults aged 15 to 100. Children and teenagers need different guidance.",
      };
    }
    if (centimetres < 100 || centimetres > 250) {
      return { error: "Please check the height — that value looks out of range." };
    }
    if (kilos < 25 || kilos > 300) {
      return { error: "Please check the weight — that value looks out of range." };
    }

    const resting = bmr(sex, kilos, centimetres, years);
    const multiplier = Number(activity);
    const maintain = resting * multiplier;

    return {
      resting,
      maintain,
      goals: GOALS.map((g) => ({
        ...g,
        calories: maintain + g.delta,
        /* Flag a target that drops below the usual safe floor. */
        tooLow: maintain + g.delta < (sex === "male" ? 1500 : 1200),
      })),
      /* A common macro split, shown as grams for the maintenance figure. */
      macros: [
        { label: "Protein", pct: 30, kcalPerG: 4 },
        { label: "Carbohydrate", pct: 40, kcalPerG: 4 },
        { label: "Fat", pct: 30, kcalPerG: 9 },
      ].map((m) => ({
        ...m,
        grams: Math.round((maintain * (m.pct / 100)) / m.kcalPerG),
      })),
    };
  }, [units, sex, age, cm, kg, ft, inches, lb, activity]);

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
              {u === "metric" ? "Metric (cm / kg)" : "Imperial (ft / lb)"}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Age" htmlFor="cal-age">
            <Input
              id="cal-age"
              type="number"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="30"
            />
          </Field>
          <Field
            label="Sex"
            htmlFor="cal-sex"
            hint="The equation only offers these two terms."
          >
            <Select id="cal-sex" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </Select>
          </Field>
        </div>

        {units === "metric" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Height (cm)" htmlFor="cal-cm">
              <Input
                id="cal-cm"
                type="number"
                inputMode="decimal"
                value={cm}
                onChange={(e) => setCm(e.target.value)}
                placeholder="170"
              />
            </Field>
            <Field label="Weight (kg)" htmlFor="cal-kg">
              <Input
                id="cal-kg"
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
            <Field label="Height (ft)" htmlFor="cal-ft">
              <Input
                id="cal-ft"
                type="number"
                inputMode="numeric"
                value={ft}
                onChange={(e) => setFt(e.target.value)}
                placeholder="5"
              />
            </Field>
            <Field label="Height (in)" htmlFor="cal-in">
              <Input
                id="cal-in"
                type="number"
                inputMode="numeric"
                value={inches}
                onChange={(e) => setInches(e.target.value)}
                placeholder="7"
              />
            </Field>
            <Field label="Weight (lb)" htmlFor="cal-lb">
              <Input
                id="cal-lb"
                type="number"
                inputMode="decimal"
                value={lb}
                onChange={(e) => setLb(e.target.value)}
                placeholder="145"
              />
            </Field>
          </div>
        )}

        <Field label="Activity level" htmlFor="cal-act">
          <Select
            id="cal-act"
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
      </ToolPanel>

      {hasError && <ErrorNote>{(result as { error: string }).error}</ErrorNote>}

      {result && !("error" in result) && (
        <>
          <ToolPanel>
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat
                label="BMR — resting, at complete rest"
                value={`${Math.round(result.resting).toLocaleString()} kcal`}
              />
              <Stat
                label="TDEE — total daily burn"
                value={`${Math.round(result.maintain).toLocaleString()} kcal`}
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              BMR is what your body uses keeping you alive with no movement at
              all. TDEE is that figure scaled for how much you move, and it is
              the number to eat to if you want to stay where you are.
            </p>
          </ToolPanel>

          <ToolPanel>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Daily calories by goal
            </h2>
            <ul className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
              {result.goals.map((g) => (
                <li
                  key={g.id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-2 px-4 py-3",
                    g.id === "maintain" ? "bg-brand/5" : "bg-background-subtle"
                  )}
                >
                  <span className="text-sm text-foreground">{g.label}</span>
                  <span className="flex items-center gap-2">
                    {g.tooLow && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        below a safe floor
                      </span>
                    )}
                    <span
                      className={cn(
                        "font-bold tabular-nums",
                        g.id === "maintain" ? "text-brand" : "text-foreground"
                      )}
                    >
                      {Math.round(g.calories).toLocaleString()} kcal
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Roughly 7,700 kcal is a kilogram of body weight, which is where the
              weekly figures come from. Cutting harder than half a kilogram a
              week usually costs muscle and rarely lasts.
            </p>
          </ToolPanel>

          <ToolPanel>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              An example split at maintenance
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {result.macros.map((m) => (
                <Stat
                  key={m.label}
                  label={`${m.label} — ${m.pct}%`}
                  value={`${m.grams} g`}
                />
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              One common split of many. There is no single correct ratio, and
              total calories matter far more than how you divide them.
            </p>
          </ToolPanel>
        </>
      )}

      <HealthNotice extra="These equations are averages and can be out by 10% or more for any individual — metabolism, medication and medical conditions all shift it. Do not use them to set a low-calorie diet without proper advice, and never for a child or during pregnancy." />
    </div>
  );
}
