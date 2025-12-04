@echo off
REM Script para configurar permissões de leitura e gravação na pasta de mídias
REM Execute como Administrador

echo ========================================
echo Configurando Permissoes de Midia
echo ========================================
echo.

REM Obter o caminho da pasta public
set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%.."
set "PUBLIC_FOLDER=%BACKEND_DIR%\public"

echo Pasta de midias: %PUBLIC_FOLDER%
echo.

REM Verificar se a pasta existe
if not exist "%PUBLIC_FOLDER%" (
    echo Criando pasta public...
    mkdir "%PUBLIC_FOLDER%"
    echo Pasta criada com sucesso!
) else (
    echo Pasta public ja existe
)

REM Configurar permissões usando icacls (ferramenta nativa do Windows)
echo.
echo Configurando permissoes...
echo.

REM Dar permissão completa para Todos (compatível com Windows em português)
REM Tenta primeiro com "Todos" (português), depois com "Everyone" (inglês)
icacls "%PUBLIC_FOLDER%" /grant Todos:(OI)(CI)F /T /Q
if %ERRORLEVEL% NEQ 0 (
    icacls "%PUBLIC_FOLDER%" /grant Everyone:(OI)(CI)F /T /Q
)

if %ERRORLEVEL% EQU 0 (
    echo Permissoes configuradas com sucesso!
) else (
    echo ERRO: Falha ao configurar permissoes.
    echo.
    echo IMPORTANTE: Execute este script como Administrador!
    echo Clique com botao direito no arquivo e selecione "Executar como administrador"
    pause
    exit /b 1
)

echo.
echo ========================================
echo Configuracao Concluida!
echo ========================================
echo.
echo IMPORTANTE:
echo - Execute este script como Administrador
echo - Se ainda houver problemas, verifique as permissoes manualmente
echo.

pause

