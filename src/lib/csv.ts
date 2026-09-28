/**
 * A small RFC 4180 CSV reader, used by the certificate batch import.
 *
 * Handles quoted fields, embedded commas, embedded newlines and escaped
 * double quotes — all of which appear the moment someone exports a real
 * spreadsheet, which is exactly where these files come from.
 */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  // Strip a UTF-8 BOM, which Excel writes by default.
  const text = input.replace(/^﻿/, "");

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      // Treat CRLF as one break.
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop trailing blank lines.
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/**
 * Reads a CSV into objects keyed by a normalised header name, then maps those
 * headers onto known fields through an alias table. People will label the
 * column "Name", "Full Name", "recipient" or "Student"; all should work.
 */
export function parseCsvWithAliases<T extends string>(
  input: string,
  aliases: Record<T, string[]>
): { rows: Partial<Record<T, string>>[]; unmatchedHeaders: string[] } {
  const table = parseCsv(input);
  if (table.length === 0) return { rows: [], unmatchedHeaders: [] };

  const norm = (s: string) => s.trim().toLowerCase().replace(/[\s_-]+/g, "");

  const headers = table[0].map(norm);
  const fieldFor = new Map<number, T>();
  const unmatchedHeaders: string[] = [];

  headers.forEach((header, index) => {
    const match = (Object.keys(aliases) as T[]).find((field) =>
      aliases[field].some((alias) => norm(alias) === header)
    );
    if (match) fieldFor.set(index, match);
    else if (header) unmatchedHeaders.push(table[0][index].trim());
  });

  const rows = table.slice(1).map((cells) => {
    const out: Partial<Record<T, string>> = {};
    cells.forEach((cell, index) => {
      const field = fieldFor.get(index);
      if (field && cell.trim()) out[field] = cell.trim();
    });
    return out;
  });

  return { rows, unmatchedHeaders };
}
