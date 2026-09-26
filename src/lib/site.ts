/** Site-wide constants. Keep every externally visible string in one place. */
export const SITE = {
  name: "TechInstant Tools",
  parent: "TechInstant",
  tagline: "Free tools. Instant results.",
  description:
    "TechInstant Tools is a collection of fast, useful digital tools designed to help you work, create, calculate and solve everyday problems.",
  /** Set NEXT_PUBLIC_SITE_URL on Netlify once this site has its own domain. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://techinstant-tools.netlify.app",
  /** The main TechInstant marketing site. */
  parentUrl: "https://techinstant.netlify.app",
} as const;

export const TRUST_POINTS = [
  "Free to use",
  "No unnecessary signup",
  "Fast",
  "Mobile friendly",
] as const;

/** Shown only on tools that genuinely never send the file anywhere. */
export const LOCAL_PROCESSING_NOTE =
  "Your file is processed in your browser and is not uploaded to our server.";
