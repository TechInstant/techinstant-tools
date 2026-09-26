import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Scissors,
  Minimize2,
  FileImage,
  Images,
  ImageDown,
  Scaling,
  Repeat,
  Crop,
  Info,
  Braces,
  Minimize,
  Binary,
  Fingerprint,
  Clock,
  QrCode,
  KeyRound,
  Type,
  Percent,
  CalendarDays,
} from "lucide-react";
import type { CategoryId } from "./categories";

/**
 * The single source of truth for every tool.
 *
 * Adding a tool means one entry here plus one component registered in
 * `src/components/tools/registry.tsx` — the directory, search, category pages,
 * sitemap and metadata all derive from this list automatically.
 *
 * This file is intentionally data-only (no JSX, no component imports) so it can
 * be read from server components and the sitemap without pulling any tool code
 * into the bundle.
 */
export interface ToolFaq {
  q: string;
  a: string;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  /** One line, used on cards and in search. */
  description: string;
  category: CategoryId;
  icon: LucideIcon;
  tags: string[];
  featured?: boolean;
  popular?: boolean;
  isNew?: boolean;
  /** `live` tools have a working component; `soon` renders a clear placeholder. */
  status: "live" | "soon";
  /** True when the file never leaves the device, so we only claim it where true. */
  localProcessing?: boolean;
  /** Overrides for the <title> / meta description. */
  seoTitle?: string;
  seoDescription?: string;
  /** Short explanatory copy shown under the tool (§24). */
  about?: { heading: string; body: string }[];
  faq?: ToolFaq[];
  /** Sort key for "New" ordering; higher is newer. */
  addedAt: number;
}

export const TOOLS: Tool[] = [
  /* ---------------------------------------------------------------- PDF */
  {
    id: "merge-pdf",
    name: "Merge PDF",
    slug: "merge-pdf",
    description: "Combine several PDF files into one document.",
    category: "pdf",
    icon: FileText,
    tags: ["pdf", "merge", "combine", "join", "documents"],
    popular: true,
    status: "live",
    localProcessing: true,
    addedAt: 1,
    seoDescription:
      "Merge PDF files into a single document in your browser. Free, fast and private — your files are never uploaded.",
    about: [
      {
        heading: "What does merging a PDF do?",
        body: "Merging joins two or more PDF files end to end into a single document, keeping the pages in the order you choose. It is the usual way to combine scanned pages, chapters or signed forms into one file before sending it.",
      },
      {
        heading: "How to merge PDFs",
        body: "Add your files, drag them into the order you want, then press Merge. The combined PDF downloads straight to your device.",
      },
    ],
    faq: [
      {
        q: "Are my files uploaded anywhere?",
        a: "No. This tool reads and rebuilds the PDF entirely in your browser, so the files never leave your device.",
      },
      {
        q: "Is there a limit on how many files I can merge?",
        a: "There is no fixed limit, but very large documents are limited by your device's available memory.",
      },
    ],
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    slug: "split-pdf",
    description: "Extract a page range from a PDF into a new file.",
    category: "pdf",
    icon: Scissors,
    tags: ["pdf", "split", "extract", "pages", "range"],
    status: "live",
    localProcessing: true,
    addedAt: 2,
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    slug: "compress-pdf",
    description: "Reduce PDF file size while keeping it readable.",
    category: "pdf",
    icon: Minimize2,
    tags: ["pdf", "compress", "shrink", "reduce", "size", "optimise"],
    popular: true,
    featured: true,
    status: "live",
    localProcessing: true,
    addedAt: 3,
    seoTitle: "Compress PDF Online Free",
    seoDescription:
      "Compress PDF files quickly with TechInstant Tools. Simple, fast and privacy-conscious PDF compression in your browser.",
  },
  {
    id: "pdf-to-image",
    name: "PDF to Images",
    slug: "pdf-to-image",
    description: "Turn PDF pages into PNG or JPG images.",
    category: "pdf",
    icon: FileImage,
    tags: ["pdf", "image", "png", "jpg", "convert", "export"],
    status: "live",
    localProcessing: true,
    addedAt: 4,
  },
  {
    id: "images-to-pdf",
    name: "Images to PDF",
    slug: "images-to-pdf",
    description: "Combine images into a single PDF document.",
    category: "pdf",
    icon: Images,
    tags: ["image", "pdf", "convert", "jpg", "png", "document"],
    status: "live",
    localProcessing: true,
    addedAt: 5,
  },

  /* -------------------------------------------------------------- IMAGE */
  {
    id: "image-compressor",
    name: "Image Compressor",
    slug: "image-compressor",
    description: "Shrink JPG, PNG and WebP images with a quality slider.",
    category: "image",
    icon: ImageDown,
    tags: ["image", "compress", "jpg", "png", "webp", "optimise", "size"],
    popular: true,
    status: "soon",
    localProcessing: true,
    addedAt: 6,
  },
  {
    id: "image-resizer",
    name: "Image Resizer",
    slug: "image-resizer",
    description: "Resize images by width and height, with aspect lock.",
    category: "image",
    icon: Scaling,
    tags: ["image", "resize", "scale", "dimensions", "width", "height"],
    status: "soon",
    localProcessing: true,
    addedAt: 7,
  },
  {
    id: "image-converter",
    name: "Image Converter",
    slug: "image-converter",
    description: "Convert images between JPG, PNG and WebP.",
    category: "image",
    icon: Repeat,
    tags: ["image", "convert", "jpg", "png", "webp", "format"],
    status: "soon",
    localProcessing: true,
    addedAt: 8,
  },
  {
    id: "image-cropper",
    name: "Image Cropper",
    slug: "image-cropper",
    description: "Crop images freely or to a fixed aspect ratio.",
    category: "image",
    icon: Crop,
    tags: ["image", "crop", "trim", "aspect ratio", "square"],
    status: "soon",
    localProcessing: true,
    addedAt: 9,
  },
  {
    id: "image-metadata",
    name: "Image Metadata Viewer",
    slug: "image-metadata",
    description: "Inspect EXIF and other metadata stored in an image.",
    category: "image",
    icon: Info,
    tags: ["image", "metadata", "exif", "camera", "gps", "inspect"],
    status: "soon",
    localProcessing: true,
    addedAt: 10,
  },

  /* ---------------------------------------------------------- DEVELOPER */
  {
    id: "json-formatter",
    name: "JSON Formatter",
    slug: "json-formatter",
    description: "Format, validate and minify JSON with clear errors.",
    category: "developer",
    icon: Braces,
    tags: ["json", "format", "beautify", "validate", "pretty", "developer"],
    popular: true,
    featured: true,
    status: "live",
    localProcessing: true,
    addedAt: 11,
  },
  {
    id: "json-minifier",
    name: "JSON Minifier",
    slug: "json-minifier",
    description: "Strip whitespace from JSON to make it as small as possible.",
    category: "developer",
    icon: Minimize,
    tags: ["json", "minify", "compress", "whitespace", "developer"],
    status: "live",
    localProcessing: true,
    addedAt: 12,
  },
  {
    id: "base64",
    name: "Base64 Encoder / Decoder",
    slug: "base64",
    description: "Encode text to Base64 or decode it back.",
    category: "developer",
    icon: Binary,
    tags: ["base64", "encode", "decode", "convert", "developer"],
    status: "live",
    localProcessing: true,
    addedAt: 13,
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    slug: "uuid-generator",
    description: "Generate one or many RFC 4122 version 4 UUIDs.",
    category: "developer",
    icon: Fingerprint,
    tags: ["uuid", "guid", "generate", "random", "identifier", "developer"],
    status: "live",
    localProcessing: true,
    addedAt: 14,
  },
  {
    id: "timestamp",
    name: "Timestamp Converter",
    slug: "timestamp",
    description: "Convert between Unix timestamps and readable dates.",
    category: "developer",
    icon: Clock,
    tags: ["timestamp", "unix", "epoch", "date", "time", "convert"],
    status: "live",
    localProcessing: true,
    addedAt: 15,
  },

  /* ----------------------------------------------------------------- QR */
  {
    id: "qr-generator",
    name: "QR Code Generator",
    slug: "qr-generator",
    description: "Create QR codes for links, text, email, phone and Wi-Fi.",
    category: "qr",
    icon: QrCode,
    tags: ["qr", "qr code", "generate", "url", "wifi", "barcode"],
    popular: true,
    featured: true,
    status: "live",
    localProcessing: true,
    addedAt: 16,
  },

  /* --------------------------------------------------- EVERYDAY / OTHER */
  {
    id: "password-generator",
    name: "Password Generator",
    slug: "password-generator",
    description: "Build strong random passwords with the options you choose.",
    category: "business",
    icon: KeyRound,
    tags: ["password", "generate", "random", "secure", "strong"],
    popular: true,
    status: "live",
    localProcessing: true,
    addedAt: 17,
  },
  {
    id: "word-counter",
    name: "Word Counter",
    slug: "word-counter",
    description: "Count words, characters, sentences and reading time.",
    category: "student",
    icon: Type,
    tags: ["word", "count", "characters", "text", "essay", "reading time"],
    popular: true,
    status: "live",
    localProcessing: true,
    addedAt: 18,
  },
  {
    id: "percentage-calculator",
    name: "Percentage Calculator",
    slug: "percentage-calculator",
    description: "Work out percentages, shares and increases or decreases.",
    category: "calculators",
    icon: Percent,
    tags: ["percentage", "percent", "calculate", "increase", "decrease", "maths"],
    popular: true,
    status: "live",
    localProcessing: true,
    addedAt: 19,
  },
  {
    id: "age-calculator",
    name: "Age Calculator",
    slug: "age-calculator",
    description: "Calculate an exact age in years, months and days.",
    category: "calculators",
    icon: CalendarDays,
    tags: ["age", "birthday", "date", "calculate", "years", "days"],
    status: "live",
    localProcessing: true,
    addedAt: 20,
  },
];

/* ------------------------------------------------------------- helpers */

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);

export const liveTools = () => TOOLS.filter((t) => t.status === "live");

export const toolsByCategory = (category: CategoryId) =>
  TOOLS.filter((t) => t.category === category);

export const countByCategory = (category: CategoryId) =>
  toolsByCategory(category).length;

export const popularTools = () => TOOLS.filter((t) => t.popular);

export const newTools = () => TOOLS.filter((t) => t.isNew);

/**
 * Search across name, description, category and tags (§20). Ranked so a name
 * match beats a tag match, which beats a description match.
 */
export const searchTools = (query: string, pool: Tool[] = TOOLS): Tool[] => {
  const q = query.trim().toLowerCase();
  if (!q) return pool;

  const scored = pool
    .map((tool) => {
      const name = tool.name.toLowerCase();
      let score = 0;

      if (name === q) score = 100;
      else if (name.startsWith(q)) score = 80;
      else if (name.includes(q)) score = 60;
      else if (tool.tags.some((t) => t === q)) score = 50;
      else if (tool.tags.some((t) => t.includes(q))) score = 35;
      else if (tool.category.includes(q)) score = 25;
      else if (tool.description.toLowerCase().includes(q)) score = 20;

      return { tool, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));

  return scored.map((r) => r.tool);
};
