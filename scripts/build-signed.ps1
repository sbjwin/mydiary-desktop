# MyDiary Desktop - Windows 서명 패키징 스크립트
# 작성자: Sung Baekjin <sbjwin4271@gmail.com>

$ErrorActionPreference = "Stop"

$certPath = "certs\dev-cert.pfx"

# 1. 인증서 파일 존재 여부 확인 및 미존재 시 자동 생성
if (!(Test-Path -Path $certPath)) {
    Write-Host "[MyDiary] 자체 서명 인증서가 없습니다. scripts/create-cert.ps1을 실행하여 생성합니다..." -ForegroundColor Yellow
    & ".\scripts\create-cert.ps1"
    if (!(Test-Path -Path $certPath)) {
        Write-Error "[MyDiary] 인증서 생성에 실패했습니다. 빌드를 중단합니다."
        exit 1
    }
}

Write-Host "[MyDiary] Windows 서명 빌드를 시작합니다..." -ForegroundColor Cyan

# 2. electron-builder 표준 서명 환경변수 설정
$env:CSC_LINK = $certPath
$env:CSC_KEY_PASSWORD = "mydiary1234"

try {
    # 3. Windows 패키징 실행
    npm run package:win
    Write-Host "`n[MyDiary] 서명된 Windows 패키징이 성공적으로 완료되었습니다!" -ForegroundColor Green
}
finally {
    # 4. 프로세스 종료 시 환경변수 안전 초기화
    $env:CSC_LINK = $null
    $env:CSC_KEY_PASSWORD = $null
}
