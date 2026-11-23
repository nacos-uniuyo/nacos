import Image from "next/image";
import deanPlaceholder from "@/assets/images/dean-placeholder.webp";
import type { DeansMessageSummary } from "@/server/contracts";

type DeanWelcomeProps = {
  message: DeansMessageSummary;
};

export function DeanWelcome({ message }: DeanWelcomeProps) {
  return (
    <section id="dean-welcome" className="pt-[clamp(64px,7vw,96px)] pb-[clamp(48px,5vw,64px)] bg-[var(--paper)] border-b border-[var(--rule)]" aria-labelledby="dean-title">
      <div className="wrap grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-9 items-center">
        <div className="md:col-span-3 flex flex-col items-center gap-4">
          <Image
            src={deanPlaceholder}
            alt={`${message.authorName}, ${message.authorTitle}`}
            width={220}
            height={220}
            className="w-[clamp(180px,20vw,220px)] aspect-square rounded-full border-3 border-[var(--gold)] object-cover shadow-sm"
          />
        </div>

        <div className="md:col-span-9 flex flex-col gap-4">
          <h2 id="dean-title" className="serif m-0 text-[clamp(32px,3.5vw,44px)] text-[var(--forest)] leading-[1.1] tracking-[-0.01em]">
            {message.heading}
          </h2>
          <blockquote className="serif m-0 pl-5 border-l-2 border-[var(--gold)] text-[clamp(18px,1.8vw,22px)] leading-relaxed text-[var(--forest)]">
            <p className="m-0">{message.body}</p>
          </blockquote>
          <figcaption className="flex flex-col gap-1 mt-2">
            <strong className="text-base font-bold text-[var(--ink)]">{message.authorName}</strong>
            <span className="text-sm text-[var(--muted)]">{message.authorTitle}</span>
          </figcaption>
        </div>
      </div>
    </section>
  );
}
