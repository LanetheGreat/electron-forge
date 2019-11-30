@echo off

SETLOCAL
SET FORGE_ARGS=%*

SET FORGE_ARGS=%FORGE_ARGS: =~ ~%
node "%~dp0/../../@lanethegreat/electron-forge/dist/electron-forge-start.js" --vscode -- ~%FORGE_ARGS%~

ENDLOCAL