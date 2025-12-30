#!/bin/bash
# Script de despliegue para frontend en producción
# Ejecutar con: bash desplegar.sh

set -e  # Detener en caso de error

echo "========================================"
echo "  DESPLIEGUE DE FRONTEND - INVENTARIO"
echo "========================================"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
BUILD_DIR="dist"
PRODUCTION_ENV=".env.production"

# Función para logging
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Paso 1: Verificar archivo .env.production
echo ""
echo "📋 Paso 1: Verificando variables de entorno..."
if [ ! -f "$PRODUCTION_ENV" ]; then
    log_error "Archivo $PRODUCTION_ENV no encontrado"
    exit 1
fi
log_info "Variables de entorno encontradas"

# Paso 2: Limpiar build anterior
echo ""
echo "🧹 Paso 2: Limpiando build anterior..."
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
    log_info "Build anterior eliminado"
else
    log_info "No hay build anterior"
fi

# Paso 3: Instalar dependencias
echo ""
echo "📦 Paso 3: Instalando dependencias..."
npm ci --prefer-offline --no-audit
log_info "Dependencias instaladas"

# Paso 4: Ejecutar linter
echo ""
echo "🔍 Paso 4: Ejecutando linter..."
if npm run lint; then
    log_info "Linter pasado"
else
    log_warning "Advertencias del linter (continuando)"
fi

# Paso 5: Ejecutar tests
echo ""
echo "🧪 Paso 5: Ejecutando tests..."
if npm run test; then
    log_info "Tests pasados"
else
    log_error "Tests fallidos"
    exit 1
fi

# Paso 6: Build de producción
echo ""
echo "🏗️  Paso 6: Generando build de producción..."
npm run build:production
log_info "Build generado en $BUILD_DIR/"

# Paso 7: Verificar tamaño del build
echo ""
echo "📊 Paso 7: Analizando tamaño del build..."
BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
log_info "Tamaño total del build: $BUILD_SIZE"

# Mostrar archivos grandes
echo ""
echo "📁 Archivos JavaScript generados:"
find "$BUILD_DIR" -name "*.js" -type f -exec ls -lh {} \; | awk '{print $5 "\t" $9}'

# Paso 8: Resumen
echo ""
echo "========================================"
echo "  ✅ BUILD COMPLETADO"
echo "========================================"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Verificar el contenido de $BUILD_DIR/"
echo "  2. Subir a servidor web (nginx, apache, etc.)"
echo "  3. Configurar HTTPS y dominio"
echo ""
echo "💡 Para preview local:"
echo "  npm run preview"
echo ""
