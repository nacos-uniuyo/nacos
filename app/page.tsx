import Image from "next/image";
import Link from "next/link";
import { ExecCard } from "@/components/ExecCard";
import { ArrowDown, ArrowRight } from "@/components/icons";
import { CornerOrbit, HeroOrbits } from "@/components/Orbits";
import { StatCounter } from "@/components/StatCounter";
import { featuredEvent as ev, formatEventDate, formatEventTime } from "@/lib/events";
import { executives } from "@/lib/executives";
import { site } from "@/lib/site";

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

export default function Home() {
  const featuredExecs = executives.filter((x) => x.principal);

  return (
    <>
      {/* Hero */}
      <section id="top" className="hero" aria-labelledby="hero-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits />
        <div className="hero-fade" aria-hidden="true" />

        <div className="wrap hero-inner">
          <h1 id="hero-title" className="serif">
            <span className="line">
              <span className="rise d2">Building Capacity</span>
            </span>
            <span className="line">
              <span className="rise d3 it gold">Fostering Innovation</span>
            </span>
          </h1>
          <p className="hero-copy fade d4">
            The home of every computing student at the University of Uyo. We train builders, open doors to industry,
            and show our work in public.
          </p>
          <div className="cta-row fade d5">
            <Link className="btn btn-solid" href="#priorities">
              Explore our priorities
              <ArrowRight />
            </Link>
            <Link className="btn btn-ghost" href={`/events/${ev.slug}`}>
              Inauguration day
            </Link>
          </div>
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

      {/* Mission */}
      <section id="about" className="mission" aria-labelledby="about-title">
        <div className="wrap">
          <h2 id="about-title" className="eyebrow caps reveal" style={{ margin: 0 }}>
            Our purpose
          </h2>
          <div className="body">
            <p className="statement serif reveal">
              We want to be known not just for studying Computing, but for{" "}
              <span className="it accent">what we build with it.</span>
            </p>
            <p className="lead reveal">
              NACOS UNIUYO brings together students of the Faculty of Computing to learn practical skills, compete at
              hackathons, connect with industry, and hold their leaders to account.
            </p>
          </div>
        </div>
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

      {/* News */}
      <section id="news" className="news" aria-labelledby="news-title">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow caps">Newsroom</span>
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
                  Twelve officers take the oath at 5 Arms, Permanent Site. Doors open 11:30 AM and we start at{" "}
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
                  <span className="sum">From the processional at noon to the group photographs. Plan your afternoon.</span>
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
                Every NACOSite at UNIUYO will sign in to reach Open-Track, Guide-U, dues and receipts, event
                registration, and member resources. The Software Directorate is building it now.
              </p>
            </div>
            <div className="actions">
              <a className="btn btn-dark" href={site.social.x} target="_blank" rel="noopener noreferrer">
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
