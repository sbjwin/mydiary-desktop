# 🎯 MyDiary Desktop 기능 격차 및 작업 우선순위 (Gaps & Parity Matrix)

> **문서 목적**: 스마트폰 앱(`mydiary`)과의 기능 패리티 및 데스크톱 v1.0.0 프로덕션 안착을 위한 세부 기능 격차(Gaps)와 작업 우선순위를 정량적으로 추적하는 단일 진실 공급원(SSOT)입니다.  
> **최종 갱신일**: 2026-10-21  
> **총괄 관리자**: 성백진 (`Sung Baekjin` / `sbjwin4271@gmail.com`)  
> **규칙**: 작업 착수 시 본 문서의 랭킹(G1, G2...)을 최우선으로 참고하며, 기능 완료 시 상태(Status)를 갱신합니다.

---

## 1. 정량적 기능 스코어카드 (Summary Scorecard)

| 영역 (Area) | 완료 (Done) | 진행/부분 (Partial) | 미구현 (Missing) | 패리티 달성률 | 핵심 현황 |
|---|---:|---:|---:|---:|---|
| **1. 모바일 앱 (`mydiary`) 패리티** | 12 | 2 | 0 | **95.2%** | 학생 주소록, 수강 차수, 일지 작성, 주간 시간표 1:1 호환 완료 |
| **2. 국가 표준 HWPX / 서식 엔진** | 4 | 2 | 0 | **85.7%** | KS X 6101 OWPML 표 생성 완료, 커스텀 서식 템플릿 다변화 필요 |
| **3. 와이드 데스크톱 UI/UX** | 9 | 2 | 1 | **88.0%** | 3단 마스터-디테일, 다크/라이트 테마 완료, 성장 차트 대시보드 필요 |
| **4. 3대 OS 패키징 & 배포** | 3 | 1 | 1 | **75.0%** | Windows NSIS/포터블 완료, macOS DMG / Linux AppImage CI 검증 대기 |
| **5. 하네스 & 품질 게이트** | 6 | 0 | 0 | **100.0%** | `node:test` 내장 테스트, 9대 정기 코드 감사, 100% 한국어 커밋 하네스 완비 |

---

## 2. 작업 우선순위 랭킹 (Ranked Gaps)

에이전트가 새로운 작업을 선택할 때 위에서부터 아래로 순차적으로 착수합니다:

### [G1] HWPX 복수 표 서식 템플릿 프리셋 다변화
- **우선순위**: `P1 (Critical)` | **상태**: `Partial`
- **목표**: 교육청, 복지관, 개인 교습소 등 기관별 요구 서식에 맞춘 2~3종의 HWPX 출력 레이아웃 프리셋(표준형, 서술형, 결재란 포함형) 선택 지원.
- **관련 파일**: [src/services/HwpxExportService.js](file:///d:/development/mydiary-desktop/src/services/HwpxExportService.js), [src/components/ExportModal.jsx](file:///d:/development/mydiary-desktop/src/components/ExportModal.jsx)
- **작업 내용**:
  1. `HwpxExportService.js` 내에 결재란(담당/원장 서명란)이 포함된 `section.xml` OWPML 템플릿 함수 추가.
  2. 내보내기 모달에서 템플릿 프리셋 선택 라디오 버튼 제공.

### [G2] 학생별 성장 추이 및 수업 통계 와이드 대시보드
- **우선순위**: `P1 (Critical)` | **상태**: `Partial`
- **목표**: 누적된 수업 일지 및 학생별 출석/진도 데이터를 한눈에 조망할 수 있는 와이드 화면 특화 통계 뷰 제공.
- **관련 파일**: `src/components/StatisticsTab.jsx` (신설 예정), [src/components/StudentDetail.jsx](file:///d:/development/mydiary-desktop/src/components/StudentDetail.jsx)
- **작업 내용**:
  1. 학생별 월간 수업 횟수, 수업 시간 합계, 주요 교재 이수율 집계 로직.
  2. 순수 SVG 기반의 가벼운 막대/라인 차트 시각화 (외부 무거운 차트 라이브러리 추가 지양).

### [G3] macOS DMG 및 Linux AppImage CI 빌드 파이프라인 검증
- **우선순위**: `P2 (High)` | **상태**: `Partial`
- **목표**: Windows 외에 macOS(`.dmg`) 및 Linux(`.AppImage`, `.deb`) 바이너리의 크로스플랫폼 빌드 무결성 자동화.
- **관련 파일**: `.github/workflows/build.yml` (신설), [package.json](file:///d:/development/mydiary-desktop/package.json)
- **작업 내용**:
  1. GitHub Actions 워크플로우 매트릭스(`windows-latest`, `macos-latest`, `ubuntu-latest`) 구성.
  2. `npm run package:mac` 및 `npm run package:linux` 산출물 아티팩트 업로드 검증.

### [G4] 주간 시간표 인쇄용 그리드 레이아웃 고도화
- **우선순위**: `P2 (High)` | **상태**: `Done` (v0.5.1 보강 완료)
- **목표**: A4 가로 인쇄 시 요일별/시간대별 칸이 용지에 딱 맞게 떨어지는 인쇄 전용 CSS 및 HTML 렌더링.
- **관련 파일**: [src/services/PrintService.js](file:///d:/development/mydiary-desktop/src/services/PrintService.js)

### [G5] 일지 및 학생 검색 필터링 복합 쿼리 고도화
- **우선순위**: `P3 (Medium)` | **상태**: `Partial`
- **목표**: 학생 이름 외에 교재명, 수업 내용 키워드, 특정 기간 범위(From~To)를 동시에 만족하는 다중 조건 필터링.
- **관련 파일**: [src/components/StudentDetail.jsx](file:///d:/development/mydiary-desktop/src/components/StudentDetail.jsx), [src/components/DailyDiary.jsx](file:///d:/development/mydiary-desktop/src/components/DailyDiary.jsx)

---

## 3. 모바일 앱 (`mydiary`) 기능 대조표 (Parity Checklist)

| 모바일 앱 기능 | 데스크톱 구현 상태 | 매핑 컴포넌트 / 서비스 | 비고 |
|---|:---:|---|---|
| 학생 등록/수정/삭제 | ✅ 100% | `StudentList.jsx`, `Database.js` | Cascade Delete 보장 |
| 수강 차수(휴회/재수강) 관리 | ✅ 100% | `StudentDetail.jsx`, `Database.js` | terms 배열 정규화 |
| 일별 수업 일지 작성/수정 | ✅ 100% | `DailyDiary.jsx`, `Database.js` | 자동 임시저장 지원 |
| 주간 시간표 계획 수립 | ✅ 100% | `WeeklyScheduler.jsx`, `Database.js` | 드래그/클릭 시간표 |
| Google Drive 백업/복원 | ✅ 100% | `GoogleDriveService.js`, `BackupSettingTab.jsx` | Mock 클라우드 완비 |
| A4 용지 인쇄 | ✅ 100% | `PrintService.js` | Electron 내장 인쇄 |
| HWPX (한글 문서) 내보내기 | ✅ 90% | `HwpxExportService.js` | 국가 표준 OWPML XML |
| DOCX (워드 문서) 내보내기 | ✅ 90% | `DocxExportService.js` | Word OpenXML 규격 |
| 다크 모드 / 테마 전환 | ✅ 100% | `theme.js`, `App.jsx` | CSS 커스텀 속성 기반 |

---

## 4. 격차 해소 시 지침 (Closing a Gap)

1. 특정 Gap(예: G1, G2) 작업을 완료한 경우, 해당 항목의 상태를 `Partial` $\rightarrow$ `Done`으로 갱신합니다.
2. [ROADMAP.md](file:///d:/development/mydiary-desktop/ROADMAP.md)의 "차원별 준비도(%)"를 상향 조정합니다.
3. [log/devlog.md](file:///d:/development/mydiary-desktop/log/devlog.md)에 해소된 Gap ID와 작업 결과를 기록합니다.
