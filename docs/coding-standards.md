# MyDiary Desktop 코딩 및 엔지니어링 표준 (Coding Standards)

이 문서는 MyDiary Desktop 프로젝트에서 모든 개발자(인간 및 AI 에이전트)가 준수해야 하는 공통 코딩 및 보안 표준입니다.

---

## 1. 언어 및 타입 정책 (순수 JavaScript + @types)
- **순수 JS 원칙**: 본 프로젝트는 순수 JavaScript(React 19 JSX) 환경을 유지하며, 임의로 TypeScript(`.ts`/`.tsx`)로 전면 전환하지 않습니다.
- **타입 힌트 및 안정성**:
  - IDE 자동 완성 및 타입 힌트는 `devDependencies`의 `@types/*` 패키지와 루트의 `jsconfig.json`을 기준으로 활용합니다.
  - DB 트랜잭션, HWPX 문서 내보내기 등 정밀한 타입 검증이 필요한 핵심 모듈에 한하여 파일 상단 `// @ts-check` 및 JSDoc을 선택적으로 적용합니다.

---

## 2. React 19 & Vite 프런트엔드 표준
- **컴포넌트 분리**: 거대 컴포넌트(Fat Component)를 지양하고 모달, 에디터, 탭을 명확히 분리합니다.
- **모던 훅 활용**: `useState`, `useEffect`, `useMemo`, `useCallback`을 기반으로 불필요한 전체 리렌더링을 방지합니다.
- **디자인 토큰**: `src/theme.js` 및 바닐라 CSS 변수를 기반으로 일관된 색상/간격을 유지합니다.
- **단일 진실 공급원(SSOT)**: 시스템 브라우저 `alert()`, `confirm()`의 무단 사용을 엄격히 금지하고, 인앱 커스텀 모달 다이얼로그(`ConfirmModal.jsx`)를 사용합니다.

---

## 3. Electron 런타임 & IPC 보안 표준
- **Context Isolation 필수**: `contextIsolation: true`, `nodeIntegration: false` 원칙을 철저히 준수합니다.
- **Preload 화이트리스트 IPC**: Renderer 프로세스가 Node.js API(`fs`, `child_process` 등)에 직접 접근하지 못하게 차단하고, `electron/preload.js`의 명시적 화이트리스트 IPC 채널(`window.electronAPI.*`)만을 통해 통신합니다.
- **단일 인스턴스 락**: 중복 실행 방지를 위해 `app.requestSingleInstanceLock()`을 필수로 적용합니다.

---

## 4. 국가 표준 문서(HWPX / OWPML) 규격 보호
- **KS X 6101 표준 준수**: `HwpxExportService.js`의 XML 파싱 구조, 단락 속성(`secPr`, `colPr`), 표(Table) 셀 너비/테두리 레이아웃은 공공기관 및 학교 표준 규격을 준수하므로 임의로 훼손하지 않습니다.
- **XML Injection 방어**: 사용자 입력 텍스트(학생 이름, 일지 본문 등)는 XML 특수문자(`&`, `<`, `>`, `"`, `'`)를 철저히 이스케이프하여 전달합니다.
