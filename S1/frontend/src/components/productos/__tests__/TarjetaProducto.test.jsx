import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TarjetaProducto from '../TarjetaProducto';

describe('TarjetaProducto', () => {
  const mockProducto = {
    id: 1,
    nombre: 'Toner HP 80A',
    marca: 'HP',
    modelo: '80A',
    precio: 25000,
    stock: 10,
    categoria: 'Toner'
  };

  const mockHandlers = {
    onEditar: vi.fn(),
    onEliminar: vi.fn(),
    onAgregarStock: vi.fn(),
    onReducirStock: vi.fn()
  };

  it('muestra la información del producto', () => {
    render(<TarjetaProducto producto={mockProducto} {...mockHandlers} />);
    
    expect(screen.getByText('Toner HP 80A')).toBeTruthy();
    expect(screen.getByText('Toner')).toBeTruthy();
  });

  it('muestra el stock correctamente', () => {
    render(<TarjetaProducto producto={mockProducto} {...mockHandlers} />);
    expect(screen.getByText(/10/)).toBeTruthy();
  });

  it('muestra el precio formateado', () => {
    render(<TarjetaProducto producto={mockProducto} {...mockHandlers} />);
    expect(screen.getByText(/25.000/)).toBeTruthy();
  });
});
