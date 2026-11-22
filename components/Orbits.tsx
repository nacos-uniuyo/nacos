import type { StaticImageData } from "next/image";

type HeroOrbitsProps = {
  label?: string;
  className?: string;
  logoSrc?: string;
  logoImage?: StaticImageData;
};

export function HeroOrbits({
  label,
  className = "hero-orbits fade d2",
  logoSrc,
  logoImage,
}: HeroOrbitsProps) {
  return (
    <svg className={className} viewBox="0 0 860 860" fill="none" aria-hidden="true">
      <g className="orbit">
        <circle cx="430" cy="430" r="420" stroke="rgba(216,180,92,.28)" />
        <circle cx="430" cy="10" r="5" fill="#D8B45C" />
        <circle cx="430" cy="430" r="330" stroke="rgba(255,255,255,.10)" strokeDasharray="3 9" />
      </g>
      <g className="orbit-rev">
        <circle cx="430" cy="430" r="240" stroke="rgba(255,255,255,.14)" />
        <circle cx="190" cy="430" r="5" fill="#009424" />
        <ellipse cx="430" cy="430" rx="240" ry="90" stroke="rgba(255,255,255,.09)" />
        <ellipse cx="430" cy="430" rx="90" ry="240" stroke="rgba(255,255,255,.09)" />
      </g>
      <circle cx="430" cy="430" r="150" stroke="rgba(216,180,92,.35)" />
      {label ? (
        <text
          x="430"
          y="438"
          textAnchor="middle"
          fill="rgba(255,255,255,.35)"
          fontFamily="var(--font-instrument-sans), sans-serif"
          fontSize="14"
          letterSpacing="3"
        >
          {label}
        </text>
      ) : logoImage || logoSrc ? (
        <image
          href={logoImage?.src ?? logoSrc}
          x="305"
          y="305"
          width="250"
          height="250"
          opacity="0.16"
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <g opacity="0.25" transform="translate(398, 398)">
          {/* Faint placeholder university insignia until custom image asset is provided */}
          <circle cx="32" cy="32" r="30" stroke="#D8B45C" strokeWidth="2" fill="none" />
          <circle cx="32" cy="32" r="26" stroke="#D8B45C" strokeWidth="1" strokeDasharray="2 2" fill="none" />
          <path
            d="M19 16H45V30.5C45 40.2 38.8 46.8 32 49.5C25.2 46.8 19 40.2 19 30.5V16Z"
            stroke="#D8B45C"
            strokeWidth="1.6"
            fill="none"
          />
          <path d="M20 25.5H44" stroke="#D8B45C" strokeWidth="1" />
          <circle cx="32" cy="21" r="2.5" fill="#D8B45C" />
          <path
            d="M24 30.5C26.5 29.7 29.5 30 32 31.4C34.5 30 37.5 29.7 40 30.5V39.2C37.5 38.4 34.5 38.7 32 40.1C29.5 38.7 26.5 38.4 24 39.2V30.5Z"
            stroke="#D8B45C"
            strokeWidth="1"
            fill="none"
          />
        </g>
      )}
    </svg>
  );
}

export function CornerOrbit() {
  return (
    <svg className="orbit-svg" viewBox="0 0 460 460" fill="none" aria-hidden="true">
      <g className="orbit">
        <circle cx="230" cy="230" r="220" stroke="rgba(255,255,255,.22)" />
        <circle cx="230" cy="230" r="150" stroke="rgba(255,255,255,.16)" strokeDasharray="3 8" />
        <circle cx="230" cy="10" r="5" fill="#D8B45C" />
      </g>
    </svg>
  );
}
