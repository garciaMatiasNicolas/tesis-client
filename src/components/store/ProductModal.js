import React from 'react';

const ProductModal = ({ product, isOpen, onClose, onAddToCart, theme, isDarkMode, viewOnly }) => {
    if (!isOpen || !product) return null;

    const isOutOfStock = product.stock === false;
    
    // Get first available image from multiple sources
    const productImage = product.images?.[0] || product.image_1 || product.image || null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay con blur */}
            <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-fadeIn"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div 
                    className="relative rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
                    style={{
                        backgroundColor: isDarkMode ? theme.background.dark.card : theme.background.light.card,
                        borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main,
                        border: '1px solid'
                    }}
                >
                    {/* Header con gradiente */}
                    <div 
                        className="relative px-6 py-5 overflow-hidden"
                        style={{ 
                            background: `linear-gradient(135deg, ${theme.primary.main}15 0%, ${theme.primary.dark}25 100%)`,
                            borderBottom: `1px solid ${isDarkMode ? theme.border.dark.main : theme.border.light.main}`
                        }}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg" style={{backgroundColor: isDarkMode ? theme.primary.light : theme.primary.light}}>
                                    <svg className="w-6 h-6" style={{color: theme.primary.main}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h2 
                                    className="text-2xl font-bold"
                                    style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}
                                >
                                    Detalles del Producto
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:scale-110 transition-all"
                                style={{
                                    backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated,
                                    color: isDarkMode ? theme.text.dark.secondary : theme.text.light.secondary
                                }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Contenido con scroll */}
                    <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6" style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: `${theme.primary.main} ${theme.background.dark.elevated}`
                    }}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Columna Izquierda - Imagen */}
                            <div className="space-y-4">
                                {/* Imagen Principal */}
                                <div 
                                    className="relative rounded-xl overflow-hidden shadow-lg group"
                                    style={{
                                        backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated,
                                        aspectRatio: '1/1'
                                    }}
                                >
                                    {productImage ? (
                                        <img
                                            src={productImage}
                                            alt={product.description}
                                            className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                                        />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center ${isOutOfStock ? 'grayscale opacity-60' : ''}`}>
                                            <svg
                                                className="w-32 h-32"
                                                style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    
                                    {/* Badge de categoría */}
                                    {product.category && (
                                        <div className="absolute top-4 left-4">
                                            <span 
                                                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white shadow-lg backdrop-blur-sm"
                                                style={{ background: theme.primary.gradient }}
                                            >
                                                {product.category.name}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* Badge de Sin Stock */}
                                    {isOutOfStock && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
                                            <div className="text-center">
                                                <div className="bg-red-600 text-white text-xl font-bold px-8 py-4 rounded-xl shadow-2xl mb-2">
                                                    SIN STOCK
                                                </div>
                                                <p className="text-white text-sm">Producto no disponible</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Info rápida */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div 
                                        className="p-3 rounded-lg text-center"
                                        style={{
                                            backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated,
                                            border: `1px solid ${isDarkMode ? theme.border.dark.light : theme.border.light.light}`
                                        }}
                                    >
                                        <p className="text-xs mb-1" style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>
                                            SKU
                                        </p>
                                        <p className="font-bold text-sm" style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}>
                                            {product.sku}
                                        </p>
                                    </div>
                                    <div 
                                        className="p-3 rounded-lg text-center"
                                        style={{
                                            backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated,
                                            border: `1px solid ${isDarkMode ? theme.border.dark.light : theme.border.light.light}`
                                        }}
                                    >
                                        <p className="text-xs mb-1" style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>
                                            Unidad
                                        </p>
                                        <p className="font-bold text-sm" style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}>
                                            {product.storage_unit || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Columna Derecha - Información */}
                            <div className="space-y-6">
                                {/* Título */}
                                <div>
                                    <h1 
                                        className="text-3xl font-bold mb-3 leading-tight"
                                        style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}
                                    >
                                        {product.description}
                                    </h1>
                                    {product.subcategory && (
                                        <span 
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                                            style={{
                                                backgroundColor: isDarkMode ? theme.secondary.light : theme.secondary.light,
                                                color: isDarkMode ? theme.text.dark.accent : theme.text.light.accent
                                            }}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            {product.subcategory.name}
                                        </span>
                                    )}
                                </div>

                                {/* Precio Destacado */}
                                <div 
                                    className="p-6 rounded-xl relative overflow-hidden"
                                    style={{
                                        background: `linear-gradient(135deg, ${theme.primary.light} 0%, ${theme.primary.main}20 100%)`,
                                        border: `2px solid ${theme.primary.main}40`
                                    }}
                                >
                                    <div className="flex items-end gap-2 mb-2">
                                        <span 
                                            className="text-5xl font-black"
                                            style={{ 
                                                background: theme.primary.gradient, 
                                                WebkitBackgroundClip: 'text', 
                                                WebkitTextFillColor: 'transparent' 
                                            }}
                                        >
                                            ${product.price}
                                        </span>
                                    </div>
                                    <p className="text-xs" style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>
                                        Precio de venta • Costo: ${product.cost_price}
                                    </p>
                                </div>

                                {/* Información del Proveedor */}
                                {product.supplier && (
                                    <div 
                                        className="p-4 rounded-xl flex items-center gap-3"
                                        style={{
                                            backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated,
                                            border: `1px solid ${isDarkMode ? theme.border.dark.main : theme.border.light.main}`
                                        }}
                                    >
                                        <div className="p-2.5 rounded-lg" style={{backgroundColor: isDarkMode ? theme.primary.light : theme.primary.light}}>
                                            <svg className="w-5 h-5" style={{color: theme.primary.main}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs mb-0.5" style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>
                                                Proveedor
                                            </p>
                                            <p className="font-semibold" style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}>
                                                {product.supplier.name}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Dimensiones */}
                                {(product.weight || product.height || product.depth || product.width) && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            Dimensiones y Peso
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {product.weight && (
                                                <div 
                                                    className="p-3 rounded-lg"
                                                    style={{
                                                        backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated,
                                                        border: `1px solid ${isDarkMode ? theme.border.dark.light : theme.border.light.light}`
                                                    }}
                                                >
                                                    <p className="text-xs mb-1" style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>Peso</p>
                                                    <p className="font-bold" style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}>{product.weight} kg</p>
                                                </div>
                                            )}
                                            {product.height && (
                                                <div 
                                                    className="p-3 rounded-lg"
                                                    style={{
                                                        backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated,
                                                        border: `1px solid ${isDarkMode ? theme.border.dark.light : theme.border.light.light}`
                                                    }}
                                                >
                                                    <p className="text-xs mb-1" style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>Alto</p>
                                                    <p className="font-bold" style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}>{product.height} cm</p>
                                                </div>
                                            )}
                                            {product.width && (
                                                <div 
                                                    className="p-3 rounded-lg"
                                                    style={{
                                                        backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated,
                                                        border: `1px solid ${isDarkMode ? theme.border.dark.light : theme.border.light.light}`
                                                    }}
                                                >
                                                    <p className="text-xs mb-1" style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>Ancho</p>
                                                    <p className="font-bold" style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}>{product.width} cm</p>
                                                </div>
                                            )}
                                            {product.depth && (
                                                <div 
                                                    className="p-3 rounded-lg"
                                                    style={{
                                                        backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated,
                                                        border: `1px solid ${isDarkMode ? theme.border.dark.light : theme.border.light.light}`
                                                    }}
                                                >
                                                    <p className="text-xs mb-1" style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>Profundidad</p>
                                                    <p className="font-bold" style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}>{product.depth} cm</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Fechas */}
                                <div 
                                    className="p-4 rounded-lg flex items-center justify-between text-xs"
                                    style={{
                                        backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated,
                                        border: `1px solid ${isDarkMode ? theme.border.dark.light : theme.border.light.light}`
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <span style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>Creado: </span>
                                            <span className="font-medium" style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}>
                                                {new Date(product.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-4 w-px" style={{backgroundColor: isDarkMode ? theme.border.dark.main : theme.border.light.main}}></div>
                                    <div>
                                        <span style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>Actualizado: </span>
                                        <span className="font-medium" style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}>
                                            {new Date(product.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Botón de acción */}
                                {!viewOnly && (
                                    <div className="pt-2">
                                        {isOutOfStock ? (
                                            <div 
                                                className="w-full py-4 px-6 rounded-xl font-semibold text-center flex items-center justify-center gap-2"
                                                style={{
                                                    backgroundColor: `${theme.accent.error}20`,
                                                    border: `2px solid ${theme.accent.error}`,
                                                    color: theme.accent.error
                                                }}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Producto sin stock disponible
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    onAddToCart(product);
                                                    onClose();
                                                }}
                                                className="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3 text-white"
                                                style={{ 
                                                    background: theme.primary.gradient,
                                                    boxShadow: `0 10px 30px ${theme.primary.main}40`
                                                }}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span className="text-lg">Agregar +</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ProductModal;