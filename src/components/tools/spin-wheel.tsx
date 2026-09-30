"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A spinning wheel for drawing one name from a list.
 *
 * The winner is decided BEFORE the animation starts, by the caller, using the
 * same cryptographic draw the rest of the tool uses. The wheel then works out
 * the rotation that lands that segment under the pointer. Doing it the other way
 * round — spinning and reading off wherever it stops — would make fairness a
 * property of the easing curve, which is not something anyone should have to
 * trust.
 */

/* Enough contrast against white labels in both themes, and deliberately not the
   page's own palette so the wheel reads as an object rather than a panel. */
const SEGMENT_COLOURS = ["#05834a", "#0f172a", "#05a85a", "#1e293b"];

const SIZE = 320; // SVG viewBox units
const R = 150;
const CENTRE = SIZE / 2;

/** Cartesian point on the wheel edge, measured clockwise from 12 o'clock. */
function point(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTRE + radius * Math.cos(rad),
    y: CENTRE + radius * Math.sin(rad),
  };
}

/* A single entry has no arc to sweep, so the whole disc is drawn as two halves
   of a circle — an arc of exactly 360° collapses to nothing in SVG. */
function fullDisc() {
  return (
    `M ${CENTRE} ${CENTRE - R} ` +
    `A ${R} ${R} 0 1 1 ${CENTRE} ${CENTRE + R} ` +
    `A ${R} ${R} 0 1 1 ${CENTRE} ${CENTRE - R} Z`
  );
}

function segmentPath(startDeg: number, endDeg: number) {
  const a = point(startDeg, R);
  const b = point(endDeg, R);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${CENTRE} ${CENTRE} L ${a.x} ${a.y} A ${R} ${R} 0 ${largeArc} 1 ${b.x} ${b.y} Z`;
}

export function SpinWheel({
  entries,
  winnerIndex,
  spinId,
  onSpinEnd,
}: {
  entries: string[];
  /** Index into `entries` that the wheel must land on. null while idle. */
  winnerIndex: number | null;
  /** Changes on every spin request, so repeat draws of the same name re-animate. */
  spinId: number;
  onSpinEnd: () => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const lastSpin = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = entries.length;
  const segment = count > 0 ? 360 / count : 360;

  useEffect(() => {
    if (spinId === 0 || spinId === lastSpin.current) return;
    if (winnerIndex == null || count === 0) return;
    lastSpin.current = spinId;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Land somewhere inside the winning segment rather than dead centre every
       time, keeping clear of the edges so the result is never ambiguous. */
    const margin = Math.min(segment * 0.3, 6);
    const jitter =
      segment > margin * 2
        ? (Math.random() - 0.5) * (segment - margin * 2)
        : 0;
    const centreOfWinner = winnerIndex * segment + segment / 2 + jitter;

    /* Rotate forward only: find the next rotation above the current one that
       puts the winner under the pointer at 12 o'clock. */
    const target = 360 - centreOfWinner;
    const turns = reduceMotion ? 0 : 4;
    const current = rotation % 360;
    let delta = target - current;
    while (delta <= 0) delta += 360;

    setSpinning(!reduceMotion);
    setRotation(rotation + delta + turns * 360);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => {
        setSpinning(false);
        onSpinEnd();
      },
      reduceMotion ? 0 : 4200
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinId, winnerIndex, count, segment]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  if (count === 0) return null;

  /* Past roughly 40 names the labels stop being readable, so the wheel shows
     the count instead of unreadable slivers of text. */
  const showLabels = count <= 40;
  const labelSize = count <= 8 ? 11 : count <= 16 ? 9 : count <= 26 ? 7.5 : 6;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-sm">
        {/* Pointer at 12 o'clock. */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1"
          style={{
            width: 0,
            height: 0,
            borderLeft: "11px solid transparent",
            borderRight: "11px solid transparent",
            borderTop: "20px solid var(--color-brand-solid, #05a85a)",
            filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.35))",
          }}
        />

        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-auto w-full drop-shadow-lg"
          role="img"
          aria-label={`Wheel with ${count} ${count === 1 ? "name" : "names"}`}
        >
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "50% 50%",
              transition: spinning
                ? /* Long, heavy ease-out: fast off the mark, then a slow crawl
                     into the result. */
                  "transform 4200ms cubic-bezier(0.12, 0.78, 0.09, 1)"
                : "none",
            }}
          >
            {entries.map((name, i) => {
              const start = i * segment;
              const end = start + segment;
              const mid = start + segment / 2;
              const labelAt = point(mid, R * 0.62);
              return (
                <g key={`${name}-${i}`}>
                  <path
                    d={count === 1 ? fullDisc() : segmentPath(start, end)}
                    fill={SEGMENT_COLOURS[i % SEGMENT_COLOURS.length]}
                    stroke="rgb(255 255 255 / 0.18)"
                    strokeWidth="1"
                  />
                  {showLabels && (
                    <text
                      x={labelAt.x}
                      y={labelAt.y}
                      fill="#ffffff"
                      fontSize={labelSize}
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${mid} ${labelAt.x} ${labelAt.y})`}
                    >
                      {name.length > 18 ? `${name.slice(0, 17)}…` : name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Hub, drawn outside the rotating group so it stays still. */}
          <circle cx={CENTRE} cy={CENTRE} r="22" fill="#ffffff" />
          <circle
            cx={CENTRE}
            cy={CENTRE}
            r="22"
            fill="none"
            stroke="rgb(15 23 42 / 0.15)"
            strokeWidth="1.5"
          />
          <circle cx={CENTRE} cy={CENTRE} r="6" fill="#05a85a" />
        </svg>
      </div>

      {!showLabels && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {count} names on the wheel — too many to label, so the winner is
          announced below instead.
        </p>
      )}

      <p
        className={cn(
          "mt-2 text-xs text-muted-foreground",
          spinning ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      >
        Spinning…
      </p>
    </div>
  );
}
