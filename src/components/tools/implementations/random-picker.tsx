"use client";

import { useMemo, useState } from "react";
import { Shuffle, Users, Dice5, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ToolPanel, Field, CopyButton, ErrorNote } from "@/components/tools/tool-ui";
import { SpinWheel } from "@/components/tools/spin-wheel";
import { cn } from "@/lib/utils";

type Mode = "pick" | "shuffle" | "teams" | "number";

/**
 * Uses `crypto.getRandomValues` rather than `Math.random`.
 *
 * For a prize draw or picking who presents first, people are entitled to a
 * result that is not merely "random enough" — and the modulo rejection below
 * is what stops the low indices coming up very slightly more often.
 */
function randomInt(maxExclusive: number) {
  if (maxExclusive <= 0) return 0;
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    return Math.floor(Math.random() * maxExclusive);
  }
  const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  let value = 0;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);
  return value % maxExclusive;
}

/** Fisher–Yates, which is the only shuffle that is actually uniform. */
function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function RandomPicker() {
  const [mode, setMode] = useState<Mode>("pick");
  const [raw, setRaw] = useState("");
  const [howMany, setHowMany] = useState("1");
  const [teamCount, setTeamCount] = useState("2");
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [noRepeat, setNoRepeat] = useState(true);

  const [picked, setPicked] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[][]>([]);
  const [number, setNumber] = useState<number | null>(null);
  const [drawn, setDrawn] = useState<string[]>([]);
  const [error, setError] = useState("");

  /* Wheel state. `wheelWinner` is an index into the pool the wheel is showing,
     decided by the same cryptographic draw as everything else — the animation
     only reveals it. `spinId` increments so drawing the same name twice still
     re-animates. */
  const [useWheel, setUseWheel] = useState(true);
  const [wheelWinner, setWheelWinner] = useState<number | null>(null);
  const [spinId, setSpinId] = useState(0);
  const [revealed, setRevealed] = useState(true);

  const entries = useMemo(
    () =>
      raw
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [raw]
  );

  const remaining = useMemo(
    () => (noRepeat ? entries.filter((e) => !drawn.includes(e)) : entries),
    [entries, drawn, noRepeat]
  );

  /* The wheel is only meaningful for a single draw from a list you can read. */
  const wheelPool = remaining;
  const wheelAvailable =
    mode === "pick" &&
    useWheel &&
    Math.max(1, Math.floor(Number(howMany) || 1)) === 1 &&
    wheelPool.length >= 2;

  const reset = () => {
    setPicked([]);
    setOrder([]);
    setTeams([]);
    setNumber(null);
    setDrawn([]);
    setError("");
    setWheelWinner(null);
    setSpinId(0);
    setRevealed(true);
  };

  const run = () => {
    setError("");

    if (mode === "number") {
      const lo = Math.ceil(Number(min));
      const hi = Math.floor(Number(max));
      if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
        setError("Enter two whole numbers.");
        return;
      }
      if (hi < lo) {
        setError("The highest number has to be at least the lowest.");
        return;
      }
      setNumber(lo + randomInt(hi - lo + 1));
      return;
    }

    if (entries.length === 0) {
      setError("Add some names or items first — one per line, or separated by commas.");
      return;
    }

    if (mode === "pick") {
      const want = Math.max(1, Math.floor(Number(howMany) || 1));
      const pool = remaining;
      if (pool.length === 0) {
        setError("Everyone has been picked. Reset to start the draw again.");
        return;
      }

      /* Single draw on the wheel: choose the winner now, then let the wheel
         rotate to it. The result is never read off the animation. */
      if (wheelAvailable) {
        const index = randomInt(pool.length);
        setWheelWinner(index);
        setRevealed(false);
        setPicked([]);
        setSpinId((n) => n + 1);
        return;
      }

      const result = shuffled(pool).slice(0, Math.min(want, pool.length));
      setPicked(result);
      if (noRepeat) setDrawn((d) => [...d, ...result]);
      return;
    }

    if (mode === "shuffle") {
      setOrder(shuffled(entries));
      return;
    }

    const count = Math.max(2, Math.floor(Number(teamCount) || 2));
    if (count > entries.length) {
      setError(
        `You have ${entries.length} ${entries.length === 1 ? "name" : "names"} but asked for ${count} teams.`
      );
      return;
    }
    /* Dealing round-robin from a shuffled list keeps the sizes within one of
       each other without any extra balancing step. */
    const buckets: string[][] = Array.from({ length: count }, () => []);
    shuffled(entries).forEach((name, i) => buckets[i % count].push(name));
    setTeams(buckets);
  };

  /* Called when the wheel stops. Committing the result here, rather than when
     the spin starts, keeps "9 still in the draw" from updating mid-animation and
     giving the answer away. */
  const handleSpinEnd = () => {
    if (wheelWinner == null) return;
    const winner = wheelPool[wheelWinner];
    if (!winner) return;
    setPicked([winner]);
    setRevealed(true);
    if (noRepeat) setDrawn((d) => [...d, winner]);
  };

  const MODES: { id: Mode; label: string; icon: typeof Trophy }[] = [
    { id: "pick", label: "Pick a winner", icon: Trophy },
    { id: "shuffle", label: "Shuffle order", icon: Shuffle },
    { id: "teams", label: "Make teams", icon: Users },
    { id: "number", label: "Random number", icon: Dice5 },
  ];

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id);
                  reset();
                }}
                aria-pressed={mode === m.id}
                className={cn(
                  "flex min-h-11 flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs font-semibold transition-colors",
                  mode === m.id
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-border bg-background-subtle text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>

        {mode === "number" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Lowest" htmlFor="rp-min">
              <Input
                id="rp-min"
                type="number"
                inputMode="numeric"
                value={min}
                onChange={(e) => setMin(e.target.value)}
              />
            </Field>
            <Field label="Highest" htmlFor="rp-max">
              <Input
                id="rp-max"
                type="number"
                inputMode="numeric"
                value={max}
                onChange={(e) => setMax(e.target.value)}
              />
            </Field>
          </div>
        ) : (
          <>
            <Field
              label="Names or items"
              htmlFor="rp-list"
              hint={`One per line, or separated by commas. ${entries.length} ${entries.length === 1 ? "entry" : "entries"}.`}
            >
              <Textarea
                id="rp-list"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder={"Ada\nChidi\nFatima\nTunde"}
                className="min-h-32"
              />
            </Field>

            {mode === "pick" && (
              <label
                htmlFor="rp-wheel"
                className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  id="rp-wheel"
                  type="checkbox"
                  checked={useWheel}
                  onChange={(e) => setUseWheel(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-[var(--color-brand-solid,#05a85a)]"
                />
                <span className="text-foreground">
                  Spin a wheel
                  <span className="block text-xs text-muted-foreground">
                    For a single draw from two or more names. Turn it off to pick
                    instantly, or to draw several at once.
                  </span>
                </span>
              </label>
            )}

            {mode === "pick" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="How many to pick" htmlFor="rp-count">
                  <Input
                    id="rp-count"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={howMany}
                    onChange={(e) => setHowMany(e.target.value)}
                  />
                </Field>
                <Field label="Draw style">
                  <label
                    htmlFor="rp-norepeat"
                    className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      id="rp-norepeat"
                      type="checkbox"
                      checked={noRepeat}
                      onChange={(e) => {
                        setNoRepeat(e.target.checked);
                        setDrawn([]);
                      }}
                      className="h-4 w-4 rounded border-border accent-[var(--color-brand-solid,#05a85a)]"
                    />
                    <span className="text-foreground">
                      Remove after picking
                      {noRepeat && drawn.length > 0 && (
                        <span className="block text-xs text-muted-foreground">
                          {remaining.length} left of {entries.length}
                        </span>
                      )}
                    </span>
                  </label>
                </Field>
              </div>
            )}

            {mode === "teams" && (
              <div className="sm:max-w-xs">
                <Field label="Number of teams" htmlFor="rp-teams">
                  <Input
                    id="rp-teams"
                    type="number"
                    inputMode="numeric"
                    min={2}
                    value={teamCount}
                    onChange={(e) => setTeamCount(e.target.value)}
                  />
                </Field>
              </div>
            )}
          </>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="lg" onClick={run} disabled={!revealed}>
            <Shuffle />
            {mode === "pick"
              ? wheelAvailable
                ? revealed
                  ? "Spin"
                  : "Spinning…"
                : "Pick"
              : mode === "shuffle"
                ? "Shuffle"
                : mode === "teams"
                  ? "Make teams"
                  : "Generate"}
          </Button>
          {(picked.length > 0 || order.length > 0 || teams.length > 0 || number !== null) && (
            <Button variant="ghost" size="lg" onClick={reset}>
              Reset
            </Button>
          )}
        </div>
      </ToolPanel>

      {error && <ErrorNote>{error}</ErrorNote>}

      {wheelAvailable && (
        <ToolPanel>
          <SpinWheel
            entries={wheelPool}
            winnerIndex={wheelWinner}
            spinId={spinId}
            onSpinEnd={handleSpinEnd}
          />
          {/* The only announcement of the result, so it fires once the wheel has
              actually stopped rather than the moment the draw is made. */}
          <p role="status" aria-live="polite" className="sr-only">
            {revealed && picked.length === 1 ? `${picked[0]} was picked` : ""}
          </p>
        </ToolPanel>
      )}

      {number !== null && (
        <ToolPanel className="text-center">
          <p className="text-sm font-medium text-muted-foreground">Your number</p>
          <p className="mt-2 font-mono text-6xl font-extrabold tabular-nums text-brand">
            {number}
          </p>
        </ToolPanel>
      )}

      {picked.length > 0 && revealed && (
        <ToolPanel>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              {picked.length === 1 ? "The winner" : `Picked ${picked.length}`}
            </h2>
            <CopyButton value={picked.join("\n")} />
          </div>
          <ul className="mt-3 space-y-2">
            {picked.map((name) => (
              <li
                key={name}
                className="rounded-lg border border-brand bg-brand/5 px-4 py-3 text-center text-xl font-bold text-foreground"
              >
                {name}
              </li>
            ))}
          </ul>
          {noRepeat && drawn.length > 0 && remaining.length > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              {remaining.length} still in the draw. Press Pick again for the next.
            </p>
          )}
        </ToolPanel>
      )}

      {order.length > 0 && (
        <ToolPanel>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Shuffled order
            </h2>
            <CopyButton value={order.map((n, i) => `${i + 1}. ${n}`).join("\n")} />
          </div>
          <ol className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
            {order.map((name, i) => (
              <li
                key={`${name}-${i}`}
                className="flex items-center gap-3 bg-background-subtle px-4 py-2.5"
              >
                <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-brand">
                  {i + 1}
                </span>
                <span className="min-w-0 break-words text-sm text-foreground">{name}</span>
              </li>
            ))}
          </ol>
        </ToolPanel>
      )}

      {teams.length > 0 && (
        <ToolPanel>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              {teams.length} teams
            </h2>
            <CopyButton
              value={teams
                .map((t, i) => `Team ${i + 1}\n${t.map((n) => `  ${n}`).join("\n")}`)
                .join("\n\n")}
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-background-subtle p-3"
              >
                <p className="text-sm font-bold text-brand">
                  Team {i + 1}
                  <span className="ml-1 font-normal text-muted-foreground">
                    ({team.length})
                  </span>
                </p>
                <ul className="mt-2 space-y-1">
                  {team.map((name) => (
                    <li key={name} className="break-words text-sm text-foreground">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ToolPanel>
      )}

      <ToolPanel>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Draws use your browser&apos;s cryptographic random source and a
          Fisher–Yates shuffle, so every order is equally likely — which matters
          if anyone is going to question the result. Nothing is sent anywhere and
          nothing is saved, so refreshing clears the list.
        </p>
      </ToolPanel>
    </div>
  );
}
