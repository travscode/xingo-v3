import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-2xl bg-brand text-sm font-bold text-white">
        X
      </span>
      <div>
        <div className="display text-lg font-semibold tracking-tight">XINGO</div>
        <div className="text-xs tracking-[0.28em] text-muted uppercase">
          Interpreter training
        </div>
      </div>
    </Link>
  );
}
