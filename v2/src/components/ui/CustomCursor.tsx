"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorText, setCursorText] = useState("");

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    // Hide default cursor
    document.body.style.cursor = "none";

    const onMouseMove = (e: MouseEvent) => {
      // Main cursor follows immediately
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });

      // Follower has delay
      gsap.to(follower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    // Handle hover states
    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      setIsHovering(true);

      // Check for data attributes
      const text = target.dataset.cursorText;
      if (text) setCursorText(text);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setCursorText("");
    };

    // Add event listeners
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], input, textarea, [data-cursor-hover]'
    );

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    // Hide cursor when leaving window
    const onMouseLeave = () => {
      gsap.to([cursor, follower], { opacity: 0, duration: 0.2 });
    };
    const onMouseEnter = () => {
      gsap.to([cursor, follower], { opacity: 1, duration: 0.2 });
    };

    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      document.body.style.cursor = "auto";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);

      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  // Re-attach listeners when DOM changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const interactiveElements = document.querySelectorAll(
        'a, button, [role="button"], input, textarea, [data-cursor-hover]'
      );

      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", () => setIsHovering(true));
        el.addEventListener("mouseleave", () => {
          setIsHovering(false);
          setCursorText("");
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Main cursor - music note */}
      <div
        ref={cursorRef}
        className={`
          fixed top-0 left-0 pointer-events-none z-[9999]
          -translate-x-1/2 -translate-y-1/2
          transition-transform duration-150
          ${isClicking ? "scale-75" : "scale-100"}
        `}
        style={{ mixBlendMode: "difference" }}
      >
        <span
          className={`
            block text-2xl text-gold
            transition-all duration-200
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
