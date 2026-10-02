import { Suspense } from "react";
import { AdminConsole } from "@/components/admin/admin-console";

export const metadata = { title: "Admin" };

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminConsole />
    </Suspense>
  );
}
