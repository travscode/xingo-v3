"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, Eye, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { previewLabel, previewOptions, type PreviewAs } from "@/lib/preview";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Starts or switches a member preview (D-044) and opens Home as that member. */
function useStartPreview() {
  const router = useRouter();
  const setPreview = useMutation(api.admin.setPreview);
  return async (as: PreviewAs) => {
    await setPreview({ as });
    router.push("/dashboard");
  };
}

/** Admin header action: "Preview as" a Free, pack or Pro member. */
export function PreviewAsMenu() {
  const start = useStartPreview();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Eye className="h-4 w-4" aria-hidden /> Preview as <ChevronDown className="h-4 w-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>See the app as a new member</DropdownMenuLabel>
        {previewOptions.map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => void start(option.value)} className="flex-col items-start gap-0.5">
            <span className="font-semibold">{option.label}</span>
            <span className="text-xs text-gray-500">{option.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Shown on every app page while an admin previews as a member: what they're seeing,
 * a quick switch, and the way back to admin. `compact` is for full-screen pages.
 */
export function PreviewBanner({ compact = false }: { compact?: boolean }) {
  const me = useQuery(api.users.me, {});
  const router = useRouter();
  const setPreview = useMutation(api.admin.setPreview);
  const start = useStartPreview();
  const [leaving, setLeaving] = useState(false);
  const previewAs = me?.user.role === "platform_admin" ? me.user.previewAs : undefined;

  if (!previewAs) return null;

  const exit = async () => {
    setLeaving(true);
    await setPreview({ as: null });
    router.push("/admin");
  };

  if (compact) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-ink py-1.5 pl-3 pr-1.5 text-sm text-paper shadow-lg">
        <Eye className="h-4 w-4" aria-hidden />
        <span>Previewing as {previewLabel(previewAs)}</span>
        <button
          type="button"
          onClick={() => void exit()}
          disabled={leaving}
          className="flex items-center gap-1 rounded-full bg-paper/15 px-2.5 py-1 font-semibold hover:bg-paper/25"
        >
          <X className="h-3.5 w-3.5" aria-hidden /> Exit
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-ink px-4 py-2.5 text-sm text-paper sm:px-6">
      <p className="flex items-center gap-2">
        <Eye className="h-4 w-4 shrink-0" aria-hidden />
        <span>
          Previewing as a <span className="font-semibold">{previewLabel(previewAs)}</span>. Purchases are switched off while you preview.
        </span>
      </p>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-semibold hover:bg-paper/10">
              Switch <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {previewOptions
              .filter((option) => option.value !== previewAs)
              .map((option) => (
                <DropdownMenuItem key={option.value} onSelect={() => void start(option.value)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          type="button"
          onClick={() => void exit()}
          disabled={leaving}
          className="rounded-lg bg-paper px-3 py-1.5 font-semibold text-ink hover:bg-gray-100"
        >
          Exit preview
        </button>
      </div>
    </div>
  );
}
