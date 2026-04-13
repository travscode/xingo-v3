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

  const starterModules = modules.filter((module) => module.isFree);
  const advancedModules = modules.filter((module) => !module.isFree);

  return (
    <div className="space-y-8">
      <section className="section-frame rounded-[2.25rem] p-6 lg:p-8">
        <p className="eyebrow">Modules</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">Choose one thing to practice.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Start with a free module, or go straight to a professional scenario if you already know the area you want.
        </p>
      </section>

      <section className="space-y-5">
        <div>
          <p className="eyebrow">Start here</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Free modules</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {(starterModules.length > 0 ? starterModules : modules).map((module) => (
            <ModuleCard key={module._id} module={module} />
          ))}
        </div>
      </section>

      {advancedModules.length > 0 ? (
        <section className="space-y-5">
          <div>
            <p className="eyebrow">Go deeper</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Professional modules</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {advancedModules.map((module) => (
              <ModuleCard key={module._id} module={module} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
