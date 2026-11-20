type P = { size?: number; className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function ArrowRight({ size = 18, stroke = 2, className }: P & { stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth={stroke} className={className} {...base}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowDown({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth={2} className={className} {...base}>
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </svg>
  );
}

export function ChevronLeft({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth={2} className={className} {...base}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRight({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth={2} className={className} {...base}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function Calendar({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth={1.8} className={className} {...base}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

export function Clock({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth={1.8} className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function Pin({ size = 18, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth={1.8} className={className} {...base}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function Menu({ open }: { open: boolean }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" strokeWidth={2} {...base}>
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 8h16" />
          <path d="M4 16h16" />
        </>
      )}
    </svg>
  );
}

export function QuoteMark({ size = 28, className }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9.6 18.4c2.4 0 4.4 1.9 4.4 4.3 0 2.4-2 4.3-4.4 4.3-3.1 0-5.6-2.6-5.6-6.8C4 12.1 9.1 6.7 13.3 5l1.3 2.1c-3.3 1.7-6.2 5.3-6.5 9.6.5-.2 1-.3 1.5-.3Zm14 0c2.4 0 4.4 1.9 4.4 4.3 0 2.4-2 4.3-4.4 4.3-3.1 0-5.6-2.6-5.6-6.8 0-8.1 5.1-13.5 9.3-15.2l1.3 2.1c-3.3 1.7-6.2 5.3-6.5 9.6.5-.2 1-.3 1.5-.3Z" />
    </svg>
  );
}

export function GithubIcon({ size = 18, className }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.92.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.02 11.02 0 0 1 5.78 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

/**
 * Clean vector crest representing the University of Uyo (UNIUYO) institutional insignia:
 * Circular university seal with heraldic shield, open book of knowledge, rising sun/star,
 * palm motif, and gold/emerald academic heraldry.
 */
export function UniuyoCrest({ size = 48, className }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="University of Uyo Insignia"
    >
      {/* Outer seal ring */}
      <circle cx="32" cy="32" r="30.5" fill="#062A14" stroke="#D8B45C" strokeWidth="2.2" />
      <circle cx="32" cy="32" r="26.5" stroke="#D8B45C" strokeWidth="0.9" strokeDasharray="2 2" opacity="0.85" />

      {/* Laurel / Palm wreath arcs */}
      <path
        d="M14 38C12 30 15 20 22 15"
        stroke="#D8B45C"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M50 38C52 30 49 20 42 15"
        stroke="#D8B45C"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Heraldic Shield */}
      <path
        d="M19 16H45V30.5C45 40.2 38.8 46.8 32 49.5C25.2 46.8 19 40.2 19 30.5V16Z"
        fill="#FDFBF6"
        stroke="#D8B45C"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Shield upper chief band (Emerald green) */}
      <path d="M20 17H44V25.5H20V17Z" fill="#007A1E" />

      {/* Rising Sun / Star of Unity & Knowledge in chief */}
      <circle cx="32" cy="21.2" r="2.6" fill="#D8B45C" />
      <path
        d="M32 17.5V18.3M32 24.1V24.9M28.3 21.2H29.1M34.9 21.2H35.7M29.4 18.6L30 19.2M34 23.2L34.6 23.8M34.6 18.6L34 19.2M30 23.2L29.4 23.8"
        stroke="#D8B45C"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Shield lower division lines */}
      <path d="M20 25.5H44" stroke="#D8B45C" strokeWidth="1.3" />

      {/* Open Book of Learning inside Shield */}
      <path
        d="M24 30.5C26.5 29.7 29.5 30 32 31.4C34.5 30 37.5 29.7 40 30.5V39.2C37.5 38.4 34.5 38.7 32 40.1C29.5 38.7 26.5 38.4 24 39.2V30.5Z"
        fill="#062A14"
        stroke="#062A14"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M25.2 31.6C27.3 31 29.8 31.3 32 32.5C34.2 31.3 36.7 31 38.8 31.6V37.8C36.7 37.2 34.2 37.5 32 38.7C29.8 37.5 27.3 37.2 25.2 37.8V31.6Z"
        fill="#FFFFFF"
      />
      <path d="M32 32.2V38.8" stroke="#D8B45C" strokeWidth="1.2" />

      {/* Torch / Palm stem accent below book */}
      <path d="M28.5 43.2H35.5" stroke="#007A1E" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="32" cy="45.6" r="1.2" fill="#D8B45C" />

      {/* Motto ribbon scroll at base */}
      <path
        d="M15 52.5C20.5 55.2 26 56.4 32 56.4C38 56.4 43.5 55.2 49 52.5"
        stroke="#D8B45C"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
