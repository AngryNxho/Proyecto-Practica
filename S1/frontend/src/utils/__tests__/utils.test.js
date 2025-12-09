/**
 * Tests básicos para utilidades del frontend
 * HU: S03-HU12 - Crear pruebas para componentes
 */

import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDateTime } from '../utils';

describe('Utilidades de formato', () => {
  describe('formatCurrency', () => {
    it('debería formatear números como pesos chilenos', () => {
      expect(formatCurrency(1000)).toBe('$1.000');
      expect(formatCurrency(1500)).toBe('$1.500');
      expect(formatCurrency(0)).toBe('$0');
    });

    it('debería manejar números grandes correctamente', () => {
      expect(formatCurrency(1000000)).toBe('$1.000.000');
      expect(formatCurrency(999999)).toBe('$999.999');
    });
  });

  describe('formatDateTime', () => {
    it('debería formatear fechas ISO correctamente', () => {
      const fecha = '2025-12-09T12:30:00Z';
      const resultado = formatDateTime(fecha);
      expect(resultado).toContain('09');
      expect(resultado).toContain('12');
      expect(resultado).toContain('2025');
    });

    it('debería manejar fechas inválidas', () => {
      expect(() => formatDateTime('fecha-invalida')).not.toThrow();
    });
  });
});
