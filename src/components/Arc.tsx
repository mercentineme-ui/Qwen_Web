import React, { useEffect, useState } from "react";
import { MediaItem } from "../lib/data";
import { useStore } from "../lib/store";
import { FullscreenViewer, MediaSlot, Reveal, SectionHead } from "./ui";

/* Two narrative slides — one FULL image per slide, white text layered
   directly over the image (never a separate text panel). Auto-cycles 10s. */
const SLIDE_TEXT: [string, string] = [
  "Character came first, like a memory from a story never told.",
  "I only followed the trail until it opened into worlds.",
];

function Slide({ image, text, align, active }: {
  image: MediaItem; text: string; align: "tl" | "br"; active: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="absolute inset-0 transition-all duration-700 ease-out"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "none" : `translateX(${align === "tl" ? "-3%" : "3%"})`,
        pointerEvents: active ? "auto" : "none",
      }}
    >
      {/* ONE full rectangle = ONE image; text sits directly on top of it */}
      <div className="relative h-full rounded-xl overflow-hidden" style={{ background: "#222328" }}>
        <div className="absolute inset-0">
          <MediaSlot
            item={image}
            ratio="16/9"
            className="h-full! w-full! rounded-none! border-0! aspect-auto!"
            showLabel={false}
            onClick={() => setOpen(true)}
          />
        </div>

        <p
          className={`absolute z-10 f-display leading-[1.15] text-white max-w-[26ch] ${
            align === "tl"
              ? "top-8 left-7 sm:top-10 sm:left-12 text-left"
              : "bottom-8 right-7 sm:bottom-10 sm:right-12 text-right"
          }`}
          style={{ fontSize: "clamp(1.3rem,2.4vw,2rem)", textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
        >
          {text}
        </p>
      </div>

      {open && (
        <FullscreenViewer items={[image]} index={0} ratio="16/9" onClose={() => setOpen(false)} setIndex={() => undefined} />
      )}
    </div>
  );
}

export default function Arc() {
  const { data } = useStore();
  const { characters, worlds } = data.arc;
  const [idx, setIdx] = useState(0);

  /* two slides: slide 01 = character image, slide 02 = world image */
  const slides: { image: MediaItem; text: string; align: "tl" | "br" }[] = [
    { image: characters[0]?.image, text: SLIDE_TEXT[0], align: "tl" },
    { image: worlds[0]?.image, text: SLIDE_TEXT[1], align: "br" },
  ];

  /* automatic 10-second cycle, looping 01 → 02 → 01 */
  useEffect(() => {
    const iv = window.setInterval(() => setIdx((i) => (i + 1) % 2), 10000);
    return () => clearInterval(iv);
  }, []);

  return (
    <section id="arc" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="05 — BTS"
          titleNode={<>A<span style={{ color: "var(--crimson-rough)" }}>R</span>C</>}
          desc="AI RE-IMAGINED CONTENT — character and world studies from the same generative pipeline."
          meta="CHARACTER + WORLD"
        />

        <Reveal className="mt-10">
          <div className="relative h-[340px] sm:h-[400px] lg:h-[440px]">
            {slides.map((s, i) => (
              <Slide key={i} image={s.image} text={s.text} align={s.align} active={i === idx} />
            ))}

            {/* minimal slide indicator */}
            <div className="absolute -bottom-8 left-0 flex items-center gap-3 f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)]">
              <span style={{ color: "var(--crimson-rough)" }}>{String(idx + 1).padStart(2, "0")}</span>
              <span>/ 02 — {idx === 0 ? "CHARACTER" : "WORLD"}</span>
              <span className="ml-4 flex items-center gap-2">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`}
                    className="h-[5px] rounded-sm transition-all duration-300"
                    style={{ width: i === idx ? 22 : 10, background: i === idx ? "var(--crimson-rough)" : "var(--line)" }} />
                ))}
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
