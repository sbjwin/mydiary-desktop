/**
 * @file verify-package-env.cjs
 * @description MyDiary Desktop 패키징 배포 전 .env 무결성 사전 검증 하네스
 * 템플릿 플레이스홀더(your_google_...)가 번들에 포함되어 배포되는 실수를 원천 방어합니다.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env');

console.log('🔍 [Pre-package Check] 패키징 배포 환경 변수(.env) 무결성 검증을 시작합니다...');

if (!fs.existsSync(envPath)) {
  console.error('\n❌ [배포 차단] 프로젝트 루트에 .env 파일이 존재하지 않습니다!');
  console.error('👉 실제 Google OAuth 클라이언트 키가 설정된 .env 파일이 필요합니다.');
  process.exit(1);
}

const envConfig = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
const clientId = (envConfig.GOOGLE_CLIENT_ID || '').trim();
const clientSecret = (envConfig.GOOGLE_CLIENT_SECRET || '').trim();

if (!clientId || !clientSecret) {
  console.error('\n❌ [배포 차단] .env 파일에 GOOGLE_CLIENT_ID 또는 GOOGLE_CLIENT_SECRET이 누락되었습니다!');
  process.exit(1);
}

if (clientId.includes('your_google') || clientId.includes('example') || clientSecret.includes('your_google')) {
  console.error('\n❌ [배포 차단] .env에 예시 템플릿(your_google_...) 값이 감지되었습니다!');
  console.error(`👉 감지된 Client ID: ${clientId}`);
  console.error('👉 Google Cloud Console에서 실제 발급받은 데스크톱 클라이언트 키를 .env에 입력한 후 다시 패키징하세요.\n');
  process.exit(1);
}

console.log(`✅ [검증 통과] 유효한 Google OAuth 클라이언트 ID가 확인되었습니다. (${clientId.slice(0, 15)}...)\n`);

