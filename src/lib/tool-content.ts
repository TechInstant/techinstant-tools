/**
 * The editorial content for each tool: the SEO overrides, the explanatory
 * "about" blocks and the FAQ.
 *
 * Deliberately kept out of `lib/tools.ts`. That module is imported by the
 * client-side search and the tools directory, so anything living in it ships to
 * every visitor's browser — and this prose is only ever rendered on the server,
 * into static HTML. Splitting it keeps roughly 70kB of text out of the bundle.
 *
 * Keyed by tool slug. A tool with no entry here simply renders without the
 * extra sections.
 */

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolContent {
  /** Overrides for the <title> / meta description. */
  seoTitle?: string;
  seoDescription?: string;
  /** Short explanatory copy shown under the tool (§24). */
  about?: { heading: string; body: string }[];
  faq?: ToolFaq[];
}

export const TOOL_CONTENT: Record<string, ToolContent> = {
  "merge-pdf": {
    seoDescription: "Merge PDF files into a single document in your browser. Free, fast and private — your files are never uploaded.",
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
  "split-pdf": {
    about: [
        { heading: "What splitting a PDF does", body: "Splitting pulls the pages you name out of a document and writes them to a new PDF, leaving the original untouched. It is how you send one chapter instead of a whole report, or strip a signature page off a contract before sharing it." },
        { heading: "Choosing pages", body: "Enter single pages, ranges, or both — 1-3, 5, 8-10. Pages come out in the order you list them, and duplicates are ignored, so you can reorder while you extract." },
      ],
    faq: [
        { q: "Does the original file change?", a: "No. The original stays exactly as it was on your device — a new file is created for the pages you chose." },
        { q: "Why does it say my page is out of range?", a: "The number you asked for is higher than the page count of the file you loaded. The tool shows the real page count next to the file name." },
      ],
  },
  "compress-pdf": {
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
    seoDescription: "Compress PDF files quickly with TechInstant Tools. Simple, fast and privacy-conscious PDF compression in your browser.",
  },
  "pdf-to-image": {
    about: [
        { heading: "Turning pages into pictures", body: "Each page you select is rendered at the resolution you choose and saved as a PNG or JPG. Useful for slide decks, for pasting a page into a document, or for sharing one page where a PDF would be awkward." },
        { heading: "PNG or JPG?", body: "PNG is lossless and handles text and line art crisply, which makes it the safer default. JPG produces much smaller files and suits pages that are mostly photographs." },
      ],
    faq: [
        { q: "What does the quality setting change?", a: "It sets the render scale. 2x renders each page at twice its natural size, which keeps small text legible when you zoom in. Higher settings produce larger files." },
        { q: "Can I convert just one page?", a: "Yes — put a single number in the pages field, or a mix like 1, 4, 9." },
      ],
  },
  "images-to-pdf": {
    about: [
        { heading: "Why put images in a PDF", body: "One PDF is easier to send, print and archive than a folder of photos, and it keeps your pages in a fixed order. This is the usual way to turn phone photos of a document back into something you can submit." },
        { heading: "Page size and fit", body: "A4 and US Letter place each image inside the page with a margin you choose, keeping the aspect ratio so nothing is stretched. Fit to image makes every page exactly the size of its picture instead, which avoids white borders." },
      ],
    faq: [
        { q: "Can I change the order?", a: "Yes. Drag a file, or use the arrows, and the PDF follows that order." },
        { q: "Which formats work?", a: "JPG and PNG. Both are embedded directly, so quality is not reduced when the page size is Fit to image." },
      ],
  },
  "image-compressor": {
    about: [
        { heading: "How image compression works", body: "JPG and WebP discard detail the eye is least likely to miss. Lowering quality removes more of it and makes the file smaller. There is no single right number — it depends on the picture and where it will be used." },
        { heading: "Picking a format", body: "WebP is usually 25 to 35 percent smaller than JPG at the same visual quality and is supported everywhere that matters now. JPG remains the safest for anything that will be opened by older software. PNG is lossless, so the quality slider does not apply to it." },
      ],
    faq: [
        { q: "What quality should I use?", a: "Around 70 percent is a good starting point for photos on the web. Compare the before and after previews and go lower until you can see the difference, then step back." },
        { q: "Is the original changed?", a: "No. Compression happens on a copy in your browser and you download the result — your file on disk is untouched." },
      ],
  },
  "image-resizer": {
    about: [
        { heading: "Resizing without distortion", body: "Changing width and height independently squashes a picture. Keeping the aspect ratio locked means setting one dimension and letting the other follow, so faces and shapes stay the right proportions." },
        { heading: "Making images smaller, not just look smaller", body: "Scaling an image down in a document only changes how it is displayed — the file is still full size. Resizing it properly, as this does, reduces the actual pixels and the file size with them." },
      ],
    faq: [
        { q: "Can I make an image bigger?", a: "You can, but enlarging invents pixels that were never captured, so the result looks soft. Going down in size is always cleaner than going up." },
        { q: "What size should a web image be?", a: "1920 pixels wide is plenty for a full-width banner. Anything inside an article rarely needs more than 1080." },
      ],
  },
  "image-converter": {
    about: [
        { heading: "When to convert", body: "Convert to WebP to cut page weight, to JPG when something old needs to open the file, and to PNG when you need lossless quality or a screenshot to stay crisp." },
        { heading: "What happens to transparency", body: "JPG has no transparency. Converting a transparent PNG to JPG flattens it onto white, which is usually what you want for a photo and rarely what you want for a logo — keep logos as PNG or WebP." },
      ],
    faq: [
        { q: "Does converting lose quality?", a: "Converting to PNG does not. Converting to JPG or WebP re-encodes the image, so some detail is lost — the quality slider controls how much." },
        { q: "Is WebP safe to use?", a: "Yes. Every current browser supports it. Keep a JPG copy only if you need to support software from before 2020." },
      ],
  },
  "image-cropper": {
    about: [
        { heading: "Cropping with intent", body: "Drag the corners to choose the area you want, or lock an aspect ratio first so the crop matches where it is going — 1:1 for a profile picture, 16:9 for a video thumbnail, 4:3 for print." },
        { heading: "Cropping is not resizing", body: "Cropping cuts pixels away at the edges. Resizing changes the whole image. Crop first to get the framing right, then resize if the result is still larger than you need." },
      ],
    faq: [
        { q: "What size will the result be?", a: "The button shows the exact pixel dimensions of your current selection before you commit to it." },
        { q: "Is the original affected?", a: "No. You download a new cropped file and the original stays as it was." },
      ],
  },
  "image-metadata": {
    about: [
        { heading: "What EXIF holds", body: "Cameras and phones write a block of data into the file: the model, the lens, exposure, ISO, the date, and often the exact GPS coordinates where the photo was taken. That data travels with the file when you send it." },
        { heading: "Why it is worth checking", body: "Sharing an original photo can reveal where you live or work without you realising. Most social networks strip this on upload, but files sent directly — by email, or as a document attachment — usually keep it." },
      ],
    faq: [
        { q: "My image shows no metadata. Is that a problem?", a: "No, it is normal and usually good. Screenshots have none, and most apps strip it when they save or share." },
        { q: "Can this remove the metadata?", a: "Not yet — it only shows you what is there. Re-saving a photo through the Image Converter drops most of it as a side effect." },
      ],
  },
  "json-formatter": {
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
  "json-minifier": {
    about: [
        { heading: "Why minify", body: "Whitespace in JSON is for people, not parsers. Removing it shrinks API payloads and config files with no change in meaning, which matters when the same response is sent thousands of times." },
        { heading: "What it does not change", body: "Minifying never alters your data — only the formatting between values. Run it back through the formatter and you get the original structure." },
      ],
    faq: [
        { q: "How much smaller will it get?", a: "Indented JSON usually shrinks by 20 to 50 percent. The tool shows the before, after and percentage saved." },
        { q: "Is minified JSON still valid?", a: "Yes. Any parser reads it identically." },
      ],
  },
  "base64": {
    about: [
        { heading: "What Base64 is for", body: "Base64 rewrites data using only letters, digits and a couple of symbols, so it can travel safely through systems that expect text — email bodies, JSON fields, data URLs and HTTP headers." },
        { heading: "It is not encryption", body: "Base64 is an encoding, not a cipher. Anyone can decode it in seconds. Never use it to protect a password, a token or anything private." },
      ],
    faq: [
        { q: "Why did my decode fail?", a: "The input is not valid Base64 — usually a stray space, a missing character, or padding that was trimmed when it was copied." },
        { q: "Does it handle emoji and accents?", a: "Yes. Text is converted through UTF-8 first, so £, café and emoji all round-trip correctly. Many Base64 tools break on these." },
      ],
  },
  "uuid-generator": {
    about: [
        { heading: "What a UUID is", body: "A 128-bit identifier written as 32 hexadecimal characters in five groups. Version 4 UUIDs are almost entirely random, which means two systems can create them independently and effectively never collide." },
        { heading: "Where they are used", body: "Database primary keys, request and trace identifiers, idempotency keys, file names — anywhere you need a unique value without asking a central service for one." },
      ],
    faq: [
        { q: "Are these random enough to rely on?", a: "Yes. They come from the browser cryptographic random number generator, not Math.random, which is what makes collisions negligible." },
        { q: "Should I use a UUID as a database key?", a: "It is convenient and avoids coordination, but random keys can fragment indexes on large tables. Worth checking against your workload before committing." },
      ],
  },
  "timestamp": {
    about: [
        { heading: "What a Unix timestamp is", body: "The number of seconds since 1 January 1970 UTC. It is a single number with no timezone attached, which is exactly why systems store time that way — the ambiguity is added only when it is displayed." },
        { heading: "Seconds or milliseconds", body: "Unix tools and most APIs use seconds. JavaScript uses milliseconds. A timestamp that decodes to 1970 usually means milliseconds were read as seconds, so switch the unit." },
      ],
    faq: [
        { q: "Why does the local time differ from UTC?", a: "Local time applies your machine timezone and any daylight saving. Both are shown so you can see the offset." },
        { q: "What is ISO 8601?", a: "The unambiguous text format, like 2026-01-31T14:05:00.000Z. The trailing Z means UTC. It is the safest format for storing or transmitting a date as text." },
      ],
  },
  "qr-generator": {
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
  "password-generator": {
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
  "word-counter": {
    about: [
        { heading: "What is counted", body: "Words are runs of characters separated by whitespace. Sentences are split on full stops, question marks and exclamation marks. Paragraphs are blocks separated by a blank line. Everything updates as you type." },
        { heading: "Reading time", body: "Estimated at about 225 words per minute, which is typical adult silent reading. Technical material reads slower, so treat it as a floor rather than a promise." },
      ],
    faq: [
        { q: "Does it count characters with or without spaces?", a: "Both are shown. Application forms and social limits usually mean with spaces, which is the larger of the two." },
        { q: "Is my text uploaded?", a: "No. Counting happens in your browser as you type and nothing is sent or saved." },
      ],
  },
  "percentage-calculator": {
    about: [
        { heading: "The three questions people actually ask", body: "What is X percent of Y, for discounts and tips. X is what percent of Y, for scores and shares. And how much something changed between two numbers, for growth and price rises." },
        { heading: "Percentage change catches people out", body: "Going up 50 percent then down 50 percent does not return you to the start. The second percentage applies to the new, larger number — which is why a 50 percent rise followed by a 50 percent fall leaves you 25 percent down." },
      ],
    faq: [
        { q: "How do I work out a discount?", a: "Use the first mode to find the discount amount, then subtract it. For 20 percent off 4,500, the discount is 900 and you pay 3,600." },
        { q: "Why is the increase mode blank?", a: "The starting value cannot be zero — there is no meaningful percentage change from nothing." },
      ],
  },
  "age-calculator": {
    about: [
        { heading: "Getting age right", body: "Age is not days divided by 365. This counts calendar years, then whole months, then the days left over, borrowing the real length of each month so February and leap years come out correctly." },
        { heading: "Any two dates", body: "Leave the second date as today for a current age, or change it to work out how old someone will be at a wedding, a deadline, or on a specific school cut-off date." },
      ],
    faq: [
        { q: "Does it handle leap years?", a: "Yes. Someone born on 29 February 2000 is 23 on 28 February 2024 and turns 24 the next day." },
        { q: "What is the total days figure?", a: "The exact number of days between the two dates, which is often what forms and visa applications actually ask for." },
      ],
  },
  "period-calculator": {
    seoTitle: "Period & Ovulation Calculator",
    seoDescription: "Estimate your next period dates and fertile window privately. Nothing is saved or uploaded — it all happens in your browser.",
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
  "due-date-calculator": {
    seoTitle: "Pregnancy Due Date Calculator",
    seoDescription: "Work out your estimated due date, current week and trimester. Private, free and calculated entirely in your browser.",
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
  "bmi-calculator": {
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
  "gpa-calculator": {
    seoTitle: "GPA & CGPA Calculator (5.0 and 4.0 scale)",
    seoDescription: "Calculate your semester GPA and cumulative CGPA on either the 5.0 or 4.0 scale, with class of degree. Free and private.",
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
  "meta-tag-generator": {
    seoTitle: "Meta Tag & Open Graph Generator",
    seoDescription: "Generate SEO meta tags, Open Graph and X/Twitter card markup with a live search-result preview. Copy straight into your head.",
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
  "citation-generator": {
    seoTitle: "Citation Generator — APA, MLA, Harvard, Chicago",
    seoDescription: "Generate correctly formatted references and in-text citations in APA 7, MLA 9, Harvard and Chicago. Free and private.",
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
  "grade-calculator": {
    seoTitle: "Grade Calculator — What Do I Need on the Final?",
    seoDescription: "Work out your current weighted grade and exactly what score you need on remaining assessments to hit your target.",
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
  "text-case-converter": {
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
  "readability-checker": {
    seoTitle: "Readability Checker — Flesch Reading Ease & Grade Level",
    seoDescription: "Check Flesch Reading Ease and Flesch–Kincaid grade level, and see which sentences are dragging your writing down.",
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
  "hidden-text-scanner": {
    seoTitle: "Hidden Text & Prompt Injection Scanner",
    seoDescription: "Check any document for invisible characters, unreadably small text and hidden instructions aimed at AI readers. Runs entirely in your browser.",
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
  "postpartum-guide": {
    seoTitle: "Postpartum Care Guide — Recovery Checklist After Birth",
    seoDescription: "An interactive postpartum recovery checklist covering the first weeks, your body, your mind and the symptoms that need medical help straight away.",
    about: [
        {
          heading: "Why the weeks after birth need their own checklist",
          body: "Almost all the attention goes on pregnancy and the birth itself, and then it stops. The weeks afterwards are when you are most tired, most likely to miss a symptom in yourself, and least able to go looking for information. A short list you can tick off beats searching at three in the morning.",
        },
        {
          heading: "How to use it",
          body: "Read it once while you are still pregnant so you know what is coming, then work through it afterwards. Tick what you have done, print it for a partner or whoever is helping you, and pay particular attention to the last section — those are the symptoms not to wait on.",
        },
        {
          heading: "What this is not",
          body: "It is general information, not a care plan. Recovery differs enormously, especially after a caesarean or a difficult birth, and your midwife, health visitor or doctor knows your circumstances. Where their advice differs from anything here, follow theirs.",
        },
      ],
    faq: [
        {
          q: "How long does recovery after birth actually take?",
          a: "Bleeding usually settles within two to six weeks, but feeling like yourself again commonly takes several months, and longer after a caesarean. There is no schedule you are supposed to keep to.",
        },
        {
          q: "When should I contact someone rather than wait?",
          a: "Heavy bleeding, fever, a hot or leaking wound, severe headache or vision changes, pain or swelling in one leg, chest pain, and any thought of harming yourself or the baby. All of these are reasons to make contact immediately, and none of them is wasting anyone's time.",
        },
        {
          q: "Is feeling low normal?",
          a: "Feeling tearful in the first week is very common and usually passes. If low mood deepens or lasts beyond two weeks, that may be postnatal depression — common, treatable, and much easier dealt with early.",
        },
        {
          q: "Is anything I tick saved?",
          a: "No. The ticks live in the page while it is open and are gone when you close it. Nothing is stored or sent anywhere, which is deliberate for a tool like this.",
        },
      ],
  },
  "pregnancy-shopping-list": {
    seoTitle: "Pregnancy Shopping List — Trimester Checklist You Can Print",
    seoDescription: "What you actually need in each trimester, plus the hospital bag and newborn essentials. Add your own items, tick, print, share, and search any store for what is left.",
    about: [
        {
          heading: "Why most baby lists are too long",
          body: "Shops have an obvious interest in a long list. In practice a newborn needs somewhere safe to sleep, something to wear, nappies, a way to feed, and a car seat if you travel by car. This list puts those first and marks the rest as what it is — useful, but not urgent.",
        },
        {
          heading: "How to use it",
          body: "It is grouped by trimester, so you only look at what is relevant now. Tick what you already have or have been given, add anything the list has missed, then pack the hospital bag section around 34 weeks. Copy it as text, print it to take shopping, or open a store search for everything still ticked.",
        },
        {
          heading: "Second-hand, with two exceptions",
          body: "Most of this can be borrowed or bought used and nobody will ever know. The exceptions are cot mattresses and car seats: buy those new, or only from someone you trust completely, because a mattress that no longer fits firmly and a seat that has been in a collision both matter.",
        },
      ],
    faq: [
        {
          q: "When should I start buying?",
          a: "Many people start in the second trimester and pack the hospital bag by around 34 weeks. There is no need to have everything early — almost anything can be bought or delivered after the birth.",
        },
        {
          q: "How many newborn clothes do I need?",
          a: "Fewer than you think, and not too many in newborn size — some babies outgrow it within weeks. Six or seven sleepsuits and vests is plenty to start with.",
        },
        {
          q: "What do people most often forget?",
          a: "Maternity pads in enough quantity, a long phone charging cable for the hospital, a nightlight for feeds, and meals in the freezer. The last one is the most appreciated.",
        },
        {
          q: "Can I add my own items?",
          a: "Yes. Anything you add joins your progress count, the text you copy and the printout, so the list ends up being yours rather than ours.",
        },
        {
          q: "How do the shopping links work?",
          a: "Pick Jumia or Amazon and each ticked item becomes an ordinary search link, assembled in your browser at the moment you click it. Your list is never sent to a retailer or to us, and we cannot see what you buy.",
        },
        {
          q: "Can I print or share the list?",
          a: "Both. Print it, copy it as plain text, or share the page by WhatsApp, Facebook, X or email. Sharing sends the page link only — never what you have ticked.",
        },
      ],
  },
  "ovulation-calculator": {
    seoTitle: "Ovulation Calculator — Fertile Window & Ovulation Day",
    seoDescription: "Estimate your ovulation day and fertile window from your cycle length and luteal phase. Private, works in your browser, nothing saved.",
    about: [
        {
          heading: "Why it counts backwards, not forwards",
          body: "The familiar “day 14” rule only holds for a textbook 28-day cycle. The luteal phase — ovulation to the next period — is much more consistent between people than the first half of the cycle, so counting back from your next expected period is more reliable than counting forward from your last one.",
        },
        {
          heading: "How to use it",
          body: "Enter the first day of your last period and your usual cycle length. Leave the luteal phase at 14 unless you have tracked it with temperature or tests. You get the estimated ovulation day, the fertile window around it, and the next three cycles.",
        },
        {
          heading: "What the fertile window means",
          body: "Sperm can survive around five days and the egg about a day, which is why the window opens before ovulation rather than on it. The two days before ovulation are usually the highest chance.",
        },
      ],
    faq: [
        {
          q: "How accurate is this?",
          a: "It is arithmetic on averages, not a measurement. Ovulation moves with stress, illness, travel and poor sleep, and counting days cannot tell you whether you actually ovulated. Ovulation tests, basal temperature or a scan can.",
        },
        {
          q: "Can I use this as contraception?",
          a: "No. Please do not. The window is an estimate and cycles vary month to month even when nothing is wrong. Speak to a pharmacist or doctor about contraception.",
        },
        {
          q: "My cycles are irregular — will it work?",
          a: "Much less well, and the more they vary the less the estimate means. If your cycles are consistently irregular it is worth raising with a doctor, as it often has a treatable cause.",
        },
        {
          q: "Is what I enter stored?",
          a: "No. The dates stay in the browser tab and are gone when you close it. Nothing is sent to a server or written to storage.",
        },
      ],
  },
  "water-intake-calculator": {
    seoTitle: "Water Intake Calculator — Daily Fluid Needs",
    seoDescription: "Estimate your daily fluid target from weight, activity level and climate, in litres, millilitres, fluid ounces or glasses.",
    about: [
        {
          heading: "Where the number comes from",
          body: "Around 30 to 35 ml per kilogram of body weight is the usual starting point for a healthy adult, with additions for exercise, heat and for pregnancy or breastfeeding. That is the calculation here, and every part of it is shown so you can see what is being added.",
        },
        {
          heading: "How to use it",
          body: "Enter your weight and pick your activity level and climate. The result counts all fluid, not just plain water — tea, coffee, milk and soup all contribute, and food supplies roughly a fifth of most people's intake on top.",
        },
        {
          heading: "A better guide than any calculator",
          body: "Thirst, and urine the colour of pale straw. If you are rarely thirsty and it is consistently pale, you are drinking enough, whatever the arithmetic says.",
        },
      ],
    faq: [
        {
          q: "Is it really eight glasses a day?",
          a: "That figure has no strong evidence behind it. Needs vary with body size, activity, heat and diet, which is why this asks about those rather than giving everyone the same answer.",
        },
        {
          q: "Does coffee count?",
          a: "Yes. The idea that caffeine dehydrates you does not hold at normal intakes — the fluid in a cup of coffee or tea more than covers its mild diuretic effect.",
        },
        {
          q: "Can you drink too much water?",
          a: "Yes, though it is uncommon. Drinking far more than you need over a short period can dangerously dilute blood sodium. Spread intake across the day rather than forcing large amounts at once.",
        },
        {
          q: "I have been told to limit fluids — should I use this?",
          a: "No. Kidney and heart conditions, and some medications, make a fixed target actively unsafe. Follow the limit you were given.",
        },
      ],
  },
  "calorie-calculator": {
    seoTitle: "Calorie & TDEE Calculator — BMR, Maintenance and Goals",
    seoDescription: "Calculate BMR with the Mifflin–St Jeor equation, your total daily energy expenditure, and calorie targets for losing or gaining weight.",
    about: [
        {
          heading: "BMR and TDEE are not the same number",
          body: "BMR is what your body uses at complete rest just staying alive. TDEE is that figure scaled for how much you actually move, and it is the one to eat to if you want to stay the same weight. Eating at BMR is a large deficit for almost everyone, which is a common and unhelpful mistake.",
        },
        {
          heading: "How to use it",
          body: "Enter age, height, weight and how active you genuinely are — most people overestimate this, so if in doubt pick the level below. You get BMR, maintenance calories, targets for losing or gaining, and an example macro split.",
        },
        {
          heading: "Which equation this uses",
          body: "Mifflin–St Jeor, which tracks measured resting expenditure more closely than the older Harris–Benedict equation. It only has two sex terms, so it cannot represent everyone; that is a limit of the available science rather than a choice made here.",
        },
      ],
    faq: [
        {
          q: "How accurate is a calculated BMR?",
          a: "It can be out by 10% or more for any individual. Body composition, medication and thyroid function all shift it. Treat the number as a starting point, then adjust based on what actually happens over a few weeks.",
        },
        {
          q: "Why is a 500 kcal deficit the usual advice?",
          a: "Roughly 7,700 kcal is a kilogram of body weight, so around 550 a day works out at about half a kilogram a week. Cutting much harder than that tends to cost muscle and rarely lasts.",
        },
        {
          q: "Are the macros prescriptive?",
          a: "No — it is one common split of many. Total calories matter far more than the ratio, and there is no single correct division.",
        },
        {
          q: "Can I use this for a child, or during pregnancy?",
          a: "No. Children, teenagers and pregnancy all need different guidance, and this equation is not valid for them. Ask a doctor or dietitian.",
        },
      ],
  },
  "invoice-generator": {
    seoTitle: "Free Invoice Generator — Download an Invoice PDF",
    seoDescription: "Build an invoice with line items, tax and totals, and download it as a PDF. No sign-up, no watermark, and nothing you type is uploaded.",
    about: [
        {
          heading: "What belongs on an invoice",
          body: "Who it is from and who it is to, a unique invoice number, the date it was issued and the date payment is due, a line for each thing you are charging for, the tax if you charge any, and the total. Bank or payment details in the notes save your client having to ask.",
        },
        {
          heading: "How to use it",
          body: "Fill in your details and your client's, add a line per item with quantity and unit price, and the totals update as you type. Set a tax rate if you need one, then download the PDF. Keep the invoice numbers sequential so your records stay easy to follow.",
        },
        {
          heading: "Getting paid faster",
          body: "State the due date rather than “30 days”, put the payment method in the notes, and send it the day the work finishes. Most late payments are late because the invoice arrived late or was unclear about where the money should go.",
        },
      ],
    faq: [
        {
          q: "Is there a watermark or a sign-up?",
          a: "Neither. The PDF is yours, unbranded, and you do not need an account.",
        },
        {
          q: "Are my client's details sent anywhere?",
          a: "No. The PDF is built in your browser, so the names, amounts and addresses never leave your device.",
        },
        {
          q: "Can I use a currency other than the naira?",
          a: "Yes — the currency field takes whatever you type. A few symbols cannot be drawn by the PDF's built-in fonts, in which case use the currency code instead, such as NGN, USD or EUR.",
        },
        {
          q: "Is this invoice legally valid?",
          a: "An invoice is valid on its content, not its design, and this includes the fields normally required. Tax rules differ by country though, so check what your own tax authority expects — particularly around tax registration numbers.",
        },
      ],
  },
  "receipt-generator": {
    seoTitle: "Free Receipt Generator — Download a Receipt PDF",
    seoDescription: "Create a receipt for a payment you have received and download it as a PDF. Free, no sign-up, and built entirely in your browser.",
    about: [
        {
          heading: "A receipt is not an invoice",
          body: "An invoice asks for money; a receipt confirms it has been paid. If you have been paid in cash or by transfer and the customer wants proof, a receipt is what they are asking for — it records what was bought, how much was paid, and how.",
        },
        {
          heading: "How to use it",
          body: "Enter who the payment came from, what it was for, and how it was paid. The document is marked as paid and downloads as a PDF you can print or email. Give each receipt its own number so you can match it against your records later.",
        },
        {
          heading: "Keep your copy",
          body: "Issue one and keep one. If you are ever asked to account for income, a numbered run of receipts with no gaps is far easier to explain than a folder of bank entries.",
        },
      ],
    faq: [
        {
          q: "Can I use this for a cash payment?",
          a: "Yes, and that is the most common reason people need one. Put “Cash” in the paid-with field.",
        },
        {
          q: "Does it work as a tax record?",
          a: "It is a normal receipt and serves as a record of what you were paid. What your tax authority requires you to keep varies by country, so check locally, especially if you are registered for VAT or a sales tax.",
        },
        {
          q: "Is anything uploaded?",
          a: "No. The receipt is generated in your browser and the details never leave your device.",
        },
      ],
  },
  "business-card-maker": {
    seoTitle: "Free Business Card Maker — Print-Ready PNG & PDF",
    seoDescription: "Design a business card in your browser and download it at 300 DPI as a PNG or a print PDF. Four clean styles, no sign-up, no watermark.",
    about: [
        {
          heading: "What makes a card work",
          body: "A card has one job: make it easy to contact you. Name, what you do, and two or three ways to reach you. Cards fail by being crowded — every extra line makes the important ones harder to find.",
        },
        {
          heading: "How to use it",
          body: "Type your details and the preview updates as you go. Pick one of the four styles, then download either the PNG for digital use or the print PDF. Both export at the standard 3.5 × 2 inch size at 300 DPI, which is what a print shop expects.",
        },
        {
          heading: "Before you send it to print",
          body: "Ask your printer whether they want bleed. If they do, they will usually ask for an extra 3mm around the edge, so send them the PDF and let them add it rather than guessing. And read your phone number and email out loud from the preview — it is the single most common expensive mistake.",
        },
      ],
    faq: [
        {
          q: "What resolution does it export at?",
          a: "300 DPI — 1050 × 600 pixels for a standard 3.5 × 2 inch card. That is high enough for commercial printing.",
        },
        {
          q: "Can I add my logo?",
          a: "Not yet. The current styles use your company name as the visual element, including its initials. Logo upload is on the list.",
        },
        {
          q: "Is my information uploaded?",
          a: "No. The card is drawn on a canvas in your browser and the file is saved straight to your device.",
        },
        {
          q: "PNG or PDF for printing?",
          a: "Send the PDF if your printer accepts one, since it carries the exact physical size. The PNG is better for email signatures, messaging apps and anywhere it will be viewed on screen.",
        },
      ],
  },
  "certificate-generator": {
    seoTitle: "Free Certificate Generator — Templates, Logo, Signature & Batch",
    seoDescription: "Design a certificate with six templates, your own fonts, colours, logo, signature and QR code. Export PDF, PNG or JPEG, or batch-generate a whole cohort from a CSV into one ZIP.",
    about: [
        {
          heading: "What a certificate needs to say",
          body: "Who earned it, what they did, who says so, and when. A reference number is worth adding if anyone might need to verify it later — it turns the certificate from a decoration into a record you can look up, and the QR code can point straight at that record.",
        },
        {
          heading: "How to use it",
          body: "Pick one of the six templates, set the wording, then adjust the font, size and colours until it looks like yours. Add a logo, sign with your mouse or upload a scanned signature, and switch the QR code on if you want it verifiable. The preview is the real thing at full resolution, so what you see is exactly what exports.",
        },
        {
          heading: "Issuing a whole cohort at once",
          body: "Batch generation takes a CSV with one row per person and returns every certificate in a single ZIP. Only a Name column is required; Achievement, Reference, Date and Organisation override the settings per row when present, so a mixed list of courses works from one file. Save a preset first and next term's batch takes seconds.",
        },
      ],
    faq: [
        {
          q: "What size is the certificate?",
          a: "A4 landscape at 300 DPI, which prints on standard paper anywhere outside North America and will also print on US Letter with slightly larger margins.",
        },
        {
          q: "Can I add my own logo?",
          a: "Yes. PNG, JPG, WebP, GIF and SVG all work, and you can place it left, centred or right — or inside the header band on the Corporate template. It is converted in your browser and never uploaded.",
        },
        {
          q: "Can I add a real signature?",
          a: "Two ways. Draw one directly with a mouse, trackpad or finger, or photograph a signature on white paper and upload it — the white background is removed automatically so it sits on the page like ink rather than as a grey box.",
        },
        {
          q: "How does batch generation work?",
          a: "Import a CSV and it renders one certificate per row using the same drawing code as the preview, then bundles them into a ZIP. Everything happens in your browser, so a list of real names never leaves your device — which is the whole point for a class or staff list.",
        },
        {
          q: "Which fonts are available?",
          a: "Poppins, Playfair Display, Montserrat, Merriweather, Lato and Cormorant Garamond. They are served from this site rather than from Google, so choosing one does not make a third-party request.",
        },
        {
          q: "Will a long name still fit?",
          a: "Yes. The name is measured and the type size reduced until it fits the page, so it will not run off the edge however long it is.",
        },
        {
          q: "Is anything sent to a server?",
          a: "No. Rendering, PDF, PNG, JPEG and the ZIP are all built in the browser, so recipients' names stay on your device.",
        },
      ],
  },
  "ip-location-checker": {
    seoTitle: "IP Location Checker — Find the Location of an IP Address",
    seoDescription: "Check the approximate city, country, time zone and network behind any IP address, or look up your own. Uses a third-party geolocation service.",
    about: [
        {
          heading: "This one needs the network",
          body: "Nearly every tool here runs entirely on your device. This one cannot: the mapping from IP addresses to places lives in databases maintained by other companies. When you press Look up, your browser contacts a third-party geolocation provider, which means your IP address is sent to them.",
        },
        {
          heading: "How to use it",
          body: "Leave the box empty and press Look up to see what the internet sees when you connect. Or type any IP address — a server you are debugging, or one from a log file — to see where that network is registered.",
        },
        {
          heading: "How accurate is it, really",
          body: "It identifies the network you connect through, not you. City-level accuracy is usually reasonable on home broadband and often wrong on mobile data, company VPNs and satellite connections, sometimes by an entire country. It never gives a street address, and it cannot identify a person or a device.",
        },
      ],
    faq: [
        {
          q: "Does this tool send my IP address anywhere?",
          a: "Yes, and that is unavoidable for this kind of lookup. The request goes from your browser to a third-party geolocation provider (ipwho.is, falling back to ipapi.co), and your IP is part of that request. We do not store or see the result.",
        },
        {
          q: "Can an IP address find someone's home?",
          a: "No. It locates the network's registration, typically to a city or region. Only the person's internet provider can connect an address to a subscriber, and they release that only to a court or the police.",
        },
        {
          q: "Why is my location wrong?",
          a: "Usually a VPN, a mobile network routing through a distant hub, or a provider whose address range is registered elsewhere. The database is describing the network, and the network genuinely is somewhere else.",
        },
        {
          q: "Can I look up a website instead of an IP?",
          a: "Not directly — the box takes an IP address. A domain has to be resolved to an IP first, which a browser cannot do on its own.",
        },
      ],
  },
  "slug-generator": {
    seoTitle: "URL Slug Generator — Clean Permalinks From Any Title",
    seoDescription: "Convert titles into safe URL slugs, with accent transliteration, filler-word removal and a length limit. Paste a list to slug them all at once.",
    about: [
        {
          heading: "What makes a good slug",
          body: "Short, lowercase, hyphen-separated, and still readable as the title. Hyphens rather than underscores, because search engines treat a hyphen as a word break and an underscore as a joiner. And once a slug is published, changing it breaks every link to it — so get it right first.",
        },
        {
          heading: "How to use it",
          body: "Paste a title and the slug appears. Paste several lines and each gets its own, with repeats numbered so two pages never end up fighting over one URL. Accented letters are transliterated rather than stripped, so “café” becomes “cafe” instead of “caf”.",
        },
        {
          heading: "Filler words",
          body: "Removing “a”, “the”, “of” and similar shortens a slug without losing meaning, and it is worth doing on a long title. It is off by default because it can also make a slug read oddly, and a slug nobody can read is worse than a slightly long one.",
        },
      ],
    faq: [
        {
          q: "Should I use hyphens or underscores?",
          a: "Hyphens. Google treats a hyphen as a word separator and an underscore as part of the word, so “blue_widget” can be read as one term rather than two.",
        },
        {
          q: "How long should a slug be?",
          a: "Short enough to read in a search result — around 60 characters is a sensible ceiling. The limit here cuts at a word boundary rather than mid-word.",
        },
        {
          q: "What happens to non-Latin text?",
          a: "Accented Latin characters are transliterated. Scripts with no Latin equivalent, like Chinese or Arabic, cannot be meaningfully converted, so you will need to supply your own slug for those titles.",
        },
      ],
  },
  "color-contrast-checker": {
    seoTitle: "Colour Contrast Checker — WCAG AA & AAA Ratio",
    seoDescription: "Check the contrast ratio between two colours against every WCAG 2.2 level, see it on real text, and get the nearest passing colour.",
    about: [
        {
          heading: "What the ratio means",
          body: "Contrast ratio compares the relative luminance of two colours, from 1:1 (identical) to 21:1 (black on white). WCAG asks for 4.5:1 for body text, 3:1 for large text and for interface components like borders and icons, and 7:1 for the enhanced AAA level.",
        },
        {
          heading: "How to use it",
          body: "Set your text and background colours and the ratio updates, shown on real text at three sizes so you can judge it as well as measure it. If it fails, the nearest passing colour in the same hue is offered — lightened or darkened only as far as it has to be.",
        },
        {
          heading: "Where ratios stop helping",
          body: "A passing ratio can still be hard to read in a thin weight, a decorative typeface or at a small size. Text over a photograph needs checking against its lightest and darkest areas, not an average. And dark mode is a different pair of colours, so check it separately.",
        },
      ],
    faq: [
        {
          q: "What counts as large text?",
          a: "18pt and above, or 14pt and above if it is bold — roughly 24px and 18.66px. Large text only needs 3:1 for AA.",
        },
        {
          q: "Do icons and borders need to pass?",
          a: "Yes, at 3:1. That is the requirement people most often miss — a pale grey input border or a low-contrast focus ring fails it, and the focus ring in particular matters for anyone navigating by keyboard.",
        },
        {
          q: "Is AAA worth aiming for?",
          a: "It is a real improvement for anyone with low vision, but it heavily constrains your palette. AA is the level most regulations reference; treat AAA as a goal for body text where you can manage it.",
        },
        {
          q: "Why does your figure differ from another tool's?",
          a: "Usually because the other tool skipped the sRGB transfer curve when computing luminance. This one follows the WCAG formula, including the 0.03928 branch that trips up hand-rolled implementations.",
        },
      ],
  },
  "favicon-generator": {
    seoTitle: "Favicon Generator — Every Size, Plus the HTML and Manifest",
    seoDescription: "Upload one image and get all six favicon sizes, a web manifest and the head snippet, bundled in a ZIP. Runs entirely in your browser.",
    about: [
        {
          heading: "Which sizes you actually need",
          body: "Six: 16 and 32 for browser tabs, 48 for Windows shortcuts, 180 for the iOS home screen, and 192 and 512 for Android and PWA installs. The long lists of twenty-odd sizes you sometimes see are catering to browsers nobody uses any more.",
        },
        {
          heading: "How to use it",
          body: "Drop in a square image, ideally 512×512 or larger. Adjust the crop, padding and corner rounding, check the small sizes in the preview — 16×16 is unforgiving and detail disappears — then download everything as a ZIP with the manifest and head snippet included.",
        },
        {
          heading: "Transparency and dark mode",
          body: "A transparent icon shows the browser's own tab colour behind it, which can make a dark logo effectively invisible in dark mode. If your mark is one dark colour, give it a solid background rather than relying on transparency.",
        },
      ],
    faq: [
        {
          q: "Do I still need a .ico file?",
          a: "Not for any current browser — PNG favicons are supported everywhere. A root-level favicon.ico is only worth adding if you must support very old Internet Explorer.",
        },
        {
          q: "Why is my old favicon still showing?",
          a: "Browser caching, not a mistake on your part. Favicons are cached very aggressively. A hard reload, or opening the site in a private window, will show you the real state.",
        },
        {
          q: "Where do the files go?",
          a: "At the root of your site, so they sit at /favicon-32x32.png and so on. Then paste the head snippet into your HTML.",
        },
        {
          q: "Is my logo uploaded?",
          a: "No. Every size is rendered on a canvas in your browser and the ZIP is assembled there too, so an unreleased logo never leaves your device.",
        },
      ],
  },
  "lorem-ipsum-generator": {
    seoTitle: "Lorem Ipsum Generator — Latin or Plain English Placeholder Text",
    seoDescription: "Generate paragraphs, sentences, words or list items of placeholder text, optionally wrapped in HTML tags. Latin or readable English.",
    about: [
        {
          heading: "Why placeholder text at all",
          body: "Latin filler stops people reading the words and lets them see the layout, which is the whole point during design. The trade-off is that it hides real problems: a heading that only works at four words, or a language that runs 30% longer than English.",
        },
        {
          heading: "How to use it",
          body: "Pick what you need — paragraphs, sentences, words or list items — and how many. Switch on HTML wrapping to get tags you can paste straight into a template, and use Shuffle for a different arrangement of the same settings.",
        },
        {
          heading: "The plain English option",
          body: "Latin makes it hard to judge whether a layout reads well, and impossible to show a client. The English filler here is ordinary readable prose with a realistic mix of sentence lengths, which is usually the better choice once a design is being reviewed by anyone else.",
        },
      ],
    faq: [
        {
          q: "Does the Latin mean anything?",
          a: "Not really. It comes from a scrambled passage of Cicero, and it has been deliberately corrupted for centuries, so it reads as Latin without being readable Latin.",
        },
        {
          q: "Why does the text stay the same as I change the count?",
          a: "The output is generated from a fixed seed so it does not churn on every keystroke. Press Shuffle when you want a genuinely different passage.",
        },
        {
          q: "Should I ship a site with lorem ipsum in it?",
          a: "No — it gets forgotten and published far more often than anyone expects, and it tells search engines nothing. Replace it before launch, and search your templates for “lorem” as a final check.",
        },
      ],
  },
  "url-encoder": {
    seoTitle: "URL Encoder & Decoder — Percent Encoding Done Right",
    seoDescription: "Encode or decode URLs and query values, choose between component and full-URL scope, and see any URL broken into its protocol, host, path and parameters.",
    about: [
        {
          heading: "Component or full URL — the choice that matters",
          body: "encodeURIComponent escapes the structural characters / ? : @ & = + $ #, which is correct for a single query value or path segment. encodeURI leaves them alone, which is correct for a whole URL. Using the wrong one is the single most common URL bug: encode a full URL as a component and it breaks; encode a query value as a full URI and a stray & silently splits your parameter in two.",
        },
        {
          heading: "How to use it",
          body: "Paste your text, pick encode or decode, and pick the scope. If what you paste looks like a URL, it is also broken down into protocol, host, path, fragment and each query parameter — which is usually faster than reading a long encoded string by eye.",
        },
        {
          heading: "When decoding fails",
          body: "A percent sign that is not followed by two hex digits is not valid encoding, and the browser refuses it rather than guessing. That usually means the text was never encoded, or was encoded twice — try encoding instead and compare.",
        },
      ],
    faq: [
        {
          q: "Why does a space sometimes become + and sometimes %20?",
          a: "%20 is correct percent-encoding. The + convention comes from HTML form submission (application/x-www-form-urlencoded) and only applies in a query string. Inside a path, a + is a literal plus sign.",
        },
        {
          q: "What is double encoding?",
          a: "Encoding text that was already encoded, so % becomes %25 and %20 becomes %2520. The usual sign is a URL full of %25. Decode it twice to recover the original.",
        },
        {
          q: "Is it safe to paste a URL with a token in it?",
          a: "Yes. Everything is computed in your browser with the built-in encoding functions — nothing is sent anywhere, which is the point of doing this locally rather than on a server.",
        },
      ],
  },
  "robots-txt-generator": {
    seoTitle: "robots.txt Generator — Crawl Rules, Sitemap and AI Opt-Out",
    seoDescription: "Build a valid robots.txt from presets or your own rules, add your sitemap, and optionally block the known AI training crawlers.",
    about: [
        {
          heading: "What robots.txt does and does not do",
          body: "It asks well-behaved crawlers not to fetch certain paths. It is not access control: the file is public, anyone can read it, and it cannot stop a crawler that ignores it. Never use it to point at anything you actually need kept private — you have just published the location.",
        },
        {
          heading: "How to use it",
          body: "Start from a preset, add or remove rules, and drop in your sitemap URL. The one-click common blocks cover the paths almost nobody wants indexed. The file must sit at the very root of your domain, and each subdomain needs its own.",
        },
        {
          heading: "Blocking is not the same as hiding",
          body: "A page blocked in robots.txt can still appear in search results if other sites link to it, because the crawler is not allowed in to read your noindex tag. If you want a page kept out of results, allow the crawl and use a noindex meta tag instead.",
        },
      ],
    faq: [
        {
          q: "Can I block AI training crawlers?",
          a: "You can ask them not to crawl, and the tool adds rules for GPTBot, ClaudeBot, Google-Extended, CCBot and others. It is a request that well-behaved crawlers honour, not a barrier, and it does not affect your normal search ranking.",
        },
        {
          q: "Does Crawl-delay work?",
          a: "Google ignores it entirely. Bing and Yandex honour it. Only set it if a crawler is genuinely overloading your server, because slowing crawling also slows how fast new pages get discovered.",
        },
        {
          q: "Where exactly does the file go?",
          a: "At the root: example.com/robots.txt. It has no effect in a subfolder, and rules do not carry across subdomains — blog.example.com needs its own file.",
        },
        {
          q: "How do I check it is working?",
          a: "Fetch it in a browser first to confirm it is being served as plain text. Then use the robots.txt report in Google Search Console, which will show you how Google is actually interpreting your rules.",
        },
      ],
  },
  "study-timer": {
    seoTitle: "Study Timer — Pomodoro Focus Timer With Breaks",
    seoDescription: "A focus timer that cycles work and break sessions, counts your completed rounds, and keeps accurate time even in a background tab.",
    about: [
        {
          heading: "How the method works",
          body: "Work in a fixed block, stop when it ends, take a real break, repeat — with a longer break after several rounds. The discipline that makes it work is stopping in both directions: not pushing through the break, and not abandoning the block five minutes in.",
        },
        {
          heading: "How to use it",
          body: "Press start. The timer moves through focus and break phases on its own, chimes at each change, and shows your completed sessions. Adjust the lengths to suit the work — 25 and 5 is the classic, but 50 and 10 suits anything that takes a while to get into.",
        },
        {
          heading: "Why it stays accurate in a background tab",
          body: "Browsers throttle timers in tabs you are not looking at, which makes a counting timer drift badly. This one measures against the clock instead, so switching away for twenty minutes does not cost you twenty minutes of countdown.",
        },
      ],
    faq: [
        {
          q: "Is 25 minutes the right length?",
          a: "It is a good default, not a rule. If 25 minutes keeps cutting you off mid-thought, use longer blocks. If you cannot start at all, use shorter ones — ten minutes you actually begin beats twenty-five you keep postponing.",
        },
        {
          q: "Does it keep running if I switch tabs?",
          a: "Yes, and the countdown stays accurate because it is measured against the wall clock. The tab title shows the remaining time so you can see it without switching back.",
        },
        {
          q: "Can I turn the sound off?",
          a: "Yes, with the speaker button. The chime is synthesised in the browser rather than loaded as a file, so muting it means no sound is produced at all.",
        },
        {
          q: "Does it remember my sessions?",
          a: "No. Nothing is stored, so refreshing the page starts the count again. That is deliberate — it is a timer, not a tracker.",
        },
      ],
  },
  "random-picker": {
    seoTitle: "Random Picker — Draw a Name, Shuffle, or Split Into Teams",
    seoDescription: "Pick winners from a list, shuffle an order, split a group into balanced teams, or generate a random number. Uses a cryptographic random source.",
    about: [
        {
          heading: "Four things in one",
          body: "Pick one or several from a list, shuffle a list into a running order, split a group into balanced teams, or get a random number in a range. All of them from the same list of names, so you do not have to retype it.",
        },
        {
          heading: "How to use it",
          body: "Paste names one per line or separated by commas. For a multi-round draw, leave “remove after picking” on and each name can only win once. Team splitting deals round-robin from a shuffled list, so the teams always end up within one person of each other.",
        },
        {
          heading: "Why the randomness matters",
          body: "Draws use your browser's cryptographic random source with rejection sampling, and shuffling uses Fisher–Yates. Together that means every outcome is genuinely equally likely — which matters when someone is going to question the result.",
        },
      ],
    faq: [
        {
          q: "Is this actually fair?",
          a: "Yes. It uses crypto.getRandomValues rather than Math.random, and rejects values that would make low numbers slightly more likely. The shuffle is Fisher–Yates, which is the only common shuffle that is uniform.",
        },
        {
          q: "Can I run a draw with several winners?",
          a: "Two ways: ask for several at once, or keep “remove after picking” on and press Pick repeatedly to draw them one at a time with a reveal between each.",
        },
        {
          q: "How are uneven teams handled?",
          a: "Names are dealt round-robin from a shuffled list, so with 10 people across 3 teams you get 4, 3 and 3 — never 6, 2 and 2.",
        },
        {
          q: "Is my list saved?",
          a: "No. It stays in the page and is gone on refresh. Nothing is sent anywhere, so a list of real names or pupils stays on your device.",
        },
      ],
  },
  "prompt-generator": {
    seoTitle: "AI Prompt Generator — Build a Structured Prompt",
    seoDescription: "Assemble a clear prompt from role, task, context, format and constraints, with a token estimate. Nothing is sent to any AI service.",
    about: [
        {
          heading: "Why structure beats phrasing",
          body: "Most disappointing AI answers come from a prompt that left out the task's actual constraints, not from the wrong wording. Separating role, task, context, requirements and format forces those gaps into the open before you send it.",
        },
        {
          heading: "How to use it",
          body: "Fill in what you have — only the task is required — and the prompt assembles as you type. Copy it and paste it into whichever assistant you use. The token estimate tells you roughly whether you are near a context limit.",
        },
        {
          heading: "The two options worth leaving on",
          body: "“Ask me before assuming anything” turns a confidently wrong answer into a question, which is almost always cheaper. A single example of a good answer moves output quality more than any amount of extra instruction, so fill that field in if you possibly can.",
        },
      ],
    faq: [
        {
          q: "Does this tool call an AI model?",
          a: "No. It is a writing aid with no API key and no model behind it. Nothing you type on this page is sent anywhere — you copy the finished prompt and use it wherever you like.",
        },
        {
          q: "Will this work with ChatGPT, Claude and Gemini?",
          a: "Yes. The structure it produces is plain text with markdown headings, which every current assistant handles well.",
        },
        {
          q: "How accurate is the token count?",
          a: "It is an estimate, based on roughly four characters per token for English. Real tokenisation varies by model and is worse for code and for non-English text, so treat it as a rough guide.",
        },
        {
          q: "Should I always give it a role?",
          a: "No. A role helps when the task needs a particular lens — a lawyer and a copywriter would answer the same question differently. For a straightforward task it adds nothing.",
        },
      ],
  },
  "prompt-library": {
    seoTitle: "AI Prompt Library — Templates for Writing, Code and Study",
    seoDescription: "A searchable library of prompt templates for writing, code review, debugging, learning and work, each editable and ready to copy.",
    about: [
        {
          heading: "What is here",
          body: "Twelve templates across writing, thinking, code, learning and work — the kinds of request people make repeatedly and get mediocre results from. Each one is written to produce something usable on the first attempt rather than after three rounds of clarification.",
        },
        {
          heading: "How to use it",
          body: "Search or filter, open a template, and replace the [BRACKETED] placeholders with your own details. You can edit the text in place before copying, and reset it back to the original at any time. Leaving the placeholders in is the main reason a template stops working.",
        },
        {
          heading: "What makes these different",
          body: "They tell the model what not to do as well as what to do — do not invent statistics, do not soften the critique, do not comment on formatting. Negative constraints are usually what separates a template that works from one that reads well and produces mush.",
        },
      ],
    faq: [
        {
          q: "Does this page send anything to an AI?",
          a: "No. It is a library of text. Nothing here calls a model, so anything you paste into a template while editing it stays in your browser.",
        },
        {
          q: "Can I edit the templates?",
          a: "Yes — edit any of them in place before copying, and reset to the original whenever you want. Edits last for the session and are not saved.",
        },
        {
          q: "Why square brackets for the placeholders?",
          a: "They are impossible to miss, so you notice one you forgot to fill in. It is worth scanning for a stray bracket before you send the prompt.",
        },
        {
          q: "Is there a template for rewriting AI text to sound human?",
          a: "No, and that is deliberate. Tools whose purpose is to pass AI or copied work off as your own are not something we build — the study tools here are for doing the work, not disguising it.",
        },
      ],
  },
};

export const getToolContent = (slug: string): ToolContent =>
  TOOL_CONTENT[slug] ?? {};
