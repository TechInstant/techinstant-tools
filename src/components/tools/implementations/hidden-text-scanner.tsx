"use client";

import { useMemo, useState } from "react";
import { ShieldAlert, ShieldCheck, Loader2, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import {
  ToolPanel,
  Stat,
  ErrorNote,
  CopyButton,
} from "@/components/tools/tool-ui";
import { FileDrop } from "@/components/tools/file-drop";
import { loadPdfJs, describePdfError } from "@/lib/pdfjs";
import { cn } from "@/lib/utils";

/**
 * Invisible and formatting-control characters. These have legitimate uses in
 * Arabic, Hebrew and Indic scripts, so the tool reports them rather than
 * calling them malicious — context decides.
 */
const INVISIBLE: { code: number; name: string; note: string }[] = [
  { code: 0x200b, name: "Zero-width space", note: "Often used to hide text or break up words" },
  { code: 0x200c, name: "Zero-width non-joiner", note: "Legitimate in some scripts" },
  { code: 0x200d, name: "Zero-width joiner", note: "Legitimate in some scripts and emoji" },
  { code: 0x2060, name: "Word joiner", note: "Invisible" },
  { code: 0xfeff, name: "Zero-width no-break space", note: "Byte-order mark inside text" },
  { code: 0x00ad, name: "Soft hyphen", note: "Invisible unless the line wraps" },
  { code: 0x180e, name: "Mongolian vowel separator", note: "Invisible" },
  { code: 0x202a, name: "Left-to-right embedding", note: "Can reorder how text displays" },
  { code: 0x202b, name: "Right-to-left embedding", note: "Can reorder how text displays" },
  { code: 0x202d, name: "Left-to-right override", note: "Can make text display in a different order than it is stored" },
  { code: 0x202e, name: "Right-to-left override", note: "Can make text display in a different order than it is stored" },
  { code: 0x2066, name: "Left-to-right isolate", note: "Can reorder how text displays" },
  { code: 0x2067, name: "Right-to-left isolate", note: "Can reorder how text displays" },
  { code: 0x2069, name: "Pop directional isolate", note: "Ends a reordering sequence" },
];

const INVISIBLE_RE = new RegExp(
  `[${INVISIBLE.map((c) => `\\u${c.code.toString(16).padStart(4, "0")}`).join("")}]`,
  "g"
);

/**
 * Phrases that try to redirect an AI reading the document. Matched case
 * insensitively on whole phrases to keep false positives low — ordinary prose
 * does not contain "ignore all previous instructions".
 */
const INJECTION_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\bignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)\b/gi, label: "Instruction override" },
  { re: /\bdisregard\s+(all\s+)?(previous|prior|above|the)\s+\w+/gi, label: "Instruction override" },
  { re: /\bforget\s+(everything|all)\b/gi, label: "Instruction override" },
  { re: /\byou\s+are\s+now\s+(a|an)\b/gi, label: "Role reassignment" },
  { re: /\bact\s+as\s+(if\s+you\s+are\s+)?(a|an)\s+\w+/gi, label: "Role reassignment" },
  { re: /\bsystem\s*(prompt|message|instruction)\b/gi, label: "System-prompt reference" },
  { re: /\b(give|award|assign)\s+(this|it|the\s+\w+)\s+(a\s+)?(full|top|highest|maximum|perfect)\s*(marks?|grade|score)\b/gi, label: "Grade manipulation" },
  { re: /\b(do\s+not|don't|never)\s+(mention|reveal|disclose|report)\b/gi, label: "Concealment instruction" },
  { re: /\bas\s+an?\s+(ai|language\s+model)\b/gi, label: "Model addressing" },
  { re: /\boutput\s+only\b/gi, label: "Output constraint" },
];

interface Finding {
  kind: "invisible" | "injection" | "tiny" | "offpage";
  label: string;
  detail: string;
  count: number;
}

function scanText(text: string): Finding[] {
  const findings: Finding[] = [];

  /* Invisible characters, grouped by which one. */
  const counts = new Map<number, number>();
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (INVISIBLE.some((i) => i.code === code)) {
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
  }
  for (const [code, count] of counts) {
    const meta = INVISIBLE.find((i) => i.code === code)!;
    findings.push({
      kind: "invisible",
      label: meta.name,
      detail: `${meta.note}. U+${code.toString(16).toUpperCase().padStart(4, "0")}`,
      count,
    });
  }

  for (const { re, label } of INJECTION_PATTERNS) {
    const matches = [...text.matchAll(re)];
    if (matches.length === 0) continue;
    findings.push({
      kind: "injection",
      label,
      detail: `“${matches[0][0].trim().slice(0, 90)}”`,
      count: matches.length,
    });
  }

  return findings;
}

export default function HiddenTextScanner() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pdfFindings, setPdfFindings] = useState<Finding[]>([]);
  const [source, setSource] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  const textFindings = useMemo(() => (scanned ? scanText(text) : []), [text, scanned]);
  const findings = [...textFindings, ...pdfFindings];

  const cleaned = useMemo(() => text.replace(INVISIBLE_RE, ""), [text]);
  const removedCount = text.length - cleaned.length;

  const onPdf = async (files: File[]) => {
    const file = files[0];
    setBusy(true);
    setError("");
    setPdfFindings([]);
    setScanned(false);

    try {
      const pdfjs = await loadPdfJs();
      const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
      const doc = await task.promise;

      let all = "";
      let tiny = 0;
      let offpage = 0;

      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        const view = page.getViewport({ scale: 1 });
        const content = await page.getTextContent();

        for (const item of content.items) {
          if (!("str" in item)) continue;
          all += item.str + " ";

          /* transform[3] is the vertical scale, i.e. the rendered font size. */
          const size = Math.abs(item.transform?.[3] ?? 12);
          if (size > 0 && size < 3) tiny += 1;

          const x = item.transform?.[4] ?? 0;
          const y = item.transform?.[5] ?? 0;
          if (x < -5 || y < -5 || x > view.width + 5 || y > view.height + 5) offpage += 1;
        }
      }

      await task.destroy();

      const found = scanText(all);
      if (tiny > 0) {
        found.push({
          kind: "tiny",
          label: "Text smaller than 3pt",
          detail: "Too small to read on screen or in print — a common way to hide instructions in a document.",
          count: tiny,
        });
      }
      if (offpage > 0) {
        found.push({
          kind: "offpage",
          label: "Text positioned outside the page",
          detail: "Sits beyond the visible page area, so it never appears when read or printed.",
          count: offpage,
        });
      }

      setPdfFindings(found);
      setText(all.trim());
      setSource(file.name);
      setScanned(true);
    } catch (err) {
      setError(describePdfError(err));
    } finally {
      setBusy(false);
    }
  };

  const clean = findings.length === 0;

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="hts-text" className="text-sm font-medium text-foreground">
            Paste text to check
          </label>
          {source && (
            <span className="text-xs text-muted-foreground">
              Extracted from {source}
            </span>
          )}
        </div>
        <Textarea
          id="hts-text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setScanned(false);
            setPdfFindings([]);
            setSource(null);
          }}
          placeholder="Paste an assignment, a CV, an email or any text you want to inspect…"
          className="min-h-40"
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setScanned(true)} disabled={!text.trim() || busy}>
            {busy ? <Loader2 className="animate-spin" /> : <ShieldAlert />}
            Scan text
          </Button>
          {text && (
            <Button
              variant="ghost"
              onClick={() => {
                setText("");
                setScanned(false);
                setPdfFindings([]);
                setSource(null);
                setError("");
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </ToolPanel>

      <ToolPanel>
        <p className="mb-3 text-sm font-medium text-foreground">…or scan a PDF</p>
        <FileDrop
          accept="application/pdf,.pdf"
          extensions={[".pdf"]}
          mimePrefixes={["application/pdf"]}
          hint="Checks for invisible characters, unreadably small text, and text placed off the page."
          onFiles={onPdf}
          onError={setError}
        />
      </ToolPanel>

      {error && <ErrorNote>{error}</ErrorNote>}

      {scanned && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Characters" value={text.length.toLocaleString()} />
            <Stat label="Findings" value={findings.length} />
            <Stat label="Invisible chars" value={removedCount} />
          </div>

          <ToolPanel>
            <div
              className={cn(
                "flex items-start gap-3 rounded-lg p-3",
                clean ? "bg-brand/5" : "bg-amber-500/5"
              )}
            >
              {clean ? (
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              ) : (
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              )}
              <div>
                <p className="font-semibold text-foreground">
                  {clean
                    ? "Nothing hidden found"
                    : `${findings.length} thing${findings.length === 1 ? "" : "s"} worth a look`}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {clean
                    ? "No invisible characters, no unreadably small text, and no phrases that look aimed at an AI reader."
                    : "These are observations, not a verdict. Some have innocent explanations — read the detail before drawing a conclusion."}
                </p>
              </div>
            </div>

            {findings.length > 0 && (
              <ul className="mt-4 space-y-2">
                {findings.map((f, i) => (
                  <li
                    key={`${f.label}-${i}`}
                    className="rounded-lg border border-border bg-background-subtle p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {f.label}
                      </span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {f.count} {f.count === 1 ? "occurrence" : "occurrences"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{f.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </ToolPanel>

          {removedCount > 0 && (
            <ToolPanel className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  Cleaned text — {removedCount} invisible character
                  {removedCount === 1 ? "" : "s"} removed
                </span>
                <div className="flex gap-2">
                  <CopyButton value={cleaned} />
                  <Button variant="outline" size="sm" onClick={() => setText(cleaned)}>
                    <Eraser />
                    Replace above
                  </Button>
                </div>
              </div>
              <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-lg bg-background-subtle p-3 text-[13px] text-foreground">
                {cleaned}
              </pre>
            </ToolPanel>
          )}
        </>
      )}
    </div>
  );
}
