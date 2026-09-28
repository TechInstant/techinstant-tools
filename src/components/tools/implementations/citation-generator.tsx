"use client";

import { useMemo, useState } from "react";
import { Input, Select } from "@/components/ui/input";
import { ToolPanel, Field, CopyButton } from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

type Style = "apa" | "mla" | "harvard" | "chicago";
type SourceType = "website" | "book" | "journal";

const STYLES: { id: Style; label: string; note: string }[] = [
  { id: "apa", label: "APA 7", note: "Psychology, education, sciences" },
  { id: "mla", label: "MLA 9", note: "Humanities, literature" },
  { id: "harvard", label: "Harvard", note: "Common in UK and Australia" },
  { id: "chicago", label: "Chicago", note: "History, arts" },
];

/**
 * Turns "Ada Lovelace" into the surname-first form each style expects.
 * Multiple authors are separated with a semicolon in the input.
 */
function parseAuthors(raw: string) {
  return raw
    .split(";")
    .map((a) => a.trim())
    .filter(Boolean)
    .map((full) => {
      const parts = full.split(/\s+/);
      if (parts.length === 1) return { surname: parts[0], initials: "", first: "" };
      const surname = parts[parts.length - 1];
      const rest = parts.slice(0, -1);
      return {
        surname,
        initials: rest.map((n) => `${n[0].toUpperCase()}.`).join(" "),
        first: rest.join(" "),
      };
    });
}

function joinAuthors(
  authors: ReturnType<typeof parseAuthors>,
  style: Style
): string {
  if (authors.length === 0) return "";

  const fmt = (a: (typeof authors)[number], invert: boolean) => {
    if (!a.initials) return a.surname;
    if (style === "mla" || style === "chicago") {
      return invert ? `${a.surname}, ${a.first}` : `${a.first} ${a.surname}`;
    }
    return `${a.surname}, ${a.initials}`;
  };

  if (authors.length === 1) return fmt(authors[0], true);

  if (style === "mla" && authors.length > 2) {
    return `${fmt(authors[0], true)}, et al.`;
  }
  if (style === "apa" && authors.length > 20) {
    return `${authors.slice(0, 19).map((a) => fmt(a, true)).join(", ")}, ... ${fmt(authors[authors.length - 1], true)}`;
  }

  const all = authors.map((a, i) => fmt(a, i === 0));
  const last = all.pop()!;
  const sep = style === "apa" || style === "harvard" ? "&" : "and";
  return `${all.join(", ")}${all.length > 1 ? "," : ""} ${sep} ${last}`;
}

interface Fields {
  authors: string;
  title: string;
  year: string;
  siteOrPublisher: string;
  url: string;
  accessed: string;
  journal: string;
  volume: string;
  issue: string;
  pages: string;
  edition: string;
  city: string;
}

function build(style: Style, type: SourceType, f: Fields): string {
  const a = parseAuthors(f.authors);
  const authors = joinAuthors(a, style);
  const year = f.year.trim();
  const title = f.title.trim();
  const pub = f.siteOrPublisher.trim();
  const url = f.url.trim();

  const dot = (s: string) => (s.endsWith(".") ? s : `${s}.`);
  const parts: string[] = [];

  if (style === "apa") {
    if (authors) parts.push(dot(authors));
    parts.push(`(${year || "n.d."}).`);
    if (type === "journal") {
      parts.push(dot(title));
      let j = f.journal.trim();
      if (f.volume) j += `, ${f.volume}`;
      if (f.issue) j += `(${f.issue})`;
      if (f.pages) j += `, ${f.pages}`;
      parts.push(dot(j));
    } else if (type === "book") {
      parts.push(dot(title + (f.edition ? ` (${f.edition} ed.)` : "")));
      if (pub) parts.push(dot(pub));
    } else {
      parts.push(dot(title));
      if (pub) parts.push(dot(pub));
    }
    if (url) parts.push(url);
    return parts.join(" ");
  }

  if (style === "mla") {
    if (authors) parts.push(dot(authors));
    parts.push(type === "website" || type === "journal" ? `“${title}.”` : `${title}.`);
    if (type === "journal") {
      let j = f.journal.trim();
      if (f.volume) j += `, vol. ${f.volume}`;
      if (f.issue) j += `, no. ${f.issue}`;
      if (year) j += `, ${year}`;
      if (f.pages) j += `, pp. ${f.pages}`;
      parts.push(dot(j));
    } else {
      if (pub) parts.push(`${pub},`);
      if (year) parts.push(`${year}.`);
    }
    if (url) parts.push(`${url}.`);
    if (f.accessed) parts.push(`Accessed ${f.accessed}.`);
    return parts.join(" ");
  }

  if (style === "harvard") {
    if (authors) parts.push(authors);
    parts.push(`(${year || "n.d."})`);
    if (type === "journal") {
      parts.push(`‘${title}’,`);
      let j = f.journal.trim();
      if (f.volume) j += `, ${f.volume}`;
      if (f.issue) j += `(${f.issue})`;
      if (f.pages) j += `, pp. ${f.pages}`;
      parts.push(dot(j));
    } else {
      parts.push(dot(title));
      if (pub) parts.push(dot(pub));
    }
    if (url) parts.push(`Available at: ${url}`);
    if (f.accessed) parts.push(`(Accessed: ${f.accessed}).`);
    return parts.join(" ");
  }

  /* Chicago (notes-bibliography, bibliography entry) */
  if (authors) parts.push(dot(authors));
  parts.push(type === "book" ? `${title}.` : `“${title}.”`);
  if (type === "journal") {
    let j = f.journal.trim();
    if (f.volume) j += ` ${f.volume}`;
    if (f.issue) j += `, no. ${f.issue}`;
    if (year) j += ` (${year})`;
    if (f.pages) j += `: ${f.pages}`;
    parts.push(dot(j));
  } else {
    if (f.city) parts.push(`${f.city}:`);
    if (pub) parts.push(`${pub},`);
    if (year) parts.push(`${year}.`);
  }
  if (url) parts.push(dot(url));
  return parts.join(" ");
}

function inText(style: Style, f: Fields): string {
  const a = parseAuthors(f.authors);
  const year = f.year.trim() || "n.d.";
  if (a.length === 0) return "";
  const name =
    a.length === 1
      ? a[0].surname
      : a.length === 2
        ? `${a[0].surname} ${style === "mla" ? "and" : "&"} ${a[1].surname}`
        : `${a[0].surname} et al.`;

  if (style === "mla") return `(${name}${f.pages ? ` ${f.pages}` : ""})`;
  if (style === "chicago") return `(${name} ${year}${f.pages ? `, ${f.pages}` : ""})`;
  return `(${name}, ${year}${f.pages ? `, p. ${f.pages}` : ""})`;
}

export default function CitationGenerator() {
  const [style, setStyle] = useState<Style>("apa");
  const [type, setType] = useState<SourceType>("website");
  const [f, setF] = useState<Fields>({
    authors: "",
    title: "",
    year: "",
    siteOrPublisher: "",
    url: "",
    accessed: "",
    journal: "",
    volume: "",
    issue: "",
    pages: "",
    edition: "",
    city: "",
  });

  const set = (patch: Partial<Fields>) => setF((s) => ({ ...s, ...patch }));

  const citation = useMemo(
    () => (f.title.trim() ? build(style, type, f) : ""),
    [style, type, f]
  );
  const inline = useMemo(() => inText(style, f), [style, f]);

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-4">
          {STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyle(s.id)}
              aria-pressed={style === s.id}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                style === s.id
                  ? "border-brand/40 bg-brand/10"
                  : "border-border bg-background-subtle hover:border-border"
              )}
            >
              <span
                className={cn(
                  "block text-sm font-semibold",
                  style === s.id ? "text-brand" : "text-foreground"
                )}
              >
                {s.label}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {s.note}
              </span>
            </button>
          ))}
        </div>

        <Field label="Source type" htmlFor="cg-type">
          <Select
            id="cg-type"
            value={type}
            onChange={(e) => setType(e.target.value as SourceType)}
            className="sm:max-w-56"
          >
            <option value="website">Website / web page</option>
            <option value="book">Book</option>
            <option value="journal">Journal article</option>
          </Select>
        </Field>
      </ToolPanel>

      <ToolPanel className="space-y-4">
        <Field
          label="Author(s)"
          htmlFor="cg-authors"
          hint="Separate multiple authors with a semicolon — Ada Lovelace; Alan Turing"
        >
          <Input
            id="cg-authors"
            value={f.authors}
            onChange={(e) => set({ authors: e.target.value })}
            placeholder="Ada Lovelace"
          />
        </Field>

        <Field label="Title" htmlFor="cg-title">
          <Input
            id="cg-title"
            value={f.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Notes on the Analytical Engine"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Year" htmlFor="cg-year">
            <Input
              id="cg-year"
              inputMode="numeric"
              value={f.year}
              onChange={(e) => set({ year: e.target.value })}
              placeholder="2024"
            />
          </Field>
          <Field
            label={
              type === "book"
                ? "Publisher"
                : type === "journal"
                  ? "Publisher (optional)"
                  : "Website name"
            }
            htmlFor="cg-pub"
          >
            <Input
              id="cg-pub"
              value={f.siteOrPublisher}
              onChange={(e) => set({ siteOrPublisher: e.target.value })}
              placeholder={type === "book" ? "Oxford University Press" : "TechInstant"}
            />
          </Field>
        </div>

        {type === "journal" && (
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Journal" htmlFor="cg-journal" className="sm:col-span-2">
              <Input
                id="cg-journal"
                value={f.journal}
                onChange={(e) => set({ journal: e.target.value })}
                placeholder="Nature"
              />
            </Field>
            <Field label="Volume" htmlFor="cg-vol">
              <Input id="cg-vol" value={f.volume} onChange={(e) => set({ volume: e.target.value })} />
            </Field>
            <Field label="Issue" htmlFor="cg-iss">
              <Input id="cg-iss" value={f.issue} onChange={(e) => set({ issue: e.target.value })} />
            </Field>
          </div>
        )}

        {type === "book" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Edition (optional)" htmlFor="cg-ed" hint="e.g. 2nd">
              <Input id="cg-ed" value={f.edition} onChange={(e) => set({ edition: e.target.value })} />
            </Field>
            {style === "chicago" && (
              <Field label="City" htmlFor="cg-city">
                <Input id="cg-city" value={f.city} onChange={(e) => set({ city: e.target.value })} placeholder="London" />
              </Field>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Page(s) (optional)" htmlFor="cg-pages" hint="e.g. 14 or 14-22">
            <Input id="cg-pages" value={f.pages} onChange={(e) => set({ pages: e.target.value })} />
          </Field>
          {type === "website" && (
            <Field label="Date accessed (optional)" htmlFor="cg-acc" hint="Required by MLA and Harvard">
              <Input
                id="cg-acc"
                value={f.accessed}
                onChange={(e) => set({ accessed: e.target.value })}
                placeholder="12 March 2026"
              />
            </Field>
          )}
        </div>

        {type !== "book" && (
          <Field label="URL (optional)" htmlFor="cg-url">
            <Input
              id="cg-url"
              type="url"
              value={f.url}
              onChange={(e) => set({ url: e.target.value })}
              placeholder="https://example.com/article"
            />
          </Field>
        )}
      </ToolPanel>

      {citation ? (
        <>
          <ToolPanel className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">
                Reference list entry
              </span>
              <CopyButton value={citation} />
            </div>
            <p className="rounded-lg bg-background-subtle p-3 text-[15px] leading-relaxed text-foreground">
              {citation}
            </p>
          </ToolPanel>

          {inline && (
            <ToolPanel className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  In-text citation
                </span>
                <CopyButton value={inline} />
              </div>
              <p className="rounded-lg bg-background-subtle p-3 font-mono text-sm text-foreground">
                {inline}
              </p>
            </ToolPanel>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Add at least a title to see the citation.
        </p>
      )}
    </div>
  );
}
