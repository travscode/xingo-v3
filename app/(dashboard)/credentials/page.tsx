import Image from "next/image";
import { credentials } from "@/lib/mock-data";

export default function CredentialsPage() {
  return (
    <section className="space-y-6">
      <div className="section-frame rounded-[2.25rem] p-6 lg:p-8">
        <p className="eyebrow">Credentials</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Keep track of earned badges and certificates.</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {credentials.map((credential) => {
          const isUnlocked = credential.status === "Awarded";

          return (
            <article key={credential.title} className="surface-card rounded-[2rem] p-6">
              <p className="eyebrow">Micro-credential</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">{credential.title}</h2>
              <p className="mt-3 text-sm text-muted">{credential.issuer}</p>
              {isUnlocked ? (
                <div className="mt-6">
                  <Image
                    src={credential.badgeImage}
                    alt={`${credential.title} badge`}
                    width={200}
                    height={200}
                    className="h-[200px] w-[200px] rounded-[1.5rem] border border-line bg-white object-cover"
                  />
                </div>
              ) : null}
              <p className="mt-6 text-sm font-semibold">{credential.status}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
