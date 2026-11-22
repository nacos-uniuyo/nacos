"use client";

import Image from "next/image";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { ArrowRight } from "@/components/icons";
import { SocialIconList } from "@/components/SocialIconList";
import type { PersonSummary } from "@/server/contracts";

type Props = {
  alum: PersonSummary;
  deptName: string | null;
  sessionName: string;
};

export function getAlumniInitials(name: string): string {
  const parts = name.replace(/[^a-zA-Z\s]/g, "").trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "FC";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AlumniCard({ alum, deptName, sessionName }: Props) {
  const initials = getAlumniInitials(alum.fullName);

  return (
    <article className="yearbook-card group relative">
      <div>
        {/* Card Media Header */}
        <div className="yearbook-card-media">
          {alum.photoUrl ? (
            <Image
              src={alum.photoUrl}
              alt={alum.fullName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative select-none">
              <svg
                viewBox="0 0 200 200"
                className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <circle cx="100" cy="100" r="70" stroke="rgba(216,180,92,0.6)" fill="none" />
                <circle cx="100" cy="100" r="92" stroke="rgba(255,255,255,0.2)" strokeDasharray="3 6" fill="none" />
                <circle cx="100" cy="30" r="4" fill="#D8B45C" />
              </svg>
              <span className="serif text-5xl text-[var(--gold)] font-normal tracking-wide">
                {initials}
              </span>
            </div>
          )}

          <span className="absolute left-3.5 bottom-3 px-2.5 py-1 rounded-md bg-[rgba(6,42,20,0.85)] backdrop-blur-sm border border-[rgba(255,255,255,0.12)] text-[11px] font-semibold text-[var(--gold)]">
            {sessionName.replace(" Academic Session", "")}
          </span>
        </div>

        {/* Card Body */}
        <div className="yearbook-card-body">
          <div className="flex items-center justify-between gap-2">
            {deptName ? (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--forest)]">
                Department of {deptName}
              </span>
            ) : (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Faculty of Computing
              </span>
            )}

            {alum.matricNumber && (
              <span className="text-[10px] font-mono font-medium text-[var(--muted)] tracking-wide">
                {alum.matricNumber}
              </span>
            )}
          </div>

          <div>
            <h3 className="serif text-xl text-[var(--ink)] leading-snug group-hover:text-[var(--green)] transition-colors m-0">
              <Link
                href={`/yearbook/${alum.slug}`}
                className="before:absolute before:inset-0 before:z-10 no-underline text-inherit hover:text-[var(--green)]"
              >
                {alum.fullName}
              </Link>
            </h3>
            <p className="text-xs font-semibold text-[var(--forest)] mt-1 mb-0 line-clamp-1">
              {alum.roleTitle}
            </p>
          </div>

          {(alum.currentRole || alum.currentCompany) && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--ink)] font-medium pt-1">
              <Briefcase size={13} className="text-[var(--muted)] shrink-0" />
              <span className="line-clamp-1">
                {alum.currentRole}
                {alum.currentRole && alum.currentCompany ? " at " : ""}
                <strong className="font-semibold">{alum.currentCompany}</strong>
              </span>
            </div>
          )}

          {alum.quote && (
            <p className="text-xs text-[var(--muted)] leading-relaxed italic border-l-2 border-[var(--gold)] pl-2.5 my-1.5 line-clamp-2">
              &ldquo;{alum.quote}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Card Footer: Social icons sit above the full-card click layer */}
      {alum.socials && alum.socials.length > 0 && (
        <div className="yearbook-card-footer relative z-20">
          <SocialIconList socials={alum.socials} size="sm" />
        </div>
      )}
    </article>
  );
}
