import type { ReactNode } from "react";
import { HeroOrbits } from "@/components/Orbits";

interface PageHeroProps {
  id?: string;
  orbitLabel: string;
  children: ReactNode;
}

export function PageHero({ id, orbitLabel, children }: PageHeroProps) {
  return (
    <section
      className="relative flex min-h-[min(780px,calc(100svh-80px))] items-center overflow-hidden bg-[var(--deep)] py-[clamp(64px,8vw,100px)] text-white"
      aria-labelledby={id}
    >
      <div className="grid-bg drift" aria-hidden="true" />
      <HeroOrbits label={orbitLabel} />
      <div className="wrap relative flex w-full flex-col gap-6">{children}</div>
    </section>
  );
}
