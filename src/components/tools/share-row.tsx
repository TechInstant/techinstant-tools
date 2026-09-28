"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Mail, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Share links for a tool page.
 *
 * Every target is a plain URL opened in a new tab — no SDKs, no tracking
 * pixels, no Facebook or X script on the page. That keeps the tools' privacy
 * promise intact: the network only learns anything when you actually click.
 */
export function ShareRow({
  title,
  text,
  className,
}: {
  /** What is being shared, e.g. "the Pregnancy Shopping List". */
  title: string;
  /** Optional lead-in for the message body. */
  text?: string;
  className?: string;
}) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  /* `location` does not exist during the server render, so the URL has to be
     read after mount or the markup mismatches. */
  useEffect(() => {
    setUrl(window.location.href);
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const message = text || `${title} — free, private, and works in your browser.`;
  const e = encodeURIComponent;

  const targets = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${e(`${message} ${url}`)}`,
      className: "hover:border-[#25D366] hover:text-[#128C3F] dark:hover:text-[#25D366]",
    },
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`,
      className: "hover:border-[#1877F2] hover:text-[#1877F2]",
    },
    {
      id: "x",
      label: "X",
      href: `https://x.com/intent/tweet?text=${e(message)}&url=${e(url)}`,
      className: "hover:border-foreground hover:text-foreground",
    },
    {
      id: "email",
      label: "Email",
      href: `mailto:?subject=${e(title)}&body=${e(`${message}\n\n${url}`)}`,
      className: "hover:border-brand hover:text-brand",
    },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background-subtle p-4",
        className
      )}
    >
      <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Share2 className="h-4 w-4 text-brand" />
        Share {title}
      </h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {targets.map((t) => (
          <a
            key={t.id}
            href={url ? t.href : undefined}
            target={t.id === "email" ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-disabled={!url}
            className={cn(
              "inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-muted-foreground transition-colors",
              url ? t.className : "pointer-events-none opacity-60"
            )}
          >
            {t.id === "whatsapp" && <MessageCircle className="h-4 w-4" />}
            {t.id === "email" && <Mail className="h-4 w-4" />}
            {t.id === "facebook" && <span aria-hidden="true" className="font-bold">f</span>}
            {t.id === "x" && <span aria-hidden="true" className="font-bold">𝕏</span>}
            {t.label}
          </a>
        ))}

        <Button
          variant="outline"
          className="min-h-11"
          disabled={!url}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? <Check className="text-brand" /> : <Link2 />}
          {copied ? "Link copied" : "Copy link"}
        </Button>

        {canNativeShare && (
          <Button
            variant="outline"
            className="min-h-11"
            onClick={async () => {
              try {
                await navigator.share({ title, text: message, url });
              } catch {
                /* The user dismissing the share sheet throws; ignore it. */
              }
            }}
          >
            <Share2 />
            More…
          </Button>
        )}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Sharing sends the page link, never your list. What you have ticked stays
        in this browser.
      </p>
    </div>
  );
}
