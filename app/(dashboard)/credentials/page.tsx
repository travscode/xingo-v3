import { redirect } from "next/navigation";

/** Credentials were mock data; achievements now live on the Progress page. */
export default function CredentialsPage() {
  redirect("/progress");
}
