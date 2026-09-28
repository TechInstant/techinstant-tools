"use client";

import { useCallback, useId, useRef, useState } from "react";
import { UploadCloud, X, GripVertical, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes, cn } from "@/lib/utils";

export interface PickedFile {
  id: string;
  file: File;
}

/** Default ceiling per file. Browser memory is the real limit (§29). */
export const MAX_FILE_BYTES = 100 * 1024 * 1024;

/**
 * Validates one file against an accept list. Checks the extension as well as
 * the MIME type, because browsers report empty or wrong types often enough
 * that trusting `file.type` alone rejects valid files (§29).
 */
export function validateFile(
  file: File,
  { extensions, mimePrefixes, maxBytes = MAX_FILE_BYTES }: {
    extensions: string[];
    mimePrefixes: string[];
    maxBytes?: number;
  }
): string | null {
  const name = file.name.toLowerCase();
  const extOk = extensions.some((ext) => name.endsWith(ext));
  const mimeOk =
    file.type !== "" && mimePrefixes.some((m) => file.type.startsWith(m));

  if (!extOk && !mimeOk) {
    const list = extensions.join(", ");
    return `“${file.name}” isn’t supported. Choose a ${list} file.`;
  }
  if (file.size === 0) return `“${file.name}” is empty.`;
  if (file.size > maxBytes) {
    return `“${file.name}” is ${formatBytes(file.size)} — the limit for this tool is ${formatBytes(maxBytes)}.`;
  }
  return null;
}

export function FileDrop({
  accept,
  extensions,
  mimePrefixes,
  multiple = false,
  maxBytes = MAX_FILE_BYTES,
  hint,
  onFiles,
  onError,
}: {
  accept: string;
  extensions: string[];
  mimePrefixes: string[];
  multiple?: boolean;
  maxBytes?: number;
  hint?: string;
  onFiles: (files: File[]) => void;
  onError: (message: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const handle = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      const incoming = Array.from(list);
      const accepted: File[] = [];

      for (const file of incoming) {
        const problem = validateFile(file, { extensions, mimePrefixes, maxBytes });
        if (problem) {
          onError(problem);
          return;
        }
        accepted.push(file);
      }

      onError("");
      onFiles(multiple ? accepted : accepted.slice(0, 1));
    },
    [extensions, mimePrefixes, maxBytes, multiple, onFiles, onError]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files);
      }}
      className={cn(
        "rounded-xl border-2 border-dashed p-8 text-center transition-colors sm:p-10",
        dragging
          ? "border-brand bg-brand/5"
          : "border-border bg-background-subtle"
      )}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          handle(e.target.files);
          /* Reset so picking the same file twice still fires a change. */
          e.target.value = "";
        }}
      />

      <UploadCloud
        className={cn(
          "mx-auto h-9 w-9",
          dragging ? "text-brand" : "text-muted-foreground"
        )}
      />
      <p className="mt-3 font-semibold text-foreground">
        Drag &amp; drop {multiple ? "files" : "a file"} here
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {hint ?? "or choose from your device"}
      </p>

      <Button className="mt-4" onClick={() => inputRef.current?.click()}>
        Choose {multiple ? "files" : "file"}
      </Button>
    </div>
  );
}

/** Selected-file list with remove, and optional reordering (§17). */
export function FileList({
  files,
  onRemove,
  onMove,
  reorderable = false,
}: {
  files: PickedFile[];
  onRemove: (id: string) => void;
  onMove?: (from: number, to: number) => void;
  reorderable?: boolean;
}) {
  if (files.length === 0) return null;

  return (
    <ul className="space-y-2">
      {files.map((item, index) => (
        <li
          key={item.id}
          draggable={reorderable}
          onDragStart={(e) => e.dataTransfer.setData("text/plain", String(index))}
          onDragOver={(e) => reorderable && e.preventDefault()}
          onDrop={(e) => {
            if (!reorderable || !onMove) return;
            e.preventDefault();
            const from = Number(e.dataTransfer.getData("text/plain"));
            if (!Number.isNaN(from) && from !== index) onMove(from, index);
          }}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
        >
          {reorderable && (
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
          )}
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {item.file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(item.file.size)}
            </p>
          </div>

          {reorderable && onMove && (
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => onMove(index, index - 1)}
                disabled={index === 0}
                aria-label={`Move ${item.file.name} up`}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMove(index, index + 1)}
                disabled={index === files.length - 1}
                aria-label={`Move ${item.file.name} down`}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
              >
                ↓
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.file.name}`}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Stable ids so list keys survive reordering. */
export const withIds = (files: File[]): PickedFile[] =>
  files.map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
    file,
  }));

/** Triggers a client-side download of generated bytes. */
export function downloadBlob(data: BlobPart, filename: string, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Opens generated bytes in a new tab so someone can check the real output
 * before committing to a download.
 *
 * The tab is opened synchronously, before any awaiting, because a `window.open`
 * that happens after an await is no longer attributable to the click and gets
 * blocked as a popup.
 */
export async function openBlobPreview(
  produce: () => Promise<BlobPart>,
  mime: string
): Promise<"ok" | "blocked" | "failed"> {
  const tab = window.open("", "_blank");
  try {
    const blob = new Blob([await produce()], { type: mime });
    if (!tab || tab.closed) return "blocked";
    const url = URL.createObjectURL(blob);
    tab.location.href = url;
    /* The document has loaded by then, so releasing the URL is safe and stops
       the blob being held for the life of the page. */
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return "ok";
  } catch {
    tab?.close();
    return "failed";
  }
}
