"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A spinning wheel for drawing one name from a list.
 *
 * The winner is decided BEFORE the animation starts, by the caller, using the
 * same cryptographic draw the rest of the tool uses. The wheel then works out the
 * rotation that lands that segment under the pointer. Doing it the other way
 * round — spinning and reading off wherever it stops — would make fairness a
 * property of the easing curve, which is not something anyone should have to
 * trust.
 *
 * The rotation is driven by requestAnimationFrame rather than a CSS transition.
 * A transition would be smoother to write, but it gives no per-frame hook, and
 * the tick that fires as each segment passes the pointer is most of what makes a
 * wheel feel like a wheel. Driving it ourselves also means the transform is
 * written straight to the node instead of going through React state sixty times a
 * second.
 */

/* Varied enough to read as a fairground wheel, all dark enough for white labels
   in either theme. */
const SEGMENT_COLOURS = [
  "#05834a",
  "#0f172a",
  "#0d9488",
  "#05a85a",
  "#1e293b",
  "#0e7490",
];

const SIZE = 320; // SVG viewBox units
const R = 150;
const CENTRE = SIZE / 2;
const SPIN_MS = 5400;
const TURNS = 6;

/** Cartesian point on the wheel, measured clockwise from 12 o'clock. */
function point(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTRE + radius * Math.cos(rad),
    y: CENTRE + radius * Math.sin(rad),
  };
}

/* A single entry has no arc to sweep — an arc of exactly 360° collapses to
   nothing in SVG — so the disc is drawn as two half circles. */
const fullDisc = () =>
  `M ${CENTRE} ${CENTRE - R} A ${R} ${R} 0 1 1 ${CENTRE} ${CENTRE + R} ` +
  `A ${R} ${R} 0 1 1 ${CENTRE} ${CENTRE - R} Z`;

function segmentPath(startDeg: number, endDeg: number) {
  const a = point(startDeg, R);
  const b = point(endDeg, R);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${CENTRE} ${CENTRE} L ${a.x} ${a.y} A ${R} ${R} 0 ${largeArc} 1 ${b.x} ${b.y} Z`;
}

/**
 * Deceleration curve. Quintic ease-out: roughly 70% of the distance is covered
 * in the first quarter of the time, then a long, slowing crawl into the result —
 * which is what stops the last second feeling like the wheel simply switched off.
 */
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

export function SpinWheel({
  entries,
  winnerIndex,
  spinId,
  onSpinEnd,
  onRequestSpin,
  canSpin,
}: {
  entries: string[];
  /** Index into `entries` the wheel must land on. null while idle. */
  winnerIndex: number | null;
  /** Changes on every spin request, so repeat draws of a name re-animate. */
  spinId: number;
  onSpinEnd: () => void;
  /** Lets the wheel itself act as the spin control. */
  onRequestSpin: () => void;
  canSpin: boolean;
}) {
  const groupRef = useRef<SVGGElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<HTMLCanvasElement>(null);

  const rotationRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const lastSpin = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);

  const [spinning, setSpinning] = useState(false);
  const [sound, setSound] = useState(true);
  /**
   * The name the wheel came to rest on, captured when it settles.
   *
   * Deliberately not derived from `entries[winnerIndex]` during render: landing
   * removes the winner from the caller's pool, so by the next render `entries` is
   * a shorter array and that index refers to somebody else — or to nothing.
   */
  const [landedOn, setLandedOn] = useState<string | null>(null);
  /**
   * The rotation the wheel is resting at, used only to orient the labels.
   *
   * Labels turn with the wheel, so whether a given one reads left-to-right
   * depends on where it has stopped. Re-deciding each label's direction once the
   * wheel settles means every name is the right way up at rest — the moment
   * anyone actually reads them. It is deliberately not updated during the spin,
   * where the labels are a blur and a re-render per frame would cost real work.
   */
  const [restRotation, setRestRotation] = useState(0);

  const count = entries.length;
  const segment = count > 0 ? 360 / count : 360;

  /* ------------------------------------------------------------- audio */

  /** A short, dry click — the sound of a peg passing the pointer. */
  const tick = useCallback(() => {
    if (!sound) return;
    const ctx = audioRef.current;
    if (!ctx || ctx.state !== "running") return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1180, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.035);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.045);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }, [sound]);

  /** Rising three-note flourish when it lands. */
  const fanfare = useCallback(() => {
    if (!sound) return;
    const ctx = audioRef.current;
    if (!ctx || ctx.state !== "running") return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const at = now + i * 0.11;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.2, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.42);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.45);
    });
  }, [sound]);

  /* ---------------------------------------------------------- confetti */

  const burstConfetti = useCallback(() => {
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pieces = Array.from({ length: 90 }, () => ({
      x: w / 2,
      y: h / 2,
      vx: (Math.random() - 0.5) * 9,
      vy: -Math.random() * 9 - 3,
      size: 3 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      colour: SEGMENT_COLOURS[Math.floor(Math.random() * SEGMENT_COLOURS.length)],
    }));

    const started = performance.now();
    const draw = () => {
      const elapsed = performance.now() - started;
      ctx.clearRect(0, 0, w, h);
      if (elapsed > 1600) return;

      for (const p of pieces) {
        p.vy += 0.22; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 1600);
        ctx.fillStyle = p.colour;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }, []);

  /* -------------------------------------------------------------- spin */

  useEffect(() => {
    if (spinId === 0 || spinId === lastSpin.current) return;
    if (winnerIndex == null || count === 0) return;
    lastSpin.current = spinId;

    setLandedOn(null);

    /* Read the name now, while `entries` still holds the pool being spun. */
    const winnerName = entries[winnerIndex];

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Land somewhere inside the winning segment rather than dead centre every
       time, keeping clear of the edges so the result is never ambiguous. */
    const margin = Math.min(segment * 0.3, 6);
    const jitter =
      segment > margin * 2 ? (Math.random() - 0.5) * (segment - margin * 2) : 0;
    const centreOfWinner = winnerIndex * segment + segment / 2 + jitter;

    /* Forward only: the next rotation above the current one that puts the winner
       under the pointer at 12 o'clock. */
    const from = rotationRef.current;
    const target = 360 - centreOfWinner;
    let delta = (target - (from % 360) + 360) % 360;
    if (delta < 1) delta += 360;
    const to = from + delta + TURNS * 360;

    const settle = () => {
      rotationRef.current = to;
      if (groupRef.current) {
        groupRef.current.style.transform = `rotate(${to}deg)`;
      }
      if (pointerRef.current) pointerRef.current.style.transform = "rotate(0deg)";
      setSpinning(false);
      setRestRotation(((to % 360) + 360) % 360);
      setLandedOn(winnerName ?? null);
      fanfare();
      if (!reduceMotion) burstConfetti();
      onSpinEnd();
    };

    if (reduceMotion) {
      settle();
      return;
    }

    setSpinning(true);
    const started = performance.now();
    let lastCrossing = Math.floor(from / segment);
    let lastTickAt = 0;

    const step = (now: number) => {
      const t = Math.min(1, (now - started) / SPIN_MS);
      const value = from + (to - from) * easeOutQuint(t);
      rotationRef.current = value;

      if (groupRef.current) {
        groupRef.current.style.transform = `rotate(${value}deg)`;
      }

      /* One tick per segment boundary crossed, rate-limited so the opening
         fast phase does not become a buzz. */
      const crossing = Math.floor(value / segment);
      if (crossing !== lastCrossing) {
        lastCrossing = crossing;
        if (now - lastTickAt > 38) {
          lastTickAt = now;
          tick();
        }
      }

      /* The pointer flicks back as a peg goes by and relaxes over ~90ms, which
         is what sells the contact. */
      if (pointerRef.current) {
        const since = now - lastTickAt;
        const flick = Math.max(0, 1 - since / 90);
        pointerRef.current.style.transform = `rotate(${-11 * flick}deg)`;
      }

      if (t < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        settle();
      }
    };

    frameRef.current = requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinId, winnerIndex, count, segment]);

  useEffect(
    () => () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      void audioRef.current?.close();
    },
    []
  );

  /**
   * Browsers refuse to start audio that was not triggered by a gesture, so the
   * context is created on the click that starts the spin, not on mount.
   */
  const handleSpin = () => {
    if (!canSpin || spinning) return;
    if (sound) {
      try {
        audioRef.current ??= new AudioContext();
        if (audioRef.current.state === "suspended") void audioRef.current.resume();
      } catch {
        /* No audio available; the wheel still spins. */
      }
    }
    onRequestSpin();
  };

  if (count === 0) return null;

  /* Past roughly 40 names the labels stop being readable. */
  const showLabels = count <= 40;
  const labelSize = count <= 8 ? 11 : count <= 16 ? 9 : count <= 26 ? 7.5 : 6;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-sm">
        {/* Pointer at 12 o'clock. Its pivot is the tip, so the flick reads as
            the peg pushing it aside. */}
        <div
          ref={pointerRef}
          aria-hidden="true"
          className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1"
          style={{
            width: 0,
            height: 0,
            borderLeft: "11px solid transparent",
            borderRight: "11px solid transparent",
            borderTop: "21px solid var(--color-brand-solid, #05a85a)",
            transformOrigin: "50% 0",
            filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.4))",
          }}
        />

        <button
          type="button"
          onClick={handleSpin}
          disabled={!canSpin || spinning}
          aria-label={
            spinning
              ? "Spinning the wheel"
              : `Spin the wheel to pick one of ${count} ${count === 1 ? "name" : "names"}`
          }
          className={cn(
            "group block w-full rounded-full outline-none",
            "focus-visible:ring-4 focus-visible:ring-ring/50",
            canSpin && !spinning ? "cursor-pointer" : "cursor-default"
          )}
        >
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className={cn(
              "h-auto w-full drop-shadow-xl transition-transform duration-200",
              canSpin && !spinning && "group-hover:scale-[1.015] group-active:scale-[0.99]"
            )}
            aria-hidden="true"
          >
            <g
              ref={groupRef}
              style={{
                transform: `rotate(${rotationRef.current}deg)`,
                transformOrigin: "50% 50%",
                willChange: "transform",
              }}
            >
              {entries.map((name, i) => {
                const start = i * segment;
                const mid = start + segment / 2;

                /* Labels run along the spoke rather than across it. Laid across,
                   every name in the bottom half comes out upside down, and a
                   long name only has the width of a wedge to fit in.
                   `restRotation` is added so the flip is decided by where the
                   label ends up on screen, not where it sits in the wheel's own
                   coordinates — otherwise a spin leaves half the names inverted. */
                const onScreen = ((mid + restRotation) % 360 + 360) % 360;
                const onLeft = onScreen > 180;
                const labelAt = point(mid, R * 0.9);
                const rotate = onLeft ? mid + 90 : mid - 90;

                return (
                  <g key={`${name}-${i}`}>
                    <path
                      d={count === 1 ? fullDisc() : segmentPath(start, start + segment)}
                      fill={SEGMENT_COLOURS[i % SEGMENT_COLOURS.length]}
                      stroke="rgb(255 255 255 / 0.2)"
                      strokeWidth="1"
                    />
                    {showLabels && (
                      <text
                        x={labelAt.x}
                        y={labelAt.y}
                        fill="#ffffff"
                        fontSize={labelSize}
                        fontWeight="600"
                        textAnchor={onLeft ? "start" : "end"}
                        dominantBaseline="middle"
                        /* Keeps the text off the rim without changing its angle. */
                        dx={onLeft ? 10 : -10}
                        transform={`rotate(${rotate} ${labelAt.x} ${labelAt.y})`}
                      >
                        {name.length > 16 ? `${name.slice(0, 15)}…` : name}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Rim and hub sit outside the rotating group so they stay still. */}
            <circle
              cx={CENTRE}
              cy={CENTRE}
              r={R}
              fill="none"
              stroke="rgb(255 255 255 / 0.9)"
              strokeWidth="4"
            />
            <circle cx={CENTRE} cy={CENTRE} r="26" fill="#ffffff" />
            <circle
              cx={CENTRE}
              cy={CENTRE}
              r="26"
              fill="none"
              stroke="rgb(15 23 42 / 0.15)"
              strokeWidth="1.5"
            />
            <circle cx={CENTRE} cy={CENTRE} r="7" fill="#05a85a" />
          </svg>
        </button>

        {/* Confetti overlays the wheel and never intercepts a click. */}
        <canvas
          ref={confettiRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 h-full w-full"
        />

        {/* Winner reveal, over the hub so the eye is already there. */}
        {landedOn && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
            <div
              className="mx-6 rounded-2xl border border-brand bg-card/95 px-5 py-3 text-center shadow-2xl backdrop-blur-sm"
              style={{ animation: "wheel-pop 260ms cubic-bezier(0.2, 0.9, 0.2, 1) both" }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                It landed on
              </p>
              <p className="mt-0.5 max-w-52 break-words text-xl font-extrabold leading-tight text-foreground">
                {landedOn}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <p className="text-xs text-muted-foreground">
          {spinning
            ? "Spinning…"
            : canSpin
              ? "Tap the wheel to spin"
              : "Add two or more names"}
        </p>
        <button
          type="button"
          onClick={() => setSound((s) => !s)}
          aria-label={sound ? "Mute the wheel" : "Unmute the wheel"}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>

      {!showLabels && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {count} names on the wheel — too many to label, so the winner is
          announced below instead.
        </p>
      )}
    </div>
  );
}
