/** Shared date helpers for the health and calculator tools. */

const MS_DAY = 1000 * 60 * 60 * 24;

const pad = (n: number) => String(n).padStart(2, "0");

/** Today, formatted for a `<input type="date">`. */
export const todayValue = () => toInputValue(new Date());

export const toInputValue = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Parses a date input as LOCAL midnight. `new Date("2024-01-05")` is parsed as
 * UTC, which lands on the previous day for anyone west of Greenwich — a real
 * off-by-one for date-only tools.
 */
export const fromInputValue = (value: string): Date | null => {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** Whole days between two dates, ignoring time of day. */
export const daysBetween = (a: Date, b: Date) =>
  Math.round((stripTime(b).getTime() - stripTime(a).getTime()) / MS_DAY);

export const stripTime = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const formatLong = (d: Date) =>
  d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatShort = (d: Date) =>
  d.toLocaleDateString(undefined, { day: "numeric", month: "short" });

/** "in 5 days" / "3 days ago" / "today" */
export const relativeDays = (days: number) => {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days} days` : `${Math.abs(days)} days ago`;
};
