"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ToolPanel, Field, ErrorNote } from "@/components/tools/tool-ui";
import { cn } from "@/lib/utils";

type Kind = "url" | "text" | "email" | "phone" | "wifi";

const KINDS: { id: Kind; label: string }[] = [
  { id: "url", label: "Link" },
  { id: "text", label: "Text" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "wifi", label: "Wi-Fi" },
];

/** Wi-Fi and mailto payloads need these characters escaped to parse correctly. */
const escapeWifi = (s: string) => s.replace(/([\\;,":])/g, "\\$1");

export default function QrGenerator() {
  const [kind, setKind] = useState<Kind>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [phone, setPhone] = useState("");
  const [ssid, setSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [size, setSize] = useState(512);

  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const payload = (() => {
    switch (kind) {
      case "url":
        return url.trim();
      case "text":
        return text;
      case "email":
        return email.trim()
          ? `mailto:${email.trim()}${
              subject.trim() ? `?subject=${encodeURIComponent(subject.trim())}` : ""
            }`
          : "";
      case "phone":
        return phone.trim() ? `tel:${phone.replace(/\s+/g, "")}` : "";
      case "wifi":
        return ssid.trim()
          ? `WIFI:T:${encryption};S:${escapeWifi(ssid.trim())};${
              encryption === "nopass" ? "" : `P:${escapeWifi(wifiPass)};`
            };`
          : "";
    }
  })();

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!payload) {
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      setReady(false);
      setError(null);
      return;
    }

    /* Loaded here rather than at module scope so the library only downloads
       once someone actually has something to encode. */
    import("qrcode")
      .then((QRCode) =>
        QRCode.toCanvas(canvas, payload, {
          width: size,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark: "#0b1220", light: "#ffffff" },
        })
      )
      .then(() => {
        if (cancelled) return;
        setReady(true);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setReady(false);
        setError(
          "That content is too long to fit in a QR code. Try shortening it."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [payload, size]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `qr-${kind}.png`;
      a.click();
      URL.revokeObjectURL(href);
    }, "image/png");
  };

  return (
    <div className="space-y-4">
      <ToolPanel className="space-y-4">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              aria-pressed={kind === k.id}
              className={cn(
                "shrink-0 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                kind === k.id
                  ? "border-brand/40 bg-brand/10 text-brand"
                  : "border-border bg-background-subtle text-muted-foreground hover:text-foreground"
              )}
            >
              {k.label}
            </button>
          ))}
        </div>

        {kind === "url" && (
          <Field label="Link" htmlFor="qr-url">
            <Input
              id="qr-url"
              type="url"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://techinstant.netlify.app"
            />
          </Field>
        )}

        {kind === "text" && (
          <Field label="Text" htmlFor="qr-text">
            <Input
              id="qr-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Anything you want encoded"
            />
          </Field>
        )}

        {kind === "email" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email address" htmlFor="qr-email">
              <Input
                id="qr-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
              />
            </Field>
            <Field label="Subject (optional)" htmlFor="qr-subject">
              <Input
                id="qr-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enquiry"
              />
            </Field>
          </div>
        )}

        {kind === "phone" && (
          <Field label="Phone number" htmlFor="qr-phone">
            <Input
              id="qr-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
            />
          </Field>
        )}

        {kind === "wifi" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Network name (SSID)" htmlFor="qr-ssid">
                <Input
                  id="qr-ssid"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="MyNetwork"
                />
              </Field>
              <Field label="Security" htmlFor="qr-enc">
                <Select
                  id="qr-enc"
                  value={encryption}
                  onChange={(e) => setEncryption(e.target.value)}
                >
                  <option value="WPA">WPA / WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">No password</option>
                </Select>
              </Field>
            </div>
            {encryption !== "nopass" && (
              <Field label="Password" htmlFor="qr-wifipass">
                <Input
                  id="qr-wifipass"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  placeholder="Network password"
                />
              </Field>
            )}
          </div>
        )}

        {error && <ErrorNote>{error}</ErrorNote>}
      </ToolPanel>

      <ToolPanel className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "rounded-xl bg-white p-3 transition-opacity",
            ready ? "opacity-100" : "opacity-30"
          )}
        >
          <canvas
            ref={canvasRef}
            className="h-auto w-full max-w-[256px]"
            aria-label={ready ? "Generated QR code" : "QR code preview"}
          />
        </div>

        {!payload && (
          <p className="text-sm text-muted-foreground">
            Fill in the field above and your QR code appears here.
          </p>
        )}

        {ready && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Select
              aria-label="Download size"
              value={String(size)}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-auto"
            >
              <option value="256">256 px</option>
              <option value="512">512 px</option>
              <option value="1024">1024 px</option>
            </Select>
            <Button onClick={download}>
              <Download />
              Download PNG
            </Button>
          </div>
        )}
      </ToolPanel>
    </div>
  );
}
