# MyDiary Desktop 로드맵 (Roadmap)

**Stage: v0.5.1 (Beta)** · next: v1.0.0 (Production Stable) · 잔여 공수 추정치: ~40–60 에이전트-시간 (Agent Wall-Clock Hours)

> **최종 갱신일:** 2026-10-19  
> **총괄 관리자:** 성백진 (`Sung Baekjin` / `sbjwin4271@gmail.com`)  
> **기준 환경:** Electron 34, React 19, Vite 6, Node.js 20+

MyDiary Desktop은 스마트폰 앱(`mydiary`)의 검증된 일지 관리 철학을 데스크톱 와이드 화면과 국가 표준 한글 문서(HWPX) 환경으로 완벽하게 확장하는 크로스플랫폼 프로젝트입니다.

---

## 1. 핵심 지표 요약 (Headline Numbers)

| 지표 항목 | 달성도 | 상태 및 비고 |
|---|---:|---|
| **기능 완성도 (Feature Breadth)** | **~94%** | 학생 관리, 일지 작성/조회, 주간계획표, HWPX/DOCX 내보내기, A4 인쇄, Mock 동기화 |
| **실무 현장 투입 준비도 (Ready for Production)** | **~90%** | 교육 현장 및 교사/강사 실무 기준 |
| **데이터 무결성 & 모바일 호환** | **100%** | 모바일 백업 JSON 1:1 완벽 호환, Cascade Delete 보장 |
| **Zero-Config 협업 Mock 환경** | **100%** | GCP API 키 없이 원클릭 Seeder로 즉시 UI/UX 테스트 가능 |
| **Windows 패키징 & SAC 안정성** | **100%** | 무서명 인스톨러 표준으로 Smart App Control 영구 차단 결함 완벽 방어 |
| **잔여 에이전트 공수 (to v1.0.0)** | **~40–60 h** | macOS/Linux CI 패키징 매트릭스 고도화 및 고급 통계 차트 확장 |

---

## 2. 차원별 완성도 매트릭스 (Readiness by Dimension)

| 차원 (Dimension) | 준비도 (%) | 잔여 공수 | 관련 가이드 및 상태 |
|---|---:|---:|---|
| **1. 데이터 무결성 & 스토리지** | **100%** | 0 h | [database-integrity.md](file:///d:/development/mydiary-desktop/docs/database-integrity.md) · 모바일 JSON 1:1 상호 호환 완료 |
| **2. Zero-Config Mock & 협업** | **100%** | 0 h | [COLLABORATION_AND_MOCK_GUIDE.md](file:///d:/development/mydiary-desktop/docs/COLLABORATION_AND_MOCK_GUIDE.md) · 모의 클라우드 스토리지 완성 |
| **3. 와이드 데스크톱 UI/UX** | **95%** | 5–10 h | [ui-design.md](file:///d:/development/mydiary-desktop/docs/ui-design.md) · 3단 마스터-디테일 완성, 고해상도 차트 뷰 추가 예정 |
| **4. 국가 표준 HWPX / 서식 엔진** | **92%** | 10–15 h | `HwpxExportService.js` · KS X 6101 OWPML 표 서식 완비, 커스텀 서식 템플릿 다변화 |
| **5. 3대 OS 바이너리 패키징** | **90%** | 10–15 h | [release-versioning.md](file:///d:/development/mydiary-desktop/docs/release-versioning.md) · Win 완성, Mac(.dmg)/Linux(.AppImage) CI 검증 |
| **6. 에이전트 하네스 & 코드 감사** | **100%** | 0 h | [AGENTS.md](file:///d:/development/mydiary-desktop/AGENTS.md) · GitHub 4대 업적 연계 하네스 및 9대 무결성 감사 완비 |

---

## 3. 현재 집중 과제 (Current Focus)

에이전트가 새 작업을 선택할 때 우선적으로 고려해야 할 영역:

1. **macOS DMG 및 Linux AppImage 배포 파이프라인 검증**:
   - `package.json`의 `package:mac`, `package:linux` 패키징 빌드 프로파일 무결성 확인 및 GitHub Actions 워크플로우 최적화.
2. **HWPX 커스텀 표 서식 프리셋 확장**:
   - 교육청 및 복지관 등 기관별 양식 요구에 맞춘 복수 HWPX 레이아웃 템플릿 선택 기능.
3. **학생별 성장 추이 시각화 통계**:
   - 누적된 수업 일지와 관찰 기록을 시각적으로 조망할 수 있는 와이드 대시보드 차트 컴포넌트 고도화.

---

## 4. 마일스톤 이력 (Milestone History)

- **v0.1.0 ~ v0.3.0**: Electron + React 19 기본 골격 구축, 모바일 JSON 백업 복원 호환성 확보.
- **v0.4.0**: 와이드 데스크톱 UI 개편, Zero-Config Mock 구글 드라이브 스토리지 및 Seeder 신설, Windows SmartScreen 무서명 표준 배포 체계 수립.
- **v0.5.0**: HWPX 표준 서식 엔진 안정화, GitHub 4대 업적 연계 Git 하네스 도입, 범용 도구 중립적 에이전트 거버넌스(Collaborative Harness) 확립.
- **v0.5.1 (현재)**: 클라우드 백업/복원 독립 로딩 분리 및 UI 안정화, 데스크톱 단일 인스턴스 락 및 창 상태 기억, Vite 번들 청크 최적화.
- **v1.0.0 (Next Target)**: 3대 OS 통합 배포 완료 및 공식 프로덕션 릴리즈.
