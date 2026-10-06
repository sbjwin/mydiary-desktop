$certPath = Resolve-Path "certs\dev-cert.pfx"
$setupPath = Resolve-Path "dist-electron\MyDiary Setup 0.5.0.exe"

$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certPath, "mydiary1234", [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable)

Write-Host "Signing $setupPath with certificate: $($cert.Subject)..." -ForegroundColor Cyan
$result = Set-AuthenticodeSignature -FilePath $setupPath -Certificate $cert -TimestampServer "http://timestamp.digicert.com"

Write-Host "Result Status: $($result.Status)" -ForegroundColor Green
Write-Host "Path: $($result.Path)" -ForegroundColor Green

# 파일 차단(Zone.Identifier)도 함께 해제
Unblock-File -Path $setupPath
Write-Host "Unblock-File completed." -ForegroundColor Green
