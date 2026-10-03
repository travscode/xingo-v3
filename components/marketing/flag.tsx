import { cn } from "@/lib/utils";

/*
 * Small inline SVG country flags. Emoji flags don't render on Windows (they
 * show as letters), so the exams index uses these instead. Decorative: always
 * shown next to the country name in text.
 */

export type FlagCountry = "Australia" | "United States" | "United Kingdom";

function star(cx: number, cy: number, outer: number, points: number, inner = outer * 0.45) {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    coords.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return coords.join(" ");
}

/** Union Jack drawn in a 60×30 box at the origin. */
function UnionJack({ id }: { id: string }) {
  return (
    <g>
      <clipPath id={`${id}-t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-t)`} stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  );
}

const auStars = [
  star(15, 22.5, 4.5, 7), // Commonwealth Star
  star(45, 25.5, 2.1, 7), // Alpha Crucis
  star(37.5, 13.25, 2.1, 7), // Beta
  star(45, 5.5, 2.1, 7), // Gamma
  star(51.7, 11.5, 2.1, 7), // Delta
  star(48.6, 16.4, 1.2, 5), // Epsilon
];

function Australia() {
  return (
    <>
      <rect width="60" height="30" fill="#012169" />
      <g transform="scale(0.5)">
        <UnionJack id="au" />
      </g>
      {auStars.map((points) => (
        <polygon key={points} points={points} fill="#fff" />
      ))}
    </>
  );
}

function UnitedStates() {
  const stripe = 30 / 13;
  return (
    <>
      <rect width="60" height="30" fill="#fff" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={i * 2 * stripe} width="60" height={stripe} fill="#B22234" />
      ))}
      <rect width="24" height={stripe * 7} fill="#3C3B6E" />
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => (
          <circle key={`${row}-${col}`} cx={3 + col * 4.5} cy={2.4 + row * 3.9} r="0.9" fill="#fff" />
        )),
      )}
    </>
  );
}

/** A country flag at 2:1 with a hairline border so white edges read on white. */
export function Flag({ country, className }: { country: FlagCountry; className?: string }) {
  return (
    <svg
      viewBox="0 0 60 30"
      className={cn("inline-block h-[15px] w-[30px] shrink-0 overflow-hidden rounded-[3px] ring-1 ring-gray-200", className)}
      aria-hidden
      focusable="false"
    >
      {country === "Australia" ? <Australia /> : country === "United States" ? <UnitedStates /> : <UnionJack id="gb" />}
    </svg>
  );
}
