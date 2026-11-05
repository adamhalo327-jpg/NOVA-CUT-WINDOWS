$ErrorActionPreference = 'Stop'
$ProjectZip = Join-Path $PSScriptRoot 'NOVA_CUT_5.2.1_PROJEKT.zip'
$ExpectedFiles = @(
  '.github/workflows/build-windows.yml',
  '.gitignore',
  'README_PL.txt',
  'app/index.html',
  'assets/novacut.ico',
  'main.js',
  'native-renderer.js',
  'package.json',
  'preload.js',
  'scripts/check-project.js'
)
$TempDir = $null
try {
  Write-Host ''
  Write-Host 'NOVA CUT 5.2.1 - automatyczna naprawa struktury repozytorium' -ForegroundColor Cyan
  Write-Host 'Nie zmieniamy folderu .git i nie wysylamy nic automatycznie.'
  if (-not (Test-Path -LiteralPath $ProjectZip -PathType Leaf)) {
    throw 'Brak pliku NOVA_CUT_5.2.1_PROJEKT.zip obok uruchomionego skryptu. Wypakuj CALY pakiet naprawczy.'
  }
  Add-Type -AssemblyName System.Windows.Forms
  $dlg = New-Object System.Windows.Forms.FolderBrowserDialog
  $dlg.Description = 'Wybierz folder NOVA-CUT-WINDOWS, ktory otwiera GitHub Desktop: Repository > Show in Explorer'
  $dlg.ShowNewFolderButton = $false
  $locations = @(
    (Join-Path $env:USERPROFILE 'Documents\GitHub\NOVA-CUT-WINDOWS'),
    (Join-Path $env:USERPROFILE 'OneDrive\Documents\GitHub\NOVA-CUT-WINDOWS')
  )
  foreach ($candidate in $locations) {
    if (Test-Path -LiteralPath $candidate -PathType Container) { $dlg.SelectedPath = $candidate; break }
  }
  if ($dlg.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) {
    Write-Host 'Przerwano na zyczenie uzytkownika.' -ForegroundColor Yellow
    exit 2
  }
  $Repo = $dlg.SelectedPath
  Write-Host ('Wybrano: ' + $Repo)
  $DotGit = Join-Path $Repo '.git'
  if (-not (Test-Path -LiteralPath $DotGit)) {
    throw 'Wybrany folder NIE jest lokalnym repozytorium Git (.git). Otworz go przez GitHub Desktop > Repository > Show in Explorer.'
  }
  $GitConfig = Join-Path $DotGit 'config'
  if (Test-Path -LiteralPath $GitConfig -PathType Leaf) {
    $configText = Get-Content -LiteralPath $GitConfig -Raw
    if ($configText -notmatch '(?i)adamhalo327-jpg/NOVA-CUT-WINDOWS(?:\.git)?') {
      throw 'Git w tym folderze nie wskazuje repozytorium adamhalo327-jpg/NOVA-CUT-WINDOWS. Nie kopiowano zadnych plikow.'
    }
  } else {
    throw 'Nie mozna potwierdzic .git/config repozytorium. Nie kopiowano plikow.'
  }

  $TempDir = Join-Path $env:TEMP ('nova-cut-setup-' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
  Expand-Archive -LiteralPath $ProjectZip -DestinationPath $TempDir -Force
  foreach ($Rel in $ExpectedFiles) {
    $Local = Join-Path $TempDir $Rel
    if (-not (Test-Path -LiteralPath $Local -PathType Leaf)) {
      throw ('W paczce projektu brakuje: ' + $Rel)
    }
  }
  $Backup = Join-Path $env:LOCALAPPDATA ('NOVA_CUT\Backup\' + (Get-Date -Format 'yyyyMMdd_HHmmss'))
  New-Item -ItemType Directory -Path $Backup -Force | Out-Null
  $count = 0
  foreach ($Rel in $ExpectedFiles) {
    $From = Join-Path $TempDir $Rel
    $To = Join-Path $Repo $Rel
    if (Test-Path -LiteralPath $To -PathType Leaf) {
      $BackupTarget = Join-Path $Backup $Rel
      New-Item -ItemType Directory -Path (Split-Path $BackupTarget -Parent) -Force | Out-Null
      Copy-Item -LiteralPath $To -Destination $BackupTarget -Force
    }
    New-Item -ItemType Directory -Path (Split-Path $To -Parent) -Force | Out-Null
    Copy-Item -LiteralPath $From -Destination $To -Force
    $SourceHash = (Get-FileHash -LiteralPath $From -Algorithm SHA256).Hash
    $TargetHash = (Get-FileHash -LiteralPath $To -Algorithm SHA256).Hash
    if ($SourceHash -ne $TargetHash) { throw ('Blad weryfikacji kopii: ' + $Rel) }
    Write-Host ('  [OK] ' + $Rel) -ForegroundColor Green
    $count++
  }
  Write-Host ''
  Write-Host ('SUKCES! Skopiowano i sprawdzono plikow: ' + $count) -ForegroundColor Green
  Write-Host ('Folder repozytorium: ' + $Repo)
  Write-Host ('Kopia zapasowa zastapionych plikow: ' + $Backup)
  Write-Host ''
  Write-Host 'TERAZ: otworz GitHub Desktop > Changes, Commit to main, a potem Push origin.' -ForegroundColor Cyan
  Start-Process explorer.exe -ArgumentList ('"' + $Repo + '"')
  exit 0
} catch {
  Write-Host ''
  Write-Host ('BLAD: ' + $_.Exception.Message) -ForegroundColor Red
  Write-Host 'Nie wykonuj Commit bez sprawdzenia, co poszlo nie tak.' -ForegroundColor Yellow
  exit 1
} finally {
  if ($TempDir -and (Test-Path -LiteralPath $TempDir)) {
    Remove-Item -LiteralPath $TempDir -Recurse -Force -ErrorAction SilentlyContinue
  }
}
