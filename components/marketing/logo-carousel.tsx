import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Organisations 2M Language Services (XINGO's partner) works with. Shown under a
 * contract with 2M confirmed by the founder on 2026-10-03; framed as 2M's clients,
 * where XINGO-qualified interpreters can work — not as XINGO customers. Logos come
 * from Wikimedia Commons or the organisations' own sites (public/images/logos/) and
 * are shown in solid black. Organisations without a logo file aren't shown.
 * Not included: the Australian Federal Police — its name and insignia need the AFP's
 * own written consent (Australian Federal Police Act), which 2M's contract doesn't give.
 */
export type CarouselOrg = { name: string; logo: string };

export const partnerClients: CarouselOrg[] = [
  { name: "Microsoft", logo: "/images/logos/microsoft.svg" },
  { name: "Apple", logo: "/images/logos/apple.svg" },
  { name: "Deloitte", logo: "/images/logos/deloitte.svg" },
  { name: "Rio Tinto", logo: "/images/logos/rio-tinto.svg" },
  { name: "Deutsche Bank", logo: "/images/logos/deutsche-bank.svg" },
  { name: "Healthdirect Australia", logo: "/images/logos/healthdirect.svg" },
  { name: "Emergency Management Victoria", logo: "/images/logos/emv-black.png" },
  { name: "Queensland Government", logo: "/images/logos/qld-gov-black.png" },
];

function Tile({ org }: { org: CarouselOrg }) {
  return (
    <li className="flex h-16 w-[33.333vw] shrink-0 items-center justify-center px-4 sm:w-[25vw] lg:w-[min(16.666vw,12rem)]" aria-label={org.name}>
      {/* Solid black (brightness-0); files are tiny, so they're served as-is. */}
      <Image src={org.logo} alt={org.name} width={140} height={48} unoptimized className="h-9 w-auto max-w-[8.5rem] object-contain brightness-0" />
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
