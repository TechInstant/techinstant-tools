"use client";

import { useEffect, useMemo, useState } from "react";
import { Input, Select } from "@/components/ui/input";
import { ToolPanel, Field, Stat, ErrorNote } from "@/components/tools/tool-ui";
import { HealthNotice } from "@/components/tools/health-notice";
import {
  fromInputValue,
  todayValue,
  addDays,
  daysBetween,
  formatLong,
} from "@/lib/date";

type Method = "lmp" | "conception";

/** Naegele's rule: due date is 280 days from the first day of the last period. */
const GESTATION_DAYS = 280;

export default function DueDateCalculator() {
  const [method, setMethod] = useState<Method>("lmp");
  const [date, setDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [today, setToday] = useState("");

  useEffect(() => setToday(todayValue()), []);

  const result = useMemo(() => {
    const start = fromInputValue(date);
    const now = fromInputValue(today);
    if (!start || !now) return null;

    const cycle = Number(cycleLength);
    if (method === "lmp" && (!Number.isFinite(cycle) || cycle < 20 || cycle > 45)) {
      return { error: "Cycle length is usually between 20 and 45 days." };
    }

    /* A cycle longer or shorter than 28 days shifts ovulation, and with it the
       due date — so adjust rather than assuming everyone is 28 days. */
    const adjustment = method === "lmp" ? cycle - 28 : 0;
    const lmp = method === "lmp" ? start : addDays(start, -14);
    const due = addDays(lmp, GESTATION_DAYS + adjustment);

    const elapsed = daysBetween(lmp, now);
    if (elapsed < 0) return { error: "That date is in the future." };
    if (elapsed > 320) {
      return { error: "That date is more than 45 weeks ago — please check it." };
    }

    const weeks = Math.floor(elapsed / 7);
    const days = elapsed % 7;
    const remaining = daysBetween(now, due);

    const trimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;

    return {
      due,
      weeks,
      days,
      remaining,
      trimester,
      conception: addDays(lmp, 14),
      trimester2: addDays(lmp, 13 * 7),
      trimester3: addDays(lmp, 27 * 7),
      progress: Math.min(100, Math.round((elapsed / GESTATION_DAYS) * 100)),
    };
  }, [date, cycleLength, method, today]);

  const hasError = result != null && "error" in result;

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Calculate from" htmlFor="dd-method">
            <Select
              id="dd-method"
              value={method}
              onChange={(e) => setMethod(e.target.value as Method)}
            >
              <option value="lmp">First day of last period</option>
              <option value="conception">Conception date</option>
            </Select>
          </Field>

          <Field
            label={method === "lmp" ? "First day of last period" : "Conception date"}
            htmlFor="dd-date"
          >
            <Input
              id="dd-date"
              type="date"
              value={date}
              max={today || undefined}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        </div>

        {method === "lmp" && (
          <Field
            label="Cycle length (days)"
            htmlFor="dd-cycle"
            hint="Longer or shorter cycles move the due date."
          >
            <Input
              id="dd-cycle"
              type="number"
              inputMode="numeric"
              min={20}
              max={45}
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
              className="sm:max-w-40"
            />
          </Field>
        )}

        {!date && (
          <p className="text-sm text-muted-foreground">
            Pick a date to see the estimated due date.
          </p>
        )}
      </ToolPanel>

      {hasError && <ErrorNote>{(result as { error: string }).error}</ErrorNote>}

      {result && !("error" in result) && (
        <>
          <ToolPanel>
            <p className="text-sm font-medium text-muted-foreground">
              Estimated due date
            </p>
            <p className="mt-1 text-3xl font-extrabold text-foreground">
              {formatLong(result.due)}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand-solid transition-all"
                style={{ width: `${result.progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {result.weeks} weeks {result.days} days along ·{" "}
              {result.remaining > 0
                ? `${result.remaining} days to go`
                : "due date has passed"}
            </p>
          </ToolPanel>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Weeks" value={`${result.weeks}w ${result.days}d`} />
            <Stat label="Trimester" value={result.trimester} />
            <Stat label="Days to go" value={Math.max(0, result.remaining)} />
            <Stat label="Progress" value={`${result.progress}%`} />
          </div>

          <ToolPanel>
            <h2 className="text-sm font-bold text-foreground">Milestones</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                { label: "Estimated conception", date: result.conception },
                { label: "Second trimester begins", date: result.trimester2 },
                { label: "Third trimester begins", date: result.trimester3 },
                { label: "Due date", date: result.due },
              ].map((m) => (
                <li
                  key={m.label}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-background-subtle px-3 py-2"
                >
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-medium text-foreground">
                    {formatLong(m.date)}
                  </span>
                </li>
              ))}
            </ul>
          </ToolPanel>
        </>
      )}

      <HealthNotice extra="Only about 1 in 20 babies arrive on the estimated due date — most arrive in the two weeks either side." />
    </div>
  );
}
