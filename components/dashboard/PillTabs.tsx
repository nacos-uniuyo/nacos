import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PillTab<T extends string> {
  value: T;
  label: ReactNode;
  count?: number;
}

interface PillTabsProps<T extends string> {
  tabs: readonly PillTab<T>[];
  value: T;
  onValueChange: (value: T) => void;
  label: string;
  className?: string;
  onTabIntent?: (value: T) => void;
}

export function PillTabs<T extends string>({
  tabs,
  value,
  onValueChange,
  label,
  className,
  onTabIntent,
}: PillTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(tab.value)}
            onMouseEnter={() => onTabIntent?.(tab.value)}
            onFocus={() => onTabIntent?.(tab.value)}
            className={cn(
              "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm",
              active
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined ? (
              <span
                className={cn(
                  "inline-flex size-5 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
                  active
                    ? "bg-card text-primary shadow-2xs"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
