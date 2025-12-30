# Script PowerShell de despliegue para frontend en producción
# Ejecutar con: .\desplegar.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE DE FRONTEND - INVENTARIO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Variables
$BUILD_DIR = "dist"
$PRODUCTION_ENV = ".env.production"

# Paso 1: Verificar archivo .env.production
Write-Host ""
Write-Host "Paso 1: Verificando variables de entorno..." -ForegroundColor Yellow
if (-Not (Test-Path $PRODUCTION_ENV)) {
    Write-Host "Error: Archivo $PRODUCTION_ENV no encontrado" -ForegroundColor Red
    exit 1
}
Write-Host "Variables de entorno encontradas" -ForegroundColor Green

# Paso 2: Limpiar build anterior
Write-Host ""
Write-Host "Paso 2: Limpiando build anterior..." -ForegroundColor Yellow
if (Test-Path $BUILD_DIR) {
    Remove-Item -Recurse -Force $BUILD_DIR
    Write-Host "Build anterior eliminado" -ForegroundColor Green
} else {
    Write-Host "No hay build anterior" -ForegroundColor Green
}

# Paso 3: Instalar dependencias
Write-Host ""
Write-Host "Paso 3: Instalando dependencias..." -ForegroundColor Yellow
npm ci --prefer-offline --no-audit
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al instalar dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "Dependencias instaladas" -ForegroundColor Green

# Paso 4: Ejecutar linter
Write-Host ""
Write-Host "Paso 4: Ejecutando linter..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "Advertencias del linter (continuando)" -ForegroundColor Yellow
}

# Paso 5: Ejecutar tests
Write-Host ""
Write-Host "Paso 5: Ejecutando tests..." -ForegroundColor Yellow
npm run test
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tests fallidos" -ForegroundColor Red
    exit 1
}
Write-Host "Tests pasados" -ForegroundColor Green

# Paso 6: Build de producción
Write-Host ""
Write-Host "Paso 6: Generando build de producción..." -ForegroundColor Yellow
npm run build:production
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al generar build" -ForegroundColor Red
    exit 1
}
Write-Host "Build generado en $BUILD_DIR/" -ForegroundColor Green

# Paso 7: Verificar tamaño del build
Write-Host ""
Write-Host "Paso 7: Analizando tamaño del build..." -ForegroundColor Yellow
$buildSize = (Get-ChildItem -Recurse $BUILD_DIR | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host ("Tamaño total del build: {0:N2} MB" -f $buildSize) -ForegroundColor Green

# Mostrar archivos JavaScript generados
Write-Host ""
Write-Host "Archivos JavaScript generados:" -ForegroundColor Cyan
Get-ChildItem -Recurse -Path $BUILD_DIR -Filter "*.js" | ForEach-Object {
    $size = "{0:N2} KB" -f ($_.Length / 1KB)
    Write-Host "  $size`t$($_.FullName)"
}

# Paso 8: Resumen
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILD COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Verificar el contenido de $BUILD_DIR/"
Write-Host "  2. Subir a servidor web (nginx, IIS, etc.)"
Write-Host "  3. Configurar HTTPS y dominio"
Write-Host ""
Write-Host "Para preview local:" -ForegroundColor Yellow
Write-Host "  npm run preview"
Write-Host ""
