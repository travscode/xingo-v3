import { credentials } from "@/lib/mock-data";

export default function CredentialsPage() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      {credentials.map((credential) => (
        <article key={credential.title} className="surface-card rounded-[2rem] p-6">
          <p className="eyebrow">Micro-credential</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">{credential.title}</h2>
          <p className="mt-3 text-sm text-muted">{credential.issuer}</p>
          <p className="mt-6 text-sm font-semibold">{credential.status}</p>
        </article>
      ))}
    </section>
  );
}
