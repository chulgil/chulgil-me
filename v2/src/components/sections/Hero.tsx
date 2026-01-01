"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "@/lib/gsap";

// Lazy load FrequencyWaves V3 (client-side only)
const FrequencyWavesV3 = dynamic(
  () => import("@/components/three/FrequencyWavesV3"),
  { ssr: false }
);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: -50,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.3,
      });

      gsap.from(subtitleRef.current, {
        y: -30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.5,
      });

      gsap.from(taglineRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 1.2,
      });

      gsap.from(scrollIndicatorRef.current, {
        opacity: 0,
        duration: 1,
        delay: 1.5,
      });

      gsap.to(scrollIndicatorRef.current, {
        y: 10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);


  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col overflow-hidden bg-ivory"
    >
      {/* Header - Top aligned */}
      <header className="relative z-10 pt-16 md:pt-24 px-4 text-center">
        <h1
          ref={titleRef}
          className="font-heading text-hero text-ebony mb-2 drop-shadow-sm"
        >
          이철길
        </h1>

        <p
          ref={subtitleRef}
          className="font-body text-xl md:text-2xl text-charcoal"
        >
          개발자 · 바이올린 애호가
        </p>
      </header>

      {/* Frequency Visualization - Center area */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          {isLoaded && <FrequencyWavesV3 />}
        </div>
      </div>

      {/* Tagline - Bottom area */}
      <div className="relative z-10 pb-32 text-center px-4">
        <p
          ref={taglineRef}
          className="font-body text-sm md:text-base text-charcoal/70 max-w-md mx-auto italic"
        >
          "사람과 AI, 그리고 음악 — 주파수로 연결됩니다"
        </p>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-charcoal z-10"
      >
        <span className="font-body text-sm">스크롤하여 시작</span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-32 left-8 text-gold/30 text-4xl z-0">♪</div>
      <div className="absolute top-40 right-24 text-gold/20 text-3xl z-0">♫</div>
      <div className="absolute bottom-40 left-16 text-gold/25 text-2xl z-0">♩</div>
      <div className="absolute bottom-32 right-8 text-gold/30 text-3xl z-0">♬</div>
    </section>
  );
}
