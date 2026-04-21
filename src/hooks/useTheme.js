"use client";
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import useThemeProvider from '@/themes/themeMap';

// Crear el contexto
const ThemeContext = createContext();

// Proveedor del contexto
export function ThemeProvider({ children, initialThemeId = 'wine', initialDarkMode = false }) {
    const themeProvider = useMemo(() => useThemeProvider(), []);
    const [themeId, setThemeId] = useState(initialThemeId);
    const [isDarkMode, setIsDarkMode] = useState(initialDarkMode);
    
    // Inicializar el tema directamente con el valor correcto
    const [theme, setTheme] = useState(() => themeProvider.getThemeByID(initialThemeId));
    
    // Actualizar el tema cuando cambie el themeId
    useEffect(() => {
        const selectedTheme = themeProvider.getThemeByID(themeId);
        setTheme(selectedTheme);
    }, [themeId, themeProvider]);
    
    // Aplicar modo oscuro/claro al documento
    useEffect(() => {
        document.documentElement.setAttribute('data-dark-mode', isDarkMode.toString());
    }, [isDarkMode]);
    
    // Cambiar tema
    const changeTheme = (newThemeId) => {
        setThemeId(newThemeId);
    };
    
    // Cambiar modo oscuro/claro
    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };
    
    // Valor que se expone en el contexto
    const value = {
        themeId,
        isDarkMode,
        theme,
        changeTheme,
        toggleDarkMode
    };
    
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Hook personalizado para usar el contexto
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
    }
    return context;
}

export default ThemeContext;