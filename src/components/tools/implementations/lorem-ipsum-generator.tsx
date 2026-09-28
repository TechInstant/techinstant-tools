"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import {
  ToolPanel,
  Field,
  CopyButton,
  DownloadButton,
  Stat,
} from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

const LATIN =
  `lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor
   incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud
   exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute
   irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur
   excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt
   mollit anim id est laborum at vero eos accusamus iusto odio dignissimos
   ducimus blanditiis praesentium voluptatum deleniti atque corrupti quos dolores
   quas molestias excepturi occaecati cupiditate similique mollitia animi`
    .trim()
    .split(/\s+/);

/* A plain-English filler set, for when Latin makes a mock-up harder to read. */
const ENGLISH =
  `the quick design team shipped a small update this morning and the page now
   loads faster on a slow connection people notice the difference immediately
   because nothing moves while it is loading which was the whole point of the
   change we measured it on an old phone over mobile data and the numbers held
   up well enough to keep going content still needs writing for the second
   section but the layout is settled and the spacing works at every width we
   tried including the awkward one between tablet and desktop where things
   usually break first`
    .trim()
    .split(/\s+/);

type Mode = "paragraphs" | "sentences" | "words" | "list";
type Flavour = "latin" | "english";

/**
 * Deterministic pseudo-random so a given seed always produces the same text.
 * Using Math.random directly would regenerate on every keystroke, which makes
 * the tool feel broken while you are adjusting the count.
 */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function LoremIpsumGenerator() {
  const [mode, setMode] = useState<Mode>("paragraphs");
  const [count, setCount] = useState("4");
  const [flavour, setFlavour] = useState<Flavour>("latin");
  const [html, setHtml] = useState(false);
  const [classic, setClassic] = useState(true);
  const [seed, setSeed] = useState(1);

  const output = useMemo(() => {
    const n = Math.min(Math.max(Number(count) || 1, 1), mode === "words" ? 2000 : 200);
    const pool = flavour === "latin" ? LATIN : ENGLISH;
    const rand = mulberry32(seed * 7919 + n);
    const word = () => pool[Math.floor(rand() * pool.length)];

    const sentence = (isFirstEver: boolean) => {
      if (isFirstEver && classic && flavour === "latin") {
        return "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
      }
      const length = 7 + Math.floor(rand() * 11);
      const words: string[] = [];
      for (let i = 0; i < length; i++) words.push(word());
      /* A comma about two-thirds of the way in reads more like real prose than
         an unbroken run of words. */
      if (length > 9 && rand() > 0.45) {
        const at = Math.floor(length * 0.6);
        words[at] = `${words[at]},`;
      }
      const text = words.join(" ");
      return `${text[0].toUpperCase()}${text.slice(1)}.`;
    };

    let first = true;
    const nextSentence = () => {
      const s = sentence(first);
      first = false;
      return s;
    };

    if (mode === "words") {
      const words: string[] = [];
      if (classic && flavour === "latin") {
        words.push("Lorem", "ipsum", "dolor", "sit", "amet");
      }
      while (words.length < n) words.push(word());
      const text = words.slice(0, n).join(" ");
      return html ? `<p>${text}</p>` : text;
    }

    if (mode === "sentences") {
      const sentences = Array.from({ length: n }, nextSentence);
      return html
        ? sentences.map((s) => `<p>${s}</p>`).join("\n")
        : sentences.join(" ");
    }

    if (mode === "list") {
      const items = Array.from({ length: n }, () => {
        const length = 3 + Math.floor(rand() * 5);
        const words = Array.from({ length }, word).join(" ");
        return `${words[0].toUpperCase()}${words.slice(1)}`;
      });
      return html
        ? `<ul>\n${items.map((i) => `  <li>${i}</li>`).join("\n")}\n</ul>`
        : items.map((i) => `• ${i}`).join("\n");
    }

    const paragraphs = Array.from({ length: n }, () => {
      const sentenceCount = 3 + Math.floor(rand() * 4);
      return Array.from({ length: sentenceCount }, nextSentence).join(" ");
    });
    return html
      ? paragraphs.map((p) => `<p>${p}</p>`).join("\n\n")
      : paragraphs.join("\n\n");
  }, [mode, count, flavour, html, classic, seed]);

  const stats = useMemo(() => {
    const plain = output.replace(/<[^>]+>/g, " ");
    const words = plain.split(/\s+/).filter(Boolean).length;
    return {
      words,
      characters: output.length,
      /* ~200 wpm is the usual reading-speed assumption. */
      readingTime: Math.max(1, Math.round(words / 200)),
    };
  }, [output]);

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Generate" htmlFor="li-mode">
            <Select
              id="li-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
              <option value="list">List items</option>
            </Select>
          </Field>

          <Field label="How many" htmlFor="li-count">
            <Input
              id="li-count"
              type="number"
              inputMode="numeric"
              min={1}
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </Field>

          <Field label="Text" htmlFor="li-flavour" hint="English reads more naturally in a mock-up.">
            <Select
              id="li-flavour"
              value={flavour}
              onChange={(e) => setFlavour(e.target.value as Flavour)}
            >
              <option value="latin">Classic Latin</option>
              <option value="english">Plain English</option>
            </Select>
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Check id="li-html" checked={html} onChange={setHtml} label="Wrap in HTML tags" />
          <Check
            id="li-classic"
            checked={classic}
            onChange={setClassic}
            label="Start with “Lorem ipsum dolor sit amet”"
          />
          <Button variant="outline" size="sm" onClick={() => setSeed((s) => s + 1)}>
            <RefreshCw />
            Shuffle
          </Button>
        </div>
      </ToolPanel>

      <ToolPanel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold tracking-tight text-foreground">Output</h2>
          <div className="flex gap-2">
            <CopyButton value={output} />
            <DownloadButton
              value={output}
              filename={html ? "lorem-ipsum.html" : "lorem-ipsum.txt"}
              mime={html ? "text/html" : "text/plain"}
            />
          </div>
        </div>

        <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-background-subtle p-4 text-sm leading-relaxed text-foreground">
          {output}
        </pre>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Words" value={stats.words.toLocaleString()} />
          <Stat label="Characters" value={stats.characters.toLocaleString()} />
          <Stat label="Reading time" value={`${stats.readingTime} min`} />
        </div>
      </ToolPanel>
    </div>
  );
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
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={cn("h-4 w-4 rounded border-border accent-[var(--color-brand-solid,#05a85a)]")}
      />
      <span className="text-foreground">{label}</span>
    </label>
  );
}
