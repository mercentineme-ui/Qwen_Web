@echo off
rem ============================================================
rem PORTFOLIO_E4 — FULL PRODUCTION SNAPSHOT  (Windows)
rem One-command Git snapshot: commit + branch + tag + push.
rem Run from the project root:  portfolio_e4_snapshot.bat
rem ============================================================
setlocal enabledelayedexpansion

set "REMOTE_NAME=origin"
set "REMOTE_URL=https://github.com/mercentineme-ui/Qwen_Web.git"
set "SNAPSHOT=portfolio_E4"
set "COMMIT_MSG=PORTFOLIO_E4 — FULL PRODUCTION SNAPSHOT"

echo ==^> PORTFOLIO_E4 snapshot

rem 1. Ensure a git repo exists.
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo ==^> No git repo found — initializing.
  git init -b master
)

for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "BASE_BRANCH=%%b"
echo ==^> Base branch: %BASE_BRANCH%

rem 2. Stage the complete working tree.
git add -A
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "%COMMIT_MSG%"
) else (
  echo ==^> No pending changes — working tree already committed.
)
for /f "delims=" %%c in ('git rev-parse HEAD') do set "SNAPSHOT_COMMIT=%%c"
echo ==^> Snapshot commit: %SNAPSHOT_COMMIT%

rem 3. Create / update snapshot branch (old tip preserved in reflog).
git show-ref --verify --quiet refs/heads/%SNAPSHOT%
if errorlevel 1 (
  git branch %SNAPSHOT% %SNAPSHOT_COMMIT%
  echo ==^> Created branch %SNAPSHOT%.
) else (
  git branch -f %SNAPSHOT% %SNAPSHOT_COMMIT%
  echo ==^> Branch %SNAPSHOT% moved to snapshot commit.
)

rem 4. Create / update snapshot tag.
git rev-parse -q --verify refs/tags/%SNAPSHOT% >nul 2>&1
if errorlevel 1 (
  git tag -a %SNAPSHOT% -m "%COMMIT_MSG%" %SNAPSHOT_COMMIT%
  echo ==^> Created tag %SNAPSHOT%.
) else (
  git tag -f -a %SNAPSHOT% -m "%COMMIT_MSG%" %SNAPSHOT_COMMIT%
  echo ==^> Tag %SNAPSHOT% moved to snapshot commit.
)

rem 5. Ensure remote exists.
git remote get-url %REMOTE_NAME% >nul 2>&1
if errorlevel 1 (
  echo ==^> Adding remote %REMOTE_NAME%.
  git remote add %REMOTE_NAME% %REMOTE_URL%
)

rem 6. Push branch + tag.
echo ==^> Pushing branch + tag...
git push -u %REMOTE_NAME% %SNAPSHOT%
git push %REMOTE_NAME% %SNAPSHOT%

echo.
echo ==^> SNAPSHOT COMPLETE
echo     commit : %SNAPSHOT_COMMIT%
echo     branch : %SNAPSHOT%
echo     tag    : %SNAPSHOT%
echo ==^> Recover later with: git checkout %SNAPSHOT%
endlocal
