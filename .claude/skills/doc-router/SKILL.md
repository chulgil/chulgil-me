---
name: doc-router
description: chulgil-me 프로젝트의 문서를 앵커 기반으로 빠르게 조회합니다. 전체 파일 대신 특정 섹션만 로드하여 토큰을 80-90% 절약합니다.
allowed-tools: Read, Grep, Glob
---

# Doc Router Skill - chulgil.me

chulgil.me 프로젝트의 **문서 앵커 인덱스**를 제공하고 특정 섹션을 빠르게 조회합니다.

## 사용 시점

- 특정 문서 섹션만 필요할 때
- 전체 파일 로드 없이 가이드 확인할 때
- 토큰 효율적인 문서 조회가 필요할 때

## CLAUDE.md 앵커 인덱스

### 기본 정보

| 앵커 | 설명 |
|------|------|
| `#overview` | 프로젝트 개요 |
| `#quick-reference` | 빠른 참조 (기술 스택) |
| `#commands` | 명령어 (v1, v2) |
| `#project-structure` | 프로젝트 구조 |

### 작업 가이드

| 앵커 | 설명 |
|------|------|
| `#issue-workflow` | Issue 기반 작업 |
| `#claude-guidelines` | Claude 작업 지침 |
| `#core-rules` | 핵심 규칙 (언어, 디자인, 3D) |
| `#docs-structure` | 문서 구조 |

### 개발

| 앵커 | 설명 |
|------|------|
| `#development-phases` | v2 개발 단계 |
| `#performance-goals` | 성능 목표 |
| `#priorities` | 작업 우선순위 |
| `#troubleshooting` | 문제 해결 |
| `#core-concept` | 핵심 컨셉 (주파수) |

## 주요 문서

| 문서 | 설명 | 언제 확인 |
|------|------|----------|
| `docs/specs/WEBSITE_SPEC.md` | v2 전체 명세 | 🔴 v2 작업 시 필수 |
| `docs/specs/TASKS.md` | 작업 현황 | 작업 시작 전 |
| `README.md` | 프로젝트 개요 | 개요 파악 시 |

## 사용법

### 특정 섹션 조회

```
"CLAUDE.md의 #commands 섹션 보여줘"
"#development-phases 확인해줘"
"#core-concept 읽어줘"
```

### 중요 섹션 (필수 확인)

```
# v2 개발 시작 시 필수
"WEBSITE_SPEC.md 보여줘"

# 3D 작업 시
"#core-rules 읽어줘"

# 성능 최적화 시
"#performance-goals 확인해줘"
```

## 조회 패턴

### Pattern 1: 앵커로 직접 조회 (권장)

```bash
"CLAUDE.md의 #claude-guidelines 섹션만 읽어줘"
```

### Pattern 2: 전체 명세 확인

```bash
"docs/specs/WEBSITE_SPEC.md 읽어줘"
```

### Pattern 3: 작업 현황 확인

```bash
"docs/specs/TASKS.md 확인해줘"
```

## 토큰 효율성

| 조회 방식 | 토큰 | 절약률 |
|----------|------|--------|
| 전체 WEBSITE_SPEC.md 읽기 | ~8,000 | - |
| CLAUDE.md 전체 | ~2,000 | - |
| 앵커로 섹션 조회 | ~500 | 75-95% |

## 자주 사용하는 조회

| 상황 | 요청 |
|------|------|
| v2 개발 시작 | "WEBSITE_SPEC.md 보여줘" |
| 3D 구현 | "#core-concept 확인해줘" |
| 성능 목표 확인 | "#performance-goals 읽어줘" |
| 작업 현황 | "TASKS.md 보여줘" |
| 문제 해결 | "#troubleshooting 읽어줘" |
