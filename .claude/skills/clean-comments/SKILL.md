---
name: clean-comments
description: TypeScript/React 코드에서 불필요한 주석을 정리하고, 가치 있는 주석만 유지합니다.
allowed-tools: Read, Grep, Edit
---

# Clean Comments Skill - chulgil.me (TypeScript/React)

코드 리뷰 또는 정리 시 **불필요한 주석을 제거**하고 **가치 있는 주석만 유지**합니다.

## 사용 시점

- 코드 리뷰 후 정리 작업
- 리팩토링 완료 후 마무리
- 디버그 코드 제거 요청 시

## 제거 대상

### 1. 디버그 주석
```typescript
// console.log("debug:", value);  // 제거
// debugger;                       // 제거
// TODO: remove this               // 제거
```

### 2. 주석 처리된 코드
```tsx
// old implementation:
// if (condition) {
//   doSomething();
// }

{/* <OldComponent /> */}
```

### 3. 자명한 주석
```typescript
// increment counter  ← 제거 (코드가 명확)
counter++;

// set name           ← 제거
this.name = name;
```

### 4. 오래된 TODO/FIXME
```typescript
// TODO: implement later (2024-01-15)  ← 오래된 TODO
// FIXME: temporary workaround         ← 해결된 경우
```

## 유지 대상

### 1. 복잡한 로직 설명
```typescript
// 주파수 바이올린: 세 레이어가 스크롤에 따라 수렴
// Human(사인파) + AI(사각파) + Music(순수 사인파)
const convergeFactor = scrollProgress * 0.8;
```

### 2. 3D/애니메이션 관련 설명
```typescript
// GSAP ScrollTrigger: 섹션 진입 시 트리거
gsap.to(element, {
  scrollTrigger: { ... }
});
```

### 3. 성능 관련 주석
```typescript
// useMemo: 비용이 큰 3D 지오메트리 계산 캐싱
const geometry = useMemo(() => createGeometry(), []);
```

### 4. 문서화 주석 (JSDoc/TSDoc)
```typescript
/**
 * Creates a frequency violin 3D scene.
 *
 * @param layers - Human, AI, Music layers
 * @returns Three.js scene with animated waveforms
 */
function createFrequencyViolin(layers: Layer[]): Scene { ... }
```

### 5. 앵커 주석
```typescript
// {#anchor-id}  ← 문서 참조용 앵커는 유지
```

## 사용법

```
"v2/src/components/ 폴더의 불필요한 주석 정리해줘"
"이 파일에서 디버그 주석 제거해줘"
"주석 처리된 JSX 정리해줘"
```

## 작업 순서

1. **탐색**: 대상 파일/폴더 내 주석 검색
2. **분류**: 제거/유지 대상 분류
3. **확인**: 제거 대상 목록 사용자에게 확인
4. **정리**: 승인된 주석만 제거
5. **검증**: `npm run lint` 실행

## 체크리스트

- [ ] JSDoc/TSDoc 주석은 유지했는가?
- [ ] 3D/애니메이션 관련 설명은 유지했는가?
- [ ] 성능 최적화 관련 주석은 유지했는가?
- [ ] 앵커 주석 (`{#...}`)은 유지했는가?
- [ ] `npm run lint` 통과하는가?
