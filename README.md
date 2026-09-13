# MyDiary Desktop (v0.1.0)

MyDiary 데스크톱 - 학생 일지 및 성장 기록 관리 크로스 플랫폼 데스크톱 애플리케이션입니다.  
기존 스마트폰용 MyDiary와 완전히 독립적으로 유지되며, Windows, macOS, Linux 3대 운영체제를 지원합니다.

- **버전**: 0.1.0 (Initial Preview)
- **개발자**: Sung Baekjin (성백진) <sbjwin4271@gmail.com>
- **기술 스택**: React 19, Vite, Electron, JSZip, Lucide-React

---

## 🚀 개발 환경 실행

```bash
# 1. 패키지 설치
npm install

# 2. 웹 브라우저 모드로 실행
npm run dev

# 3. Electron 데스크톱 앱으로 실행
npm run dev:electron
```

---

## 📦 OS별 데스크톱 앱 패키징 (.exe / .dmg / .AppImage)

```bash
# Windows (.exe 설치파일 및 포터블)
npm run package:win

# macOS (.dmg)
npm run package:mac

# Linux (.AppImage 및 .deb)
npm run package:linux
```

---

## 📁 주요 기능
- **PC 특화 2열 마스터-디테일 인터페이스**: 좌측 학생 및 일지 탐색, 우측 넓은 일지 에디터
- **한글 문서(HWPX) 표준 내보내기**: OWPML 1.0 표준 HWPX 파일 즉시 생성 및 PC 파일 탐색기 저장
- **로컬 데이터 영속화**: 브라우저 및 데스크톱 로컬 스토리지 자동 저장
