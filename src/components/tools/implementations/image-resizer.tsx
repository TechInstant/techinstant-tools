"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Download, Link2, Link2Off } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ToolPanel, Field, ErrorNote } from "@/components/tools/tool-ui";
import { FileDrop, downloadBlob } from "@/components/tools/file-drop";
import { IMAGE_ACCEPT, loadImage, encode, renameFor, MIME_LABELS } from "@/lib/image";
import { formatBytes } from "@/lib/utils";

const PRESETS = [
  { label: "50%", factor: 0.5 },
  { label: "25%", factor: 0.25 },
  { label: "1920 wide", width: 1920 },
  { label: "1080 wide", width: 1080 },
  { label: "512 wide", width: 512 },
];

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lock, setLock] = useState(true);
  const [format, setFormat] = useState("image/jpeg");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ blob: Blob; url: string; w: number; h: number } | null>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);

  /* Unmount-only cleanup. With `result` in the deps this would close the
     bitmap after the first resize, breaking every resize after it. */
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

  const ratio = natural.w && natural.h ? natural.w / natural.h : 1;

  const onPick = async (picked: File[]) => {
    const chosen = picked[0];
    setError("");
    setResult(null);
    try {
      const { bitmap, width: w, height: h } = await loadImage(chosen);
      bitmapRef.current?.close();
      bitmapRef.current = bitmap;
      setFile(chosen);
      setNatural({ w, h });
      setWidth(String(w));
      setHeight(String(h));
      setFormat(chosen.type === "image/png" ? "image/png" : "image/jpeg");
    } catch {
      setError("That image couldn’t be read. It may be damaged or an unsupported format.");
    }
  };

  const changeWidth = (value: string) => {
    setWidth(value);
    setResult(null);
    if (lock && value) {
      const w = Number(value);
      if (Number.isFinite(w) && w > 0) setHeight(String(Math.round(w / ratio)));
    }
  };

  const changeHeight = (value: string) => {
    setHeight(value);
    setResult(null);
    if (lock && value) {
      const h = Number(value);
      if (Number.isFinite(h) && h > 0) setWidth(String(Math.round(h * ratio)));
    }
  };

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    const w = p.width ?? Math.round(natural.w * (p.factor ?? 1));
    changeWidth(String(w));
    if (!lock) setHeight(String(Math.round(w / ratio)));
  };

  const resize = async () => {
    const bitmap = bitmapRef.current;
    if (!bitmap || !file) return;
    const w = Number(width);
    const h = Number(height);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) {
      setError("Enter a width and height of at least 1 pixel.");
      return;
    }
    if (w > 12000 || h > 12000) {
      setError("That size is too large — keep each side under 12000 pixels.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const blob = await encode(bitmap, w, h, format, 0.9);
      if (result) URL.revokeObjectURL(result.url);
      setResult({ blob, url: track(URL.createObjectURL(blob)), w: Math.round(w), h: Math.round(h) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while resizing.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <FileDrop
          {...IMAGE_ACCEPT}
          hint="JPG, PNG or WebP."
          onFiles={onPick}
          onError={setError}
        />
      ) : (
        <ToolPanel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {natural.w} × {natural.h} · {formatBytes(file.size)}
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

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button key={p.label} variant="outline" size="sm" onClick={() => applyPreset(p)}>
                {p.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <Field label="Width (px)" htmlFor="ir-w">
              <Input
                id="ir-w"
                inputMode="numeric"
                value={width}
                onChange={(e) => changeWidth(e.target.value)}
              />
            </Field>

            <div className="flex items-end justify-center pb-1">
              <button
                type="button"
                onClick={() => setLock((v) => !v)}
                aria-pressed={lock}
                aria-label={lock ? "Unlock aspect ratio" : "Lock aspect ratio"}
                title={lock ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                className={`flex h-11 w-11 items-center justify-center rounded-lg border transition-colors ${
                  lock
                    ? "border-brand/40 bg-brand/10 text-brand"
                    : "border-border bg-background-subtle text-muted-foreground"
                }`}
              >
                {lock ? <Link2 className="h-4 w-4" /> : <Link2Off className="h-4 w-4" />}
              </button>
            </div>

            <Field label="Height (px)" htmlFor="ir-h">
              <Input
                id="ir-h"
                inputMode="numeric"
                value={height}
                onChange={(e) => changeHeight(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Output format" htmlFor="ir-format">
            <Select
              id="ir-format"
              value={format}
              onChange={(e) => {
                setFormat(e.target.value);
                setResult(null);
              }}
            >
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
            </Select>
          </Field>

          <Button onClick={resize} disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            {busy ? "Resizing…" : "Resize image"}
          </Button>
        </ToolPanel>
      )}

      {error && <ErrorNote>{error}</ErrorNote>}

      {result && file && (
        <ToolPanel className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.url}
            alt="Resized result"
            className="mx-auto max-h-72 rounded-lg border border-border bg-background-subtle object-contain"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {result.w} × {result.h} · {formatBytes(result.blob.size)}
            </p>
            <Button
              onClick={() => downloadBlob(result.blob, renameFor(file.name, format), format)}
            >
              <Download />
              Download {MIME_LABELS[format]}
            </Button>
          </div>
        </ToolPanel>
      )}
    </div>
  );
}
