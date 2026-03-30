import React from 'react';

const ProductCard = ({ product, onAddToCart, onViewDetails, isDarkMode = true, theme }) => {
    return (
        <div style={{backgroundColor: isDarkMode ? theme.background.dark.card : theme.background.light.card}} className="rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col border border-[#9a334d30]">
        {/* Imagen del producto */}
        <div className="relative h-48 md:h-56 overflow-hidden" style={{backgroundColor: isDarkMode ? theme.background.dark.card : theme.background.light.card}}>
            {product.image ? (
            <img
                src={product.image}
                alt={product.description}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                    console.error('Error al cargar imagen:', product.image);
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
                }}
            />
            ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#252525]">
                <svg
                className="w-16 h-16 text-[#a0a0a0]"
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
            {/* Badge de categoría */}
            {product.category && (
            <div className="absolute top-2 left-2">
                <span style={{ background: theme.primary.gradient }} className="text-white text-xs px-2 py-1 rounded-full shadow-lg">
                {product.category.name}
                </span>
            </div>
            )}
        </div>

        {/* Contenido del producto - flex-grow para empujar botones al final */}
        <div className="p-4 flex flex-col flex-grow">
            {/* SKU */}
            <p className="text-xs text-[#a0a0a0] mb-1">SKU: {product.sku}</p>
            
            {/* Descripción */}
            <h3 style={{color: isDarkMode ? "#FFFF" : "black"}} className="font-semibold mb-2 line-clamp-2 hover:text-[#9a334d] cursor-pointer transition-colors duration-200"
                onClick={() => onViewDetails(product)}>
            {product.description}
            </h3>

            {/* Subcategoría */}
            {product.subcategory && (
                <p style={{color: isDarkMode ? theme.text.dark.accent : theme.text.light.accent}} className="text-sm mb-2">{product.subcategory.name}</p>
            )}

            {/* Proveedor */}
            {product.supplier && (
            <p className="text-xs text-[#a0a0a0] mb-3">
                Proveedor: {product.supplier.name}
            </p>
            )}

            {/* Precio */}
            <div className="flex items-center justify-between mb-4 flex-grow">
            <div>
                <span style={{color: isDarkMode ? "#ffff" : theme.text.light.accent}} className="text-2xl font-bold">
                ${product.price}
                </span>
            </div>
            </div>

            {/* Botones de acción - siempre al final */}
            <div className="flex gap-2 mt-auto">
            <button
                onClick={() => onAddToCart(product)}
                style={{ background: theme.primary.gradient, cursor: "pointer" }}
                className="flex-1 text-white py-2 px-4 rounded-md transition-all duration-200 text-sm font-medium transform hover:scale-105 hover:shadow-lg shadow-[#9a334d50]"
            >
                Agregar al Carrito
            </button>
            <button
                onClick={() => onViewDetails(product)}
                style={{ background: theme.primary.gradient, cursor: "pointer" }}
                className="px-3 py-2 rounded-md transition-colors duration-200 "
            >
                <svg
                    className="text-white w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
                </svg>
            </button>
            </div>
        </div>
        </div>
    );
};

export default ProductCard;