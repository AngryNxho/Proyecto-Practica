import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../api';
import { productService, movementService, alertService } from '../inventoryService';

// Mock de axios
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}));

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll llama al endpoint correcto', async () => {
    const mockData = {
      count: 2,
      results: [
        { id: 1, nombre: 'Producto 1' },
        { id: 2, nombre: 'Producto 2' }
      ]
    };

    api.get.mockResolvedValue({ data: mockData });

    const result = await productService.getAll({ page: 1 });

    expect(api.get).toHaveBeenCalledWith('/api/productos/', { params: { page: 1 } });
    expect(result.data).toEqual(mockData);
  });

  it('getById llama al endpoint correcto', async () => {
    const mockProducto = { id: 1, nombre: 'Toner HP' };
    api.get.mockResolvedValue({ data: mockProducto });

    const result = await productService.getById(1);

    expect(api.get).toHaveBeenCalledWith('/api/productos/1/');
    expect(result.data).toEqual(mockProducto);
  });

  it('create envía datos correctamente', async () => {
    const nuevoProducto = {
      nombre: 'Nuevo Producto',
      precio: 10000,
      stock: 50,
      categoria: 'Test'
    };

    const mockResponse = { id: 1, ...nuevoProducto };
    api.post.mockResolvedValue({ data: mockResponse });

    const result = await productService.create(nuevoProducto);

    expect(api.post).toHaveBeenCalledWith('/api/productos/', nuevoProducto);
    expect(result.data).toEqual(mockResponse);
  });

  it('update envía datos correctamente', async () => {
    const datosActualizados = { nombre: 'Nombre Actualizado' };
    const mockResponse = { id: 1, ...datosActualizados };

    api.put.mockResolvedValue({ data: mockResponse });

    const result = await productService.update(1, datosActualizados);

    expect(api.put).toHaveBeenCalledWith('/api/productos/1/', datosActualizados);
    expect(result.data).toEqual(mockResponse);
  });

  it('delete llama al endpoint correcto', async () => {
    api.delete.mockResolvedValue({});

    await productService.delete(1);

    expect(api.delete).toHaveBeenCalledWith('/api/productos/1/');
  });

  it('exportarCSV configura responseType blob', async () => {
    api.get.mockResolvedValue({ data: 'csv data' });

    await productService.exportarCSV();

    expect(api.get).toHaveBeenCalledWith('/api/productos/exportar_csv/', {
      responseType: 'blob'
    });
  });

  it('maneja errores de red', async () => {
    const error = new Error('Network Error');
    api.get.mockRejectedValue(error);

    await expect(productService.getAll()).rejects.toThrow('Network Error');
  });

  it('maneja errores 404', async () => {
    const error = { response: { status: 404, data: 'Not found' } };
    api.get.mockRejectedValue(error);

    await expect(productService.getById(999)).rejects.toEqual(error);
  });

  it('maneja errores 400 en validación', async () => {
    const error = {
      response: {
        status: 400,
        data: { nombre: ['Este campo es requerido'] }
      }
    };
    api.post.mockRejectedValue(error);

    await expect(productService.create({})).rejects.toEqual(error);
  });
});

describe('movementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll llama al endpoint correcto', async () => {
    const mockData = {
      count: 5,
      results: [{ id: 1, tipo: 'entrada', cantidad: 10 }]
    };

    api.get.mockResolvedValue({ data: mockData });

    const result = await movementService.getAll({ page: 1 });

    expect(api.get).toHaveBeenCalledWith('/api/movimientos/', { params: { page: 1 } });
    expect(result.data).toEqual(mockData);
  });

  it('create registra movimiento correctamente', async () => {
    const nuevoMovimiento = {
      producto: 1,
      tipo: 'entrada',
      cantidad: 10,
      descripcion: 'Compra'
    };

    const mockResponse = { id: 1, ...nuevoMovimiento };
    api.post.mockResolvedValue({ data: mockResponse });

    const result = await movementService.create(nuevoMovimiento);

    expect(api.post).toHaveBeenCalledWith('/api/movimientos/', nuevoMovimiento);
    expect(result.data).toEqual(mockResponse);
  });

  it('exportarCSV configura responseType blob', async () => {
    api.get.mockResolvedValue({ data: 'csv data' });

    await movementService.exportarCSV();

    expect(api.get).toHaveBeenCalledWith('/api/movimientos/exportar_csv/', {
      responseType: 'blob'
    });
  });

  it('getEstadisticas llama al endpoint correcto', async () => {
    const mockStats = {
      total_entradas: 100,
      total_salidas: 50,
      productos_mas_activos: []
    };

    api.get.mockResolvedValue({ data: mockStats });

    const result = await movementService.getEstadisticas();

    expect(api.get).toHaveBeenCalledWith('/api/movimientos/estadisticas/');
    expect(result.data).toEqual(mockStats);
  });

  it('valida cantidad mayor a 0', async () => {
    const movimientoInvalido = {
      producto: 1,
      tipo: 'entrada',
      cantidad: 0,
      descripcion: 'Test'
    };

    const error = {
      response: {
        status: 400,
        data: { cantidad: ['Debe ser mayor a 0'] }
      }
    };

    api.post.mockRejectedValue(error);

    await expect(movementService.create(movimientoInvalido)).rejects.toEqual(error);
  });
});

describe('alertService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll llama al endpoint correcto', async () => {
    const mockData = {
      count: 3,
      results: [{ id: 1, producto: 1, stock_minimo: 10 }]
    };

    api.get.mockResolvedValue({ data: mockData });

    const result = await alertService.getAll();

    expect(api.get).toHaveBeenCalledWith('/api/alertas/');
    expect(result.data).toEqual(mockData);
  });

  it('getActivas llama al endpoint correcto', async () => {
    const mockActivas = [
      { id: 1, producto_nombre: 'Toner HP', stock_actual: 5, stock_minimo: 10 }
    ];

    api.get.mockResolvedValue({ data: mockActivas });

    const result = await alertService.getActivas();

    expect(api.get).toHaveBeenCalledWith('/api/alertas/activas/');
    expect(result.data).toEqual(mockActivas);
  });

  it('create crea alerta correctamente', async () => {
    const nuevaAlerta = {
      producto: 1,
      stock_minimo: 15,
      activa: true
    };

    const mockResponse = { id: 1, ...nuevaAlerta };
    api.post.mockResolvedValue({ data: mockResponse });

    const result = await alertService.create(nuevaAlerta);

    expect(api.post).toHaveBeenCalledWith('/api/alertas/', nuevaAlerta);
    expect(result.data).toEqual(mockResponse);
  });

  it('update actualiza alerta correctamente', async () => {
    const datosActualizados = { stock_minimo: 20 };
    const mockResponse = { id: 1, ...datosActualizados };

    api.put.mockResolvedValue({ data: mockResponse });

    const result = await alertService.update(1, datosActualizados);

    expect(api.put).toHaveBeenCalledWith('/api/alertas/1/', datosActualizados);
    expect(result.data).toEqual(mockResponse);
  });

  it('delete elimina alerta correctamente', async () => {
    api.delete.mockResolvedValue({});

    await alertService.delete(1);

    expect(api.delete).toHaveBeenCalledWith('/api/alertas/1/');
  });

  it('rechaza stock mínimo negativo', async () => {
    const alertaInvalida = {
      producto: 1,
      stock_minimo: -5,
      activa: true
    };

    const error = {
      response: {
        status: 400,
        data: { stock_minimo: ['No puede ser negativo'] }
      }
    };

    api.post.mockRejectedValue(error);

    await expect(alertService.create(alertaInvalida)).rejects.toEqual(error);
  });
});

describe('Casos extremos - Servicios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maneja timeout de petición', async () => {
    const error = new Error('timeout of 10000ms exceeded');
    api.get.mockRejectedValue(error);

    await expect(productService.getAll()).rejects.toThrow('timeout');
  });

  it('maneja respuesta vacía', async () => {
    api.get.mockResolvedValue({ data: null });

    const result = await productService.getAll();
    expect(result.data).toBeNull();
  });

  it('maneja array vacío', async () => {
    api.get.mockResolvedValue({ data: { count: 0, results: [] } });

    const result = await productService.getAll();
    expect(result.data.results).toEqual([]);
  });

  it('maneja errores 500 del servidor', async () => {
    const error = {
      response: {
        status: 500,
        data: 'Internal Server Error'
      }
    };

    api.get.mockRejectedValue(error);

    await expect(productService.getAll()).rejects.toEqual(error);
  });

  it('maneja errores sin respuesta (red caída)', async () => {
    const error = new Error('Network Error');
    error.request = {};

    api.get.mockRejectedValue(error);

    await expect(productService.getAll()).rejects.toThrow('Network Error');
  });

  it('maneja parámetros de búsqueda complejos', async () => {
    const params = {
      search: 'Tóner HP',
      categoria: 'Toner',
      ordering: '-stock',
      page: 3,
      page_size: 50,
      stock_bajo: true
    };

    api.get.mockResolvedValue({ data: { count: 0, results: [] } });

    await productService.getAll(params);

    expect(api.get).toHaveBeenCalledWith('/api/productos/', { params });
  });
});

console.log('✅ Tests de servicios API cargados');
