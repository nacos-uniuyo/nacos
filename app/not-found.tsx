import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center">
      <div className="wrap flex flex-col gap-6 items-start">
        <span className="eyebrow caps accent">Error 404</span>
        <h1 className="h2 serif">
          This page has <span className="accent">moved on.</span>
        </h1>
        <p className="lead">The link may be old or mistyped. Try the homepage or the events list.</p>
        <div className="flex flex-wrap items-center gap-3.5">
          <Button asChild variant="dark">
            <Link href="/">
              Back home
            </Link>
          </Button>
          <Button asChild variant="line">
            <Link href="/events">
              Events
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
