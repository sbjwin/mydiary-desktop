const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const readmePath = path.join(rootDir, 'README.md');
const helpModalPath = path.join(rootDir, 'src', 'components', 'HelpModal.jsx');
const headerPath = path.join(rootDir, 'src', 'components', 'Header.jsx');

if (!fs.existsSync(packageJsonPath)) {
  console.error('[sync-version] package.json을 찾을 수 없습니다.');
  process.exit(0);
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = pkg.version;

if (!currentVersion) {
  console.error('[sync-version] package.json에 version 필드가 없습니다.');
  process.exit(0);
}

// 1. README.md 동기화
if (fs.existsSync(readmePath)) {
  let readme = fs.readFileSync(readmePath, 'utf8');

  // # MyDiary Desktop (vX.Y.Z)
  readme = readme.replace(/(#\s*MyDiary\s*Desktop\s*\([^)]*v?)\d+\.\d+\.\d+(\))/gi, `$1${currentVersion}$2`);

  // - **버전**: `vX.Y.Z`
  readme = readme.replace(/(-\s*\*\*버전\*\*:\s*`?v?)\d+\.\d+\.\d+(`?)/gi, `$1${currentVersion}$2`);

  // ## 🌟 vX.Y.Z 주요 신규 기능 및 개선 사항
  readme = readme.replace(/(##\s*🌟?\s*v)\d+\.\d+\.\d+(\s*주요)/gi, `$1${currentVersion}$2`);

  fs.writeFileSync(readmePath, readme, 'utf8');
  console.log(`[sync-version] README.md 버전이 v${currentVersion}(으)로 동기화되었습니다.`);
}

// 2. src/components/HelpModal.jsx 동기화
if (fs.existsSync(helpModalPath)) {
  let modal = fs.readFileSync(helpModalPath, 'utf8');
  modal = modal.replace(/(Desktop\s+v)\d+\.\d+\.\d+/g, `$1${currentVersion}`);
  fs.writeFileSync(helpModalPath, modal, 'utf8');
  console.log(`[sync-version] HelpModal.jsx 버전이 Desktop v${currentVersion}(으)로 동기화되었습니다.`);
}

// 3. src/components/Header.jsx 동기화
if (fs.existsSync(headerPath)) {
  let header = fs.readFileSync(headerPath, 'utf8');
  header = header.replace(/(Desktop\s+v)\d+\.\d+\.\d+/g, `$1${currentVersion}`);
  fs.writeFileSync(headerPath, header, 'utf8');
  console.log(`[sync-version] Header.jsx 버전이 Desktop v${currentVersion}(으)로 동기화되었습니다.`);
}

