@echo off
if "%~1"=="" (
    echo Usage: release.bat ^<version^>
    echo Example: release.bat 1.0.12
    exit /b 1
)
set VERSION=%~1

cd /d "%~dp0frontend"
echo Building app...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed.
    exit /b 1
)
echo Copying to wwwroot...
if exist "%~dp0backend\src\SpotReservation.Api\wwwroot" rmdir /s /q "%~dp0backend\src\SpotReservation.Api\wwwroot"
mkdir "%~dp0backend\src\SpotReservation.Api\wwwroot"
xcopy ".\dist" "%~dp0backend\src\SpotReservation.Api\wwwroot" /s /e /i /q

cd /d "%~dp0"
dotnet publish ./backend/src/SpotReservation.Api --os linux --arch x64 /p:PublishProfile=DefaultContainer
docker tag michfiala/tenspot-application:latest michfiala/tenspot-application:%VERSION%
docker push michfiala/tenspot-application:%VERSION%
docker push michfiala/tenspot-application:latest

echo Done. Published as michfiala/tenspot-application:%VERSION%
