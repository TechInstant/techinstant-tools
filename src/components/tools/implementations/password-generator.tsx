"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel, CopyButton, ErrorNote } from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

const SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
};

type SetKey = keyof typeof SETS;

const LABELS: Record<SetKey, string> = {
  uppercase: "Uppercase (A–Z)",
  lowercase: "Lowercase (a–z)",
  numbers: "Numbers (0–9)",
  symbols: "Symbols (!@#…)",
};

/**
 * Picks an index in [0, max) from crypto randomness without modulo bias:
 * values in the final, incomplete bucket are rejected and redrawn.
 */
function secureIndex(max: number) {
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);
  return value % max;
}

function strengthOf(password: string, poolSize: number) {
  /* Entropy in bits = length × log2(pool size). */
  const bits = password.length * Math.log2(Math.max(poolSize, 2));
  if (bits < 45) return { label: "Weak", tone: "text-red-600 dark:text-red-400", pct: 25 };
  if (bits < 70) return { label: "Fair", tone: "text-amber-600 dark:text-amber-400", pct: 50 };
  if (bits < 100) return { label: "Strong", tone: "text-brand", pct: 75 };
  return { label: "Very strong", tone: "text-brand", pct: 100 };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [enabled, setEnabled] = useState<Record<SetKey, boolean>>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(() => {
    const active = (Object.keys(SETS) as SetKey[]).filter((k) => enabled[k]);
    if (active.length === 0) {
      setError("Choose at least one character type.");
      setPassword("");
      return;
    }
    setError(null);

    const pool = active.map((k) => SETS[k]).join("");

    /* Guarantee at least one character from each selected set, then fill the
       rest from the whole pool and shuffle so the guaranteed ones aren't
       always at the front. */
    const chars: string[] = active.map(
      (k) => SETS[k][secureIndex(SETS[k].length)]
    );
    while (chars.length < length) chars.push(pool[secureIndex(pool.length)]);

    for (let i = chars.length - 1; i > 0; i--) {
      const j = secureIndex(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    setPassword(chars.slice(0, length).join(""));
  }, [length, enabled]);

  useEffect(() => {
    generate();
  }, [generate]);

  const poolSize = (Object.keys(SETS) as SetKey[])
    .filter((k) => enabled[k])
    .reduce((n, k) => n + SETS[k].length, 0);
  const strength = strengthOf(password, poolSize);

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <output
            className={cn(
              "min-h-12 flex-1 break-all rounded-lg border border-border bg-background-subtle px-3 py-3 font-mono text-base",
              password ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {password || "—"}
          </output>
          <div className="flex gap-2">
            <Button onClick={generate} aria-label="Generate a new password">
              <RefreshCw />
              Generate
            </Button>
            <CopyButton value={password} size="md" />
          </div>
        </div>

        {password && (
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  strength.pct <= 25
                    ? "bg-red-500"
                    : strength.pct <= 50
                      ? "bg-amber-500"
                      : "bg-brand-solid"
                )}
                style={{ width: `${strength.pct}%` }}
              />
            </div>
            <span className={cn("text-sm font-semibold", strength.tone)}>
              {strength.label}
            </span>
          </div>
        )}

        {error && <ErrorNote>{error}</ErrorNote>}
      </ToolPanel>

      <ToolPanel className="space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="pw-length" className="text-sm font-medium text-foreground">
              Length
            </label>
            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
              {length}
            </span>
          </div>
          <input
            id="pw-length"
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--brand-solid)]"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-foreground">
            Include
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {(Object.keys(SETS) as SetKey[]).map((key) => (
              <label
                key={key}
                className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-background-subtle px-3 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  checked={enabled[key]}
                  onChange={(e) =>
                    setEnabled((s) => ({ ...s, [key]: e.target.checked }))
                  }
                  className="h-4 w-4 accent-[var(--brand-solid)]"
                />
                {LABELS[key]}
              </label>
            ))}
          </div>
        </fieldset>
      </ToolPanel>

      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        Passwords are generated on your device with the browser&apos;s
        cryptographic random number generator. Nothing is sent anywhere and
        nothing is stored — close the tab and it is gone.
      </p>
    </div>
  );
}
