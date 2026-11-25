"use client";

import {
  FaFacebookF,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import type { SocialPlatform } from "@/server/contracts";

type Props = {
  socials?: SocialPlatform[] | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function SocialIconList({ socials, size = "md", className = "" }: Props) {
  if (!socials || socials.length === 0) return null;

  const sizeClasses = {
    sm: "size-8 text-[13px]",
    md: "size-10 text-[15px]",
    lg: "size-12 text-[17px]",
  }[size];

  return (
    <div className={`flex items-center gap-3 flex-wrap ${className}`}>
      {socials.map((s) => {
        switch (s.platform) {
          case "github":
            return (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                className={`inline-flex items-center justify-center rounded-full border border-[var(--rule)] bg-[var(--card-surface)] text-[#24292f] dark:text-[#e6edf3] hover:bg-[#24292f] hover:text-white hover:border-[#24292f] transition-all shadow-xs ${sizeClasses}`}
              >
                <FaGithub />
              </a>
            );
          case "linkedin":
            return (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className={`inline-flex items-center justify-center rounded-full border border-[var(--rule)] bg-[var(--card-surface)] text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] transition-all shadow-xs ${sizeClasses}`}
              >
                <FaLinkedinIn />
              </a>
            );
          case "x":
            return (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter) Profile"
                className={`inline-flex items-center justify-center rounded-full border border-[var(--rule)] bg-[var(--card-surface)] text-[#000000] dark:text-white hover:bg-[#000000] hover:text-white hover:border-[#000000] transition-all shadow-xs ${sizeClasses}`}
              >
                <FaXTwitter />
              </a>
            );
          case "instagram":
            return (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Profile"
                className={`inline-flex items-center justify-center rounded-full border border-[var(--rule)] bg-[var(--card-surface)] text-[#e4405f] hover:bg-[#e4405f] hover:text-white hover:border-[#e4405f] transition-all shadow-xs ${sizeClasses}`}
              >
                <FaInstagram />
              </a>
            );
          case "facebook":
            return (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Profile"
                className={`inline-flex items-center justify-center rounded-full border border-[var(--rule)] bg-[var(--card-surface)] text-[#1877f2] hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] transition-all shadow-xs ${sizeClasses}`}
              >
                <FaFacebookF />
              </a>
            );
          case "website":
            return (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Personal Website"
                className={`inline-flex items-center justify-center rounded-full border border-[var(--rule)] bg-[var(--card-surface)] text-[var(--ink)] hover:bg-[var(--forest)] hover:text-white hover:border-[var(--forest)] transition-all shadow-xs ${sizeClasses}`}
              >
                <FaGlobe />
              </a>
            );
        }
      })}
    </div>
  );
}
