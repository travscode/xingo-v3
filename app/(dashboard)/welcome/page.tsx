import { Suspense } from "react";
import { WelcomeFlow } from "@/components/onboarding/welcome-flow";

export const metadata = { title: "Welcome" };

export default function WelcomePage() {
  return (
    <Suspense fallback={null}>
      <WelcomeFlow />
    </Suspense>
  );
}
