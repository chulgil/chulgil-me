"use client";

import Image from "next/image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import SectionHeader from "@/components/ui/SectionHeader";

export default function About() {
  const contentRef = useScrollAnimation<HTMLDivElement>({
    start: "top 70%",
  });

  return (
    <section className="relative min-h-screen flex items-center bg-cream py-24">
      <div className="section-container">
        <SectionHeader title="소개" />

        {/* Content */}
        <div ref={contentRef} className="grid md:grid-cols-2 gap-16 items-center">
          {/* Profile Photo */}
          <div className="relative">
            <div className="aspect-square rounded-lg overflow-hidden border-4 border-gold/30 shadow-xl">
              <Image
                src="/images/profile.png"
                alt="이철길 프로필 사진"
                width={500}
                height={500}
                className="object-cover w-full h-full bg-ivory"
                priority
              />
            </div>
            {/* Decorative frame */}
            <div className="absolute -inset-4 border-2 border-gold/20 rounded-lg -z-10" />
            {/* Music note decoration */}
            <div className="absolute -top-6 -right-6 text-4xl text-gold/50">♪</div>
            <div className="absolute -bottom-4 -left-4 text-3xl text-gold/40">♫</div>
          </div>

          {/* Text Content */}
          <div className="space-y-6">
            <blockquote className="font-heading text-3xl text-rosewood italic">
              "코드와 선율이 만나는 곳"
            </blockquote>

            <p className="font-body text-lg text-charcoal leading-relaxed">
              안녕하세요, 풀스택 개발자 이철길입니다.
              저는 코드를 작성하는 것과 바이올린을 연주하는 것 사이에서
              놀라운 유사점을 발견했습니다.
            </p>

            <p className="font-body text-lg text-charcoal leading-relaxed">
              둘 다 정확성과 창의성의 조화를 요구하며,
              끊임없는 연습과 개선을 통해 완성됩니다.
              이 웹사이트는 그 두 세계의 조화를 표현합니다.
            </p>

            <div className="pt-4">
              <p className="font-body text-sm text-charcoal/60">
                React · Python · AI · Classical Music
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
