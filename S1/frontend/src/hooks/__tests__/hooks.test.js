import { describe, it, expect, vi } from 'vitest';
import useDebounce from '../useDebounce';
import usePagination from '../usePagination';
import { renderHook, act } from '@testing-library/react';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retorna valor inicial inmediatamente', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('debounce actualiza después del delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'inicial', delay: 500 } }
    );

    expect(result.current).toBe('inicial');

    // Actualizar valor
    rerender({ value: 'nuevo', delay: 500 });

    // No debe cambiar inmediatamente
    expect(result.current).toBe('inicial');

    // Avanzar tiempo
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Ahora debe cambiar
    expect(result.current).toBe('nuevo');
  });

  it('cancela timer anterior si valor cambia rápidamente', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 500 } }
    );

    rerender({ value: 'b', delay: 500 });
    act(() => vi.advanceTimersByTime(300));

    rerender({ value: 'c', delay: 500 });
    act(() => vi.advanceTimersByTime(300));

    // Solo debe tener 'a' porque el resto se canceló
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(200));

    // Ahora debe ser 'c'
    expect(result.current).toBe('c');
  });

  it('funciona con delay de 0', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 0 } }
    );

    rerender({ value: 'nuevo', delay: 0 });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('nuevo');
  });

  it('maneja valores undefined', () => {
    const { result } = renderHook(() => useDebounce(undefined, 500));
    expect(result.current).toBeUndefined();
  });

  it('maneja valores null', () => {
    const { result } = renderHook(() => useDebounce(null, 500));
    expect(result.current).toBeNull();
  });

  it('maneja números', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 500 } }
    );

    expect(result.current).toBe(0);

    rerender({ value: 123, delay: 500 });
    act(() => vi.advanceTimersByTime(500));

    expect(result.current).toBe(123);
  });

  it('maneja objetos', () => {
    const obj1 = { name: 'test' };
    const obj2 = { name: 'nuevo' };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: obj1, delay: 500 } }
    );

    expect(result.current).toBe(obj1);

    rerender({ value: obj2, delay: 500 });
    act(() => vi.advanceTimersByTime(500));

    expect(result.current).toBe(obj2);
  });

  it('maneja arrays', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: arr1, delay: 500 } }
    );

    expect(result.current).toEqual(arr1);

    rerender({ value: arr2, delay: 500 });
    act(() => vi.advanceTimersByTime(500));

    expect(result.current).toEqual(arr2);
  });
});

describe('usePagination', () => {
  it('retorna estado inicial correcto', () => {
    const { result } = renderHook(() => usePagination());

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(10);
  });

  it('permite configurar página inicial', () => {
    const { result } = renderHook(() => usePagination({ initialPage: 5 }));
    expect(result.current.currentPage).toBe(5);
  });

  it('permite configurar tamaño de página inicial', () => {
    const { result } = renderHook(() => usePagination({ initialPageSize: 25 }));
    expect(result.current.pageSize).toBe(25);
  });

  it('cambia de página correctamente', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.handlePageChange(3);
    });

    expect(result.current.currentPage).toBe(3);
  });

  it('no permite página negativa', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.handlePageChange(-1);
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('no permite página 0', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.handlePageChange(0);
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('reinicia a página 1 cuando cambia el filtro', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.handlePageChange(5);
    });

    expect(result.current.currentPage).toBe(5);

    act(() => {
      result.current.resetPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('cambia tamaño de página', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.handlePageSizeChange(50);
    });

    expect(result.current.pageSize).toBe(50);
  });

  it('reinicia a página 1 al cambiar tamaño de página', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.handlePageChange(3);
      result.current.handlePageSizeChange(25);
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(25);
  });

  it('calcula offset correctamente', () => {
    const { result } = renderHook(() => usePagination({ initialPageSize: 10 }));

    expect(result.current.offset).toBe(0);

    act(() => {
      result.current.handlePageChange(3);
    });

    expect(result.current.offset).toBe(20); // (3-1) * 10
  });

  it('maneja página muy grande', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.handlePageChange(999999);
    });

    expect(result.current.currentPage).toBe(999999);
  });

  it('maneja pageSize muy grande', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.handlePageSizeChange(10000);
    });

    expect(result.current.pageSize).toBe(10000);
  });
});

console.log('✅ Tests de hooks personalizados cargados');
