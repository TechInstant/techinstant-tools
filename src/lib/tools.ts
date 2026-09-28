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
  Quote,
  Target,
  CaseSensitive,
  BookOpen,
  ScanSearch,
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
    about: [
      { heading: "What splitting a PDF does", body: "Splitting pulls the pages you name out of a document and writes them to a new PDF, leaving the original untouched. It is how you send one chapter instead of a whole report, or strip a signature page off a contract before sharing it." },
      { heading: "Choosing pages", body: "Enter single pages, ranges, or both — 1-3, 5, 8-10. Pages come out in the order you list them, and duplicates are ignored, so you can reorder while you extract." },
    ],
    faq: [
      { q: "Does the original file change?", a: "No. The original stays exactly as it was on your device — a new file is created for the pages you chose." },
      { q: "Why does it say my page is out of range?", a: "The number you asked for is higher than the page count of the file you loaded. The tool shows the real page count next to the file name." },
    ],
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
    about: [
      { heading: "What PDF compression actually does", body: "Most of the weight in a large PDF is images. This tool re-renders each page and re-encodes it as a JPEG at the quality you choose, then rebuilds the document at the original page size. That is the only way to genuinely shrink a PDF inside a browser, with no server involved." },
      { heading: "The trade-off worth knowing", body: "Because pages become images, text in the result is no longer selectable or searchable. For scans and image-heavy documents that costs you nothing. For a text document it can make the file larger, and the tool tells you when that happens rather than hiding it." },
    ],
    faq: [
      { q: "Which level should I pick?", a: "Medium suits most files. Use Low when quality matters more than size, and High when you need to get under an upload limit and can accept softer pages." },
      { q: "My file got bigger. Why?", a: "Text-only PDFs are already far smaller as text than as images. Keep your original — the tool says so when the result grows." },
      { q: "Are my files uploaded?", a: "No. Rendering and rebuilding both happen in your browser, so the file never leaves your device." },
    ],
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
    about: [
      { heading: "Turning pages into pictures", body: "Each page you select is rendered at the resolution you choose and saved as a PNG or JPG. Useful for slide decks, for pasting a page into a document, or for sharing one page where a PDF would be awkward." },
      { heading: "PNG or JPG?", body: "PNG is lossless and handles text and line art crisply, which makes it the safer default. JPG produces much smaller files and suits pages that are mostly photographs." },
    ],
    faq: [
      { q: "What does the quality setting change?", a: "It sets the render scale. 2x renders each page at twice its natural size, which keeps small text legible when you zoom in. Higher settings produce larger files." },
      { q: "Can I convert just one page?", a: "Yes — put a single number in the pages field, or a mix like 1, 4, 9." },
    ],
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
    about: [
      { heading: "Why put images in a PDF", body: "One PDF is easier to send, print and archive than a folder of photos, and it keeps your pages in a fixed order. This is the usual way to turn phone photos of a document back into something you can submit." },
      { heading: "Page size and fit", body: "A4 and US Letter place each image inside the page with a margin you choose, keeping the aspect ratio so nothing is stretched. Fit to image makes every page exactly the size of its picture instead, which avoids white borders." },
    ],
    faq: [
      { q: "Can I change the order?", a: "Yes. Drag a file, or use the arrows, and the PDF follows that order." },
      { q: "Which formats work?", a: "JPG and PNG. Both are embedded directly, so quality is not reduced when the page size is Fit to image." },
    ],
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
    about: [
      { heading: "How image compression works", body: "JPG and WebP discard detail the eye is least likely to miss. Lowering quality removes more of it and makes the file smaller. There is no single right number — it depends on the picture and where it will be used." },
      { heading: "Picking a format", body: "WebP is usually 25 to 35 percent smaller than JPG at the same visual quality and is supported everywhere that matters now. JPG remains the safest for anything that will be opened by older software. PNG is lossless, so the quality slider does not apply to it." },
    ],
    faq: [
      { q: "What quality should I use?", a: "Around 70 percent is a good starting point for photos on the web. Compare the before and after previews and go lower until you can see the difference, then step back." },
      { q: "Is the original changed?", a: "No. Compression happens on a copy in your browser and you download the result — your file on disk is untouched." },
    ],
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
    about: [
      { heading: "Resizing without distortion", body: "Changing width and height independently squashes a picture. Keeping the aspect ratio locked means setting one dimension and letting the other follow, so faces and shapes stay the right proportions." },
      { heading: "Making images smaller, not just look smaller", body: "Scaling an image down in a document only changes how it is displayed — the file is still full size. Resizing it properly, as this does, reduces the actual pixels and the file size with them." },
    ],
    faq: [
      { q: "Can I make an image bigger?", a: "You can, but enlarging invents pixels that were never captured, so the result looks soft. Going down in size is always cleaner than going up." },
      { q: "What size should a web image be?", a: "1920 pixels wide is plenty for a full-width banner. Anything inside an article rarely needs more than 1080." },
    ],
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
    about: [
      { heading: "When to convert", body: "Convert to WebP to cut page weight, to JPG when something old needs to open the file, and to PNG when you need lossless quality or a screenshot to stay crisp." },
      { heading: "What happens to transparency", body: "JPG has no transparency. Converting a transparent PNG to JPG flattens it onto white, which is usually what you want for a photo and rarely what you want for a logo — keep logos as PNG or WebP." },
    ],
    faq: [
      { q: "Does converting lose quality?", a: "Converting to PNG does not. Converting to JPG or WebP re-encodes the image, so some detail is lost — the quality slider controls how much." },
      { q: "Is WebP safe to use?", a: "Yes. Every current browser supports it. Keep a JPG copy only if you need to support software from before 2020." },
    ],
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
    about: [
      { heading: "Cropping with intent", body: "Drag the corners to choose the area you want, or lock an aspect ratio first so the crop matches where it is going — 1:1 for a profile picture, 16:9 for a video thumbnail, 4:3 for print." },
      { heading: "Cropping is not resizing", body: "Cropping cuts pixels away at the edges. Resizing changes the whole image. Crop first to get the framing right, then resize if the result is still larger than you need." },
    ],
    faq: [
      { q: "What size will the result be?", a: "The button shows the exact pixel dimensions of your current selection before you commit to it." },
      { q: "Is the original affected?", a: "No. You download a new cropped file and the original stays as it was." },
    ],
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
    about: [
      { heading: "What EXIF holds", body: "Cameras and phones write a block of data into the file: the model, the lens, exposure, ISO, the date, and often the exact GPS coordinates where the photo was taken. That data travels with the file when you send it." },
      { heading: "Why it is worth checking", body: "Sharing an original photo can reveal where you live or work without you realising. Most social networks strip this on upload, but files sent directly — by email, or as a document attachment — usually keep it." },
    ],
    faq: [
      { q: "My image shows no metadata. Is that a problem?", a: "No, it is normal and usually good. Screenshots have none, and most apps strip it when they save or share." },
      { q: "Can this remove the metadata?", a: "Not yet — it only shows you what is there. Re-saving a photo through the Image Converter drops most of it as a side effect." },
    ],
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
    about: [
      { heading: "Formatting and validating together", body: "Indenting JSON makes its structure visible. Parsing it properly also proves it is valid — if it formats, it is well-formed, and if it is not, you get the line and column where the parser gave up." },
      { heading: "Reading the error", body: "Most JSON errors are a trailing comma, a missing quote, or single quotes where double quotes are required. The message points at the character position, and the offending line is shown underneath it." },
    ],
    faq: [
      { q: "Is my data sent anywhere?", a: "No. Parsing happens in your browser with the built-in JSON engine — nothing is transmitted or logged." },
      { q: "Why does my JSON fail when it looks fine?", a: "JSON is stricter than JavaScript. No trailing commas, no comments, no single-quoted strings, and keys must be in double quotes." },
      { q: "What is the difference between format and minify?", a: "Format adds indentation for humans. Minify strips every optional space for machines — same data, smaller file." },
    ],
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
    about: [
      { heading: "Why minify", body: "Whitespace in JSON is for people, not parsers. Removing it shrinks API payloads and config files with no change in meaning, which matters when the same response is sent thousands of times." },
      { heading: "What it does not change", body: "Minifying never alters your data — only the formatting between values. Run it back through the formatter and you get the original structure." },
    ],
    faq: [
      { q: "How much smaller will it get?", a: "Indented JSON usually shrinks by 20 to 50 percent. The tool shows the before, after and percentage saved." },
      { q: "Is minified JSON still valid?", a: "Yes. Any parser reads it identically." },
    ],
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
    about: [
      { heading: "What Base64 is for", body: "Base64 rewrites data using only letters, digits and a couple of symbols, so it can travel safely through systems that expect text — email bodies, JSON fields, data URLs and HTTP headers." },
      { heading: "It is not encryption", body: "Base64 is an encoding, not a cipher. Anyone can decode it in seconds. Never use it to protect a password, a token or anything private." },
    ],
    faq: [
      { q: "Why did my decode fail?", a: "The input is not valid Base64 — usually a stray space, a missing character, or padding that was trimmed when it was copied." },
      { q: "Does it handle emoji and accents?", a: "Yes. Text is converted through UTF-8 first, so £, café and emoji all round-trip correctly. Many Base64 tools break on these." },
    ],
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
    about: [
      { heading: "What a UUID is", body: "A 128-bit identifier written as 32 hexadecimal characters in five groups. Version 4 UUIDs are almost entirely random, which means two systems can create them independently and effectively never collide." },
      { heading: "Where they are used", body: "Database primary keys, request and trace identifiers, idempotency keys, file names — anywhere you need a unique value without asking a central service for one." },
    ],
    faq: [
      { q: "Are these random enough to rely on?", a: "Yes. They come from the browser cryptographic random number generator, not Math.random, which is what makes collisions negligible." },
      { q: "Should I use a UUID as a database key?", a: "It is convenient and avoids coordination, but random keys can fragment indexes on large tables. Worth checking against your workload before committing." },
    ],
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
    about: [
      { heading: "What a Unix timestamp is", body: "The number of seconds since 1 January 1970 UTC. It is a single number with no timezone attached, which is exactly why systems store time that way — the ambiguity is added only when it is displayed." },
      { heading: "Seconds or milliseconds", body: "Unix tools and most APIs use seconds. JavaScript uses milliseconds. A timestamp that decodes to 1970 usually means milliseconds were read as seconds, so switch the unit." },
    ],
    faq: [
      { q: "Why does the local time differ from UTC?", a: "Local time applies your machine timezone and any daylight saving. Both are shown so you can see the offset." },
      { q: "What is ISO 8601?", a: "The unambiguous text format, like 2026-01-31T14:05:00.000Z. The trailing Z means UTC. It is the safest format for storing or transmitting a date as text." },
    ],
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
    about: [
      { heading: "What goes in a QR code", body: "A QR code is just text. Prefixing it in the right way tells the phone what to do with it — a URL opens a browser, a tel: opens the dialler, and a WIFI: block offers to join a network." },
      { heading: "Making one that actually scans", body: "Keep the content short, print it large enough, and leave the white border around it — that quiet zone is part of the specification, not decoration. Test with a real phone before printing a thousand of them." },
    ],
    faq: [
      { q: "Does the QR code expire?", a: "No. The content is encoded in the pattern itself, so it works forever and does not depend on this site. Only a shortened link inside it could ever break." },
      { q: "How does the Wi-Fi one work?", a: "It encodes the network name, security type and password in the standard format. Phone cameras recognise it and offer to join without typing the password." },
      { q: "What size should I download?", a: "512 pixels is fine for screens. Use 1024 for print, and scale it to at least 2cm across on paper." },
    ],
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
    about: [
      { heading: "What makes a password strong", body: "Length, more than anything. Each extra character multiplies the number of possibilities, which beats swapping letters for symbols. A long password from a mix of character types is far harder to crack than a short complicated one." },
      { heading: "How these are generated", body: "Characters come from the browser cryptographic random number generator, and the selection avoids modulo bias so every character really is equally likely. At least one character from each type you tick is guaranteed, then the result is shuffled." },
    ],
    faq: [
      { q: "Is the password sent anywhere?", a: "No. It is created in your browser, never transmitted, and never stored. Closing the tab destroys it." },
      { q: "How long should it be?", a: "Sixteen characters is a sensible floor and twenty or more is better for anything important. Length costs you nothing when a password manager is doing the typing." },
      { q: "Why does the strength rating change?", a: "It is calculated from entropy — length combined with how many character types are in play — not from a list of rules." },
    ],
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
    about: [
      { heading: "What is counted", body: "Words are runs of characters separated by whitespace. Sentences are split on full stops, question marks and exclamation marks. Paragraphs are blocks separated by a blank line. Everything updates as you type." },
      { heading: "Reading time", body: "Estimated at about 225 words per minute, which is typical adult silent reading. Technical material reads slower, so treat it as a floor rather than a promise." },
    ],
    faq: [
      { q: "Does it count characters with or without spaces?", a: "Both are shown. Application forms and social limits usually mean with spaces, which is the larger of the two." },
      { q: "Is my text uploaded?", a: "No. Counting happens in your browser as you type and nothing is sent or saved." },
    ],
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
    about: [
      { heading: "The three questions people actually ask", body: "What is X percent of Y, for discounts and tips. X is what percent of Y, for scores and shares. And how much something changed between two numbers, for growth and price rises." },
      { heading: "Percentage change catches people out", body: "Going up 50 percent then down 50 percent does not return you to the start. The second percentage applies to the new, larger number — which is why a 50 percent rise followed by a 50 percent fall leaves you 25 percent down." },
    ],
    faq: [
      { q: "How do I work out a discount?", a: "Use the first mode to find the discount amount, then subtract it. For 20 percent off 4,500, the discount is 900 and you pay 3,600." },
      { q: "Why is the increase mode blank?", a: "The starting value cannot be zero — there is no meaningful percentage change from nothing." },
    ],
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
    about: [
      { heading: "Getting age right", body: "Age is not days divided by 365. This counts calendar years, then whole months, then the days left over, borrowing the real length of each month so February and leap years come out correctly." },
      { heading: "Any two dates", body: "Leave the second date as today for a current age, or change it to work out how old someone will be at a wedding, a deadline, or on a specific school cut-off date." },
    ],
    faq: [
      { q: "Does it handle leap years?", a: "Yes. Someone born on 29 February 2000 is 23 on 28 February 2024 and turns 24 the next day." },
      { q: "What is the total days figure?", a: "The exact number of days between the two dates, which is often what forms and visa applications actually ask for." },
    ],
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

  /* ------------------------------------------------- STUDENT (batch 2) */
  {
    id: "citation-generator",
    name: "Citation Generator",
    slug: "citation-generator",
    description: "Build APA, MLA, Harvard and Chicago references.",
    category: "student",
    icon: Quote,
    tags: ["citation", "reference", "apa", "mla", "harvard", "chicago", "bibliography"],
    popular: true,
    isNew: true,
    status: "live",
    localProcessing: true,
    addedAt: 26,
    seoTitle: "Citation Generator — APA, MLA, Harvard, Chicago",
    seoDescription:
      "Generate correctly formatted references and in-text citations in APA 7, MLA 9, Harvard and Chicago. Free and private.",
    about: [
      {
        heading: "Why citations matter",
        body: "Citing properly is what separates using a source from taking it. It credits the person who did the work, and it lets a reader follow your reasoning back to where it came from. Most accidental plagiarism is a citation someone forgot, not deliberate copying.",
      },
      {
        heading: "Picking the right style",
        body: "Your department decides, not you — check the handbook before you start. APA is usual in psychology, education and the sciences; MLA in literature and the humanities; Harvard is widespread in the UK and Australia; Chicago in history and the arts.",
      },
    ],
    faq: [
      {
        q: "How do I enter several authors?",
        a: "Separate them with a semicolon, like Ada Lovelace; Alan Turing. Each style has its own rule for how many are listed before et al., and that is applied for you.",
      },
      {
        q: "Do I need the date I accessed a web page?",
        a: "MLA and Harvard expect it. APA only wants it for pages likely to change. When in doubt, include it.",
      },
      {
        q: "Will this match my university's guide exactly?",
        a: "It follows the published rules for each style, but institutions add house variations. Check one entry against your handbook before generating fifty.",
      },
    ],
  },
  {
    id: "grade-calculator",
    name: "Grade Calculator",
    slug: "grade-calculator",
    description: "See your current grade and what you need on what's left.",
    category: "student",
    icon: Target,
    tags: ["grade", "marks", "exam", "weighted", "average", "student", "final"],
    popular: true,
    isNew: true,
    status: "live",
    localProcessing: true,
    addedAt: 27,
    seoTitle: "Grade Calculator — What Do I Need on the Final?",
    seoDescription:
      "Work out your current weighted grade and exactly what score you need on remaining assessments to hit your target.",
    about: [
      {
        heading: "Weighted grades, not averages",
        body: "A 10% quiz and a 50% exam do not count the same. This multiplies each score by its weight, which is how your institution actually calculates the final mark — and why a bad result on a small assessment matters far less than it feels like it does.",
      },
      {
        heading: "What you need on what's left",
        body: "Enter a target and it works backwards: the mark you have banked, the weight still available, and the average you need across everything remaining. If that number is above 100 it says so, because knowing a target is out of reach is more useful than a false hope.",
      },
    ],
    faq: [
      {
        q: "What if my weights don't add to 100?",
        a: "That is fine while the module is in progress — the remainder is treated as still to come. If they add to more than 100 the tool flags it, because something has been entered twice.",
      },
      {
        q: "Can I use this for a whole degree?",
        a: "It works for any weighted set. For a degree classification, use year weightings as the weights and year averages as the scores.",
      },
    ],
  },
  {
    id: "text-case-converter",
    name: "Text Case Converter",
    slug: "text-case-converter",
    description: "Convert text to title, sentence, camel, snake and kebab case.",
    category: "student",
    icon: CaseSensitive,
    tags: ["case", "text", "title case", "camelcase", "snake_case", "kebab", "uppercase"],
    isNew: true,
    status: "live",
    localProcessing: true,
    addedAt: 28,
    about: [
      {
        heading: "Ten cases at once",
        body: "Paste once and every conversion appears together, so you can pick the one that fits rather than converting repeatedly. Copy any of them with a single click.",
      },
      {
        heading: "Title case is not just capitals",
        body: "Proper title case leaves short words like a, the, of and in lowercase — unless they open or close the title. That rule is applied here, which is why it does not simply capitalise everything.",
      },
    ],
    faq: [
      {
        q: "What is the difference between camelCase and PascalCase?",
        a: "Both remove spaces and capitalise each word. camelCase leaves the first letter lowercase, PascalCase capitalises it. Variables usually use camel, types and components use Pascal.",
      },
      {
        q: "Which case should a URL use?",
        a: "kebab-case. Hyphens are read as word separators by search engines, underscores are not.",
      },
    ],
  },
  {
    id: "readability-checker",
    name: "Readability Checker",
    slug: "readability-checker",
    description: "Score your writing and find the sentences slowing it down.",
    category: "student",
    icon: BookOpen,
    tags: ["readability", "flesch", "grade level", "writing", "essay", "clarity"],
    isNew: true,
    status: "live",
    localProcessing: true,
    addedAt: 29,
    seoTitle: "Readability Checker — Flesch Reading Ease & Grade Level",
    seoDescription:
      "Check Flesch Reading Ease and Flesch–Kincaid grade level, and see which sentences are dragging your writing down.",
    about: [
      {
        heading: "What the score measures",
        body: "Flesch Reading Ease combines average sentence length with average syllables per word. Higher is easier. It measures how hard the sentences are to process — not whether the argument is any good.",
      },
      {
        heading: "How to improve it",
        body: "Shorten the long sentences first; it moves the score more than anything else. Swapping a long word for a short one helps, but only when the short word means the same thing. Do not simplify past the point where you are saying what you mean.",
      },
    ],
    faq: [
      {
        q: "What score should I aim for?",
        a: "Around 60 to 70 is plain English and suits most readers. Academic writing usually lands in the 30s and that is expected — do not force an essay to read like a leaflet.",
      },
      {
        q: "Is the grade level about school years?",
        a: "It maps to US school grades, so 8 means roughly a 13-year-old could follow it. It is a rough guide, not a judgement on your reader.",
      },
    ],
  },
  {
    id: "hidden-text-scanner",
    name: "Hidden Text & Prompt Injection Scanner",
    slug: "hidden-text-scanner",
    description: "Find invisible characters and hidden instructions in text or PDFs.",
    category: "student",
    icon: ScanSearch,
    tags: ["hidden text", "prompt injection", "invisible", "unicode", "pdf", "security", "zero width"],
    popular: true,
    isNew: true,
    status: "live",
    localProcessing: true,
    addedAt: 30,
    seoTitle: "Hidden Text & Prompt Injection Scanner",
    seoDescription:
      "Check any document for invisible characters, unreadably small text and hidden instructions aimed at AI readers. Runs entirely in your browser.",
    about: [
      {
        heading: "What gets hidden in documents",
        body: "Text can be made invisible in several ways: zero-width Unicode characters that occupy no space, a font size so small it cannot be read, or text positioned outside the printable page. All three survive copy and paste, and all three are invisible when you read the document normally.",
      },
      {
        heading: "Why it matters now",
        body: "Hidden text is increasingly used to manipulate automated readers. A CV can carry an instruction telling a screening system to rate it highly; a submitted assignment can carry one telling a marking assistant to award full marks. If you run documents through any automated process, it is worth knowing what is actually in them.",
      },
      {
        heading: "Reading the result",
        body: "Findings are observations, not accusations. Zero-width joiners are perfectly normal in Arabic, Hindi and emoji. Directional marks are normal in any right-to-left language. What matters is whether the finding makes sense for the document in front of you.",
      },
    ],
    faq: [
      {
        q: "Does this prove someone cheated?",
        a: "No, and it should not be used that way. It reports what is present in the file. Several of the things it finds have entirely innocent explanations, which is why each finding explains itself rather than giving a score.",
      },
      {
        q: "Can it clean a document?",
        a: "It can strip invisible characters from text and give you the cleaned version to copy. Tiny or off-page text inside a PDF is reported but not removed, because removing it would mean rebuilding the file.",
      },
      {
        q: "Is my document uploaded?",
        a: "No. PDFs are parsed in your browser and text never leaves the tab. That matters here, because the documents people want to check are often confidential.",
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
