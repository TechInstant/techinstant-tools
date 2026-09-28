/**
 * Draws a certificate onto a canvas.
 *
 * Kept separate from the UI for two reasons: batch generation runs the exact
 * same code path as the single preview (so a batch can never look different
 * from what you approved on screen), and the layout maths stays testable.
 *
 * Everything is laid out in PostScript points on an A4 landscape page, then
 * scaled by `PT` for output. That means a font size of 16 really is 16pt when
 * printed, which is what the size control is promising.
 */

export const PAGE_W = 842; // A4 landscape, points
export const PAGE_H = 595;
export const DPI = 300;
export const PT = DPI / 72;

export const CANVAS_W = Math.round(PAGE_W * PT); // 3508
export const CANVAS_H = Math.round(PAGE_H * PT); // 2479

export type LogoPlacement = "left" | "center" | "right";

export interface CertificateConfig {
  template: string;

  title: string;
  recipient: string;
  body: string;
  organisation: string;
  dateLabel: string;
  signatory: string;
  signatoryRole: string;
  reference: string;

  fontFamily: string;
  fontWeightRegular: number;
  fontWeightBold: number;
  fontSize: number;
  fontColor: string;
  accentColor: string;

  showFrame: boolean;
  logo: CanvasImageSource | null;
  logoAspect: number;
  logoPlacement: LogoPlacement;
  signature: CanvasImageSource | null;
  signatureAspect: number;
  qr: CanvasImageSource | null;
}

/** Applies an alpha to a #rrggbb colour, for muted secondary text. */
export function withAlpha(hex: string, alpha: number) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Perceived brightness, used to pick readable text over a coloured band. */
function isLight(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

/** Initials for the seal, e.g. "Northline Academy" → "NA". */
export function sealInitials(organisation: string) {
  return (
    organisation
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 3) || "★"
  );
}

interface Palette {
  ink: string;
  accent: string;
  muted: string;
  faint: string;
}

export interface CertTemplate {
  id: string;
  name: string;
  description: string;
  /** Where the flowing content begins, in points from the top. */
  contentTop: number;
  /** Title is reversed out of a solid band instead of flowing with the text. */
  titleInBand?: boolean;
  /** Logo is drawn inside that band. */
  logoInBand?: boolean;
  /** Content is nudged right to clear a left-edge bar. */
  leftInset?: number;
  /** Whether the frame toggle starts on for this template. */
  frameByDefault: boolean;
  /** Decoration drawn before any text. */
  decorate: (
    ctx: CanvasRenderingContext2D,
    cfg: CertificateConfig,
    p: Palette
  ) => void;
}

const BAND_H = 104;

/** A diamond, used as a corner ornament. */
function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
  ctx.fill();
}

const doubleFrame = (
  ctx: CanvasRenderingContext2D,
  p: Palette,
  outer = 22,
  gap = 10,
  weight = 2.5
) => {
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = weight;
  ctx.strokeRect(outer, outer, PAGE_W - outer * 2, PAGE_H - outer * 2);
  ctx.strokeStyle = p.faint;
  ctx.lineWidth = 0.8;
  ctx.strokeRect(
    outer + gap,
    outer + gap,
    PAGE_W - (outer + gap) * 2,
    PAGE_H - (outer + gap) * 2
  );
};

export const CERT_TEMPLATES: CertTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Double border, centred seal. The certificate most people picture.",
    contentTop: 64,
    frameByDefault: true,
    decorate: (ctx, cfg, p) => {
      if (cfg.showFrame) doubleFrame(ctx, p);
    },
  },
  {
    id: "minimal",
    name: "Modern minimal",
    description: "No border, a single accent bar down the left edge.",
    contentTop: 78,
    leftInset: 10,
    frameByDefault: false,
    decorate: (ctx, cfg, p) => {
      ctx.fillStyle = p.accent;
      ctx.fillRect(0, 0, 16, PAGE_H);
      if (cfg.showFrame) {
        ctx.strokeStyle = p.faint;
        ctx.lineWidth = 0.8;
        ctx.strokeRect(38, 26, PAGE_W - 64, PAGE_H - 52);
      }
    },
  },
  {
    id: "corporate",
    name: "Corporate header",
    description: "Solid colour band across the top with the title reversed out of it.",
    contentTop: BAND_H + 42,
    titleInBand: true,
    logoInBand: true,
    frameByDefault: false,
    decorate: (ctx, cfg, p) => {
      ctx.fillStyle = p.accent;
      ctx.fillRect(0, 0, PAGE_W, BAND_H);
      ctx.fillStyle = withAlpha(p.accent, 0.12);
      ctx.fillRect(0, BAND_H, PAGE_W, 5);
      if (cfg.showFrame) {
        ctx.strokeStyle = p.faint;
        ctx.lineWidth = 0.8;
        ctx.strokeRect(26, BAND_H + 18, PAGE_W - 52, PAGE_H - BAND_H - 44);
      }
    },
  },
  {
    id: "ornate",
    name: "Ornate",
    description: "Double border with corner brackets and diamonds. Formal awards.",
    contentTop: 68,
    frameByDefault: true,
    decorate: (ctx, cfg, p) => {
      doubleFrame(ctx, p, 20, 12, 2);
      const inset = 32;
      const arm = 34;
      ctx.strokeStyle = p.accent;
      ctx.lineWidth = 2;
      const corners: [number, number, number, number][] = [
        [inset, inset, 1, 1],
        [PAGE_W - inset, inset, -1, 1],
        [inset, PAGE_H - inset, 1, -1],
        [PAGE_W - inset, PAGE_H - inset, -1, -1],
      ];
      for (const [x, y, dx, dy] of corners) {
        ctx.beginPath();
        ctx.moveTo(x + dx * arm, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + dy * arm);
        ctx.stroke();
        ctx.fillStyle = p.accent;
        diamond(ctx, x + dx * 14, y + dy * 14, 3.5);
      }
      ctx.fillStyle = p.faint;
      diamond(ctx, PAGE_W / 2, inset, 4);
      diamond(ctx, PAGE_W / 2, PAGE_H - inset, 4);
    },
  },
  {
    id: "academic",
    name: "Academic",
    description: "Heavy single border with a hairline inside. Diplomas and awards.",
    contentTop: 70,
    frameByDefault: true,
    decorate: (ctx, cfg, p) => {
      ctx.strokeStyle = p.accent;
      ctx.lineWidth = 7;
      ctx.strokeRect(20, 20, PAGE_W - 40, PAGE_H - 40);
      ctx.strokeStyle = withAlpha(p.ink, 0.28);
      ctx.lineWidth = 0.7;
      ctx.strokeRect(36, 36, PAGE_W - 72, PAGE_H - 72);
      /* A row of small diamonds along the top and bottom hairline. */
      ctx.fillStyle = p.faint;
      for (let x = 120; x < PAGE_W - 110; x += 44) {
        diamond(ctx, x, 36, 2.6);
        diamond(ctx, x, PAGE_H - 36, 2.6);
      }
    },
  },
  {
    id: "ribbon",
    name: "Ribbon",
    description: "A tinted banner behind the title. Friendlier, for courses and clubs.",
    contentTop: 66,
    frameByDefault: false,
    decorate: (ctx, cfg, p) => {
      if (cfg.showFrame) doubleFrame(ctx, p, 24, 9, 1.6);
      ctx.fillStyle = withAlpha(p.accent, 0.08);
      ctx.fillRect(0, 0, PAGE_W, 10);
      ctx.fillRect(0, PAGE_H - 10, PAGE_W, 10);
    },
  },
];

export const getCertTemplate = (id: string) =>
  CERT_TEMPLATES.find((t) => t.id === id) ?? CERT_TEMPLATES[0];

export function renderCertificate(
  canvas: HTMLCanvasElement,
  cfg: CertificateConfig
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  ctx.setTransform(PT, 0, 0, PT, 0, 0); // draw in points from here on
  ctx.clearRect(0, 0, PAGE_W, PAGE_H);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);

  const template = getCertTemplate(cfg.template);
  const p: Palette = {
    ink: cfg.fontColor,
    accent: cfg.accentColor,
    muted: withAlpha(cfg.fontColor, 0.62),
    faint: withAlpha(cfg.accentColor, 0.45),
  };

  template.decorate(ctx, cfg, p);

  const shift = template.leftInset ?? 0;
  const midX = PAGE_W / 2 + shift;
  const base = cfg.fontSize;

  const font = (size: number, weight: number, italic = false) => {
    ctx.font = `${italic ? "italic " : ""}${weight} ${size}px ${cfg.fontFamily}`;
  };

  const centreText = (
    s: string,
    y: number,
    size: number,
    weight: number,
    color: string,
    italic = false,
    x = midX
  ) => {
    font(size, weight, italic);
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(s, x, y);
  };

  const rule = (width: number, y: number, color: string, thickness = 0.8) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(midX - width / 2, y);
    ctx.lineTo(midX + width / 2, y);
    ctx.stroke();
  };

  const drawLogo = (x: number, y: number, maxH: number, maxW: number) => {
    if (!cfg.logo) return 0;
    const aspect = cfg.logoAspect > 0 ? cfg.logoAspect : 1;
    let h = maxH;
    let w = h * aspect;
    if (w > maxW) {
      w = maxW;
      h = w / aspect;
    }
    ctx.drawImage(cfg.logo, x, y, w, h);
    return h;
  };

  const titleText = cfg.title.trim().toUpperCase() || "CERTIFICATE";
  let y = template.contentTop;

  /* ----------------------------------------------- band-style templates */
  if (template.titleInBand) {
    const onLight = isLight(cfg.accentColor);
    const bandInk = onLight ? "#10151f" : "#ffffff";
    const titleSize = base * 1.55;

    let logoW = 0;
    if (cfg.logo && template.logoInBand) {
      const aspect = cfg.logoAspect > 0 ? cfg.logoAspect : 1;
      let h = 48;
      let w = h * aspect;
      if (w > 150) {
        w = 150;
        h = w / aspect;
      }
      logoW = w;
      ctx.drawImage(cfg.logo, 60, (BAND_H - h) / 2, w, h);
    }

    /* With a logo on the left the title centres in the space that is left,
       so the two never collide on a wide logo. */
    const titleCentre = logoW ? (60 + logoW + 30 + PAGE_W - 60) / 2 : PAGE_W / 2;
    centreText(titleText, BAND_H / 2 + titleSize / 2 - 3, titleSize, cfg.fontWeightBold, bandInk, false, titleCentre);
    if (cfg.organisation.trim()) {
      centreText(
        cfg.organisation.trim().toUpperCase(),
        BAND_H / 2 + titleSize / 2 + base * 0.6 + 8,
        base * 0.6,
        cfg.fontWeightRegular,
        withAlpha(onLight ? "#10151f" : "#ffffff", 0.78),
        false,
        titleCentre
      );
    }
  } else {
    /* ------------------------------------------------------------- logo */
    if (cfg.logo) {
      const maxH = 52;
      const maxW = 180;
      const aspect = cfg.logoAspect > 0 ? cfg.logoAspect : 1;
      let h = maxH;
      let w = h * aspect;
      if (w > maxW) {
        w = maxW;
        h = w / aspect;
      }
      const x =
        cfg.logoPlacement === "left"
          ? 96 + shift
          : cfg.logoPlacement === "right"
            ? PAGE_W - 96 - w
            : midX - w / 2;
      drawLogo(x, y, maxH, maxW);
      y += h + 26;
    } else {
      y += 18;
    }

    /* ------------------------------------------------------------ title */
    const titleSize = base * 1.75;

    if (template.id === "ribbon") {
      font(titleSize, cfg.fontWeightBold);
      const w = ctx.measureText(titleText).width + 80;
      const h = titleSize + 30;
      const bx = midX - w / 2;
      ctx.fillStyle = withAlpha(cfg.accentColor, 0.12);
      ctx.beginPath();
      ctx.moveTo(bx, y);
      ctx.lineTo(bx + w, y);
      ctx.lineTo(bx + w - 16, y + h / 2);
      ctx.lineTo(bx + w, y + h);
      ctx.lineTo(bx, y + h);
      ctx.lineTo(bx + 16, y + h / 2);
      ctx.closePath();
      ctx.fill();
      centreText(titleText, y + h / 2 + titleSize * 0.36, titleSize, cfg.fontWeightBold, p.accent);
      y += h + 22;
    } else {
      y += titleSize;
      centreText(titleText, y, titleSize, cfg.fontWeightBold, p.accent);
      y += 12;
      rule(150, y, p.faint, 1);
      y += 30;
    }
  }

  /* ------------------------------------------------------------ preface */
  const prefaceSize = base * 0.85;
  y += prefaceSize;
  centreText("This is to certify that", y, prefaceSize, cfg.fontWeightRegular, p.muted, true);
  y += 30;

  /* ---------------------------------------------------------- recipient */
  const maxNameWidth = PAGE_W - 200;
  let nameSize = base * 2.55;
  const name = cfg.recipient.trim() || "Recipient Name";
  font(nameSize, cfg.fontWeightBold);
  while (ctx.measureText(name).width > maxNameWidth && nameSize > base) {
    nameSize -= 1;
    font(nameSize, cfg.fontWeightBold);
  }
  const nameWidth = ctx.measureText(name).width;
  y += nameSize;
  centreText(name, y, nameSize, cfg.fontWeightBold, p.accent);
  y += 14;
  rule(Math.min(maxNameWidth, nameWidth + 80), y, withAlpha(cfg.fontColor, 0.25));
  y += 28;

  /* --------------------------------------------------------------- body */
  const bodyText = cfg.body.trim();
  if (bodyText) {
    const maxBodyWidth = PAGE_W - 240;
    const lineHeight = base * 1.55;
    font(base, cfg.fontWeightRegular);

    const lines: string[] = [];
    for (const paragraph of bodyText.split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        const attempt = line ? `${line} ${word}` : word;
        if (ctx.measureText(attempt).width > maxBodyWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = attempt;
        }
      }
      if (line) lines.push(line);
    }

    for (const line of lines.slice(0, 5)) {
      y += base;
      centreText(line, y, base, cfg.fontWeightRegular, cfg.fontColor);
      y += lineHeight - base;
    }
  }

  /* ------------------------------------------------------------- footer */
  const lineY = PAGE_H - 92;
  const labelSize = base * 0.62;
  const valueSize = base * 0.78;

  const footColumn = (
    x1: number,
    x2: number,
    value: string,
    label: string,
    image: CanvasImageSource | null,
    aspect: number
  ) => {
    /* The image sits directly on the line, like a real signature. */
    if (image) {
      const maxH = 40;
      const maxW = x2 - x1 - 10;
      const a = aspect > 0 ? aspect : 3;
      let h = maxH;
      let w = h * a;
      if (w > maxW) {
        w = maxW;
        h = w / a;
      }
      ctx.drawImage(image, (x1 + x2) / 2 - w / 2, lineY - h - 2, w, h);
    }

    ctx.strokeStyle = withAlpha(cfg.fontColor, 0.35);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x1, lineY);
    ctx.lineTo(x2, lineY);
    ctx.stroke();

    ctx.textAlign = "center";
    const cx = (x1 + x2) / 2;
    if (value) {
      font(valueSize, cfg.fontWeightRegular);
      ctx.fillStyle = cfg.fontColor;
      ctx.fillText(value, cx, lineY + valueSize + 6);
    }
    font(labelSize, cfg.fontWeightBold);
    ctx.fillStyle = p.muted;
    ctx.fillText(label.toUpperCase(), cx, lineY + valueSize + labelSize + 12);
  };

  footColumn(96 + shift, 276 + shift, cfg.dateLabel, "Date", null, 1);

  const sigRight = cfg.qr ? 664 : PAGE_W - 96;
  footColumn(
    sigRight - 180,
    sigRight,
    cfg.signatory,
    cfg.signatoryRole || "Signature",
    cfg.signature,
    cfg.signatureAspect
  );

  /* --------------------------------------------------------------- seal */
  const cx = midX;
  const cy = lineY - 6;
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 33, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = p.faint;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.arc(cx, cy, 27, 0, Math.PI * 2);
  ctx.stroke();

  font(base * 1.05, cfg.fontWeightBold);
  ctx.fillStyle = p.accent;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sealInitials(cfg.organisation), cx, cy + 1);
  ctx.textBaseline = "alphabetic";

  /* The corporate band already carries the organisation name. */
  if (cfg.organisation.trim() && !template.titleInBand) {
    centreText(
      cfg.organisation.trim(),
      cy + 33 + base * 0.78 + 8,
      base * 0.78,
      cfg.fontWeightBold,
      p.accent
    );
  }

  /* ----------------------------------------------------------- QR code */
  if (cfg.qr) {
    const size = 58;
    ctx.drawImage(cfg.qr, PAGE_W - 96 - size + 10, lineY - size + 6, size, size);
    font(base * 0.52, cfg.fontWeightRegular);
    ctx.fillStyle = p.muted;
    ctx.textAlign = "center";
    ctx.fillText("Verify", PAGE_W - 96 - size / 2 + 10, lineY + base * 0.52 + 12);
  }

  /* --------------------------------------------------------- reference */
  if (cfg.reference.trim()) {
    font(base * 0.5, cfg.fontWeightRegular);
    ctx.fillStyle = p.muted;
    ctx.textAlign = "left";
    ctx.fillText(`Ref: ${cfg.reference.trim()}`, 48, PAGE_H - 40);
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
