import {
  Poppins,
  Playfair_Display,
  Montserrat,
  Merriweather,
  Lato,
  Cormorant_Garamond,
} from "next/font/google";

/**
 * Fonts offered by the certificate builder.
 *
 * These are self-hosted by `next/font` at build time, so choosing one does not
 * make a request to Google — which keeps the tool's "nothing leaves your
 * device" promise true. `preload: false` keeps them out of the initial page
 * payload; the browser fetches whichever one the canvas actually asks for.
 */
/* `next/font` requires literal option objects, so these cannot share a spread
   constant — its generated types reject a readonly `subsets` array. */
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["400", "700"],
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["400", "700"],
});
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["400", "700"],
});
const merriweather = Merriweather({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["400", "700"],
});
const lato = Lato({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["400", "700"],
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["400", "700"],
});

export interface CertFont {
  id: string;
  name: string;
  /** What to put in `ctx.font`. */
  family: string;
  /** Weights actually available, so we never ask for one that will be faked. */
  weights: { regular: number; bold: number };
  note: string;
}

export const CERT_FONTS: CertFont[] = [
  {
    id: "poppins",
    name: "Poppins",
    family: poppins.style.fontFamily,
    weights: { regular: 400, bold: 700 },
    note: "Clean geometric sans — modern courses and workshops.",
  },
  {
    id: "playfair",
    name: "Playfair Display",
    family: playfair.style.fontFamily,
    weights: { regular: 400, bold: 700 },
    note: "High-contrast serif — the traditional certificate look.",
  },
  {
    id: "montserrat",
    name: "Montserrat",
    family: montserrat.style.fontFamily,
    weights: { regular: 400, bold: 700 },
    note: "Wide, confident sans — good for corporate awards.",
  },
  {
    id: "merriweather",
    name: "Merriweather",
    family: merriweather.style.fontFamily,
    weights: { regular: 400, bold: 700 },
    note: "Sturdy serif that stays readable when printed small.",
  },
  {
    id: "lato",
    name: "Lato",
    family: lato.style.fontFamily,
    weights: { regular: 400, bold: 700 },
    note: "Neutral humanist sans — safe in almost any context.",
  },
  {
    id: "cormorant",
    name: "Cormorant Garamond",
    family: cormorant.style.fontFamily,
    weights: { regular: 400, bold: 700 },
    note: "Elegant, light serif — formal and academic.",
  },
];

export const getCertFont = (id: string) =>
  CERT_FONTS.find((f) => f.id === id) ?? CERT_FONTS[0];

/**
 * Canvas draws with whatever is loaded at the moment `fillText` runs, and a
 * font that has not finished loading falls back silently. Awaiting both weights
 * is what stops the first render coming out in Times New Roman.
 */
export async function ensureFontLoaded(font: CertFont) {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load(`${font.weights.regular} 64px ${font.family}`),
      document.fonts.load(`${font.weights.bold} 64px ${font.family}`),
      document.fonts.load(`italic ${font.weights.regular} 64px ${font.family}`),
    ]);
    await document.fonts.ready;
  } catch {
    /* A refused font load should not stop the certificate rendering. */
  }
}
