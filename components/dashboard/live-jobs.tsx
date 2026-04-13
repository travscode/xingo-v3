"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function LiveJobs() {
  const jobs = useQuery(api.jobs.listVisible, {});

  if (!jobs) {
    return <div className="surface-card h-80 rounded-[2rem] animate-pulse" />;
  }

  return (
    <section className="space-y-6">
      <div className="section-frame rounded-[2.25rem] p-6 lg:p-8">
        <p className="eyebrow">Jobs</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">See available work.</h1>
      </div>
      <div className="grid gap-5">
        {jobs.map((job) => (
          <article key={job._id} className="surface-card rounded-[2rem] p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{job.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{job.description}</p>
              </div>
              <div className="rounded-full border border-line px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                {job.status}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted">
              <span>{job.date}</span>
              <span>{job.location}</span>
              <span>{job.payRate}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
