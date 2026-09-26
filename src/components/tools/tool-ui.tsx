"use client";

import * as React from "react";
import { Check, Copy, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Card the interactive part of every tool sits in. */
export function ToolPanel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 sm:p-5",
        className
      )}
      {...props}
    />
  );
}

/** Labelled form row. */
export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** A single readout, e.g. "Words — 412". */
export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background-subtle p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

/** Friendly error line (§18) — never a raw exception. */
export function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-700 dark:text-red-300"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/** Copy-to-clipboard button that confirms, then resets. */
export function CopyButton({
  value,
  label = "Copy",
  disabled,
  className,
  size = "sm",
}: {
  value: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <Button
      variant="outline"
      size={size}
      className={className}
      disabled={disabled || !value}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          /* Clipboard can be blocked (insecure context, denied permission).
             Fall back to selecting nothing rather than throwing at the user. */
          setCopied(false);
        }
      }}
    >
      {copied ? <Check className="text-brand" /> : <Copy />}
      {copied ? "Copied" : label}
    </Button>
  );
}

/** Downloads a string as a file, entirely client-side. */
export function DownloadButton({
  value,
  filename,
  mime = "text/plain",
  label = "Download",
  disabled,
}: {
  value: string;
  filename: string;
  mime?: string;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || !value}
      onClick={() => {
        const blob = new Blob([value], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      <Download />
      {label}
    </Button>
  );
}
