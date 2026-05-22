@echo off
setlocal
set RUBY_EXE=ruby
where ruby >nul 2>nul || set RUBY_EXE=C:\Ruby34-x64\bin\ruby.exe
"%RUBY_EXE%" "%~dp0rails" %*
