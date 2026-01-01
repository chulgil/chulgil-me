"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";

const LoadingScreen = dynamic(
  () => import("@/components/ui/LoadingScreen"),
  { ssr: false }
);

const ScrollProgress = dynamic(
  () => import("@/components/ui/ScrollProgress"),
  { ssr: false }
);

const AudioController = dynamic(
  () => import("@/components/ui/AudioController"),
  { ssr: false }
);

export default function PageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Pre-load critical resources
    const preloadImages = async () => {
      const images = ["/images/profile.png"];
      await Promise.all(
        images.map(
          (src) =>
            new Promise((resolve) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = resolve;
              img.src = src;
            })
        )
      );
    };

    preloadImages();
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Small delay before showing content for smooth transition
    setTimeout(() => setShowContent(true), 100);
  };

  return (
    <>
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      {showContent && <ScrollProgress />}
      {showContent && <AudioController />}
      <main
        className={`
          transition-opacity duration-500
          ${showContent ? "opacity-100" : "opacity-0"}
        `}
      >
        <section id="hero"><Hero /></section>
        <section id="about"><About /></section>
        <section id="skills"><Skills /></section>
        <section id="projects"><Projects /></section>
        <section id="contact"><Contact /></section>
      </main>
    </>
  );
}
