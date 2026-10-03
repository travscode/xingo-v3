import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/admin-gate";
import { LabIndex } from "@/components/admin/lab/lab-index";

export const metadata: Metadata = { title: "Lab · Admin", robots: { index: false } };

export default function LabPage() {
  return (
    <AdminGate>
      <LabIndex />
    </AdminGate>
  );
}
