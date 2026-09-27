"use client";

import { useEffect, useState } from "react";
import { MapPin, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel, ErrorNote } from "@/components/tools/tool-ui";
import { FileDrop } from "@/components/tools/file-drop";
import { IMAGE_ACCEPT, loadImage } from "@/lib/image";
import { formatBytes } from "@/lib/utils";

interface Row {
  label: string;
  value: string;
}

interface Report {
  file: Row[];
  camera: Row[];
  capture: Row[];
  gps: { lat: number; lon: number } | null;
  other: Row[];
  hasExif: boolean;
}

const fmt = (v: unknown): string => {
  if (v == null) return "";
  if (v instanceof Date) return v.toLocaleString();
  if (Array.isArray(v)) return v.slice(0, 6).join(", ");
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(4);
  if (typeof v === "object") return "";
  return String(v).trim();
};

const push = (rows: Row[], label: string, value: unknown) => {
  const s = fmt(value);
  if (s) rows.push({ label, value: s });
};

export default function ImageMetadata() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const onPick = async (picked: File[]) => {
    const chosen = picked[0];
    setError("");
    setReport(null);
    setBusy(true);
    setFile(chosen);
    if (url) URL.revokeObjectURL(url);
    setUrl(URL.createObjectURL(chosen));

    try {
      const { bitmap, width, height } = await loadImage(chosen);
      bitmap.close();

      const fileRows: Row[] = [];
      push(fileRows, "File name", chosen.name);
      push(fileRows, "File size", formatBytes(chosen.size));
      push(fileRows, "Type", chosen.type || "unknown");
      push(fileRows, "Dimensions", `${width} × ${height}`);
      push(fileRows, "Megapixels", ((width * height) / 1_000_000).toFixed(1));
      push(fileRows, "Last modified", new Date(chosen.lastModified).toLocaleString());

      /* exifr loads on demand — nothing is fetched for images without EXIF. */
      const exifr = await import("exifr");
      let tags: Record<string, unknown> | null = null;
      try {
        tags = (await exifr.parse(chosen, { gps: true })) as Record<string, unknown> | null;
      } catch {
        tags = null;
      }

      const camera: Row[] = [];
      const capture: Row[] = [];
      const other: Row[] = [];
      let gps: Report["gps"] = null;

      if (tags) {
        push(camera, "Camera make", tags.Make);
        push(camera, "Camera model", tags.Model);
        push(camera, "Lens", tags.LensModel);
        push(camera, "Software", tags.Software);

        push(capture, "Taken", tags.DateTimeOriginal ?? tags.CreateDate);
        push(capture, "Exposure", tags.ExposureTime ? `${tags.ExposureTime}s` : "");
        push(capture, "Aperture", tags.FNumber ? `f/${tags.FNumber}` : "");
        push(capture, "ISO", tags.ISO);
        push(capture, "Focal length", tags.FocalLength ? `${tags.FocalLength}mm` : "");
        push(capture, "Flash", tags.Flash);
        push(capture, "Orientation", tags.Orientation);

        push(other, "Colour space", tags.ColorSpace);
        push(other, "Artist", tags.Artist);
        push(other, "Copyright", tags.Copyright);
        push(other, "Description", tags.ImageDescription);

        if (typeof tags.latitude === "number" && typeof tags.longitude === "number") {
          gps = { lat: tags.latitude, lon: tags.longitude };
        }
      }

      setReport({
        file: fileRows,
        camera,
        capture,
        other,
        gps,
        hasExif: camera.length + capture.length + other.length > 0 || gps != null,
      });
    } catch {
      setError("That image couldn’t be read. It may be damaged or an unsupported format.");
      setFile(null);
    } finally {
      setBusy(false);
    }
  };

  const Section = ({ title, rows }: { title: string; rows: Row[] }) =>
    rows.length === 0 ? null : (
      <div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <dl className="mt-2 divide-y divide-border rounded-lg border border-border">
          {rows.map((r) => (
            <div key={r.label} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <dt className="text-sm text-muted-foreground">{r.label}</dt>
              <dd className="text-sm font-medium text-foreground">{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );

  return (
    <div className="space-y-4">
      {!file ? (
        <FileDrop
          {...IMAGE_ACCEPT}
          hint="The image is read on your device — nothing is uploaded."
          onFiles={onPick}
          onError={setError}
        />
      ) : (
        <ToolPanel className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={url}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFile(null);
              setReport(null);
              setError("");
            }}
          >
            Choose another
          </Button>
        </ToolPanel>
      )}

      {busy && <p className="text-sm text-muted-foreground">Reading metadata…</p>}
      {error && <ErrorNote>{error}</ErrorNote>}

      {report && (
        <ToolPanel className="space-y-5">
          <Section title="File" rows={report.file} />
          <Section title="Camera" rows={report.camera} />
          <Section title="Capture settings" rows={report.capture} />
          <Section title="Other" rows={report.other} />

          {report.gps && (
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                <MapPin className="h-4 w-4 text-brand" />
                Location
              </h3>
              <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="text-sm text-foreground">
                  {report.gps.lat.toFixed(6)}, {report.gps.lon.toFixed(6)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This photo carries the exact place it was taken. Anyone you send
                  the original file to can read it.
                </p>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${report.gps.lat}&mlon=${report.gps.lon}#map=15/${report.gps.lat}/${report.gps.lon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-brand hover:underline"
                >
                  View on a map
                </a>
              </div>
            </div>
          )}

          {!report.hasExif && (
            <p className="flex items-start gap-2 rounded-lg border border-border bg-background-subtle p-3 text-sm text-muted-foreground">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              No EXIF metadata found. Screenshots, and images saved by most social
              networks and messaging apps, have it stripped already — so this is
              normal and usually a good thing for privacy.
            </p>
          )}
        </ToolPanel>
      )}
    </div>
  );
}
