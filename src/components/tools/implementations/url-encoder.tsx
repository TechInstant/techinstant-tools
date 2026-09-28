"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea, Select } from "@/components/ui/input";
import { ToolPanel, Field, CopyButton, ErrorNote } from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

type Direction = "encode" | "decode";
type Scope = "component" | "full";

/**
 * Both encoding functions exist for a reason, and picking the wrong one is the
 * most common URL bug there is:
 *
 *  - encodeURIComponent escapes / ? : @ & = + $ #, so it is correct for a single
 *    query value or path segment.
 *  - encodeURI leaves those alone, so it is correct for a whole URL you want to
 *    keep working.
 *
 * Encoding a whole URL with encodeURIComponent breaks it; encoding a query value
 * with encodeURI leaves an & that silently splits your parameter in two.
 */
export default function UrlEncoder() {
  const [direction, setDirection] = useState<Direction>("encode");
  const [scope, setScope] = useState<Scope>("component");
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      if (direction === "encode") {
        return {
          output: scope === "component" ? encodeURIComponent(input) : encodeURI(input),
          error: "",
        };
      }
      return {
        output: scope === "component" ? decodeURIComponent(input) : decodeURI(input),
        error: "",
      };
    } catch {
      return {
        output: "",
        error:
          "That is not valid percent-encoding. A stray % that is not followed by two hex digits is the usual cause — try encoding instead.",
      };
    }
  }, [input, direction, scope]);

  /* When the input looks like a URL, breaking out its parts is usually what
     someone actually wanted to see. */
  const parts = useMemo(() => {
    const candidate = direction === "decode" ? result.output : input;
    if (!candidate || !/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate.trim())) return null;
    try {
      const url = new URL(candidate.trim());
      const params = [...url.searchParams.entries()];
      return {
        protocol: url.protocol.replace(":", ""),
        host: url.host,
        path: url.pathname,
        hash: url.hash.replace("#", ""),
        params,
      };
    } catch {
      return null;
    }
  }, [input, direction, result.output]);

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <div className="flex rounded-lg border border-border bg-muted p-0.5">
          {(["encode", "decode"] as Direction[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              aria-pressed={direction === d}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-semibold capitalize transition-colors",
                direction === d
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <Field
          label="Scope"
          htmlFor="ue-scope"
          hint={
            scope === "component"
              ? "For one query value or path segment. Escapes / ? : @ & = + $ # as well."
              : "For a whole URL. Leaves the structural characters alone so the link still works."
          }
        >
          <Select
            id="ue-scope"
            value={scope}
            onChange={(e) => setScope(e.target.value as Scope)}
          >
            <option value="component">Component — one parameter or segment</option>
            <option value="full">Full URL — keep the structure</option>
          </Select>
        </Field>

        <Field label={direction === "encode" ? "Plain text" : "Encoded text"} htmlFor="ue-in">
          <Textarea
            id="ue-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              direction === "encode"
                ? "https://example.com/search?q=café & more"
                : "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dcaf%C3%A9"
            }
            className="min-h-28 font-mono text-sm"
            spellCheck={false}
          />
        </Field>

        {input && (
          <Button
            variant="outline"
            onClick={() => {
              setInput(result.output);
              setDirection(direction === "encode" ? "decode" : "encode");
            }}
            disabled={!result.output}
          >
            <ArrowUpDown />
            Send result back up
          </Button>
        )}
      </ToolPanel>

      {result.error && <ErrorNote>{result.error}</ErrorNote>}

      {result.output && (
        <ToolPanel>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              {direction === "encode" ? "Encoded" : "Decoded"}
            </h2>
            <CopyButton value={result.output} />
          </div>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-background-subtle p-4 font-mono text-sm text-foreground">
            {result.output}
          </pre>
        </ToolPanel>
      )}

      {parts && (
        <ToolPanel>
          <h2 className="text-base font-bold tracking-tight text-foreground">
            URL breakdown
          </h2>
          <dl className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
            <Row label="Protocol" value={parts.protocol} />
            <Row label="Host" value={parts.host} />
            <Row label="Path" value={parts.path} />
            {parts.hash && <Row label="Fragment" value={parts.hash} />}
          </dl>

          {parts.params.length > 0 && (
            <>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                Query parameters ({parts.params.length})
              </h3>
              <dl className="mt-2 divide-y divide-border overflow-hidden rounded-lg border border-border">
                {parts.params.map(([k, v], i) => (
                  <Row key={`${k}-${i}`} label={k} value={v || "(empty)"} />
                ))}
              </dl>
            </>
          )}
        </ToolPanel>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-background-subtle px-4 py-2.5 sm:flex-row sm:gap-4">
      <dt className="w-40 shrink-0 break-words text-xs font-medium text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 break-all font-mono text-sm text-foreground">{value}</dd>
    </div>
  );
}
