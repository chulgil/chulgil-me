# 포트폴리오 개선 아이디어

> 작성일: 2025-01-01
> 참조: Awwwards 수상작, 인터랙티브 포트폴리오 리서치

---

## 현재 구현 분석

### 강점
- **독창적인 컨셉**: 주파수(Frequency)로 Human + AI + Music 연결
- **일관된 테마**: 바이올린/클래식 음악 메타포 (악장, 오케스트라 등)
- **기술 스택**: Next.js + GSAP + Tailwind (검증된 조합)
- **가로 스크롤 프로젝트**: 인터랙티브한 탐색 경험

### 개선 기회
- 오디오 요소 부재 (음악 테마인데 소리 없음)
- 3D 요소 제한적 (Canvas 2D만 사용)
- 마이크로 인터랙션 부족
- 로딩 경험 미구현

---

## 개선 아이디어

### 1. 오디오 시스템 (높은 우선순위)

**영감**: [Codrops 3D Audio Visualizer](https://tympanus.net/codrops/2025/06/18/coding-a-3d-audio-visualizer-with-three-js-gsap-web-audio-api/)

| 기능 | 설명 | 난이도 |
|------|------|--------|
| **앰비언트 사운드** | 배경 바이올린 음악 (루프) | 중 |
| **스크롤 연동 사운드** | 섹션 전환 시 음향 효과 | 중 |
| **호버 사운드** | 버튼/카드 호버 시 피치카토 | 하 |
| **주파수 시각화 연동** | 실제 오디오 데이터로 파티클 반응 | 상 |

```typescript
// 예시: Web Audio API 연동
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
// FrequencyWaves에서 실제 음악 데이터로 파티클 애니메이션
```

**고려사항**: 음소거 토글 필수, 자동재생 제한 대응

---

### 2. 3D 인터랙션 강화

**영감**: [Bruno Simon Portfolio](https://bruno-simon.com/) - 3D 자동차로 포트폴리오 탐색

| 아이디어 | 설명 | 복잡도 |
|----------|------|--------|
| **3D 바이올린 모델** | Hero 섹션에 회전 가능한 3D 바이올린 | 상 |
| **마우스 패럴랙스** | 스크롤/마우스 위치에 따른 깊이감 | 중 |
| **파티클 물리 엔진** | 클릭 시 폭발 후 재형성 (V4처럼) | 중 |
| **WebGL 셰이더** | Matcap으로 조명 없이 고급 렌더링 | 상 |

**Bruno Simon 기법 참고**:
- 조명 대신 Matcap 텍스처 사용 (성능 최적화)
- Cannon.js로 물리 시뮬레이션
- 타이틀에 충돌하면 움직이는 인터랙션

---

### 3. 스크롤 스토리텔링

**영감**: [CANALS Amsterdam](https://www.awwwards.com/websites/storytelling/), NWR Portfolio

| 기능 | 설명 |
|------|------|
| **섹션 간 트랜지션** | 페이드/슬라이드가 아닌 창의적 전환 |
| **스크롤 진행 표시** | 악보 진행처럼 표시 (마디/박자) |
| **스냅 스크롤** | 섹션 단위로 정확히 멈춤 |
| **역방향 스크롤 효과** | 위로 스크롤 시 다른 애니메이션 |

```typescript
// 예시: 악보 스타일 진행 표시
const ScrollProgress = () => {
  // 현재 섹션을 악보 마디로 표현
  // ♩ ♩ ♩ ♩ | ♩ ♩ ● ♩ | ...
};
```

---

### 4. 마이크로 인터랙션

**영감**: [Axel Vanhessche](https://www.awwwards.com/), Karim Saab

| 요소 | 현재 | 개선안 |
|------|------|--------|
| **버튼 호버** | 배경색 변경 | 물결 효과 + 사운드 |
| **카드 호버** | 살짝 위로 이동 | 3D 틸트 + 그림자 |
| **링크** | 기본 스타일 | 밑줄 드로잉 애니메이션 |
| **커서** | 기본 화살표 | 커스텀 커서 (음표?) |
| **텍스트** | 정적 | 글자별 등장 애니메이션 |

---

### 5. 로딩 경험

**영감**: 대부분의 Awwwards 수상작

```
┌─────────────────────────────────────┐
│                                     │
│           ♩ ♪ ♫ ♬                   │
│                                     │
│      "Tuning the instruments..."    │
│                                     │
│          ████████░░ 80%             │
│                                     │
└─────────────────────────────────────┘
```

| 단계 | 메시지 (예시) |
|------|---------------|
| 0-25% | "악기를 조율하는 중..." |
| 25-50% | "악보를 펼치는 중..." |
| 50-75% | "오케스트라 준비 중..." |
| 75-100% | "연주 시작!" |

---

### 6. 인터랙티브 요소 추가

#### A. 이메일 복사 기능
```typescript
const copyEmail = async () => {
  await navigator.clipboard.writeText('contact@chulgil.me');
  // 토스트: "이메일이 복사되었습니다 ♪"
};
```

#### B. 테마 토글 (라이트/다크)
- 라이트: 현재 ivory/cream 기반
- 다크: ebony 기반, 금색 강조

#### C. 언어 전환 (한/영)
- 현재 한국어 → 영어 추가

#### D. 키보드 네비게이션
```
↑/↓: 섹션 이동
←/→: 프로젝트 카드 이동
M: 음소거 토글
```

---

### 7. 성능 최적화

| 항목 | 현재 | 목표 |
|------|------|------|
| **LCP** | 측정 필요 | < 2.5s |
| **FID** | 측정 필요 | < 100ms |
| **CLS** | 측정 필요 | < 0.1 |
| **Canvas 최적화** | 매 프레임 전체 렌더 | 더티 영역만 렌더 |
| **이미지** | 일반 로딩 | lazy loading + blur placeholder |

---

### 8. 접근성 개선

| 항목 | 구현 방안 |
|------|-----------|
| **스크린 리더** | aria-label, role 추가 |
| **키보드 탐색** | tabindex, focus 스타일 |
| **모션 감소** | prefers-reduced-motion 대응 |
| **색상 대비** | WCAG AA 기준 충족 확인 |

---

## 우선순위 제안

### Phase 1: Quick Wins (1-2일)
1. [ ] 커스텀 커서
2. [ ] 이메일 복사 기능
3. [ ] 버튼/카드 호버 효과 강화
4. [ ] 스크롤 진행 표시기

### Phase 2: 인터랙션 강화 (3-5일)
1. [ ] 로딩 스크린
2. [ ] 섹션 트랜지션 효과
3. [ ] 텍스트 등장 애니메이션
4. [ ] 3D 틸트 카드 효과

### Phase 3: 오디오 시스템 (5-7일)
1. [ ] 앰비언트 배경 음악
2. [ ] 호버/클릭 사운드 효과
3. [ ] 오디오 시각화 연동
4. [ ] 음소거 토글 UI

### Phase 4: 고급 기능 (선택)
1. [ ] 3D 바이올린 모델
2. [ ] 다크 모드
3. [ ] 영어 버전
4. [ ] PWA 지원

---

## 참고 자료

### 포트폴리오 영감
- [Bruno Simon](https://bruno-simon.com/) - 3D 게임형 포트폴리오
- [Awwwards GSAP 컬렉션](https://www.awwwards.com/websites/gsap/)
- [Awwwards Three.js 컬렉션](https://www.awwwards.com/websites/three-js/)

### 기술 자료
- [Codrops 3D Audio Visualizer](https://tympanus.net/codrops/2025/06/18/coding-a-3d-audio-visualizer-with-three-js-gsap-web-audio-api/)
- [Awesome Audio Visualization](https://github.com/willianjusten/awesome-audio-visualization)
- [Three.js Journey](https://threejs-journey.com/)

### 스크롤 애니메이션
- [HubSpot Parallax Examples](https://blog.hubspot.com/website/parallax-website-examples)
- [Creative Bloq Parallax Guide](https://www.creativebloq.com/web-design/parallax-scrolling-1131762)

---

## 논의 필요 사항

1. **오디오 우선순위**: 음악 테마에 오디오가 핵심인가, 아니면 시각적 메타포로 충분한가?
2. **3D 복잡도**: Three.js 본격 도입 vs Canvas 2D 최적화?
3. **성능 vs 효과**: 모바일 성능 우선 vs 데스크톱 풀 경험?
4. **다국어**: 영어 버전 필요성?
