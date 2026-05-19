"use client";
import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Componente reutilizable de paginación
 * @param {number} currentPage - Página actual (base 1)
 * @param {number} totalPages - Total de páginas
 * @param {number} totalCount - Total de elementos
 * @param {number} itemsPerPage - Elementos por página
 * @param {function} onPageChange - Callback cuando cambia la página
 * @param {function} onPreviousPage - Callback para página anterior
 * @param {function} onNextPage - Callback para página siguiente
 * @param {string} itemName - Nombre del item en plural (ej: "movimientos", "productos")
 */
const Pagination = ({
    currentPage = 1,
    totalPages = 1,
    totalCount = 0,
    itemsPerPage = 5,
    onPageChange,
    onPreviousPage,
    onNextPage,
    itemName = "elementos"
}) => {
    // Calcular páginas a mostrar (máximo 5 botones)
    const getPageNumbers = () => {
        const pages = [];
        
        if (totalPages <= 5) {
            // Si hay 5 páginas o menos, mostrar todas
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Si hay más de 5 páginas
            if (currentPage <= 3) {
                // Mostrar: 1 2 3 4 ... último
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Mostrar: 1 ... antepenúltimo penúltimo último
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                // Mostrar: 1 ... actual-1 actual actual+1 ... último
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        
        return pages;
    };

    const handlePreviousClick = () => {
        if (currentPage > 1 && onPreviousPage) {
            onPreviousPage();
        }
    };

    const handleNextClick = () => {
        if (currentPage < totalPages && onNextPage) {
            onNextPage();
        }
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== '...' && onPageChange) {
            onPageChange(pageNumber);
        }
    };

    // No mostrar paginación si solo hay una página o menos
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
                {/* Paginación Mobile */}
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={handlePreviousClick}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                            currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                    >
                        <FaChevronLeft className="mr-2" />
                        Anterior
                    </button>
                    <button
                        onClick={handleNextClick}
                        disabled={currentPage === totalPages}
                        className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                            currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                    >
                        Siguiente
                        <FaChevronRight className="ml-2" />
                    </button>
                </div>

                {/* Paginación Desktop */}
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Mostrando{' '}
                            <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalCount)}</span> de{' '}
                            <span className="font-medium">{totalCount}</span> {itemName}
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={handlePreviousClick}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                                    currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <span className="sr-only">Anterior</span>
                                <FaChevronLeft className="h-5 w-5" />
                            </button>
                            
                            {getPageNumbers().map((pageNumber, index) => (
                                pageNumber === '...' ? (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageClick(pageNumber)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                            currentPage === pageNumber
                                                ? 'z-10 bg-[#18c29c] border-[#18c29c] text-white'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                )
                            ))}
                            
                            <button
                                onClick={handleNextClick}
                                disabled={currentPage === totalPages}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                                    currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <span className="sr-only">Siguiente</span>
                                <FaChevronRight className="h-5 w-5" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
