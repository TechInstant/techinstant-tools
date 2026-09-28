"use client";

import { useMemo, useState } from "react";
import { Input, Textarea, Select } from "@/components/ui/input";
import { ToolPanel, Field, CopyButton, Stat } from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

/* Words dropped when "remove filler words" is on. Kept short on purpose —
   stripping too much makes slugs that no longer read as the title. */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "in", "on", "at", "to", "for",
  "with", "by", "from", "is", "are", "was", "were", "be", "as", "that", "this",
  "it", "its",
]);

/**
 * Characters that have a sensible ASCII equivalent but do not decompose under
 * Unicode normalisation, so NFD alone leaves them behind.
 */
const SPECIAL: Record<string, string> = {
  ß: "ss", æ: "ae", Æ: "ae", œ: "oe", Œ: "oe", ø: "o", Ø: "o",
  đ: "d", Đ: "d", ð: "d", Ð: "d", þ: "th", Þ: "th", ł: "l", Ł: "l",
  "₦": "ngn", "€": "eur", "£": "gbp", "$": "usd", "&": "and", "@": "at",
  "№": "no", "©": "c", "®": "r", "™": "tm", "°": "deg", "%": "percent",
  "+": "plus",
};

export default function SlugGenerator() {
  const [text, setText] = useState("");
  const [separator, setSeparator] = useState("-");
  const [lower, setLower] = useState(true);
  const [stripStops, setStripStops] = useState(false);
  const [maxLength, setMaxLength] = useState("");

  const options = useMemo(
    () => ({ separator, lower, stripStops, maxLength }),
    [separator, lower, stripStops, maxLength]
  );

  const slug = useMemo(
    () => (text.trim() ? slugify(text, options) : ""),
    [text, options]
  );

  const lines = useMemo(
    () => text.split("\n").filter((l) => l.trim()).length,
    [text]
  );

  /* Each line gets its own slug when several are pasted in, which is what you
     want when slugging a list of titles. */
  const multi = useMemo(() => {
    if (lines < 2) return [];
    const seen = new Map<string, number>();
    return text
      .split("\n")
      .filter((l) => l.trim())
      .map((line) => {
        const base = slugify(line, options);
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        /* Duplicate titles would collide as URLs, so number the repeats. */
        return count === 0 ? base : `${base}${separator}${count + 1}`;
      });
  }, [text, lines, options, separator]);

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <Field
          label="Title or text"
          htmlFor="slug-in"
          hint="Paste several lines to slug a whole list at once."
        >
          <Textarea
            id="slug-in"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="10 Café Ideas for Lagos — Part 2"
            className="min-h-28"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Separator" htmlFor="slug-sep">
            <Select
              id="slug-sep"
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
            >
              <option value="-">Hyphen ( - )</option>
              <option value="_">Underscore ( _ )</option>
              <option value=".">Dot ( . )</option>
              <option value="">None</option>
            </Select>
          </Field>
          <Field label="Max length" htmlFor="slug-max" hint="Blank for no limit.">
            <Input
              id="slug-max"
              type="number"
              inputMode="numeric"
              value={maxLength}
              onChange={(e) => setMaxLength(e.target.value)}
              placeholder="60"
            />
          </Field>
          <Field label="Options">
            <div className="space-y-2 pt-1">
              <Check id="slug-lower" checked={lower} onChange={setLower} label="Lowercase" />
              <Check
                id="slug-stops"
                checked={stripStops}
                onChange={setStripStops}
                label="Remove filler words"
              />
            </div>
          </Field>
        </div>
      </ToolPanel>

      {slug && (
        <ToolPanel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted-foreground">
              {lines > 1 ? "First slug" : "Slug"}
            </p>
            <CopyButton value={lines > 1 ? multi.join("\n") : slug} label="Copy" />
          </div>
          <p className="mt-2 break-all rounded-lg bg-background-subtle p-3 font-mono text-sm text-foreground">
            {lines > 1 ? multi[0] : slug}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Characters" value={(lines > 1 ? multi[0] : slug).length} />
            <Stat label="Words" value={(lines > 1 ? multi[0] : slug).split(separator || /(?!)/).filter(Boolean).length} />
            <Stat label="Slugs" value={lines > 1 ? multi.length : 1} />
          </div>
        </ToolPanel>
      )}

      {multi.length > 1 && (
        <ToolPanel>
          <h2 className="text-base font-bold tracking-tight text-foreground">
            All {multi.length} slugs
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Repeated titles are numbered, because two pages cannot share a URL.
          </p>
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
            {multi.map((s, i) => (
              <li
                key={`${s}-${i}`}
                className="break-all bg-background-subtle px-3 py-2 font-mono text-sm text-foreground"
              >
                {s}
              </li>
            ))}
          </ul>
        </ToolPanel>
      )}
    </div>
  );
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The single rule set, used by both the single and multi-line paths. */
function slugify(
  input: string,
  opts: { separator: string; lower: boolean; stripStops: boolean; maxLength: string }
) {
  let working = input;
  for (const [from, to] of Object.entries(SPECIAL)) {
    working = working.split(from).join(` ${to} `);
  }
  /* NFD splits an accented letter into letter + combining mark, and the range
     below is exactly those marks — so "é" becomes "e". */
  working = working.normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (opts.lower) working = working.toLowerCase();

  let words = working.replace(/['’`]/g, "").split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (opts.stripStops) {
    const kept = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()));
    /* Never strip everything — a title made only of filler words would
       otherwise produce an empty slug. */
    if (kept.length > 0) words = kept;
  }

  let out = words.join(opts.separator);
  const limit = Number(opts.maxLength);
  if (Number.isFinite(limit) && limit > 0 && out.length > limit) {
    out = out.slice(0, limit);
    const lastBreak = out.lastIndexOf(opts.separator);
    if (opts.separator && lastBreak > limit * 0.5) out = out.slice(0, lastBreak);
    if (opts.separator) {
      out = out.replace(new RegExp(`${escapeRegex(opts.separator)}+$`), "");
    }
  }
  return out;
}

function Check({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={cn(
          "h-4 w-4 rounded border-border accent-[var(--color-brand-solid,#05a85a)]"
        )}
      />
      <span className="text-foreground">{label}</span>
    </label>
  );
}
