import Image from "next/image";
import Link from "next/link";
import uniuyoLogo from "@/assets/images/uniuyo-circle.png";
import { ExecCard } from "@/components/ExecCard";
import { DeanWelcome } from "@/components/home/DeanWelcome";
import { OpenTracker } from "@/components/home/OpenTracker";
import { PriorityTile } from "@/components/home/PriorityTile";
import { ArrowRight } from "@/components/icons";
import { CornerOrbit, HeroOrbits } from "@/components/Orbits";
import { StatCounter } from "@/components/StatCounter";
import { Button } from "@/components/ui/button";
import { featuredEvent as ev, formatEventDate, formatEventTime } from "@/lib/events";
import { executives } from "@/lib/executives";
import { site } from "@/lib/site";
import { getDeansMessage } from "@/server/queries/leadership";
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

export default async function Home() {
  const caller = appRouter.createCaller({ session: null });
  const [featuredExecs, deansMessage, allDepartments] = await Promise.all([
    executives.filter((x) => x.principal),
    getDeansMessage(),
    caller.department.list(),
  ]);

  return (
    <>
      {/* Hero */}
      <section
        id="top"
        className="relative bg-[var(--forest)] text-white min-h-[min(800px,calc(100svh-80px))] flex items-center overflow-hidden py-[clamp(72px,8vw,110px)]"
        aria-labelledby="hero-title"
      >
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits logoImage={uniuyoLogo} />
        <div
          className="absolute inset-x-0 bottom-0 h-[260px] bg-gradient-to-t from-[var(--forest)] to-transparent pointer-events-none"
          aria-hidden="true"
        />

        <div className="wrap relative flex flex-col gap-7">
          <h1 id="hero-title" className="serif m-0 max-w-[65%] max-md:max-w-none text-[clamp(52px,7.2vw,104px)] leading-[0.95] tracking-[-0.02em]">
            <span className="line">
              <span className="rise d2">Building Capacity</span>
            </span>
            <span className="line">
              <span className="rise d3 it gold">Fostering Innovation</span>
            </span>
          </h1>
          <p className="fade d4 m-0 max-w-[560px] text-[clamp(17px,1.8vw,20px)] leading-[1.55] text-[var(--mint-2)]">
            The home of every computing student at the University of Uyo. We train builders, open doors to industry,
            and show our work in public.
          </p>
          <div className="fade d5 flex flex-wrap items-center gap-3.5">
            <Button asChild variant="solid" size="default">
              <Link href="#priorities">
                Explore our priorities
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="bg-[var(--green-bright)] text-white overflow-hidden h-[72px] flex items-center select-none" aria-hidden="true">
        <div className="ticker-track marquee caps">
          {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-6">
              <span>{t}</span>
              <span className="star">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Dean's Welcome Address */}
      {deansMessage && <DeanWelcome message={deansMessage} />}

      {/* Mission */}
      <section id="about" className="pt-[clamp(56px,7vw,88px)] pb-[clamp(36px,4.5vw,56px)]" aria-labelledby="about-title">
        <div className="wrap grid grid-cols-1 md:grid-cols-12 gap-7">
          <h2 id="about-title" className="eyebrow caps reveal md:col-span-3 pt-4 m-0">
            Our purpose
          </h2>
          <div className="md:col-span-9 flex flex-col gap-9">
            <p className="statement serif reveal m-0 text-[clamp(36px,5vw,64px)] leading-[1.08] tracking-[-0.01em]">
              <span className="block min-[961px]:whitespace-nowrap">We want to be known not just for studying</span>{" "}
              <span className="block min-[961px]:whitespace-nowrap">
                Computing, but for <span className="it accent nowrap">what we build with it.</span>
              </span>
            </p>
            <p className="lead reveal max-w-[640px] text-[clamp(17px,1.6vw,19px)]">
              NACOS UNIUYO brings together students of the Faculty of Computing to learn practical skills, compete at
              hackathons, connect with industry, and hold their leaders to account.
            </p>
          </div>
        </div>
      </section>

      {/* Five Department Hubs */}
      <section id="departments" className="pt-8 sm:pt-10 pb-[var(--section-y)] bg-[var(--paper)] border-y border-[var(--rule)]" aria-labelledby="departments-title">
        <div className="wrap flex flex-col gap-10">
          <div className="section-head">
            <div>
              <span className="eyebrow caps accent">Academic Departments</span>
              <h2 id="departments-title" className="h2 serif reveal-x">
                Five Autonomous Hubs
              </h2>
            </div>
            <p className="m-0 max-w-[420px] text-[17px] leading-relaxed text-[var(--muted)]">
              Explore coursework projects, faculty leadership, and executive representation across every computing department.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-5 w-full">
            {allDepartments.map((dept, index) => (
              <Link
                key={dept.slug}
                href={`/departments/${dept.slug}`}
                className={`group flex flex-col justify-between gap-5.5 rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--card-surface)] p-7 text-[var(--ink)] no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,26,19,0.08)] ${
                  index >= 3 ? "md:col-span-3" : "md:col-span-2"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="caps text-[11px] text-[var(--muted)]">0{index + 1}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="serif m-0 text-[25px] leading-[1.08]">{dept.name}</h3>
                  <p className="m-0 text-[13.5px] leading-[1.55] text-[var(--muted)]">{dept.summary}</p>
                </div>
                <div className="flex items-center justify-between gap-2.5 pt-3.5 border-t border-[var(--rule-soft)]">
                  <div className="flex flex-col gap-0.5">
                    <span className="caps text-[10px] text-[var(--muted)]">Head of Department</span>
                    <span className="text-xs font-semibold text-[var(--ink)]">
                      {dept.hodName ?? "Faculty Leadership"}
                    </span>
                  </div>
                  <span className="inline-flex text-[var(--green)] transition-transform duration-250 group-hover:translate-x-1" aria-hidden="true">
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Priorities */}
      <section id="priorities" className="py-[var(--section-y)] bg-[var(--forest)] text-white" aria-labelledby="priorities-title">
        <div className="wrap flex flex-col gap-16">
          <div className="section-head">
            <div>
              <span className="eyebrow on-dark caps">The agenda</span>
              <h2 id="priorities-title" className="h2 serif reveal-x">
                Our Priorities
              </h2>
            </div>
            <p className="m-0 max-w-[420px] text-[17px] leading-relaxed text-[var(--mint)]">
              Seven commitments from this administration. Every one of them is tracked in public on Open-Track.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <PriorityTile
              number="01"
              title="Accountability & Transparency"
              description="Open-Track publishes every executive promise, what is in progress and what is done, in real time."
              tall
              wide
              href="#open-track"
              mark={
                <svg className="absolute -right-10 -bottom-15 size-80 opacity-60 pointer-events-none" viewBox="0 0 320 320" fill="none" aria-hidden="true">
                  <circle cx="160" cy="160" r="150" stroke="rgba(216,180,92,.25)" />
                  <circle cx="160" cy="160" r="100" stroke="rgba(255,255,255,.08)" strokeDasharray="3 8" />
                  <path d="M110 165l32 32 70-74" stroke="rgba(216,180,92,.45)" strokeWidth="3" />
                </svg>
              }
            />
            <PriorityTile
              number="02"
              title="Innovation & Technology"
              description="Hackathons, workshops and industry partnerships that turn students into builders."
              variant="green"
              tall
              href={`/events/${ev.slug}`}
            />
            <PriorityTile
              number="03"
              title="Connectivity & Infrastructure"
              description="Reliable internet across the Faculty, better equipped labs, and more room to learn."
            />
            <PriorityTile
              number="04"
              title="A Stronger Academic System"
              description="Faster result uploads, tutorials, faculty quizzes, debates and academic excursions."
            />
            <PriorityTile
              number="05"
              title="Careers & SIWES"
              description="Structured placements, mentorship and portfolio building with partner tech firms."
            />
            <PriorityTile
              number="06"
              title="Guide-U for Freshers"
              description="Help for new students from day one, with course reps tracking issues in real time."
              variant="light"
            />
            <PriorityTile
              number="07"
              title="Social Life, Sports & Wellbeing"
              description="Game nights, sports beyond football, inter-faculty competitions and health checkups."
              wide
              row
            />
          </div>
        </div>
      </section>

      {/* Open-Track */}
      <section id="open-track" className="py-[var(--section-y)]" aria-labelledby="ot-title">
        <div className="wrap grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-14 items-center">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <span className="eyebrow caps accent">Open-Track</span>
            <h2 id="ot-title" className="serif reveal m-0 text-[clamp(48px,6vw,76px)] leading-none tracking-[-0.02em]">
              Promises, <span className="it">tracked in public.</span>
            </h2>
            <p className="lead reveal">
              You should not have to wait until the end of a tenure to know what your executives have done. See every
              commitment, who owns it, and where it stands.
            </p>
            <div className="flex items-center gap-3.5 mt-2">
              <Button asChild variant="dark">
                <Link href="/executives">
                  See who owns what
                </Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <OpenTracker commitments={commitments} />
          </div>
        </div>
      </section>

      {/* Executives */}
      <section id="executives" className="bg-[var(--sand)] py-[var(--section-y)]" aria-labelledby="ex-title">
        <div className="wrap flex flex-col gap-14">
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
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 list-none m-0 p-0">
            {featuredExecs.map((x, i) => (
              <li key={x.slug} className="reveal">
                <ExecCard exec={x} index={i} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* News */}
      <section id="news" className="py-[var(--section-y)]" aria-labelledby="news-title">
        <div className="wrap flex flex-col gap-14">
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <Link
              id="media"
              className="lg:col-span-6 group flex flex-col bg-[var(--forest)] rounded-[var(--radius)] overflow-hidden text-white no-underline transition-all duration-450 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(6,42,20,0.14)]"
              href={`/events/${ev.slug}`}
            >
              <div className="relative aspect-[3/2] bg-[var(--forest-2)] overflow-hidden">
                <Image
                  src={ev.flyer.src}
                  alt={ev.flyer.alt}
                  width={ev.flyer.width}
                  height={ev.flyer.height}
                  className="size-full object-cover transition-transform duration-800 ease-[cubic-bezier(0.2,0.7,0.1,1)] group-hover:scale-105"
                  sizes="(max-width: 960px) 100vw, 640px"
                />
              </div>
              <div className="p-7.5 flex flex-col gap-3">
                <span className="caps text-[11px] text-[var(--gold)]">Event · {formatEventDate(ev.start)}</span>
                <h3 className="serif m-0 font-normal text-[clamp(30px,3vw,38px)] leading-[1.08]">
                  {ev.title}
                </h3>
                <span className="text-[15px] leading-relaxed text-[var(--mint-2)]">
                  Twelve officers take the oath at 5 Arms, Permanent Site. Arrival and registration start at{" "}
                  {formatEventTime(ev.start)} sharp.
                </span>
              </div>
            </Link>

            <div className="lg:col-span-6 grid grid-rows-1 sm:grid-rows-2 gap-5">
              <Link
                className="group flex flex-col sm:flex-row gap-6 bg-[var(--card-surface)] rounded-[var(--radius)] p-7.5 text-[var(--ink)] no-underline transition-all duration-450 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(6,42,20,0.14)]"
                href={`/events/${ev.slug}/programme`}
              >
                <span className="w-full sm:w-40 shrink-0 rounded-xl bg-[var(--forest)] text-[var(--gold)] flex flex-col justify-between p-4 min-h-[100px] overflow-hidden" aria-hidden="true">
                  <span className="serif text-[54px] leading-[0.9]">{ev.programme.length}</span>
                  <span className="caps text-[10px]">Items</span>
                </span>
                <span className="flex flex-col gap-2.5 justify-center">
                  <span className="caps text-[11px] text-[var(--green)]">Programme · 9 Oct</span>
                  <span className="serif text-[clamp(24px,2.4vw,30px)] leading-[1.1] text-[var(--ink)]">The order of the day</span>
                  <span className="text-sm leading-relaxed text-[var(--muted)]">The official order of events, from arrival at noon to the group photograph.</span>
                </span>
              </Link>

              <Link
                className="group flex flex-col sm:flex-row gap-6 bg-[var(--card-surface)] rounded-[var(--radius)] p-7.5 text-[var(--ink)] no-underline transition-all duration-450 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(6,42,20,0.14)]"
                href="/executives"
              >
                <span className="w-full sm:w-40 shrink-0 rounded-xl bg-[var(--sand)] text-[var(--green)] flex flex-col justify-between p-4 min-h-[100px] overflow-hidden" aria-hidden="true">
                  <span className="serif text-[54px] leading-[0.9]">12</span>
                  <span className="caps text-[10px]">Officers</span>
                </span>
                <span className="flex flex-col gap-2.5 justify-center">
                  <span className="caps text-[11px] text-[var(--green)]">Leadership · 4th Exco</span>
                  <span className="serif text-[clamp(24px,2.4vw,30px)] leading-[1.1] text-[var(--ink)]">Meet the council</span>
                  <span className="text-sm leading-relaxed text-[var(--muted)]">Who holds which office for the session, and how to reach the right desk.</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* National stats */}
      <section className="bg-[var(--forest)] text-white py-[clamp(80px,9vw,110px)]" aria-labelledby="stats-title">
        <div className="wrap flex flex-col gap-12">
          <h2 id="stats-title" className="eyebrow on-dark caps m-0">
            Part of something bigger · NACOS nationwide
          </h2>
          <StatCounter stats={nationalStats} />
        </div>
      </section>

      {/* Portal */}
      <section id="portal" className="py-[var(--section-y)]" aria-labelledby="portal-title">
        <div className="wrap">
          <div className="relative bg-[var(--green)] rounded-[28px] p-[clamp(36px,6vw,80px)] text-white overflow-hidden flex flex-wrap justify-between items-center gap-10 lg:gap-14">
            <CornerOrbit />
            <div className="relative flex flex-col gap-5 max-w-[640px]">
              <span className="inline-flex items-center gap-2 self-start text-[11px] py-1.5 px-3 rounded-full border border-white/35 caps">
                <span className="size-2 rounded-full bg-[#D8B45C] animate-pulse" aria-hidden="true" />
                In development
              </span>
              <h2 id="portal-title" className="serif m-0 text-[clamp(44px,5.6vw,72px)] leading-none tracking-[-0.02em]">
                One account. <span className="it">Everything NACOS.</span>
              </h2>
              <p className="m-0 text-lg leading-relaxed text-[var(--mint-3)]">
                Every NACOSite at UNIUYO will sign in to reach Open-Track, Guide-U, event registration, and
                member resources. The Software Directorate is building it now.
              </p>
            </div>
            <div className="relative flex flex-col gap-3.5 min-w-[240px]">
              <Button asChild variant="dark" size="lg">
                <a href={site.social.x} target="_blank" rel="noopener noreferrer">
                  Get launch updates on X
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/executives#director-of-software">
                  Talk to the Software desk
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
