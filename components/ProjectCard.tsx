import Image from "next/image";
import Link from "next/link";

export interface ProjectCardProps {
  slug: string;
  title: string;
  tagline: string;
  categoryLabel: string;
  courseCode?: string | null;
  teamDisplayName?: string | null;
  coverSubtitle?: string;
  index: number;
  surfaceClassName?: string;
  bannerUrl?: string | null;
}

export function ProjectCard({
  slug,
  title,
  tagline,
  categoryLabel,
  courseCode,
  teamDisplayName,
  coverSubtitle,
  index,
  surfaceClassName = "bg-[var(--sand)]",
  bannerUrl,
}: ProjectCardProps) {
  const initials = (teamDisplayName ?? "NACOS")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <Link
      href={`/projects/${slug}`}
      className={`group flex flex-col no-underline text-inherit ${surfaceClassName} rounded-xl border border-[var(--rule)] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300`}
    >
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[var(--forest)]">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={title}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-black/45 via-black/10 to-black/10">
          <div className="flex items-center justify-between gap-2">
            <span className="caps text-[10px] font-semibold tracking-wider text-[var(--gold)]">
              {categoryLabel}
            </span>
            {courseCode ? (
              <span className="caps text-[10px] text-[var(--mint-2)]">
                {courseCode}
              </span>
            ) : null}
          </div>

          <div>
            <span className="serif text-4xl sm:text-5xl text-[var(--mint)] leading-none block">
              {courseCode ?? `0${index + 1}`}
            </span>
            {coverSubtitle ? (
              <span className="caps text-[10px] text-[var(--mint-2)] mt-1.5 block">
                {coverSubtitle}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-3 flex-1 justify-between">
        <div className="flex flex-col gap-1.5">
          <h3 className="serif text-2xl text-[var(--ink)] group-hover:text-[var(--green)] dark:group-hover:text-white transition-colors m-0 leading-snug">
            {title}
          </h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed m-0 line-clamp-3">
            {tagline}
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--rule-soft)] flex items-center justify-between text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--forest)] text-[var(--mint)] text-[10px] font-semibold flex items-center justify-center shrink-0">
              {initials || "N"}
            </div>
            <span className="font-medium text-[var(--ink)] line-clamp-1">
              {teamDisplayName ?? initials}
            </span>
          </div>
          <span className="text-xs text-[var(--muted)] whitespace-nowrap">
            2024/2025
          </span>
        </div>
      </div>
    </Link>
  );
}
