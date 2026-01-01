"use client";

import { useEffect, useState, useCallback } from "react";
import { audioManager, playHoverSound } from "@/lib/audio";

export default function AudioController() {
  const [isMuted, setIsMuted] = useState(true); // Start muted (user must opt-in)
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Initialize audio on first user interaction
    const initAudio = async () => {
      await audioManager.init();
      audioManager.setMuted(true); // Start muted
    };

    initAudio();

    // Show button after a delay
    const timer = setTimeout(() => setIsVisible(true), 2000);

    return () => clearTimeout(timer);
  }, []);

  // Add hover sound to interactive elements
  useEffect(() => {
    if (isMuted || !hasInteracted) return;

    const handleMouseEnter = () => {
      playHoverSound();
    };

    const interactiveElements = document.querySelectorAll(
      "a, button, [role='button'], [data-cursor-hover]"
    );

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
    });

    return () => {
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
      });
    };
  }, [isMuted, hasInteracted]);

  const toggleMute = useCallback(async () => {
    if (!hasInteracted) {
      await audioManager.init();
      setHasInteracted(true);
    }

    const newMuted = audioManager.toggleMute();
    setIsMuted(newMuted);

    if (!newMuted) {
      // Play a chord to indicate sound is on
      audioManager.playChord([523.25, 659.25, 783.99]);
    }
  }, [hasInteracted]);

  return (
    <button
      onClick={toggleMute}
      className={`
        fixed bottom-6 left-6 z-50
        w-12 h-12 rounded-full
        bg-ebony/80 backdrop-blur border border-gold/30
        flex items-center justify-center
        transition-all duration-500 hover:scale-110 hover:border-gold
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      aria-label={isMuted ? "소리 켜기" : "소리 끄기"}
      data-cursor-hover
    >
      <span className="text-xl">
        {isMuted ? (
          // Muted icon - crossed out note
          <span className="relative text-cream/50">
            ♪
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-6 h-0.5 bg-cream/50 rotate-45" />
            </span>
          </span>
        ) : (
          // Unmuted icon - animated note
          <span className="text-gold animate-pulse">♫</span>
        )}
      </span>
    </button>
  );
}

// Hook for using audio in other components
export function useAudio() {
  const playHover = useCallback(() => {
    if (!audioManager.isMuted()) {
      playHoverSound();
    }
  }, []);

  const playClick = useCallback(async () => {
    if (!audioManager.isMuted()) {
      const { playClickSound } = await import("@/lib/audio");
      playClickSound();
    }
  }, []);

  const playTransition = useCallback(async () => {
    if (!audioManager.isMuted()) {
      const { playTransitionSound } = await import("@/lib/audio");
      playTransitionSound();
    }
  }, []);

  const playSuccess = useCallback(async () => {
    if (!audioManager.isMuted()) {
      const { playSuccessSound } = await import("@/lib/audio");
      playSuccessSound();
    }
  }, []);

  return { playHover, playClick, playTransition, playSuccess };
}
