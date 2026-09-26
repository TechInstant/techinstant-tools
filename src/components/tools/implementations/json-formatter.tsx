"use client";

import { useMemo, useState } from "react";
import { Braces, Minimize2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea, Select } from "@/components/ui/input";
import {
  ToolPanel,
  CopyButton,
  DownloadButton,
  ErrorNote,
} from "@/components/tools/tool-ui";

const SAMPLE = `{"name":"TechInstant","tools":20,"free":true,"tags":["pdf","image","dev"]}`;

/**
 * Turns a JSON parse failure into something a human can act on: SyntaxError
 * messages include a character position, so we convert that into line/column
 * and show the offending line.
 */
function describeError(err: unknown, source: string) {
  const message = err instanceof Error ? err.message : "Invalid JSON";

  const posMatch = message.match(/position (\d+)/i);
  if (!posMatch) return { message, line: null as number | null, snippet: "" };

  const pos = Number(posMatch[1]);
  const before = source.slice(0, pos);
  const line = before.split("\n").length;
  const column = pos - before.lastIndexOf("\n");
  const snippet = source.split("\n")[line - 1]?.trim().slice(0, 80) ?? "";

  return {
    message: message.replace(/\s*in JSON at position \d+.*/i, ""),
    line,
    column,
    snippet,
  };
}

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState("2");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<ReturnType<typeof describeError> | null>(
    null
  );
  const [valid, setValid] = useState(false);

  const stats = useMemo(() => {
    if (!output) return null;
    return {
      chars: output.length,
      lines: output.split("\n").length,
    };
  }, [output]);

  const run = (mode: "format" | "minify") => {
    setValid(false);
    if (!input.trim()) {
      setError({ message: "Paste some JSON first.", line: null, snippet: "" });
      setOutput("");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const result =
        mode === "minify"
          ? JSON.stringify(parsed)
          : JSON.stringify(parsed, null, indent === "tab" ? "\t" : Number(indent));
      setOutput(result);
      setError(null);
      setValid(true);
    } catch (err) {
      setError(describeError(err, input));
      setOutput("");
    }
  };

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="json-input" className="text-sm font-medium text-foreground">
            Your JSON
          </label>
          <button
            type="button"
            onClick={() => setInput(SAMPLE)}
            className="text-xs font-medium text-brand hover:underline"
          >
            Paste a sample
          </button>
        </div>

        <Textarea
          id="json-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
            setValid(false);
          }}
          spellCheck={false}
          placeholder={`{\n  "hello": "world"\n}`}
          className="min-h-48 font-mono text-[13px]"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => run("format")}>
            <Braces />
            Format
          </Button>
          <Button variant="outline" onClick={() => run("minify")}>
            <Minimize2 />
            Minify
          </Button>
          <Select
            aria-label="Indentation"
            value={indent}
            onChange={(e) => setIndent(e.target.value)}
            className="h-11 w-auto"
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </Select>
          {input && (
            <Button
              variant="ghost"
              onClick={() => {
                setInput("");
                setOutput("");
                setError(null);
                setValid(false);
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {error && (
          <ErrorNote>
            {error.message}
            {error.line != null && (
              <>
                {" "}
                <span className="font-medium">
                  (line {error.line}, column {error.column})
                </span>
                {error.snippet && (
                  <span className="mt-1 block font-mono text-xs opacity-80">
                    {error.snippet}
                  </span>
                )}
              </>
            )}
          </ErrorNote>
        )}

        {valid && !error && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-brand">
            <Check className="h-4 w-4" />
            Valid JSON
          </p>
        )}
      </ToolPanel>

      {output && (
        <ToolPanel className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">Result</span>
            <div className="flex gap-2">
              <CopyButton value={output} />
              <DownloadButton
                value={output}
                filename="formatted.json"
                mime="application/json"
              />
            </div>
          </div>

          <pre className="max-h-96 overflow-auto rounded-lg bg-background-subtle p-3 font-mono text-[13px] leading-relaxed text-foreground">
            {output}
          </pre>

          {stats && (
            <p className="text-xs text-muted-foreground">
              {stats.lines.toLocaleString()} lines ·{" "}
              {stats.chars.toLocaleString()} characters
            </p>
          )}
        </ToolPanel>
      )}
    </div>
  );
}
