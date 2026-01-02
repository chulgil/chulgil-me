"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const sections = [
  { id: "hero", label: "서곡", note: "♩" },
  { id: "about", label: "1악장", note: "♪" },
  { id: "skills", label: "2악장", note: "♫" },
  { id: "projects", label: "3악장", note: "♬" },
  { id: "contact", label: "피날레", note: "𝄂" },
];

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Cache element references
  const sectionElementsRef = useRef<(HTMLElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const lastUpdateRef = useRef(0);

  // Initialize element references
  useEffect(() => {
    sectionElementsRef.current = sections.map((s) =>
      document.getElementById(s.id)
    );
  }, []);

  // Throttled scroll handler using RAF
  const handleScroll = useCallback(() => {
    const now = performance.now();
    // Throttle to ~60fps
    if (now - lastUpdateRef.current < 16) return;
    lastUpdateRef.current = now;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);

      // Show after scrolling past hero
      setIsVisible(scrollTop > window.innerHeight * 0.5);

      // Determine active section using cached references
      const viewportCenter = window.innerHeight * 0.5;
      for (let i = sectionElementsRef.current.length - 1; i >= 0; i--) {
        const el = sectionElementsRef.current[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= viewportCenter) {
            setActiveSection(i);
            break;
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <nav
      className={`
        fixed right-6 top-1/2 -translate-y-1/2 z-50
        transition-all duration-500
        ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
      `}
      aria-label="페이지 섹션 네비게이션"
    >
      {/* Vertical Staff Line */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-charcoal/30"
        aria-hidden="true"
      />

      {/* Progress Fill */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0 w-0.5 bg-gradient-to-b from-gold to-amber transition-all duration-300 origin-top"
        style={{ height: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="페이지 스크롤 진행률"
      />

      {/* Section Indicators */}
      <div className="relative flex flex-col gap-6">
        {sections.map((section, index) => {
          const isActive = activeSection === index;
          const isPast = activeSection > index;

          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`
                group relative flex items-center gap-3
                transition-all duration-300
                ${isActive ? "scale-110" : "scale-100"}
              `}
              aria-label={`${section.label}로 이동`}
              aria-current={isActive ? "true" : undefined}
            >
              {/* Note Icon */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  border-2 transition-all duration-300
                  ${
                    isActive
                      ? "border-gold bg-gold text-ebony"
                      : isPast
                      ? "border-gold/50 bg-gold/20 text-gold"
                      : "border-charcoal/50 bg-ebony/50 text-cream/50"
                  }
                `}
              >
                <span className="text-sm font-bold" aria-hidden="true">
                  {section.note}
                </span>
              </div>

              {/* Tooltip */}
              <span
                className={`
                  absolute right-full mr-3 px-3 py-1
                  bg-ebony/90 text-ivory text-xs font-body rounded
                  whitespace-nowrap
                  transition-all duration-300
                  opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0
                  pointer-events-none
                `}
                aria-hidden="true"
              >
                {section.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current Progress Percentage */}
      <div className="mt-4 text-center" aria-hidden="true">
        <span className="text-xs text-cream/50 font-body">
          {Math.round(scrollProgress)}%
        </span>
      </div>
    </nav>
  );
}
