import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import FormularioProducto from '../productos/FormularioProducto';
import ItemProducto from '../productos/ItemProducto';
import ListaProductos from '../productos/ListaProductos';

// Mock del servicio de inventario
vi.mock('../../services/inventoryService', () => ({
  productService: {
    getAll: vi.fn(() => Promise.resolve({
      data: {
        count: 2,
        results: [
          { id: 1, nombre: 'Toner HP', precio: '10000.00', stock: 25, categoria: 'Toner' },
          { id: 2, nombre: 'Papel A4', precio: '5000.00', stock: 100, categoria: 'Papel' }
        ]
      }
    })),
    create: vi.fn((data) => Promise.resolve({ data: { id: 3, ...data } })),
    update: vi.fn((id, data) => Promise.resolve({ data: { id, ...data } })),
    delete: vi.fn(() => Promise.resolve({}))
  }
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('FormularioProducto', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza correctamente en modo crear', () => {
    renderWithRouter(
      <FormularioProducto onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByText(/nuevo producto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/precio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stock/i)).toBeInTheDocument();
  });

  it('renderiza correctamente en modo editar', () => {
    const producto = {
      id: 1,
      nombre: 'Toner HP',
      precio: '10000.00',
      stock: 25,
      categoria: 'Toner',
      marca: 'HP',
      modelo: '80A'
    };

    renderWithRouter(
      <FormularioProducto producto={producto} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByText(/editar producto/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Toner HP')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10000.00')).toBeInTheDocument();
  });

  it('valida campo nombre requerido', async () => {
    renderWithRouter(
      <FormularioProducto onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const nombreInput = screen.getByLabelText(/nombre/i);
      expect(nombreInput).toBeInvalid();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('valida precio mínimo mayor a 0', async () => {
    renderWithRouter(
      <FormularioProducto onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const precioInput = screen.getByLabelText(/precio/i);
    fireEvent.change(precioInput, { target: { value: '-100' } });

    await waitFor(() => {
      expect(precioInput).toBeInvalid();
    });
  });

  it('valida stock como número entero', async () => {
    renderWithRouter(
      <FormularioProducto onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const stockInput = screen.getByLabelText(/stock/i);
    fireEvent.change(stockInput, { target: { value: '10.5' } });

    // Stock debe ser entero
    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(stockInput).toBeInvalid();
    });
  });

  it('llama onCancel al hacer clic en cancelar', () => {
    renderWithRouter(
      <FormularioProducto onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});

describe('ItemProducto', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const producto = {
    id: 1,
    nombre: 'Toner HP 85A',
    descripcion: 'Toner negro para LaserJet',
    marca: 'HP',
    modelo: '85A',
    precio: '45000.00',
    stock: 15,
    categoria: 'Toner',
    codigo_barras: '1234567890123'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza información del producto correctamente', () => {
    renderWithRouter(
      <ItemProducto producto={producto} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('Toner HP 85A')).toBeInTheDocument();
    expect(screen.getByText(/45000/)).toBeInTheDocument();
    expect(screen.getByText(/15/)).toBeInTheDocument();
    expect(screen.getByText('Toner')).toBeInTheDocument();
  });

  it('muestra badge de stock bajo cuando stock es crítico', () => {
    const productoStockBajo = { ...producto, stock: 3 };

    renderWithRouter(
      <ItemProducto producto={productoStockBajo} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    expect(screen.getByText(/stock bajo/i)).toBeInTheDocument();
  });

  it('llama onEdit al hacer clic en editar', () => {
    renderWithRouter(
      <ItemProducto producto={producto} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const editButton = screen.getByRole('button', { name: /editar/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(producto);
  });

  it('muestra confirmación antes de eliminar', () => {
    // Mock de window.confirm
    global.confirm = vi.fn(() => true);

    renderWithRouter(
      <ItemProducto producto={producto} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const deleteButton = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockOnDelete).toHaveBeenCalledWith(producto.id);
  });

  it('no elimina si el usuario cancela la confirmación', () => {
    global.confirm = vi.fn(() => false);

    renderWithRouter(
      <ItemProducto producto={producto} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    );

    const deleteButton = screen.getByRole('button', { name: /eliminar/i });
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});

describe('Casos extremos - Productos', () => {
  it('maneja nombre muy largo correctamente', () => {
    const nombreLargo = 'A'.repeat(200);
    const producto = {
      id: 1,
      nombre: nombreLargo,
      precio: '10000.00',
      stock: 10,
      categoria: 'Test'
    };

    renderWithRouter(
      <ItemProducto producto={producto} onEdit={vi.fn()} onDelete={vi.fn()} />
    );

    expect(screen.getByText(nombreLargo)).toBeInTheDocument();
  });

  it('maneja precio muy alto correctamente', () => {
    const producto = {
      id: 1,
      nombre: 'Producto Caro',
      precio: '999999.99',
      stock: 1,
      categoria: 'Premium'
    };

    renderWithRouter(
      <ItemProducto producto={producto} onEdit={vi.fn()} onDelete={vi.fn()} />
    );

    expect(screen.getByText(/999999/)).toBeInTheDocument();
  });

  it('maneja stock 0 correctamente', () => {
    const producto = {
      id: 1,
      nombre: 'Sin Stock',
      precio: '10000.00',
      stock: 0,
      categoria: 'Test'
    };

    renderWithRouter(
      <ItemProducto producto={producto} onEdit={vi.fn()} onDelete={vi.fn()} />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/agotado/i)).toBeInTheDocument();
  });

  it('maneja campos opcionales vacíos', () => {
    const producto = {
      id: 1,
      nombre: 'Producto Mínimo',
      precio: '10000.00',
      stock: 10,
      categoria: 'Test',
      marca: '',
      modelo: '',
      descripcion: ''
    };

    renderWithRouter(
      <ItemProducto producto={producto} onEdit={vi.fn()} onDelete={vi.fn()} />
    );

    expect(screen.getByText('Producto Mínimo')).toBeInTheDocument();
  });

  it('maneja categoría vacía', () => {
    const producto = {
      id: 1,
      nombre: 'Sin Categoría',
      precio: '10000.00',
      stock: 10,
      categoria: ''
    };

    renderWithRouter(
      <ItemProducto producto={producto} onEdit={vi.fn()} onDelete={vi.fn()} />
    );

    expect(screen.getByText(/sin categoría/i)).toBeInTheDocument();
  });
});

console.log('✅ Tests de componentes Producto cargados');
