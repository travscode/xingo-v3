import type { Metadata } from "next";
import { CourseWizard } from "@/components/marketplace/course-wizard";

export const metadata: Metadata = { title: "Create a course", robots: { index: false } };

export default function NewCoursePage() {
  return <CourseWizard />;
}
