import type { Metadata } from "next";
import { CourseWizard } from "@/components/marketplace/course-wizard";

export const metadata: Metadata = { title: "Create a course", robots: { index: false } };

export default async function NewCoursePage({ searchParams }: { searchParams: Promise<{ org?: string | string[] }> }) {
  const { org } = await searchParams;
  return <CourseWizard orgHandle={typeof org === "string" ? org : undefined} />;
}
