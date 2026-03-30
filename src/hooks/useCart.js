"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import useEcommerceService from '@/services/ecommerceService';

// Crear el contexto
const CartContext = createContext();

// Proveedor del contexto
export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const ecommerceService = useEcommerceService();
    
    // Cargar carrito desde localStorage cuando se inicia
    useEffect(() => {
        try {
            const storedCart = localStorage.getItem('cart');
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
        } catch (error) {
            console.error("Error al cargar el carrito desde localStorage:", error);
        }
    }, []);
    
    // Guardar carrito en localStorage cuando cambia
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            console.error("Error al guardar el carrito en localStorage:", error);
        }
    }, [cart]);
    
    // Función para añadir un producto al carrito
    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item => 
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };
    
    // Función para actualizar la cantidad de un producto
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(prevCart => 
                prevCart.map(item => 
                    item.id === productId 
                        ? { ...item, quantity: newQuantity } 
                        : item
                )
            );
        }
    };
    
    // Función para eliminar un producto del carrito
    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };
    
    // Función para vaciar el carrito
    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cart');
    };
    
    // Función para calcular el precio total
    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };
    
    // Función para calcular el número total de items
    const getTotalCartItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    // Función para crear usuario, customer y procesar el checkout completo
    const createUserForCustomerAndLogIn = async (userData) => {
        try {
            const result = await ecommerceService.createUserForCustomerAndLogIn(userData);
            return result;
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        }
    };

    // Función para crear customer
    const createCustomer = async (customerData) => {
        try {
            const customer = await ecommerceService.createCustomer(customerData);
            return customer;
        } catch (error) {
            console.error('Error al crear customer:', error);
            throw error;
        }
    };

    // Función completa para procesar checkout con usuario autenticado
    const processCheckoutWithUser = async (formData) => {
        try {
            // Usar la función completa que maneja todo el flujo
            const result = await ecommerceService.completeCheckout(formData, cart);
            
            // Limpiar carrito local después del checkout exitoso
            clearCart();
            localStorage.removeItem('cartTimestamp');
            
            return result;
        } catch (error) {
            console.error('Error al procesar checkout:', error);
            throw error;
        }
    };
    
    // Valor que se expone en el contexto
    const value = {
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalCartItems,
        createUserForCustomerAndLogIn,
        createCustomer,
        processCheckoutWithUser
    };
    
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook personalizado para usar el contexto
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
}

export default CartContext;