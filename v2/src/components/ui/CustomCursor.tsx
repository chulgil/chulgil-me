"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "@/lib/gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorText, setCursorText] = useState("");

  // Track attached elements to prevent duplicate listeners
  const attachedElementsRef = useRef<WeakSet<Element>>(new WeakSet());

  // Memoized hover handlers
  const handleMouseEnter = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    setIsHovering(true);
    const text = target.dataset.cursorText;
    if (text) setCursorText(text);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setCursorText("");
  }, []);

  // Attach listeners to new interactive elements only
  const attachListenersToNewElements = useCallback(() => {
    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], input, textarea, [data-cursor-hover]'
    );

    interactiveElements.forEach((el) => {
      if (!attachedElementsRef.current.has(el)) {
        el.addEventListener("mouseenter", handleMouseEnter);
        el.addEventListener("mouseleave", handleMouseLeave);
        attachedElementsRef.current.add(el);
      }
    });
  }, [handleMouseEnter, handleMouseLeave]);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Hide default cursor
    document.body.style.cursor = "none";

    const onMouseMove = (e: MouseEvent) => {
      // Main cursor follows immediately
      gsap.set(cursor, { x: e.clientX, y: e.clientY });

      // Follower with smooth delay (skip if reduced motion)
      if (!prefersReducedMotion) {
        gsap.to(follower, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
          ease: "power2.out",
        });
      } else {
        gsap.set(follower, { x: e.clientX, y: e.clientY });
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onDocumentMouseLeave = () => {
      gsap.to([cursor, follower], { opacity: 0, duration: 0.2 });
    };
    const onDocumentMouseEnter = () => {
      gsap.to([cursor, follower], { opacity: 1, duration: 0.2 });
    };

    // Add global event listeners
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onDocumentMouseLeave);
    document.addEventListener("mouseenter", onDocumentMouseEnter);

    // Initial attachment
    attachListenersToNewElements();

    return () => {
      document.body.style.cursor = "auto";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onDocumentMouseLeave);
      document.removeEventListener("mouseenter", onDocumentMouseEnter);
    };
  }, [attachListenersToNewElements]);

  // Debounced MutationObserver to handle DOM changes
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;

    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(attachListenersToNewElements, 100);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, [attachListenersToNewElements]);

  return (
    <>
      {/* Main cursor - music note */}
      <div
        ref={cursorRef}
        className={`
          fixed top-0 left-0 pointer-events-none z-[9999]
          -translate-x-1/2 -translate-y-1/2
          transition-transform duration-75
          ${isClicking ? "scale-75" : "scale-100"}
        `}
        style={{ mixBlendMode: "difference" }}
        aria-hidden="true"
      >
        <span
          className={`
            block text-2xl text-gold
            transition-all duration-100
            ${isHovering ? "scale-150 rotate-12" : "scale-100 rotate-0"}
          `}
        >
          {isHovering ? "♫" : "♪"}
        </span>
      </div>

      {/* Follower circle */}
      <div
        ref={followerRef}
        className={`
          fixed top-0 left-0 pointer-events-none z-[9998]
          -translate-x-1/2 -translate-y-1/2
          rounded-full border-2 border-gold/50
          transition-all duration-300
          ${isHovering ? "w-16 h-16 bg-gold/10" : "w-8 h-8 bg-transparent"}
          ${isClicking ? "scale-90" : "scale-100"}
        `}
        aria-hidden="true"
      >
        {cursorText && (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-gold font-body">
            {cursorText}
          </span>
        )}
      </div>
    </>
  );
}
