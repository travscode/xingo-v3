import { AdminGate } from "@/components/admin/admin-gate";
import { NewModulePage } from "@/components/admin/content/module-page";

export const metadata = { title: "New course · Admin" };

export default function Page() {
  return (
    <AdminGate>
      <NewModulePage />
    </AdminGate>
  );
}
