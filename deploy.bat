@echo off
chcp 65001 >nul
cd /d F:\MyTraeProjects\ElementalBond

echo ========================================
echo  Elemental Bond - 自动化构建 & 部署
echo ========================================
echo.

echo [1/3] 构建前端...
cd frontend
call npm install --silent
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 前端构建失败！请查看上方错误信息。
    pause
    exit /b 1
)
echo ✅ 前端构建成功
cd ..

echo.
echo [2/3] Git 提交...
git add -A
git status
git commit -m "fix: markdown rendering, gumroad payment flow, share URLs, OG images, remove Chinese text"
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Git commit 可能没有新内容（或者已经提交过）
)

echo.
echo [3/3] Git 推送...
git push
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Git 推送失败！请检查网络和远程仓库配置。
    pause
    exit /b 1
)
echo ✅ 推送成功

echo.
echo ========================================
echo  全部完成！Vercel 将自动部署。
echo ========================================
pause
