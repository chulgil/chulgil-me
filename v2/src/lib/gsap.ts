import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Default animation configurations
export const defaultEase = "power3.out";
export const defaultDuration = 0.8;

// Reusable animation presets
export const fadeInUp = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  duration: defaultDuration,
  ease: defaultEase,
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  duration: defaultDuration,
  ease: defaultEase,
};

export const staggerChildren = {
  stagger: 0.1,
  ease: defaultEase,
};

// ScrollTrigger defaults
export const defaultScrollTrigger = {
  start: "top 80%",
  end: "bottom 20%",
  toggleActions: "play none none reverse",
};

export { gsap, ScrollTrigger };
