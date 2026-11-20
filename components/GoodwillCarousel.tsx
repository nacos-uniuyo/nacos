"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, QuoteMark } from "@/components/icons";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import { trpc } from "@/lib/trpc/client";
import type { GoodwillSummary } from "@/server/contracts";

function getInitials(name: string) {
  return name
    .replace(/^(Prof\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, "")
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function GoodwillCarousel({ initialMessages }: { initialMessages: GoodwillSummary[] }) {
  const { data: messages = initialMessages } = trpc.goodwill.list.useQuery(undefined, {
    initialData: initialMessages,
  });

  const [activeIndex, setActiveIndex] = useState(0);

  if (messages.length === 0) {
    return null;
  }

  const total = messages.length;
  const safeIndex = activeIndex % total;

  function handlePrev() {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }

  function handleNext() {
    setActiveIndex((prev) => (prev + 1) % total);
  }

  const visibleMessages = Array.from({ length: Math.min(2, total) }, (_, offset) => {
    const idx = (safeIndex + offset) % total;
    return { item: messages[idx], index: idx, isPrimary: offset === 0 };
  });

  return (
    <div className="goodwill-carousel-root">
      <div className="goodwill-controls-bar">
        <div className="goodwill-counter">
          <span className="caps text-xs text-[var(--green)]">
            Voice {String(safeIndex + 1).padStart(2, "0")} of {String(total).padStart(2, "0")}
          </span>
          <div className="goodwill-dots" role="tablist" aria-label="Select goodwill message">
            {messages.map((msg, idx) => (
              <button
                key={msg.authorName}
                type="button"
                role="tab"
                aria-selected={idx === safeIndex}
                aria-label={`View message from ${msg.authorName}`}
                className={`goodwill-dot${idx === safeIndex ? " active" : ""}`}
                onClick={() => setActiveIndex(idx)}
              />
            ))}
          </div>
        </div>

        <div className="goodwill-nav-btns">
          <button
            type="button"
            className="goodwill-nav-btn"
            onClick={handlePrev}
            aria-label="Previous goodwill message"
          >
            <ChevronLeft size={18} />
            <span>Prev</span>
          </button>
          <button
            type="button"
            className="goodwill-nav-btn"
            onClick={handleNext}
            aria-label="Next goodwill message"
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="goodwill-cards-grid" aria-live="polite">
        {visibleMessages.map(({ item, index, isPrimary }) => (
          <article
            key={`${item.authorName}-${index}`}
            className={`goodwill-card reveal${isPrimary ? " primary" : ""}`}
          >
            <div className="goodwill-card-top">
              <span className="goodwill-quote-icon" aria-hidden="true">
                <QuoteMark size={26} />
              </span>
              <span className="caps goodwill-role-pill">{item.authorTitle}</span>
            </div>

            <div className="goodwill-message-body">
              <RichTextRenderer
                doc={item.message}
                className="text-[16px] leading-relaxed"
              />
            </div>

            <footer className="goodwill-author">
              <div className="goodwill-avatar monogram-avatar" aria-hidden="true">
                <span className="serif">{getInitials(item.authorName)}</span>
              </div>
              <div className="goodwill-author-meta">
                <h3 className="serif goodwill-author-name">{item.authorName}</h3>
                <p className="goodwill-author-title">{item.authorTitle}</p>
              </div>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
