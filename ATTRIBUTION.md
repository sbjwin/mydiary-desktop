# 귀속 및 기여자 정보 (Attribution)

MyDiary Desktop 프로젝트에 포함된 모든 코드, 번들 에셋, 폰트, 아이콘, 문서 서식의 저작권자와 라이선스, 그리고 프로젝트에 기여한 인간 개발자 및 공인 AI 에이전트 목록입니다.

MyDiary Desktop의 자체 개발 코드 및 오리지널 에셋은 **MIT License**를 따릅니다 ([LICENSE](file:///d:/development/mydiary-desktop/LICENSE)).

---

## 1. 프로젝트 총괄 및 메인테이너 (Maintainers)

| 이름 / 식별자 | 역할 | 소속 및 채널 | 책임 영역 |
|---|---|---|---|
| **성백진 (`Sung Baekjin`)** | 총괄 설계자 & 리드 엔지니어 (Lead Maintainer) | `sbjwin4271@gmail.com` | 프로젝트 기획, 핵심 아키텍처, 비즈니스 로직, 릴리즈 총괄 |

---

## 2. 오픈소스 기여자 (Open Source Contributors)

본 프로젝트는 전 세계 모든 오픈소스 개발자와 기여자의 참여를 환영합니다. 코드, 문서, 버그 리포트, 번역 등 프로젝트에 기여하신 분은 누구나 본 명단에 자유롭게 등재될 수 있습니다.

| GitHub 계정 / 이름 | 기여 유형 | 기여 내용 |
|---|---|---|
| `@zigman1234` | 기여자 (Contributor) | 초기 저장소 협업 및 Git 하네스 테스트 참여 |
| *(새 기여자 등록 대기 중)* | 기여자 (Contributor) | PR 승인 및 머지 시 본 표에 추가됩니다 |

> **💡 기여자 명단 추가 가이드**:
> 프로젝트에 기여(PR)할 때, 본 파일(`ATTRIBUTION.md`)의 위 표에 자신의 GitHub 아이디와 기여 내용을 한 줄 추가하여 함께 커밋해 주시면 공식 기여자로 등재됩니다.

---

## 3. 공인 AI 에이전트 기여자 (AI Contributors)

본 프로젝트는 인간 엔지니어의 비전과 리더십 아래, AI 에이전트를 동등한 파트너 엔지니어로 인정하고 협력하여 개발되었습니다.

| AI 모델 / 도구 | 역할 | 개발사 | 기여 영역 |
|---|---|---|---|
| **Google Antigravity Agent** | 공인 AI 엔지니어 (AI Contributor) | Google (Gemini Flash/Pro) | 아키텍처 리팩토링, HWPX 서식 엔진, 에이전트 하네스 구축, 코드 감사 |
| **Anthropic Claude Code** | 공인 AI 엔지니어 (AI Contributor) | Anthropic (Claude 3.5/3.7) | 프런트엔드 UI 컴포넌트, 크로스플랫폼 동기화 로직 |
| **OpenAI Codex** | 공인 AI 엔지니어 (AI Contributor) | OpenAI | 초기 스크립트 작성 및 데이터 파싱 유틸리티 |

---

## 4. 앱에 번들된 에셋 및 라이브러리 (Bundled Assets & Dependencies)

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

## 5. 기여 원칙 및 에셋 추가 지침

1. 새로운 외부 에셋(폰트, 아이콘, 템플릿, 사운드 등)을 추가할 때는 반드시 Permissive한 오픈소스 라이선스(MIT, Apache-2.0, SIL OFL, ISC 등)여야 합니다.
2. 새 에셋이 추가되는 즉시 본 `ATTRIBUTION.md`에 출처와 라이선스를 동일한 커밋에 누락 없이 기록해야 합니다.
