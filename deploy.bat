@echo off
setlocal enabledelayedexpansion

set "MESSAGE=%~1"
if "%MESSAGE%"=="" set "MESSAGE=Update blog"

cd /d "%~dp0"

set "GIT=git"
where git >nul 2>nul
if errorlevel 1 (
  if exist "C:\Program Files\Git\cmd\git.exe" (
    set "GIT=C:\Program Files\Git\cmd\git.exe"
  ) else if exist "C:\Program Files\Git\bin\git.exe" (
    set "GIT=C:\Program Files\Git\bin\git.exe"
  ) else (
    echo Git was not found. Install Git for Windows first.
    pause
    exit /b 1
  )
)

echo.
echo [1/7] Checking local repository...
if not exist ".git" (
  "%GIT%" init || goto :fail
  "%GIT%" branch -M main || goto :fail
)

echo.
echo [2/7] Checking GitHub remote...
"%GIT%" remote get-url origin >nul 2>nul
if errorlevel 1 (
  "%GIT%" remote add origin https://github.com/mortalkit1101-ui/mortalkit1101-ui.github.io.git || goto :fail
)

if not exist "CNAME" (
  >"CNAME" echo 041101.xyz
)

echo.
echo [3/7] Scanning public files for private content...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$paths=@('.nojekyll','CNAME','README.md','*.html','*.css','*.js','assets','previews'); $blocked=@('.env','.env.local','.env.production','id_rsa','id_ed25519','credentials.json','secrets.json'); $exts=@('.html','.css','.js','.json','.md','.txt','.yml','.yaml','.xml'); $patterns=@(@{Name='email address';Pattern='[A-Z0-9._%%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}'},@{Name='GitHub token';Pattern='gh[pousr]_[A-Za-z0-9_]{20,}'},@{Name='API key, password, secret, or token';Pattern='(?i)(api[_-]?key|secret|password|token)\s*[:=]\s*\S{8,}'},@{Name='private key';Pattern='-----BEGIN (RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----'}); $files=@(); foreach($p in $paths){ if($p -like '*`**'){ $files += Get-ChildItem -Path $p -File -ErrorAction SilentlyContinue } elseif(Test-Path -LiteralPath $p -PathType Container){ $files += Get-ChildItem -LiteralPath $p -Recurse -File -ErrorAction SilentlyContinue } elseif(Test-Path -LiteralPath $p -PathType Leaf){ $files += Get-Item -LiteralPath $p } }; $hits=@(); foreach($f in $files){ if($blocked -contains $f.Name){ $hits += ($f.FullName + ': blocked private filename'); continue }; if($exts -notcontains $f.Extension.ToLowerInvariant()){ continue }; $content=Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue; foreach($p in $patterns){ if($content -match $p.Pattern){ $hits += ($f.FullName + ': contains ' + $p.Name) } } }; if($hits.Count -gt 0){ Write-Host 'Push stopped because public files may contain private content:' -ForegroundColor Red; $hits | ForEach-Object { Write-Host (' - ' + $_) -ForegroundColor Red }; Write-Host 'Remove that content or keep it out of the public site, then run this script again.' -ForegroundColor Yellow; exit 1 }"
if errorlevel 1 goto :fail

echo.
echo [4/7] Staging public blog files only...
rem deploy.bat is intentionally local-only and is not included below.
"%GIT%" add -- .nojekyll CNAME README.md *.html *.css *.js assets previews || goto :fail

"%GIT%" diff --cached --quiet
if not errorlevel 1 (
  echo No public blog changes to commit.
  echo.
  echo [5/7] Syncing latest remote changes...
  "%GIT%" pull --rebase origin main || goto :fail
  echo.
  echo Nothing new to push.
  goto :success
)

echo.
echo [5/7] Committing local changes...
"%GIT%" commit -m "%MESSAGE%" || goto :fail

echo.
echo [6/7] Syncing latest remote changes...
"%GIT%" pull --rebase origin main || goto :fail

echo.
echo [7/7] Pushing to GitHub...
"%GIT%" push -u origin main || goto :fail

goto :success

:success
echo.
echo Blog deploy flow finished.
pause
exit /b 0

:fail
echo.
echo Deploy flow stopped. Check the message above, then run deploy.bat again.
pause
exit /b 1
