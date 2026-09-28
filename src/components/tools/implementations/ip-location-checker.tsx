"use client";

import { useState } from "react";
import { Search, Loader2, ExternalLink, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToolPanel, Field, ErrorNote, CopyButton } from "@/components/tools/tool-ui";

interface Lookup {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  asn?: string;
  type?: string;
}

const IP_PATTERN =
  /^(\d{1,3}\.){3}\d{1,3}$|^[0-9a-fA-F:]{2,39}$/;

/**
 * Reads whichever of the two providers answered. They return different shapes,
 * so both are flattened into `Lookup` before anything renders.
 */
function normalise(raw: Record<string, unknown>): Lookup | null {
  const num = (v: unknown) => (typeof v === "number" ? v : undefined);
  const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

  const ip = str(raw.ip);
  if (!ip) return null;

  // ipwho.is nests the ISP and timezone; ipapi.co keeps them flat.
  const connection = (raw.connection ?? {}) as Record<string, unknown>;
  const tz = raw.timezone;

  return {
    ip,
    city: str(raw.city),
    region: str(raw.region) ?? str(raw.region_name),
    country: str(raw.country) ?? str(raw.country_name),
    countryCode: str(raw.country_code),
    postal: str(raw.postal),
    latitude: num(raw.latitude),
    longitude: num(raw.longitude),
    timezone:
      typeof tz === "string"
        ? tz
        : str((tz as Record<string, unknown> | undefined)?.id),
    isp: str(connection.isp) ?? str(connection.org) ?? str(raw.org),
    asn: str(connection.asn) ?? str(raw.asn),
    type: str(raw.type) ?? str(raw.version),
  };
}

export default function IpLocationChecker() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Lookup | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ownIp, setOwnIp] = useState(false);

  const lookup = async (target: string) => {
    const trimmed = target.trim();
    if (trimmed && !IP_PATTERN.test(trimmed)) {
      setError("Enter an IP address, like 8.8.8.8, or leave it blank to check your own.");
      return;
    }

    setBusy(true);
    setError("");
    setResult(null);
    setOwnIp(!trimmed);

    /* Two providers, tried in order. Both are free and need no key; the second
       only runs if the first is down or rate-limited. */
    const endpoints = [
      `https://ipwho.is/${encodeURIComponent(trimmed)}`,
      trimmed
        ? `https://ipapi.co/${encodeURIComponent(trimmed)}/json/`
        : "https://ipapi.co/json/",
    ];

    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) continue;

        const raw = (await res.json()) as Record<string, unknown>;
        // ipwho.is reports failure in the body with success:false.
        if (raw.success === false || raw.error) continue;

        const parsed = normalise(raw);
        if (!parsed) continue;

        setResult(parsed);
        setBusy(false);
        return;
      } catch {
        /* Try the next provider. */
      }
    }

    setBusy(false);
    setError(
      "The lookup service did not answer. It may be rate-limited, or a browser extension or network filter may be blocking it. Try again in a moment."
    );
  };

  const rows: [string, string | undefined][] = result
    ? [
        ["IP address", result.ip],
        ["Type", result.type],
        ["City", result.city],
        ["Region", result.region],
        ["Country", [result.country, result.countryCode && `(${result.countryCode})`].filter(Boolean).join(" ") || undefined],
        ["Postal code", result.postal],
        [
          "Coordinates",
          result.latitude != null && result.longitude != null
            ? `${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}`
            : undefined,
        ],
        ["Time zone", result.timezone],
        ["ISP / network", result.isp],
        ["ASN", result.asn],
      ]
    : [];

  const asText = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <Wifi className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="text-sm leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">
            This tool contacts an external service
          </p>
          <p className="mt-1">
            Unlike our other tools, this one cannot work offline — location data
            lives in someone else&apos;s database. When you press Look up, the
            request goes from your browser to a third-party geolocation provider
            (ipwho.is, or ipapi.co if that is unavailable), which means your IP
            address is sent to them and subject to their privacy policy. We do
            not store the result or see it.
          </p>
        </div>
      </div>

      <ToolPanel className="space-y-4">
        <Field
          label="IP address"
          htmlFor="ip-q"
          hint="Leave blank to look up the address you are browsing from."
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="ip-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") lookup(query);
              }}
              placeholder="8.8.8.8"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
            />
            <Button onClick={() => lookup(query)} disabled={busy} className="sm:w-40">
              {busy ? <Loader2 className="animate-spin" /> : <Search />}
              {busy ? "Looking up…" : "Look up"}
            </Button>
          </div>
        </Field>
      </ToolPanel>

      {error && <ErrorNote>{error}</ErrorNote>}

      {result && (
        <ToolPanel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              {ownIp ? "Your connection" : `Results for ${result.ip}`}
            </h2>
            <CopyButton value={asText} label="Copy details" />
          </div>

          <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {rows
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-0.5 bg-background-subtle px-4 py-2.5 sm:flex-row sm:items-center sm:gap-4"
                >
                  <dt className="w-44 shrink-0 text-xs font-medium text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="min-w-0 break-words text-sm text-foreground">
                    {value}
                  </dd>
                </div>
              ))}
          </dl>

          {result.latitude != null && result.longitude != null && (
            <a
              href={`https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}#map=10/${result.latitude}/${result.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
            >
              View the area on OpenStreetMap
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          <p className="text-xs leading-relaxed text-muted-foreground">
            IP geolocation is approximate. It usually identifies the city or
            region of the network you connect through — not a street address,
            and not a device. Mobile networks, company VPNs and satellite
            connections are often placed hundreds of kilometres away, sometimes
            in a different country entirely.
          </p>
        </ToolPanel>
      )}
    </div>
  );
}
