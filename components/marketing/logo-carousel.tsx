import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Organisations 2M Language Services (XINGO's partner) works with. Shown under a
 * contract with 2M confirmed by the founder on 2026-10-03; framed as 2M's clients,
 * where XINGO-qualified interpreters can work — not as XINGO customers. Logos are
 * from Wikimedia Commons (public/images/logos/). Government bodies stay as text:
 * their emblems are protected separately. Only add organisations 2M has approved.
 */
export type CarouselOrg = { name: string; logo?: string };

export const partnerClients: CarouselOrg[] = [
  { name: "Microsoft", logo: "/images/logos/microsoft.svg" },
  { name: "Apple", logo: "/images/logos/apple.svg" },
  { name: "Deloitte", logo: "/images/logos/deloitte.svg" },
  { name: "Rio Tinto", logo: "/images/logos/rio-tinto.svg" },
  { name: "Deutsche Bank", logo: "/images/logos/deutsche-bank.svg" },
  { name: "Healthdirect Australia" },
  { name: "Queensland Government" },
  { name: "Australian Federal Police" },
];

function Tile({ org }: { org: CarouselOrg }) {
  return (
    <li className="flex h-16 w-[33.333vw] shrink-0 items-center justify-center px-4 sm:w-[25vw] lg:w-[min(16.666vw,12rem)]" aria-label={org.name}>
      {org.logo ? (
        // SVGs are served as-is (the image optimiser doesn't process SVG).
        <Image src={org.logo} alt={org.name} width={140} height={48} unoptimized className="h-8 w-auto max-w-[8.5rem] object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
      ) : (
        <span className="text-center text-[15px] font-semibold leading-tight tracking-[-0.01em] text-gray-500">{org.name}</span>
      )}
    </li>
  );
}

/**
 * Endless, slow-scrolling strip of logos, about six visible at a time on desktop
 * (three on phones). Pauses on hover; static under reduced motion. CSS only.
 */
export function LogoCarousel({
  orgs = partnerClients,
  className,
}: {
  orgs?: CarouselOrg[];
  className?: string;
}) {
  if (orgs.length === 0) return null;

  return (
    <div className={cn("logo-marquee relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-paper to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-paper to-transparent" aria-hidden />
      <div className="logo-marquee-track flex w-max">
        {/* Two copies so the loop is seamless; the second is hidden from screen readers. */}
        <ul className="flex shrink-0">
          {orgs.map((org) => (
            <Tile key={org.name} org={org} />
          ))}
        </ul>
        <ul className="flex shrink-0" aria-hidden>
          {orgs.map((org) => (
            <Tile key={`${org.name}-copy`} org={org} />
          ))}
        </ul>
      </div>
    </div>
  );
}
