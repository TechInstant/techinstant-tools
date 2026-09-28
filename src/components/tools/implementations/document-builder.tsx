"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ToolPanel, Field, ErrorNote } from "@/components/tools/tool-ui";
import { downloadBlob } from "@/components/tools/file-drop";
import { todayValue, fromInputValue } from "@/lib/date";

export type DocKind = "invoice" | "receipt";

/**
 * pdf-lib's standard fonts are WinAnsi only, so a symbol outside that set would
 * either throw or vanish from the PDF while still showing on screen. These are
 * the common currencies WinAnsi cannot draw; each falls back to its ISO code so
 * the document still says what the money is.
 */
const CURRENCY_FALLBACK: Record<string, string> = {
  "₦": "NGN",
  "₵": "GHS",
  "₹": "INR",
  "₩": "KRW",
  "₽": "RUB",
  "₺": "TRY",
  "₪": "ILS",
  "₫": "VND",
  "₱": "PHP",
  "₴": "UAH",
  "₸": "KZT",
  "﷼": "SAR",
};

interface Line {
  id: number;
  description: string;
  qty: string;
  price: string;
}

let nextId = 1;
const blankLine = (): Line => ({ id: nextId++, description: "", qty: "1", price: "" });

const money = (n: number, symbol: string) =>
  `${symbol}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** The symbol as it can actually be printed, falling back to an ISO code. */
const pdfCurrency = (input: string) => {
  const trimmed = input.trim();
  const drawable = trimmed.replace(/[^\x20-\x7E -ÿ]/g, "");
  if (drawable) return drawable;
  const code = CURRENCY_FALLBACK[trimmed];
  return code ? `${code} ` : "";
};

/** "28 Sep 2026" — clearer on a document than a raw ISO string. */
const documentDate = (value: string) => {
  const parsed = fromInputValue(value);
  return parsed
    ? parsed.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : value;
};

/**
 * Shared engine for the invoice and receipt tools. Both are the same document
 * with different framing: an invoice asks for payment, a receipt confirms it.
 * The PDF is drawn with pdf-lib, so nothing is uploaded.
 */
export function DocumentBuilder({ kind }: { kind: DocKind }) {
  const isInvoice = kind === "invoice";

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [number, setNumber] = useState(isInvoice ? "INV-001" : "REC-001");
  const [date, setDate] = useState(() => todayValue());
  const [due, setDue] = useState("");
  const [currency, setCurrency] = useState("₦");
  const [taxRate, setTaxRate] = useState("0");
  const [notes, setNotes] = useState("");
  const [paidWith, setPaidWith] = useState("");
  const [lines, setLines] = useState<Line[]>(() => [blankLine()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    let subtotal = 0;
    for (const l of lines) {
      const q = Number(l.qty);
      const p = Number(l.price);
      if (!Number.isFinite(q) || !Number.isFinite(p)) continue;
      subtotal += q * p;
    }
    const rate = Number(taxRate);
    const tax = Number.isFinite(rate) ? subtotal * (rate / 100) : 0;
    return { subtotal, tax, total: subtotal + tax };
  }, [lines, taxRate]);

  const update = (id: number, patch: Partial<Line>) =>
    setLines((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const generate = async () => {
    if (!from.trim()) {
      setError("Add your name or business name so the document says who it is from.");
      return;
    }
    if (totals.total <= 0) {
      setError("Add at least one line with a quantity and a price.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      const page = doc.addPage([595.28, 841.89]); // A4
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);
      const body = await doc.embedFont(StandardFonts.Helvetica);

      const ink = rgb(0.05, 0.07, 0.13);
      const soft = rgb(0.42, 0.47, 0.55);
      const brand = rgb(0.02, 0.66, 0.35);
      const M = 48;
      let y = 790;

      const text = (
        s: string,
        x: number,
        yy: number,
        size = 10,
        font = body,
        color = ink
      ) => page.drawText(s, { x, y: yy, size, font, color });

      /* Anything the standard fonts cannot draw (emoji, non-Latin scripts) is
         stripped rather than allowed to throw. */
      const safe = (s: string) => s.replace(/[^\x20-\x7E -ÿ]/g, "");
      const sym = pdfCurrency(currency);

      text(isInvoice ? "INVOICE" : "RECEIPT", M, y, 26, bold, brand);
      text(`No. ${safe(number)}`, 400, y + 4, 10, body, soft);
      y -= 34;
      text(`Date: ${documentDate(date)}`, 400, y + 14, 10, body, soft);
      if (isInvoice && due)
        text(`Due: ${documentDate(due)}`, 400, y + 2, 10, body, soft);

      text("FROM", M, y, 8, bold, soft);
      text("TO", 300, y, 8, bold, soft);
      y -= 14;

      const block = (raw: string, x: number, startY: number) => {
        let yy = startY;
        for (const line of safe(raw).split("\n").slice(0, 6)) {
          text(line, x, yy, 10);
          yy -= 13;
        }
        return yy;
      };
      const leftEnd = block(from, M, y);
      const rightEnd = block(to || "—", 300, y);
      y = Math.min(leftEnd, rightEnd) - 18;

      page.drawLine({
        start: { x: M, y },
        end: { x: 547, y },
        thickness: 1,
        color: rgb(0.85, 0.87, 0.9),
      });
      y -= 18;

      text("DESCRIPTION", M, y, 8, bold, soft);
      text("QTY", 360, y, 8, bold, soft);
      text("PRICE", 410, y, 8, bold, soft);
      text("AMOUNT", 490, y, 8, bold, soft);
      y -= 16;

      for (const l of lines) {
        const q = Number(l.qty) || 0;
        const p = Number(l.price) || 0;
        if (!l.description.trim() && q * p === 0) continue;
        text(safe(l.description).slice(0, 52) || "—", M, y, 10);
        text(String(q), 360, y, 10);
        text(money(p, sym), 410, y, 10);
        text(money(q * p, sym), 490, y, 10);
        y -= 16;
        if (y < 150) break;
      }

      y -= 8;
      page.drawLine({
        start: { x: 360, y },
        end: { x: 547, y },
        thickness: 1,
        color: rgb(0.85, 0.87, 0.9),
      });
      y -= 18;

      text("Subtotal", 400, y, 10, body, soft);
      text(money(totals.subtotal, sym), 490, y, 10);
      y -= 15;
      if (totals.tax > 0) {
        text(`Tax (${taxRate}%)`, 400, y, 10, body, soft);
        text(money(totals.tax, sym), 490, y, 10);
        y -= 15;
      }
      text("TOTAL", 400, y, 12, bold);
      text(money(totals.total, sym), 490, y, 12, bold, brand);
      y -= 30;

      if (!isInvoice) {
        text("PAID", M, y, 12, bold, brand);
        if (paidWith.trim()) text(`via ${safe(paidWith)}`, M + 40, y, 10, body, soft);
        y -= 22;
      }

      if (notes.trim()) {
        text("NOTES", M, y, 8, bold, soft);
        y -= 13;
        for (const line of safe(notes).split("\n").slice(0, 5)) {
          text(line.slice(0, 90), M, y, 9, body, soft);
          y -= 12;
        }
      }

      const bytes = await doc.save();
      downloadBlob(
        bytes as unknown as BlobPart,
        `${kind}-${safe(number) || "document"}.pdf`,
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
      <ToolPanel className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="From (you or your business)" htmlFor="db-from">
            <Textarea
              id="db-from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder={"Your Business Ltd\n12 Example Street\nLagos\nhello@example.com"}
              className="min-h-28"
            />
          </Field>
          <Field label={isInvoice ? "Bill to" : "Received from"} htmlFor="db-to">
            <Textarea
              id="db-to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder={"Client Name\nCompany\nAddress"}
              className="min-h-28"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Field label={isInvoice ? "Invoice number" : "Receipt number"} htmlFor="db-no">
            <Input id="db-no" value={number} onChange={(e) => setNumber(e.target.value)} />
          </Field>
          <Field label="Date" htmlFor="db-date">
            <Input id="db-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          {isInvoice ? (
            <Field label="Due date" htmlFor="db-due">
              <Input id="db-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </Field>
          ) : (
            <Field label="Paid with" htmlFor="db-paid" hint="Cash, transfer, card…">
              <Input id="db-paid" value={paidWith} onChange={(e) => setPaidWith(e.target.value)} />
            </Field>
          )}
          <Field
            label="Currency"
            htmlFor="db-cur"
            hint={
              pdfCurrency(currency).trim() !== currency.trim()
                ? `Prints as “${pdfCurrency(currency).trim() || "no symbol"}” in the PDF.`
                : undefined
            }
          >
            <Input
              id="db-cur"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="NGN"
            />
          </Field>
        </div>
      </ToolPanel>

      <ToolPanel className="space-y-4">
        <div className="space-y-2">
          <div className="hidden gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_5rem_7rem_7rem_2.5rem]">
            <span>Description</span>
            <span>Qty</span>
            <span>Unit price</span>
            <span>Amount</span>
            <span />
          </div>

          {lines.map((l) => {
            const amount = (Number(l.qty) || 0) * (Number(l.price) || 0);
            return (
              <div
                key={l.id}
                className="grid gap-2 sm:grid-cols-[1fr_5rem_7rem_7rem_2.5rem] sm:items-center"
              >
                <Input
                  value={l.description}
                  onChange={(e) => update(l.id, { description: e.target.value })}
                  placeholder="Website design"
                  aria-label="Description"
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  value={l.qty}
                  onChange={(e) => update(l.id, { qty: e.target.value })}
                  aria-label="Quantity"
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  value={l.price}
                  onChange={(e) => update(l.id, { price: e.target.value })}
                  placeholder="0.00"
                  aria-label="Unit price"
                />
                <div className="flex h-11 items-center px-1 font-medium tabular-nums text-foreground">
                  {money(amount, currency)}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove line"
                  disabled={lines.length === 1}
                  onClick={() => setLines((x) => x.filter((i) => i.id !== l.id))}
                >
                  <Trash2 />
                </Button>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <Button variant="outline" onClick={() => setLines((l) => [...l, blankLine()])}>
            <Plus />
            Add line
          </Button>

          <div className="w-full sm:w-64">
            <Field label="Tax %" htmlFor="db-tax">
              <Input
                id="db-tax"
                type="number"
                inputMode="decimal"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-lg bg-background-subtle p-4">
          <Row label="Subtotal" value={money(totals.subtotal, currency)} />
          {totals.tax > 0 && (
            <Row label={`Tax (${taxRate}%)`} value={money(totals.tax, currency)} />
          )}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="font-bold text-foreground">Total</span>
            <span className="text-xl font-extrabold tabular-nums text-brand">
              {money(totals.total, currency)}
            </span>
          </div>
        </div>

        <Field label="Notes (optional)" htmlFor="db-notes">
          <Textarea
            id="db-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isInvoice ? "Payment terms, bank details, thank you." : "Thank you for your custom."}
            className="min-h-20"
          />
        </Field>
      </ToolPanel>

      {error && <ErrorNote>{error}</ErrorNote>}

      <Button size="lg" onClick={generate} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <Download />}
        {busy ? "Building…" : `Download ${isInvoice ? "invoice" : "receipt"} PDF`}
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  );
}
