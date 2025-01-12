@ECHO OFF

SET currentPath=%~dp0
SET skipDownload=false
SET firstArg=%~1

SET APP_TSX_FILENAME=src\pages\_app.tsx
SET DOCUMENT_TSX_FILENAME=src\pages\_document.tsx
SET INDEX_TSX_FILENAME=src\pages\index.tsx
SET RUN_BAT_FILENAME=run.bat
SET PROJECT_SRC_DIRECTORY=src
SET PROJECT_BUILD_DIRECTORY=dist
SET PACKAGE_JSON_FILE=package.json
SET TSCONFIG_JSON_FILE=tsconfig.json
SET PROJECT_BUILD_OUTPUT=dist
SET NODEZIP_FILE_NAME=nodejs.zip
SET URL_NODE_BINARIES="https://nodejs.org/dist/v21.3.0/node-v21.3.0-win-x64.zip"
SET ZIP_EXTRACTION_FOLDER=nodejs
SET FILE_LIST_STRING=npm.ps1 ^
nodejs ^
package.json ^
node_modules ^
package-lock.json ^
tsc.ps1 ^
node-v21.3.0-win-x64 ^
nodejs.zip ^
npx.ps1 ^
npm.bat ^
tsc.bat ^
npx.bat ^
src ^
app ^
node.bat ^
tsconfig.json ^
update-scripts.ps1 ^
updatePackageJson.ps1 ^
updateTsConfigJson.ps1 ^
dist ^
.next ^
next-env.d.ts ^
run.bat

GOTO :MAIN

:WriteLog
    SETLOCAL ENABLEDELAYEDEXPANSION
        SET message=%~1
        SET color=%~2

        IF NOT DEFINED color SET color=DarkCyan
        
        POWERSHELL write-host -foregroundcolor %color% %message%
    ENDLOCAL
EXIT /B 0

:ParseArgs
    SETLOCAL ENABLEDELAYEDEXPANSION
        IF "!firstArg!"=="" SET "skipDownloadLocal=false"

        IF /I "!firstArg!"=="--skipDownload" SET "skipDownloadLocal=true"
    ENDLOCAL & SET "skipDownload=%skipDownloadLocal%"
EXIT /B 0

:ClearAllFiles
    SETLOCAL ENABLEDELAYEDEXPANSION
        SET fileListString=!FILE_LIST_STRING!
        FOR %%F IN (%fileListString%) DO (
            SET "fullPath=!currentPath!%%~F"
            REM If skipDownload is true and the file is the one to be ignored, skip it
            IF "!skipDownload!"=="true" (
                IF /I "%%F"=="!ZIP_EXTRACTION_FOLDER!" (
                    CALL :WriteLog "Skipped file !fullPath! because of the --skipDownload switch" "Yellow"
                ) ELSE (
                    CALL :DeleteFileOrDirectory "!fullPath!"
                )
            ) ELSE (
                CALL :DeleteFileOrDirectory "!fullPath!"
            )
        )

    ENDLOCAL
EXIT /B 0

:DeleteFileOrDirectory
    SETLOCAL ENABLEDELAYEDEXPANSION
        IF EXIST "%~1" (
            IF EXIST "%~1\*" (
                RMDIR /q /s "%~1" >NUL 2>&1
                CALL :WriteLog "Deleted directory %~1" "Green"
            ) ELSE (
                DEL /q "%~1" >NUL 2>&1
                CALL :WriteLog "Deleted file %~1" "Green"
            )
        )
    ENDLOCAL
EXIT /B 0

:DownloadNodeJSBinaries
    SETLOCAL ENABLEDELAYEDEXPANSION
        SET "nodeBinaries=!URL_NODE_BINARIES!"
        SET "zipFilename=!NODEZIP_FILE_NAME!"
        IF "!skipDownload!"=="true" (
            CALL :WriteLog "Skipped process because of the --skipDownload switch" "Yellow"
        ) ELSE (
            POWERSHELL -Command "Invoke-WebRequest %nodeBinaries% -OutFile %zipFilename%"
        )
    ENDLOCAL
EXIT /B 0

:MoveExtractedFilesUp
    SETLOCAL ENABLEDELAYEDEXPANSION
        IF "!skipDownload!"=="true" (
            CALL :WriteLog "Skipped process because of the --skipDownload switch" "Yellow"
            GOTO :NoSubfolder
        )

        SET "extractionFolder=%ZIP_EXTRACTION_FOLDER%"
        SET "zipFilename=%NODEZIP_FILE_NAME%"

        POWERSHELL -Command "Expand-Archive -Path %zipFilename% -DestinationPath %extractionFolder% -Force"
        DEL /f /q "!zipFilename!"
        
        REM Find the first subfolder in the destination folder
        FOR /f "delims=" %%I IN ('dir /b /ad "!extractionFolder!"') DO (
            SET "subfolder=%%I"
            GOTO :FoundSubfolder
        )
        GOTO :NoSubfolder

        :FoundSubfolder
        REM Move contents of subfolder up one level
        SET "subfolderPath=!extractionFolder!\!subfolder!"
        IF EXIST "!subfolderPath!\" (
            XCOPY /y "!subfolderPath!\*" "!extractionFolder!" /E /I >nul
            RMDIR /s /q "!subfolderPath!"
        )

        :NoSubfolder
    ENDLOCAL
EXIT /B 0

:CreateNPMFile
    SETLOCAL ENABLEDELAYEDEXPANSION
        SET outputFilename="npm.bat"

        (
            ECHO @echo off
            ECHO SET NODEJS_PATH=nodejs
            ECHO %%NODEJS_PATH%%\npm.cmd %%^*
        ) >> %outputFilename%
    ENDLOCAL
EXIT /B 0

:CreateNodeFile
    SETLOCAL ENABLEDELAYEDEXPANSION
        SET outputFilename="node.bat"

        (
            ECHO @echo off
            ECHO SET NODEJS_PATH=nodejs
            ECHO %%NODEJS_PATH%%\node.exe %%^*
        ) >> %outputFilename%
    ENDLOCAL
EXIT /B 0

:CreateTSCFile
    SETLOCAL ENABLEDELAYEDEXPANSION
        SET outputFilename="tsc.bat"

        (
            ECHO @echo off
            ECHO SET NODEJS_PATH=node_modules\.bin
            ECHO %%NODEJS_PATH%%\tsc.cmd %%^*
        ) >> %outputFilename%
    ENDLOCAL
EXIT /B 0

:CreateNextFile
    SETLOCAL ENABLEDELAYEDEXPANSION
        SET outputFilenameNextFile="next.bat"

        (
            ECHO @echo off
            ECHO SET NODEJS_PATH=node_modules\.bin
            ECHO %%NODEJS_PATH%%\next.cmd %%^*
        ) >> %outputFilenameNextFile%
    ENDLOCAL
EXIT /B 0

:CreateNPXFile
    SETLOCAL ENABLEDELAYEDEXPANSION
        SET outputFilename="npx.bat"

        (
            ECHO @echo off
            ECHO SET NODEJS_PATH=nodejs
            ECHO %%NODEJS_PATH%%\npx.cmd %%^*
        ) >> %outputFilename%
    ENDLOCAL
EXIT /B 0

:ManagePackageJsonScript
    SETLOCAL ENABLEDELAYEDEXPANSION
        SET outputFilenamePackageJson="updatePackageJson.ps1"

        (
            ECHO $jsonContent = Get-Content -Raw -Path .\!PACKAGE_JSON_FILE! -ErrorAction SilentlyContinue ^| ConvertFrom-Json

            ECHO if ^($null -eq $jsonContent^) {
            ECHO     $jsonContent = [PSCustomObject]@{
            ECHO        "scripts" = @{}
            ECHO     }
            ECHO }

            ECHO elseif ^($null -eq $jsonContent.scripts^) {
            ECHO     $jsonContent ^| Add-Member -MemberType NoteProperty -Name scripts -Value @{}
            ECHO }

            ECHO $jsonContent.scripts = @{
            ECHO     ^"dev^" ^= ^"next dev^"
            ECHO     ^"build^" ^= ^"next build^"
            ECHO     ^"start^" ^= ^"next start^"
            ECHO     ^"lint^" ^= ^"next lint^"
            ECHO }
            ECHO $jsonContent ^| ConvertTo-Json ^| Set-Content -Path .\!PACKAGE_JSON_FILE!
        ) >> %outputFilenamePackageJson%

        POWERSHELL -File %outputFilenamePackageJson%
        DEL /q %outputFilenamePackageJson% >NUL 2>&1
    ENDLOCAL
EXIT /B 0

:ManageTSConfigJson
    SETLOCAL ENABLEDELAYEDEXPANSION
        SET outputFilenameTsConfig="updateTsConfigJson.ps1"

        (
            ECHO $jsonContent = Get-Content -Raw -Path .\!TSCONFIG_JSON_FILE! -ErrorAction SilentlyContinue ^| ConvertFrom-Json

            ECHO if ^($null -eq $jsonContent^) {
            ECHO     $jsonContent = [PSCustomObject]@{
            ECHO        ^"include^" ^= @^(^"next-env.d.ts^", ^"**/*.ts^", ^"**/*.tsx^", ^".next/types/**/*.ts^"^)
            ECHO        ^"exclude^" ^= @^(^"node_modules^"^)
            ECHO     }
            ECHO }

            ECHO else {
            ECHO    $jsonContent ^| Add-Member -MemberType NoteProperty -Name include -Value @^(^"next-env.d.ts^", ^"**/*.ts^", ^"**/*.tsx^", ^".next/types/**/*.ts^"^)
            ECHO    $jsonContent ^| Add-Member -MemberType NoteProperty -Name exclude -Value @^(^"node_modules^"^)
            ECHO }

            ECHO $jsonContent ^| ConvertTo-Json ^| Set-Content -Path .\!TSCONFIG_JSON_FILE!
        ) >> %outputFilenameTsConfig%

        POWERSHELL -File %outputFilenameTsConfig%
        DEL /q %outputFilenameTsConfig% >NUL 2>&1
    ENDLOCAL
EXIT /B 0

:CleanTSConfig
    SETLOCAL ENABLEDELAYEDEXPANSION
        POWERSHELL -Command "(Get-Content !TSCONFIG_JSON_FILE! -Raw) -replace '/\*.*?\*/', '' -replace '\s*\r?\n\s*', [System.Environment]::NewLine -replace '(?m)^\s*//.*$', '' | Set-Content !TSCONFIG_JSON_FILE!"
    ENDLOCAL
EXIT /B 0

:CreateDirectories
    SETLOCAL ENABLEDELAYEDEXPANSION
        CALL MKDIR src
        CALL MKDIR dist
        CALL MKDIR src\pages
        CALL MKDIR public
    ENDLOCAL
EXIT /B 0

:CreateAppTsxFile
    SETLOCAL ENABLEDELAYEDEXPANSION
        (
            ECHO import type { AppProps } from ^'next^/app^'
            ECHO export default function App^({ Component, pageProps }: AppProps^) {
            ECHO   return ^<Component {...pageProps} ^/^>
            ECHO }
        ) >> %APP_TSX_FILENAME%
    ENDLOCAL
EXIT /B 0

:CreateDocumentTsxFile
    SETLOCAL ENABLEDELAYEDEXPANSION
        (
            ECHO import { Html, Head, Main, NextScript } from ^'next/document^'
            ECHO export default function Document^(^) {
            ECHO  return ^(
            ECHO    ^<Html^>
            ECHO      ^<Head ^/^>
            ECHO      ^<body^>
            ECHO        ^<Main ^/^>
            ECHO        ^<NextScript ^/^>
            ECHO      ^<^/body^>
            ECHO    ^<^/Html^>
            ECHO  ^)
            ECHO }
        ) >> %DOCUMENT_TSX_FILENAME%
    ENDLOCAL
EXIT /B 0

:CreateIndexTsxFile
    SETLOCAL ENABLEDELAYEDEXPANSION
        (
            ECHO export default function Page^(^) {
            ECHO   return ^<h1^>Hello, Next.js^^!^<^/h1^>
            ECHO }
        ) >> %INDEX_TSX_FILENAME%
    ENDLOCAL
EXIT /B 0

:CreateRunFile
    SETLOCAL ENABLEDELAYEDEXPANSION
        (
            ECHO @echo off
            ECHO npm run dev
        ) >> %RUN_BAT_FILENAME%
    ENDLOCAL
EXIT /B 0

:MAIN
CALL :ParseArgs
CALL :ClearAllFiles

CALL :WriteLog "Downloading and nodejs binaries..."
CALL :DownloadNodeJSBinaries
CALL :WriteLog "Extracting zip files..."
CALL :MoveExtractedFilesUp

CALL :WriteLog "Creating Node file..."
CALL :CreateNodeFile
CALL :WriteLog "Node file created successfully!" "Green"

CALL :WriteLog "Creating NPM file..."
CALL :CreateNPMFile
CALL :WriteLog "NPM file created successfully!" "Green"

CALL :WriteLog "Initializing package.json..."
CALL npm init -y

CALL :WriteLog "Adding dev dependency..."
CALL npm install typescript --save-dev

CALL :WriteLog "Install ambient Node.js types for TypeScript"
CALL npm install @types/node --save-dev
CALL npm install @types/react --save-dev

CALL :WriteLog "Creating TSC file..."
CALL :CreateTSCFile
CALL :WriteLog "TSC file created successfully!" "Green"

CALL :WriteLog "Creating NPX file..."
CALL :CreateNPXFile
CALL :WriteLog "NPX file created successfully!" "Green"

CALL :WriteLog "Generating tsconfig.json for next.js app..."
CALL npx tsc --init --rootDir %PROJECT_SRC_DIRECTORY% --outDir %PROJECT_BUILD_DIRECTORY% --esModuleInterop --resolveJsonModule --lib dom,dom.iterable,esnext --module esnext --allowJs true --skipLibCheck true --strict true --forceConsistentCasingInFileNames true --noEmit true --moduleResolution bundler --isolatedModules true --jsx preserve --incremental true --excludeDirectories "node_modules"

CALL :WriteLog "Installing next.js dependencies..."
CALL npm install next@latest react@latest react-dom@latest

CALL :WriteLog "Creating NEXT file..."
CALL :CreateNextFile
CALL :WriteLog "NEXT file created successfully!" "Green"

CALL :WriteLog "Adjusting package.json to next.js dev..."
CALL :ManagePackageJsonScript

CALL :WriteLog "Adjusting tsconfig.json to next.js dev..."
CALL :CleanTSConfig
CALL :ManageTSConfigJson

CALL :WriteLog "Creating directories..."
CALL :CreateDirectories

CALL :WriteLog "Creating files..."
CALL :CreateAppTsxFile
CALL :CreateDocumentTsxFile
CALL :CreateIndexTsxFile
CALL :CreateRunFile

CALL :WriteLog "Server configured successfully! Run run.bat on console to run it." "Green"