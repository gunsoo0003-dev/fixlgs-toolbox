# 009 완료 검수 실행

프로젝트 폴더에서 다음 PowerShell 한 줄을 실행한다.

```powershell
$desktop="$env:USERPROFILE\Desktop"; npm run test:toolbox:009-final *>&1 | Tee-Object -FilePath "$desktop\009_통합검수결과.txt"; $code=$LASTEXITCODE; if (Test-Path ".\test-results\toolbox-validation-summary.txt") { Copy-Item ".\test-results\toolbox-validation-summary.txt" "$desktop\009_검수요약.txt" -Force }; if (Test-Path ".\test-results\toolbox-validation-summary.json") { Copy-Item ".\test-results\toolbox-validation-summary.json" "$desktop\009_검수요약.json" -Force }; if (Test-Path ".\test-results\tool-009-validation-master.txt") { Copy-Item ".\test-results\tool-009-validation-master.txt" "$desktop\009_최종통합요약.txt" -Force }; if (Test-Path ".\test-results\tool-009-validation-master.json") { Copy-Item ".\test-results\tool-009-validation-master.json" "$desktop\009_최종통합요약.json" -Force }; if ($code -eq 0) { Write-Host "`n009 통합검수 통과: 종료 코드 0" } else { Write-Host "`n009 통합검수 실패 또는 오류: 종료 코드 $code" }
```

실패 또는 미확인이 하나라도 있으면 완료 처리하지 않는다.
