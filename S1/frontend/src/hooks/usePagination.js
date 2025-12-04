import { useState } from 'react';

/**
 * Hook para manejar paginación
 * @param {number} initialPage - Página inicial (default: 1)
 * @param {number} initialPageSize - Tamaño de página inicial (default: 20)
 * @returns {Object} Estado y funciones de paginación
 */
function usePagination(initialPage = 1, initialPageSize = 20) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(totalItems / pageSize);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const reset = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    setCurrentPage,
    setPageSize,
    setTotalItems,
    goToPage,
    nextPage,
    previousPage,
    reset,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

export default usePagination;
