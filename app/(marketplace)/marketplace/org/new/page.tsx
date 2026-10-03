import type { Metadata } from "next";
import { CreateOrg } from "@/components/orgs/create-org";

export const metadata: Metadata = { title: "Create an organisation", robots: { index: false } };

export default function NewOrgPage() {
  return <CreateOrg />;
}
