import type { StaticImageData } from "next/image";

type HeroOrbitsProps = {
  label?: string;
  className?: string;
  logoSrc?: string;
  logoImage?: StaticImageData;
};

/**
 * Each mark is a single-stroke glyph drawn in a 34x34 box, standing for a field
 * that computing works inside. They ride the rotating ring and counter-rotate so
 * they never read upside down.
 */
const FIELD_GLYPHS: { field: string; angle: number; tone: string; path: React.ReactNode }[] = [
  {
    field: "Health",
    angle: 0,
    tone: "rgba(216,180,92,.55)",
    path: <path d="M1 18h8l3-8 5 16 4-10 2.5 2H33" />,
  },
  {
    field: "Chemistry",
    angle: 60,
    tone: "rgba(255,255,255,.38)",
    path: (
      <>
        <path d="M17 4l11.3 6.5v13L17 30 5.7 23.5v-13L17 4z" />
        <path d="M17 4v6M28.3 23.5l-5.2-3M5.7 23.5l5.2-3" />
      </>
    ),
  },
  {
    field: "Biology",
    angle: 120,
    tone: "rgba(216,180,92,.55)",
    path: (
      <>
        <path d="M11 3c0 8 12 8 12 14s-12 6-12 14" />
        <path d="M23 3c0 8-12 8-12 14s12 6 12 14" />
        <path d="M12.5 9h9M11.6 17h10.8M12.5 25h9" />
      </>
    ),
  },
  {
    field: "Finance",
    angle: 180,
    tone: "rgba(255,255,255,.38)",
    path: (
      <>
        <path d="M2 27l10-10 6 5 13-14" />
        <path d="M24 8h7v7" />
      </>
    ),
  },
  {
    field: "Networks",
    angle: 240,
    tone: "rgba(216,180,92,.55)",
    path: (
      <>
        <path d="M4 14a18 18 0 0126 0M9 19.5a11 11 0 0116 0M14 25a4.5 4.5 0 016 0" />
        <circle cx="17" cy="29.5" r="1.6" />
      </>
    ),
  },
  {
    field: "Agriculture",
    angle: 300,
    tone: "rgba(255,255,255,.38)",
    path: (
      <>
        <path d="M29 5C13 5 6 12 6 22c0 4 2 7 2 7s14 1 19-7c3.5-5.6 2-17 2-17z" />
        <path d="M8 29C12 20 19 13 27 8" />
      </>
    ),
  },
];

const CENTRE = 430;
const FIELD_RADIUS = 330;

function polar(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: CENTRE + radius * Math.cos(rad), y: CENTRE + radius * Math.sin(rad) };
}

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

        {/* Spokes from the core out to each field, so the centre reads as what connects them. */}
        {FIELD_GLYPHS.map(({ field, angle }) => {
          const from = polar(angle, 168);
          const to = polar(angle, 300);
          return (
            <line
              key={`spoke-${field}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="rgba(216,180,92,.22)"
              strokeDasharray="2 7"
            />
          );
        })}

        {FIELD_GLYPHS.map(({ field, angle, tone, path }) => {
          const { x, y } = polar(angle, FIELD_RADIUS);
          return (
            <g key={field} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
              <g className="orbit-upright">
                <g
                  transform="translate(-17 -17)"
                  stroke={tone}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                >
                  {path}
                </g>
              </g>
            </g>
          );
        })}
      </g>

      <g className="orbit-rev">
        <circle cx="430" cy="430" r="240" stroke="rgba(255,255,255,.14)" />
        <circle cx="190" cy="430" r="5" fill="#009424" />
        <circle cx="430" cy="190" r="3" fill="rgba(216,180,92,.6)" />
        <circle cx="670" cy="430" r="3" fill="rgba(255,255,255,.35)" />
      </g>

      <circle cx="430" cy="430" r="150" stroke="rgba(216,180,92,.35)" />
      {label ? (
        <text
          x="430"
          y="438"
          textAnchor="middle"
          fill="rgba(255,255,255,.35)"
          fontFamily="var(--font-outfit), sans-serif"
          fontSize="14"
          letterSpacing="3"
          className="hidden md:block"
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
