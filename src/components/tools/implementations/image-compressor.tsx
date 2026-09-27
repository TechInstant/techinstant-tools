"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { ToolPanel, Field, Stat, ErrorNote } from "@/components/tools/tool-ui";
import { FileDrop, downloadBlob } from "@/components/tools/file-drop";
import { IMAGE_ACCEPT, loadImage, encode, renameFor, MIME_LABELS } from "@/lib/image";
import { formatBytes } from "@/lib/utils";

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(70);
  const [format, setFormat] = useState("image/jpeg");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [source, setSource] = useState<{ url: string; w: number; h: number } | null>(
    null
  );
  const bitmapRef = useRef<ImageBitmap | null>(null);

  /* Release the decoded bitmap and any preview URLs — on unmount only.
     The dep array must stay empty: with `source`/`result` in it, React runs
     this cleanup on every state change and closes the bitmap the user is
     still working with. Replaced URLs are revoked where they're replaced. */
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

  const onPick = async (picked: File[]) => {
    const chosen = picked[0];
    setError("");
    setResult(null);
    try {
      const { bitmap, width, height } = await loadImage(chosen);
      bitmapRef.current?.close();
      bitmapRef.current = bitmap;
      setFile(chosen);
      setSource({ url: track(URL.createObjectURL(chosen)), w: width, h: height });
      /* Default to the source format unless it's PNG, where JPEG/WebP win. */
      if (chosen.type === "image/webp") setFormat("image/webp");
      else setFormat("image/jpeg");
    } catch {
      setError("That image couldn’t be read. It may be damaged or an unsupported format.");
    }
  };

  const compress = async () => {
    const bitmap = bitmapRef.current;
    if (!bitmap || !file) return;
    setBusy(true);
    setError("");
    try {
      const blob = await encode(
        bitmap,
        bitmap.width,
        bitmap.height,
        format,
        quality / 100
      );
      if (result) URL.revokeObjectURL(result.url);
      setResult({ blob, url: track(URL.createObjectURL(blob)) });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong while compressing."
      );
    } finally {
      setBusy(false);
    }
  };

  const saved = result && file ? file.size - result.blob.size : 0;
  const savedPct =
    result && file && file.size > 0 ? Math.round((saved / file.size) * 100) : 0;
  const grew = result != null && saved <= 0;

  return (
    <div className="space-y-4">
      {!file ? (
        <FileDrop
          {...IMAGE_ACCEPT}
          hint="JPG, PNG or WebP. Everything happens on your device."
          onFiles={onPick}
          onError={setError}
        />
      ) : (
        <ToolPanel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatBytes(file.size)}
                {source && ` · ${source.w} × ${source.h}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFile(null);
                setResult(null);
                setSource(null);
                setError("");
              }}
            >
              Choose another
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Output format" htmlFor="ic-format">
              <Select
                id="ic-format"
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value);
                  setResult(null);
                }}
              >
                <option value="image/jpeg">JPG — smallest for photos</option>
                <option value="image/webp">WebP — smaller again, modern</option>
                <option value="image/png">PNG — lossless, larger</option>
              </Select>
            </Field>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="ic-q" className="text-sm font-medium text-foreground">
                  Quality
                </label>
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {format === "image/png" ? "—" : `${quality}%`}
                </span>
              </div>
              <input
                id="ic-q"
                type="range"
                min={10}
                max={100}
                step={5}
                value={quality}
                disabled={format === "image/png"}
                onChange={(e) => {
                  setQuality(Number(e.target.value));
                  setResult(null);
                }}
                className="mt-2 w-full accent-[var(--brand-solid)] disabled:opacity-40"
              />
              {format === "image/png" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG is lossless, so quality doesn’t apply.
                </p>
              )}
            </div>
          </div>

          <Button onClick={compress} disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            {busy ? "Compressing…" : "Compress image"}
          </Button>
        </ToolPanel>
      )}

      {error && <ErrorNote>{error}</ErrorNote>}

      {result && file && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Original" value={formatBytes(file.size)} />
            <Stat label="Compressed" value={formatBytes(result.blob.size)} />
            <Stat
              label={grew ? "Change" : "Saved"}
              value={grew ? `+${Math.abs(savedPct)}%` : `${savedPct}%`}
            />
          </div>

          {grew && (
            <ErrorNote>
              The result is larger than the original. Try a lower quality, or
              JPG/WebP instead of PNG — your original is the better file to keep.
            </ErrorNote>
          )}

          <ToolPanel className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {source && (
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={source.url}
                    alt="Original"
                    className="h-48 w-full rounded-lg border border-border bg-background-subtle object-contain"
                  />
                  <figcaption className="mt-1.5 text-center text-xs text-muted-foreground">
                    Original · {formatBytes(file.size)}
                  </figcaption>
                </figure>
              )}
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.url}
                  alt="Compressed"
                  className="h-48 w-full rounded-lg border border-border bg-background-subtle object-contain"
                />
                <figcaption className="mt-1.5 text-center text-xs text-muted-foreground">
                  {MIME_LABELS[format]} · {formatBytes(result.blob.size)}
                </figcaption>
              </figure>
            </div>

            <Button
              onClick={() =>
                downloadBlob(result.blob, renameFor(file.name, format), format)
              }
            >
              <Download />
              Download {MIME_LABELS[format]}
            </Button>
          </ToolPanel>
        </>
      )}
    </div>
  );
}
