# MyDiary Desktop 릴리즈 & 버전 관리 표준 규칙 (Release Governance)

이 문서는 MyDiary Desktop 프로젝트에서 공식 버전업(릴리즈 마일스톤) 시 반드시 수행해야 하는 일괄 적용 표준 절차를 정의합니다.

---

## 1. 버전 형식 및 관리 원칙
- **버전 표기**: 시맨틱 버저닝 `MAJOR.MINOR.PATCH` (예: `0.5.0`)
- **일상 개발 시**: 평소 기능 구현 및 버그 수정 중에는 버전을 임의로 올리지 않습니다.
- **공식 릴리즈 시**: 개발자의 명시적 릴리즈 요청(예: "v0.6으로 올려줘", "릴리즈 준비해줘")이 있을 때만 아래 **4대 일괄 동기화 절차**를 단일 트랜잭션으로 완수합니다.

---

## 2. 릴리즈 시 4대 일괄 동기화 프로토콜 (Release Checklist)

버전업 요청 시 에이전트와 기여자는 다음 4대 영역을 **누락 없이 일괄 수정 및 반영**해야 합니다:

### ① `package.json` 버전 동기화
- `"version": "x.y.z"` 항목을 지정된 새 버전으로 업데이트.

### ② `README.md` 문서 전면 동기화
- 문서 상단 버전 번호 업데이트 (`# MyDiary Desktop (vx.y.z)`)
- 해당 버전에 신규 추가되거나 개선된 핵심 기능 섹션 상세 기술
- 변경된 기술 스택, 실행/패키징 명령어, 개발자 정보 최신화

### ③ `HelpModal.jsx` 도움말 및 정보 동기화
- `about` 탭의 버전 뱃지 업데이트 (`<span className="about-badge">Desktop vx.y.z</span>`)
- 신규 기능이 추가된 화면의 경우 `screensGuideData` 가이드 설명 및 팁 항목 보강
- 자주 묻는 질문(FAQ)에 신규 기능 관련 Q&A 최신화

### ④ 빌드 무결성 검증 (`npm run build`)
- 동기화 완료 후 즉시 프로덕션 빌드를 실행하여 번들링 오류 및 문법 결함이 없음을 검증.

---

## 3. OS별 패키징 명령어 및 서명 거버넌스 (Smart App Control 방어)
- Windows: `npm run package:win` (.exe 설치 파일 및 포터블)
- macOS: `npm run package:mac` (.dmg)
- Linux: `npm run package:linux` (.AppImage / .deb)

### ⚠️ Windows 서명 및 스마트 앱 컨트롤(SAC) 방어 정책
1. **무서명 표준 패키징 원칙**: 상용 공인 인증 기관(DigiCert, Sectigo 등)의 유료 코드 서명 인증서가 도입되기 전까지, Windows 패키징은 **반드시 자체 서명 없는 순수 무서명 표준 빌드(`npm run package:win`)를 사용**합니다.
2. **자체 서명(Self-Signed) 금지**: 로컬 자체 서명 인증서(`dev-cert.pfx` 등)로 패키징할 경우, Windows 11의 최신 보안 시스템인 **스마트 앱 컨트롤(Smart App Control)** 이 이를 '신뢰할 수 없는 비공인 서명(UnknownError)'으로 간주하여 실행 버튼 자체를 제공하지 않고 영구 차단합니다.
3. **SmartScreen 안내 표준**: 무서명 바이너리는 Windows SmartScreen 파란색 보호 화면에서 사용자가 **`[추가 정보]` ➔ `[실행]`** 을 눌러 즉시 정상 설치 및 실행할 수 있으므로, 배포 및 가이드 문서에 해당 절차를 공식 표준으로 안내합니다.

---

## 4. 릴리즈 완료 보고 가이드
- 일괄 동기화 완료 후 보고 시 다음을 제공합니다:
  1. Git 태그 생성 명령어: `git tag -a vx.y.z -m "Release vx.y.z - [주요 변경 요약]"`
  2. Git 커밋 및 푸시 명령어: `git push origin vx.y.z`
  3. GitHub Release에 바로 복사해 넣을 수 있는 **Release Title**과 마크다운 **Release Notes**.
