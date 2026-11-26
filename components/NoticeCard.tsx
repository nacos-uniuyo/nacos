import Image from "next/image";
import Link from "next/link";

export interface NoticeCardProps {
  href: string;
  isExternal?: boolean;
  dateLabel: string;
  badgeLabel: string;
  secondaryBadge?: {
    label: string;
    highlight?: boolean;
  };
  eyebrow: string;
  title: string;
  excerpt?: string | null;
  imageUrl?: string | null;
}

export function NoticeCard({
  href,
  isExternal = false,
  dateLabel,
  badgeLabel,
  secondaryBadge,
  eyebrow,
  title,
  excerpt,
  imageUrl,
}: NoticeCardProps) {
  const linkProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={href}
      {...linkProps}
      className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] rounded-2xl group cursor-pointer no-underline text-inherit"
    >
      <div className="h-full min-h-[380px] sm:min-h-[420px] flex flex-col justify-between overflow-hidden relative border border-white/10 bg-[#0e1713] rounded-2xl p-0 py-0 gap-0 transition-all duration-500 hover:shadow-2xl hover:border-white/20 select-none">
        {imageUrl && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            {imageUrl.startsWith("http") ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            )}
          </div>
        )}

        <div
          className="absolute inset-0 z-[1] pointer-events-none backdrop-blur-[6px] overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0) 100%)",
          }}
        />

        <div
          className="absolute inset-0 z-[2] pointer-events-none transition-opacity duration-500 group-hover:opacity-95"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.25) 35%, rgba(0, 0, 0, 0.68) 65%, rgba(0, 0, 0, 0.90) 100%)",
          }}
        />

        <div className="relative z-10 px-5 sm:px-6 pt-5 sm:pt-6 pb-0 flex items-center justify-between gap-2">
          <span className="text-xs font-mono font-medium text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] uppercase tracking-wider">
            {dateLabel}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="text-[11px] font-mono bg-black/40 text-white/95 border border-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-normal shadow-sm">
              {badgeLabel}
            </span>
            {secondaryBadge && (
              <span
                className={
                  secondaryBadge.highlight
                    ? "text-[10px] font-mono bg-black/30 text-[var(--gold)] border border-[rgba(217,163,66,0.3)] backdrop-blur-xs px-2 py-0.5 rounded-full font-normal"
                    : "text-[10px] font-mono bg-black/30 text-white/80 border border-white/15 backdrop-blur-xs px-2 py-0.5 rounded-full font-normal"
                }
              >
                {secondaryBadge.label}
              </span>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-auto px-5 sm:px-6 pt-2 pb-5 sm:pb-6 flex flex-col justify-end">
          <p className="text-[11px] font-mono uppercase tracking-wider text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mb-1.5">
            {eyebrow}
          </p>

          <h3 className="font-mono text-xl sm:text-2xl font-bold leading-snug text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {title}
          </h3>

          {excerpt && (
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-3 mb-0">
              {excerpt}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
