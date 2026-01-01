"use client";

import { useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";

interface LoadingScreenProps {
  onComplete: () => void;
}

const loadingMessages = [
  { progress: 0, message: "악기를 조율하는 중...", notes: "♩" },
  { progress: 25, message: "악보를 펼치는 중...", notes: "♩ ♪" },
  { progress: 50, message: "오케스트라 준비 중...", notes: "♩ ♪ ♫" },
  { progress: 75, message: "연주 시작!", notes: "♩ ♪ ♫ ♬" },
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update message based on progress
    const messageIndex = loadingMessages.findIndex(
      (m, i) =>
        progress >= m.progress &&
        (i === loadingMessages.length - 1 ||
          progress < loadingMessages[i + 1].progress)
    );
    if (messageIndex !== -1) {
      setCurrentMessage(loadingMessages[messageIndex]);
    }
  }, [progress]);

  useEffect(() => {
    if (progress >= 100) {
      // Exit animation
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 800);
      }, 500);
    }
  }, [progress, onComplete]);

  return (
    <div
      className={`
        fixed inset-0 z-[10000] bg-ebony
        flex flex-col items-center justify-center
        transition-all duration-800 ease-out
        ${isExiting ? "opacity-0 scale-110" : "opacity-100 scale-100"}
      `}
    >
      {/* Animated Music Notes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            className="absolute text-gold/20 text-4xl animate-float"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          >
            {["♩", "♪", "♫", "♬"][i % 4]}
          </span>
        ))}
      </div>

      {/* Logo / Title */}
      <div className="mb-12 text-center">
        <h1 className="font-heading text-4xl md:text-5xl text-ivory mb-2">
          이철길
        </h1>
        <p className="font-body text-cream/60 text-sm tracking-widest">
          SYMPHONY OF CODE
        </p>
      </div>

      {/* Progress Section */}
      <div className="w-64 md:w-80">
        {/* Music Notes Progress */}
        <div className="flex justify-center gap-2 mb-6 text-2xl h-8">
          {currentMessage.notes.split(" ").map((note, i) => (
            <span
              key={i}
              className="text-gold animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {note}
            </span>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="relative h-1 bg-charcoal/50 rounded-full overflow-hidden mb-4">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold to-amber rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Text */}
        <div className="flex justify-between items-center text-sm">
          <span className="font-body text-cream/80">
            {currentMessage.message}
          </span>
          <span className="font-body text-gold">{progress}%</span>
        </div>
      </div>

      {/* Staff Lines Decoration */}
      <div className="absolute bottom-20 left-0 right-0 flex flex-col gap-2 opacity-10">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-px bg-ivory" />
        ))}
      </div>
    </div>
  );
}
