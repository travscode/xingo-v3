/**
 * Course status (D-043), shared by Convex (enforcement) and the UI (display).
 * Keep framework-free.
 *
 * "coming_soon" courses stay listed in the library but can't be opened or practised,
 * except by platform admins. A missing status means available.
 */

export type CourseStatus = "available" | "coming_soon";

export const courseStatusOptions: Array<{ value: CourseStatus; label: string }> = [
  { value: "available", label: "Available" },
  { value: "coming_soon", label: "Coming soon" },
];

export function isComingSoon(course: { status?: CourseStatus }) {
  return course.status === "coming_soon";
}

/**
 * Launch line-up (Oct 2026): NAATI CCL plus one free course are open; every other
 * XINGO course is "coming soon". Applied once by `migrations:applyCclLaunchStatuses`;
 * after that admins change statuses in the content studio.
 */
export const LAUNCH_AVAILABLE_COURSE_IDS = ["naati-certification-practice-ccl", "medical-er-intake"] as const;

/**
 * Public pages don't load Convex (D-032), so they read the launch line-up instead of
 * live statuses. Update LAUNCH_AVAILABLE_COURSE_IDS when a course opens.
 */
export function courseOpenAtLaunch(moduleId: string) {
  return (LAUNCH_AVAILABLE_COURSE_IDS as readonly string[]).includes(moduleId);
}

/** CCL dialogues playable on the Free plan, so CCL visitors can try the test format before paying. */
export const LAUNCH_CCL_FREE_PREVIEW_IDS = ["ccl-faulty-product-refund", "ccl-medical-scan-booking"] as const;
