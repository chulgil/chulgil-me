---
name: maintain-docs
description: 코드 변경 시 관련 문서를 함께 업데이트합니다.
allowed-tools: Read, Grep, Edit, Glob
---

# Maintain Docs Skill - chulgil.me

코드 변경 시 **관련 문서를 동기화**하여 문서와 코드의 일관성을 유지합니다.

## 사용 시점

- 새 섹션/컴포넌트 구현 완료 후
- 3D 요소 변경 후
- 애니메이션 로직 변경 후
- 개발 단계 완료 시

## 문서 위치

```
docs/
└── specs/
    ├── WEBSITE_SPEC.md    # v2 전체 명세 (핵심!)
    └── TASKS.md           # 작업 현황/체크리스트
```

## 코드-문서 매핑

| 코드 위치 | 관련 문서 |
|----------|----------|
| `v2/src/components/sections/` | `WEBSITE_SPEC.md §4 섹션 명세` |
| `v2/src/components/three/` | `WEBSITE_SPEC.md §3.3 3D 요소` |
| `v2/src/hooks/useAudio.ts` | `WEBSITE_SPEC.md §5 오디오 디자인` |
| 반응형 스타일 | `WEBSITE_SPEC.md §6 반응형` |
| 접근성 구현 | `WEBSITE_SPEC.md §7 접근성` |
| 개발 진행 | `TASKS.md` 체크리스트 |

## 앵커 업데이트 규칙

### CLAUDE.md 앵커 목록
```
#overview, #quick-reference, #commands
#project-structure, #issue-workflow, #claude-guidelines
#core-rules, #docs-structure, #development-phases
#performance-goals, #priorities, #troubleshooting
#core-concept
```

### 앵커 추가 형식
```markdown
## 섹션 제목 {#anchor-id}
```

## 작업별 업데이트 체크리스트

### 섹션 구현 완료 시
- [ ] `TASKS.md` 해당 섹션 체크박스 완료
- [ ] `WEBSITE_SPEC.md` §4에 구현 노트 추가 (필요시)
- [ ] `CLAUDE.md #development-phases` 상태 업데이트

### 3D 요소 변경 시
- [ ] `WEBSITE_SPEC.md §3.3` 업데이트
- [ ] 성능 영향 시 `CLAUDE.md #performance-goals` 확인

### 오디오 변경 시
- [ ] `WEBSITE_SPEC.md §5` 업데이트
- [ ] 에셋 추가 시 `WEBSITE_SPEC.md §9` 업데이트

### 개발 단계 완료 시
- [ ] `TASKS.md` 해당 Phase 모든 항목 체크
- [ ] `CLAUDE.md #priorities` 다음 우선순위 업데이트

## 사용법

```
"히어로 섹션 완료했으니 문서 업데이트해줘"
"3D 바이올린 구현했는데 스펙에 반영해줘"
"Phase 1 완료, TASKS.md 업데이트해줘"
```

## 자동화 패턴

### 기능 완료 시 플로우
```
1. 기능 구현 완료
2. "문서 업데이트해줘" 요청
3. Claude가 자동으로:
   - TASKS.md 체크박스 업데이트
   - CLAUDE.md 상태 업데이트
   - 필요시 WEBSITE_SPEC.md 노트 추가
```

### 커밋 메시지
```bash
# 코드 + 문서 함께 변경 시
git commit -m "feat(hero): 주파수 바이올린 히어로 섹션 구현

- src/components/sections/Hero.tsx 추가
- src/components/three/FrequencyViolin.tsx 추가
- docs/specs/TASKS.md Phase 2 체크
- CLAUDE.md 개발 단계 업데이트"
```

## 주의사항

- 문서 업데이트 없이 Phase 완료 표시 금지
- WEBSITE_SPEC.md는 설계 문서 - 큰 변경만 반영
- TASKS.md는 진행 상황 - 자주 업데이트
- 앵커 ID는 kebab-case 사용 (`#my-anchor`)
