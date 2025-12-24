@echo off
setlocal

set DEPLOY_DIR=..\hesabyaar_backend_deploy

:: گرفتن تاریخ با فرمت yyyy-MM-dd_HHmmss
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HHmmss"') do set pattern=%%i

:: تغییر نام پوشه dist و انتقالش
move .\dist dist_%pattern%
move dist_%pattern% ..

echo Start deploying...

call npm install
call npm run build

:: پاک کردن پوشه مقصد و ساخت مجددش
rmdir /s /q %DEPLOY_DIR%
mkdir %DEPLOY_DIR%

echo Start copying...

xcopy /E /I /Y dist %DEPLOY_DIR%\
copy package.json %DEPLOY_DIR%\
copy package-lock.json %DEPLOY_DIR%\

if exist .env (
  copy .env %DEPLOY_DIR%\
)

:: فشرده‌سازی با powershell
echo Compressing deploy...
powershell -NoProfile -Command "Compress-Archive -Path '%DEPLOY_DIR%\*' -DestinationPath '%DEPLOY_DIR%_%pattern%.zip'"

echo Deploying finished...
echo "Start sendig to Hesabyar Host..."


endlocal
