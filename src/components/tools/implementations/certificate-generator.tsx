"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Loader2,
  X,
  ImagePlus,
  Save,
  RotateCcw,
  FileSpreadsheet,
  Package,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { ToolPanel, Field, ErrorNote } from "@/components/tools/tool-ui";
import {
  downloadBlob,
  validateFile,
  openBlobPreview,
} from "@/components/tools/file-drop";
import { SignaturePad, type SignatureImage } from "@/components/tools/signature-pad";
import { todayValue, fromInputValue, formatLong } from "@/lib/date";
import { CERT_FONTS, getCertFont, ensureFontLoaded } from "@/lib/certificate-fonts";
import {
  CERT_TEMPLATES,
  getCertTemplate,
  renderCertificate,
  CANVAS_W,
  CANVAS_H,
  type CertificateConfig,
  type LogoPlacement,
} from "@/lib/certificate-render";
import { createZip, safeFileName, type ZipEntry } from "@/lib/zip";
import { parseCsvWithAliases } from "@/lib/csv";
import { cn } from "@/lib/utils";

const PRESET_KEY = "techinstant-certificate-preset";

const ACCENT_SWATCHES = ["#17314f", "#05a85a", "#6b1622", "#1b1b1f", "#7a5a12", "#2b3a8f"];

interface LoadedImage {
  image: HTMLImageElement;
  dataUrl: string;
  aspect: number;
  name: string;
}

/** Decodes a data URL into an <img> we can draw on the canvas. */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("decode failed"));
    el.src = dataUrl;
  });
}

/**
 * Redraws any picked image as a PNG data URL.
 *
 * People reach for a WebP, GIF or SVG logo without thinking about it, and an
 * SVG with no intrinsic size decodes to 0×0 in some browsers. Going through a
 * canvas normalises all of that and caps the pixel size.
 */
async function normaliseImage(file: File): Promise<LoadedImage> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode failed"));
      el.src = objectUrl;
    });

    const srcW = img.naturalWidth || 512;
    const srcH = img.naturalHeight || 512;
    const MAX = 900;
    const scale = Math.min(1, MAX / Math.max(srcW, srcH));
    const w = Math.max(1, Math.round(srcW * scale));
    const h = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas context");
    ctx.drawImage(img, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/png");
    return { image: await loadImage(dataUrl), dataUrl, aspect: w / h, name: file.name };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

const CSV_ALIASES = {
  recipient: ["name", "fullname", "recipient", "student", "participant", "attendee"],
  body: ["achievement", "body", "course", "description", "for", "details"],
  reference: ["reference", "ref", "refno", "certificateid", "id", "number"],
  date: ["date", "issued", "issuedate", "completiondate"],
  organisation: ["organisation", "organization", "org", "issuer", "company"],
} as const;

type CsvField = keyof typeof CSV_ALIASES;

export default function CertificateGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [template, setTemplate] = useState("classic");
  const [title, setTitle] = useState("Certificate of Completion");
  const [recipient, setRecipient] = useState("Ada Obi");
  const [body, setBody] = useState(
    "has successfully completed the Introduction to Data Analysis course"
  );
  const [org, setOrg] = useState("Northline Academy");
  const [date, setDate] = useState(() => todayValue());
  const [signatory, setSignatory] = useState("");
  const [signatoryRole, setSignatoryRole] = useState("Course Director");
  const [reference, setReference] = useState("");

  const [fontId, setFontId] = useState("poppins");
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState("#10151f");
  const [accentColor, setAccentColor] = useState("#17314f");
  const [showFrame, setShowFrame] = useState(true);

  const [logo, setLogo] = useState<LoadedImage | null>(null);
  const [logoPlacement, setLogoPlacement] = useState<LogoPlacement>("center");
  const [signature, setSignature] = useState<SignatureImage | null>(null);
  const [signatureImg, setSignatureImg] = useState<HTMLImageElement | null>(null);

  const [showQr, setShowQr] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [qrImg, setQrImg] = useState<HTMLImageElement | null>(null);

  const [batch, setBatch] = useState<Partial<Record<CsvField, string>>[]>([]);
  const [batchName, setBatchName] = useState("");
  const [batchNote, setBatchNote] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [fontReady, setFontReady] = useState(false);

  const font = getCertFont(fontId);

  /* Switching template resets the frame toggle to that template's default,
     because "frame off" means something different on each one. */
  const chooseTemplate = (id: string) => {
    setTemplate(id);
    setShowFrame(getCertTemplate(id).frameByDefault);
  };

  /* Canvas renders with whatever font is loaded at that instant, so the first
     paint must wait for the real one or it silently falls back to a system
     serif. */
  useEffect(() => {
    let active = true;
    setFontReady(false);
    ensureFontLoaded(font).then(() => {
      if (active) setFontReady(true);
    });
    return () => {
      active = false;
    };
  }, [font]);

  useEffect(() => {
    if (!signature) {
      setSignatureImg(null);
      return;
    }
    let active = true;
    loadImage(signature.dataUrl)
      .then((img) => {
        if (active) setSignatureImg(img);
      })
      .catch(() => setSignatureImg(null));
    return () => {
      active = false;
    };
  }, [signature]);

  useEffect(() => {
    if (!showQr) {
      setQrImg(null);
      return;
    }
    const text = qrValue.trim() || reference.trim() || recipient.trim();
    if (!text) {
      setQrImg(null);
      return;
    }
    let active = true;
    (async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const url = await QRCode.toDataURL(text, {
          margin: 1,
          width: 400,
          color: { dark: fontColor, light: "#ffffff" },
        });
        const img = await loadImage(url);
        if (active) setQrImg(img);
      } catch {
        if (active) setQrImg(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [showQr, qrValue, reference, recipient, fontColor]);

  const dateLabel = useMemo(() => {
    const parsed = fromInputValue(date);
    return parsed ? formatLong(parsed) : date;
  }, [date]);

  const config = useCallback(
    (overrides: Partial<CertificateConfig> = {}): CertificateConfig => ({
      template,
      title,
      recipient,
      body,
      organisation: org,
      dateLabel,
      signatory,
      signatoryRole,
      reference,
      fontFamily: font.family,
      fontWeightRegular: font.weights.regular,
      fontWeightBold: font.weights.bold,
      fontSize,
      fontColor,
      accentColor,
      showFrame,
      logo: logo?.image ?? null,
      logoAspect: logo?.aspect ?? 1,
      logoPlacement,
      signature: signatureImg,
      signatureAspect: signature ? signature.width / signature.height : 3,
      qr: qrImg,
      ...overrides,
    }),
    [
      template,
      title,
      recipient,
      body,
      org,
      dateLabel,
      signatory,
      signatoryRole,
      reference,
      font,
      fontSize,
      fontColor,
      accentColor,
      showFrame,
      logo,
      logoPlacement,
      signatureImg,
      signature,
      qrImg,
    ]
  );

  useEffect(() => {
    if (!fontReady) return;
    const canvas = canvasRef.current;
    if (canvas) renderCertificate(canvas, config());
  }, [config, fontReady]);

  /* ------------------------------------------------------------- exports */

  const filenameFor = (name: string) =>
    safeFileName(`certificate-${name || "recipient"}`, "certificate");

  const exportRaster = async (type: "image/png" | "image/jpeg") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(type === "image/png" ? "png" : "jpeg");
    setError("");
    try {
      /* JPEG has no alpha, so it needs an explicit white backing or the
         transparent areas come out black. */
      let source = canvas;
      if (type === "image/jpeg") {
        const flat = document.createElement("canvas");
        flat.width = canvas.width;
        flat.height = canvas.height;
        const ctx = flat.getContext("2d");
        if (!ctx) throw new Error("no context");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, flat.width, flat.height);
        ctx.drawImage(canvas, 0, 0);
        source = flat;
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        source.toBlob(resolve, type, type === "image/jpeg" ? 0.94 : undefined)
      );
      if (!blob) throw new Error("encode failed");
      downloadBlob(
        blob,
        `${filenameFor(recipient)}.${type === "image/png" ? "png" : "jpg"}`,
        type
      );
    } catch {
      setError("The image could not be created. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const canvasToPngBytes = async (canvas: HTMLCanvasElement) => {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) throw new Error("encode failed");
    return new Uint8Array(await blob.arrayBuffer());
  };

  const buildPdfBytes = async () => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("no canvas");
    const bytes = await canvasToPngBytes(canvas);
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.create();
    const page = doc.addPage([842, 595]); // A4 landscape, points
    const png = await doc.embedPng(bytes);
    page.drawImage(png, { x: 0, y: 0, width: 842, height: 595 });
    return (await doc.save()) as unknown as BlobPart;
  };

  const exportPdf = async () => {
    setBusy("pdf");
    setError("");
    try {
      downloadBlob(await buildPdfBytes(), `${filenameFor(recipient)}.pdf`, "application/pdf");
    } catch {
      setError("The PDF could not be created. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const previewPdf = async () => {
    setBusy("preview");
    setError("");
    const outcome = await openBlobPreview(buildPdfBytes, "application/pdf");
    if (outcome === "blocked") {
      setError(
        "Your browser blocked the preview tab. Allow pop-ups for this site, or just download the PDF instead."
      );
    } else if (outcome === "failed") {
      setError("The preview could not be created. Please try again.");
    }
    setBusy(null);
  };

  /* --------------------------------------------------------------- batch */

  const readCsv = async (file: File | undefined) => {
    if (!file) return;
    const invalid = validateFile(file, {
      extensions: [".csv", ".txt"],
      mimePrefixes: ["text/"],
      maxBytes: 5 * 1024 * 1024,
    });
    if (invalid) {
      setError(invalid);
      return;
    }
    try {
      const text = await file.text();
      const { rows, unmatchedHeaders } = parseCsvWithAliases<CsvField>(text, {
        recipient: [...CSV_ALIASES.recipient],
        body: [...CSV_ALIASES.body],
        reference: [...CSV_ALIASES.reference],
        date: [...CSV_ALIASES.date],
        organisation: [...CSV_ALIASES.organisation],
      });

      const named = rows.filter((r) => r.recipient);
      if (named.length === 0) {
        setError(
          "No names found. The file needs a column headed Name (or Recipient, Student, Participant) with one row per person."
        );
        setBatch([]);
        setBatchNote("");
        return;
      }

      setError("");
      setBatch(named);
      setBatchName(file.name);
      const skipped = rows.length - named.length;
      setBatchNote(
        [
          `${named.length} ${named.length === 1 ? "name" : "names"} read`,
          skipped > 0 ? `${skipped} row${skipped === 1 ? "" : "s"} skipped with no name` : "",
          unmatchedHeaders.length ? `columns ignored: ${unmatchedHeaders.join(", ")}` : "",
        ]
          .filter(Boolean)
          .join(" · ")
      );
    } catch {
      setError("That file could not be read. Save it as CSV and try again.");
    }
  };

  const generateBatch = async () => {
    if (batch.length === 0) return;
    setBusy("batch");
    setError("");
    setProgress({ done: 0, total: batch.length });

    /* An offscreen canvas so the preview the user is looking at is untouched,
       and only one full-size canvas exists at a time. */
    const work = document.createElement("canvas");
    work.width = CANVAS_W;
    work.height = CANVAS_H;

    try {
      const entries: ZipEntry[] = [];
      const used = new Set<string>();

      for (let i = 0; i < batch.length; i++) {
        const row = batch[i];
        const rowDate = row.date ? fromInputValue(row.date) : null;

        renderCertificate(
          work,
          config({
            recipient: row.recipient ?? "",
            body: row.body ?? body,
            reference: row.reference ?? reference,
            organisation: row.organisation ?? org,
            dateLabel: rowDate ? formatLong(rowDate) : row.date || dateLabel,
          })
        );

        let name = filenameFor(row.recipient ?? `row-${i + 1}`);
        if (used.has(name)) name = `${name}-${i + 1}`;
        used.add(name);

        entries.push({ name: `${name}.png`, data: await canvasToPngBytes(work) });
        setProgress({ done: i + 1, total: batch.length });

        /* Yield so the progress counter actually paints between rows. */
        await new Promise((r) => setTimeout(r, 0));
      }

      downloadBlob(
        createZip(entries),
        `certificates-${entries.length}.zip`,
        "application/zip"
      );
    } catch {
      setError(
        "The batch could not be completed. Very large batches can run out of memory — try splitting the file."
      );
    } finally {
      setBusy(null);
      setProgress(null);
    }
  };

  /* ------------------------------------------------------------- presets */

  const savePreset = () => {
    try {
      localStorage.setItem(
        PRESET_KEY,
        JSON.stringify({
          template,
          title,
          body,
          org,
          signatory,
          signatoryRole,
          fontId,
          fontSize,
          fontColor,
          accentColor,
          showFrame,
          logoPlacement,
          showQr,
          qrValue,
          logoDataUrl: logo?.dataUrl ?? null,
          logoName: logo?.name ?? null,
          signatureDataUrl: signature?.dataUrl ?? null,
        })
      );
      setSaved("Preset saved in this browser.");
      setTimeout(() => setSaved(""), 2500);
    } catch {
      setError(
        "The preset could not be saved. Private browsing and blocked site data both prevent it."
      );
    }
  };

  const loadPreset = async () => {
    try {
      const raw = localStorage.getItem(PRESET_KEY);
      if (!raw) {
        setError("No saved preset found in this browser yet.");
        return;
      }
      const p = JSON.parse(raw) as Record<string, unknown>;
      const str = (k: string, fallback: string) =>
        typeof p[k] === "string" ? (p[k] as string) : fallback;

      setTemplate(str("template", template));
      setTitle(str("title", title));
      setBody(str("body", body));
      setOrg(str("org", org));
      setSignatory(str("signatory", signatory));
      setSignatoryRole(str("signatoryRole", signatoryRole));
      setFontId(str("fontId", fontId));
      if (typeof p.fontSize === "number") setFontSize(p.fontSize);
      setFontColor(str("fontColor", fontColor));
      setAccentColor(str("accentColor", accentColor));
      if (typeof p.showFrame === "boolean") setShowFrame(p.showFrame);
      setLogoPlacement(str("logoPlacement", logoPlacement) as LogoPlacement);
      if (typeof p.showQr === "boolean") setShowQr(p.showQr);
      setQrValue(str("qrValue", qrValue));

      if (typeof p.logoDataUrl === "string") {
        const img = await loadImage(p.logoDataUrl);
        setLogo({
          image: img,
          dataUrl: p.logoDataUrl,
          aspect: img.naturalWidth / img.naturalHeight,
          name: str("logoName", "logo.png"),
        });
      }
      if (typeof p.signatureDataUrl === "string") {
        const img = await loadImage(p.signatureDataUrl);
        setSignature({
          dataUrl: p.signatureDataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          source: "upload",
        });
      }

      setError("");
      setSaved("Preset loaded.");
      setTimeout(() => setSaved(""), 2500);
    } catch {
      setError("The saved preset could not be read, so nothing was changed.");
    }
  };

  /* ------------------------------------------------------------------ UI */

  const pickLogo = async (file: File | undefined) => {
    if (!file) return;
    const invalid = validateFile(file, {
      extensions: [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"],
      mimePrefixes: ["image/"],
      maxBytes: 10 * 1024 * 1024,
    });
    if (invalid) {
      setError(invalid);
      return;
    }
    try {
      setLogo(await normaliseImage(file));
      setError("");
    } catch {
      setError(
        "That image could not be read. Try saving it as a PNG or JPG and picking it again."
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------- preview */}
      <ToolPanel>
        <div className="mx-auto w-full max-w-3xl">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            aria-label="Certificate preview"
            className="h-auto w-full rounded-lg border border-border bg-white shadow-sm"
          />
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          A4 landscape, exported at 300 DPI. {fontReady ? "" : "Loading font…"}
        </p>
      </ToolPanel>

      {/* ------------------------------------------------------ templates */}
      <ToolPanel>
        <h2 className="text-base font-bold tracking-tight text-foreground">Template</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CERT_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => chooseTemplate(t.id)}
              aria-pressed={template === t.id}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                template === t.id
                  ? "border-brand bg-brand/5"
                  : "border-border bg-background-subtle hover:border-brand/40"
              )}
            >
              <span className="block text-sm font-semibold text-foreground">{t.name}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                {t.description}
              </span>
            </button>
          ))}
        </div>
      </ToolPanel>

      {/* --------------------------------------------------------- wording */}
      <ToolPanel className="space-y-4">
        <h2 className="text-base font-bold tracking-tight text-foreground">Wording</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Award title"
            htmlFor="cg-title"
            hint="Certificate of Completion, Achievement, Attendance, Excellence…"
          >
            <Input
              id="cg-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Certificate of Completion"
            />
          </Field>
          <Field label="Recipient name" htmlFor="cg-name">
            <Input
              id="cg-name"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Ada Obi"
            />
          </Field>
        </div>

        <Field
          label="Achievement"
          htmlFor="cg-body"
          hint="Reads on from the name — “…has successfully completed…”."
        >
          <Textarea
            id="cg-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-20"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Issuer / organisation"
            htmlFor="cg-org"
            hint="Its initials appear in the seal."
          >
            <Input
              id="cg-org"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="Northline Academy"
            />
          </Field>
          <Field label="Date" htmlFor="cg-date">
            <Input
              id="cg-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label="Signed by" htmlFor="cg-sig">
            <Input
              id="cg-sig"
              value={signatory}
              onChange={(e) => setSignatory(e.target.value)}
              placeholder="Dr. M. Eze"
            />
          </Field>
          <Field label="Their role" htmlFor="cg-sigrole">
            <Input
              id="cg-sigrole"
              value={signatoryRole}
              onChange={(e) => setSignatoryRole(e.target.value)}
            />
          </Field>
          <Field label="Reference number (optional)" htmlFor="cg-ref">
            <Input
              id="cg-ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="NA-2026-0148"
            />
          </Field>
        </div>
      </ToolPanel>

      {/* ------------------------------------------------------ typography */}
      <ToolPanel className="space-y-4">
        <h2 className="text-base font-bold tracking-tight text-foreground">
          Typography &amp; colour
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Font" htmlFor="cg-font" hint={font.note}>
            <Select id="cg-font" value={fontId} onChange={(e) => setFontId(e.target.value)}>
              {CERT_FONTS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label={`Base font size — ${fontSize}pt`}
            htmlFor="cg-size"
            hint="Everything else scales from this."
          >
            <input
              id="cg-size"
              type="range"
              min={11}
              max={22}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="h-11 w-full accent-[var(--color-brand-solid,#05a85a)]"
            />
          </Field>

          <Field label="Text colour" htmlFor="cg-ink">
            <div className="flex items-center gap-2">
              <input
                id="cg-ink"
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-lg border border-input bg-card p-1"
                aria-label="Text colour"
              />
              <Input
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                aria-label="Text colour hex"
                spellCheck={false}
              />
            </div>
          </Field>

          <Field label="Accent colour" htmlFor="cg-accent">
            <div className="flex items-center gap-2">
              <input
                id="cg-accent"
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-lg border border-input bg-card p-1"
                aria-label="Accent colour"
              />
              <Input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                aria-label="Accent colour hex"
                spellCheck={false}
              />
            </div>
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Presets:</span>
          {ACCENT_SWATCHES.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => setAccentColor(hex)}
              aria-label={`Use accent ${hex}`}
              aria-pressed={accentColor.toLowerCase() === hex}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                accentColor.toLowerCase() === hex ? "border-foreground" : "border-border"
              )}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>

        <Toggle
          id="cg-frame"
          checked={showFrame}
          onChange={setShowFrame}
          label="Show frame"
          hint="Adds the decorative border for this template."
        />
      </ToolPanel>

      {/* --------------------------------------------------- branding/media */}
      <ToolPanel className="space-y-4">
        <h2 className="text-base font-bold tracking-tight text-foreground">
          Branding &amp; media
        </h2>

        <Field
          label="Logo"
          hint="PNG, JPG, WebP, GIF or SVG. Converted in your browser — never uploaded."
        >
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="sr-only"
            aria-label="Choose a logo image"
            onChange={(e) => {
              void pickLogo(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          {logo ? (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background-subtle p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo.dataUrl}
                alt="Logo preview"
                className="h-12 w-auto max-w-32 object-contain"
              />
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {logo.name}
              </p>
              <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                Replace
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove logo"
                onClick={() => setLogo(null)}
              >
                <X />
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => logoInputRef.current?.click()}>
              <ImagePlus />
              Choose a logo
            </Button>
          )}
        </Field>

        {logo && !getCertTemplate(template).logoInBand && (
          /* No htmlFor: this is a group of buttons, not a single control, so a
             label pointing at one of them would be wrong. */
          <Field label="Logo placement">
            <div
              role="group"
              aria-label="Logo placement"
              id="cg-logo-pos"
              className="flex rounded-lg border border-border bg-muted p-0.5"
            >
              {(["left", "center", "right"] as LogoPlacement[]).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setLogoPlacement(pos)}
                  aria-pressed={logoPlacement === pos}
                  className={cn(
                    "flex-1 rounded-md px-3 py-2 text-sm font-semibold capitalize transition-colors",
                    logoPlacement === pos
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {pos === "center" ? "Centre" : pos}
                </button>
              ))}
            </div>
          </Field>
        )}

        <Field label="Signature">
          <SignaturePad value={signature} onChange={setSignature} onError={setError} />
        </Field>

        <div className="space-y-3 rounded-lg border border-border bg-background-subtle p-3">
          <Toggle
            id="cg-qr"
            checked={showQr}
            onChange={setShowQr}
            label="Show QR code"
            hint="Printed in the bottom-right, labelled “Verify”."
          />
          {showQr && (
            <Field
              label="QR code contents"
              htmlFor="cg-qrval"
              hint="A verification URL works best. Defaults to the reference number."
            >
              <Input
                id="cg-qrval"
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
                placeholder="https://example.com/verify/NA-2026-0148"
              />
            </Field>
          )}
        </div>
      </ToolPanel>

      {/* ------------------------------------------------------------ batch */}
      <ToolPanel className="space-y-3">
        <h2 className="text-base font-bold tracking-tight text-foreground">
          Batch generation
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Import a CSV with one row per person and get every certificate back in
          a single ZIP. A column headed <strong>Name</strong> is all that is
          required; <strong>Achievement</strong>, <strong>Reference</strong>,{" "}
          <strong>Date</strong> and <strong>Organisation</strong> override the
          settings above per row if present.
        </p>

        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,text/csv,text/plain"
          className="sr-only"
          aria-label="Choose a CSV file"
          onChange={(e) => {
            void readCsv(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => csvInputRef.current?.click()}>
            <FileSpreadsheet />
            {batch.length ? "Choose a different CSV" : "Import CSV"}
          </Button>
          <Button
            onClick={generateBatch}
            disabled={batch.length === 0 || busy !== null}
          >
            {busy === "batch" ? <Loader2 className="animate-spin" /> : <Package />}
            {busy === "batch" && progress
              ? `Building ${progress.done} of ${progress.total}…`
              : `Generate & download ZIP${batch.length ? ` (${batch.length})` : ""}`}
          </Button>
        </div>

        {batch.length > 0 && (
          <div className="rounded-lg border border-border bg-background-subtle p-3">
            <p className="truncate text-sm font-medium text-foreground">{batchName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{batchNote}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              First few: {batch.slice(0, 4).map((r) => r.recipient).join(", ")}
              {batch.length > 4 ? "…" : ""}
            </p>
          </div>
        )}

        {progress && (
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand-solid transition-all"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        )}
      </ToolPanel>

      {/* ---------------------------------------------------------- presets */}
      <ToolPanel className="space-y-3">
        <h2 className="text-base font-bold tracking-tight text-foreground">Presets</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Saves the template, wording, typography, logo and signature in this
          browser so the next batch starts where you left off. It stays on this
          device and is not sent anywhere.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={savePreset}>
            <Save />
            Save current preset
          </Button>
          <Button variant="outline" onClick={() => void loadPreset()}>
            <RotateCcw />
            Load last preset
          </Button>
        </div>
        {saved && <p className="text-sm font-medium text-brand">{saved}</p>}
      </ToolPanel>

      {error && <ErrorNote>{error}</ErrorNote>}

      {/* ----------------------------------------------------------- export */}
      <ToolPanel className="space-y-3">
        <h2 className="text-base font-bold tracking-tight text-foreground">
          Export &amp; print
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button size="lg" onClick={exportPdf} disabled={busy !== null}>
            {busy === "pdf" ? <Loader2 className="animate-spin" /> : <Download />}
            Download PDF
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => void previewPdf()}
            disabled={busy !== null}
          >
            {busy === "preview" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ExternalLink />
            )}
            Preview in new tab
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => void exportRaster("image/png")}
            disabled={busy !== null}
          >
            {busy === "png" ? <Loader2 className="animate-spin" /> : <Download />}
            Download PNG
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => void exportRaster("image/jpeg")}
            disabled={busy !== null}
          >
            {busy === "jpeg" ? <Loader2 className="animate-spin" /> : <Download />}
            Download JPEG
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          PDF is the one to send a printer — it carries the exact A4 page size.
          PNG keeps a transparent-free white page for screens, and JPEG is the
          smallest file if you are emailing a lot of them.
        </p>
      </ToolPanel>
    </div>
  );
}

function Toggle({
  id,
  checked,
  onChange,
  label,
  hint,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-brand-solid" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </button>
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </label>
    </div>
  );
}
