"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolPanel, Field, Stat } from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

type Phase = "focus" | "short" | "long";

const LABEL: Record<Phase, string> = {
  focus: "Focus",
  short: "Short break",
  long: "Long break",
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function StudyTimer() {
  const [focusMins, setFocusMins] = useState(25);
  const [shortMins, setShortMins] = useState(5);
  const [longMins, setLongMins] = useState(15);
  const [roundsBeforeLong, setRoundsBeforeLong] = useState(4);
  const [sound, setSound] = useState(true);

  const [phase, setPhase] = useState<Phase>("focus");
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completedFocus, setCompletedFocus] = useState(0);
  const [focusSeconds, setFocusSeconds] = useState(0);

  const lengthFor = useCallback(
    (p: Phase) =>
      (p === "focus" ? focusMins : p === "short" ? shortMins : longMins) * 60,
    [focusMins, shortMins, longMins]
  );

  /**
   * A short two-tone chime, synthesised rather than shipped as a file.
   *
   * The AudioContext is created on the click that starts the timer, because
   * browsers refuse to start audio that was not triggered by a gesture — a
   * context created on mount would stay suspended and never make a sound.
   */
  const audioRef = useRef<AudioContext | null>(null);
  const chime = useCallback(
    (rising: boolean) => {
      if (!sound) return;
      try {
        audioRef.current ??= new AudioContext();
        const ctx = audioRef.current;
        if (ctx.state === "suspended") void ctx.resume();

        const now = ctx.currentTime;
        const notes = rising ? [660, 880] : [880, 660];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, now + i * 0.18);
          gain.gain.linearRampToValueAtTime(0.22, now + i * 0.18 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.32);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now + i * 0.18);
          osc.stop(now + i * 0.18 + 0.34);
        });
      } catch {
        /* No audio available — the visual change is still there. */
      }
    },
    [sound]
  );

  const advance = useCallback(() => {
    if (phase === "focus") {
      const done = completedFocus + 1;
      setCompletedFocus(done);
      const next: Phase = done % roundsBeforeLong === 0 ? "long" : "short";
      setPhase(next);
      setRemaining(lengthFor(next));
      chime(false);
    } else {
      setPhase("focus");
      setRemaining(lengthFor("focus"));
      chime(true);
    }
  }, [phase, completedFocus, roundsBeforeLong, lengthFor, chime]);

  /**
   * Driven from a wall-clock deadline rather than by decrementing a counter.
   * Background tabs throttle timers to once a second at best, so a counting
   * interval drifts badly — comparing against Date.now() cannot.
   */
  const deadlineRef = useRef<number | null>(null);
  useEffect(() => {
    if (!running) {
      deadlineRef.current = null;
      return;
    }
    deadlineRef.current = Date.now() + remaining * 1000;

    const tick = () => {
      if (deadlineRef.current == null) return;
      const left = Math.round((deadlineRef.current - Date.now()) / 1000);
      if (left <= 0) {
        advance();
      } else {
        setRemaining(left);
        if (phase === "focus") setFocusSeconds((s) => s + 1);
      }
    };

    const id = setInterval(tick, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, advance]);

  /* Editing a length while that phase is paused should update the clock. */
  useEffect(() => {
    if (!running) setRemaining(lengthFor(phase));
  }, [running, phase, lengthFor]);

  useEffect(() => {
    document.title = running
      ? `${pad(Math.floor(remaining / 60))}:${pad(remaining % 60)} — ${LABEL[phase]}`
      : "Study Timer — TechInstant Tools";
    return () => {
      document.title = "Study Timer — TechInstant Tools";
    };
  }, [remaining, phase, running]);

  const total = lengthFor(phase);
  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const reset = () => {
    setRunning(false);
    setPhase("focus");
    setRemaining(lengthFor("focus"));
    setCompletedFocus(0);
    setFocusSeconds(0);
  };

  return (
    <div className="space-y-4">
      <ToolPanel>
        <div className="flex flex-col items-center py-4">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
              phase === "focus"
                ? "bg-brand/15 text-brand"
                : "bg-sky-500/15 text-sky-700 dark:text-sky-300"
            )}
          >
            {LABEL[phase]}
          </span>

          <p
            className="mt-4 font-mono text-6xl font-extrabold tabular-nums text-foreground sm:text-7xl"
            aria-live="off"
          >
            {pad(mins)}:{pad(secs)}
          </p>

          {/* Announced on phase change only — a per-second live region would
              make a screen reader unusable. */}
          <p className="sr-only" role="status">
            {LABEL[phase]} — {mins} minutes {secs} seconds remaining
          </p>

          <div className="mt-5 h-2 w-full max-w-md overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                phase === "focus" ? "bg-brand-solid" : "bg-sky-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button size="lg" onClick={() => setRunning((r) => !r)}>
              {running ? <Pause /> : <Play />}
              {running ? "Pause" : remaining === total ? "Start" : "Resume"}
            </Button>
            <Button variant="outline" size="lg" onClick={advance}>
              <SkipForward />
              Skip
            </Button>
            <Button variant="outline" size="lg" onClick={reset}>
              <RotateCcw />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setSound((s) => !s)}
              aria-label={sound ? "Mute the chime" : "Unmute the chime"}
            >
              {sound ? <Volume2 /> : <VolumeX />}
            </Button>
          </div>
        </div>
      </ToolPanel>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Focus sessions done" value={completedFocus} />
        <Stat
          label="Time focused"
          value={`${Math.floor(focusSeconds / 60)} min`}
        />
        <Stat
          label="Until a long break"
          value={
            roundsBeforeLong - (completedFocus % roundsBeforeLong) === roundsBeforeLong &&
            completedFocus > 0
              ? "now"
              : `${roundsBeforeLong - (completedFocus % roundsBeforeLong)} to go`
          }
        />
      </div>

      <ToolPanel className="space-y-4">
        <h2 className="text-base font-bold tracking-tight text-foreground">Lengths</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Focus (min)" htmlFor="st-focus">
            <Input
              id="st-focus"
              type="number"
              inputMode="numeric"
              min={1}
              max={180}
              value={focusMins}
              onChange={(e) => setFocusMins(clamp(e.target.value, 1, 180, 25))}
            />
          </Field>
          <Field label="Short break" htmlFor="st-short">
            <Input
              id="st-short"
              type="number"
              inputMode="numeric"
              min={1}
              max={60}
              value={shortMins}
              onChange={(e) => setShortMins(clamp(e.target.value, 1, 60, 5))}
            />
          </Field>
          <Field label="Long break" htmlFor="st-long">
            <Input
              id="st-long"
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              value={longMins}
              onChange={(e) => setLongMins(clamp(e.target.value, 1, 120, 15))}
            />
          </Field>
          <Field label="Rounds before long" htmlFor="st-rounds">
            <Input
              id="st-rounds"
              type="number"
              inputMode="numeric"
              min={1}
              max={12}
              value={roundsBeforeLong}
              onChange={(e) => setRoundsBeforeLong(clamp(e.target.value, 1, 12, 4))}
            />
          </Field>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          25 and 5 is the classic Pomodoro, but it is not sacred. If 25 minutes
          keeps cutting you off mid-thought, try 50 and 10. The part that
          actually matters is stopping when the timer says so, in both
          directions.
        </p>
      </ToolPanel>

      <ToolPanel>
        <p className="text-xs leading-relaxed text-muted-foreground">
          The timer keeps running if you switch tabs — the countdown is measured
          against the clock, not by counting ticks, so a throttled background tab
          cannot make it drift. Nothing is saved, so a refresh starts you over.
        </p>
      </ToolPanel>
    </div>
  );
}

function clamp(raw: string, min: number, max: number, fallback: number) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.round(n), min), max);
}
