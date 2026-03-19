import Link from "next/link";

function XingoMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 113 182"
      className="h-12 w-auto text-foreground"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M75.0603 38.1001H37.5303V85.8701H75.0603V38.1001Z"
        fill="currentColor"
      />
      <path
        d="M37.53 38.1H0V22.75C0 10.18 10.18 0 22.75 0H37.53V38.1Z"
        fill="currentColor"
      />
      <path
        d="M112.59 38.1H75.0596V0H89.8396C102.4 0 112.59 10.18 112.59 22.75V38.1Z"
        fill="currentColor"
      />
      <path
        d="M89.8503 85.8701H75.0703V181.4H89.8503C102.41 181.4 112.6 171.22 112.6 158.65V108.61C112.6 96.0501 102.42 85.8601 89.8503 85.8601V85.8701Z"
        fill="currentColor"
      />
      <path
        d="M0 85.8701V158.66C0 171.22 10.18 181.41 22.75 181.41H37.53V85.8801H0V85.8701Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="flex h-14 w-12 shrink-0 items-center justify-center rounded-[1.4rem] border border-line bg-white/70 shadow-[0_10px_25px_rgba(17,34,24,0.06)]">
        <XingoMark />
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
