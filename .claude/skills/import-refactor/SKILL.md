---
name: import-refactor
description: 파일 이동 후 import 경로를 자동으로 업데이트합니다.
allowed-tools: Read, Grep, Edit, Glob
---

# Import Refactor Skill - chulgil.me (TypeScript/React)

파일 이동/리네이밍 후 **모든 import 경로를 자동으로 업데이트**합니다.

## 사용 시점

- 파일을 다른 폴더로 이동할 때
- 파일명을 변경할 때
- 컴포넌트 구조를 재구성할 때

## 작업 순서

### 1. 변경 사항 파악
```
이전 경로: src/components/Hero.tsx
새 경로: src/components/sections/Hero.tsx
```

### 2. 영향받는 파일 검색
```bash
# 기존 경로를 import하는 모든 파일 찾기
grep -r "from.*components/Hero" src/
```

### 3. import 경로 업데이트
```typescript
// Before
import { Hero } from '@/components/Hero';

// After
import { Hero } from '@/components/sections/Hero';
```

### 4. index.ts (barrel file) 업데이트
```typescript
// src/components/sections/index.ts
export { Hero } from './Hero';
export { About } from './About';
export { Skills } from './Skills';
```

## 사용법

```
"Hero.tsx를 sections/로 이동하고 import 업데이트해줘"
"컴포넌트 구조 재구성하고 참조 업데이트해줘"
```

## v2 프로젝트 구조 (Next.js 14)

```
v2/src/
├── app/                    # App Router 페이지
├── components/
│   ├── sections/           # 섹션 컴포넌트
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   └── index.ts
│   ├── three/              # 3D 컴포넌트
│   │   ├── Scene.tsx
│   │   ├── FrequencyViolin.tsx
│   │   └── index.ts
│   ├── ui/                 # UI 컴포넌트
│   │   ├── Button.tsx
│   │   └── index.ts
│   └── animations/         # 애니메이션 컴포넌트
│       ├── ScrollReveal.tsx
│       └── index.ts
├── hooks/                  # 커스텀 훅
└── lib/                    # 유틸리티
```

## Import 스타일 가이드

### 권장 패턴
```typescript
// 1. 경로 alias 사용 (권장)
import { Hero } from '@/components/sections';

// 2. 직접 파일 import
import { Hero } from '@/components/sections/Hero';

// 3. 상대 경로 (같은 폴더 내에서만)
import { Button } from './Button';
```

### 비권장 패턴
```typescript
// 너무 긴 상대 경로 금지
import { Hero } from '../../../components/sections/Hero';

// 와일드카드 import 금지
import * from '@/components';
```

## tsconfig.json 경로 alias

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}
```

## 체크리스트

- [ ] 모든 import 경로가 업데이트되었는가?
- [ ] index.ts (barrel file)가 업데이트되었는가?
- [ ] 경로 alias를 사용하는가?
- [ ] TypeScript 에러가 없는가?
- [ ] `npm run build` 성공하는가?

## 주의사항

### 1. Dynamic Import
```typescript
// 동적 import 경로도 확인 필요
const Component = dynamic(() => import('@/components/sections/Hero'));
```

### 2. Next.js 이미지 경로
```tsx
// public/ 폴더 경로는 절대 경로 유지
<Image src="/images/hero.jpg" alt="Hero" />
```

### 3. CSS/Style 파일
```typescript
// 스타일 파일 import도 확인
import styles from './Hero.module.css';
```
