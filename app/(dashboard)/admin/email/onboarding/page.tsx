import { AdminGate } from "@/components/admin/admin-gate";
import { OnboardingSeriesPage } from "@/components/admin/email/onboarding-series-page";

export const metadata = { title: "Onboarding series · Admin" };

export default function Page() {
  return (
    <AdminGate>
      <OnboardingSeriesPage />
    </AdminGate>
  );
}
