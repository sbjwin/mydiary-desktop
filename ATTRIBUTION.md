# 귀속 및 기여자 정보 (Attribution)

MyDiary Desktop 프로젝트에 포함된 모든 코드, 번들 에셋, 폰트, 아이콘, 문서 서식의 저작권자와 라이선스, 그리고 프로젝트에 기여한 인간 개발자 및 공인 AI 에이전트 목록입니다.

MyDiary Desktop의 자체 개발 코드 및 오리지널 에셋은 **MIT License**를 따릅니다 ([LICENSE](file:///d:/development/mydiary-desktop/LICENSE)).

---

## 1. 프로젝트 총괄 및 기여자 (Contributors)

본 프로젝트는 인간 엔지니어의 비전과 리더십 아래, AI 에이전트를 동등한 파트너 엔지니어로 인정하고 협력하여 개발되었습니다.

| 이름 / 식별자 | 역할 | 소속 및 채널 | 기여 영역 |
|---|---|---|---|
| **성백진 (`Sung Baekjin`)** | 총괄 설계자 & 리드 엔지니어 (Lead Maintainer) | `sbjwin4271@gmail.com` | 프로젝트 기획, 핵심 아키텍처, 비즈니스 로직, 릴리즈 총괄 |
| **`zigman1234`** | 공동 개발자 (Collaborator) | GitHub (`@zigman1234`) | 저장소 협업, Git 업적 및 공동 커밋(Co-authored-by) 파트너 |
| **Google Antigravity Agent** | 공인 AI 엔지니어 (AI Contributor) | Google Gemini 3.8 / 2.5 Pro & Flash | 아키텍처 리팩토링, HWPX 서식 엔진, 에이전트 하네스 구축, 코드 감사 |
| **Anthropic Claude Code** | 공인 AI 엔지니어 (AI Contributor) | Anthropic Claude 3.5 / 3.7 Sonnet | 프런트엔드 UI 컴포넌트, 크로스플랫폼 동기화 로직 |
| **OpenAI Codex** | 공인 AI 엔지니어 (AI Contributor) | OpenAI | 초기 스크립트 작성 및 데이터 파싱 유틸리티 |

---

## 2. 앱에 번들된 에셋 및 라이브러리 (Bundled Assets & Dependencies)

| 에셋 / 라이브러리 | 용도 및 위치 | 제작자 / 프로젝트 | 라이선스 | 출처 |
|---|---|---|---|---|
| **Pretendard / Noto Sans** | 한글 및 라틴 전역 UI 본문 폰트 | 본고딕 / 프리텐다드 프로젝트 | SIL OFL 1.1 | <https://github.com/orioncactus/pretendard> |
| **Lucide Icons (`lucide-react`)** | 데스크톱 UI 툴바, 사이드바, 상태 아이콘 | Lucide Contributors | ISC | <https://github.com/lucide-icons/lucide> |
| **KS X 6101 OWPML 서식** | 국가 표준 한글 문서(HWPX) XML 규격 | 국가기술표준원 (KATS) | 공공 표준 규격 | KS X 6101 공공 표준 |
| **React 19 (`react`, `react-dom`)** | 프런트엔드 반응형 컴포넌트 엔진 | Meta Platforms, Inc. | MIT | <https://github.com/facebook/react> |
| **Electron (`electron`, `electron-builder`)** | 크로스플랫폼 데스크톱 런타임 및 패키징 | OpenJS Foundation / Electron Authors | MIT | <https://github.com/electron/electron> |
| **Vite (`vite`)** | 초고속 모듈 번들러 및 빌드 도구 | Evan You & Vite Contributors | MIT | <https://github.com/vitejs/vite> |
| **JSZip (`jszip`)** | HWPX 및 DOCX 패키징 압축/해제 | Stuart Knightley, David Duponchel | MIT | <https://github.com/Stuk/jszip> |
| **docx-preview (`docx-preview`)** | 워드 문서 인앱 렌더링 미리보기 | Dmitry Volkov | MIT | <https://github.com/VolodymyrBaydalka/docxjs> |
| **App Icon (`build/icon.*`)** | 데스크톱 앱 실행 아이콘 | 성백진 (`Sung Baekjin`) | MIT (오리지널 저작물) | 자체 디자인 |

---

## 3. 기여 원칙 및 에셋 추가 지침

1. 새로운 외부 에셋(폰트, 아이콘, 템플릿, 사운드 등)을 추가할 때는 반드시 Permissive한 오픈소스 라이선스(MIT, Apache-2.0, SIL OFL, ISC 등)여야 합니다.
2. 새 에셋이 추가되는 즉시 본 `ATTRIBUTION.md`에 출처와 라이선스를 동일한 커밋에 누락 없이 기록해야 합니다.
