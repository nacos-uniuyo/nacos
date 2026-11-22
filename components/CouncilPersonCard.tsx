import Image from "next/image";
import { initials } from "@/lib/executives";
import type { PersonSummary } from "@/server/contracts";

const SIZES = "(max-width: 680px) 46vw, (max-width: 1100px) 31vw, 300px";

type Props = {
  person: PersonSummary;
  index: number;
  priority?: boolean;
  sessionName?: string;
};

export function CouncilPersonCard({ person, index, priority, sessionName }: Props) {
  const sessionTag = sessionName ? sessionName.replace(" Academic Session", "") : "Council";

  return (
    <article className="exec-card" id={person.slug}>
      {person.photoUrl ? (
        <div className="portrait">
          <Image
            src={person.photoUrl}
            alt={`${person.fullName}, ${person.roleTitle}`}
            fill
            sizes={SIZES}
            priority={priority}
          />
          <span className="tag caps" aria-hidden="true">
            {sessionTag}
          </span>
        </div>
      ) : (
        <div className={`monogram${index % 2 ? " alt" : ""}`} aria-hidden="true">
          <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice">
            <circle cx="100" cy="125" r="78" fill="none" stroke="rgba(216,180,92,.35)" />
            <circle cx="100" cy="125" r="104" fill="none" stroke="rgba(255,255,255,.08)" strokeDasharray="2 7" />
            <circle cx="100" cy="21" r="3" fill="#D8B45C" />
          </svg>
          <span className="letters serif">{initials(person.fullName)}</span>
          <span className="tag caps">{sessionTag}</span>
        </div>
      )}
      <div className="exec-meta">
        <span className="role caps">{person.roleTitle}</span>
        <h3 className="name serif">{person.fullName}</h3>
      </div>
    </article>
  );
}
