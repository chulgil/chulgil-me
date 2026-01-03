---
name: todo-manage
description: 복잡한 작업을 Phase 기반 TODO.md로 관리합니다.
allowed-tools: Read, Edit, Write
---

# TODO Manage Skill - chulgil.me

복잡한 작업(3시간+, 여러 세션)을 **Phase 기반 TODO.md**로 관리합니다.

## 사용 시점

- 3시간 이상 걸리는 작업
- 여러 세션에 걸쳐 진행되는 작업
- 복잡한 3D/애니메이션 구현

## 도구 선택 기준

| 작업 시간 | 도구 | 이유 |
|----------|------|------|
| < 1시간 | Issue + TodoWrite | 자동 추적으로 충분 |
| 1-3시간 | Issue + TodoWrite | `/sc:spawn` 자동 분해 |
| > 3시간 | Issue + TODO.md | 세션 간 Phase 유지 필요 |

## TODO.md 위치

```
프로젝트 루트/TODO.md
```

## Phase 기반 형식

```markdown
## [작업명] (#이슈번호)

**Goal**: 달성하려는 목표
**Issue**: https://github.com/chulgil/chulgil-me/issues/번호
**Started**: YYYY-MM-DD

---

### Phase 1: 분석 (예상 시간) ✅ COMPLETE

- [x] 작업 항목 1
  - **Result**: 실제 결과 기록
  - **Commit**: abc1234
- [x] 작업 항목 2
  - **Result**: 결과
  - **Risk**: 발견된 리스크 (있다면)

### Phase 2: 구현 (예상 시간) → IN PROGRESS

- [x] 완료된 항목
  - **Result**: 결과
  - **Commit**: def5678
- [ ] 진행중 항목
- [ ] 예정 항목

### Phase 3: 최적화 (예상 시간)

- [ ] 성능 테스트
- [ ] 모바일 최적화

---

## Summary
**Progress**: Phase 2 진행중 (40%)
**Next**: 다음에 해야 할 작업
**Blockers**: 없음 (또는 차단 요소)
**Last Updated**: YYYY-MM-DD HH:MM
```

## 상태 표시

| 상태 | 표시 |
|------|------|
| 완료 | `✅ COMPLETE` |
| 진행중 | `→ IN PROGRESS` |
| 대기 | (표시 없음) |
| 차단됨 | `⛔ BLOCKED` |

## 사용법

```
"이 작업 TODO.md로 관리하자"
"TODO.md Phase 2 진행상황 업데이트해줘"
"다음 세션에서 이어서 할 수 있게 TODO.md 정리해줘"
```

## 워크플로우

### 1. 작업 시작
```
1. Issue 생성 → 전체 목표 정의
2. TODO.md에 Phase 계획 작성
3. Phase 1부터 순차 진행
```

### 2. 세션 중
```
1. 현재 Phase의 작업 항목 진행
2. 완료된 항목에 Result 기록
3. 커밋 시 Commit 해시 기록
```

### 3. 세션 종료
```
1. Summary 섹션 업데이트
2. /sc:save로 컨텍스트 저장
3. 다음 작업 명시
```

### 4. 작업 완료
```
1. 모든 Phase 완료 확인
2. Issue에 요약 코멘트
3. Issue 닫기
4. TODO.md 삭제 또는 아카이브
```

## 예시: 주파수 바이올린 3D 구현

```markdown
## 주파수 바이올린 3D 구현 (#5)

**Goal**: WEBSITE_SPEC.md §3.3 기반 주파수 바이올린 3D 씬 구현
**Issue**: https://github.com/chulgil/chulgil-me/issues/5
**Started**: 2026-01-03

---

### Phase 1: 분석 (1시간) ✅ COMPLETE

- [x] WEBSITE_SPEC.md §3.3 상세 분석
  - **Result**: 3개 레이어 (Human, AI, Music), 파형 타입 확인
  - **Effort**: 30분
- [x] React Three Fiber 구조 설계
  - **Result**: Scene → FrequencyViolin → WaveLayer 구조
  - **Risk**: troika-three-text 성능 이슈 가능

### Phase 2: 기본 구조 (2시간) → IN PROGRESS

- [x] Scene 컴포넌트 설정
  - **Result**: Canvas, Camera, Lighting 구성
  - **Commit**: abc1234
- [ ] 사인파 지오메트리 생성
- [ ] 사각파 지오메트리 생성
- [ ] 바이올린 윤곽 구성

### Phase 3: 인터랙션 (2시간)

- [ ] 마우스 호버 파형 진동
- [ ] 스크롤 기반 레이어 수렴
- [ ] 완성 시 메시지 표시

### Phase 4: 최적화 (1시간)

- [ ] 모바일 성능 테스트
- [ ] LOD 적용
- [ ] 60fps 확인

---

## Summary
**Progress**: Phase 2 (25%)
**Next**: 사인파 지오메트리 BufferGeometry로 생성
**Blockers**: 없음
**Last Updated**: 2026-01-03 14:30
```

## docs/specs/TASKS.md와 연동

```markdown
# TODO.md에서 TASKS.md 참조
## 주파수 바이올린 3D 구현 (#5)
**Spec Reference**: docs/specs/WEBSITE_SPEC.md §3.3

# 완료 후 TASKS.md 업데이트
### 3단계: 3D 통합
- [x] React Three Fiber 설정
- [x] 주파수 바이올린 3D  ← 체크!
```

## 체크리스트

- [ ] Issue가 먼저 생성되었는가?
- [ ] WEBSITE_SPEC.md 관련 섹션 참조했는가?
- [ ] Phase가 논리적 단위로 분리되었는가?
- [ ] 성능 최적화 Phase가 포함되었는가?
- [ ] Summary가 최신 상태인가?
