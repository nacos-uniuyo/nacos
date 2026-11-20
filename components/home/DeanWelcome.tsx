import type { DeansMessageSummary } from "@/server/contracts";

type DeanWelcomeProps = {
  message: DeansMessageSummary;
};

export function DeanWelcome({ message }: DeanWelcomeProps) {
  return (
    <section id="dean-welcome" className="dean-welcome-section" aria-labelledby="dean-title">
      <div className="wrap">
        <div className="dean-portrait-container">
          {message.portraitUrl ? (
            <img
              src={message.portraitUrl}
              alt={`${message.authorName}, ${message.authorTitle}`}
              className="dean-portrait-img"
            />
          ) : (
            <div className="dean-portrait-placeholder" aria-label="Portrait placeholder">
              <svg
                className="dean-placeholder-svg"
                viewBox="0 0 160 160"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="80" cy="80" r="78" stroke="rgba(216,180,92,.35)" strokeWidth="2" />
                <circle cx="80" cy="62" r="28" fill="rgba(216,180,92,.22)" />
                <path
                  d="M34 134C34 108 54 98 80 98C106 98 126 108 126 134"
                  fill="rgba(216,180,92,.22)"
                />
              </svg>
              <span className="dean-placeholder-initials">
                {message.authorName
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
          )}
        </div>

        <div className="dean-content">
          <span className="eyebrow caps dean-kicker">Welcome Address</span>
          <h2 id="dean-title" className="serif dean-heading">
            {message.heading}
          </h2>
          <blockquote className="serif dean-body">
            <p>{message.body}</p>
          </blockquote>
          <figcaption className="dean-author">
            <strong className="dean-author-name">{message.authorName}</strong>
            <span className="dean-author-title">{message.authorTitle}</span>
          </figcaption>
        </div>
      </div>
    </section>
  );
}
