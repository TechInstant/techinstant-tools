"use client";

import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToolPanel, Field, CopyButton } from "@/components/tools/tool-ui";
import {
  fromInputValue,
  addDays,
  formatLong,
  daysBetween,
  stripTime,
  todayValue,
} from "@/lib/date";
import { cn } from "@/lib/utils";

interface Milestone {
  /** Days after the birth. */
  day: number;
  /** Inclusive end of the window, where it spans several days. */
  endDay?: number;
  title: string;
  detail: string;
  kind: "check" | "body" | "admin" | "mind";
}

/**
 * The recovery timeline is deliberately built from the things that are either
 * time-critical (registering the birth, the six-week check) or commonly missed
 * (the two-week mood marker), rather than a day-by-day diary nobody reads.
 *
 * Exact schedules differ by country and by how your birth went, so every entry
 * is framed as "around when" and defers to your own midwife or health visitor.
 */
const MILESTONES: Milestone[] = [
  {
    day: 1,
    endDay: 2,
    title: "First newborn checks",
    detail:
      "Weight, feeding and a physical examination, usually before you are discharged or on the first home visit.",
    kind: "check",
  },
  {
    day: 3,
    endDay: 5,
    title: "Milk comes in, and the heel prick test",
    detail:
      "Breasts often become very full around day three. The newborn blood spot test is usually offered on day five.",
    kind: "body",
  },
  {
    day: 3,
    endDay: 5,
    title: "The day-three low",
    detail:
      "Feeling tearful and overwhelmed around now is extremely common and usually passes within a few days. Tell someone anyway.",
    kind: "mind",
  },
  {
    day: 5,
    endDay: 10,
    title: "Midwife visits and weight check",
    detail:
      "Babies commonly lose weight in the first days and should be back to birth weight by around two weeks.",
    kind: "check",
  },
  {
    day: 10,
    endDay: 14,
    title: "Midwife hands over to the health visitor",
    detail: "Make sure you know who to ring after this point, and write the number down.",
    kind: "check",
  },
  {
    day: 14,
    title: "Two-week mood marker",
    detail:
      "If low mood, anxiety or numbness is still here or getting worse rather than lifting, raise it now. Postnatal depression is common and treatable, and early is much easier.",
    kind: "mind",
  },
  {
    day: 21,
    title: "Register the birth",
    detail:
      "Most countries require registration within 42 days; some sooner. Check your local deadline — it is usually also what unlocks pay and benefits.",
    kind: "admin",
  },
  {
    day: 21,
    endDay: 28,
    title: "Bleeding should be easing",
    detail:
      "Lochia normally lightens and changes from red to brown to pale over two to six weeks. Fresh heavy red bleeding returning is worth a call.",
    kind: "body",
  },
  {
    day: 28,
    endDay: 35,
    title: "Gentle movement, if you feel ready",
    detail:
      "Short walks and pelvic floor exercises. Hold off on running, lifting and abdominal work until after you have been checked.",
    kind: "body",
  },
  {
    day: 42,
    title: "Six-week postnatal check",
    detail:
      "Yours and the baby's. This is the appointment to raise everything you have been putting up with — pain, leaking, mood, scar, sex, contraception. Write your list beforehand.",
    kind: "check",
  },
  {
    day: 56,
    title: "Eight weeks — first immunisations",
    detail: "Usually the first routine vaccinations, and another weight and development check.",
    kind: "check",
  },
  {
    day: 84,
    title: "Twelve weeks",
    detail:
      "Many people feel recognisably themselves around now. Plenty do not, and that is also normal — several months is common, and longer after a caesarean.",
    kind: "body",
  },
];

const KIND_STYLE: Record<Milestone["kind"], { label: string; className: string }> = {
  check: {
    label: "Appointment",
    className: "bg-brand/15 text-brand",
  },
  body: {
    label: "Your body",
    className: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  mind: {
    label: "Your mind",
    className: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  },
  admin: {
    label: "Paperwork",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
};

export function PostpartumCalendar() {
  const [birth, setBirth] = useState("");

  const plan = useMemo(() => {
    const start = fromInputValue(birth);
    if (!start) return null;

    const today = stripTime(new Date());
    const elapsed = daysBetween(start, today);
    if (elapsed < 0) return { error: "That date is in the future." };
    if (elapsed > 400) {
      return {
        error:
          "That is more than a year ago, so a recovery timeline would not be much use.",
      };
    }

    const entries = MILESTONES.map((m) => {
      const from = addDays(start, m.day);
      const to = m.endDay ? addDays(start, m.endDay) : null;
      const endDay = m.endDay ?? m.day;
      return {
        ...m,
        from,
        to,
        past: elapsed > endDay,
        /* "Now" means the window is open, or the single day is today. */
        now: elapsed >= m.day && elapsed <= endDay,
      };
    });

    return { entries, elapsed, week: Math.floor(elapsed / 7) + 1 };
  }, [birth]);

  const asText = useMemo(() => {
    if (!plan || "error" in plan) return "";
    return [
      "Postpartum recovery timeline",
      "",
      ...plan.entries.map(
        (e) =>
          `${formatLong(e.from)}${e.to ? ` – ${formatLong(e.to)}` : ""} — ${e.title}: ${e.detail}`
      ),
    ].join("\n");
  }, [plan]);

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Recovery calendar
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Enter the birth date and the checks, milestones and deadlines get
              real dates, so you can see what is due and what has passed.
            </p>
          </div>
        </div>

        <div className="sm:max-w-xs">
          <Field label="Date of birth" htmlFor="pp-birth">
            <Input
              id="pp-birth"
              type="date"
              value={birth}
              max={todayValue()}
              onChange={(e) => setBirth(e.target.value)}
            />
          </Field>
        </div>
      </ToolPanel>

      {plan && "error" in plan && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-700 dark:text-red-300"
        >
          {plan.error}
        </p>
      )}

      {plan && !("error" in plan) && (
        <ToolPanel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted-foreground">
              Day {plan.elapsed} — week {plan.week} after birth
            </p>
            <CopyButton value={asText} label="Copy timeline" />
          </div>

          <ol className="mt-4 space-y-2">
            {plan.entries.map((e) => {
              const style = KIND_STYLE[e.kind];
              return (
                <li
                  key={`${e.day}-${e.title}`}
                  className={cn(
                    "rounded-lg border p-3 transition-colors",
                    e.now
                      ? "border-brand bg-brand/5"
                      : e.past
                        ? "border-border bg-background-subtle opacity-65"
                        : "border-border bg-background-subtle"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[11px] font-semibold",
                        style.className
                      )}
                    >
                      {style.label}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {e.title}
                    </span>
                    {e.now && (
                      <span className="rounded bg-brand-solid px-1.5 py-0.5 text-[11px] font-bold text-brand-solid-foreground">
                        around now
                      </span>
                    )}
                    {e.past && (
                      <span className="text-[11px] font-medium text-muted-foreground">
                        passed
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 text-xs font-medium tabular-nums text-brand">
                    {formatLong(e.from)}
                    {e.to ? ` – ${formatLong(e.to)}` : ""}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {e.detail}
                  </p>
                </li>
              );
            })}
          </ol>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            These are typical timings, not your appointment schedule. Exact dates
            differ by country and by how your birth went, so where your midwife,
            health visitor or doctor says something different, theirs is the one
            to follow.
          </p>
        </ToolPanel>
      )}
    </div>
  );
}
