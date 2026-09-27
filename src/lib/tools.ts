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
  Droplets,
  Baby,
  Activity,
  GraduationCap,
  Code2,
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
    status: "live",
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
    status: "live",
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
    status: "live",
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
    status: "live",
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
    status: "live",
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

  /* ------------------------------------------------------------- HEALTH */
  {
    id: "period-calculator",
    name: "Period & Cycle Calculator",
    slug: "period-calculator",
    description: "Estimate your next periods and fertile window.",
    category: "health",
    icon: Droplets,
    tags: ["period", "cycle", "menstrual", "ovulation", "fertility", "women"],
    popular: true,
    isNew: true,
    status: "live",
    localProcessing: true,
    addedAt: 21,
    seoTitle: "Period & Ovulation Calculator",
    seoDescription:
      "Estimate your next period dates and fertile window privately. Nothing is saved or uploaded — it all happens in your browser.",
    about: [
      {
        heading: "How the estimate works",
        body: "Counting starts from the first day of your last period. Each following period is one cycle length later. Ovulation is estimated at about 14 days before the next period starts, and the fertile window covers the five days before ovulation plus the day itself, because sperm can survive several days.",
      },
      {
        heading: "Why the dates move",
        body: "Cycle length varies between people and from month to month. Stress, illness, travel, breastfeeding, contraception and thyroid conditions all shift it. Treat these dates as a guide, and track a few real cycles to find your own average.",
      },
    ],
    faq: [
      {
        q: "Can I use this as contraception?",
        a: "No. Predicted fertile windows are averages and are wrong often enough that they are not a reliable way to avoid pregnancy. Speak to a pharmacist or doctor about contraception that suits you.",
      },
      {
        q: "Is my data stored anywhere?",
        a: "No. The dates you enter stay in the browser tab and are never sent to a server or written to storage. Closing the tab clears them.",
      },
      {
        q: "My cycle is irregular — is this still useful?",
        a: "It gives a rough expectation, but the more your cycle varies the less precise it will be. If your cycle is consistently shorter than 21 days or longer than 35, it is worth mentioning to a doctor.",
      },
    ],
  },
  {
    id: "due-date-calculator",
    name: "Pregnancy Due Date Calculator",
    slug: "due-date-calculator",
    description: "Estimate a due date and see how far along you are.",
    category: "health",
    icon: Baby,
    tags: ["pregnancy", "due date", "weeks", "trimester", "baby", "women"],
    popular: true,
    isNew: true,
    status: "live",
    localProcessing: true,
    addedAt: 22,
    seoTitle: "Pregnancy Due Date Calculator",
    seoDescription:
      "Work out your estimated due date, current week and trimester. Private, free and calculated entirely in your browser.",
    about: [
      {
        heading: "How a due date is worked out",
        body: "The standard method counts 280 days — 40 weeks — from the first day of your last period. That deliberately includes the roughly two weeks before conception, which is why you are counted as “two weeks pregnant” at the moment of conception. If your cycle is longer or shorter than 28 days, this tool shifts the date to match.",
      },
      {
        heading: "How accurate is it?",
        body: "Only about one baby in twenty arrives on the estimated date. Most arrive within two weeks either side. A dating scan in the first trimester is more accurate than any calculation, and is what your midwife will use.",
      },
    ],
    faq: [
      {
        q: "I don't know my last period date.",
        a: "Switch the method to conception date if you know it. Otherwise a dating scan is the reliable answer — this calculation needs one of those two dates.",
      },
      {
        q: "Why does my cycle length change the result?",
        a: "The 280-day rule assumes ovulation on day 14. If you ovulate later, conception happened later, so the due date moves later by the same number of days.",
      },
    ],
  },
  {
    id: "bmi-calculator",
    name: "BMI Calculator",
    slug: "bmi-calculator",
    description: "Check BMI and the healthy weight range for your height.",
    category: "health",
    icon: Activity,
    tags: ["bmi", "weight", "height", "health", "body mass index"],
    isNew: true,
    status: "live",
    localProcessing: true,
    addedAt: 23,
    about: [
      {
        heading: "What BMI actually measures",
        body: "BMI is your weight in kilograms divided by your height in metres squared. It is a quick population-level screen, not a measurement of health or body composition. It cannot tell muscle from fat.",
      },
      {
        heading: "When BMI misleads",
        body: "Muscular people often read as overweight when they are not. BMI is also a poor guide during pregnancy, for children and teenagers, for older adults who have lost muscle, and it sits differently across ethnic groups. Waist measurement is often more informative.",
      },
    ],
    faq: [
      {
        q: "What counts as a healthy BMI?",
        a: "For most adults, 18.5 to 24.9. Below that is classed as underweight, 25 to 29.9 as overweight, and 30 or above as obese. These are screening bands, not a diagnosis.",
      },
    ],
  },

  /* ------------------------------------------------------------ STUDENT */
  {
    id: "gpa-calculator",
    name: "GPA & CGPA Calculator",
    slug: "gpa-calculator",
    description: "Work out semester GPA and cumulative CGPA on a 5.0 or 4.0 scale.",
    category: "student",
    icon: GraduationCap,
    tags: ["gpa", "cgpa", "grade", "university", "student", "class of degree"],
    popular: true,
    isNew: true,
    status: "live",
    localProcessing: true,
    addedAt: 24,
    seoTitle: "GPA & CGPA Calculator (5.0 and 4.0 scale)",
    seoDescription:
      "Calculate your semester GPA and cumulative CGPA on either the 5.0 or 4.0 scale, with class of degree. Free and private.",
    about: [
      {
        heading: "How GPA is calculated",
        body: "Each course grade is worth a number of grade points. Multiply those points by the course's credit units, add up the total across every course, then divide by the total units. Units matter — a five-unit course pulls your average far harder than a one-unit course.",
      },
      {
        heading: "GPA versus CGPA",
        body: "GPA covers one semester. CGPA covers everything so far. To get CGPA here, enter your previous GPA and the total units it was earned over, and this tool weights the two together properly rather than just averaging them.",
      },
    ],
    faq: [
      {
        q: "Which scale should I choose?",
        a: "Most Nigerian universities use the 5.0 scale where an A is worth 5 points. Many institutions elsewhere use 4.0. Check your student handbook — the grade boundaries matter as much as the scale.",
      },
      {
        q: "Why is my CGPA different from my school portal?",
        a: "Institutions differ on how they treat repeated courses, carry-overs and electives. This tool does a straight weighted average, so a repeat policy will make it diverge.",
      },
    ],
  },

  /* ---------------------------------------------------------------- WEB */
  {
    id: "meta-tag-generator",
    name: "Meta Tag Generator",
    slug: "meta-tag-generator",
    description: "Build title, description, Open Graph and X tags with a live preview.",
    category: "web",
    icon: Code2,
    tags: ["meta", "seo", "open graph", "og", "twitter", "html", "head"],
    popular: true,
    isNew: true,
    status: "live",
    localProcessing: true,
    addedAt: 25,
    seoTitle: "Meta Tag & Open Graph Generator",
    seoDescription:
      "Generate SEO meta tags, Open Graph and X/Twitter card markup with a live search-result preview. Copy straight into your head.",
    about: [
      {
        heading: "Why meta tags matter",
        body: "The title and description are what people read in search results before deciding whether to click. Open Graph tags control what appears when your link is pasted into WhatsApp, LinkedIn, Facebook or Slack — without them you get a bare URL and no image.",
      },
      {
        heading: "Getting the lengths right",
        body: "Titles are usually cut around 60 characters and descriptions around 155. The counters here warn you before that happens. Write for the person reading, not the algorithm — a clear promise beats keyword stuffing.",
      },
    ],
    faq: [
      {
        q: "What size should the share image be?",
        a: "1200 × 630 pixels is the safe choice — it works on every major platform. Use an absolute URL, not a relative path, or the image will not load when the link is shared.",
      },
      {
        q: "Do I still need Twitter tags?",
        a: "X falls back to Open Graph when its own tags are missing, so they are optional. Including them gives you control over how the card looks there specifically.",
      },
    ],
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
