import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ 
    products = [], 
    loading = false, 
    onAddToCart,
    hasMore = false,
    onLoadMore,
    totalProducts = 0,
    isDarkMode,
    theme 
}) => {
    if (loading) {
        return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
            <div key={index} className="backdrop-blur-sm rounded-lg shadow-md overflow-hidden animate-pulse border" style={{borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main, backgroundColor: isDarkMode ? theme.background.dark.card : theme.background.light.card}}>
                <div className="h-48 md:h-56" style={{backgroundColor: isDarkMode ? theme.primary.light : theme.primary.light}}></div>
                <div className="p-4">
                <div className="h-4 rounded mb-2" style={{backgroundColor: isDarkMode ? theme.primary.light : theme.primary.light}}></div>
                <div className="h-6 rounded mb-2" style={{backgroundColor: isDarkMode ? theme.primary.light : theme.primary.light}}></div>
                <div className="h-4 rounded mb-3" style={{backgroundColor: isDarkMode ? theme.primary.light : theme.primary.light}}></div>
                <div className="h-8 rounded mb-3" style={{backgroundColor: isDarkMode ? theme.primary.light : theme.primary.light}}></div>
                <div className="flex gap-2">
                    <div className="flex-1 h-8 rounded" style={{backgroundColor: isDarkMode ? theme.primary.light : theme.primary.light}}></div>
                    <div className="w-10 h-8 rounded" style={{backgroundColor: isDarkMode ? theme.primary.light : theme.primary.light}}></div>
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
                    isDarkMode={isDarkMode}
                    theme={theme}
                />
            ))}
        </div>

        {/* Botón Cargar más */}
        {hasMore && (
            <div className="flex flex-col items-center gap-3 mt-8">
                <button
                    onClick={onLoadMore}
                    disabled={loading}
                    className="px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                    style={{
                        background: loading ? (isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated) : theme.primary.gradient,
                        color: '#ffffff',
                    }}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Cargando...
                        </span>
                    ) : (
                        'Cargar más productos'
                    )}
                </button>
                
                {/* Información de resultados */}
                <p className="text-sm" style={{color: isDarkMode ? theme.text.dark.secondary : theme.text.light.secondary}}>
                    Mostrando {products.length} de {totalProducts} productos
                </p>
            </div>
        )}
        
        {/* Mensaje cuando se muestran todos los productos */}
        {!hasMore && products.length > 0 && (
            <div className="text-center mt-8">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg backdrop-blur-sm border"
                    style={{
                        borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main,
                        backgroundColor: isDarkMode ? theme.background.dark.card : theme.background.light.card,
                        color: isDarkMode ? theme.text.dark.secondary : theme.text.light.secondary
                    }}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">Has visto todos los productos ({totalProducts})</span>
                </div>
            </div>
        )}
        </div>
    );
};

export default ProductGrid;