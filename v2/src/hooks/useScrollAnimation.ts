"use client";

import { useEffect, useRef, RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  /** Animation start position (default: "top 80%") */
  start?: string;
  /** Animation end position */
  end?: string;
  /** Y offset for entrance animation (default: 60) */
  yOffset?: number;
  /** Animation duration (default: 0.8) */
  duration?: number;
  /** Stagger delay between children (default: 0.2) */
  stagger?: number;
  /** Easing function (default: "power3.out") */
  ease?: string;
  /** Whether to animate children or the element itself (default: true) */
  animateChildren?: boolean;
  /** Disable animation for reduced motion preference */
  respectReducedMotion?: boolean;
}

/**
 * Custom hook for scroll-triggered GSAP animations
 * Reduces duplicate animation code across section components
 */
export function useScrollAnimation<T extends HTMLElement>(
  options: ScrollAnimationOptions = {}
): RefObject<T | null> {
  const ref = useRef<T>(null);

  const {
    start = "top 80%",
    end,
    yOffset = 60,
    duration = 0.8,
    stagger = 0.2,
    ease = "power3.out",
    animateChildren = true,
    respectReducedMotion = true,
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    if (respectReducedMotion) {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;
    }

    const targets = animateChildren ? element.children : element;

    const animation = gsap.from(targets, {
      y: yOffset,
      opacity: 0,
      duration,
      stagger: animateChildren ? stagger : 0,
      ease,
      scrollTrigger: {
        trigger: element,
        start,
        end,
        toggleActions: "play none none reverse",
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [start, end, yOffset, duration, stagger, ease, animateChildren, respectReducedMotion]);

  return ref;
}

/**
 * Hook for fade-in animation on scroll
 */
export function useFadeInOnScroll<T extends HTMLElement>(
  options: Omit<ScrollAnimationOptions, "yOffset"> = {}
): RefObject<T | null> {
  return useScrollAnimation<T>({ ...options, yOffset: 0 });
}

/**
 * Hook for slide-up animation on scroll
 */
export function useSlideUpOnScroll<T extends HTMLElement>(
  options: ScrollAnimationOptions = {}
): RefObject<T | null> {
  return useScrollAnimation<T>(options);
}
