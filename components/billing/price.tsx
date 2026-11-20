import { cn } from "@/lib/utils";

/** A price, with the usual price struck through beside it while a sale is on. */
export function Price({
  priceLabel,
  regularPriceLabel,
  className,
}: {
  priceLabel: string;
  regularPriceLabel?: string;
  className?: string;
}) {
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 text-3xl font-bold tracking-[-0.03em]", className)}>
      {priceLabel}
      {regularPriceLabel ? (
        <span className="text-base font-semibold tracking-normal text-gray-400 line-through">
          <span className="sr-only">Usually </span>
          {regularPriceLabel}
        </span>
      ) : null}
    </p>
  );
}
