"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Download, Crop as CropIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel, ErrorNote } from "@/components/tools/tool-ui";
import { FileDrop, downloadBlob } from "@/components/tools/file-drop";
import { IMAGE_ACCEPT, loadImage, encode, renameFor } from "@/lib/image";
import { formatBytes, cn } from "@/lib/utils";

const RATIOS = [
  { label: "Free", value: 0 },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 },
] as const;

/** Crop box in normalised 0–1 coordinates, so it survives any preview size. */
interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

type DragMode = "move" | "nw" | "ne" | "sw" | "se" | null;

export default function ImageCropper() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [ratio, setRatio] = useState<number>(0);
  const [box, setBox] = useState<Box>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ blob: Blob; url: string; w: number; h: number } | null>(null);

  const frameRef = useRef<HTMLDivElement>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);
  const drag = useRef<{ mode: DragMode; startX: number; startY: number; start: Box } | null>(null);

  /* Unmount-only cleanup. With `url`/`result` in the deps this would close the
     bitmap as soon as the preview appeared, so cropping would always fail. */
  const urlsRef = useRef<string[]>([]);
  useEffect(
    () => () => {
      bitmapRef.current?.close();
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    },
    []
  );
  const track = (u: string) => {
    urlsRef.current.push(u);
    return u;
  };

  /** Re-fit the box when a fixed ratio is chosen, keeping it centred. */
  const applyRatio = useCallback(
    (r: number) => {
      setRatio(r);
      setResult(null);
      if (r === 0 || !natural.w) return;

      /* Ratio is width:height in *pixels*, so convert through the image's own
         aspect before applying it to normalised coordinates. */
      const imageAspect = natural.w / natural.h;
      let w = 0.8;
      let h = (w * imageAspect) / r;
      if (h > 0.9) {
        h = 0.9;
        w = (h * r) / imageAspect;
      }
      setBox({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
    },
    [natural]
  );

  const onPick = async (picked: File[]) => {
    const chosen = picked[0];
    setError("");
    setResult(null);
    try {
      const { bitmap, width, height } = await loadImage(chosen);
      bitmapRef.current?.close();
      bitmapRef.current = bitmap;
      setFile(chosen);
      setNatural({ w: width, h: height });
      if (url) URL.revokeObjectURL(url);
      setUrl(track(URL.createObjectURL(chosen)));
      setBox({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
      setRatio(0);
    } catch {
      setError("That image couldn’t be read. It may be damaged or an unsupported format.");
    }
  };

  const onPointerDown = (mode: DragMode) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { mode, startX: e.clientX, startY: e.clientY, start: { ...box } };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const frame = frameRef.current;
    if (!d || !frame) return;

    const rect = frame.getBoundingClientRect();
    const dx = (e.clientX - d.startX) / rect.width;
    const dy = (e.clientY - d.startY) / rect.height;
    const s = d.start;

    if (d.mode === "move") {
      setBox({
        ...s,
        x: clamp01(Math.min(s.x + dx, 1 - s.w)),
        y: clamp01(Math.min(s.y + dy, 1 - s.h)),
      });
      setResult(null);
      return;
    }

    const min = 0.05;
    let { x, y, w, h } = s;

    if (d.mode === "se") {
      w = Math.max(min, Math.min(s.w + dx, 1 - s.x));
      h = Math.max(min, Math.min(s.h + dy, 1 - s.y));
    } else if (d.mode === "sw") {
      w = Math.max(min, Math.min(s.w - dx, s.x + s.w));
      x = s.x + s.w - w;
      h = Math.max(min, Math.min(s.h + dy, 1 - s.y));
    } else if (d.mode === "ne") {
      w = Math.max(min, Math.min(s.w + dx, 1 - s.x));
      h = Math.max(min, Math.min(s.h - dy, s.y + s.h));
      y = s.y + s.h - h;
    } else if (d.mode === "nw") {
      w = Math.max(min, Math.min(s.w - dx, s.x + s.w));
      x = s.x + s.w - w;
      h = Math.max(min, Math.min(s.h - dy, s.y + s.h));
      y = s.y + s.h - h;
    }

    /* Keep a fixed ratio by deriving height from width. */
    if (ratio !== 0 && natural.w) {
      const imageAspect = natural.w / natural.h;
      h = (w * imageAspect) / ratio;
      if (y + h > 1) h = 1 - y;
      w = (h * ratio) / imageAspect;
    }

    setBox({ x: clamp01(x), y: clamp01(y), w, h });
    setResult(null);
  };

  const endDrag = () => {
    drag.current = null;
  };

  const crop = async () => {
    const bitmap = bitmapRef.current;
    if (!bitmap || !file) return;
    const sx = Math.round(box.x * natural.w);
    const sy = Math.round(box.y * natural.h);
    const sw = Math.round(box.w * natural.w);
    const sh = Math.round(box.h * natural.h);

    if (sw < 1 || sh < 1) {
      setError("That crop area is too small.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await encode(bitmap, sw, sh, mime, 0.92, {
        x: sx,
        y: sy,
        width: sw,
        height: sh,
      });
      if (result) URL.revokeObjectURL(result.url);
      setResult({ blob, url: track(URL.createObjectURL(blob)), w: sw, h: sh });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while cropping.");
    } finally {
      setBusy(false);
    }
  };

  const pxW = Math.round(box.w * natural.w);
  const pxH = Math.round(box.h * natural.h);

  return (
    <div className="space-y-4">
      {!file ? (
        <FileDrop
          {...IMAGE_ACCEPT}
          hint="Drag the corners to set your crop."
          onFiles={onPick}
          onError={setError}
        />
      ) : (
        <ToolPanel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {natural.w} × {natural.h} · crop {pxW} × {pxH}
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
            {RATIOS.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => applyRatio(r.value)}
                aria-pressed={ratio === r.value}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  ratio === r.value
                    ? "border-brand/40 bg-brand/10 text-brand"
                    : "border-border bg-background-subtle text-muted-foreground hover:text-foreground"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div
            ref={frameRef}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="relative mx-auto max-h-[60vh] w-fit touch-none select-none overflow-hidden rounded-lg border border-border bg-background-subtle"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Crop preview"
              draggable={false}
              className="block max-h-[60vh] w-auto max-w-full object-contain"
            />

            {/* dim everything outside the crop */}
            <div
              className="pointer-events-none absolute inset-0 bg-black/50"
              style={{
                clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${box.x * 100}% ${box.y * 100}%, ${box.x * 100}% ${(box.y + box.h) * 100}%, ${(box.x + box.w) * 100}% ${(box.y + box.h) * 100}%, ${(box.x + box.w) * 100}% ${box.y * 100}%, ${box.x * 100}% ${box.y * 100}%)`,
              }}
            />

            <div
              onPointerDown={onPointerDown("move")}
              className="absolute cursor-move border-2 border-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
              style={{
                left: `${box.x * 100}%`,
                top: `${box.y * 100}%`,
                width: `${box.w * 100}%`,
                height: `${box.h * 100}%`,
              }}
            >
              {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                <span
                  key={corner}
                  onPointerDown={onPointerDown(corner)}
                  className={cn(
                    "absolute h-4 w-4 rounded-sm border-2 border-white bg-[var(--brand-solid)]",
                    corner === "nw" && "-left-2 -top-2 cursor-nwse-resize",
                    corner === "ne" && "-right-2 -top-2 cursor-nesw-resize",
                    corner === "sw" && "-bottom-2 -left-2 cursor-nesw-resize",
                    corner === "se" && "-bottom-2 -right-2 cursor-nwse-resize"
                  )}
                />
              ))}
            </div>
          </div>

          <Button onClick={crop} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <CropIcon />}
            {busy ? "Cropping…" : `Crop to ${pxW} × ${pxH}`}
          </Button>
        </ToolPanel>
      )}

      {error && <ErrorNote>{error}</ErrorNote>}

      {result && file && (
        <ToolPanel className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.url}
            alt="Cropped result"
            className="mx-auto max-h-72 rounded-lg border border-border bg-background-subtle object-contain"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {result.w} × {result.h} · {formatBytes(result.blob.size)}
            </p>
            <Button
              onClick={() => {
                const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
                downloadBlob(result.blob, renameFor(`${file.name}-cropped`, mime), mime);
              }}
            >
              <Download />
              Download
            </Button>
          </div>
        </ToolPanel>
      )}
    </div>
  );
}
