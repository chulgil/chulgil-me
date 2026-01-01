"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const StringQuartetCanvas = dynamic(
  () => import("@/components/canvas/StringQuartetCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-gold">
        <span className="animate-pulse">Loading String Quartet...</span>
      </div>
    ),
  }
);

export default function StringQuartetPage() {
  return (
    <div className="min-h-screen bg-ebony text-ivory">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-ebony/80 backdrop-blur border-b border-charcoal/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-heading text-xl text-gold hover:text-amber transition-colors"
          >
            ← 메인으로
          </Link>
          <h1 className="font-heading text-lg">현악 4중주</h1>
          <Link
            href="/samples/violin"
            className="font-body text-sm text-cream/60 hover:text-gold transition-colors"
          >
            바이올린 샘플 →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <div className="text-center py-12 px-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-2xl text-gold">♩</span>
            <h2 className="font-heading text-4xl md:text-5xl">String Quartet</h2>
            <span className="text-2xl text-gold">♩</span>
          </div>
          <p className="font-body text-cream/70 max-w-xl mx-auto mb-2">
            두 대의 바이올린, 비올라, 첼로가 만드는 완벽한 하모니
          </p>
          <p className="font-body text-sm text-cream/50">
            각 악기 위에 마우스를 올려보세요
          </p>
        </div>

        {/* Canvas Section */}
        <div className="px-6 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-b from-charcoal/10 to-ebony rounded-2xl border border-charcoal/30 overflow-hidden shadow-2xl">
              <div className="h-[600px] md:h-[700px]">
                <StringQuartetCanvas />
              </div>
            </div>
          </div>
        </div>

        {/* Instrument Info */}
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Violin 1 */}
            <div className="bg-charcoal/20 rounded-xl border border-charcoal/30 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gold text-2xl">♪</span>
                <h3 className="font-heading text-xl">제1 바이올린</h3>
              </div>
              <p className="font-body text-sm text-cream/70">
                앙상블의 리더로서 주선율을 담당합니다.
                가장 높은 음역대에서 화려하고 표현력 있는 멜로디를 연주합니다.
              </p>
            </div>

            {/* Violin 2 */}
            <div className="bg-charcoal/20 rounded-xl border border-charcoal/30 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gold text-2xl">♪</span>
                <h3 className="font-heading text-xl">제2 바이올린</h3>
              </div>
              <p className="font-body text-sm text-cream/70">
                제1 바이올린과 대화하며 화음을 풍성하게 만듭니다.
                때로는 반주를, 때로는 대선율을 연주합니다.
              </p>
            </div>

            {/* Viola */}
            <div className="bg-charcoal/20 rounded-xl border border-charcoal/30 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gold text-2xl">♫</span>
                <h3 className="font-heading text-xl">비올라</h3>
              </div>
              <p className="font-body text-sm text-cream/70">
                바이올린보다 깊고 따뜻한 음색으로 중음역을 담당합니다.
                앙상블의 화성을 채우는 핵심적인 역할을 합니다.
              </p>
            </div>

            {/* Cello */}
            <div className="bg-charcoal/20 rounded-xl border border-charcoal/30 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gold text-2xl">♬</span>
                <h3 className="font-heading text-xl">첼로</h3>
              </div>
              <p className="font-body text-sm text-cream/70">
                풍부하고 깊은 저음으로 앙상블의 기초를 다집니다.
                베이스라인부터 서정적인 멜로디까지 폭넓게 표현합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <div className="bg-charcoal/10 rounded-xl border border-charcoal/20 p-6">
            <h3 className="font-heading text-lg text-gold mb-4">구현 기술</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-gold/10 text-gold text-sm rounded-full">
                Canvas 2D API
              </span>
              <span className="px-3 py-1 bg-gold/10 text-gold text-sm rounded-full">
                Bezier Curves
              </span>
              <span className="px-3 py-1 bg-gold/10 text-gold text-sm rounded-full">
                Radial Gradients
              </span>
              <span className="px-3 py-1 bg-gold/10 text-gold text-sm rounded-full">
                requestAnimationFrame
              </span>
              <span className="px-3 py-1 bg-gold/10 text-gold text-sm rounded-full">
                Mouse Interaction
              </span>
            </div>
            <ul className="font-body text-sm text-cream/60 space-y-1">
              <li>• 스포트라이트와 스테이지 조명 효과</li>
              <li>• 각 악기의 미묘한 흔들림 애니메이션</li>
              <li>• 호버 시 현 진동 및 골드 하이라이트</li>
              <li>• 광택(바니시) 효과로 사실적인 나무 질감</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
