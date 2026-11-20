import Image from "next/image";
import Link from "next/link";
import { ExecCard } from "@/components/ExecCard";
import { GoodwillCarousel } from "@/components/GoodwillCarousel";
import { ArrowDown, ArrowRight, Calendar, GithubIcon, Pin, QuoteMark, UniuyoCrest } from "@/components/icons";
import { CornerOrbit, HeroOrbits } from "@/components/Orbits";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import { StatCounter } from "@/components/StatCounter";
import { featuredEvent as ev, formatEventDate, formatEventTime } from "@/lib/events";
import { executives, initials } from "@/lib/executives";
import { site } from "@/lib/site";
import { appRouter } from "@/server/routers";

const tickerItems = [
  "Hackathons",
  "Tech Trainings",
  "SIWES Placements",
  "Open-Track",
  "Guide-U",
  "Industry Mentorship",
  "Faculty Connectivity",
];

const commitments = [
  { title: "Launch Open-Track", owner: "Director of Software" },
  { title: "Launch Guide-U for freshers", owner: "Director of Software" },
  { title: "Improve Faculty internet access", owner: "Director of Software" },
  { title: "Host hackathons and tech workshops", owner: "President" },
  { title: "Structured SIWES placements", owner: "President" },
];

const nationalStats = [
  { label: "Members", value: 1_000_000, suffix: "+", compact: true },
  { label: "Local chapters", value: 250, suffix: "+" },
  { label: "States and the FCT", value: 37 },
  { label: "Years of NACOS", value: 20, suffix: "+" },
];

const categoryLabels: Record<string, string> = {
  cybersecurity: "Cybersecurity",
  embedded_systems_hardware: "Embedded Systems & Hardware",
  software_engineering: "Software Engineering",
  artificial_intelligence_data: "AI & Data Science",
  information_systems_networking: "Information Systems & Networking",
  theoretical_computing_research: "Theoretical Computing & Research",
  interdisciplinary: "Interdisciplinary",
};

function formatShortDate(iso: string) {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", month: "short" })
    .format(date)
    .toUpperCase();
  const year = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", year: "numeric" }).format(date);
  return { day, month, year };
}

export default async function Home() {
  const featuredExecs = executives.filter((x) => x.principal);
  const caller = appRouter.createCaller({ session: null });

  const [deansAddress, goodwillList, departmentList, projectList, eventList] = await Promise.all([
    caller.setting.deansMessage(),
    caller.goodwill.list(),
    caller.department.list(),
    caller.project.list(),
    caller.event.list(),
  ]);

  const departmentMap = new Map(departmentList.map((d) => [d.slug, d]));

  return (
    <>
      {/* 1. Hero Banner: Deep emerald green visual continuation of the split-angled navbar */}
      <section id="top" className="hero hero-phase2" aria-labelledby="hero-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits />
        <div className="hero-fade" aria-hidden="true" />

        <div className="wrap hero-inner">
          <div className="hero-cobrand-pill fade d1">
            <UniuyoCrest size={22} />
            <span className="caps">Faculty of Computing · University of Uyo &amp; NACOS Chapter</span>
          </div>

          <h1 id="hero-title" className="serif">
            <span className="line">
              <span className="rise d2">Building Capacity</span>
            </span>
            <span className="line">
              <span className="rise d3 it gold">Fostering Innovation</span>
            </span>
          </h1>
          <p className="hero-copy fade d4">
            The home of every computing student at the University of Uyo across all five academic departments. We
            train builders, showcase student research, open doors to industry, and show our work in public.
          </p>
          <div className="cta-row fade d5">
            <Link className="btn btn-solid" href="/projects">
              Explore Student Projects
              <ArrowRight />
            </Link>
            <Link className="btn btn-ghost" href="/departments/computer-science">
              View Department Hubs
              <ArrowRight />
            </Link>
            <Link className="btn btn-ghost" href={`/events/${ev.slug}`}>
              Inauguration day
            </Link>
          </div>

          {departmentList.length > 0 ? (
            <div className="hero-dept-bar fade d5" aria-label="Department Hub Quick Links">
              <span className="caps hero-dept-kicker">5 Computing Departments:</span>
              <div className="hero-dept-links">
                {departmentList.map((dept) => (
                  <Link
                    key={dept.slug}
                    href={`/departments/${dept.slug}`}
                    className="hero-dept-chip"
                  >
                    <span className="caps chip-code">{dept.shortName}</span>
                    <span className="chip-name">{dept.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="hero-foot">
          <div className="wrap">
            <div className="scroll-cue fade d5">
              <span className="cue" style={{ display: "inline-flex" }}>
                <ArrowDown />
              </span>
              Scroll
            </div>
            <div className="meta fade d5 caps" style={{ fontSize: 11 }}>
              Faculty of Computing · Uyo, Akwa Ibom
            </div>
          </div>
        </div>
      </section>

      {/* 2. Dean's Welcome Address (Immediately Beneath / Overlapping Hero) */}
      <section id="deans-welcome" className="deans-welcome-section" aria-labelledby="deans-heading">
        <div className="wrap">
          <article className="deans-split-card reveal">
            <div className="deans-portrait-col">
              <div className="deans-portrait-frame">
                <div className="deans-monogram-stage" aria-hidden="true">
                  <svg viewBox="0 0 320 360" fill="none" className="deans-stage-rings">
                    <circle cx="160" cy="180" r="136" stroke="rgba(216,180,92,0.32)" strokeWidth="1.2" />
                    <circle
                      cx="160"
                      cy="180"
                      r="104"
                      stroke="rgba(255,255,255,0.12)"
                      strokeDasharray="3 8"
                    />
                    <circle cx="160" cy="44" r="4" fill="#D8B45C" />
                  </svg>
                  <div className="deans-crest-badge">
                    <UniuyoCrest size={52} />
                  </div>
                  <span className="serif deans-initials">{initials(deansAddress.authorName)}</span>
                </div>

                <div className="deans-portrait-overlay">
                  <span className="caps deans-office-badge">Office of the Dean</span>
                  <h3 className="serif deans-name">{deansAddress.authorName}</h3>
                  <p className="deans-title">{deansAddress.authorTitle}</p>
                  <p className="caps deans-uni">University of Uyo</p>
                </div>
              </div>
            </div>

            <div className="deans-content-col">
              <div className="deans-content-head">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="caps eyebrow accent">Official Faculty Welcome</span>
                  <span className="caps deans-session-tag">Faculty of Computing · UNIUYO</span>
                </div>
                <h2 id="deans-heading" className="serif deans-heading">
                  {deansAddress.heading}
                </h2>
              </div>

              <div className="deans-message-prose">
                <span className="deans-watermark-quote" aria-hidden="true">
                  <QuoteMark size={40} />
                </span>
                <RichTextRenderer
                  doc={deansAddress.body}
                  className="deans-richtext"
                />
              </div>

              <footer className="deans-content-foot">
                <div className="deans-signature-block">
                  <span className="serif it deans-sig-name">{deansAddress.authorName}</span>
                  <span className="caps deans-sig-role">
                    {deansAddress.authorTitle} · University of Uyo
                  </span>
                </div>

                <div className="deans-quick-actions">
                  <Link href="/departments/computer-science" className="text-link">
                    Explore Department Hubs
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/projects" className="text-link">
                    Student Project Showcase
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </footer>
            </div>
          </article>
        </div>
      </section>

      {/* Ticker */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track marquee caps">
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} style={{ display: "contents" }}>
              <span>{t}</span>
              <span className="star">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Mission & 5 Autonomous Computing Department Hubs */}
      <section id="about" className="mission" aria-labelledby="about-title">
        <div className="wrap">
          <h2 id="about-title" className="eyebrow caps reveal" style={{ margin: 0 }}>
            Our purpose
          </h2>
          <div className="body">
            <p className="statement serif reveal">
              <span className="statement-line">We want to be known not just for studying</span>{" "}
              <span className="statement-line">
                Computing, but for <span className="it accent nowrap">what we build with it.</span>
              </span>
            </p>
            <p className="lead reveal">
              NACOS UNIUYO brings together students across all five departments of the Faculty of Computing to learn
              practical skills, compete at hackathons, connect with industry, and hold their leaders to account.
            </p>
          </div>
        </div>

        {departmentList.length > 0 ? (
          <div className="wrap dept-hubs-wrap">
            <div className="dept-hubs-grid">
              {departmentList.map((dept, index) => (
                <Link
                  key={dept.slug}
                  href={`/departments/${dept.slug}`}
                  className="dept-hub-card card reveal"
                >
                  <div className="dept-hub-top">
                    <span className="caps dept-code-badge">{dept.shortName}</span>
                    <span className="caps dept-num">0{index + 1}</span>
                  </div>
                  <div className="dept-hub-body">
                    <h3 className="serif dept-hub-name">{dept.name}</h3>
                    <p className="dept-hub-summary">{dept.summary}</p>
                  </div>
                  <div className="dept-hub-foot">
                    <div className="dept-hod">
                      <span className="caps text-[10px] text-[var(--muted)]">Head of Department</span>
                      <span className="text-xs font-semibold text-[var(--ink)]">
                        {dept.hodName ?? "Faculty Leadership"}
                      </span>
                    </div>
                    <span className="dept-hub-arrow" aria-hidden="true">
                      <ArrowRight size={18} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Priorities */}
      <section id="priorities" className="priorities dark" aria-labelledby="priorities-title">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow on-dark caps">The agenda</span>
              <h2 id="priorities-title" className="h2 serif reveal-x">
                Our Priorities
              </h2>
            </div>
            <p>Seven commitments from this administration. Every one of them is tracked in public on Open-Track.</p>
          </div>

          <div className="tiles">
            <Link className="tile tall wide reveal" href="#open-track">
              <svg className="tile-mark" viewBox="0 0 320 320" fill="none" aria-hidden="true">
                <circle cx="160" cy="160" r="150" stroke="rgba(216,180,92,.25)" />
                <circle cx="160" cy="160" r="100" stroke="rgba(255,255,255,.08)" strokeDasharray="3 8" />
                <path d="M110 165l32 32 70-74" stroke="rgba(216,180,92,.45)" strokeWidth="3" />
              </svg>
              <span className="num caps">01</span>
              <div className="copy">
                <h3 className="serif">Accountability &amp; Transparency</h3>
                <p style={{ maxWidth: 520, fontSize: 16 }}>
                  Open-Track publishes every executive promise, what is in progress and what is done, in real time.
                </p>
                <span className="tile-arrow">
                  <ArrowRight size={28} stroke={1.6} />
                </span>
              </div>
            </Link>
            <Link className="tile tall green reveal" href={`/events/${ev.slug}`}>
              <span className="num caps">02</span>
              <div className="copy">
                <h3 className="serif">Innovation &amp; Technology</h3>
                <p style={{ fontSize: 16 }}>Hackathons, workshops and industry partnerships that turn students into builders.</p>
              </div>
            </Link>
            <div className="tile reveal">
              <span className="num caps">03</span>
              <div className="copy">
                <h3 className="serif">Connectivity &amp; Infrastructure</h3>
                <p>Reliable internet across the Faculty, better equipped labs, and more room to learn.</p>
              </div>
            </div>
            <div className="tile reveal">
              <span className="num caps">04</span>
              <div className="copy">
                <h3 className="serif">A Stronger Academic System</h3>
                <p>Faster result uploads, tutorials, faculty quizzes, debates and academic excursions.</p>
              </div>
            </div>
            <div className="tile reveal">
              <span className="num caps">05</span>
              <div className="copy">
                <h3 className="serif">Careers &amp; SIWES</h3>
                <p>Structured placements, mentorship and portfolio building with partner tech firms.</p>
              </div>
            </div>
            <div className="tile light reveal">
              <span className="num caps">06</span>
              <div className="copy">
                <h3 className="serif">Guide-U for Freshers</h3>
                <p>Help for new students from day one, with course reps tracking issues in real time.</p>
              </div>
            </div>
            <div className="tile wide row reveal">
              <div className="copy" style={{ maxWidth: 520 }}>
                <span className="num caps" style={{ marginBottom: 56 }}>
                  07
                </span>
                <h3 className="serif">Social Life, Sports &amp; Wellbeing</h3>
                <p>Game nights, sports beyond football, inter-faculty competitions and health checkups.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Student & Faculty Projects Highlight Section */}
      <section id="projects-highlight" className="projects-highlight-section" aria-labelledby="projects-preview-title">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow caps accent">Student &amp; Faculty Showcase</span>
              <h2 id="projects-preview-title" className="h2 serif reveal-x">
                Featured <span className="it">Projects</span>
              </h2>
            </div>
            <Link className="text-link" href="/projects">
              Explore all student projects
              <ArrowRight />
            </Link>
          </div>

          <div className="project-preview-grid">
            {projectList.map((proj) => {
              const dept = departmentMap.get(proj.departmentSlug);
              return (
                <article key={proj.slug} className="project-preview-card card reveal">
                  <div className="project-preview-top">
                    <span className="caps project-cat-pill">
                      {categoryLabels[proj.category] ?? proj.category}
                    </span>
                    <span className="caps project-dept-tag">
                      {dept ? dept.shortName : proj.departmentSlug}
                      {proj.courseCode ? ` · ${proj.courseCode}` : ""}
                    </span>
                  </div>

                  <div className="project-preview-body">
                    <h3 className="serif project-preview-title">
                      <Link href={`/projects/${proj.slug}`}>{proj.title}</Link>
                    </h3>
                    <p className="project-preview-tagline">{proj.tagline}</p>
                  </div>

                  <footer className="project-preview-foot">
                    <div className="project-team-meta">
                      <span className="caps text-[10px] text-[var(--muted)]">Team / Attribution</span>
                      <span className="text-xs font-semibold text-[var(--ink)]">
                        {proj.teamDisplayName ?? (dept ? `${dept.name} Team` : "NACOS Project Team")}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {proj.repoUrl ? (
                        <a
                          href={proj.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-icon-link"
                          aria-label={`${proj.title} GitHub repository`}
                        >
                          <GithubIcon size={16} />
                        </a>
                      ) : null}
                      <Link href={`/projects/${proj.slug}`} className="project-detail-link">
                        <span>View</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open-Track */}
      <section id="open-track" className="open-track" aria-labelledby="ot-title">
        <div className="wrap">
          <div className="intro">
            <span className="eyebrow caps accent">Open-Track</span>
            <h2 id="ot-title" className="serif reveal">
              Promises, <span className="it">tracked in public.</span>
            </h2>
            <p className="lead reveal">
              You should not have to wait until the end of a tenure to know what your executives have done. See every
              commitment, who owns it, and where it stands.
            </p>
            <div className="cta-row" style={{ marginTop: 8 }}>
              <Link className="btn btn-dark" href="/executives">
                See who owns what
              </Link>
            </div>
          </div>

          <div className="tracker reveal">
            <div className="tracker-head">
              <span>Session commitments</span>
              <span className="status">
                <span className="pulse-dot" aria-hidden="true" />
                Tracking starts after inauguration
              </span>
            </div>
            <ul>
              {commitments.map((c) => (
                <li key={c.title}>
                  <span className="what">
                    <strong>{c.title}</strong>
                    <span>{c.owner}</span>
                  </span>
                  <span
                    className="bar-track"
                    role="progressbar"
                    aria-label={`${c.title} progress`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={0}
                  >
                    <span style={{ width: "0%" }} />
                  </span>
                  <span className="state">Not started</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Voices of Goodwill & Leadership Section */}
      <section id="goodwill" className="goodwill-section dark" aria-labelledby="goodwill-title">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow on-dark caps">Institutional Endorsements &amp; Counsel</span>
              <h2 id="goodwill-title" className="h2 serif reveal-x">
                Voices of <span className="it gold">Goodwill</span>
              </h2>
            </div>
            <p className="lead max-w-[440px]">
              Verified goodwill messages from faculty patrons, staff advisers, alumni leaders, and council executives.
            </p>
          </div>

          <GoodwillCarousel initialMessages={goodwillList} />
        </div>
      </section>

      {/* Executives */}
      <section id="executives" className="execs" aria-labelledby="ex-title">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow caps">Leadership · 4th Executive Council</span>
              <h2 id="ex-title" className="h2 serif reveal-x">
                The Executives
              </h2>
            </div>
            <Link className="text-link" href="/executives">
              Meet the full council
              <ArrowRight />
            </Link>
          </div>
          <ul className="exec-grid">
            {featuredExecs.map((x, i) => (
              <li key={x.slug} className="reveal">
                <ExecCard exec={x} index={i} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* News & Upcoming Events */}
      <section id="news" className="news" aria-labelledby="news-title">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow caps">Newsroom &amp; Event Hub</span>
              <h2 id="news-title" className="h2 serif reveal-x">
                Latest from NACOS
              </h2>
            </div>
            <Link className="text-link" href="/events">
              All events
              <ArrowRight />
            </Link>
          </div>

          <div className="news-grid">
            <Link id="media" className="news-lead card reveal" href={`/events/${ev.slug}`}>
              <div className="media">
                <Image
                  src={ev.flyer.src}
                  alt={ev.flyer.alt}
                  width={ev.flyer.width}
                  height={ev.flyer.height}
                  sizes="(max-width: 960px) 100vw, 640px"
                />
              </div>
              <div className="body">
                <span className="kicker caps">Event · {formatEventDate(ev.start)}</span>
                <h3 className="title serif" style={{ margin: 0, fontWeight: 400 }}>
                  {ev.title}
                </h3>
                <span className="sum">
                  Twelve officers take the oath at 5 Arms, Permanent Site. Arrival and registration start at{" "}
                  {formatEventTime(ev.start)} sharp.
                </span>
              </div>
            </Link>

            <div className="news-side">
              <Link className="news-item card reveal" href={`/events/${ev.slug}/programme`}>
                <span className="thumb" aria-hidden="true">
                  <span className="big serif">{ev.programme.length}</span>
                  <span className="small caps">Items</span>
                </span>
                <span className="copy">
                  <span className="kicker caps">Programme · 9 Oct</span>
                  <span className="title serif">The order of the day</span>
                  <span className="sum">The official order of events, from arrival at noon to the group photograph.</span>
                </span>
              </Link>
              <Link className="news-item card reveal" href="/executives">
                <span className="thumb sand" aria-hidden="true">
                  <span className="big serif">12</span>
                  <span className="small caps">Officers</span>
                </span>
                <span className="copy">
                  <span className="kicker caps">Leadership · 4th Exco</span>
                  <span className="title serif">Meet the council</span>
                  <span className="sum">Who holds which office for the session, and how to reach the right desk.</span>
                </span>
              </Link>
            </div>
          </div>

          {eventList.length > 0 ? (
            <div className="events-preview-grid">
              {eventList.map((item) => {
                const { day, month, year } = formatShortDate(item.startDate);
                return (
                  <Link
                    key={item.slug}
                    href={`/events/${item.slug}`}
                    className="event-preview-card card reveal"
                  >
                    <div className="event-preview-date" aria-hidden="true">
                      <span className="serif event-preview-day">{day}</span>
                      <span className="caps event-preview-month">
                        {month} {year}
                      </span>
                    </div>
                    <div className="event-preview-content">
                      <div className="event-preview-kicker">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--green)]">
                          <Calendar size={14} />
                          <span>Faculty Calendar</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                          <Pin size={14} />
                          <span>{item.venueName}</span>
                        </span>
                      </div>
                      <h3 className="serif event-preview-title">{item.title}</h3>
                      {item.tagline ? <p className="event-preview-tagline">{item.tagline}</p> : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      {/* National stats */}
      <section className="stats dark" aria-labelledby="stats-title">
        <div className="wrap">
          <h2 id="stats-title" className="eyebrow on-dark caps" style={{ margin: 0 }}>
            Part of something bigger · NACOS nationwide
          </h2>
          <StatCounter stats={nationalStats} />
        </div>
      </section>

      {/* Portal */}
      <section id="portal" className="portal" aria-labelledby="portal-title">
        <div className="wrap">
          <div className="portal-card reveal">
            <CornerOrbit />
            <div className="copy">
              <span className="pill caps">
                <span className="pulse-dot" style={{ background: "#D8B45C" }} aria-hidden="true" />
                In development
              </span>
              <h2 id="portal-title" className="serif">
                One account. <span className="it">Everything NACOS.</span>
              </h2>
              <p>
                Every NACOSite at UNIUYO will sign in to reach Open-Track, Guide-U, event registration, and
                member resources. The Software Directorate is building it now.
              </p>
            </div>
            <div className="actions">
              <Link className="btn btn-dark" href="/login">
                Sign in to Member Portal
              </Link>
              <a className="btn btn-ghost" href={site.social.x} target="_blank" rel="noopener noreferrer">
                Get launch updates on X
              </a>
              <Link className="btn btn-ghost" href="/executives#director-of-software">
                Talk to the Software desk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
