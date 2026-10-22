/**
 * "Preview as" for platform admins (D-044), shared by Convex and the UI. Keep framework-free.
 *
 * While previewing, an admin gets a member's experience everywhere learners are gated
 * (courses, coming-soon, marketplace, minutes, plan) with a new account's balance.
 * Admin tools still check the real role, so the admin can always switch back.
 */

export type PreviewAs = "free" | "pack" | "professional";

export const previewOptions: Array<{ value: PreviewAs; label: string; description: string }> = [
  { value: "free", label: "Free member", description: "A new account on the Free plan." },
  { value: "pack", label: "Free member with a minute pack", description: "Free plan plus the CCL Starter pack." },
  { value: "professional", label: "Pro member", description: "A new Pro subscriber." },
];

export function previewLabel(previewAs: PreviewAs) {
  return previewOptions.find((option) => option.value === previewAs)?.label ?? "Member";
}
