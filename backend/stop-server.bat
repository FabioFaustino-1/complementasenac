@echo off
cd /d "%~dp0"
echo Liberando porta 8080...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
  echo Encerrando processo PID %%a
  taskkill /PID %%a /F 2>nul
)

for /f "tokens=2" %%a in ('tasklist ^| findstr /i "ruby.exe"') do (
  echo Encerrando ruby.exe PID %%a
  taskkill /PID %%a /F 2>nul
)

if exist tmp\pids\server.pid del /f tmp\pids\server.pid

echo Pronto. Agora execute: server.bat
