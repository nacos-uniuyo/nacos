import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, Calendar, UniuyoCrest } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import type { RichTextDoc } from "@/db/json";
import { breadcrumbSchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

type Props = {
  params: Promise<{ slug: string }>;
};

const LEGACY_POST_SLUG_REDIRECTS: Record<string, string> = {
  "open-track": "open-track-launch",
  "opentrack-launch": "open-track-launch",
  "siwes-orientation-2026": "siwes-orientation",
  "siwes-400l-orientation": "siwes-orientation",
};

function buildArticleRichTextDoc(slug: string, title: string, excerpt: string): RichTextDoc {
  if (slug === "open-track-launch") {
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: excerpt }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Transparent Governance Across All Five Departments" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Every commitment made by the 4th Executive Council of ",
            },
            {
              type: "text",
              text: "NACOS UNIUYO",
              marks: [{ type: "bold" }],
            },
            {
              type: "text",
              text: " is now indexed with a designated executive owner, live delivery status, and public accountability logs.",
            },
          ],
        },
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "You should not have to wait until the end of an administration's tenure to verify what your elected officers have delivered.",
                },
              ],
            },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Public progress tracking for ", marks: [] },
                    { type: "text", text: "Open-Track", marks: [{ type: "bold" }] },
                    { type: "text", text: " and ", marks: [] },
                    { type: "text", text: "Guide-U", marks: [{ type: "bold" }] },
                    { type: "text", text: " fresher onboarding initiatives." },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Direct departmental coordination across Computer Science, Cybersecurity, Information Systems, Data Analytics, and Software Engineering.",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: excerpt }],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: `Official Faculty Dispatch: ${title}` }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Issued jointly by the Faculty of Computing and the NACOS UNIUYO Directorate of Information and Public Relations for students across all five computing departments at the University of Uyo.",
          },
        ],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Verified industrial training (SIWES) placement matching and logbook supervision schedules.",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Departmental coordinator sign-off requirements and industry partner onboarding.",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

function formatPublishedDate(iso: string | null) {
  if (!iso) return "Official Dispatch";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export async function generateStaticParams() {
  const caller = appRouter.createCaller({ session: null });
  const posts = await caller.post.list();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const targetSlug = LEGACY_POST_SLUG_REDIRECTS[slug] ?? slug;
  const caller = appRouter.createCaller({ session: null });
  const post = await caller.post.bySlug({ slug: targetSlug });

  if (!post) {
    return { title: "Article Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      ...ogDefaults,
      url: `/blog/${post.slug}`,
      title: `${post.title} · NACOS UNIUYO Newsroom`,
      description: post.excerpt,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} · NACOS UNIUYO Newsroom`,
      description: post.excerpt,
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;

  const redirectedSlug = LEGACY_POST_SLUG_REDIRECTS[slug];
  if (redirectedSlug) {
    permanentRedirect(`/blog/${redirectedSlug}`);
  }

  const caller = appRouter.createCaller({ session: null });
  const [post, allPosts] = await Promise.all([
    caller.post.bySlug({ slug }),
    caller.post.list(),
  ]);

  if (!post) {
    notFound();
  }

  const bodyDoc = buildArticleRichTextDoc(post.slug, post.title, post.excerpt);
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug);

  return (
    <>
      <section className="page-hero dept-hero" aria-labelledby="article-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ DISPATCH }" />

        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/blog">Newsroom</Link>
              </li>
              <li aria-current="page">{post.title}</li>
            </ol>
          </nav>

          <div className="dept-hero-badges">
            <span className="caps dept-shortcode-pill">
              <UniuyoCrest size={18} />
              <span>{post.featured ? "Featured Release" : "Official Notice"}</span>
            </span>
            <span className="caps dept-faculty-tag">
              <Calendar size={13} className="mr-1.5" />
              <time dateTime={post.publishedAt ?? undefined}>
                {formatPublishedDate(post.publishedAt)}
              </time>
            </span>
          </div>

          <h1 id="article-title" className="serif">
            {post.title}
          </h1>

          <p className="max-w-[680px] text-[clamp(17px,1.8vw,21px)] leading-relaxed text-[var(--mint-2)]">
            {post.excerpt}
          </p>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="Article Content">
        <div className="wrap">
          <div className="dept-overview-grid">
            <article className="dept-overview-card">
              {post.coverUrl ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[var(--forest)]">
                  <Image
                    src={post.coverUrl}
                    alt={post.title}
                    fill
                    sizes="(max-width: 960px) 100vw, 760px"
                    className="object-cover"
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--rule)] pb-5">
                <div>
                  <span className="caps text-[10px] text-[var(--green)]">Editorial Attribution</span>
                  <p className="m-0 text-sm font-semibold text-[var(--ink)]">
                    NACOS UNIUYO Directorate of Information &amp; Software
                  </p>
                </div>
                <span className="caps text-xs text-[var(--muted)]">
                  {formatPublishedDate(post.publishedAt)}
                </span>
              </div>

              <RichTextRenderer
                doc={bodyDoc}
                className="text-[17.5px] leading-relaxed text-[var(--ink)]"
              />
            </article>

            <aside className="dept-panel-stack" aria-label="Related Dispatches">
              <div className="dept-overview-card">
                <span className="caps eyebrow accent">Press &amp; Verification</span>
                <h2 className="serif text-3xl">Editorial Record</h2>
                <p className="m-0 text-sm leading-relaxed text-[var(--muted)]">
                  Every article published in the NACOS UNIUYO Newsroom permanently records author attribution and
                  preserves stable URLs via automated slug redirects for WhatsApp and campus forum shares.
                </p>

                <div className="flex flex-col gap-3 pt-2">
                  <Link href="/opportunities" className="btn btn-dark btn-sm w-full">
                    <span>Explore SIWES &amp; Opportunities</span>
                    <ArrowRight size={15} />
                  </Link>
                  <Link href="/projects" className="btn btn-line btn-sm w-full">
                    Browse Student Projects
                  </Link>
                  <Link href="/blog" className="btn btn-line btn-sm w-full">
                    Back to All Dispatches
                  </Link>
                </div>
              </div>

              {relatedPosts.length > 0 ? (
                <div className="dept-overview-card">
                  <span className="caps eyebrow accent">More from the Newsroom</span>
                  <div className="flex flex-col gap-4">
                    {relatedPosts.map((rel) => (
                      <Link
                        key={rel.slug}
                        href={`/blog/${rel.slug}`}
                        className="group flex flex-col gap-1 no-underline"
                      >
                        <span className="caps text-[10px] text-[var(--muted)]">
                          {formatPublishedDate(rel.publishedAt)}
                        </span>
                        <span className="serif text-2xl text-[var(--ink)] group-hover:text-[var(--green)]">
                          {rel.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Newsroom", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
    </>
  );
}
