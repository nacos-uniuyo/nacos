import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { cn } from "@/lib/utils";

interface PriorityTileProps {
  number: string;
  title: string;
  description: string;
  variant?: "forest" | "green" | "light";
  wide?: boolean;
  tall?: boolean;
  row?: boolean;
  href?: string;
  icon?: React.ReactNode;
  mark?: React.ReactNode;
  className?: string;
}

export function PriorityTile({
  number,
  title,
  description,
  variant = "forest",
  wide,
  tall,
  row,
  href,
  icon,
  mark,
  className,
}: PriorityTileProps) {
  const variantStyles = {
    forest: "bg-[var(--forest-2)] text-white hover:bg-[var(--forest-3)]",
    green: "bg-[var(--green)] text-white hover:bg-[var(--green-hover)]",
    light: "bg-[var(--paper)] text-[var(--ink)] hover:bg-white",
  };

  const numberStyles = {
    forest: "text-[var(--gold)]",
    green: "text-white",
    light: "text-[var(--green)]",
  };

  const descriptionStyles = {
    forest: "text-[var(--mint-2)]",
    green: "text-[var(--mint-3)]",
    light: "text-[var(--muted)]",
  };

  const baseClasses = cn(
    "relative overflow-hidden rounded-[var(--radius)] p-9 flex flex-col justify-between gap-10 no-underline transition-all duration-400 ease-[cubic-bezier(0.2,0.7,0.1,1)]",
    tall ? "min-h-[340px] p-10" : "min-h-[300px]",
    wide && "md:col-span-2",
    row && "flex-col sm:flex-row sm:items-end",
    variantStyles[variant],
    href && "hover:-translate-y-1.5 cursor-pointer group",
    className,
  );

  const content = (
    <>
      {mark}
      <span className={cn("caps text-[13px] font-bold tracking-widest", numberStyles[variant])}>
        {number}
      </span>
      <div className={cn("relative flex flex-col gap-3", wide && "max-w-[520px]")}>
        <h3 className={cn("serif m-0 leading-tight", tall ? "text-[clamp(36px,4vw,48px)]" : "text-[clamp(30px,3vw,36px)]")}>
          {title}
        </h3>
        <p className={cn("m-0 text-[15px] leading-relaxed", descriptionStyles[variant])}>
          {description}
        </p>
        {href && (
          <span className="inline-flex text-[var(--gold)] transition-transform duration-350 group-hover:translate-x-1.5 mt-1">
            {icon ?? <ArrowRight size={28} stroke={1.6} />}
          </span>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}
