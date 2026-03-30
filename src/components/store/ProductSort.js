import React from 'react';

const ProductSort = ({ sortBy, sortOrder, onSortChange, isDarkMode, theme }) => {
    const sortOptions = [
        { value: 'name', label: 'Nombre' },
        { value: 'price', label: 'Precio' },
        { value: 'category', label: 'Categoría' },
        { value: 'created_at', label: 'Fecha de creación' },
        { value: 'sku', label: 'SKU' }
    ];

    const handleSortChange = (field) => {
        if (sortBy === field) {
        // Si ya está ordenado por este campo, cambiar el orden
        onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
        // Si es un campo nuevo, ordenar ascendente
        onSortChange(field, 'asc');
        }
    };

    return (
        <div style={{background: isDarkMode ? theme.background.dark.main : theme.background.light.main, borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main}} className="rounded-lg shadow-md p-4 mb-6 border backdrop-blur-sm" >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Título */}
            <h3 style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}} className="text-lg font-semibold flex items-center">
            <svg style={{color: isDarkMode ? theme.text.dark.secondary : theme.text.light.secondary}} className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Ordenar productos
            </h3>

            {/* Opciones de ordenamiento */}
            <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => {
                const isActive = sortBy === option.value;
                return (
                <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    style={isActive ? { background: isDarkMode ? theme.primary.gradient : {}, color: "#ffff" } : {color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}
                    className={`
                    flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                    
                    `}
                >
                    {option.label}
                    {isActive && (
                    <svg 
                        className={`w-4 h-4 ml-1 transform transition-transform ${
                        sortOrder === 'desc' ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    )}
                </button>
                );
            })}
            </div>
        </div>

        {/* Indicador de ordenamiento actual */}
        {sortBy && (
            <div className={`mt-3 pt-3 border-t border-[${isDarkMode ? theme.border.dark.main : theme.border.light.main}]`}>
            <p style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}} className="text-sm">
                Ordenando por{' '}
                <span style={{color: isDarkMode ? theme.text.dark.accent : theme.text.light.accent}} className="font-medium">
                {sortOptions.find(opt => opt.value === sortBy)?.label}
                </span>
                {' '}en orden{' '}
                <span style={{color: isDarkMode ? theme.text.dark.accent : theme.text.light.accent}} className="font-medium">
                {sortOrder === 'asc' ? 'ascendente' : 'descendente'}
                </span>
            </p>
            </div>
        )}
        </div>
    );
};

export default ProductSort;