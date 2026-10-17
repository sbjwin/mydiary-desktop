---
name: mydiary-desktop-build-release
description: MyDiary 데스크톱 버전 릴리즈 4대 일괄 동기화(package.json, README, HelpModal, 빌드검증) 및 3대 OS 패키징 가이드
---

# MyDiary Desktop 릴리즈 및 패키징 실행 스킬

## 1. 릴리즈 요청 시 일괄 수행 워크플로우
사용자가 신규 버전 릴리즈 또는 버전업을 요청하면, 에이전트는 다음 단계를 반드시 순서대로 일괄 완수합니다:

1. **`package.json`**:
   - `"version"`을 새 버전으로 동기화.
2. **`README.md`**:
   - 상단 버전 번호 업데이트
   - 이번 버전에 추가/개선된 핵심 기능들을 상세히 기술 (마크다운 포맷)
3. **`src/components/HelpModal.jsx`**:
   - 앱 소개(`about`)의 버전 뱃지(`Desktop vx.y.z`) 동기화
   - 화면별 가이드(`screensGuideData`)에 신규 기능/단축키/조작법 반영
   - FAQ 목록 최신화
4. **품질 검증**:
   - `npm run build`를 실행하여 번들링 오류(0 errors) 검증
5. **Git 릴리즈 배포 안내**:
   - Git 커밋/푸시 명령어 제공
   - Git Tag 생성 명령어(`git tag -a vx.y.z -m "..."`)
   - GitHub Releases용 **Release title** 및 **Release notes (마크다운)** 텍스트 제공

---

## 2. 3대 OS 데스크톱 패키징 명령어
- Windows: `npm run package:win` (x64 NSIS 설치 파일 및 포터블)
  - **스마트 앱 컨트롤(SAC) 방어 규칙**: Windows 11 Smart App Control 차단을 방지하기 위해 로컬 자체 서명을 적용하지 않고 순수 무서명 표준 패키징을 수행합니다. 사용자는 SmartScreen 창에서 `추가 정보` ➔ `실행`으로 설치합니다.
- macOS: `npm run package:mac` (dmg 이미지)
- Linux: `npm run package:linux` (AppImage / deb)
