import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseEditor } from "@/components/marketplace/course-editor";
import { Skeleton } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Edit course", robots: { index: false } };

export default async function ManageCoursePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <CourseEditor moduleId={moduleId} />
    </Suspense>
  );
}
