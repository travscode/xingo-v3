import Link from "next/link";

interface XingoMarkProps {
  size?: number;
  className?: string;
}

export function XingoMark({ size = 113 * 0.7, className }: XingoMarkProps) {
  const height = (size * 182) / 113;

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={height}
      viewBox="0 0 113 182"
      className={className || "h-10 w-auto"}
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
      <span className="flex h-14 w-12 shrink-0 items-center justify-center rounded-[1.25rem] shadow-[0_10px_25px_rgba(18,18,18,0.06)]">
        <XingoMark />
      </span>
      <div>
        <div className="display text-lg font-semibold tracking-tight">
          <svg
            width={468 * 0.2}
            height={180 * 0.2}
            viewBox="0 0 468 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50.4248 108.351H49.1745L25.8375 145.857H0L36.4642 93.765L0 41.6734H25.8375L49.1745 79.1794H50.4248L73.7618 41.6734H99.5993L63.1351 93.765L99.5993 145.857H73.7618L50.4248 108.351Z"
              fill="currentColor"
            />
            <path
              d="M114.309 0H135.145V20.8367H114.309V0ZM114.309 41.6734H135.145V145.857H114.309V41.6734Z"
              fill="currentColor"
            />
            <path
              d="M220.673 60.4264H174.833V145.857H153.996V41.6734H241.51V145.857H220.673V60.4264Z"
              fill="currentColor"
            />
            <path
              d="M332.832 41.6734H353.668V179.195H274.489V160.442H332.832V127.104C326.581 133.98 316.371 139.606 301.785 139.606C268.03 139.606 256.153 116.06 256.153 89.5977C256.153 63.1351 268.03 39.5897 301.785 39.5897C316.371 39.5897 326.581 45.2156 332.832 54.1754V41.6734ZM304.911 120.853C325.33 120.853 332.832 112.518 332.832 89.5977C332.832 68.761 325.33 58.3427 304.911 58.3427C284.491 58.3427 276.989 68.761 276.989 89.5977C276.989 110.434 284.491 120.853 304.911 120.853Z"
              fill="currentColor"
            />
            <path
              d="M418.129 147.94C386.457 147.94 368.329 126.479 368.329 93.765C368.329 61.0515 386.457 39.5897 418.129 39.5897C449.8 39.5897 467.928 61.0515 467.928 93.765C467.928 126.479 449.8 147.94 418.129 147.94ZM418.129 129.187C439.59 129.187 447.092 120.853 447.092 93.765C447.092 66.6774 439.59 58.3427 418.129 58.3427C396.667 58.3427 389.166 66.6774 389.166 93.765C389.166 120.853 396.667 129.187 418.129 129.187Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
