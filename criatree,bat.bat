@echo off
echo Criando diretorios...

REM Cria diretorios principais
mkdir css
mkdir js
mkdir assets

REM Cria subdiretorios em assets
mkdir assets\images
mkdir assets\sounds

REM Cria subdiretorios em assets\images
mkdir assets\images\themes
mkdir assets\images\ui

REM Cria subdiretorio de exemplo em assets\images\themes
mkdir assets\images\themes\animals

echo.
echo Criando arquivos vazios...

REM Cria arquivos na raiz
type nul > index.html
type nul > README.md

REM Cria arquivos em css
type nul > css\style.css

REM Cria arquivos em js
type nul > js\main.js
type nul > js\game.js
type nul > js\data.js
type nul > js\ui.js

echo.
echo Estrutura de arquivos criada com sucesso!
pause