const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const certPath = path.join(projectRoot, 'certs', 'mydiary-signer.pfx');
const certPassword = 'MyDiary2026!Secure';

console.log('========================================================');
console.log(' MyDiary Desktop - Windows 빌드 및 패키징 파이프라인');
console.log('========================================================\n');

// 1. Vite 프로덕션 빌드
console.log('[1/2] Vite 프로덕션 번들링 시작...');
execSync('npx vite build', { stdio: 'inherit', cwd: projectRoot });

// 2. 코드 서명 인증서 감지 및 환경변수 주입
console.log('\n[2/2] Electron-Builder Windows 패키징 시작...');
const env = { ...process.env };

if (fs.existsSync(certPath)) {
  console.log(`[서명 감지] 자체 서명 인증서 적용: ${certPath}`);
  env.CSC_LINK = certPath;
  env.CSC_KEY_PASSWORD = certPassword;
  env.WIN_CSC_LINK = certPath;
  env.WIN_CSC_KEY_PASSWORD = certPassword;
} else {
  console.log('[안내] certs/mydiary-signer.pfx를 찾을 수 없어 미서명 모드로 패키징합니다.');
  console.log('      (자체 서명을 적용하려면 "npm run cert:setup"을 먼저 실행하세요.)');
}

try {
  execSync('npx electron-builder --win --publish never', {
    stdio: 'inherit',
    cwd: projectRoot,
    env,
  });
  console.log('\n========================================================');
  console.log(' [성공] Windows 패키징이 성공적으로 완료되었습니다!');
  console.log(' 산출물: dist-electron/');
  console.log('========================================================');
} catch (err) {
  console.error('\n[오류] electron-builder 패키징 실패:', err.message);
  process.exit(1);
}
