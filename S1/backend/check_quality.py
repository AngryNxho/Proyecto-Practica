#!/usr/bin/env python
"""
Script para verificar calidad de codigo del backend
Ejecuta: flake8, black (check), isort (check)
"""
import subprocess
import sys


def run_check(name, command):
    """Ejecuta un comando y reporta el resultado"""
    print(f"\n{'='*60}")
    print(f"Ejecutando {name}...")
    print(f"{'='*60}")
    
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"✓ {name}: EXITOSO")
        if result.stdout:
            print(result.stdout)
        return True
    else:
        print(f"✗ {name}: FALLIDO")
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr)
        return False


def main():
    """Ejecuta todos los checks de calidad"""
    print("="*60)
    print("VERIFICACION DE CALIDAD DE CODIGO")
    print("="*60)
    
    checks = [
        ("Linter Flake8", "flake8 core/"),
        ("Verificacion de Formato Black", "black core/ --check"),
        ("Verificacion de Imports isort", "isort core/ --check-only"),
    ]
    
    results = []
    for name, command in checks:
        results.append(run_check(name, command))
    
    print("\n" + "="*60)
    print("RESUMEN")
    print("="*60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Exitosos: {passed}/{total}")
    
    if all(results):
        print("\n✓ Todas las verificaciones pasaron correctamente")
        return 0
    else:
        print("\n✗ Algunas verificaciones fallaron")
        print("\nPara corregir automaticamente:")
        print("  black core/")
        print("  isort core/")
        return 1


if __name__ == "__main__":
    sys.exit(main())
