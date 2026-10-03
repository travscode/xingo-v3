"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { ImagePlus, Trash2 } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;

/** Uploads one image to Convex storage and reports its storage id. */
export function ImageUpload({
  value,
  previewUrl,
  onChange,
  label,
  aspect = "banner",
}: {
  value?: Id<"_storage">;
  previewUrl?: string | null;
  onChange: (storageId: Id<"_storage"> | undefined, localPreview: string | null) => void;
  label: string;
  aspect?: "banner" | "square";
}) {
  const generateUploadUrl = useMutation(api.marketplace.generateUploadUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) return setError("Choose an image file (PNG, JPG or WebP).");
    if (file.size > MAX_BYTES) return setError("Images can be up to 5 MB.");

    setBusy(true);
    try {
      const url = await generateUploadUrl({});
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      if (!response.ok) throw new Error("upload failed");
      const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };
      onChange(storageId, URL.createObjectURL(file));
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 hover:border-ink",
          aspect === "banner" ? "aspect-[3/1] w-full" : "h-24 w-24",
        )}
        aria-label={value ? `Replace ${label}` : `Upload ${label}`}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 px-2 text-center">
            <ImagePlus className="h-5 w-5" aria-hidden />
            {busy ? "Uploading…" : aspect === "banner" ? "Upload a banner (wide image)" : "Logo"}
          </span>
        )}
        {busy && previewUrl ? <span className="absolute inset-0 flex items-center justify-center bg-paper/70">Uploading…</span> : null}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = "";
        }}
      />
      {value || previewUrl ? (
        <Button type="button" size="sm" variant="ghost" className="self-start" onClick={() => onChange(undefined, null)}>
          <Trash2 className="h-4 w-4" aria-hidden /> Remove
        </Button>
      ) : null}
      {error ? <p className="text-xs text-record">{error}</p> : null}
    </div>
  );
}
