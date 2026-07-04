@echo off
setlocal

set DEPLOY_DIR=..\hesabyaar_backend_deploy

:: گرفتن تاریخ با فرمت yyyy-MM-dd_HHmmss
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set pattern=%%i

echo Start building docker image...
docker build -t asansorland_backend:1.0 .
echo Start exporting docker image...
docker save -o asansorland_backend_image_v_1_0_%pattern%.tar asansorland_backend
echo Deploying finished...
echo Start sendig to Asansorland Host...
scp -P 3031 asansorland_backend_image_v_1_0_%pattern%.tar asansorland@185.213.164.207:/data/images
move asansorland_backend_image_v_1_0_%pattern%.tar C:\Users\reza\Documents\GitHub\HesabYar_Last_Backup\asansorland_Production
endlocal
