"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const projects = [
  {
    movement: "I",
    title: "AI Symphony",
    subtitle: "Allegro con brio",
    description: "Claude API와 RAG를 활용한 지능형 문서 검색 시스템. 자연어로 질문하면 관련 문서를 찾아 답변합니다.",
    tech: ["Python", "FastAPI", "Claude API", "PostgreSQL"],
    status: "완료",
    color: "from-gold/20 to-rosewood/10",
  },
  {
    movement: "II",
    title: "Stock Alert",
    subtitle: "Andante moderato",
    description: "실시간 주식 알림 및 분석 시스템. 설정한 조건에 따라 Slack으로 알림을 보냅니다.",
    tech: ["Python", "Alpaca API", "Slack", "Cron"],
    status: "운영 중",
    color: "from-rosewood/15 to-gold/10",
  },
  {
    movement: "III",
    title: "Lesson App",
    subtitle: "Scherzo vivace",
    description: "음악 레슨 관리를 위한 Flutter 앱. 학생 관리, 일정, 결제를 한 곳에서.",
    tech: ["Flutter", "Dart", "Firebase", "Stripe"],
    status: "개발 중",
    color: "from-gold/15 to-cream",
  },
  {
    movement: "IV",
    title: "Portfolio",
    subtitle: "Finale maestoso",
    description: "지금 보고 계신 이 웹사이트. 코드와 음악의 조화를 표현했습니다.",
    tech: ["Next.js", "TypeScript", "GSAP", "Tailwind"],
    status: "진행 중",
    color: "from-charcoal/10 to-gold/10",
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const scrollContainer = scrollRef.current;
    if (!container || !scrollContainer) return;

    const ctx = gsap.context(() => {
      // Horizontal scroll animation
      const scrollWidth = scrollContainer.scrollWidth - container.offsetWidth;

      gsap.to(scrollContainer, {
        x: -scrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${scrollWidth}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // Card entrance animations
      gsap.from(scrollContainer.children, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-ivory overflow-hidden"
    >
      {/* Section Title - Fixed */}
      <div className="absolute top-8 left-0 right-0 z-10 px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <span className="text-2xl text-gold">&#9833;</span>
          <h2 className="font-heading text-4xl text-ebony">프로젝트</h2>
          <div className="flex-1 h-px bg-charcoal/20" />
          <span className="font-body text-sm text-charcoal/60">← 스크롤하여 탐색 →</span>
          <span className="text-2xl text-gold">&#9834;</span>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div ref={containerRef} className="h-screen flex items-center pt-16">
        <div
          ref={scrollRef}
          className="flex gap-8 pl-8 pr-[50vw]"
        >
          {projects.map((project, index) => (
            <div
              key={project.movement}
              className={`
                flex-shrink-0 w-[400px] md:w-[500px] h-[500px]
                bg-gradient-to-br ${project.color}
                rounded-2xl p-8 border border-charcoal/10
                hover:border-gold/50 hover:shadow-2xl
                transition-all duration-500
                flex flex-col
                group
              `}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="w-20 h-20 rounded-full border-2 border-gold/50 flex items-center justify-center bg-ivory/50 group-hover:border-gold group-hover:scale-110 transition-all duration-300">
                  <span className="font-heading text-3xl text-ebony">{project.movement}</span>
                </div>
                <span className={`
                  px-4 py-1.5 rounded-full text-sm font-body
                  ${project.status === "완료" ? "bg-green-100 text-green-700" :
                    project.status === "운영 중" ? "bg-blue-100 text-blue-700" :
                    "bg-gold/30 text-charcoal"}
                `}>
                  {project.status}
                </span>
              </div>

              {/* Title */}
              <div className="mb-4">
                <h3 className="font-heading text-3xl text-ebony mb-1">
                  제{project.movement}악장
                </h3>
                <p className="font-heading text-xl text-rosewood">{project.title}</p>
                <p className="font-body text-sm text-charcoal/60 italic mt-1">
                  {project.subtitle}
                </p>
              </div>

              {/* Description */}
              <p className="font-body text-charcoal leading-relaxed flex-1">
                {project.description}
              </p>

              {/* Tech Stack */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 bg-ivory/80 text-charcoal text-sm rounded-lg border border-charcoal/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Decorative Music Notes */}
              <div className="absolute bottom-4 right-4 text-4xl text-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {index % 2 === 0 ? "♪" : "♫"}
              </div>
            </div>
          ))}

          {/* End Card */}
          <div className="flex-shrink-0 w-[300px] h-[500px] flex items-center justify-center">
            <div className="text-center">
              <p className="font-heading text-6xl text-gold/30 mb-4">𝄂</p>
              <p className="font-body text-charcoal/50 italic">Fine</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {projects.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-charcoal/20"
          />
        ))}
      </div>

      {/* Decorative Staff Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-charcoal"
            style={{ top: `${30 + i * 10}%` }}
          />
        ))}
      </div>
    </section>
  );
}
