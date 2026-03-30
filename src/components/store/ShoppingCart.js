import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';

const ShoppingCart = ({ isOpen, onClose, cartItems = [], onUpdateQuantity, onRemoveItem, onClearCart, isCheckoutPage = false }) => {
    const router = useRouter();
    const { isDarkMode, theme } = useTheme();
    const [isProcessing, setIsProcessing] = useState(false);

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const handleCheckout = () => {
        setIsProcessing(true);
        onClose();
        router.push('/store/checkout');
        setIsProcessing(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden transition-all duration-500 ease-in-out">
        {/* Overlay */}
        <div 
            className="fixed inset-0 backdrop-blur-md bg-opacity-50 transition-all duration-500 ease-in-out"
            onClick={onClose}
        ></div>

        {/* Panel lateral */}
        <div className="fixed right-0 top-0 h-full w-full max-w-md shadow-xl transform transition-all duration-500 ease-in-out animate-slide-in"
            style={{
                backgroundColor: isDarkMode 
                    ? theme?.background?.dark?.card || '#1e1e1e' 
                    : theme?.background?.light?.card || '#ffffff',
                color: isDarkMode 
                    ? theme?.text?.dark?.primary || '#ffffff' 
                    : theme?.text?.light?.primary || '#252525'
            }}
        >
            <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b transition-colors duration-300"
                style={{
                    borderColor: isDarkMode 
                        ? theme?.border?.dark?.main || '#3a3a3a' 
                        : theme?.border?.light?.main || '#e0e0e0'
                }}
            >
                <h2 className="text-lg font-semibold"
                    style={{
                        color: isDarkMode 
                            ? theme?.text?.dark?.primary || '#ffffff' 
                            : theme?.text?.light?.primary || '#252525'
                    }}
                >
                    Carrito de Compras ({getTotalItems()})
                </h2>
                <button
                    onClick={onClose}
                    className="hover:opacity-70 transition-opacity cursor-pointer"
                    style={{
                        color: isDarkMode 
                            ? theme?.text?.dark?.secondary || '#e0e0e0' 
                            : theme?.text?.light?.secondary || '#3e3e3e'
                    }}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6">
                {cartItems.length === 0 ? (
                <div className="text-center py-12">
                    <svg
                        className="mx-auto h-16 w-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{
                            color: isDarkMode 
                                ? theme?.text?.dark?.secondary || '#e0e0e0' 
                                : theme?.text?.light?.secondary || '#3e3e3e'
                        }}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-4 4m4-4v6a1 1 0 001 1h1m0 0h8a1 1 0 001-1v-1a1 1 0 00-1-1h-8"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium"
                        style={{
                            color: isDarkMode 
                                ? theme?.text?.dark?.primary || '#ffffff' 
                                : theme?.text?.light?.primary || '#252525'
                        }}
                    >
                        Tu carrito está vacío
                    </h3>
                    <p className="mt-2 text-sm"
                        style={{
                            color: isDarkMode 
                                ? theme?.text?.dark?.secondary || '#e0e0e0' 
                                : theme?.text?.light?.secondary || '#3e3e3e'
                        }}
                    >
                        Agrega algunos productos para comenzar tu compra.
                    </p>
                </div>
                ) : (
                <div className="space-y-4">
                    {cartItems.map((item) => (
                    <div 
                        key={item.id} 
                        className="flex items-center space-x-4 rounded-lg p-4"
                        style={{
                            backgroundColor: isDarkMode 
                                ? theme?.background?.dark?.elevated || '#252525' 
                                : theme?.background?.light?.elevated || '#f5f0e8'
                        }}
                    >
                        {/* Imagen del producto */}
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border"
                            style={{
                                borderColor: isDarkMode 
                                    ? theme?.border?.dark?.light || '#9a334d30' 
                                    : theme?.border?.light?.light || '#9a334d20'
                            }}
                        >
                        {item.image ? (
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = "https://placehold.co/100x100?text=No+Image";
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center"
                                style={{
                                    backgroundColor: isDarkMode 
                                        ? theme?.background?.dark?.card || '#1e1e1e' 
                                        : theme?.background?.light?.card || '#ffffff'
                                }}
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{
                                        color: isDarkMode 
                                            ? theme?.text?.dark?.secondary || '#e0e0e0' 
                                            : theme?.text?.light?.secondary || '#3e3e3e'
                                    }}
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

                        {/* Información del producto */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate"
                                style={{
                                    color: isDarkMode 
                                        ? theme?.text?.dark?.primary || '#ffffff' 
                                        : theme?.text?.light?.primary || '#252525'
                                }}
                            >
                                {item.name}
                            </h4>
                            {item.sku && (
                                <p className="text-sm"
                                    style={{
                                        color: isDarkMode 
                                            ? theme?.text?.dark?.secondary || '#e0e0e0' 
                                            : theme?.text?.light?.secondary || '#3e3e3e'
                                    }}
                                >
                                    SKU: {item.sku}
                                </p>
                            )}
                            <p className="text-sm font-medium"
                                style={{
                                    color: isDarkMode 
                                        ? theme?.accent?.dark?.main || '#7a2639' 
                                        : theme?.accent?.light?.main || '#9a334d'
                                }}
                            >
                                ${item.price}
                            </p>
                        </div>

                        {/* Controles de cantidad */}
                        <div className="flex items-center space-x-2">
                            <button
                                disabled={isProcessing || isCheckoutPage}
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: isDarkMode 
                                        ? theme?.background?.dark?.card || '#1e1e1e' 
                                        : theme?.background?.light?.card || '#ffffff',
                                    color: isDarkMode 
                                        ? theme?.text?.dark?.primary || '#ffffff' 
                                        : theme?.text?.light?.primary || '#252525'
                                }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                            <span className="w-8 text-center text-sm font-medium"
                                style={{
                                    color: isDarkMode 
                                        ? theme?.text?.dark?.primary || '#ffffff' 
                                        : theme?.text?.light?.primary || '#252525'
                                }}
                            >
                                {item.quantity}
                            </span>
                            <button
                                disabled={isProcessing || isCheckoutPage}
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: isDarkMode 
                                        ? theme?.background?.dark?.card || '#1e1e1e' 
                                        : theme?.background?.light?.card || '#ffffff',
                                    color: isDarkMode 
                                        ? theme?.text?.dark?.primary || '#ffffff' 
                                        : theme?.text?.light?.primary || '#252525'
                                }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                        </div>

                        {/* Botón eliminar */}
                        <button
                            onClick={() => onRemoveItem(item.id)}
                            disabled={isProcessing || isCheckoutPage}
                            className="transition-colors cursor-pointer hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                color: isDarkMode 
                                    ? theme?.error?.dark || '#e74c3c' 
                                    : theme?.error?.light || '#c0392b'
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                    ))}
                </div>
                )}
            </div>

            {/* Footer con total y acciones */}
            {cartItems.length > 0 && (
                <div className="border-t p-6 space-y-4" 
                    style={{
                        backgroundColor: isDarkMode 
                            ? theme?.background?.dark?.elevated || '#252525' 
                            : theme?.background?.light?.elevated || '#f5f0e8',
                    }}
                >
                {/* Total */}
                <div className="flex justify-between items-center text-lg font-semibold"
                    style={{ 
                        color: isDarkMode 
                            ? theme?.text?.dark?.primary || '#ffffff' 
                            : theme?.text?.light?.primary || '#252525'
                    }}
                >
                    <span>Total:</span>
                    <span style={{ 
                        background: theme?.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)', 
                        WebkitBackgroundClip: 'text', 
                        WebkitTextFillColor: 'transparent' 
                    }}>${getTotalPrice()}</span>
                </div>

                {/* Botones de acción */}
                {!isCheckoutPage && 
                    <div className="space-y-2">
                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="w-full py-3 px-4 rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            style={{ 
                                background: theme?.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)',
                                opacity: isProcessing ? 0.7 : 1,
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                color: '#ffffff'
                            }}
                        >
                            {isProcessing ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando...
                                </div>
                            ) : (
                                'Finalizar Compra'
                            )}
                        </button>
                        
                        <button
                            onClick={onClearCart}
                            disabled={isProcessing || isCheckoutPage}
                            className="w-full py-2 px-4 border rounded-lg transition-all duration-300 cursor-pointer hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ 
                                borderColor: isDarkMode 
                                    ? theme?.border?.dark?.main || '#3a3a3a' 
                                    : theme?.border?.light?.main || '#e0e0e0',
                                backgroundColor: isDarkMode 
                                    ? theme?.background?.dark?.card || '#1e1e1e' 
                                    : theme?.background?.light?.card || '#ffffff',
                                color: isDarkMode 
                                    ? theme?.text?.dark?.secondary || '#e0e0e0' 
                                    : theme?.text?.light?.secondary || '#3e3e3e'
                            }}
                        >
                            Vaciar Carrito
                        </button>
                    </div>
                }
                
                </div>
            )}
            </div>
        </div>
        </div>
    );
};

export default ShoppingCart;