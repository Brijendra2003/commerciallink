"use client";

import { useEffect, useId, useRef, useState } from "react";
import { compressImage } from "@/lib/image-compress";
import { MAX_IMAGE_BYTES } from "@/lib/media";

export interface PickedFile {
  id: string;
  file: File;
  preview: string | null;
}

/**
 * Controlled multi-file picker with thumbnails, removal and a "cover" marker.
 * Files live in React state (not the input) so a failed submission keeps them,
 * and so the parent can append them to FormData itself.
 */
export function FilePicker({
  label,
  hint,
  accept,
  max,
  value,
  onChange,
  kind = "image",
  showCover = false,
  required = false,
  error,
}: {
  label: string;
  hint?: string;
  accept: string;
  max: number;
  value: PickedFile[];
  onChange: (files: PickedFile[]) => void;
  kind?: "image" | "pdf";
  showCover?: boolean;
  required?: boolean;
  error?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Release object URLs for previews that are no longer shown.
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const live = new Set(value.map((v) => v.preview).filter(Boolean) as string[]);
    for (const url of previews.current) {
      if (!live.has(url)) {
        URL.revokeObjectURL(url);
        previews.current.delete(url);
      }
    }
    for (const url of live) previews.current.add(url);
  }, [value]);
  useEffect(() => {
    const set = previews.current;
    return () => {
      for (const url of set) URL.revokeObjectURL(url);
    };
  }, []);

  async function add(list: FileList | null) {
    if (!list || list.length === 0) return;
    setLocalError(null);

    const room = max - value.length;
    const incoming = Array.from(list).slice(0, Math.max(0, room));
    if (list.length > room) {
      setLocalError(`You can attach up to ${max}. Extra files were skipped.`);
    }

    setBusy(true);
    const next: PickedFile[] = [];
    for (const raw of incoming) {
      if (kind === "image" && !/^image\/(jpeg|png|webp)$/.test(raw.type)) {
        setLocalError(`"${raw.name}" is not a JPG, PNG or WebP image.`);
        continue;
      }
      if (kind === "pdf" && raw.type !== "application/pdf") {
        setLocalError(`"${raw.name}" is not a PDF.`);
        continue;
      }
      const file = kind === "image" ? await compressImage(raw, MAX_IMAGE_BYTES) : raw;
      next.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: kind === "image" ? URL.createObjectURL(file) : null,
      });
    }
    setBusy(false);
    onChange([...value, ...next]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= value.length) return;
    const copy = [...value];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    onChange(copy);
  }

  const shownError = error ?? localError;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="block text-[0.8125rem] font-semibold text-ink-700">
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-0.5 text-clay-600">
              *
            </span>
          ) : null}
        </label>
        <span className="text-[0.6875rem] tabular-nums text-ink-300">
          {value.length} / {max}
        </span>
      </div>

      {kind === "image" ? (
        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {value.map((item, i) => (
            <li
              key={item.id}
              className="group/pick relative aspect-[4/3] overflow-hidden rounded-xl bg-brand-100"
            >
              {item.preview ? (
                // Local object URL preview — next/image cannot optimise blob: URLs.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.preview} alt="" className="h-full w-full object-cover" />
              ) : null}
              {showCover && i === 0 ? (
                <span className="absolute left-1.5 top-1.5 rounded bg-sand-2005 px-2 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wider text-white">
                  Cover
                </span>
              ) : null}
              <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1">
                <span className="flex gap-1">
                  <IconButton label="Move earlier" onClick={() => move(i, i - 1)} disabled={i === 0}>
                    <path d="M10 4 6 8l4 4" />
                  </IconButton>
                  <IconButton
                    label="Move later"
                    onClick={() => move(i, i + 1)}
                    disabled={i === value.length - 1}
                  >
                    <path d="m6 4 4 4-4 4" />
                  </IconButton>
                </span>
                <IconButton
                  label={`Remove ${item.file.name}`}
                  onClick={() => onChange(value.filter((v) => v.id !== item.id))}
                >
                  <path d="M4 4l8 8M12 4l-8 8" />
                </IconButton>
              </div>
            </li>
          ))}

          {value.length < max ? (
            <li>
              <label
                htmlFor={inputId}
                className={`flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed text-ink-300 transition-colors hover:border-brand-500 hover:text-brand-700 ${
                  shownError ? "border-clay-500" : "border-sand-300"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span className="text-[0.6875rem] font-semibold">
                  {busy ? "Processing…" : "Add"}
                </span>
              </label>
            </li>
          ) : null}
        </ul>
      ) : (
        <div className="space-y-2">
          {value.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-sand-200 bg-sand-50 px-3.5 py-2.5"
            >
              <span className="truncate text-[0.8125rem] text-brand-900">
                {item.file.name}{" "}
                <span className="text-ink-300">
                  · {(item.file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </span>
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v.id !== item.id))}
                className="shrink-0 text-[0.75rem] font-semibold text-ink-500 underline underline-offset-4 hover:text-clay-700"
              >
                Remove
              </button>
            </div>
          ))}
          {value.length < max ? (
            <label
              htmlFor={inputId}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-sand-300 px-4 py-4 text-[0.8125rem] font-semibold text-ink-500 transition-colors hover:border-brand-500 hover:text-brand-700"
            >
              {busy ? "Processing…" : "Choose a PDF"}
            </label>
          ) : null}
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={max > 1}
        className="sr-only"
        onChange={(e) => add(e.target.files)}
      />

      {shownError ? (
        <p role="alert" className="mt-1.5 text-[0.75rem] font-medium text-clay-700">
          {shownError}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[0.75rem] text-ink-300">{hint}</p>
      ) : null}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-ink-500 shadow-sm transition-colors hover:text-clay-700 disabled:opacity-40"
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}
