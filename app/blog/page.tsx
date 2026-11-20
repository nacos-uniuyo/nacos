import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, UniuyoCrest } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { breadcrumbSchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

export const metadata: Metadata = {
  title: "Faculty Newsroom & Blog",
  description:
    "Official announcements, executive council meeting recaps, SIWES orientation briefings, press releases, and departmental newsletters from NACOS UNIUYO and the Faculty of Computing, University of Uyo.",
  alternates: { canonical: "/blog" },
  openGraph: {
    ...ogDefaults,
    url: "/blog",
    title: "Faculty Newsroom & Blog · NACOS UNIUYO",
    description:
      "Official announcements, press releases, and departmental dispatches from NACOS UNIUYO.",
  },
};

function formatPublishedDate(iso: string | null) {
  if (!iso) return "Official Dispatch";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function BlogPage() {
  const caller = appRouter.createCaller({ session: null });
  const [posts, featuredPosts] = await Promise.all([
    caller.post.list(),
    caller.post.list({ featuredOnly: true }),
  ]);

  const leadPost = featuredPosts[0] ?? posts[0] ?? null;

  return (
    <>
      <section className="page-hero" aria-labelledby="blog-hero-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ NEWSROOM }" />

        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li aria-current="page">Newsroom &amp; Blog</li>
            </ol>
          </nav>

          <div className="hero-cobrand-pill">
            <UniuyoCrest size={20} />
            <span className="caps">Official Faculty &amp; Chapter Dispatches · UNIUYO</span>
          </div>

          <h1 id="blog-hero-title" className="serif">
            Faculty <span className="it gold">Newsroom</span>
          </h1>
          <p>
            Official announcements, executive council meeting recaps, SIWES orientation briefings, and departmental
            newsletters published by the Directorate of Information and Public Relations.
          </p>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="Published Dispatches">
        <div className="wrap">
          <div className="portal-explorer-stack">
            {/* Featured Lead Dispatch */}
            {leadPost ? (
              <article className="blog-featured-banner card">
                <div className="blog-featured-visual">
                  {leadPost.coverUrl ? (
                    <Image
                      src={leadPost.coverUrl}
                      alt={leadPost.title}
                      fill
                      sizes="(max-width: 960px) 100vw, 560px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="blog-featured-art" aria-hidden="true">
                      <UniuyoCrest size={64} />
                      <span className="caps text-[11px] text-[var(--gold)]">
                        NACOS UNIUYO · Official Press Release
                      </span>
                    </div>
                  )}
                </div>

                <div className="blog-featured-content">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="caps project-cat-pill">Featured Dispatch</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                      <Calendar size={14} />
                      <time dateTime={leadPost.publishedAt ?? undefined}>
                        {formatPublishedDate(leadPost.publishedAt)}
                      </time>
                    </span>
                  </div>

                  <h2 className="serif blog-featured-title">
                    <Link href={`/blog/${leadPost.slug}`}>{leadPost.title}</Link>
                  </h2>

                  <p className="blog-featured-excerpt">{leadPost.excerpt}</p>

                  <footer className="blog-featured-foot">
                    <div className="flex flex-col gap-0.5">
                      <span className="caps text-[10px] text-[var(--muted)]">Editorial Desk</span>
                      <span className="text-xs font-semibold text-[var(--ink)]">
                        Directorate of Information &amp; Software · NACOS UNIUYO
                      </span>
                    </div>

                    <Link href={`/blog/${leadPost.slug}`} className="btn btn-dark btn-sm">
                      <span>Read Full Article</span>
                      <ArrowRight size={15} />
                    </Link>
                  </footer>
                </div>
              </article>
            ) : null}

            {/* All Published Articles Grid */}
            <div className="section-head pt-4">
              <div>
                <span className="caps eyebrow accent">Chronological Archive</span>
                <h2 className="serif text-4xl">All Published Dispatches</h2>
              </div>
              <span className="caps text-xs text-[var(--muted)]">
                {posts.length} Verified Article{posts.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="dept-notices-grid">
              {posts.map((post) => (
                <article key={post.slug} className="dept-notice-card card reveal">
                  <div className="dept-notice-meta">
                    <span className="caps dept-notice-badge">
                      {post.featured ? "Featured Release" : "Official Notice"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                      <Calendar size={13} />
                      <time dateTime={post.publishedAt ?? undefined}>
                        {formatPublishedDate(post.publishedAt)}
                      </time>
                    </span>
                  </div>

                  <h3 className="serif dept-notice-title">
                    <Link href={`/blog/${post.slug}`} className="text-[var(--ink)] no-underline hover:text-[var(--green)]">
                      {post.title}
                    </Link>
                  </h3>

                  <p className="dept-notice-excerpt">{post.excerpt}</p>

                  <footer className="dept-notice-foot">
                    <span className="caps text-[10px] text-[var(--green)]">
                      NACOS UNIUYO Newsroom
                    </span>
                    <Link href={`/blog/${post.slug}`} className="text-link text-sm">
                      <span>Read Article</span>
                      <ArrowRight size={15} />
                    </Link>
                  </footer>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Newsroom", path: "/blog" },
        ])}
      />
    </>
  );
}
