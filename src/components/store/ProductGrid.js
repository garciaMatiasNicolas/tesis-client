import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ 
    products = [], 
    loading = false, 
    onAddToCart, 
    onViewDetails,
    currentPage,
    totalPages,
    onPageChange,
    isDarkMode,
    theme 
}) => {
    if (loading) {
        return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
            <div key={index} className="backdrop-blur-sm rounded-lg shadow-md overflow-hidden animate-pulse border border-[#9a334d30] bg-[#1e1e1e]">
                <div className="h-48 md:h-56 bg-[#9a334d20]"></div>
                <div className="p-4">
                <div className="h-4 bg-[#9a334d20] rounded mb-2"></div>
                <div className="h-6 bg-[#9a334d20] rounded mb-2"></div>
                <div className="h-4 bg-[#9a334d20] rounded mb-3"></div>
                <div className="h-8 bg-[#9a334d20] rounded mb-3"></div>
                <div className="flex gap-2">
                    <div className="flex-1 h-8 bg-[#9a334d20] rounded"></div>
                    <div className="w-10 h-8 bg-[#9a334d20] rounded"></div>
                </div>
                </div>
            </div>
            ))}
        </div>
        );
    }

    if (products.length === 0) {
        return (
        <div style={{borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main}} className="text-center py-12 backdrop-blur-sm rounded-lg border">
            <svg
            className="mx-auto h-24 w-24 opacity-70"
            fill="none"
            style={{color: isDarkMode ? theme.text.dark.accent : theme.text.light.accent}}
            stroke="currentColor"
            viewBox="0 0 24 24"
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0H4m16 0l-2-2m2 2l-2 2M4 13l2-2m-2 2l2 2"
            />
            </svg>
            <h3 className="mt-4 text-lg font-medium" style={{color: isDarkMode ? theme.text.dark.primary :  theme.text.light.primary}}>No hay productos</h3>
            <p className="mt-2 text-sm opacity-70 " style={{color: isDarkMode ? theme.text.dark.secondary :  theme.text.light.secondary}}>
            No se encontraron productos que coincidan con los filtros seleccionados.
            </p>
        </div>
        );
    }

    return (
        <div>
        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onViewDetails={onViewDetails}
                    isDarkMode={isDarkMode}
                    theme={theme}
                />
            ))}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 backdrop-blur-sm rounded-lg p-4 border border-[#9a334d30] bg-[#1e1e1e]">
            {/* Botón anterior */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
                px-3 py-2 rounded-md text-sm font-medium transition-all
                ${currentPage === 1
                    ? 'bg-[#252525] text-gray-500 cursor-not-allowed'
                    : 'bg-[#1e1e1e] text-[#9a334d] border border-[#9a334d50] bg-[#9a334d20] hover:bg-[#9a334d30]'
                }
                `}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Números de página */}
            {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                const isActive = pageNumber === currentPage;
                
                // Mostrar solo páginas relevantes para evitar demasiados números
                const shouldShow = 
                pageNumber === 1 || 
                pageNumber === totalPages || 
                (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2);

                if (!shouldShow) {
                // Mostrar puntos suspensivos
                if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                    return (
                    <span key={pageNumber} className="px-3 py-2 text-gray-500">
                        ...
                    </span>
                    );
                }
                return null;
                }

                return (
                <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    style={isActive ? { background: theme.primary.gradient } : {}}
                    className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-all
                    ${isActive
                        ? 'text-white shadow-md transform scale-105'
                        : 'bg-[#1e1e1e] text-[#9a334d] border border-[#9a334d50] bg-[#9a334d20] hover:bg-[#9a334d30]'
                    }
                    `}
                >
                    {pageNumber}
                </button>
                );
            })}

            {/* Botón siguiente */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`
                px-3 py-2 rounded-md text-sm font-medium transition-all
                ${currentPage === totalPages
                    ? 'bg-[#252525] text-gray-500 cursor-not-allowed'
                    : 'bg-[#1e1e1e] text-[#9a334d] border border-[#9a334d50] bg-[#9a334d20] hover:bg-[#9a334d30]'
                }
                `}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
            </div>
        )}

        {/* Información de resultados */}
        <div style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}} className={`text-center mt-4 text-sm backdrop-blur-sm rounded-lg p-2 border border-[${isDarkMode ? theme.border.dark.main : theme.border.light.main}]`}>
            Mostrando {((currentPage - 1) * 12) + 1} - {Math.min(currentPage * 12, products.length)} de {products.length} productos
        </div>
        </div>
    );
};

export default ProductGrid;