import React from 'react';

const ProductModal = ({ product, isOpen, onClose, onAddToCart, theme, isDarkMode }) => {
    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Overlay con blur */}
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
            onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-[#1e1e1e] border border-[#9a334d50] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#9a334d50] bg-[#9a334d20] rounded-t-xl">
                <h2 style={{ background: theme.primary.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="text-2xl font-bold">Detalles del Producto</h2>
                <button
                onClick={onClose}
                className="text-[#e0e0e0] opacity-60 hover:opacity-100 transition-colors p-1 rounded-full hover:bg-[#9a334d30]"
                >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </div>

            {/* Contenido */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Imagen */}
                <div className="space-y-4">
                    <div className="aspect-square bg-[#252525] rounded-lg overflow-hidden">
                    {product.image ? (
                        <img
                        src={product.image}
                        alt={product.description}
                        className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                        <svg
                            className="w-24 h-24 text-[#a0a0a0]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        </div>
                    )}
                    </div>
                </div>

                {/* Información del producto */}
                <div className="space-y-6">
                    {/* Título y SKU */}
                    <div>
                    <h1 className="text-3xl font-bold text-[#e0e0e0] mb-2">
                        {product.description}
                    </h1>
                    <p className="text-lg text-[#a0a0a0]">SKU: {product.sku}</p>
                    </div>

                    {/* Precio */}
                    <div className="bg-[#9a334d20] rounded-lg p-4 border border-[#9a334d50]">
                    <span style={{ background: theme.primary.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="text-4xl font-bold">
                        ${product.price}
                    </span>
                    </div>

                    {/* Detalles */}
                    <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#e0e0e0]">Información del Producto</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {product.category && (
                        <div className="bg-[#9a334d20] p-3 rounded-lg border border-[#9a334d50]">
                            <span className="font-medium text-[#e6b899]">Categoría:</span>
                            <p className="text-[#e0e0e0]">{product.category.name}</p>
                        </div>
                        )}

                        {product.subcategory && (
                        <div className="bg-[#7a263920] p-3 rounded-lg border border-[#7a263950]">
                            <span className="font-medium text-[#e6b899]">Subcategoría:</span>
                            <p className="text-[#e0e0e0]">{product.subcategory.name}</p>
                        </div>
                        )}

                        {product.supplier && (
                        <div className="bg-[#a3324020] p-3 rounded-lg border border-[#a3324050]">
                            <span className="font-medium text-[#e6b899]">Proveedor:</span>
                            <p className="text-[#e0e0e0]">{product.supplier.name}</p>
                        </div>
                        )}

                        <div className="bg-[#8c2d4020] p-3 rounded-lg border border-[#8c2d4050]">
                        <span className="font-medium text-[#e6b899]">Precio de costo:</span>
                        <p className="text-[#e0e0e0]">${product.cost_price}</p>
                        </div>

                        <div className="bg-[#d4af3720] p-3 rounded-lg border border-[#d4af3750]">
                        <span className="font-medium text-[#e6b899]">Unidad de almacenamiento:</span>
                        <p className="text-[#e0e0e0]">{product.storage_unit}</p>
                        </div>
                    </div>

                    {/* Dimensiones */}
                    {(product.weight || product.height || product.depth || product.width) && (
                        <div>
                        <h4 className="font-medium text-[#e6b899] mb-2">Dimensiones:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm bg-[#252525] p-3 rounded-lg border border-[#9a334d30]">
                            {product.weight && (
                            <div>
                                <span className="text-[#a0a0a0]">Peso:</span>
                                <p className="font-medium text-[#e0e0e0]">{product.weight} kg</p>
                            </div>
                            )}
                            {product.height && (
                            <div>
                                <span className="text-[#a0a0a0]">Alto:</span>
                                <p className="font-medium text-[#e0e0e0]">{product.height} cm</p>
                            </div>
                            )}
                            {product.depth && (
                            <div>
                                <span className="text-[#a0a0a0]">Profundidad:</span>
                                <p className="font-medium text-[#e0e0e0]">{product.depth} cm</p>
                            </div>
                            )}
                            {product.width && (
                            <div>
                                <span className="text-[#a0a0a0]">Ancho:</span>
                                <p className="font-medium text-[#e0e0e0]">{product.width} cm</p>
                            </div>
                            )}
                        </div>
                        </div>
                    )}

                    {/* Fechas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-[#252525] p-3 rounded-lg border border-[#9a334d30]">
                        <div>
                        <span className="font-medium text-[#e6b899]">Creado:</span>
                        <p className="text-[#a0a0a0]">
                            {new Date(product.created_at).toLocaleDateString()}
                        </p>
                        </div>
                        <div>
                        <span className="font-medium text-[#e6b899]">Actualizado:</span>
                        <p className="text-[#a0a0a0]">
                            {new Date(product.updated_at).toLocaleDateString()}
                        </p>
                        </div>
                    </div>
                    </div>

                    {/* Botón de acción */}
                    <div className="pt-4">
                    <button
                        onClick={() => onAddToCart(product)}
                        style={{ background: theme.primary.gradient }}
                        className="w-full text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-[#9a334d50]"
                    >
                        Agregar al Carrito
                    </button>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
};

export default ProductModal;