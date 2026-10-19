# AGENTS.md: AI 에이전트 & 기여자를 위한 가이드 (Guide for AI Agents & Contributors)

MyDiary Desktop은 학생 성장 일지 및 일과 관리를 위한 크로스플랫폼(Windows, macOS, Linux) 데스크톱 애플리케이션입니다.  
**Electron + React 19 + Vite** 기술 스택 기반의 순수 JavaScript 프로젝트로 구축되어 있습니다.

본 리포지토리는 특정 AI 도구(Claude, Antigravity, Cursor 등)에 종속되지 않는 **도구 중립적(Tool-Agnostic) 협력적 에이전트 하네스**로 운영됩니다. 모든 AI 에이전트와 인간 기여자는 동등한 엔지니어로서 본 가이드와 `docs/`의 원칙을 준수해야 합니다.

작업 전 본 파일(`AGENTS.md`)을 가장 먼저 읽고, 세부 사항은 `docs/`를 참조하십시오.

---

## 1. 5분 오리엔테이션 (5-Minute Orientation)

| 문서 | 목적 및 핵심 내용 |
|---|---|
| [docs/INDEX.md](file:///d:/development/mydiary-desktop/docs/INDEX.md) | 전체 문서 허브, 사이트맵 및 계층 구조 |
| [docs/MYDIARY_PROJECT_MASTER_PLAN.md](file:///d:/development/mydiary-desktop/docs/MYDIARY_PROJECT_MASTER_PLAN.md) | 전체 아키텍처, Electron 생명주기, Preload IPC 채널, 스토리지 스펙 |
| [docs/coding-standards.md](file:///d:/development/mydiary-desktop/docs/coding-standards.md) | 순수 JS + @types, React 19, Context Isolation, HWPX XML 방어 |
| [docs/database-integrity.md](file:///d:/development/mydiary-desktop/docs/database-integrity.md) | 모바일 백업 JSON 1:1 완벽 호환, Cascade Delete, 데이터 유실 방지 |
| [docs/ui-design.md](file:///d:/development/mydiary-desktop/docs/ui-design.md) | 와이드 데스크톱 3단 그리드, `src/theme.js` 디자인 토큰 및 인터랙션 |
| [docs/COLLABORATION_AND_MOCK_GUIDE.md](file:///d:/development/mydiary-desktop/docs/COLLABORATION_AND_MOCK_GUIDE.md) | GCP 키 없는 Zero-Config Mock 환경, GitHub 4대 업적 연계 Git 하네스 |
| [docs/release-versioning.md](file:///d:/development/mydiary-desktop/docs/release-versioning.md) | 릴리즈 4대 일괄 동기화(package, README, HelpModal, 빌드 검증), Windows SAC 방어 |
| [ROADMAP.md](file:///d:/development/mydiary-desktop/ROADMAP.md) | 현재 버전 단계, 차원별 완성도(%), 에이전트 공수 추정치 및 현 집중 과제 |
| [ATTRIBUTION.md](file:///d:/development/mydiary-desktop/ATTRIBUTION.md) | 번들 에셋, 폰트, 아이콘 라이선스 및 인간/AI 공식 기여자 명시 |
| [SECURITY.md](file:///d:/development/mydiary-desktop/SECURITY.md) | 취약점 보고 절차, 로컬 스토리지 격리, Electron IPC 보안 지침 |

---

## 2. 워크스페이스 구조 맵 (Workspace Map)

```text
mydiary-desktop/
├── electron/                  # Electron Main & Preload 프로세스
│   ├── main.js                # 메인 프로세스 생명주기, 창 제어, 단일 인스턴스 락
│   └── preload.js             # Context Isolation 기반 화이트리스트 IPC 브릿지 (window.electronAPI)
├── src/                       # React 19 렌더러 프런트엔드
│   ├── components/            # UI 컴포넌트 (모달, 에디터, 학생/일지 리스트)
│   ├── services/              # 코어 비즈니스 서비스
│   │   ├── Database.js        # 로컬 스토리지 & 모바일 호환 DB 레이어
│   │   ├── GoogleDriveService.js # 구글 드라이브 동기화 & Mock 클라우드 폴백
│   │   ├── HwpxExportService.js  # 국가 표준 한글 문서(OWPML) 생성 엔진
│   │   ├── DocxExportService.js  # MS Word OpenXML 내보내기 엔진
│   │   └── PrintService.js    # A4 인쇄 및 HTML 리포트 템플릿
│   ├── styles/                # 바닐라 CSS 토큰 및 전역 스타일
│   └── theme.js               # 색상 팔레트 및 디자인 토큰 SSOT
├── scripts/                   # 자동화 및 CI/CD CLI 하네스
│   ├── run-code-audit.cjs     # 정기 코드 감사 및 아키텍처 무결성 검증 (npm run audit)
│   ├── git-achievement.js     # GitHub 4대 업적 연계 & 100% 한국어 커밋 하네스
│   └── sync-readme-version.js # 릴리즈 버전 일괄 동기화 스크립트
├── docs/                      # 단일 진실 공급원(SSOT) 공통 기술 문서 허브
├── log/                       # [Gitignored] 에이전트 간 세션 인계 데브로그 (devlog.md)
├── AGENTS.md                  # [본 파일] AI 에이전트 & 기여자 마스터 행동 헌장
├── ROADMAP.md                 # 프로젝트 단계, 준비도 및 작업 로드맵
├── ATTRIBUTION.md             # 에셋 출처, 라이선스, 인간 및 AI 기여자 크레딧
└── SECURITY.md                # 보안 정책 및 취약점 대응 지침
```

---

## 3. 골든 룰 (Golden Rules)

### Rule 1. 데이터 무결성 최우선 (Data Integrity Outranks Everything)
사용자의 관찰 일지와 성장 기록은 절대 유실되어서는 안 됩니다.
- 모바일 앱(`mydiary`) 백업 JSON과의 **1:1 양방향 호환성**을 상시 유지합니다.
- 학생 삭제 시 하위 일지와 계획표가 안전하게 정리되는 **Cascade Delete**를 보장합니다.
- 데이터베이스 키 표준(`@mydiary:*`)을 엄격히 준수합니다.

### Rule 2. 절대 크래시 금지 (Never Crash on Input / IPC)
잘못된 백업 파일, 비정상 IPC 호출, 빈 값 입력, 손상된 환경 변수로 인해 앱이 패닉하거나 하얗게 멈춰서는 안 됩니다.
- 모든 IPC 수신부 및 서비스 함수는 철저한 입력 유효성 검증과 `try-catch` 방어 코드를 갖추어야 합니다.
- 시스템 에러 발생 시 크래시 대신 사용자 친화적 인앱 안내를 제공합니다.

### Rule 3. 순수 JavaScript + @types 환경 유지
- 본 프로젝트는 순수 JavaScript(React 19 JSX) 환경을 유지합니다. 임의로 TypeScript(`.ts`/`.tsx`)로 전면 전환하지 마십시오.
- 타입 힌트와 자동 완성은 `devDependencies`의 `@types/*`와 `jsconfig.json`을 통해 충족합니다.

### Rule 4. Zero-Config Mock 환경 및 공동개발자 보존
- 로컬에 구글 클라우드(GCP) API 키가 없더라도 앱이 크래시 없이 즉시 실행·테스트될 수 있도록 Mock 폴백 구조(`GoogleDriveService.js`, `main.js`)를 절대 훼손하지 않습니다.
- 원클릭 샘플 데이터 생성기(`seedMockData`) 로직을 항상 보존합니다.

### Rule 5. 100% 순수 한국어 Git 커밋 & 업적 연계
- 모든 Git 커밋 메시지는 **예외 없이 100% 명확한 한국어**로만 작성합니다 (`feat: 학생 통계 차트 신규 추가` 등).
- 협업자 `Co-authored-by: zigman1234 <zigman1234@users.noreply.github.com>`를 기본 적용합니다.
- `scripts/git-achievement.js` 하네스를 통해 GitHub 4대 업적 뱃지 달성을 지원합니다.

### Rule 6. 서킷 브레이커 (Circuit Breaker)
- 빌드/린트/테스트 검증 실패 시 동일한 원인에 대한 자동 자가 수정 시도는 **최대 2회**로 제한합니다.
- 무한 자가 수정 루프를 금지하며, 해결되지 않는 이슈는 즉시 원인을 분석하여 사용자에게 보고 후 승인을 받습니다.

---

## 4. 작업 선정 절차 (Picking Work)

에이전트가 새로운 작업을 시작할 때의 우선순위 가이드:

1. [ROADMAP.md](file:///d:/development/mydiary-desktop/ROADMAP.md) 확인: 현재 마일스톤과 **Current Focus** 파악.
2. [log/devlog.md](file:///d:/development/mydiary-desktop/log/devlog.md) 확인: 이전 에이전트/개발자가 남긴 `Still open` 항목 확인.
3. [docs/](file:///d:/development/mydiary-desktop/docs/INDEX.md) 참조: 관련 기능의 아키텍처 및 표준 규격 숙지 후 착수.

---

## 5. 작업 완료 전 필수 게이트 (Before You Finish a Task)

작업을 완료했다고 보고하기 전에 반드시 다음 검증을 통과해야 합니다:

```sh
# 1. 프로덕션 번들링 무결성 검증 (Vite 빌드 에러 및 문법 결함 방어)
cmd /c npm run build

# 2. 정기 코드 감사 및 아키텍처 무결성 검증 (Fat 컴포넌트, SSOT, 보안 린트)
cmd /c npm run audit
```

검증이 완료되면:
1. [log/devlog.md](file:///d:/development/mydiary-desktop/log/devlog.md) 하단에 완료 내용과 열려 있는 항목(`Still open`)을 간결하게 추가합니다.
2. 사용자에게 명확한 작업 결과와 한국어 커밋 제안을 보고합니다.

---

## 6. 병렬 및 다중 에이전트 협업 수칙 (Parallel & Multi-Agents)

- 여러 AI 에이전트(또는 인간 개발자와 AI)가 동시에 작업할 때는 **외과적 최소 수정(Surgical Edit)**을 수행합니다.
- 공유 파일(`electron/main.js`, `src/App.jsx`, `src/services/Database.js`) 수정 시 기존 코드를 함부로 재정렬하거나 광범위하게 덮어쓰지 않습니다.
- 새 기능이 대규모인 경우 새 모듈/컴포넌트로 분리하여 파일 충돌을 사전에 방어합니다.

---

## 7. 세션 연속성 및 인계 프로토콜 (Session Hand-off)

LLM 세션은 컨텍스트 용량 제한이나 네트워크 타임아웃으로 예기치 않게 종료될 수 있습니다.  
따라서 각 세션이 끝날 때마다 **`log/devlog.md`**에 작업 일지를 기록하여, 다음에 참여하는 어떤 AI(또는 인간)라도 지체 없이 작업을 이어받을 수 있도록 합니다.

---

## 8. 기여자 크레딧 (Contributor Credits)

- **총괄 설계 및 개발 (Lead Maintainer)**: 성백진 (`Sung Baekjin` / `sbjwin4271@gmail.com`)
- **공동 개발 및 협력 (Collaborator)**: `zigman1234`
- **공인 AI 에이전트 기여자 (AI Contributors)**: Google Antigravity Agent (Gemini Flash/Pro), Anthropic Claude Code, OpenAI Codex 등
- 상세한 라이선스 및 에셋 귀속은 [ATTRIBUTION.md](file:///d:/development/mydiary-desktop/ATTRIBUTION.md)를 참조하십시오.
