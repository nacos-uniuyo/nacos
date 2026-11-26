"use client";

import Link from "next/link";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AttentionBannerProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  icon: LucideIcon;
  tone?: "amber" | "rose" | "emerald";
  dismissLabel?: string;
}

const toneClasses = {
  amber: {
    iconWrap: "bg-amber-500/12 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    title: "text-amber-700 dark:text-amber-300",
  },
  rose: {
    iconWrap: "bg-rose-500/12 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
    title: "text-rose-700 dark:text-rose-400",
  },
  emerald: {
    iconWrap: "bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    title: "text-emerald-700 dark:text-emerald-400",
  },
} as const;

export function AttentionBanner({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  icon: Icon,
  tone = "amber",
  dismissLabel = "Later",
}: AttentionBannerProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const styles = toneClasses[tone];

  return (
    <div className="relative flex flex-col gap-4 rounded-2xl border bg-card p-4 pr-11 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-5 sm:pr-12">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setVisible(false)}
        className="absolute right-3.5 top-3.5 cursor-pointer rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-start gap-3.5 sm:items-center">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            styles.iconWrap,
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className={cn("text-sm font-semibold", styles.title)}>{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 sm:shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setVisible(false)}
          className="h-9 rounded-xl px-4 text-xs"
        >
          {dismissLabel}
        </Button>
        <Button asChild size="sm" className="h-9 rounded-xl px-4 text-xs">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
