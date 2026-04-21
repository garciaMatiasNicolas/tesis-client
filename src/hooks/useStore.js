"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import useEcommerceService from '@/services/ecommerceService';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import useThemeProvider from '@/themes/themeMap';

// Crear el contexto
const StoreContext = createContext();

// Proveedor del contexto
export function StoreProvider({ children }) {
    const ecommerceService = useEcommerceService();
    const { getConfigEcommerce } = ecommerceService;
    const themeProvider = useRef(useThemeProvider()).current;
    const [storeConfig, setStoreConfig] = useState(null);
    const [storeActive, setStoreActive] = useState(null); // null = checking, true = active, false = inactive
    const [loading, setLoading] = useState(true);
    const [storeTheme, setStoreTheme] = useState({ themeId: 'wine', darkMode: false });
    
    // Inicializar tema por defecto directamente en el estado
    const [mappedTheme, setMappedTheme] = useState(() => themeProvider.getThemeByID('wine'));
    const configFetchedRef = useRef(false);
    
    useEffect(() => {
        // Solo hacemos la petición una vez
        if (configFetchedRef.current) return;
        
        const fetchStoreConfig = async () => {
            try {
                setLoading(true);
                configFetchedRef.current = true; // Marcar como ya solicitado
                
                const data = await getConfigEcommerce();
                
                // Verificar si la tienda está activa
                if (!data.is_active) {
                    setStoreActive(false);
                    setLoading(false);
                    return;
                }
                
                // Si está activa, guardar la configuración
                setStoreConfig(data);
                setStoreActive(true);
                
                // Configurar tema y modo oscuro de la tienda
                const themeId = data.theme_id || 'wine';
                const darkMode = data.dark_mode || false;
                
                const themeConfig = {
                    themeId: themeId,
                    darkMode: darkMode
                };
                setStoreTheme(themeConfig);
                
                // Mapear el tema usando el themeProvider
                const themeObject = themeProvider.getThemeByID(themeId);
                setMappedTheme(themeObject);
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching store config:", error);
                // Aún en caso de error, inicializar tema por defecto
                const defaultTheme = themeProvider.getThemeByID('wine');
                setMappedTheme(defaultTheme);
                setStoreActive(false);
                setLoading(false);
            }
        };
        
        fetchStoreConfig();
    }, []);
    
    // Valor que se expone en el contexto
    const value = {
        storeConfig,
        storeActive,
        loading,
        storeTheme,
        mappedTheme
    };
    
    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// Componente interno que sincroniza el tema con la configuración de la tienda
function ThemeSync({ children }) {
    const { storeTheme, loading } = useStore();
    const { changeTheme, toggleDarkMode, isDarkMode, themeId } = useTheme();
    
    useEffect(() => {
        if (!loading && storeTheme) {
            // Solo actualizar si el tema o modo oscuro han cambiado
            if (themeId !== storeTheme.themeId) {
                changeTheme(storeTheme.themeId);
            }
            if (isDarkMode !== storeTheme.darkMode) {
                if ((storeTheme.darkMode && !isDarkMode) || (!storeTheme.darkMode && isDarkMode)) {
                    toggleDarkMode();
                }
            }
        }
    }, [storeTheme, loading, changeTheme, toggleDarkMode, isDarkMode, themeId]);
    
    return children;
}

// Proveedor combinado que maneja tanto la tienda como el tema
export function StoreThemeProvider({ children }) {
    return (
        <StoreProvider>
            <StoreThemeProviderInner>
                {children}
            </StoreThemeProviderInner>
        </StoreProvider>
    );
}

// Componente interno que espera a que se cargue la configuración de la tienda
function StoreThemeProviderInner({ children }) {
    const { storeTheme, loading, mappedTheme } = useStore();
    
    // Mostrar loading mientras se carga la configuración de la tienda
    if (loading || !mappedTheme) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1f1e1eff' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
                         style={{ borderColor: '#9a334d' }}></div>
                    <p style={{ color: '#e0e0e0' }}>Cargando tienda...</p>
                </div>
            </div>
        );
    }
    
    // Una vez cargada la configuración, inicializar ThemeProvider con los valores correctos
    return (
        <ThemeProvider initialThemeId={storeTheme.themeId} initialDarkMode={storeTheme.darkMode}>
            <ThemeSync>
                {children}
            </ThemeSync>
        </ThemeProvider>
    );
}

// Hook personalizado para usar el contexto
export function useStore() {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore debe ser usado dentro de un StoreProvider');
    }
    return context;
}

// Hook combinado que devuelve tanto la configuración de la tienda como el tema
export function useStoreWithTheme() {
    const storeContext = useStore();
    
    // Solo intentar obtener el tema si estamos dentro de un ThemeProvider
    let themeContext = null;
    try {
        themeContext = useTheme();
    } catch (error) {
        // Si no hay ThemeProvider, usar el tema mapeado del store
        themeContext = {
            themeId: storeContext.storeTheme?.themeId || 'wine',
            isDarkMode: storeContext.storeTheme?.darkMode || false,
            theme: storeContext.mappedTheme || {},
            changeTheme: () => {},
            toggleDarkMode: () => {}
        };
    }
    
    // Si hay ThemeProvider pero el tema no está sincronizado, usar el mapeado del store
    const finalTheme = themeContext.theme && Object.keys(themeContext.theme).length > 0 
        ? themeContext.theme 
        : storeContext.mappedTheme || {};
    
    return {
        ...storeContext,
        ...themeContext,
        theme: finalTheme
    };
}

export default StoreContext;