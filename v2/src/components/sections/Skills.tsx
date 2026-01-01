"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const skillCategories = [
  {
    name: "현악기",
    subtitle: "Frontend",
    skills: ["React", "Next.js", "Vue", "TypeScript", "Tailwind"],
    color: "rosewood",
  },
  {
    name: "목관악기",
    subtitle: "Backend",
    skills: ["Python", "FastAPI", "Node.js", "PostgreSQL", "Redis"],
    color: "charcoal",
  },
  {
    name: "금관악기",
    subtitle: "DevOps",
    skills: ["Docker", "AWS", "CI/CD", "Linux", "Nginx"],
    color: "gold",
  },
  {
    name: "타악기",
    subtitle: "AI & Tools",
    skills: ["Claude API", "RAG", "LangChain", "Git", "Figma"],
    color: "amber",
  },
];

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cards stagger animation
      gsap.from(cardsRef.current?.children || [], {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center bg-ivory py-24"
    >
      <div className="section-container">
        {/* Section Title */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-2xl text-gold">&#9833;</span>
          <h2 className="font-heading text-4xl text-ebony">기술 스택</h2>
          <div className="flex-1 h-px bg-charcoal/20" />
          <span className="text-2xl text-gold">&#9834;</span>
        </div>

        {/* Conductor Stand */}
        <div className="text-center mb-16">
          <div className="inline-block px-6 py-2 border-2 border-gold rounded-full">
            <span className="font-heading text-lg text-charcoal">Orchestra of Skills</span>
          </div>
        </div>

        {/* Skills Grid */}
        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category) => (
            <div
              key={category.name}
              className="group relative bg-cream rounded-lg p-6 border border-charcoal/10 hover:border-gold/50 transition-all duration-300 hover:-translate-y-2"
            >
              {/* Category Header */}
              <div className="text-center mb-6">
                <h3 className="font-heading text-xl text-ebony">{category.name}</h3>
                <p className="font-body text-sm text-charcoal/60">{category.subtitle}</p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-6" />

              {/* Skills List */}
              <ul className="space-y-2">
                {category.skills.map((skill) => (
                  <li
                    key={skill}
                    className="font-body text-sm text-charcoal flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    {skill}
                  </li>
                ))}
              </ul>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-rosewood/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
