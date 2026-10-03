import { Briefcase, Crown, Plane, Scale, Sparkles, Stethoscope, Users, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/primitives";

/** Premium content marker (crown), used wherever Premium is shown. */
export function PremiumBadge({ label = "Premium" }: { label?: string }) {
  return (
    <Badge>
      <Crown className="h-3 w-3" aria-hidden />
      {label}
    </Badge>
  );
}

export function FreeBadge({ label = "Free" }: { label?: string }) {
  return (
    <Badge tone="accent">
      <Sparkles className="h-3 w-3" aria-hidden />
      {label}
    </Badge>
  );
}

const industryIcons: Record<string, LucideIcon> = {
  medical: Stethoscope,
  legal: Scale,
  immigration: Plane,
  community: Users,
  business: Briefcase,
};

/** Small category icon for modules. */
export function IndustryIcon({ category, className = "h-4 w-4" }: { category: string; className?: string }) {
  const Icon = industryIcons[category] ?? Users;
  return <Icon className={className} aria-hidden />;
}
