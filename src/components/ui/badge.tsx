import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
  {
    variants: {
      variant: {
        /* brand text colour is already theme-aware, so this stays legible on
           white and on navy without a per-theme override at the call site */
        brand: "border-brand/25 bg-brand/10 text-brand",
        neutral: "border-border bg-muted text-muted-foreground",
        new: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
        soon: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);

export { badgeVariants };
