import { Info } from "lucide-react";

export const HOME_AFFAIRS_URL = "https://immi.homeaffairs.gov.au/";
export const OMARA_REGISTER_URL = "https://portal.mara.gov.au/search-the-register-of-migration-agents/";

/**
 * "General information, not migration advice" notice for /migrate-to-australia
 * and its guides. Only registered migration agents, Australian legal
 * practitioners and exempt persons may give immigration assistance — keep this
 * wording when editing.
 */
export function MigrationDisclaimer({ className }: { className?: string }) {
  return (
    <aside
      aria-label="General information, not migration advice"
      className={`flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-[15px] leading-6 sm:p-5 ${className ?? ""}`}
    >
      <Info size={20} className="mt-0.5 shrink-0" aria-hidden />
      <p className="text-gray-700">
        <strong className="text-ink">General information, not migration advice.</strong> Visa rules change — check the{" "}
        <a href={HOME_AFFAIRS_URL} target="_blank" rel="noopener" className="font-semibold text-ink underline underline-offset-4">
          Department of Home Affairs
        </a>{" "}
        and speak to a{" "}
        <a href={OMARA_REGISTER_URL} target="_blank" rel="noopener" className="font-semibold text-ink underline underline-offset-4">
          registered migration agent
        </a>{" "}
        about your situation.
      </p>
    </aside>
  );
}
