"use client";

import { useState } from "react";
import { Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import {
  ToolPanel,
  CopyButton,
  DownloadButton,
  ErrorNote,
  Stat,
} from "@/components/tools/tool-ui";
import { formatBytes } from "@/lib/utils";

export default function JsonMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const minify = () => {
    if (!input.trim()) {
      setError("Paste some JSON first.");
      setOutput("");
      return;
    }
    try {
      setOutput(JSON.stringify(JSON.parse(input)));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid JSON";
      setError(`This isn't valid JSON — ${message}`);
      setOutput("");
    }
  };

  const savedBytes = output ? input.length - output.length : 0;
  const savedPct =
    output && input.length > 0
      ? Math.max(0, Math.round((savedBytes / input.length) * 100))
      : 0;

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-3">
        <label htmlFor="jm-input" className="block text-sm font-medium text-foreground">
          Your JSON
        </label>
        <Textarea
          id="jm-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
          }}
          spellCheck={false}
          placeholder={`{\n  "hello": "world"\n}`}
          className="min-h-48 font-mono text-[13px]"
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={minify}>
            <Minimize2 />
            Minify
          </Button>
          {input && (
            <Button
              variant="ghost"
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

        {error && <ErrorNote>{error}</ErrorNote>}
      </ToolPanel>

      {output && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Before" value={formatBytes(input.length)} />
            <Stat label="After" value={formatBytes(output.length)} />
            <Stat label="Saved" value={`${savedPct}%`} />
          </div>

          <ToolPanel className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">Minified</span>
              <div className="flex gap-2">
                <CopyButton value={output} />
                <DownloadButton
                  value={output}
                  filename="minified.json"
                  mime="application/json"
                />
              </div>
            </div>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-background-subtle p-3 font-mono text-[13px] text-foreground">
              {output}
            </pre>
          </ToolPanel>
        </>
      )}
    </div>
  );
}
