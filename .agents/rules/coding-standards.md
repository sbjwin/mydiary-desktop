# MyDiary Desktop 코딩 표준

1. **React 19 & Vite**: 모던 훅(useState, useEffect, useMemo) 기반 컴포넌트 개발. 불필요한 리렌더링 방지.
2. **Electron 보안 표준**: Context Isolation 활성화, Preload 스크립트를 통한 IPC 브릿지 필수. `remote` 모듈 사용 금지.
3. **바닐라 CSS**: `src/styles/` 디자인 토큰(CSS 변수) 활용.
4. **한글 OWPML 규격 보호**: `HwpxExportService.js`의 XML 구조와 표 서식 레이아웃 임의 변경 금지.
5. **언어 및 타입 정책 (순수 JS + @types)**:
   - 본 프로젝트는 순수 JavaScript(React JSX) 환경을 유지하며, 임의로 TypeScript(`.ts`/`.tsx`)로 전면 전환하지 않는다.
   - IDE 자동 완성 및 타입 힌트는 `devDependencies`의 `@types/*` 패키지와 루트의 `jsconfig.json`을 기준으로 활용한다.
   - DB 처리나 문서 내보내기 등 정밀한 타입 검증이 필요한 핵심 모듈에 한하여 파일 상단 `// @ts-check` 및 JSDoc을 선택적으로 적용한다.
