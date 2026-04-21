"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/utils/formatData';

const ProductCard = ({ product, onAddToCart, isDarkMode = true, theme }) => {
    const router = useRouter();
    const isOutOfStock = product.stock === false;
    
    // Obtener la primera imagen disponible
    const productImage = product.images?.[0] || product.image_1 || product.image || null;

    const handleViewDetails = () => {
        router.push(`/store/product/${product.id}`);
    };
    
    return (
        <div style={{backgroundColor: isDarkMode ? theme.background.dark.card : theme.background.light.card}} className={`rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col`}>
        {/* Imagen del producto */}
        <div className="relative h-48 md:h-56 overflow-hidden bg-white" style={{backgroundColor: isDarkMode ? theme.background.dark.elevated : theme.background.light.elevated}}>
            {productImage ? (
            <img
                src={productImage}
                alt={product.description}
                className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                onError={(e) => {
                    console.error('Error al cargar imagen:', productImage);
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
                }}
            />
            ) : (
            <div className={`w-full h-full flex items-center justify-center ${isOutOfStock ? 'grayscale opacity-50' : ''}`} style={{backgroundColor: isDarkMode ? theme.background.dark.card : theme.background.light.card}}>
                <svg
                className="w-16 h-16"
                style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}
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
            
            {/* Badge de categoría - arriba a la izquierda */}
            {product.category && !isOutOfStock && (
            <div className="absolute top-2 left-2">
                <span style={{ background: theme.primary.gradient }} className="text-white text-xs px-2 py-1 rounded-full shadow-lg">
                {product.category.name}
                </span>
            </div>
            )}
            
            {/* Badge de Sin Stock - pequeño, abajo a la derecha */}
            {isOutOfStock && (
                <div className="absolute bottom-2 right-2">
                    <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg">
                        Sin Stock
                    </span>
                </div>
            )}
        </div>

        {/* Contenido del producto - flex-grow para empujar botones al final */}
        <div className="p-4 flex flex-col flex-grow">
            {/* SKU */}
            <p className="text-xs mb-1" style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>SKU: {product.sku}</p>
            
            {/* Descripción */}
            <h3 style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}} className="font-semibold mb-2 line-clamp-2 cursor-pointer transition-colors duration-200"
                onClick={handleViewDetails}>
            {product.description}
            </h3>

            {/* Subcategoría */}
            {product.subcategory && (
                <p style={{color: isDarkMode ? theme.text.dark.accent : theme.text.light.accent}} className="text-sm mb-2">{product.subcategory.name}</p>
            )}

            {/* Proveedor */}
            {product.supplier && (
            <p className="text-xs mb-3" style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}>
                Proveedor: {product.supplier.name}
            </p>
            )}

            {/* Precio */}
            <div className="flex items-center justify-between mb-4 flex-grow">
            <div>
                <span style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.accent}} className="text-2xl font-bold">
                {formatPrice(product.price)}
                </span>
            </div>
            </div>

            {/* Botones de acción - siempre al final */}
            <div className="flex gap-2 mt-auto">
            <button
                onClick={() => !isOutOfStock && onAddToCart(product)}
                disabled={isOutOfStock}
                style={{ 
                    background: isOutOfStock ? '#6b7280' : theme.primary.gradient, 
                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                    opacity: isOutOfStock ? 0.6 : 1
                }}
                className="flex-1 text-white py-2 px-4 rounded-md transition-all duration-200 text-sm font-medium transform hover:scale-105 hover:shadow-lg shadow disabled:hover:scale-100 disabled:hover:shadow-none"
            >
                {isOutOfStock ? 'Sin Stock' : 'Agregar +'}
            </button>
            <button
                onClick={handleViewDetails}
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