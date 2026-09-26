"use client";

import { useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { ToolPanel, CopyButton, ErrorNote } from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

type Mode = "encode" | "decode";

/* btoa/atob are latin1-only, so text is routed through UTF-8 first. Without
   this, any non-ASCII character (é, emoji, non-Latin scripts) throws. */
const encode = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
};

const decode = (b64: string) => {
  const binary = atob(b64.trim());
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = (value: string, m: Mode) => {
    setInput(value);
    setError(null);
    if (!value.trim()) {
      setOutput("");
      return;
    }
    try {
      setOutput(m === "encode" ? encode(value) : decode(value));
    } catch {
      setOutput("");
      setError(
        m === "decode"
          ? "That doesn't look like valid Base64. Check for stray characters or missing padding."
          : "That text could not be encoded."
      );
    }
  };

  const swap = () => {
    const next: Mode = mode === "encode" ? "decode" : "encode";
    setMode(next);
    /* Feed the current output back in, so flipping the mode round-trips. */
    run(output || "", next);
  };

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-3">
        <div
          className="flex rounded-lg border border-border bg-muted p-0.5"
          role="tablist"
        >
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                run(input, m);
              }}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-semibold capitalize transition-colors",
                mode === m
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <Textarea
          value={input}
          onChange={(e) => run(e.target.value, mode)}
          spellCheck={false}
          placeholder={
            mode === "encode"
              ? "Text to encode…"
              : "Base64 to decode, e.g. VGVjaEluc3RhbnQ="
          }
          className={cn("min-h-36", mode === "decode" && "font-mono text-[13px]")}
        />

        {error && <ErrorNote>{error}</ErrorNote>}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={swap} disabled={!output}>
            <ArrowDownUp />
            Use result as input
          </Button>
          {input && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setInput("");
                setOutput("");
                setError(null);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </ToolPanel>

      {output && (
        <ToolPanel className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">Result</span>
            <CopyButton value={output} />
          </div>
          <pre
            className={cn(
              "max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-background-subtle p-3 text-[13px] text-foreground",
              mode === "encode" && "font-mono"
            )}
          >
            {output}
          </pre>
          <p className="text-xs text-muted-foreground">
            {output.length.toLocaleString()} characters
          </p>
        </ToolPanel>
      )}
    </div>
  );
}
