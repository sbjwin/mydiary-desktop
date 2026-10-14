const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('========================================================');
console.log(' MyDiary Desktop - 자체 서명 코드 서명 인증서 설정');
console.log('========================================================\n');

const projectRoot = path.resolve(__dirname, '..');
const certDir = path.join(projectRoot, 'certs');
const pfxPath = path.join(certDir, 'mydiary-signer.pfx');
const cerPath = path.join(certDir, 'mydiary-signer.cer');
const certPassword = 'MyDiary2026!Secure';

// 1. certs 디렉터리 확인
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// 2. 인증서 생성 및 등록용 임시 PowerShell 스크립트 작성
const tempPs1Path = path.join(__dirname, '_run_cert_setup.ps1');
const bom = '\ufeff';

const psScriptContent = `${bom}
$ErrorActionPreference = 'Stop'

$PfxPath = '${pfxPath.replace(/\\/g, '\\\\')}'
$CerPath = '${cerPath.replace(/\\/g, '\\\\')}'
$PasswordStr = '${certPassword}'

# 1. 인증서 존재 확인 및 발급
if (-not (Test-Path $PfxPath) -or -not (Test-Path $CerPath)) {
    Write-Host "[1/2] 새 코드 서명 인증서 발급 중..." -ForegroundColor Cyan
    $cert = New-SelfSignedCertificate \`
        -Type CodeSigningCert \`
        -Subject "CN=Sung Baekjin, O=MyDiary Desktop, E=sbjwin4271@gmail.com" \`
        -KeyUsage DigitalSignature \`
        -FriendlyName "MyDiary Desktop Code Signing (Sung Baekjin)" \`
        -NotAfter (Get-Date).AddYears(5) \`
        -CertStoreLocation "Cert:\\CurrentUser\\My"

    $secPass = ConvertTo-SecureString -String $PasswordStr -Force -AsPlainText
    Export-PfxCertificate -Cert $cert -FilePath $PfxPath -Password $secPass | Out-Null
    Export-Certificate -Cert $cert -FilePath $CerPath | Out-Null
    Write-Host "  - PFX/CER 생성 완료 (지문: $($cert.Thumbprint))" -ForegroundColor Green
} else {
    Write-Host "[1/2] 코드 서명 인증서 파일 확인 완료" -ForegroundColor Green
    Write-Host "  - PFX: $PfxPath" -ForegroundColor DarkGray
    Write-Host "  - CER: $CerPath" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "[2/2] Windows 시스템 신뢰 인증서 저장소 등록..." -ForegroundColor Cyan

# 관리자 권한 확인
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($isAdmin) {
    try {
        # certutil을 통한 자동 등록 (프롬프트 없이 신뢰 저장소 등록)
        certutil -addstore -f "Root" $CerPath | Out-Null
        Write-Host "  - [성공] 로컬 머신 신뢰할 수 있는 루트 인증 기관(Root) 등록 완료" -ForegroundColor Green

        certutil -addstore -f "TrustedPublisher" $CerPath | Out-Null
        Write-Host "  - [성공] 로컬 머신 신뢰할 수 있는 게시자(TrustedPublisher) 등록 완료" -ForegroundColor Green

        Write-Host ""
        Write-Host "========================================================" -ForegroundColor Green
        Write-Host " [완료] Windows 시스템이 Sung Baekjin 인증서를 신뢰하도록 설정되었습니다!" -ForegroundColor Green
        Write-Host " 앞으로 빌드되는 모든 MyDiary 앱은 SmartScreen/SAC 차단 없이 실행됩니다." -ForegroundColor Green
        Write-Host "========================================================" -ForegroundColor Green
    } catch {
        Write-Host "  - [오류] 인증서 저장소 등록 실패: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  - [안내] 현재 일반 권한으로 실행되었습니다." -ForegroundColor Yellow
    Write-Host "  - Windows 11 스마트 앱 컨트롤(SAC) 차단을 시스템 수준에서 완벽하게 통과하려면" -ForegroundColor Yellow
    Write-Host "    '관리자 권한'으로 1회 등록이 필요합니다." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  👉 해결 방법: scripts\\setup-code-signing.bat 파일을 우클릭하여" -ForegroundColor Cyan
    Write-Host "     [관리자 권한으로 실행]을 클릭해 주세요." -ForegroundColor Cyan
}
`;

fs.writeFileSync(tempPs1Path, psScriptContent, 'utf8');

try {
  execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${tempPs1Path}"`, {
    stdio: 'inherit',
  });
} catch (err) {
  console.error('[오류] 스크립트 실행 실패:', err.message);
} finally {
  if (fs.existsSync(tempPs1Path)) {
    fs.unlinkSync(tempPs1Path);
  }
}
