"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import {
  ToolPanel,
  Field,
  ErrorNote,
  CopyButton,
} from "@/components/tools/tool-ui";
import { FileDrop, downloadBlob } from "@/components/tools/file-drop";
import { createZip, type ZipEntry } from "@/lib/zip";
import { cn } from "@/lib/utils";

/* The sizes that actually get requested in 2026. Anything beyond this is
   legacy weight for browsers nobody is using. */
const SIZES = [
  { size: 16, name: "favicon-16x16.png", note: "Browser tab" },
  { size: 32, name: "favicon-32x32.png", note: "Tab on a high-DPI screen" },
  { size: 48, name: "favicon-48x48.png", note: "Windows site shortcut" },
  { size: 180, name: "apple-touch-icon.png", note: "iOS home screen" },
  { size: 192, name: "android-chrome-192x192.png", note: "Android home screen" },
  { size: 512, name: "android-chrome-512x512.png", note: "PWA splash screen" },
];

type Fit = "contain" | "cover";

export default function FaviconGenerator() {
  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [fit, setFit] = useState<Fit>("cover");
  const [background, setBackground] = useState("#ffffff");
  const [transparent, setTransparent] = useState(true);
  const [padding, setPadding] = useState(0);
  const [radius, setRadius] = useState(0);
  const [previews, setPreviews] = useState<{ size: number; url: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  /* Preview object URLs are revoked on unmount only — revoking when `previews`
     changes would kill the URL still on screen during the swap. */
  const urlsRef = useRef<string[]>([]);
  useEffect(
    () => () => {
      for (const url of urlsRef.current) URL.revokeObjectURL(url);
      urlsRef.current = [];
    },
    []
  );

  const renderSize = (size: number): HTMLCanvasElement | null => {
    if (!source) return null;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const inset = Math.round((padding / 100) * size);
    const box = size - inset * 2;

    if (radius > 0) {
      /* Clip first so both the background and the image are rounded. */
      const r = (radius / 100) * (size / 2);
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, r);
      ctx.clip();
    }

    if (!transparent) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, size, size);
    }

    const sw = source.naturalWidth || 1;
    const sh = source.naturalHeight || 1;

    if (fit === "cover") {
      /* Crop to a square centre so the icon fills the tile. */
      const side = Math.min(sw, sh);
      ctx.drawImage(
        source,
        (sw - side) / 2,
        (sh - side) / 2,
        side,
        side,
        inset,
        inset,
        box,
        box
      );
    } else {
      const scale = Math.min(box / sw, box / sh);
      const w = sw * scale;
      const h = sh * scale;
      ctx.drawImage(source, inset + (box - w) / 2, inset + (box - h) / 2, w, h);
    }

    return canvas;
  };

  /* Regenerate the previews whenever the source or any option changes. */
  useEffect(() => {
    if (!source) {
      setPreviews([]);
      return;
    }
    let cancelled = false;

    (async () => {
      const next: { size: number; url: string }[] = [];
      for (const { size } of SIZES) {
        const canvas = renderSize(size);
        if (!canvas) continue;
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
        if (!blob) continue;
        const url = URL.createObjectURL(blob);
        urlsRef.current.push(url);
        next.push({ size, url });
      }
      if (!cancelled) setPreviews(next);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, fit, background, transparent, padding, radius]);

  const pick = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("decode failed"));
        el.src = url;
      });
      if ((img.naturalWidth || 0) < 128 || (img.naturalHeight || 0) < 128) {
        setError(
          "That image is smaller than 128×128, so the large icons would come out blurry. Use at least a 512×512 source."
        );
      } else {
        setError("");
      }
      setSource(img);
      setSourceName(file.name);
    } catch {
      setError("That image could not be read. Try a PNG, JPG or SVG.");
    } finally {
      /* The <img> has decoded by now, so the object URL is no longer needed.
         Revoking here would break it, so hand it to the unmount cleanup. */
      urlsRef.current.push(url);
    }
  };

  const downloadOne = async (size: number, name: string) => {
    const canvas = renderSize(size);
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
    if (blob) downloadBlob(blob, name, "image/png");
  };

  const downloadZip = async () => {
    if (!source) return;
    setBusy(true);
    setError("");
    try {
      const entries: ZipEntry[] = [];
      for (const { size, name } of SIZES) {
        const canvas = renderSize(size);
        if (!canvas) continue;
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
        if (!blob) continue;
        entries.push({ name, data: new Uint8Array(await blob.arrayBuffer()) });
      }
      entries.push({
        name: "site.webmanifest",
        data: new TextEncoder().encode(MANIFEST),
      });
      entries.push({ name: "head-snippet.html", data: new TextEncoder().encode(SNIPPET) });
      downloadBlob(createZip(entries), "favicons.zip", "application/zip");
    } catch {
      setError("The archive could not be built. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!source ? (
        <FileDrop
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          extensions={[".png", ".jpg", ".jpeg", ".webp", ".svg"]}
          mimePrefixes={["image/"]}
          maxBytes={20 * 1024 * 1024}
          hint="A square PNG or SVG at 512×512 or larger gives the best result."
          onFiles={(files) => void pick(files)}
          onError={setError}
        />
      ) : (
        <ToolPanel className="flex flex-wrap items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previews.find((p) => p.size === 512)?.url ?? ""}
            alt="Source preview"
            className="h-16 w-16 rounded border border-border object-contain"
          />
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {sourceName}
            <span className="block text-xs font-normal text-muted-foreground">
              {source.naturalWidth} × {source.naturalHeight} px
            </span>
          </p>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Remove image"
            onClick={() => {
              setSource(null);
              setPreviews([]);
            }}
          >
            <X />
          </Button>
        </ToolPanel>
      )}

      {error && <ErrorNote>{error}</ErrorNote>}

      {source && (
        <>
          <ToolPanel className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Fit"
                htmlFor="fg-fit"
                hint={
                  fit === "cover"
                    ? "Crops to a square. Best for photos and full-bleed marks."
                    : "Fits the whole image in, letterboxed. Best for wide logos."
                }
              >
                <Select id="fg-fit" value={fit} onChange={(e) => setFit(e.target.value as Fit)}>
                  <option value="cover">Crop to square</option>
                  <option value="contain">Fit whole image</option>
                </Select>
              </Field>

              <Field label={`Padding — ${padding}%`} htmlFor="fg-pad">
                <input
                  id="fg-pad"
                  type="range"
                  min={0}
                  max={30}
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="h-11 w-full accent-[var(--color-brand-solid,#05a85a)]"
                />
              </Field>

              <Field label={`Corner rounding — ${radius}%`} htmlFor="fg-radius">
                <input
                  id="fg-radius"
                  type="range"
                  min={0}
                  max={100}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="h-11 w-full accent-[var(--color-brand-solid,#05a85a)]"
                />
              </Field>

              <Field label="Background">
                <div className="space-y-2">
                  <label
                    htmlFor="fg-transparent"
                    className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      id="fg-transparent"
                      type="checkbox"
                      checked={transparent}
                      onChange={(e) => setTransparent(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-[var(--color-brand-solid,#05a85a)]"
                    />
                    <span className="text-foreground">Keep transparent</span>
                  </label>
                  {!transparent && (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-input bg-card p-1"
                        aria-label="Background colour"
                      />
                      <Input
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        aria-label="Background colour hex"
                        spellCheck={false}
                      />
                    </div>
                  )}
                </div>
              </Field>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              A transparent icon shows the browser&apos;s own tab colour behind it,
              which can leave a dark logo invisible in dark mode. If your mark is
              a single dark colour, give it a solid background.
            </p>
          </ToolPanel>

          <ToolPanel>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Every size
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SIZES.map(({ size, name, note }) => {
                const preview = previews.find((p) => p.size === size);
                return (
                  <div
                    key={size}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background-subtle p-3"
                  >
                    <div
                      className={cn(
                        "flex h-14 w-14 shrink-0 items-center justify-center rounded",
                        transparent && "bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#f9fafb_0%_50%)] bg-[length:12px_12px]"
                      )}
                    >
                      {preview && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={preview.url}
                          alt={`${size} by ${size} preview`}
                          width={Math.min(size, 56)}
                          height={Math.min(size, 56)}
                          className="object-contain"
                          style={{ imageRendering: size <= 48 ? "pixelated" : "auto" }}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {size} × {size}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{note}</p>
                      <button
                        type="button"
                        onClick={() => void downloadOne(size, name)}
                        className="mt-1 text-xs font-semibold text-brand hover:underline"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button className="mt-4" onClick={() => void downloadZip()} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Package />}
              {busy ? "Building…" : "Download all as ZIP"}
            </Button>
          </ToolPanel>

          <ToolPanel>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Add this to your &lt;head&gt;
              </h2>
              <CopyButton value={SNIPPET} />
            </div>
            <pre className="mt-3 overflow-auto rounded-lg bg-background-subtle p-4 font-mono text-xs leading-relaxed text-foreground">
              {SNIPPET}
            </pre>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">site.webmanifest</h3>
              <CopyButton value={MANIFEST} />
            </div>
            <pre className="mt-2 overflow-auto rounded-lg bg-background-subtle p-4 font-mono text-xs leading-relaxed text-foreground">
              {MANIFEST}
            </pre>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Put the PNG files and the manifest at the root of your site. If the
              old icon sticks around after you deploy, that is the browser cache,
              not a mistake — favicons are cached aggressively. A hard reload or a
              private window will show you the truth.
            </p>
          </ToolPanel>

          <div className="flex justify-start">
            <Button variant="outline" onClick={() => void downloadOne(512, "icon-512.png")}>
              <Download />
              Download the 512px master
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

const SNIPPET = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

const MANIFEST = `{
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}`;
