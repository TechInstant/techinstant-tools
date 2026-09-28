"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ToolPanel, Field, ErrorNote } from "@/components/tools/tool-ui";
import { downloadBlob } from "@/components/tools/file-drop";

/* A standard card is 3.5 × 2 inches. Drawing at 300 DPI (1050 × 600) with a
   3mm bleed-free edge gives a file a print shop will accept, and the preview
   is the same canvas scaled down by CSS — so what you see is what prints. */
const W = 1050;
const H = 600;
const PAD = 72;

interface Theme {
  id: string;
  name: string;
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  /** Draws the decorative element behind the text. */
  decor: (c: CanvasRenderingContext2D, t: Theme) => void;
}

const THEMES: Theme[] = [
  {
    id: "slate",
    name: "Slate (dark)",
    bg: "#0f172a",
    fg: "#ffffff",
    muted: "#94a3b8",
    accent: "#05a85a",
    decor: (c, t) => {
      c.fillStyle = t.accent;
      c.fillRect(0, 0, 14, H);
    },
  },
  {
    id: "clean",
    name: "Clean (white)",
    bg: "#ffffff",
    fg: "#0f172a",
    muted: "#64748b",
    accent: "#05a85a",
    decor: (c, t) => {
      c.fillStyle = t.accent;
      c.fillRect(PAD, H - PAD + 18, 120, 8);
    },
  },
  {
    id: "corner",
    name: "Corner accent",
    bg: "#ffffff",
    fg: "#0f172a",
    muted: "#64748b",
    accent: "#05a85a",
    decor: (c, t) => {
      c.fillStyle = t.accent;
      c.beginPath();
      c.moveTo(W, 0);
      c.lineTo(W, 260);
      c.lineTo(W - 260, 0);
      c.closePath();
      c.fill();
    },
  },
  {
    id: "band",
    name: "Bottom band",
    bg: "#ffffff",
    fg: "#0f172a",
    muted: "#475569",
    accent: "#0f172a",
    decor: (c, t) => {
      c.fillStyle = t.accent;
      c.fillRect(0, H - 90, W, 90);
    },
  },
];

export default function BusinessCardMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState("Ada Obi");
  const [role, setRole] = useState("Product Designer");
  const [company, setCompany] = useState("Northline Studio");
  const [phone, setPhone] = useState("+234 801 234 5678");
  const [email, setEmail] = useState("ada@northline.studio");
  const [website, setWebsite] = useState("northline.studio");
  const [address, setAddress] = useState("");
  const [themeId, setThemeId] = useState("slate");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    if (!c) return;

    const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
    const onBand = theme.id === "band";

    c.clearRect(0, 0, W, H);
    c.fillStyle = theme.bg;
    c.fillRect(0, 0, W, H);
    theme.decor(c, theme);

    const left = theme.id === "slate" ? PAD + 14 : PAD;

    c.textBaseline = "top";

    /* Company sits above the name as a small eyebrow. `ctx.letterSpacing` is
       still patchy across browsers, so the tracking is drawn per character. */
    if (company.trim()) {
      c.fillStyle = theme.accent === theme.bg ? theme.muted : theme.accent;
      c.font = "600 26px system-ui, -apple-system, Segoe UI, sans-serif";
      let x = left;
      for (const ch of company.toUpperCase().slice(0, 34)) {
        c.fillText(ch, x, PAD);
        x += c.measureText(ch).width + 3;
      }
    }

    c.fillStyle = theme.fg;
    c.font = "800 62px system-ui, -apple-system, Segoe UI, sans-serif";
    c.fillText(name.slice(0, 26) || " ", left, PAD + 52);

    if (role.trim()) {
      c.fillStyle = theme.muted;
      c.font = "500 30px system-ui, -apple-system, Segoe UI, sans-serif";
      c.fillText(role.slice(0, 40), left, PAD + 128);
    }

    /* Contact block, bottom-aligned. On the band theme it prints inside the
       dark band, so the colours flip there. */
    const lines = [phone, email, website, address]
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4);

    c.font = "400 28px system-ui, -apple-system, Segoe UI, sans-serif";
    const lineHeight = 40;
    let y = onBand
      ? H - 90 + (90 - lines.length * lineHeight) / 2 + 4
      : H - PAD - lines.length * lineHeight + 6;

    for (const line of lines) {
      c.fillStyle = onBand ? "#ffffff" : theme.fg;
      c.fillText(line.slice(0, 44), left, y);
      y += lineHeight;
    }
  }, [name, role, company, phone, email, website, address, themeId]);

  useEffect(() => {
    draw();
  }, [draw]);

  const savePng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Your browser would not produce the image. Try again.");
        return;
      }
      downloadBlob(blob, "business-card.png", "image/png");
    }, "image/png");
  };

  const savePdf = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    setError("");
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (ch) =>
        ch.charCodeAt(0)
      );

      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      /* Page is the card itself, in points: 3.5in × 2in = 252 × 144. */
      const page = doc.addPage([252, 144]);
      const png = await doc.embedPng(bytes);
      page.drawImage(png, { x: 0, y: 0, width: 252, height: 144 });
      const out = await doc.save();
      downloadBlob(
        out as unknown as BlobPart,
        "business-card.pdf",
        "application/pdf"
      );
    } catch {
      setError("Something went wrong while building the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <ToolPanel>
        <div className="mx-auto w-full max-w-lg">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            aria-label="Business card preview"
            className="h-auto w-full rounded-lg border border-border shadow-sm"
          />
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Preview at actual proportions — 3.5 × 2 in, exported at 300 DPI.
        </p>
      </ToolPanel>

      <ToolPanel className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="bc-name">
            <Input id="bc-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Job title" htmlFor="bc-role">
            <Input id="bc-role" value={role} onChange={(e) => setRole(e.target.value)} />
          </Field>
          <Field label="Company" htmlFor="bc-company">
            <Input
              id="bc-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </Field>
          <Field label="Style" htmlFor="bc-theme">
            <Select
              id="bc-theme"
              value={themeId}
              onChange={(e) => setThemeId(e.target.value)}
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Phone" htmlFor="bc-phone">
            <Input
              id="bc-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Field label="Email" htmlFor="bc-email">
            <Input
              id="bc-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Website" htmlFor="bc-web">
            <Input
              id="bc-web"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </Field>
          <Field
            label="Address (optional)"
            htmlFor="bc-addr"
            hint="Four contact lines fit comfortably."
          >
            <Input
              id="bc-addr"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Field>
        </div>
      </ToolPanel>

      {error && <ErrorNote>{error}</ErrorNote>}

      <div className="flex flex-wrap gap-2">
        <Button onClick={savePng}>
          <Download />
          Download PNG
        </Button>
        <Button variant="outline" onClick={savePdf} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Download />}
          {busy ? "Building…" : "Download print PDF"}
        </Button>
      </div>
    </div>
  );
}
