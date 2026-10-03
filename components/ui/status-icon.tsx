import { CircleCheck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/** Small round marker for a scored attempt: tick when passed, retry when not. */
export function StatusIcon({ passed, className }: { passed: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        passed ? "bg-accent text-accent-ink" : "bg-gray-100 text-gray-500",
        className,
      )}
      title={passed ? "Passed" : "Keep practising"}
    >
      {passed ? <CircleCheck className="h-4 w-4" aria-hidden /> : <RotateCcw className="h-4 w-4" aria-hidden />}
    </span>
  );
}
