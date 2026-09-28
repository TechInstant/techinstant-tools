"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, PenLine, X, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateFile } from "@/components/tools/file-drop";
import { cn } from "@/lib/utils";

export interface SignatureImage {
  /** Transparent PNG, ready to draw onto a canvas. */
  dataUrl: string;
  width: number;
  height: number;
  source: "upload" | "draw";
}

type Mode = "upload" | "draw";

const PAD_W = 900;
const PAD_H = 300;

/**
 * Lets someone either upload a signature image or draw one with a mouse,
 * trackpad or finger.
 *
 * A drawn signature is trimmed to its ink and exported with a transparent
 * background, so it sits on the certificate like a real signature rather than
 * as a white rectangle over the page.
 */
export function SignaturePad({
  value,
  onChange,
  onError,
}: {
  value: SignatureImage | null;
  onChange: (next: SignatureImage | null) => void;
  onError: (message: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("upload");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drawing = useRef(false);
  const strokes = useRef<{ x: number; y: number }[][]>([]);
  const [hasInk, setHasInk] = useState(false);

  /* Both callers must pass the same options: the first getContext call on a
     canvas decides them, and later calls with different options are ignored. */
  const padContext = (canvas: HTMLCanvasElement) =>
    canvas.getContext("2d", { willReadFrequently: true });

  const repaint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = padContext(canvas);
    if (!ctx) return;

    ctx.clearRect(0, 0, PAD_W, PAD_H);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const stroke of strokes.current) {
      if (stroke.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      /* A quadratic through the midpoints smooths out the jitter you get from
         raw pointer samples, which otherwise looks nothing like handwriting. */
      for (let i = 1; i < stroke.length; i++) {
        const mid = {
          x: (stroke[i - 1].x + stroke[i].x) / 2,
          y: (stroke[i - 1].y + stroke[i].y) / 2,
        };
        ctx.quadraticCurveTo(stroke[i - 1].x, stroke[i - 1].y, mid.x, mid.y);
      }
      ctx.lineTo(
        stroke[stroke.length - 1].x,
        stroke[stroke.length - 1].y
      );
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    if (mode === "draw") repaint();
  }, [mode, repaint]);

  const pointFrom = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * PAD_W,
      y: ((e.clientY - rect.top) / rect.height) * PAD_H,
    };
  };

  /** Crops to the drawn ink and exports a transparent PNG. */
  const commitDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk) return;

    /* The bounds pass reads the whole pad back on every stroke, which Chrome
       warns about unless the context is declared read-heavy up front. */
    const ctx = padContext(canvas);
    if (!ctx) return;
    const { data } = ctx.getImageData(0, 0, PAD_W, PAD_H);

    let minX = PAD_W;
    let minY = PAD_H;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < PAD_H; y++) {
      for (let x = 0; x < PAD_W; x++) {
        if (data[(y * PAD_W + x) * 4 + 3] > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return;

    const pad = 8;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(PAD_W - 1, maxX + pad);
    maxY = Math.min(PAD_H - 1, maxY + pad);

    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const octx = out.getContext("2d");
    if (!octx) return;
    octx.drawImage(canvas, minX, minY, w, h, 0, 0, w, h);

    onChange({
      dataUrl: out.toDataURL("image/png"),
      width: w,
      height: h,
      source: "draw",
    });
  };

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    const invalid = validateFile(file, {
      extensions: [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"],
      mimePrefixes: ["image/"],
      maxBytes: 10 * 1024 * 1024,
    });
    if (invalid) {
      onError(invalid);
      return;
    }

    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("decode failed"));
        el.src = url;
      });

      const srcW = img.naturalWidth || 600;
      const srcH = img.naturalHeight || 200;
      const scale = Math.min(1, 900 / Math.max(srcW, srcH));
      const w = Math.max(1, Math.round(srcW * scale));
      const h = Math.max(1, Math.round(srcH * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no context");
      ctx.drawImage(img, 0, 0, w, h);

      /* Photographed or scanned signatures arrive on white paper. Knocking the
         near-white pixels out means it does not print as a grey box. */
      const image = ctx.getImageData(0, 0, w, h);
      const px = image.data;
      for (let i = 0; i < px.length; i += 4) {
        const lightness = (px[i] + px[i + 1] + px[i + 2]) / 3;
        if (lightness > 228) px[i + 3] = 0;
        else if (lightness > 180) px[i + 3] = Math.round(px[i + 3] * 0.5);
      }
      ctx.putImageData(image, 0, 0);

      onChange({
        dataUrl: canvas.toDataURL("image/png"),
        width: w,
        height: h,
        source: "upload",
      });
      onError("");
    } catch {
      onError(
        "That signature image could not be read. Try saving it as a PNG and picking it again."
      );
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex rounded-lg border border-border bg-muted p-0.5">
        {(["upload", "draw"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
              mode === m
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m === "upload" ? <Upload className="h-4 w-4" /> : <PenLine className="h-4 w-4" />}
            {m === "upload" ? "Upload" : "Draw"}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="sr-only"
            aria-label="Choose a signature image"
            onChange={(e) => {
              void pickFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload />
            Choose a signature image
          </Button>
          <p className="text-xs text-muted-foreground">
            Sign on white paper, photograph it, and the background is removed
            automatically.
          </p>
        </>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            width={PAD_W}
            height={PAD_H}
            aria-label="Signature drawing area"
            className="h-32 w-full touch-none rounded-lg border border-dashed border-border bg-card"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              drawing.current = true;
              strokes.current.push([pointFrom(e)]);
              setHasInk(true);
              repaint();
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return;
              strokes.current[strokes.current.length - 1]?.push(pointFrom(e));
              repaint();
            }}
            onPointerUp={() => {
              drawing.current = false;
              commitDrawing();
            }}
            onPointerLeave={() => {
              if (!drawing.current) return;
              drawing.current = false;
              commitDrawing();
            }}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={strokes.current.length === 0}
              onClick={() => {
                strokes.current.pop();
                setHasInk(strokes.current.length > 0);
                repaint();
                if (strokes.current.length === 0) onChange(null);
                else commitDrawing();
              }}
            >
              <Undo2 />
              Undo stroke
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={strokes.current.length === 0}
              onClick={() => {
                strokes.current = [];
                setHasInk(false);
                repaint();
                onChange(null);
              }}
            >
              Clear
            </Button>
          </div>
        </>
      )}

      {value && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background-subtle p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.dataUrl}
            alt="Signature preview"
            className="h-10 w-auto max-w-40 object-contain"
          />
          <p className="flex-1 text-xs text-muted-foreground">
            {value.source === "draw" ? "Drawn" : "Uploaded"} signature ready.
          </p>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Remove signature"
            onClick={() => {
              strokes.current = [];
              setHasInk(false);
              repaint();
              onChange(null);
            }}
          >
            <X />
          </Button>
        </div>
      )}
    </div>
  );
}
