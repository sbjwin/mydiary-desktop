# AI 에이전트 행동 규칙: 공동개발 및 Mock 환경 보존 규격 (Collaboration & Mock Harness)

이 문서는 MyDiary Desktop 프로젝트에서 AI 에이전트가 외부 인증 키, 클라우드 연동, 데이터베이스 Seeder 관련 코드를 수정할 때 반드시 준수해야 하는 행동 규칙입니다.

---

## 1. 핵심 제약: Zero-Config Mock 폴백 유지 원칙

1. **외부 API 키 필수화 엄격 금지**:
   - `GOOGLE_CLIENT_ID`나 `GOOGLE_CLIENT_SECRET` 등 외부 클라우드 인증 키가 `.env`에 설정되어 있지 않더라도, 개발 모드(`isDevMode`) 또는 브라우저 환경에서는 **반드시 가상(Mock) 인증으로 자동 폴백**되어야 한다.
   - 키가 없다는 이유로 앱이 크래시되거나, 초기화 단계에서 에러를 던져 전체 화면 진입을 차단하는 코드를 작성해서는 안 된다.

2. **가상 구글 드라이브 스토리지 규격 준수**:
   - Mock 모드일 때 클라우드 백업 업로드/다운로드는 로컬 스토리지 키 `@mydiary:mock_cloud_storage`를 활용해야 한다.
   - 실제 네트워크 통신과 유사한 UX를 제공하기 위해 적절한 비동기 지연(`setTimeout(..., 400~600)`)을 포함해야 한다.

3. **원클릭 샘플 데이터 생성기 (Seeder) 무결성 유지**:
   - `GoogleDriveService.seedMockData()`는 신규 참여자가 즉시 기능을 시연할 수 있도록 항상 유효한 학생 데이터(최소 4명), 일지 기록(최소 4건), 주간 계획 및 가상 클라우드 백업을 일괄 주입할 수 있어야 한다.
   - Seeder 로직을 임의로 삭제하거나 로컬 DB 스키마와 불일치하게 변경해서는 안 된다.

---

## 2. 코드 수정 시 체크리스트

- [ ] `electron/main.js`의 `isMockAuthEnabled` 판별 및 `google-auth-login` Mock 반환 로직이 유지되고 있는가?
- [ ] `GoogleDriveService.js`의 `isMockMode()`, `downloadCloudBackup()`, `uploadCloudBackup()`의 Mock 분기가 보존되고 있는가?
- [ ] 웹 브라우저 단독 실행(`npm run dev`) 시 `window.electronAPI`가 없어도 안전하게 Mock 로그인 및 Blob 파일 저장이 동작하는가?
- [ ] UI 상에서 현재 Mock 모드임을 알리는 배지(`mock-badge`) 및 샘플 생성 버튼이 시각적으로 조화롭게 유지되는가?
