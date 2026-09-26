/** Shared browser-side image helpers used by the image tools. */

export const IMAGE_ACCEPT = {
  accept: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
  extensions: [".jpg", ".jpeg", ".png", ".webp"],
  mimePrefixes: ["image/jpeg", "image/png", "image/webp"],
};

export interface LoadedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
}

/**
 * Decodes a file to an ImageBitmap. `createImageBitmap` is hardware-accelerated
 * and avoids the load-event dance of `new Image()`.
 */
export async function loadImage(file: File): Promise<LoadedImage> {
  const bitmap = await createImageBitmap(file);
  return { bitmap, width: bitmap.width, height: bitmap.height };
}

/** Draws a bitmap to a canvas at the given size and encodes it. */
export async function encode(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  mime: string,
  quality?: number,
  crop?: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser could not process the image.");

  /* JPEG has no alpha, so flatten transparency onto white rather than black. */
  if (mime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.imageSmoothingQuality = "high";
  if (crop) {
    ctx.drawImage(
      bitmap,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
  } else {
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, quality)
  );
  if (!blob) throw new Error("The image could not be saved in that format.");
  return blob;
}

/** "photo.png" + "image/webp" -> "photo.webp" */
export function renameFor(filename: string, mime: string) {
  const ext = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
  const base = filename.replace(/\.[^.]+$/, "") || "image";
  return `${base}.${ext}`;
}

export const MIME_LABELS: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
};
