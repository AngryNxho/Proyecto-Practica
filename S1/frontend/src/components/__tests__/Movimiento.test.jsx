import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import FormularioMovimiento from '../movimientos/FormularioMovimiento';
import ItemMovimiento from '../movimientos/ItemMovimiento';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('FormularioMovimiento', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const productos = [
    { id: 1, nombre: 'Toner HP', stock: 25 },
    { id: 2, nombre: 'Papel A4', stock: 100 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza formulario correctamente', () => {
    renderWithRouter(
      <FormularioMovimiento 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        productos={productos}
      />
    );

    expect(screen.getByText(/registrar movimiento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/producto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cantidad/i)).toBeInTheDocument();
  });

  it('valida que se seleccione un producto', async () => {
    renderWithRouter(
      <FormularioMovimiento 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        productos={productos}
      />
    );

    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const productoSelect = screen.getByLabelText(/producto/i);
      expect(productoSelect).toBeInvalid();
    });
  });

  it('valida cantidad mayor a 0', async () => {
    renderWithRouter(
      <FormularioMovimiento 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        productos={productos}
      />
    );

    const cantidadInput = screen.getByLabelText(/cantidad/i);
    fireEvent.change(cantidadInput, { target: { value: '0' } });

    await waitFor(() => {
      expect(cantidadInput).toBeInvalid();
    });
  });

  it('no permite cantidad negativa', async () => {
    renderWithRouter(
      <FormularioMovimiento 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        productos={productos}
      />
    );

    const cantidadInput = screen.getByLabelText(/cantidad/i);
    fireEvent.change(cantidadInput, { target: { value: '-5' } });

    await waitFor(() => {
      expect(cantidadInput).toBeInvalid();
    });
  });

  it('muestra advertencia cuando salida excede stock', async () => {
    renderWithRouter(
      <FormularioMovimiento 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        productos={productos}
      />
    );

    // Seleccionar producto
    const productoSelect = screen.getByLabelText(/producto/i);
    fireEvent.change(productoSelect, { target: { value: '1' } });

    // Seleccionar salida
    const tipoSelect = screen.getByLabelText(/tipo/i);
    fireEvent.change(tipoSelect, { target: { value: 'salida' } });

    // Intentar cantidad mayor al stock (Toner HP tiene stock 25)
    const cantidadInput = screen.getByLabelText(/cantidad/i);
    fireEvent.change(cantidadInput, { target: { value: '30' } });

    await waitFor(() => {
      expect(screen.getByText(/excede el stock/i)).toBeInTheDocument();
    });
  });

  it('llama onCancel correctamente', () => {
    renderWithRouter(
      <FormularioMovimiento 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        productos={productos}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});

describe('ItemMovimiento', () => {
  const movimiento = {
    id: 1,
    producto_nombre: 'Toner HP 85A',
    tipo: 'entrada',
    cantidad: 10,
    descripcion: 'Compra mensual',
    usuario: 'admin',
    fecha: '2026-01-04T10:30:00Z'
  };

  it('renderiza movimiento de entrada correctamente', () => {
    renderWithRouter(<ItemMovimiento movimiento={movimiento} />);

    expect(screen.getByText('Toner HP 85A')).toBeInTheDocument();
    expect(screen.getByText(/entrada/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Compra mensual')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('renderiza movimiento de salida correctamente', () => {
    const movimientoSalida = {
      ...movimiento,
      tipo: 'salida',
      descripcion: 'Venta cliente'
    };

    renderWithRouter(<ItemMovimiento movimiento={movimientoSalida} />);

    expect(screen.getByText(/salida/i)).toBeInTheDocument();
    expect(screen.getByText('Venta cliente')).toBeInTheDocument();
  });

  it('muestra fecha formateada correctamente', () => {
    renderWithRouter(<ItemMovimiento movimiento={movimiento} />);

    // Debe mostrar fecha en formato legible
    const fechaElement = screen.getByText(/04\/01\/2026|4 ene|enero/i);
    expect(fechaElement).toBeInTheDocument();
  });

  it('muestra badge diferente para entrada y salida', () => {
    const { rerender } = renderWithRouter(<ItemMovimiento movimiento={movimiento} />);
    
    const badgeEntrada = screen.getByText(/entrada/i);
    expect(badgeEntrada).toHaveClass(/success|verde/i);

    const movimientoSalida = { ...movimiento, tipo: 'salida' };
    rerender(
      <BrowserRouter>
        <ItemMovimiento movimiento={movimientoSalida} />
      </BrowserRouter>
    );

    const badgeSalida = screen.getByText(/salida/i);
    expect(badgeSalida).toHaveClass(/danger|rojo/i);
  });
});

describe('Casos extremos - Movimientos', () => {
  it('maneja cantidad muy grande', () => {
    const movimiento = {
      id: 1,
      producto_nombre: 'Producto Test',
      tipo: 'entrada',
      cantidad: 999999,
      descripcion: 'Cantidad masiva',
      usuario: 'sistema',
      fecha: '2026-01-04T10:30:00Z'
    };

    renderWithRouter(<ItemMovimiento movimiento={movimiento} />);
    expect(screen.getByText('999999')).toBeInTheDocument();
  });

  it('maneja descripción muy larga', () => {
    const descripcionLarga = 'A'.repeat(500);
    const movimiento = {
      id: 1,
      producto_nombre: 'Producto Test',
      tipo: 'entrada',
      cantidad: 10,
      descripcion: descripcionLarga,
      usuario: 'admin',
      fecha: '2026-01-04T10:30:00Z'
    };

    renderWithRouter(<ItemMovimiento movimiento={movimiento} />);
    expect(screen.getByText(descripcionLarga)).toBeInTheDocument();
  });

  it('maneja usuario vacío', () => {
    const movimiento = {
      id: 1,
      producto_nombre: 'Producto Test',
      tipo: 'entrada',
      cantidad: 10,
      descripcion: 'Test',
      usuario: '',
      fecha: '2026-01-04T10:30:00Z'
    };

    renderWithRouter(<ItemMovimiento movimiento={movimiento} />);
    expect(screen.getByText(/sistema|desconocido/i)).toBeInTheDocument();
  });

  it('maneja descripción vacía', () => {
    const movimiento = {
      id: 1,
      producto_nombre: 'Producto Test',
      tipo: 'entrada',
      cantidad: 10,
      descripcion: '',
      usuario: 'admin',
      fecha: '2026-01-04T10:30:00Z'
    };

    renderWithRouter(<ItemMovimiento movimiento={movimiento} />);
    expect(screen.getByText(/sin descripción/i)).toBeInTheDocument();
  });

  it('maneja fecha inválida graciosamente', () => {
    const movimiento = {
      id: 1,
      producto_nombre: 'Producto Test',
      tipo: 'entrada',
      cantidad: 10,
      descripcion: 'Test',
      usuario: 'admin',
      fecha: 'fecha-invalida'
    };

    // No debe lanzar error
    expect(() => {
      renderWithRouter(<ItemMovimiento movimiento={movimiento} />);
    }).not.toThrow();
  });
});

console.log('✅ Tests de componentes Movimiento cargados');
