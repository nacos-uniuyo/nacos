import Image from "next/image";
import deanPlaceholder from "@/assets/images/dean-placeholder.webp";
import type { DeansMessageSummary } from "@/server/contracts";

type DeanWelcomeProps = {
  message: DeansMessageSummary;
};

export function DeanWelcome({ message }: DeanWelcomeProps) {
  return (
    <section id="dean-welcome" className="dean-welcome-section" aria-labelledby="dean-title">
      <div className="wrap">
        <div className="dean-portrait-container">
          <Image
            src={deanPlaceholder}
            alt={`${message.authorName}, ${message.authorTitle}`}
            width={220}
            height={220}
            className="dean-portrait-img object-cover"
          />
        </div>

        <div className="dean-content">
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
