# 1. certs 디렉터리 확인/생성
if (!(Test-Path -Path "certs")) {
    New-Item -ItemType Directory -Force -Path "certs" | Out-Null
}

# 2. 5년 유효기간의 자체 서명 코드 사이닝 인증서 생성
Write-Host "Creating self-signed code signing certificate..." -ForegroundColor Cyan
$cert = New-SelfSignedCertificate -Type CodeSigning `
    -Subject "CN=Sung Baekjin, O=MyDiary" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -NotAfter (Get-Date).AddYears(5)

Write-Host "Certificate Thumbprint: $($cert.Thumbprint)" -ForegroundColor Green

# 3. PFX 파일로 내보내기 (비밀번호: mydiary1234)
$pfxPass = ConvertTo-SecureString -String "mydiary1234" -Force -AsPlainText
$pfxPath = "certs\dev-cert.pfx"
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $pfxPass | Out-Null
Write-Host "Exported PFX to $pfxPath" -ForegroundColor Green

# 4. CER 공개키 내보내기
$cerPath = "certs\dev-cert.cer"
Export-Certificate -Cert $cert -FilePath $cerPath | Out-Null
Write-Host "Exported CER to $cerPath" -ForegroundColor Green

# 5. 현재 사용자의 '신뢰할 수 있는 루트 인증 기관(Root)' 및 '신뢰할 수 있는 게시자(TrustedPublisher)'에 등록
Write-Host "Registering to CurrentUser\Root..." -ForegroundColor Cyan
Import-Certificate -FilePath $cerPath -CertStoreLocation "Cert:\CurrentUser\Root" | Out-Null

Write-Host "Registering to CurrentUser\TrustedPublisher..." -ForegroundColor Cyan
Import-Certificate -FilePath $cerPath -CertStoreLocation "Cert:\CurrentUser\TrustedPublisher" | Out-Null

Write-Host "Code signing certificate successfully installed!" -ForegroundColor Green
