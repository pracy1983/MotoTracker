@ECHO OFF

SET USE_LOCALHOST=TRUE

CD %~dp0
SET FULL_PATH=%CD%\%RELATIVE_PATH%

SET CERTFICATE_FOLDER_PATH=%CD%\certificate
SET CURRENT_TESTING_FOLDER=%CERTFICATE_FOLDER_PATH%\yttutorial\files

SET CA_CERT_PATH=%CURRENT_TESTING_FOLDER%\ca.pem
SET CLIENT_CERT_PATH=%CURRENT_TESTING_FOLDER%\client-cert.pem
SET CLIENT_KEY_PATH=%CURRENT_TESTING_FOLDER%\client-key.pem
SET CLIENT_PASSPHRASE=DLalu5PXT7UHH0k

SET SERVER_CERT_PATH=%CURRENT_TESTING_FOLDER%\cert.pem
SET SERVER_KEY_PATH=%CURRENT_TESTING_FOLDER%\cert-key.pem

SET LOCALHOST_PROTOCOL=wss
SET LOCALHOST_URL=localhost
SET LOCALHOST_PORT=3001
SET LOCALHOST_WEBSOCKET=%LOCALHOST_PROTOCOL%://%LOCALHOST_URL%:%LOCALHOST_PORT%
SET LOCALHOST_LOG_COLOR=Green

SET NGROK_PROTOCOL=wss
SET NGROK_URL=0.tcp.sa.ngrok.io
SET NGROK_PORT=10328
SET NGROK_WEBSOCKET=%NGROK_PROTOCOL%://%NGROK_URL%:%NGROK_PORT%
SET NGROK_LOG_COLOR=Green

IF "%USE_LOCALHOST%"=="TRUE" (
    SET WEBSOCKET_URL=%LOCALHOST_WEBSOCKET%
    SET NGROK_LOG_COLOR=DarkGray
) ELSE (
    SET WEBSOCKET_URL=%NGROK_WEBSOCKET%
    SET LOCALHOST_LOG_COLOR=DarkGray
)

GOTO :MAIN

:WriteLog
    SETLOCAL ENABLEDELAYEDEXPANSION
        SET message=%~1
        SET color=%~2

        IF NOT DEFINED color SET color=White
        
        POWERSHELL write-host -foregroundcolor %color% %message%
    ENDLOCAL
EXIT /B 0


:MAIN
ECHO:
CALL :WriteLog "This command will be executed with the following parameters:"
ECHO:
CALL :WriteLog "CA-CERTIFICATE: %CA_CERT_PATH%" DarkCyan
CALL :WriteLog "CLIENT-CERTIFICATE: %CLIENT_CERT_PATH%" DarkCyan
CALL :WriteLog "CLIENT-KEY: %CLIENT_KEY_PATH%" DarkCyan
CALL :WriteLog "CLIENT-PASSPHRASE: %CLIENT_PASSPHRASE%" DarkCyan
ECHO:
CALL :WriteLog "Selected server:"
CALL :WriteLog "LOCALHOST_WEBSOCKET: %LOCALHOST_WEBSOCKET%" %LOCALHOST_LOG_COLOR%
CALL :WriteLog "NGROK_WEBSOCKET: %NGROK_WEBSOCKET%" %NGROK_LOG_COLOR%

wscat -c %WEBSOCKET_URL% --cert %CLIENT_CERT_PATH% --key %CLIENT_KEY_PATH% --passphrase %CLIENT_PASSPHRASE% --no-check -x "{""coordinates"":[-23.5240131,-46.6714104]}"

@REM Casa
@REM wscat -c ws://0.tcp.sa.ngrok.io:18808 -x "{""coordinates"":[-23.5711184,-46.7122913]}"


REM PASSWORD CERT 406?'5Z8Dirg
@REM Concentrix 
REM wscat -c ws://0.tcp.sa.ngrok.io:17472 -x "{""coordinates"":[-23.5240131,-46.6714104]}"

@REM Concentrix 
REM wscat -c wss://0.tcp.sa.ngrok.io:14633 -x "{""coordinates"":[-23.5240131,-46.6714104]}" --ca ./certificate/SIGNED/client_cert.crt --key ./certificate/SIGNED/client_key.pem --passphrase yggNCrplDyLSWr3 --no-check

REM wscat -c wss://localhost:3001 -x "{""coordinates"":[-23.5240131,-46.6714104]}" --ca ./certificate/openssl/rootCA.crt --cert ./certificate/openssl/client.crt --key ./certificate/openssl/client.key --passphrase yggNCrplDyLSWr3
REM wscat -c wss://localhost:3001 --ca G:\Projects\maptracking\certificate\openssl\rootCA.crt --cert G:\Projects\maptracking\certificate\openssl\client.crt --key G:\Projects\maptracking\certificate\openssl\client.key --passphrase yggNCrplDyLSWr3 --no-check
REM wscat -c wss://localhost:3001 --ca G:\Projects\maptracking\certificate\test\ca-certificate.pem --cert G:\Projects\maptracking\certificate\test\client-certificate.pem --key G:\Projects\maptracking\certificate\test\client-key.pem --no-check

@REM --ca ./certificate/maptracking_cert.pem --key ./certificate/maptracking_key.pem --passphrase 406?'5Z8Dirg --no-check

@REM --ca ./certificate/maptracking_cert.pem --key ./certificate/maptracking_key.pem

@REM --ca ./certificate/maptracking_cert.pem --key ./certificate/maptracking_key.pem

@REM Araras
@REM wscat -c ws://0.tcp.sa.ngrok.io:18808 -x "{""coordinates"":[-22.3537533,-47.3901029]}"

@REM Campinas
@REM wscat -c ws://0.tcp.sa.ngrok.io:18808 -x "{""coordinates"":[-22.9085139,-47.0639856]}"

@REM Empire State
@REM wscat -c ws://0.tcp.sa.ngrok.io:18808 -x "{""coordinates"":[40.7484445,-73.9882393]}"

@REM Mottu Butanta
@REM wscat -c ws://0.tcp.sa.ngrok.io:18808 -x "{""coordinates"":[-23.5710634,-46.7077266]}"

@REM Sao Jose dos Campos
@REM wscat -c ws://0.tcp.sa.ngrok.io:18808 -x "{""coordinates"":[-23.189327,-45.9454136]}"


@REM wscat -c ws://localhost:18808 -x "{""coordinates"":[-23.5711184,-46.7122913]}"
@REM wscat -c ws://localhost:18808 -x "{""coordinates"":[48.8566, 2.3522]}"


@REM {"coordinates":[-23.5711184,-46.7122913]}"