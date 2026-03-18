"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ModuleCard } from "@/components/modules/module-card";

export function LiveModulesGrid() {
  const modules = useQuery(api.modules.list, {});

  if (!modules) {
    return (
      <section className="section-frame rounded-[2rem] p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="surface-card h-72 rounded-[2rem] animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="section-frame rounded-[2rem] p-6">
      <p className="eyebrow">Learning modules</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {modules.map((module) => (
          <ModuleCard key={module._id} module={module} />
        ))}
      </div>
    </section>
  );
}
