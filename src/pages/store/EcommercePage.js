"use client";
import React, { useState, useEffect, useCallback } from 'react';
import ProductFilters from '../../components/store/ProductFilters';
import ProductSort from '../../components/store/ProductSort';
import ProductGrid from '../../components/store/ProductGrid';
import ShoppingCart from '../../components/store/ShoppingCart';
import useEcommerceService from '@/services/ecommerceService';
import '../../themes/modeTransitions.css';
import StoreHeader from '@/components/store/StoreHeader';
import { useCart } from '@/hooks/useCart';
import { useStoreWithTheme } from '@/hooks/useStore';

const EcommercePage = () => {
    // Hooks personalizados - Usa el hook combinado para obtener store + theme
    const { 
        isDarkMode, 
        theme, 
        storeConfig, 
        storeActive, 
        loading: storeLoading,
        storeTheme 
    } = useStoreWithTheme();
    const { cart, addToCart, updateQuantity, removeFromCart, clearCart, getTotalPrice, getTotalCartItems } = useCart();
    
    // Estados principales
    const { getAllProducts, getCategories, getSubcategories, getSuppliers } = useEcommerceService();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    // Estados para filtros y ordenamiento
    const [filters, setFilters] = useState({
        categories: [],
        subcategories: [],
        suppliers: [],
        minPrice: '',
        maxPrice: '',
        search: ''
    });
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    // Estados para carrito
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Función para cargar las categorías, subcategorías y proveedores
    const loadInitialData = () => {
        getAllCategories();
        getAllSubcategories();
        getAllSuppliers();
    };

    useEffect(() => {
      console.log("Cart contents:", cart)
    }, [cart]);

    const getProducts = useCallback(async (searchFilters = {}) => {
        try {
            setLoading(true);
            const apiFilters = {
                page: currentPage,
                page_size: 12,
                ...searchFilters
            };

            // Convertir filtros del frontend al formato de la API
            if (filters.categories.length > 0) {
                apiFilters.category = filters.categories[0]; // Por ahora solo el primero
            }
            if (filters.subcategories.length > 0) {
                apiFilters.subcategory = filters.subcategories[0];
            }
            if (filters.search) {
                apiFilters.search = filters.search;
            }
            if (filters.minPrice) {
                apiFilters.min_price = filters.minPrice;
            }
            if (filters.maxPrice) {
                apiFilters.max_price = filters.maxPrice;
            }

            // Convertir ordenamiento
            if (sortBy && sortOrder) {
                if (sortBy === 'name' && sortOrder === 'asc') apiFilters.sort_by = 'name_asc';
                if (sortBy === 'name' && sortOrder === 'desc') apiFilters.sort_by = 'name_desc';
                if (sortBy === 'price' && sortOrder === 'asc') apiFilters.sort_by = 'price_asc';
                if (sortBy === 'price' && sortOrder === 'desc') apiFilters.sort_by = 'price_desc';
                if (sortBy === 'created_at') apiFilters.sort_by = 'newest';
            }

            const data = await getAllProducts(apiFilters);
            
            // La API devuelve datos paginados
            if (data.results) {
                setProducts(data.results);
                setTotalProducts(data.count);
                setTotalPages(Math.ceil(data.count / 12));
            } else {
                setProducts(data);
                setTotalProducts(data.length);
                setTotalPages(1);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching products:", error);
            setLoading(false);
        }
    }, [getAllProducts, currentPage, filters, sortBy, sortOrder]);

    const getAllCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const getAllSubcategories = async () => {
        try {
            const data = await getSubcategories();
            setSubcategories(data);
        } catch (error) {
            console.error("Error fetching subcategories:", error);
        }
    };

    const getAllSuppliers = async () => {
        try {
            const data = await getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };  
    
    // Cargar datos iniciales cuando la tienda esté activa
    useEffect(() => {
        if (storeActive === true) {
            loadInitialData();
        }
    }, [storeActive]);

    // Cargar productos cuando cambien los filtros, ordenamiento o página (solo si la tienda está activa)
    useEffect(() => {
        if (storeActive === true) {
            getProducts();
        }
    }, [filters, sortBy, sortOrder, currentPage, storeActive]);
    
    // Handlers
    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleSortChange = (field, order) => {
        setSortBy(field);
        setSortOrder(order);
        setCurrentPage(1);
    };

    // Si estamos verificando el estado de la tienda
    if (storeActive === null) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ 
                    backgroundColor: isDarkMode 
                        ? theme.background?.dark?.main || '#121212' 
                        : theme.background?.light?.main || '#f8f5f0'
                }}
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                        style={{ 
                            borderColor: isDarkMode 
                                ? theme.accent?.dark?.main || '#7a2639' 
                                : theme.accent?.light?.main || '#9a334d'
                        }}
                    ></div>
                    <p style={{ 
                        color: isDarkMode 
                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                            : theme.text?.light?.secondary || '#3e3e3e'
                    }}>
                        Verificando disponibilidad de la tienda...
                    </p>
                </div>
            </div>
        );
    }

    // Si la tienda no está activa, mostrar 404
    if (storeActive === false) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ 
                    backgroundColor: isDarkMode 
                        ? theme.background?.dark?.main || '#121212' 
                        : theme.background?.light?.main || '#f8f5f0'
                }}
            >
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="text-8xl font-bold opacity-30 mb-4"
                        style={{ 
                            color: isDarkMode 
                                ? theme.accent?.dark?.main || '#7a2639' 
                                : theme.accent?.light?.main || '#9a334d'
                        }}
                    >404</div>
                    <h1 className="text-2xl font-bold mb-4"
                        style={{ 
                            color: isDarkMode 
                                ? theme.text?.dark?.primary || '#ffffff' 
                                : theme.text?.light?.primary || '#252525'
                        }}
                    >Tienda no disponible</h1>
                    <p className="mb-6"
                        style={{ 
                            color: isDarkMode 
                                ? theme.text?.dark?.secondary || '#e0e0e0' 
                                : theme.text?.light?.secondary || '#3e3e3e'
                        }}
                    >
                        La tienda no está actualmente activa o no existe. 
                        Por favor, contacta al administrador para más información.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ background: theme.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)' }}
                        className="px-6 py-3 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="wine-store-page min-h-screen transition-colors duration-300"
            style={{ 
                backgroundColor: isDarkMode 
                    ? theme.background?.dark?.main || '#121212' 
                    : theme.background?.light?.main || '#f8f5f0'
            }}
        >
        
        <StoreHeader
            isDarkMode={isDarkMode}
            storeConfig={storeConfig}
            theme={theme}
            setIsCartOpen={setIsCartOpen}
            getTotalCartItems={getTotalCartItems}
        />

        {/* Contenido principal */}
        <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{maxWidth: "1800px"}}>
            <div className="flex gap-8">
            {/* Filtros laterales - Desktop */}
            <aside className="hidden lg:block flex-shrink-0">
                <ProductFilters
                categories={categories}
                subcategories={subcategories}
                suppliers={suppliers}
                theme={theme}
                isDarkMode={isDarkMode}
                onFiltersChange={handleFiltersChange}
                onClearFilters={() => setFilters({
                    categories: [],
                    subcategories: [],
                    suppliers: [],
                    minPrice: '',
                    maxPrice: '',
                    search: ''
                })}
                />
            </aside>

            {/* Contenido principal */}
            <div className="flex-1 min-w-0">
                {/* Botón de filtros para móvil */}
                <div className="lg:hidden mb-4">
                <button
                    onClick={() => setIsCartOpen(true)} // Placeholder - puedes crear un modal de filtros
                    className="w-full backdrop-blur-sm rounded-lg p-4 border flex items-center justify-center transition-colors"
                    style={{
                        backgroundColor: isDarkMode ? theme.background.dark.card : theme.background.light.card,
                        borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main,
                        color: theme.primary.main
                    }}
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                    Filtros y Búsqueda
                </button>
                </div>

                {/* Ordenamiento */}
                <ProductSort
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                    theme={theme}
                    isDarkMode={isDarkMode}
                />

                {/* Grid de productos */}
                <ProductGrid
                    products={products}
                    loading={loading}
                    theme={theme}
                    onAddToCart={!storeConfig?.view_only ? addToCart : null}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    viewOnly={storeConfig?.view_only}
                    isDarkMode={isDarkMode}
                />
            </div>
            </div>
        </main>

        {/* Carrito de compras - Solo mostrar si no es view_only */}
        {!storeConfig?.view_only && (
            <ShoppingCart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onClearCart={clearCart}
            />
        )}
        </div>
    );
};

export default EcommercePage;