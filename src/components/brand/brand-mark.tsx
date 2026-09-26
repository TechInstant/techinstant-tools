import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The TechInstant mark: one green "energy leaf" bolt with a white lightning
 * bolt knocked out of it. The silhouette is 180° rotationally symmetric about
 * its centre — same artwork as the main TechInstant site, so Tools reads as
 * part of the same family.
 */
export function BrandMark({ className }: { className?: string }) {
  const uid = React.useId().replace(/:/g, "");

  return (
    <svg
      viewBox="-1 -1 36 42"
      fill="none"
      className={cn("h-7 w-[23px]", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M23 0.8 L25.5 2 L22.5 12 L29 12
           C32 14.2 33 16.5 33 20
           C32.4 30.5 15.5 37.5 11 39.2
           L8.5 38 L11.5 28 L5 28
           C2 25.8 1 23.5 1 20
           C1.6 9.5 18.5 2.5 23 0.8 Z"
        fill={`url(#${uid}-leaf)`}
        stroke={`url(#${uid}-leaf)`}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 5.5 L16.3 17.5 L23.6 17.5 L17 28.8 L18.1 21.5 L12 21.5 Z"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="0.45"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id={`${uid}-leaf`}
          x1="10"
          y1="0"
          x2="28"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1AD280" />
          <stop offset="0.5" stopColor="#04A85C" />
          <stop offset="1" stopColor="#00934F" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Full lockup: mark + "TechInstant Tools". "Tech" carries the brand green and
 * "Instant" follows the theme, matching the main site.
 */
export function BrandLockup({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BrandMark className="h-7 w-[23px] shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-bold tracking-tight">
          <span className="text-brand">Tech</span>
          <span className="text-foreground">Instant</span>
        </span>
        <span className="mt-[3px] text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Tools
        </span>
      </span>
    </span>
  );
}
