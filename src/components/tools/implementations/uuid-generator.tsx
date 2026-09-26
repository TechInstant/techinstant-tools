"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ToolPanel,
  CopyButton,
  DownloadButton,
} from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

const COUNTS = [1, 5, 10, 50, 100];

/**
 * randomUUID is the right call where it exists (secure context only). The
 * fallback builds a v4 from crypto.getRandomValues with the correct version
 * and variant bits, so output is valid either way.
 */
function uuidV4() {
  /* Checked via typeof rather than `in`, because the Crypto type always
     declares randomUUID even though older/insecure contexts lack it. */
  const native = typeof crypto.randomUUID === "function" ? crypto.randomUUID : null;
  if (native) return native.call(crypto);

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20
  )}-${hex.slice(20)}`;
}

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);

  const generate = useCallback(() => {
    setUuids(Array.from({ length: count }, uuidV4));
  }, [count]);

  useEffect(() => {
    generate();
  }, [generate]);

  const shown = uppercase ? uuids.map((u) => u.toUpperCase()) : uuids;
  const asText = shown.join("\n");

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">How many</span>
          {COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              aria-pressed={count === n}
              className={cn(
                "min-w-11 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                count === n
                  ? "border-brand/40 bg-brand/10 text-brand"
                  : "border-border bg-background-subtle text-muted-foreground hover:text-foreground"
              )}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={generate}>
            <RefreshCw />
            Generate
          </Button>
          <CopyButton
            value={asText}
            label={count === 1 ? "Copy" : "Copy all"}
            size="md"
          />
          <DownloadButton value={asText} filename="uuids.txt" />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="h-4 w-4 accent-[var(--brand-solid)]"
            />
            Uppercase
          </label>
        </div>
      </ToolPanel>

      <ToolPanel className="space-y-1.5">
        {shown.map((id, i) => (
          <div
            key={`${id}-${i}`}
            className="flex items-center justify-between gap-3 rounded-lg bg-background-subtle px-3 py-2"
          >
            <code className="break-all font-mono text-[13px] text-foreground">
              {id}
            </code>
            <CopyButton value={id} label="" className="shrink-0 px-2" />
          </div>
        ))}
      </ToolPanel>

      <p className="text-sm text-muted-foreground">
        Version 4 UUIDs, generated on your device with the browser&apos;s
        cryptographic random number generator.
      </p>
    </div>
  );
}
