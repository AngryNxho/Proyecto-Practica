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
        print(f"✓ {name}: PASSED")
        if result.stdout:
            print(result.stdout)
        return True
    else:
        print(f"✗ {name}: FAILED")
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
        ("Flake8 Linter", "flake8 core/"),
        ("Black Format Check", "black core/ --check"),
        ("isort Import Check", "isort core/ --check-only"),
    ]
    
    results = []
    for name, command in checks:
        results.append(run_check(name, command))
    
    print("\n" + "="*60)
    print("RESUMEN")
    print("="*60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Passed: {passed}/{total}")
    
    if all(results):
        print("\n✓ Todos los checks pasaron correctamente")
        return 0
    else:
        print("\n✗ Algunos checks fallaron")
        print("\nPara corregir automaticamente:")
        print("  black core/")
        print("  isort core/")
        return 1


if __name__ == "__main__":
    sys.exit(main())
