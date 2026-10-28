# Watch the latest Vercel deployment and print errors if it fails.
# Usage: .\scripts\watch-deploy.ps1

Write-Host "Fetching latest deployment..." -ForegroundColor Cyan

# Get the most recent deployment URL
$deployments = vercel list --json 2>$null | ConvertFrom-Json
if (-not $deployments) {
    # Fallback: plain text parse
    $raw = vercel list 2>&1 | Select-Object -First 5
    Write-Host $raw
    exit 1
}

$latest = $deployments[0]
$url    = $latest.url
$uid    = $latest.uid

Write-Host "Watching: https://$url  (uid: $uid)" -ForegroundColor Yellow

$dots = 0
while ($true) {
    Start-Sleep -Seconds 5

    $info = vercel inspect $uid --json 2>$null | ConvertFrom-Json
    $state = $info.readyState   # QUEUED | BUILDING | READY | ERROR | CANCELED

    Write-Host -NoNewline "."
    $dots++
    if ($dots % 12 -eq 0) { Write-Host " [$state]" }

    if ($state -eq "READY") {
        Write-Host "`n`n✅  Deployment succeeded: https://$url" -ForegroundColor Green
        break
    }

    if ($state -eq "ERROR" -or $state -eq "CANCELED") {
        Write-Host "`n`n❌  Deployment $state. Fetching build logs...`n" -ForegroundColor Red
        vercel logs $uid --output raw 2>&1 | Select-String -Pattern "error|Error|failed|FAILED|TS\d{4}" | ForEach-Object { Write-Host $_.Line -ForegroundColor Red }
        Write-Host "`nFull logs: vercel logs $uid" -ForegroundColor DarkGray
        exit 1
    }
}
