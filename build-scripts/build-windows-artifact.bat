@echo off
setlocal EnableDelayedExpansion

:: Define the Docker image version here
set "IMAGE_VERSION=2.0.0"

REM Check if script is running as Administrator
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo This script must be run as Administrator. Please restart in Admin mode.
    pause
    exit /b 1
)

REM Build the Docker image.
echo Building Docker image...
docker build -t velocityaiworkbench:%IMAGE_VERSION% ..\backend
if %ERRORLEVEL% NEQ 0 (
    echo Docker build failed. Exiting script.
    exit /b 1
)

REM Save the Docker image locally
echo Saving Docker image...
docker save -o velocityaiworkbench.tar velocityaiworkbench:%IMAGE_VERSION%
if %ERRORLEVEL% NEQ 0 (
    echo Docker save failed. Exiting script.
    exit /b 1
)

REM Move the Docker image to the images folder at the root
echo Moving Docker image to images folder...
move velocityaiworkbench.tar ..\image\
if %ERRORLEVEL% NEQ 0 (
    echo Move failed. Exiting script.
    exit /b 1
)

REM Temporarily jump to the root folder to run npm commands
pushd ..

REM Install npm dependencies
echo Running npm install in root directory...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo npm install failed. Exiting script.
    popd
    exit /b 1
)

REM Run the npm build command
echo Running npm run build in root directory...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo npm build failed. Exiting script.
    popd
    exit /b 1
)

REM Return to the original folder (build-scripts)
popd

echo Build and packaging process completed successfully.