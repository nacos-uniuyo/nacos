export function HeroOrbits({ label = "{ UNIUYO }", className = "hero-orbits fade d2" }) {
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
