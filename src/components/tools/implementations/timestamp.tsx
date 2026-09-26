"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import {
  ToolPanel,
  Field,
  CopyButton,
  ErrorNote,
} from "@/components/tools/tool-ui";

type Unit = "s" | "ms";

const pad = (n: number) => String(n).padStart(2, "0");

/** Format a Date as the value a datetime-local input expects. */
const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

export default function TimestampConverter() {
  /* Starts null so the server-rendered HTML and the first client render agree;
     reading the clock during render would be a hydration mismatch. */
  const [now, setNow] = useState<number | null>(null);
  const [unit, setUnit] = useState<Unit>("s");
  const [stamp, setStamp] = useState("");
  const [human, setHuman] = useState("");

  /* Live clock for the "current timestamp" readout. */
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const stampNumber = stamp.trim() === "" ? null : Number(stamp.trim());
  const stampValid =
    stampNumber !== null && Number.isFinite(stampNumber) && stamp.trim() !== "";
  const stampDate = stampValid
    ? new Date(unit === "s" ? stampNumber * 1000 : stampNumber)
    : null;
  const stampDateValid = stampDate != null && !Number.isNaN(stampDate.getTime());

  const humanDate = human ? new Date(human) : null;
  const humanValid = humanDate != null && !Number.isNaN(humanDate.getTime());
  const humanStamp = humanValid
    ? unit === "s"
      ? Math.floor(humanDate.getTime() / 1000)
      : humanDate.getTime()
    : null;

  const currentValue =
    now === null ? null : unit === "s" ? Math.floor(now / 1000) : now;

  return (
    <div className="space-y-4">
      <ToolPanel className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            Current timestamp
          </div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-foreground">
            {currentValue ?? "—"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            aria-label="Timestamp unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="w-auto"
          >
            <option value="s">Seconds</option>
            <option value="ms">Milliseconds</option>
          </Select>
          <CopyButton value={currentValue === null ? "" : String(currentValue)} size="md" />
        </div>
      </ToolPanel>

      <ToolPanel className="space-y-3">
        <Field
          label="Timestamp → date"
          htmlFor="ts-stamp"
          hint={`Enter a Unix timestamp in ${unit === "s" ? "seconds" : "milliseconds"}.`}
        >
          <div className="flex gap-2">
            <Input
              id="ts-stamp"
              inputMode="numeric"
              value={stamp}
              onChange={(e) => setStamp(e.target.value)}
              placeholder={currentValue === null ? "" : String(currentValue)}
              className="font-mono"
            />
            <Button
              variant="outline"
              disabled={currentValue === null}
              onClick={() => currentValue !== null && setStamp(String(currentValue))}
            >
              Now
            </Button>
          </div>
        </Field>

        {stamp.trim() !== "" && !stampDateValid && (
          <ErrorNote>
            That isn&apos;t a timestamp we can read. Enter digits only — try
            switching between seconds and milliseconds.
          </ErrorNote>
        )}

        {stampDateValid && stampDate && (
          <div className="space-y-2 rounded-lg bg-background-subtle p-3">
            <Row
              label="Local"
              value={stampDate.toLocaleString(undefined, {
                dateStyle: "full",
                timeStyle: "medium",
              })}
            />
            <Row label="UTC" value={stampDate.toUTCString()} />
            <Row label="ISO 8601" value={stampDate.toISOString()} />
          </div>
        )}
      </ToolPanel>

      <ToolPanel className="space-y-3">
        <Field label="Date → timestamp" htmlFor="ts-human">
          <div className="flex gap-2">
            <Input
              id="ts-human"
              type="datetime-local"
              step={1}
              value={human}
              onChange={(e) => setHuman(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => setHuman(toLocalInput(new Date()))}
            >
              Now
            </Button>
          </div>
        </Field>

        {humanValid && humanStamp != null && (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-background-subtle p-3">
            <code className="font-mono text-lg font-bold tabular-nums text-foreground">
              {humanStamp}
            </code>
            <CopyButton value={String(humanStamp)} />
          </div>
        )}
      </ToolPanel>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="font-mono text-[13px] text-foreground">{value}</span>
    </div>
  );
}
