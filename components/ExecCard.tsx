import { initials, type Executive } from "@/lib/executives";

export function ExecCard({ exec, index }: { exec: Executive; index: number }) {
  return (
    <article className="exec-card" id={exec.slug}>
      <div className={`monogram${index % 2 ? " alt" : ""}`} aria-hidden="true">
        <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice">
          <circle cx="100" cy="125" r="78" fill="none" stroke="rgba(216,180,92,.35)" />
          <circle cx="100" cy="125" r="104" fill="none" stroke="rgba(255,255,255,.08)" strokeDasharray="2 7" />
          <circle cx="100" cy="21" r="3" fill="#D8B45C" />
        </svg>
        <span className="letters serif">{initials(exec.name)}</span>
        <span className="tag caps">4th Exco</span>
      </div>
      <div className="exec-meta">
        <span className="role caps">{exec.role}</span>
        <h3 className="name serif">
          {exec.name}
        </h3>
      </div>
    </article>
  );
}
