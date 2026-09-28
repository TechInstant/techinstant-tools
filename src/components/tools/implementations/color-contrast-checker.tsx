"use client";

import { useMemo, useState } from "react";
import { Check, X, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolPanel, Field } from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

/** #abc, #aabbcc or a bare hex, to [r, g, b] in 0–255. */
function parseHex(input: string): [number, number, number] | null {
  const hex = input.trim().replace(/^#/, "");
  const full =
    hex.length === 3
      ? hex.split("").map((c) => c + c).join("")
      : hex.length === 6
        ? hex
        : null;
  if (!full || !/^[0-9a-f]{6}$/i.test(full)) return null;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * WCAG relative luminance. The 0.03928 branch is the sRGB transfer curve —
 * using the plain channel values instead is the usual reason a hand-rolled
 * contrast checker disagrees with the spec.
 */
function luminance([r, g, b]: [number, number, number]) {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(a: [number, number, number], b: [number, number, number]) {
  const la = luminance(a);
  const lb = luminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

const toHex = ([r, g, b]: [number, number, number]) =>
  `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

/** Nudges a colour towards black or white until it clears `target`. */
function suggest(
  fg: [number, number, number],
  bg: [number, number, number],
  target: number
): string | null {
  const towardsWhite = luminance(fg) > luminance(bg);
  for (let step = 1; step <= 100; step++) {
    const t = step / 100;
    const candidate = fg.map((v) =>
      Math.round(towardsWhite ? v + (255 - v) * t : v * (1 - t))
    ) as [number, number, number];
    if (ratio(candidate, bg) >= target) return toHex(candidate);
  }
  return null;
}

const LEVELS = [
  { id: "aa-normal", label: "AA — normal text", need: 4.5, note: "Under 18pt, or under 14pt bold" },
  { id: "aa-large", label: "AA — large text", need: 3, note: "18pt and over, or 14pt bold and over" },
  { id: "aaa-normal", label: "AAA — normal text", need: 7, note: "The enhanced standard" },
  { id: "aaa-large", label: "AAA — large text", need: 4.5, note: "Enhanced, large text" },
  { id: "ui", label: "UI components & graphics", need: 3, note: "Borders, icons, focus rings" },
];

export default function ColorContrastChecker() {
  const [fgHex, setFgHex] = useState("#6b7280");
  const [bgHex, setBgHex] = useState("#ffffff");

  const result = useMemo(() => {
    const fg = parseHex(fgHex);
    const bg = parseHex(bgHex);
    if (!fg || !bg) return null;
    const value = ratio(fg, bg);
    return {
      fg,
      bg,
      value,
      levels: LEVELS.map((l) => ({ ...l, pass: value >= l.need })),
      fixAa: value < 4.5 ? suggest(fg, bg, 4.5) : null,
      fixAaa: value < 7 ? suggest(fg, bg, 7) : null,
    };
  }, [fgHex, bgHex]);

  const swap = () => {
    setFgHex(bgHex);
    setBgHex(fgHex);
  };

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <Field label="Text colour" htmlFor="cc-fg">
            <div className="flex items-center gap-2">
              <input
                id="cc-fg"
                type="color"
                value={parseHex(fgHex) ? toHex(parseHex(fgHex)!) : "#000000"}
                onChange={(e) => setFgHex(e.target.value)}
                className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-input bg-card p-1"
                aria-label="Pick text colour"
              />
              <Input
                value={fgHex}
                onChange={(e) => setFgHex(e.target.value)}
                aria-label="Text colour hex"
                spellCheck={false}
              />
            </div>
          </Field>

          <Button
            variant="outline"
            size="icon"
            onClick={swap}
            aria-label="Swap the two colours"
            className="mb-0.5 hidden sm:flex"
          >
            <ArrowLeftRight />
          </Button>

          <Field label="Background colour" htmlFor="cc-bg">
            <div className="flex items-center gap-2">
              <input
                id="cc-bg"
                type="color"
                value={parseHex(bgHex) ? toHex(parseHex(bgHex)!) : "#ffffff"}
                onChange={(e) => setBgHex(e.target.value)}
                className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-input bg-card p-1"
                aria-label="Pick background colour"
              />
              <Input
                value={bgHex}
                onChange={(e) => setBgHex(e.target.value)}
                aria-label="Background colour hex"
                spellCheck={false}
              />
            </div>
          </Field>
        </div>

        <Button variant="outline" onClick={swap} className="w-full sm:hidden">
          <ArrowLeftRight />
          Swap colours
        </Button>
      </ToolPanel>

      {!result && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-700 dark:text-red-300"
        >
          Enter two hex colours, like #1f2937 and #ffffff.
        </p>
      )}

      {result && (
        <>
          <ToolPanel>
            <div
              className="rounded-lg p-6 text-center"
              style={{ backgroundColor: toHex(result.bg), color: toHex(result.fg) }}
            >
              <p className="text-2xl font-bold">Large heading text</p>
              <p className="mt-2 text-base">
                Body copy at a normal size, which is what the 4.5:1 rule is about.
              </p>
              <p className="mt-2 text-xs">
                And small print, where poor contrast hurts most.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-extrabold tabular-nums text-foreground">
                {result.value.toFixed(2)}
                <span className="text-xl font-bold text-muted-foreground">:1</span>
              </span>
              <span
                className={cn(
                  "text-sm font-bold",
                  result.value >= 7
                    ? "text-brand"
                    : result.value >= 4.5
                      ? "text-brand"
                      : result.value >= 3
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                )}
              >
                {result.value >= 7
                  ? "Excellent"
                  : result.value >= 4.5
                    ? "Passes for body text"
                    : result.value >= 3
                      ? "Large text only"
                      : "Fails"}
              </span>
            </div>
          </ToolPanel>

          <ToolPanel>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              WCAG 2.2 levels
            </h2>
            <ul className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
              {result.levels.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-2 bg-background-subtle px-4 py-3"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      {l.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {l.note} · needs {l.need}:1
                    </span>
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-bold",
                      l.pass
                        ? "bg-brand/15 text-brand"
                        : "bg-red-500/15 text-red-700 dark:text-red-300"
                    )}
                  >
                    {l.pass ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    {l.pass ? "Pass" : "Fail"}
                  </span>
                </li>
              ))}
            </ul>
          </ToolPanel>

          {(result.fixAa || result.fixAaa) && (
            <ToolPanel>
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Nearest passing text colour
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The same hue, lightened or darkened only as far as it needs to be.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {result.fixAa && (
                  <Suggestion
                    label="Passes AA (4.5:1)"
                    hex={result.fixAa}
                    bg={toHex(result.bg)}
                    onUse={() => setFgHex(result.fixAa!)}
                  />
                )}
                {result.fixAaa && (
                  <Suggestion
                    label="Passes AAA (7:1)"
                    hex={result.fixAaa}
                    bg={toHex(result.bg)}
                    onUse={() => setFgHex(result.fixAaa!)}
                  />
                )}
              </div>
            </ToolPanel>
          )}

          <ToolPanel>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Contrast ratio is only part of readability. A passing ratio can
              still be hard to read in a thin weight, a decorative typeface, or
              at a small size — and text over a photograph or gradient needs
              checking against its lightest and darkest area, not an average.
              Check your dark mode separately; it is a different pair of colours.
            </p>
          </ToolPanel>
        </>
      )}
    </div>
  );
}

function Suggestion({
  label,
  hex,
  bg,
  onUse,
}: {
  label: string;
  hex: string;
  bg: string;
  onUse: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-background-subtle p-3">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <div
        className="mt-2 rounded p-3 text-center text-sm font-semibold"
        style={{ backgroundColor: bg, color: hex }}
      >
        {hex}
      </div>
      <Button variant="outline" size="sm" className="mt-2 w-full" onClick={onUse}>
        Use this colour
      </Button>
    </div>
  );
}
