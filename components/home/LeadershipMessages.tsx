import type { DeansMessageSummary, GoodwillSummary } from "@/server/contracts";

type MessageAuthorProps = {
  name: string;
  title: string;
};

function MessageAuthor({ name, title }: MessageAuthorProps) {
  // No portrait is supplied by the fixtures. Text attribution avoids inventing
  // a likeness or displaying a broken image while approved assets are pending.
  return (
    <figcaption className="leadership-author">
      <span className="leadership-author-name">{name}</span>
      <span className="leadership-author-title">{title}</span>
    </figcaption>
  );
}

export function DeanWelcome({ message }: { message: DeansMessageSummary }) {
  return (
    <section className="dean-welcome" aria-labelledby="dean-title">
      <h2 id="dean-title" className="serif">{message.heading}</h2>
      <figure className="dean-message">
        <blockquote className="serif">
          <p>{message.body}</p>
        </blockquote>
        <MessageAuthor name={message.authorName} title={message.authorTitle} />
      </figure>
    </section>
  );
}

export function GoodwillMessages({ messages }: { messages: readonly GoodwillSummary[] }) {
  // An empty selection should not leave a heading promising nonexistent messages.
  if (messages.length === 0) return null;

  return (
    <section className="goodwill" aria-labelledby="goodwill-title">
      <h2 id="goodwill-title" className="serif">Words of goodwill</h2>
      <ul className="goodwill-grid">
        {messages.map((message) => (
          <li key={message.id}>
            <figure className="goodwill-message">
              <blockquote><p>{message.message}</p></blockquote>
              <MessageAuthor name={message.authorName} title={message.authorTitle} />
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

type LeadershipMessagesProps = {
  deansMessage: DeansMessageSummary | null;
  goodwill: readonly GoodwillSummary[];
};

/** Presentational server component: data access belongs to the page's readers. */
export function LeadershipMessages({ deansMessage, goodwill }: LeadershipMessagesProps) {
  if (!deansMessage && goodwill.length === 0) return null;

  return (
    <div id="leadership" className="leadership-messages">
      <div className="wrap">
        {/* TODO: Replace mock names and statements with faculty-approved copy before content sign-off. */}
        {deansMessage && <DeanWelcome message={deansMessage} />}
        <GoodwillMessages messages={goodwill} />
      </div>
    </div>
  );
}
