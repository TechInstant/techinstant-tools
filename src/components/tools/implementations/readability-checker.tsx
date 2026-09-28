"use client";

import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolPanel, Stat } from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

/**
 * Syllable estimate. Counting vowel groups, dropping a silent trailing "e",
 * and treating "-le" endings as a syllable gets close enough for readability
 * scores, which are approximations by nature.
 */
function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return w.length > 0 ? 1 : 0;

  let s = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "")
    .match(/[aeiouy]{1,2}/g)?.length ?? 0;

  if (/[^aeiou]le$/.test(w)) s += 1;
  return Math.max(1, s);
}

function analyse(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const sentences = trimmed.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim()).length || 1;
  const wordList = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = wordList.length;
  if (wordCount < 10) return { tooShort: true as const };

  const syllableCount = wordList.reduce((n, w) => n + syllables(w), 0);
  const complex = wordList.filter((w) => syllables(w) >= 3).length;

  const wordsPerSentence = wordCount / sentences;
  const syllablesPerWord = syllableCount / wordCount;

  /* Flesch Reading Ease: higher is easier. */
  const ease = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  /* Flesch–Kincaid Grade Level: US school grade needed to read it. */
  const grade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;

  const band =
    ease >= 80
      ? { label: "Very easy", note: "Around age 11. Good for public-facing writing.", tone: "text-brand" }
      : ease >= 60
        ? { label: "Plain English", note: "Around age 13–15. This is the sweet spot for most audiences.", tone: "text-brand" }
        : ease >= 50
          ? { label: "Fairly hard", note: "Around age 15–18. Fine for an informed reader.", tone: "text-amber-600 dark:text-amber-400" }
          : ease >= 30
            ? { label: "Difficult", note: "University level. Expected in academic writing.", tone: "text-amber-600 dark:text-amber-400" }
            : { label: "Very difficult", note: "Postgraduate. Consider shorter sentences.", tone: "text-red-600 dark:text-red-400" };

  /* Sentences long enough to be worth a second look. */
  const longest = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => ({ text: s.trim(), n: s.trim().split(/\s+/).filter(Boolean).length }))
    .filter((s) => s.n > 25)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3);

  return {
    tooShort: false as const,
    ease: Math.max(0, Math.min(100, ease)),
    grade: Math.max(0, grade),
    wordsPerSentence,
    syllablesPerWord,
    wordCount,
    sentences,
    complex,
    complexPct: (complex / wordCount) * 100,
    band,
    longest,
  };
}

export default function ReadabilityChecker() {
  const [text, setText] = useState("");
  const r = useMemo(() => analyse(text), [text]);

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="rc-in" className="text-sm font-medium text-foreground">
            Your writing
          </label>
          {text && (
            <Button variant="ghost" size="sm" onClick={() => setText("")}>
              Clear
            </Button>
          )}
        </div>
        <Textarea
          id="rc-in"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste an essay, a report or a blog post — at least a couple of sentences."
          className="min-h-48"
        />
      </ToolPanel>

      {r?.tooShort && (
        <p className="text-sm text-muted-foreground">
          Add a little more text — readability scores need at least ten words to
          mean anything.
        </p>
      )}

      {r && !r.tooShort && (
        <>
          <ToolPanel>
            <p className="text-sm font-medium text-muted-foreground">Reading ease</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-extrabold tabular-nums text-foreground">
                {r.ease.toFixed(0)}
              </span>
              <span className={cn("text-lg font-bold", r.band.tone)}>
                {r.band.label}
              </span>
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand-solid transition-all"
                style={{ width: `${r.ease}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{r.band.note}</p>
          </ToolPanel>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Grade level" value={r.grade.toFixed(1)} />
            <Stat label="Words / sentence" value={r.wordsPerSentence.toFixed(1)} />
            <Stat label="Long words" value={`${r.complexPct.toFixed(0)}%`} />
            <Stat label="Sentences" value={r.sentences} />
          </div>

          {r.longest.length > 0 && (
            <ToolPanel>
              <h2 className="text-sm font-bold text-foreground">
                Sentences worth shortening
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Over 25 words. Splitting these is usually the fastest way to improve
                a score.
              </p>
              <ul className="mt-3 space-y-2">
                {r.longest.map((s) => (
                  <li
                    key={s.text.slice(0, 40)}
                    className="rounded-lg bg-background-subtle p-3 text-sm text-muted-foreground"
                  >
                    <span className="font-semibold text-foreground">{s.n} words · </span>
                    {s.text.length > 200 ? `${s.text.slice(0, 200)}…` : s.text}
                  </li>
                ))}
              </ul>
            </ToolPanel>
          )}
        </>
      )}
    </div>
  );
}
