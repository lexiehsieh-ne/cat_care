"use client";

import { useEffect, useRef, useState } from "react";

const SLIDE_INTERVAL_MS = 3000;
const TRANSITION_MS = 700;
const GAP_PX = 16;

export function PhotoCarousel({ photos }: { photos: string[] }) {
  const [index, setIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [itemWidth, setItemWidth] = useState(0);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  const trackPhotos = [...photos, ...photos];

  useEffect(() => {
    function measure() {
      if (firstItemRef.current) {
        setItemWidth(firstItemRef.current.offsetWidth + GAP_PX);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => i + 1);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (index !== photos.length) return;
    const timeout = setTimeout(() => {
      setWithTransition(false);
      setIndex(0);
    }, TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [index, photos.length]);

  useEffect(() => {
    if (withTransition) return;
    const raf = requestAnimationFrame(() => setWithTransition(true));
    return () => cancelAnimationFrame(raf);
  }, [withTransition]);

  return (
    <div>
      <div className="overflow-hidden">
        <div
          className="flex gap-4"
          style={{
            transform: `translateX(-${index * itemWidth}px)`,
            transition: withTransition
              ? `transform ${TRANSITION_MS}ms ease`
              : "none",
          }}
        >
          {trackPhotos.map((photo, i) => (
            <button
              key={`${photo}-${i}`}
              ref={i === 0 ? firstItemRef : undefined}
              type="button"
              onClick={() => setActive(photo)}
              className="w-[60%] shrink-0 overflow-hidden rounded-2xl border border-line shadow-sm sm:w-[38%] lg:w-[28%]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt="玳瑁小姊妹寫真"
                className="aspect-[4/5] w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {photos.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === index % photos.length ? "bg-gold" : "bg-line"
            }`}
          />
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-6"
          onClick={() => setActive(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active}
            alt="玳瑁小姊妹放大照片"
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="關閉"
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground shadow-lg"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
