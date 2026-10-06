/**
 * MyDiary Desktop 정기 코드 감사 자동화 스크립트 (Audit Harness)
 * 프로젝트 전반의 안티패턴, 코드 중복, 네이티브 팝업 잔존 여부, 버전 일치성 등을 정적 검사합니다.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

let issueCount = 0;
let warningCount = 0;

function logHeader(title) {
  console.log(`\n========================================`);
  console.log(`🔍 [검사항목] ${title}`);
  console.log(`========================================`);
}

function logPass(msg) {
  console.log(`  ✅ 통과: ${msg}`);
}

function logWarn(msg) {
  warningCount++;
  console.log(`  ⚠️ 경고: ${msg}`);
}

function logFail(msg) {
  issueCount++;
  console.log(`  ❌ 결함: ${msg}`);
}

// 재귀 파일 탐색 헬퍼
function getAllFiles(dir, exts = ['.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else if (exts.includes(path.extname(file))) {
      results.push(fullPath);
    }
  }
  return results;
}

const allSrcFiles = getAllFiles(srcDir);

// 1. Zero Native Dialogs 검사 (alert, confirm, prompt 직접 호출 차단)
logHeader('1. 네이티브 다이얼로그 전수 차단 검사 (Zero Native Dialogs)');
let nativeDialogIssues = 0;
for (const file of allSrcFiles) {
  // dialog.js 자체는 래퍼이므로 제외
  if (file.endsWith('dialog.js')) continue;

  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(rootDir, file);

  const alertMatch = content.match(/(?<![a-zA-Z0-9_.])alert\s*\(/g);
  const confirmMatch = content.match(/(?<![a-zA-Z0-9_.])confirm\s*\(/g);
  const promptMatch = content.match(/(?<![a-zA-Z0-9_.])prompt\s*\(/g);

  if (alertMatch || confirmMatch || promptMatch) {
    logFail(`${relPath} 파일에서 네이티브 alert/confirm/prompt 호출 감지됨 (전역 dialog.js 사용 필수)`);
    nativeDialogIssues++;
  }
}
if (nativeDialogIssues === 0) {
  logPass('모든 소스 파일에서 브라우저 네이티브 다이얼로그 호출 없음 (100% 인앱 다이얼로그 사용)');
}

// 2. 단일 진실 공급원(SSOT) 공통 유틸리티 모듈 검사
logHeader('2. 단일 진실 공급원(SSOT) 유틸리티 구조 검사');
const requiredUtils = [
  { file: 'src/utils/dateUtils.js', exports: ['getMondayOfWeek', 'getTodayDateString', 'formatDisplayTime'] },
  { file: 'src/utils/phoneUtils.js', exports: ['formatPhoneInfo'] },
  { file: 'src/utils/fileUtils.js', exports: ['saveOrDownloadFile', 'escapeXml', 'escapeHtml'] },
  { file: 'src/utils/dialog.js', exports: ['showToast', 'showConfirm', 'focusAppWindow'] },
];

for (const util of requiredUtils) {
  const fullPath = path.join(rootDir, util.file);
  if (!fs.existsSync(fullPath)) {
    logFail(`필수 공통 유틸 파일 누락: ${util.file}`);
  } else {
    const code = fs.readFileSync(fullPath, 'utf8');
    const missingExports = util.exports.filter((exp) => !code.includes(`export const ${exp}`) && !code.includes(`export function ${exp}`));
    if (missingExports.length > 0) {
      logFail(`${util.file}에서 필수 내보내기 함수 누락: ${missingExports.join(', ')}`);
    } else {
      logPass(`${util.file} 및 핵심 함수 정상 배치됨`);
    }
  }
}

// 3. 서비스 계층 중복 구현 검사 (Hwpx/Docx에서 formatPhoneInfo 자체 정의 방지)
logHeader('3. 서비스 계층 중복 로직 방어 검사');
const hwpxPath = path.join(srcDir, 'services', 'HwpxExportService.js');
if (fs.existsSync(hwpxPath)) {
  const hwpxCode = fs.readFileSync(hwpxPath, 'utf8');
  if (hwpxCode.includes('phoneInfo.split(')) {
    logFail('HwpxExportService.js에 formatPhoneInfo 자체 로직이 재도입됨 (phoneUtils.js import 사용 필수)');
  } else {
    logPass('HwpxExportService.js 공통 phoneUtils 활용 준수');
  }
}

// 4. 버전 동기화 일치성 검사
logHeader('4. 전체 프로젝트 버전 일관성 검사');
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const currentVersion = pkg.version;
console.log(`  ℹ️ 기준 버전 (package.json): v${currentVersion}`);

const filesToCheckVersion = [
  { file: 'README.md', regex: new RegExp(`v${currentVersion}`) },
  { file: 'src/components/Header.jsx', regex: new RegExp(`v${currentVersion}`) },
  { file: 'src/components/HelpModal.jsx', regex: new RegExp(`v${currentVersion}`) },
  { file: 'src/components/BackupSettingTab.jsx', regex: new RegExp(`v${currentVersion}`) },
  { file: 'src/services/GoogleDriveService.js', regex: new RegExp(`version:\\s*['"]${currentVersion}['"]`) },
];

for (const check of filesToCheckVersion) {
  const fullPath = path.join(rootDir, check.file);
  if (fs.existsSync(fullPath)) {
    const code = fs.readFileSync(fullPath, 'utf8');
    if (check.regex.test(code)) {
      logPass(`${check.file} 버전 동기화 일치 (v${currentVersion})`);
    } else {
      logFail(`${check.file} 버전 불일치 감지 (npm run sync-version 필요)`);
    }
  }
}

// 5. 사장 파일(Dead Files) 검사 (미사용 파일)
logHeader('5. 사장 코드(Dead Code) 잔존 여부 검사');
const deadStorageService = path.join(srcDir, 'services', 'StorageService.js');
if (fs.existsSync(deadStorageService)) {
  logFail('삭제 대상 사장 파일(StorageService.js)이 다시 생성됨');
} else {
  logPass('레거시 사장 파일(StorageService.js) 없음');
}

// 종합 결론
console.log(`\n========================================`);
console.log(`📊 [감사 결과 요약] 결함: ${issueCount}건 | 경고: ${warningCount}건`);
console.log(`========================================`);

if (issueCount > 0) {
  console.log(`❌ 정기 코드 감사 실패! 발견된 ${issueCount}건의 결함을 해결하십시오.\n`);
  process.exit(1);
} else {
  console.log(`✨ 정기 코드 감사 통과! 프로젝트 아키텍처 및 무결성이 최상 상태로 유지되고 있습니다.\n`);
  process.exit(0);
}
