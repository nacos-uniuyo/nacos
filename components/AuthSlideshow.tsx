"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import nacosLogo from "@/assets/images/nacos-logo.png";
import { ArrowRight } from "@/components/icons";
import president from "@/assets/images/execs/president.webp";
import softwareDirector from "@/assets/images/execs/director-of-software.webp";
import alumnus from "@/assets/images/alumni/victor-udosen.jpg";

/**
 * NACOS's own photographs, not stock. The inauguration flyer is referenced by
 * URL rather than imported: the same file backs `flyerUrl` on the events record,
 * which is a text column, so it has to stay in public either way.
 */
const SLIDES = [
  {
    image: president,
    fit: "object-cover",
    eyebrow: "4th Executive Council",
    title: "Led by students,",
    subtitle: "elected each session.",
  },
  {
    image: "/images/inauguration-flyer.jpg",
    fit: "object-contain",
    eyebrow: "Inauguration Ceremony",
    title: "Twelve officers,",
    subtitle: "sworn in publicly.",
  },
  {
    image: softwareDirector,
    fit: "object-cover",
    eyebrow: "Software Directorate",
    title: "The people who build",
    subtitle: "what you are looking at.",
  },
  {
    image: alumnus,
    fit: "object-cover",
    eyebrow: "Digital Yearbook",
    title: "Every graduate,",
    subtitle: "kept on the record.",
  },
] as const;

const ADVANCE_MS = 6000;

export function AuthSlideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    // Someone who has asked for reduced motion gets the first slide, held.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="relative isolate h-full min-h-[420px] overflow-hidden rounded-[22px] bg-[var(--forest)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.eyebrow}
          // each slide is opaque, so a contained image never reveals the slide beneath it
          className="absolute inset-0 bg-[var(--forest)] transition-opacity duration-900 ease-[cubic-bezier(0.2,0.7,0.1,1)]"
          style={{ opacity: i === index ? 1 : 0 }}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 46vw"
            className={slide.fit}
          />
        </div>
      ))}

      {/* Brand mark and the way back out, as the reference has them. */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 p-5 sm:p-7">
        <Link href="/" className="flex items-center gap-2.5 no-underline" aria-label="NACOS UNIUYO home">
          <Image src={nacosLogo} alt="" width={40} height={40} className="size-10 rounded-full" />
          <span className="caps text-[11px] leading-tight text-white">
            NACOS
            <span className="block text-[9px] tracking-[0.12em] text-white/70">University of Uyo</span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-[12.5px] font-medium text-white no-underline backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          Back to website
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Keeps the caption legible whatever the photo underneath is doing. */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[rgba(6,42,20,0.92)] via-[rgba(6,42,20,0.3)] to-[rgba(6,42,20,0.55)]"
        aria-hidden="true"
      />

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 px-8 pb-9 text-center">
        <div aria-live="polite" className="flex flex-col items-center gap-2.5">
          <span className="caps text-[10px] text-[var(--gold)]">{SLIDES[index].eyebrow}</span>
          <p className="serif m-0 text-[clamp(23px,2.4vw,31px)] leading-[1.15] text-white">
            {SLIDES[index].title}
            <br />
            {SLIDES[index].subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.eyebrow}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show slide ${i + 1}: ${slide.eyebrow}`}
              aria-current={i === index}
              className={`h-1.5 cursor-pointer rounded-full transition-all duration-500 ${
                i === index ? "w-8 bg-white" : "w-4 bg-white/35 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
