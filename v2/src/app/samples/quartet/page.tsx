"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

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

const StringQuartetV1 = dynamic(
  () => import("@/components/canvas/StringQuartetV1"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-gold">
        <span className="animate-pulse">Loading V1...</span>
      </div>
    ),
  }
);

const StringQuartetV2 = dynamic(
  () => import("@/components/canvas/StringQuartetV2"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-gold">
        <span className="animate-pulse">Loading V2...</span>
      </div>
    ),
  }
);

const StringQuartetV3 = dynamic(
  () => import("@/components/canvas/StringQuartetV3"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-gold">
        <span className="animate-pulse">Loading V3...</span>
      </div>
    ),
  }
);

const StringQuartetV4 = dynamic(
  () => import("@/components/canvas/StringQuartetV4"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-gold">
        <span className="animate-pulse">Loading V4...</span>
      </div>
    ),
  }
);

type VersionKey = "original" | "v1" | "v2" | "v3" | "v4";

const VERSIONS: Record<
  VersionKey,
  { name: string; description: string; features: string[] }
> = {
  original: {
    name: "Original",
    description: "클래식 다크 테마 - 콘서트홀 무대",
    features: ["스포트라이트 효과", "바닥 반사", "호버 시 소리"],
  },
  v1: {
    name: "V1 - Classic",
    description: "사실적인 클래식 스타일 - 섬세한 목재 표현",
    features: ["상세한 f홀", "바니시 광택", "전통 악기 형태", "콘서트홀 분위기"],
  },
  v2: {
    name: "V2 - Animated",
    description: "동적 애니메이션 - 호흡하는 악기들",
    features: [
      "물결치는 현",
      "호흡 애니메이션",
      "에너지 연결선",
      "네온 효과",
    ],
  },
  v3: {
    name: "V3 - Geometric",
    description: "기하학적 스타일 - 다각형 악기 형태",
    features: [
      "팔각형/십각형 바디",
      "다이아몬드 f홀",
      "그리드 패턴",
      "기하 파티클",
    ],
  },
  v4: {
    name: "V4 - Futuristic",
    description: "미래적 스타일 - 네온과 홀로그램",
    features: [
      "네온 외곽선",
      "홀로그램 효과",
      "스캔 라인",
      "LED 인디케이터",
    ],
  },
};

export default function StringQuartetPage() {
  const [activeVersion, setActiveVersion] = useState<VersionKey>("original");

  const renderCanvas = () => {
    switch (activeVersion) {
      case "v1":
        return <StringQuartetV1 />;
      case "v2":
        return <StringQuartetV2 />;
      case "v3":
        return <StringQuartetV3 />;
      case "v4":
        return <StringQuartetV4 />;
      default:
        return <StringQuartetCanvas />;
    }
  };

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
        <div className="text-center py-8 px-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-2xl text-gold">♩</span>
            <h2 className="font-heading text-4xl md:text-5xl">String Quartet</h2>
            <span className="text-2xl text-gold">♩</span>
          </div>
          <p className="font-body text-cream/70 max-w-xl mx-auto mb-2">
            두 대의 바이올린, 비올라, 첼로가 만드는 완벽한 하모니
          </p>
          <p className="font-body text-sm text-cream/50">
            개방현: 첼로(G/솔) · 비올라(D/레) · 바이올린2(A/라) · 바이올린1(E/미)
          </p>
        </div>

        {/* Version Selector */}
        <div className="max-w-5xl mx-auto px-6 mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            {(Object.keys(VERSIONS) as VersionKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveVersion(key)}
                className={`px-4 py-2 rounded-full font-body text-sm transition-all ${
                  activeVersion === key
                    ? "bg-gold text-ebony"
                    : "bg-charcoal/30 text-cream/70 hover:bg-charcoal/50 hover:text-cream"
                }`}
              >
                {VERSIONS[key].name}
              </button>
            ))}
          </div>
          <div className="text-center mt-3">
            <p className="font-body text-sm text-gold">
              {VERSIONS[activeVersion].description}
            </p>
          </div>
        </div>

        {/* Canvas Section */}
        <div className="px-6 pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-b from-charcoal/10 to-ebony rounded-2xl border border-charcoal/30 overflow-hidden shadow-2xl">
              <div className="h-[550px] md:h-[650px]">{renderCanvas()}</div>
            </div>
          </div>
        </div>

        {/* Version Features */}
        <div className="max-w-4xl mx-auto px-6 pb-8">
          <div className="bg-charcoal/20 rounded-xl border border-charcoal/30 p-6">
            <h3 className="font-heading text-lg text-gold mb-4">
              {VERSIONS[activeVersion].name} 특징
            </h3>
            <div className="flex flex-wrap gap-2">
              {VERSIONS[activeVersion].features.map((feature, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gold/10 text-gold text-sm rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Instrument Info */}
        <div className="max-w-4xl mx-auto px-6 pb-12">
          <h3 className="font-heading text-xl text-center mb-6">악기 소개</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Violin 1 */}
            <div className="bg-charcoal/20 rounded-xl border border-charcoal/30 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gold text-2xl">♪</span>
                <h3 className="font-heading text-xl">제1 바이올린 (E/미)</h3>
              </div>
              <p className="font-body text-sm text-cream/70">
                앙상블의 리더로서 주선율을 담당합니다. 가장 높은 음역대에서
                화려하고 표현력 있는 멜로디를 연주합니다.
              </p>
            </div>

            {/* Violin 2 */}
            <div className="bg-charcoal/20 rounded-xl border border-charcoal/30 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gold text-2xl">♪</span>
                <h3 className="font-heading text-xl">제2 바이올린 (A/라)</h3>
              </div>
              <p className="font-body text-sm text-cream/70">
                제1 바이올린과 대화하며 화음을 풍성하게 만듭니다. 때로는 반주를,
                때로는 대선율을 연주합니다.
              </p>
            </div>

            {/* Viola */}
            <div className="bg-charcoal/20 rounded-xl border border-charcoal/30 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gold text-2xl">♫</span>
                <h3 className="font-heading text-xl">비올라 (D/레)</h3>
              </div>
              <p className="font-body text-sm text-cream/70">
                바이올린보다 깊고 따뜻한 음색으로 중음역을 담당합니다. 앙상블의
                화성을 채우는 핵심적인 역할을 합니다.
              </p>
            </div>

            {/* Cello */}
            <div className="bg-charcoal/20 rounded-xl border border-charcoal/30 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gold text-2xl">♬</span>
                <h3 className="font-heading text-xl">첼로 (G/솔)</h3>
              </div>
              <p className="font-body text-sm text-cream/70">
                풍부하고 깊은 저음으로 앙상블의 기초를 다집니다. 베이스라인부터
                서정적인 멜로디까지 폭넓게 표현합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Version Comparison */}
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <div className="bg-charcoal/10 rounded-xl border border-charcoal/20 p-6">
            <h3 className="font-heading text-lg text-gold mb-4">버전 비교</h3>
            <div className="overflow-x-auto">
              <table className="w-full font-body text-sm">
                <thead>
                  <tr className="border-b border-charcoal/30">
                    <th className="text-left py-3 px-2 text-cream/60">버전</th>
                    <th className="text-center py-3 px-2 text-gold">테마</th>
                    <th className="text-center py-3 px-2 text-gold">
                      인터랙션
                    </th>
                    <th className="text-center py-3 px-2 text-gold">효과</th>
                  </tr>
                </thead>
                <tbody className="text-cream/80">
                  <tr className="border-b border-charcoal/20">
                    <td className="py-3 px-2 font-medium">Original</td>
                    <td className="text-center py-3 px-2">다크</td>
                    <td className="text-center py-3 px-2">호버</td>
                    <td className="text-center py-3 px-2">스포트라이트</td>
                  </tr>
                  <tr className="border-b border-charcoal/20">
                    <td className="py-3 px-2 font-medium">V1 - Classic</td>
                    <td className="text-center py-3 px-2">웜톤</td>
                    <td className="text-center py-3 px-2">호버</td>
                    <td className="text-center py-3 px-2">사실적 목재</td>
                  </tr>
                  <tr className="border-b border-charcoal/20">
                    <td className="py-3 px-2 font-medium">V2 - Animated</td>
                    <td className="text-center py-3 px-2">퍼플</td>
                    <td className="text-center py-3 px-2">호버 + 펄스</td>
                    <td className="text-center py-3 px-2">호흡 + 네온</td>
                  </tr>
                  <tr className="border-b border-charcoal/20">
                    <td className="py-3 px-2 font-medium">V3 - Geometric</td>
                    <td className="text-center py-3 px-2">퍼플</td>
                    <td className="text-center py-3 px-2">호버 + 그리드</td>
                    <td className="text-center py-3 px-2">다각형 + 기하</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 font-medium">V4 - Futuristic</td>
                    <td className="text-center py-3 px-2">딥스페이스</td>
                    <td className="text-center py-3 px-2">호버 + 스캔</td>
                    <td className="text-center py-3 px-2">네온 + 홀로그램</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
