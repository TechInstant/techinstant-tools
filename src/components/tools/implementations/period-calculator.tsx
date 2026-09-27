"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ToolPanel, Field, ErrorNote } from "@/components/tools/tool-ui";
import { HealthNotice } from "@/components/tools/health-notice";
import {
  fromInputValue,
  todayValue,
  addDays,
  daysBetween,
  formatLong,
  relativeDays,
} from "@/lib/date";

/** Typical ranges used to sanity-check the inputs rather than reject silently. */
const CYCLE_MIN = 20;
const CYCLE_MAX = 45;

export default function PeriodCalculator() {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [periodLength, setPeriodLength] = useState("5");
  const [today, setToday] = useState("");

  /* Resolved after mount so server and client HTML agree. */
  useEffect(() => setToday(todayValue()), []);

  const result = useMemo(() => {
    const start = fromInputValue(lastPeriod);
    const now = fromInputValue(today);
    const cycle = Number(cycleLength);
    const bleed = Number(periodLength);

    if (!start || !now) return null;
    if (!Number.isFinite(cycle) || cycle < CYCLE_MIN || cycle > CYCLE_MAX) {
      return { error: `Cycle length is usually between ${CYCLE_MIN} and ${CYCLE_MAX} days.` };
    }
    if (!Number.isFinite(bleed) || bleed < 1 || bleed > 14) {
      return { error: "Period length is usually between 1 and 14 days." };
    }
    if (daysBetween(start, now) < 0) {
      return { error: "That start date is in the future." };
    }

    /* Roll forward from the last known start until we're at or past today, so
       the answer stays useful even if the last entry was months ago. */
    let periodStart = start;
    while (daysBetween(periodStart, now) >= cycle) {
      periodStart = addDays(periodStart, cycle);
    }

    const upcoming = Array.from({ length: 3 }, (_, i) => {
      const s = addDays(periodStart, cycle * (i + 1));
      return { start: s, end: addDays(s, bleed - 1) };
    });

    /* Ovulation is roughly 14 days before the NEXT period, and the fertile
       window is the five days before it plus the day itself. */
    const nextStart = upcoming[0].start;
    const ovulation = addDays(nextStart, -14);
    const fertileFrom = addDays(ovulation, -5);
    const fertileTo = ovulation;

    const currentEnd = addDays(periodStart, bleed - 1);
    const onPeriodNow =
      daysBetween(periodStart, now) >= 0 && daysBetween(now, currentEnd) >= 0;

    return {
      cycleDay: daysBetween(periodStart, now) + 1,
      onPeriodNow,
      currentEnd,
      upcoming,
      ovulation,
      fertileFrom,
      fertileTo,
      daysToNext: daysBetween(now, nextStart),
    };
  }, [lastPeriod, cycleLength, periodLength, today]);

  const hasError = result != null && "error" in result;

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="First day of last period" htmlFor="pc-last">
            <Input
              id="pc-last"
              type="date"
              value={lastPeriod}
              max={today || undefined}
              onChange={(e) => setLastPeriod(e.target.value)}
            />
          </Field>
          <Field label="Cycle length (days)" htmlFor="pc-cycle" hint="28 is typical">
            <Input
              id="pc-cycle"
              type="number"
              inputMode="numeric"
              min={CYCLE_MIN}
              max={CYCLE_MAX}
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
            />
          </Field>
          <Field label="Period length (days)" htmlFor="pc-len" hint="How long bleeding lasts">
            <Input
              id="pc-len"
              type="number"
              inputMode="numeric"
              min={1}
              max={14}
              value={periodLength}
              onChange={(e) => setPeriodLength(e.target.value)}
            />
          </Field>
        </div>

        {!lastPeriod && (
          <p className="text-sm text-muted-foreground">
            Enter the first day of your last period to see the estimates.
          </p>
        )}
      </ToolPanel>

      {hasError && <ErrorNote>{(result as { error: string }).error}</ErrorNote>}

      {result && !("error" in result) && (
        <>
          <ToolPanel>
            <p className="text-sm font-medium text-muted-foreground">Right now</p>
            <p className="mt-1 text-2xl font-extrabold text-foreground">
              {result.onPeriodNow
                ? `Day ${result.cycleDay} — period expected until ${formatLong(result.currentEnd)}`
                : `Day ${result.cycleDay} of your cycle`}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Next period {relativeDays(result.daysToNext)}.
            </p>
          </ToolPanel>

          <div className="grid gap-3 sm:grid-cols-2">
            <ToolPanel>
              <h2 className="text-sm font-bold text-foreground">Next three periods</h2>
              <ul className="mt-3 space-y-2">
                {result.upcoming.map((p) => (
                  <li
                    key={p.start.toISOString()}
                    className="rounded-lg bg-background-subtle px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-foreground">
                      {formatLong(p.start)}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      through {formatLong(p.end)}
                    </span>
                  </li>
                ))}
              </ul>
            </ToolPanel>

            <ToolPanel>
              <h2 className="text-sm font-bold text-foreground">
                Estimated fertile window
              </h2>
              <p className="mt-3 rounded-lg bg-background-subtle px-3 py-2 text-sm">
                <span className="font-medium text-foreground">
                  {formatLong(result.fertileFrom)} – {formatLong(result.fertileTo)}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Ovulation around {formatLong(result.ovulation)}
                </span>
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                This assumes ovulation happens about 14 days before your next
                period, which is an average rather than a rule. Stress, illness
                and many other things shift it.
              </p>
            </ToolPanel>
          </div>
        </>
      )}

      <HealthNotice extra="Cycle predictions are averages and should never be relied on to prevent or achieve pregnancy." />
    </div>
  );
}
