---
name: mydiary-desktop-code-audit
description: MyDiary 데스크톱 정기 코드 감사, 안티패턴 방어 및 아키텍처 무결성 검증 하네스(Audit Harness)
---

# MyDiary Desktop 정기 코드 감사 하네스 (Audit Harness)

이 스킬은 MyDiary Desktop 프로젝트에서 정기적으로 코드 중복, 스타일 구조, 네이밍/스키마 일관성, 소프트웨어 디자인 패턴을 감사하고 아키텍처 건전성을 보장하기 위한 **실행형 감사 하네스**입니다.

---

## 1. 감사 트리거 및 주기 (When to Audit)
다음 상황에서 이 감사 하네스를 반드시 호출하여 실행합니다:
1. **정기 검사**: 주요 기능 스프린트 종료 후 또는 개발자의 감사 요청 시
2. **릴리즈 직전**: 공식 버전업(`vX.Y.Z`) 및 패키징 이전 무결성 검증
3. **대규모 리팩토링 직후**: 모듈 이동, 서비스 구조 개편, 신규 라이브러리 도입 후
4. **회귀 버그 의심 시**: 원인 미상의 포커스 유실, 스토리지 용량 초과 경고, 번들 크기 급증 시

---

## 2. 5대 핵심 감사 프로토콜 체크리스트 (5-Point Audit Protocol)

### ① Zero Native Dialogs (인앱 다이얼로그 100% 준수)
* **목적**: Chromium 렌더러 창의 키보드 입력 포커스 잠김 결함 영구 방어
* **점검 대상**: `alert()`, `confirm()`, `prompt()` 네이티브 함수 호출이 소스 코드(`src/`) 내에 1건도 존재하지 않는지 검사
* **표준 지침**: 모든 알림과 사용자 확인은 `src/utils/dialog.js`의 `showToast()`와 `showConfirm()`을 통해서만 실행할 것

### ② 단일 진실 공급원 (Single Source of Truth, SSOT) 유틸리티 검사
* **목적**: 기능 중복 구현 및 파편화 방지, AI 에이전트의 환각 차단
* **점검 모듈**:
  * `src/utils/dateUtils.js`: 날짜 계산, 오프셋, 디지털 시간 정규화(`formatDisplayTime`)
  * `src/utils/phoneUtils.js`: 연락처 정규화(`formatPhoneInfo`)
  * `src/utils/fileUtils.js`: 파일 다운로드/저장(`saveOrDownloadFile`), XML/HTML 이스케이프
* **점검 내용**: 컴포넌트나 서비스(`Hwpx`, `Docx`, `Print`)에서 자체적으로 정규식이나 중복 다운로드 로직을 작성하지 않고 공통 유틸을 참조하는지 검사

### ③ 사장 코드 및 미연결 UI (Dead Code & Dead State) 점검
* **목적**: 불필요한 번들 낭비 방지 및 고스트 파일 제거
* **점검 내용**:
  * 프로젝트 어디에서도 import되지 않는 파일(`StorageService.js` 등)의 잔존 여부
  * 컴포넌트(`SettingsModal` 등)가 마운트되어 있으나 사용자 진입점(버튼, 단축키)이 누락되어 접근 불가능한 상태가 없는지 검사

### ④ 전체 6대 핵심 파일 버전 동기화 일관성 검사
* **점검 대상**:
  * `package.json`
  * `README.md`
  * `src/components/Header.jsx`
  * `src/components/HelpModal.jsx`
  * `src/components/SettingsModal.jsx`
  * `src/components/BackupSettingTab.jsx`
  * `src/services/GoogleDriveService.js`
* **표준 지침**: `package.json`의 버전과 모든 파일의 표기 버전이 100% 일치해야 함 (`npm run sync-version` 활용)

### ⑤ 프로덕션 빌드 무결성 검증 (Vite Bundle Health)
* **점검 내용**: `npm run build` 실행 시 번들링 오류(0 errors) 및 청크 크기 추이 점검

---

## 3. 원클릭 자동화 검사 도구 실행 가이드
본 프로젝트에는 자동화된 정적 분석 하네스 스크립트가 내장되어 있습니다. 감사 실행 시 아래 명령어를 즉시 수행합니다:

```bash
# 1. 정적 코드 감사 자동화 스크립트 실행
cmd /c npm run audit

# 2. 버전 일치성 자동 동기화 검증
cmd /c npm run sync-version

# 3. Vite 프로덕션 빌드 무결성 검증
cmd /c npm run build
```

---

## 4. 감사 결과 리포트 작성 규정
* 감사를 완료한 후 발견된 주요 사항과 개선 조치 내역은 프로젝트 루트의 [`PROJECT_AUDIT_REPORT.md`](file:///d:/development/mydiary-desktop/PROJECT_AUDIT_REPORT.md) 문서에 누적 기록합니다.
* `PROJECT_AUDIT_REPORT.md`는 `.gitignore`에 등록되어 로컬 작업 나침반으로 안전하게 보존됩니다.
