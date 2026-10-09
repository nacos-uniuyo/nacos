import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found">
      <div className="wrap">
        <span className="eyebrow caps accent">Error 404</span>
        <h1 className="h2 serif">
          This page has <span className="it accent">moved on.</span>
        </h1>
        <p className="lead">The link may be old or mistyped. Try the homepage or the events list.</p>
        <div className="cta-row">
          <Link className="btn btn-dark" href="/">
            Back home
          </Link>
          <Link className="btn btn-line" href="/events">
            Events
          </Link>
        </div>
      </div>
    </section>
  );
}
