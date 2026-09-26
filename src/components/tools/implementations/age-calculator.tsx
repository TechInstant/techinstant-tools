"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ToolPanel, Field, Stat, ErrorNote } from "@/components/tools/tool-ui";

const toDateOnly = (value: string) => {
  /* Parse as local midnight; `new Date("YYYY-MM-DD")` is UTC and shifts the
     day for anyone behind UTC. */
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
};

const todayValue = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/**
 * Calendar-accurate difference. Borrows real month lengths rather than
 * assuming 30 days, so leap years and short months come out right.
 */
function diff(from: Date, to: Date) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months -= 1;
    /* Day 0 of the target month = last day of the previous month. */
    days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.floor(
    (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
  );

  return { years, months, days, totalDays };
}

function nextBirthday(dob: Date, from: Date) {
  let next = new Date(from.getFullYear(), dob.getMonth(), dob.getDate());
  if (next < from) next = new Date(from.getFullYear() + 1, dob.getMonth(), dob.getDate());
  const days = Math.ceil((next.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  return { date: next, days };
}

export default function AgeCalculator() {
  const [dob, setDob] = useState("");
  /* Filled after mount — reading today's date during render would make the
     server HTML and the first client render disagree. */
  const [target, setTarget] = useState("");

  useEffect(() => {
    setTarget((current) => current || todayValue());
  }, []);

  const result = useMemo(() => {
    const birth = toDateOnly(dob);
    const until = toDateOnly(target);
    if (!birth || !until) return null;
    if (birth > until)
      return { error: "The date of birth is after the target date." as const };

    const d = diff(birth, until);
    const bday = nextBirthday(birth, until);
    return {
      ...d,
      weeks: Math.floor(d.totalDays / 7),
      hours: d.totalDays * 24,
      nextBirthdayDays: bday.days,
      nextBirthdayDate: bday.date,
      bornOn: birth.toLocaleDateString(undefined, { weekday: "long" }),
    };
  }, [dob, target]);

  return (
    <div className="space-y-4">
      <ToolPanel>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of birth" htmlFor="ac-dob">
            <Input
              id="ac-dob"
              type="date"
              value={dob}
              max={target}
              onChange={(e) => setDob(e.target.value)}
            />
          </Field>
          <Field
            label="Age at date"
            htmlFor="ac-target"
            hint="Defaults to today. Change it to work out an age on any date."
          >
            <Input
              id="ac-target"
              type="date"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </Field>
        </div>
      </ToolPanel>

      {result && "error" in result && <ErrorNote>{result.error}</ErrorNote>}

      {result && !("error" in result) && (
        <>
          <ToolPanel>
            <div className="text-sm font-medium text-muted-foreground">Age</div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 text-3xl font-extrabold tabular-nums text-foreground">
              <span>
                {result.years}
                <span className="ml-1 text-lg font-semibold text-muted-foreground">
                  {result.years === 1 ? "year" : "years"}
                </span>
              </span>
              <span>
                {result.months}
                <span className="ml-1 text-lg font-semibold text-muted-foreground">
                  {result.months === 1 ? "month" : "months"}
                </span>
              </span>
              <span>
                {result.days}
                <span className="ml-1 text-lg font-semibold text-muted-foreground">
                  {result.days === 1 ? "day" : "days"}
                </span>
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Born on a {result.bornOn}.
            </p>
          </ToolPanel>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total days" value={result.totalDays.toLocaleString()} />
            <Stat label="Total weeks" value={result.weeks.toLocaleString()} />
            <Stat label="Total hours" value={result.hours.toLocaleString()} />
            <Stat
              label="Next birthday"
              value={
                result.nextBirthdayDays === 0
                  ? "Today"
                  : `${result.nextBirthdayDays}d`
              }
            />
          </div>
        </>
      )}

      {!dob && (
        <p className="text-sm text-muted-foreground">
          Pick a date of birth to see the result.
        </p>
      )}
    </div>
  );
}
