"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  speed?: number; // pixels per second
  direction?: "left" | "right";
  className?: string;
};

export function DraggableMarquee({
  children,
  speed = 40,
  direction = "left",
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Position state tracked in refs for smooth animation frame updates
  const offsetRef = useRef(0);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Calculate half track width (one repetition set)
  useEffect(() => {
    const updateWidth = () => {
      if (trackRef.current) {
        // Since we duplicate children twice, single set is half scrollWidth
        singleSetWidthRef.current = trackRef.current.scrollWidth / 2;
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [children]);

  // Animation frame loop for auto-looping marquee
  useEffect(() => {
    let animationFrameId: number;
    let lastTime: number | null = null;

    const step = (time: number) => {
      if (lastTime === null) {
        lastTime = time;
      }
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Auto-move only if neither hovered nor dragged
      if (!isHovered && !isDragging) {
        const moveDistance = speed * delta * (direction === "left" ? -1 : 1);
        offsetRef.current += moveDistance;

        const maxOffset = singleSetWidthRef.current;
        if (maxOffset > 0) {
          // Normalize offset so it seamlessly wraps between [-maxOffset, 0]
          if (offsetRef.current <= -maxOffset) {
            offsetRef.current += maxOffset;
          } else if (offsetRef.current > 0) {
            offsetRef.current -= maxOffset;
          }
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, isDragging, speed, direction]);

  // Pointer drag event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag on primary mouse button or touch
    if (e.button !== 0) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;

    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;

    if (Math.abs(e.clientX - startXRef.current) > 5) {
      hasDraggedRef.current = true;
    }

    offsetRef.current += deltaX;
    const maxOffset = singleSetWidthRef.current;
    if (maxOffset > 0) {
      if (offsetRef.current <= -maxOffset) {
        offsetRef.current += maxOffset;
      } else if (offsetRef.current > 0) {
        offsetRef.current -= maxOffset;
      }
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  // Prevent accidental clicks on child links if the user was actively dragging
  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClickCapture={handleClickCapture}
      className={`relative w-full overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{ touchAction: "pan-y" }}
    >
      <div
        ref={trackRef}
        className="flex gap-6 w-max will-change-transform py-3"
      >
        <div className="flex gap-6 shrink-0">{children}</div>
        <div className="flex gap-6 shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
