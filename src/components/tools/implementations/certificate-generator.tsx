"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { ToolPanel, Field, ErrorNote } from "@/components/tools/tool-ui";
import { downloadBlob } from "@/components/tools/file-drop";
import { todayValue, fromInputValue, formatLong } from "@/lib/date";

/* A4 landscape in points. */
const W = 841.89;
const H = 595.28;

const PALETTES = [
  { id: "navy", name: "Navy & gold", accent: [0.09, 0.16, 0.31], seal: [0.72, 0.55, 0.18] },
  { id: "green", name: "Green", accent: [0.02, 0.5, 0.29], seal: [0.02, 0.66, 0.35] },
  { id: "burgundy", name: "Burgundy", accent: [0.42, 0.09, 0.16], seal: [0.65, 0.44, 0.15] },
  { id: "mono", name: "Black & grey", accent: [0.1, 0.1, 0.12], seal: [0.4, 0.4, 0.44] },
] as const;

export default function CertificateGenerator() {
  const [title, setTitle] = useState("Certificate of Completion");
  const [recipient, setRecipient] = useState("");
  const [body, setBody] = useState(
    "has successfully completed the Introduction to Data Analysis course"
  );
  const [org, setOrg] = useState("");
  const [date, setDate] = useState(() => todayValue());
  const [signatory, setSignatory] = useState("");
  const [signatoryRole, setSignatoryRole] = useState("Course Director");
  const [reference, setReference] = useState("");
  const [palette, setPalette] = useState<string>("navy");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!recipient.trim()) {
      setError("Enter the name of the person receiving the certificate.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      const page = doc.addPage([W, H]);

      const serif = await doc.embedFont(StandardFonts.TimesRoman);
      const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
      const serifItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);

      const p = PALETTES.find((x) => x.id === palette) ?? PALETTES[0];
      const accent = rgb(p.accent[0], p.accent[1], p.accent[2]);
      const seal = rgb(p.seal[0], p.seal[1], p.seal[2]);
      const ink = rgb(0.08, 0.09, 0.13);
      const soft = rgb(0.42, 0.45, 0.52);

      /* Standard fonts are WinAnsi only — strip anything they cannot draw
         rather than throwing on a stray emoji or non-Latin character. */
      const safe = (s: string) => s.replace(/[^\x20-\x7E -ÿ]/g, "").trim();

      // Double border.
      page.drawRectangle({
        x: 24,
        y: 24,
        width: W - 48,
        height: H - 48,
        borderColor: accent,
        borderWidth: 3,
      });
      page.drawRectangle({
        x: 34,
        y: 34,
        width: W - 68,
        height: H - 68,
        borderColor: seal,
        borderWidth: 1,
      });

      const centre = (
        s: string,
        y: number,
        size: number,
        font = serif,
        color = ink
      ) => {
        const width = font.widthOfTextAtSize(s, size);
        page.drawText(s, { x: (W - width) / 2, y, size, font, color });
      };

      let y = H - 110;
      centre(safe(title).toUpperCase() || "CERTIFICATE", y, 26, serifBold, accent);
      y -= 20;

      const rule = (width: number, yy: number, color = seal) =>
        page.drawLine({
          start: { x: (W - width) / 2, y: yy },
          end: { x: (W + width) / 2, y: yy },
          thickness: 1,
          color,
        });
      rule(150, y);
      y -= 46;

      centre("This is to certify that", y, 13, serifItalic, soft);
      y -= 52;

      /* The name is the point of the page. Shrink it to fit rather than
         letting a long name run off the edge. */
      const nameText = safe(recipient) || "Recipient";
      let nameSize = 40;
      while (
        serifBold.widthOfTextAtSize(nameText, nameSize) > W - 200 &&
        nameSize > 18
      ) {
        nameSize -= 1;
      }
      centre(nameText, y, nameSize, serifBold, accent);
      y -= 16;
      rule(Math.min(W - 180, serifBold.widthOfTextAtSize(nameText, nameSize) + 80), y, soft);
      y -= 40;

      // Body, wrapped to the page width.
      const bodyText = safe(body);
      if (bodyText) {
        const maxWidth = W - 220;
        const words = bodyText.split(/\s+/);
        const lines: string[] = [];
        let line = "";
        for (const word of words) {
          const attempt = line ? `${line} ${word}` : word;
          if (serif.widthOfTextAtSize(attempt, 14) > maxWidth && line) {
            lines.push(line);
            line = word;
          } else {
            line = attempt;
          }
        }
        if (line) lines.push(line);
        for (const l of lines.slice(0, 4)) {
          centre(l, y, 14, serif, ink);
          y -= 22;
        }
      }

      // Footer: date, seal, signature.
      const footY = 96;
      const parsed = fromInputValue(date);
      const dateLabel = parsed ? formatLong(parsed) : date;

      page.drawLine({
        start: { x: 90, y: footY },
        end: { x: 290, y: footY },
        thickness: 0.8,
        color: soft,
      });
      page.drawText(safe(dateLabel), { x: 90, y: footY - 16, size: 10, font: serif, color: soft });
      page.drawText("Date", { x: 90, y: footY - 30, size: 8, font: serifBold, color: soft });

      page.drawLine({
        start: { x: W - 290, y: footY },
        end: { x: W - 90, y: footY },
        thickness: 0.8,
        color: soft,
      });
      if (signatory.trim()) {
        page.drawText(safe(signatory), {
          x: W - 290,
          y: footY - 16,
          size: 10,
          font: serif,
          color: ink,
        });
      }
      page.drawText(safe(signatoryRole) || "Signature", {
        x: W - 290,
        y: footY - 30,
        size: 8,
        font: serifBold,
        color: soft,
      });

      // Seal: two rings with the organisation initials.
      const cx = W / 2;
      const cy = footY + 6;
      page.drawCircle({ x: cx, y: cy, size: 34, borderColor: seal, borderWidth: 2 });
      page.drawCircle({ x: cx, y: cy, size: 28, borderColor: seal, borderWidth: 0.6 });
      const initials =
        safe(org)
          .split(/\s+/)
          .filter(Boolean)
          .map((w) => w[0]?.toUpperCase() ?? "")
          .join("")
          .slice(0, 3) || "•";
      const iw = serifBold.widthOfTextAtSize(initials, 16);
      page.drawText(initials, {
        x: cx - iw / 2,
        y: cy - 6,
        size: 16,
        font: serifBold,
        color: seal,
      });

      if (org.trim()) {
        const w = serifBold.widthOfTextAtSize(safe(org), 11);
        page.drawText(safe(org), {
          x: cx - w / 2,
          y: cy - 56,
          size: 11,
          font: serifBold,
          color: accent,
        });
      }

      if (reference.trim()) {
        page.drawText(`Ref: ${safe(reference)}`, {
          x: 48,
          y: 44,
          size: 7,
          font: serif,
          color: soft,
        });
      }

      const bytes = await doc.save();
      const file = `certificate-${safe(recipient).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "recipient"}.pdf`;
      downloadBlob(bytes as unknown as BlobPart, file, "application/pdf");
    } catch {
      setError("Something went wrong while building the certificate. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Certificate title" htmlFor="cg-title">
            <Input id="cg-title" value={title} onChange={(e) => setTitle(e.target.value)} />
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
          <Field label="Issuing organisation" htmlFor="cg-org" hint="Its initials appear in the seal.">
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
          <Field label="Colour" htmlFor="cg-pal">
            <Select
              id="cg-pal"
              value={palette}
              onChange={(e) => setPalette(e.target.value)}
            >
              {PALETTES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </ToolPanel>

      {error && <ErrorNote>{error}</ErrorNote>}

      <Button size="lg" onClick={generate} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <Download />}
        {busy ? "Building…" : "Download certificate PDF"}
      </Button>
    </div>
  );
}
