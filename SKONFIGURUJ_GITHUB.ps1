$ErrorActionPreference = 'Stop'
try {
  Add-Type -AssemblyName System.Windows.Forms
  $picker = New-Object System.Windows.Forms.FolderBrowserDialog
  $picker.Description = 'Wybierz folder NOVA-CUT-WINDOWS z GitHub Desktop > Repository > Show in Explorer'
  $picker.ShowNewFolderButton = $false
  if ($picker.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) { throw 'Nie wybrano folderu.' }
  $repo = $picker.SelectedPath
  if (-not (Test-Path -LiteralPath (Join-Path $repo '.git'))) {throw 'Wybrany folder nie jest repozytorium Git. Otworz go przez GitHub Desktop.'}
  $configPath = Join-Path $repo '.git/config'
  if (!(Test-Path -LiteralPath $configPath)) {throw 'Brak pliku .git/config - otworz folder przez GitHub Desktop.'}
  $gitConfig = Get-Content -LiteralPath $configPath -Raw
  if ($gitConfig -notmatch '(?i)adamhalo327-jpg/NOVA-CUT-WINDOWS(?:\.git)?') {
    throw 'To nie jest klon adamhalo327-jpg/NOVA-CUT-WINDOWS. Nie wykonano kopiowania.'
  }
  $zipSource = Join-Path $PSScriptRoot 'NOVA_CUT_5.2.2_SOURCE.zip'
  $workflowSource = Join-Path $PSScriptRoot 'build-windows.yml'
  if (!(Test-Path $zipSource) -or !(Test-Path $workflowSource)) {throw 'Wypakuj wszystkie pliki z paczki naprawczej.'}
  $zipTarget = Join-Path $repo 'NOVA_CUT_5.2.2_SOURCE.zip'
  $workflowTarget = Join-Path $repo '.github/workflows/build-windows.yml'
  $folder = Split-Path $workflowTarget -Parent
  New-Item -ItemType Directory -Force -Path $folder | Out-Null
  # backup workflow outside Git repository to avoid accidental commit of backups
  if (Test-Path $workflowTarget) {
    $backupFolder = Join-Path $env:LOCALAPPDATA 'NOVA_CUT/Backup'
    New-Item -ItemType Directory -Force -Path $backupFolder | Out-Null
    Copy-Item -LiteralPath $workflowTarget -Destination (Join-Path $backupFolder ('build-windows-' + (Get-Date -Format 'yyyyMMddHHmmss') + '.yml'))
  }
  Copy-Item -LiteralPath $zipSource -Destination $zipTarget -Force
  Copy-Item -LiteralPath $workflowSource -Destination $workflowTarget -Force
  if ((Get-FileHash $zipSource).Hash -ne (Get-FileHash $zipTarget).Hash) {throw 'Blad kopiowania ZIP.'}
  if ((Get-FileHash $workflowSource).Hash -ne (Get-FileHash $workflowTarget).Hash) {throw 'Blad kopiowania workflow.'}
  Write-Host ''
  Write-Host 'SUKCES! Wystarcza teraz TYLKO DWA PLIKI:' -ForegroundColor Green
  Write-Host ('  '+$zipTarget) -ForegroundColor Green
  Write-Host ('  '+$workflowTarget) -ForegroundColor Green
  Write-Host ''
  Write-Host 'Otworz GitHub Desktop > Changes > Commit to main > Push origin.' -ForegroundColor Cyan
  Write-Host 'W Github Actions skompiluje sie kompletny projekt z archiwum ZIP.' -ForegroundColor Cyan
} catch {
  Write-Host ('BLAD: ' + $_.Exception.Message) -ForegroundColor Red
  exit 1
}
