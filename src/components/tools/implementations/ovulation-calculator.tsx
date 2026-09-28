"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ToolPanel, Field, ErrorNote, Stat } from "@/components/tools/tool-ui";
import { HealthNotice } from "@/components/tools/health-notice";
import {
  fromInputValue,
  addDays,
  formatLong,
  formatShort,
  daysBetween,
  relativeDays,
  stripTime,
} from "@/lib/date";
import { cn } from "@/lib/utils";

/**
 * Ovulation is estimated backwards from the *next* period, not forwards from
 * the last one. The luteal phase (ovulation → period) is far more consistent
 * between people than the follicular phase, which is what makes counting back
 * more reliable than the "day 14" rule for anyone whose cycle is not 28 days.
 */
export default function OvulationCalculator() {
  const [lmp, setLmp] = useState("");
  const [cycle, setCycle] = useState("28");
  const [luteal, setLuteal] = useState("14");

  const result = useMemo(() => {
    const start = fromInputValue(lmp);
    if (!start) return null;

    const cycleLength = Number(cycle);
    const lutealLength = Number(luteal);

    if (!Number.isFinite(cycleLength) || cycleLength < 21 || cycleLength > 45) {
      return { error: "Cycle length is usually between 21 and 45 days." };
    }
    if (!Number.isFinite(lutealLength) || lutealLength < 9 || lutealLength > 17) {
      return { error: "The luteal phase is usually between 9 and 17 days." };
    }
    if (lutealLength >= cycleLength - 5) {
      return {
        error:
          "The luteal phase has to be shorter than the cycle — check both numbers.",
      };
    }

    const today = stripTime(new Date());
    if (daysBetween(start, today) < -1) {
      return { error: "That date is in the future. Enter the day your last period began." };
    }
    if (daysBetween(start, today) > 120) {
      return {
        error:
          "That is more than four months ago, so an estimate would not mean much. Enter a recent period start date.",
      };
    }

    const cycles = [0, 1, 2].map((i) => {
      const periodStart = addDays(start, cycleLength * i);
      const nextPeriod = addDays(periodStart, cycleLength);
      const ovulation = addDays(nextPeriod, -lutealLength);
      return {
        periodStart,
        nextPeriod,
        ovulation,
        /* Sperm survive up to ~5 days; the egg about 24 hours. */
        fertileFrom: addDays(ovulation, -5),
        fertileTo: addDays(ovulation, 1),
        /* A home test is most meaningful from the first missed day. */
        testFrom: nextPeriod,
      };
    });

    /* Whichever cycle's fertile window has not finished yet. */
    const current =
      cycles.find((c) => daysBetween(c.fertileTo, today) <= 0) ?? cycles[0];

    const strip = Array.from({ length: cycleLength }, (_, i) => {
      const day = addDays(current.periodStart, i);
      const toOv = daysBetween(current.ovulation, day);
      return {
        day,
        index: i + 1,
        isPeriod: i < 5,
        isOvulation: toOv === 0,
        isFertile: toOv >= -5 && toOv <= 1,
        isToday: daysBetween(day, today) === 0,
      };
    });

    return { cycles, current, strip, cycleLength, today };
  }, [lmp, cycle, luteal]);

  const hasError = result != null && "error" in result;

  return (
    <div className="space-y-4">
      <ToolPanel className="grid gap-4 sm:grid-cols-3">
        <Field label="First day of your last period" htmlFor="ov-lmp">
          <Input
            id="ov-lmp"
            type="date"
            value={lmp}
            onChange={(e) => setLmp(e.target.value)}
          />
        </Field>
        <Field label="Cycle length (days)" htmlFor="ov-cycle" hint="Period start to period start.">
          <Input
            id="ov-cycle"
            type="number"
            inputMode="numeric"
            value={cycle}
            onChange={(e) => setCycle(e.target.value)}
          />
        </Field>
        <Field
          label="Luteal phase (days)"
          htmlFor="ov-luteal"
          hint="Leave at 14 unless you have tracked it."
        >
          <Input
            id="ov-luteal"
            type="number"
            inputMode="numeric"
            value={luteal}
            onChange={(e) => setLuteal(e.target.value)}
          />
        </Field>
      </ToolPanel>

      {hasError && <ErrorNote>{(result as { error: string }).error}</ErrorNote>}

      {result && !("error" in result) && (
        <>
          <ToolPanel>
            <p className="text-sm font-medium text-muted-foreground">
              Estimated ovulation
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
              {formatLong(result.current.ovulation)}
            </p>
            <p className="mt-1 text-sm font-semibold text-brand">
              {relativeDays(daysBetween(result.today, result.current.ovulation))}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Stat
                label="Most fertile days"
                value={
                  <span className="text-base">
                    {formatShort(result.current.fertileFrom)} – {formatShort(result.current.fertileTo)}
                  </span>
                }
              />
              <Stat
                label="Next period expected"
                value={
                  <span className="text-base">{formatShort(result.current.nextPeriod)}</span>
                }
              />
            </div>
          </ToolPanel>

          <ToolPanel>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Your cycle at a glance
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Day 1 is the first day of bleeding.
            </p>

            <div className="mt-4 flex flex-wrap gap-1">
              {result.strip.map((d) => (
                <div
                  key={d.index}
                  title={`Day ${d.index} — ${formatLong(d.day)}`}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded text-xs font-semibold tabular-nums",
                    d.isOvulation
                      ? "bg-brand-solid text-brand-solid-foreground"
                      : d.isFertile
                        ? "bg-brand/20 text-brand"
                        : d.isPeriod
                          ? "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                          : "bg-muted text-muted-foreground",
                    d.isToday && "ring-2 ring-foreground ring-offset-1 ring-offset-card"
                  )}
                >
                  {d.index}
                </div>
              ))}
            </div>

            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <Key className="bg-rose-500/20" label="Period" />
              <Key className="bg-brand/20" label="Fertile window" />
              <Key className="bg-brand-solid" label="Ovulation" />
              <Key className="ring-2 ring-foreground" label="Today" />
            </ul>
          </ToolPanel>

          <ToolPanel>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              The next three cycles
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-md text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Fertile window</th>
                    <th className="pb-2 pr-4 font-medium">Ovulation</th>
                    <th className="pb-2 font-medium">Period due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.cycles.map((c) => (
                    <tr key={c.ovulation.toISOString()}>
                      <td className="py-2.5 pr-4 text-foreground">
                        {formatShort(c.fertileFrom)} – {formatShort(c.fertileTo)}
                      </td>
                      <td className="py-2.5 pr-4 font-semibold text-brand">
                        {formatShort(c.ovulation)}
                      </td>
                      <td className="py-2.5 text-muted-foreground">
                        {formatShort(c.nextPeriod)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              A pregnancy test is most reliable from the day your period was due
              — around {formatLong(result.current.testFrom)} for this cycle.
              Testing earlier often gives a negative result even when you are
              pregnant.
            </p>
          </ToolPanel>
        </>
      )}

      <HealthNotice extra="Ovulation shifts with stress, illness, travel and sleep, and cycles vary from month to month even when nothing is wrong. Counting days cannot tell you whether you actually ovulated." />
    </div>
  );
}

function Key({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={cn("h-3.5 w-3.5 rounded", className)} />
      {label}
    </li>
  );
}
