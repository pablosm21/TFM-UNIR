@echo off
REM build.bat - Script de compilación real para log_component con logs detallados

setlocal enabledelayedexpansion

echo [INFO] Iniciando compilación de log_component...
echo [DEBUG] Verificando dependencias...
where g++ >nul 2>nul
if errorlevel 1 (
	echo [ERROR] g++ no encontrado. Instala MinGW o un compilador de C++ y agrega g++ al PATH.
	exit /b 1
)
echo [DEBUG] g++ encontrado en el sistema

if not exist build mkdir build

echo [INFO] Compilando archivo log_main.cpp...
echo [DEBUG] Ejecutando: g++ log_main.cpp -o build\log_component.exe
g++ log_main.cpp -o build\log_component.exe > build\compile_output.log 2>&1
set COMP_STATUS=%ERRORLEVEL%
type build\compile_output.log
if !COMP_STATUS! neq 0 (
	echo [ERROR] Error durante la compilación. Consulta build\compile_output.log
	exit /b !COMP_STATUS!
)
echo [INFO] Compilación finalizada con éxito.
echo [DEBUG] Ejecutable generado en build\log_component.exe
echo [WARNING] Este es un mensaje de advertencia de ejemplo
echo [ERROR] Este es un mensaje de error de ejemplo (simulado)
exit /b 0
