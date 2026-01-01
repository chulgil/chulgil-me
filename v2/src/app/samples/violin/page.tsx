"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const Violin3D = dynamic(() => import("@/components/three/Violin3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-gold">
      <span className="animate-pulse">Loading Three.js...</span>
    </div>
  ),
});

const ViolinCanvas = dynamic(() => import("@/components/canvas/ViolinCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-gold">
      <span className="animate-pulse">Loading Canvas...</span>
    </div>
  ),
});

export default function ViolinSamplesPage() {
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
          <h1 className="font-heading text-lg">바이올린 렌더링 샘플</h1>
          <Link
            href="/samples/quartet"
            className="font-body text-sm text-cream/60 hover:text-gold transition-colors"
          >
            현악 4중주 →
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Description */}
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl mb-4">
              <span className="text-gold">♪</span> 3D vs Canvas 2D{" "}
              <span className="text-gold">♪</span>
            </h2>
            <p className="font-body text-cream/70 max-w-xl mx-auto">
              마우스를 움직여 바이올린과 상호작용해 보세요.
              <br />
              두 가지 렌더링 방식의 차이를 비교할 수 있습니다.
            </p>
          </div>

          {/* Comparison Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Three.js 3D */}
            <div className="bg-charcoal/20 rounded-2xl border border-charcoal/30 overflow-hidden">
              <div className="p-4 border-b border-charcoal/30 bg-charcoal/10">
                <h3 className="font-heading text-xl text-gold">
                  Three.js (WebGL 3D)
                </h3>
                <p className="font-body text-sm text-cream/60 mt-1">
                  실시간 조명, 재질, 깊이감
                </p>
              </div>
              <div className="h-[500px] bg-gradient-to-b from-charcoal/10 to-ebony">
                <Violin3D />
              </div>
              <div className="p-4 border-t border-charcoal/30">
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gold/10 text-gold text-xs rounded">
                    WebGL
                  </span>
                  <span className="px-2 py-1 bg-gold/10 text-gold text-xs rounded">
                    3D Transform
                  </span>
                  <span className="px-2 py-1 bg-gold/10 text-gold text-xs rounded">
                    Lighting
                  </span>
                  <span className="px-2 py-1 bg-gold/10 text-gold text-xs rounded">
                    Materials
                  </span>
                </div>
              </div>
            </div>

            {/* Canvas 2D */}
            <div className="bg-charcoal/20 rounded-2xl border border-charcoal/30 overflow-hidden">
              <div className="p-4 border-b border-charcoal/30 bg-charcoal/10">
                <h3 className="font-heading text-xl text-gold">
                  Canvas 2D (개선된 버전)
                </h3>
                <p className="font-body text-sm text-cream/60 mt-1">
                  경량화, 넓은 호환성
                </p>
              </div>
              <div className="h-[500px] bg-gradient-to-b from-charcoal/10 to-ebony">
                <ViolinCanvas />
              </div>
              <div className="p-4 border-t border-charcoal/30">
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gold/10 text-gold text-xs rounded">
                    Canvas 2D
                  </span>
                  <span className="px-2 py-1 bg-gold/10 text-gold text-xs rounded">
                    Bezier Curves
                  </span>
                  <span className="px-2 py-1 bg-gold/10 text-gold text-xs rounded">
                    Gradients
                  </span>
                  <span className="px-2 py-1 bg-gold/10 text-gold text-xs rounded">
                    Lightweight
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mt-12 bg-charcoal/20 rounded-2xl border border-charcoal/30 p-6">
            <h3 className="font-heading text-xl text-gold mb-6">비교 분석</h3>
            <div className="overflow-x-auto">
              <table className="w-full font-body text-sm">
                <thead>
                  <tr className="border-b border-charcoal/30">
                    <th className="text-left py-3 px-4 text-cream/60">항목</th>
                    <th className="text-center py-3 px-4 text-gold">Three.js 3D</th>
                    <th className="text-center py-3 px-4 text-gold">Canvas 2D</th>
                  </tr>
                </thead>
                <tbody className="text-cream/80">
                  <tr className="border-b border-charcoal/20">
                    <td className="py-3 px-4">시각적 품질</td>
                    <td className="text-center py-3 px-4">★★★★★</td>
                    <td className="text-center py-3 px-4">★★★☆☆</td>
                  </tr>
                  <tr className="border-b border-charcoal/20">
                    <td className="py-3 px-4">성능 (모바일)</td>
                    <td className="text-center py-3 px-4">★★★☆☆</td>
                    <td className="text-center py-3 px-4">★★★★★</td>
                  </tr>
                  <tr className="border-b border-charcoal/20">
                    <td className="py-3 px-4">번들 사이즈</td>
                    <td className="text-center py-3 px-4">~150KB</td>
                    <td className="text-center py-3 px-4">~5KB</td>
                  </tr>
                  <tr className="border-b border-charcoal/20">
                    <td className="py-3 px-4">브라우저 호환성</td>
                    <td className="text-center py-3 px-4">WebGL 필요</td>
                    <td className="text-center py-3 px-4">모든 브라우저</td>
                  </tr>
                  <tr className="border-b border-charcoal/20">
                    <td className="py-3 px-4">인터랙션</td>
                    <td className="text-center py-3 px-4">회전, 줌, 패닝</td>
                    <td className="text-center py-3 px-4">제한적 회전</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">추천 용도</td>
                    <td className="text-center py-3 px-4">고품질 히어로 섹션</td>
                    <td className="text-center py-3 px-4">성능 우선 / 폴백</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-8 text-center">
            <p className="font-body text-sm text-cream/50">
              * 실제 3D 모델을 사용하면 더 사실적인 표현이 가능합니다.
              <br />* 현재는 프로시저럴 지오메트리로 구현되었습니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
