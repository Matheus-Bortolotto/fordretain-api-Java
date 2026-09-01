@echo off
REM Executa a bateria completa de testes da API FordRetain.
REM Certifique-se que a aplicacao ja esta rodando em http://localhost:8080
REM antes de rodar este .bat.

echo Rodando bateria de testes da API FordRetain...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0test-api.ps1"

echo.
echo Concluido. Veja a pasta "evidencias" para os arquivos gerados.
pause