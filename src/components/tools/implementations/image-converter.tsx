"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel, Stat, ErrorNote } from "@/components/tools/tool-ui";
import { FileDrop, downloadBlob } from "@/components/tools/file-drop";
import { IMAGE_ACCEPT, loadImage, encode, renameFor, MIME_LABELS } from "@/lib/image";
import { formatBytes, cn } from "@/lib/utils";

const TARGETS = ["image/jpeg", "image/png", "image/webp"] as const;

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<string>("image/webp");
  const [quality, setQuality] = useState(90);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);

  /* Unmount-only cleanup. With `result` in the deps this would close the
     bitmap after the first conversion, breaking every one after it. */
  const urlsRef = useRef<string[]>([]);
  useEffect(
    () => () => {
      bitmapRef.current?.close();
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    },
    []
  );
  const track = (url: string) => {
    urlsRef.current.push(url);
    return url;
  };

  const sourceLabel = file
    ? MIME_LABELS[file.type] ??
      (file.name.split(".").pop() ?? "image").toUpperCase()
    : "";

  const onPick = async (picked: File[]) => {
    const chosen = picked[0];
    setError("");
    setResult(null);
    try {
      const { bitmap } = await loadImage(chosen);
      bitmapRef.current?.close();
      bitmapRef.current = bitmap;
      setFile(chosen);
      /* Default to a different format than the source, since converting to
         the same thing is rarely what someone wants. */
      setTarget(chosen.type === "image/webp" ? "image/jpeg" : "image/webp");
    } catch {
      setError("That image couldn’t be read. It may be damaged or an unsupported format.");
    }
  };

  const convert = async () => {
    const bitmap = bitmapRef.current;
    if (!bitmap || !file) return;
    setBusy(true);
    setError("");
    try {
      const blob = await encode(
        bitmap,
        bitmap.width,
        bitmap.height,
        target,
        target === "image/png" ? undefined : quality / 100
      );
      if (result) URL.revokeObjectURL(result.url);
      setResult({ blob, url: track(URL.createObjectURL(blob)) });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong while converting."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <FileDrop
          {...IMAGE_ACCEPT}
          hint="Convert between JPG, PNG and WebP without uploading anything."
          onFiles={onPick}
          onError={setError}
        />
      ) : (
        <ToolPanel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {sourceLabel} · {formatBytes(file.size)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFile(null);
                setResult(null);
                setError("");
              }}
            >
              Choose another
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-border bg-background-subtle px-3 py-2 text-sm font-semibold text-foreground">
              {sourceLabel}
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {TARGETS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTarget(t);
                    setResult(null);
                  }}
                  aria-pressed={target === t}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    target === t
                      ? "border-brand/40 bg-brand/10 text-brand"
                      : "border-border bg-background-subtle text-muted-foreground hover:text-foreground"
                  )}
                >
                  {MIME_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {target !== "image/png" && (
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="iv-q" className="text-sm font-medium text-foreground">
                  Quality
                </label>
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {quality}%
                </span>
              </div>
              <input
                id="iv-q"
                type="range"
                min={10}
                max={100}
                step={5}
                value={quality}
                onChange={(e) => {
                  setQuality(Number(e.target.value));
                  setResult(null);
                }}
                className="mt-2 w-full accent-[var(--brand-solid)]"
              />
            </div>
          )}

          {file.type === "image/png" && target !== "image/png" && (
            <p className="text-xs text-muted-foreground">
              PNG transparency is flattened onto white, because JPG has no alpha
              channel and WebP here is encoded without one.
            </p>
          )}

          <Button onClick={convert} disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            {busy ? "Converting…" : `Convert to ${MIME_LABELS[target]}`}
          </Button>
        </ToolPanel>
      )}

      {error && <ErrorNote>{error}</ErrorNote>}

      {result && file && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label={sourceLabel} value={formatBytes(file.size)} />
            <Stat label={MIME_LABELS[target]} value={formatBytes(result.blob.size)} />
            <Stat
              label="Difference"
              value={`${result.blob.size <= file.size ? "−" : "+"}${Math.abs(
                Math.round(((file.size - result.blob.size) / file.size) * 100)
              )}%`}
            />
          </div>

          <ToolPanel className="space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.url}
              alt={`Converted to ${MIME_LABELS[target]}`}
              className="mx-auto max-h-72 rounded-lg border border-border bg-background-subtle object-contain"
            />
            <Button
              onClick={() => downloadBlob(result.blob, renameFor(file.name, target), target)}
            >
              <Download />
              Download {MIME_LABELS[target]}
            </Button>
          </ToolPanel>
        </>
      )}
    </div>
  );
}
