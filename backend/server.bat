@echo off
cd /d "%~dp0"
if exist tmp\pids\server.pid del /f tmp\pids\server.pid
bundle exec rails server -b 127.0.0.1 -p 8080
