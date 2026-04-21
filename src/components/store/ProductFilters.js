import React, { useState } from 'react';

const ProductFilters = ({ 
    categories = [], 
    subcategories = [], 
    suppliers = [],
    onFiltersChange,
    onClearFilters, 
    isDarkMode,
    theme 
}) => {
    const [filters, setFilters] = useState({
        categories: [],
        subcategories: [],
        suppliers: [],
        minPrice: '',
        maxPrice: '',
        search: ''
    });

    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        subcategories: false,
        suppliers: false,
        price: true
    });

    const handleCheckboxChange = (type, value) => {
        const newFilters = { ...filters };
        const currentArray = newFilters[type];
        
        if (currentArray.includes(value)) {
            newFilters[type] = currentArray.filter(item => item !== value);
        } else {
            newFilters[type] = [...currentArray, value];
        }
        
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handlePriceChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleSearchChange = (value) => {
        const newFilters = { ...filters, search: value };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleClearAll = () => {
        const clearedFilters = {
            categories: [],
            subcategories: [],
            suppliers: [],
            minPrice: '',
            maxPrice: '',
            search: ''
        };
        setFilters(clearedFilters);
        onFiltersChange(clearedFilters);
        onClearFilters();
    };

    const hasActiveFilters = Object.values(filters).some(value => 
        Array.isArray(value) ? value.length > 0 : value !== ''
    );

    const getActiveFiltersCount = () => {
        return filters.categories.length + filters.subcategories.length + filters.suppliers.length + 
               (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0) + (filters.search ? 1 : 0);
    };

    return (
        <div className="w-80 rounded-lg shadow-lg border backdrop-blur-sm sticky top-4" style={{background: isDarkMode ? theme.background.dark.main : theme.background.light.main, borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main}}>
            {/* Header */}
            <div className="p-4 border-b" style={{background: theme.primary.dark, borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main}}>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center" style={{color: theme.text.dark.primary}}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: theme.text.dark.primary}}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                        </svg>
                        Filtros
                        {getActiveFiltersCount() > 0 && (
                            <span style={{ background: theme.primary.gradient }} className="ml-2 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                                {getActiveFiltersCount()}
                            </span>
                        )}
                    </h3>
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearAll}
                            className="text-sm transition-colors font-medium"
                            style={{color: isDarkMode ? theme.text.dark.accent : theme.text.light.accent}}
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Búsqueda */}
            <div className="p-4 border-b" style={{borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main}}>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={filters.search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        style={{borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main, backgroundColor: isDarkMode ? theme.background.dark.card : theme.background.light.card, color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
                    />
                    <svg 
                        className="absolute left-3 top-2.5 w-4 h-4"
                        style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Filtros activos */}
            {hasActiveFilters && (
                <div className="p-4 border-b" style={{borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main}}>
                    <h4 style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}} className="text-sm font-medium mb-2">Filtros aplicados:</h4>
                    <div className="flex flex-wrap gap-1">
                        {filters.search && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs" style={{backgroundColor: isDarkMode ? theme.primary.light : theme.primary.light, color: isDarkMode ? theme.text.dark.accent : theme.text.light.accent}}>
                                "{filters.search}"
                                <button 
                                    onClick={() => handleSearchChange('')}
                                    className="ml-1"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {filters.categories.map(catId => {
                            const cat = categories.find(c => c.id.toString() === catId.toString());
                            return cat ? (
                                <span key={catId} className="inline-flex items-center px-2 py-1 rounded-full text-xs" style={{backgroundColor: theme.primary.dark, color: theme.text.dark.primary}}>
                                    {cat.name}
                                    <button 
                                        onClick={() => handleCheckboxChange('categories', catId)}
                                        className="ml-1"
                                    >
                                        ×
                                    </button>
                                </span>
                            ) : null;
                        })}
                        {filters.subcategories.map(subId => {
                            const sub = subcategories.find(s => s.id.toString() === subId.toString());
                            return sub ? (
                                <span key={subId} className="inline-flex items-center px-2 py-1 rounded-full text-xs" style={{backgroundColor: theme.secondary.dark, color: theme.text.dark.primary}}>
                                    {sub.name}
                                    <button 
                                        onClick={() => handleCheckboxChange('subcategories', subId)}
                                        className="ml-1"
                                    >
                                        ×
                                    </button>
                                </span>
                            ) : null;
                        })}
                        {filters.suppliers.map(suppId => {
                            const supp = suppliers.find(s => s.id.toString() === suppId.toString());
                            return supp ? (
                                <span key={suppId} className="inline-flex items-center px-2 py-1 rounded-full text-xs" style={{backgroundColor: theme.primary.main, color: theme.text.dark.primary}}>
                                    {supp.name}
                                    <button 
                                        onClick={() => handleCheckboxChange('suppliers', suppId)}
                                        className="ml-1"
                                    >
                                        ×
                                    </button>
                                </span>
                            ) : null;
                        })}
                    </div>
                </div>
            )}

            <div className="h-full overflow-y-auto">
                {/* Categorías */}
                <div className="border-b" style={{borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main}}>
                    <button
                        onClick={() => toggleSection('categories')}
                        className="w-full p-4 text-left flex items-center justify-between transition-colors"
                        style={{cursor: "pointer"}}
                    >
                        <span style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}} className="font-medium">Categorías</span>
                        <svg 
                            className={`w-4 h-4 transform transition-transform ${
                                expandedSections.categories ? 'rotate-180' : ''
                            }`}
                            style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedSections.categories && (
                        <div className="px-4 pb-4 space-y-2">
                            {categories.map((category) => (
                                <label key={category.id} className="flex items-center space-x-2 cursor-pointer p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={filters.categories.includes(category.id.toString())}
                                        onChange={() => handleCheckboxChange('categories', category.id.toString())}
                                        style={{backgroundColor: isDarkMode ? theme.background.dark.card : theme.background.light.card, borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main}}
                                        className="rounded focus:ring-opacity-50"
                                    />
                                    <span style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}} className="text-sm">{category.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Subcategorías */}
                <div className="border-b" style={{borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main}}>
                    <button
                        onClick={() => toggleSection('subcategories')}
                        className="w-full p-4 text-left flex items-center justify-between transition-colors"
                        style={{cursor: "pointer"}}
                    >
                        <span style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}} className="font-medium">Subcategorías</span>
                        <svg 
                            className={`w-4 h-4 transform transition-transform ${
                                expandedSections.subcategories ? 'rotate-180' : ''
                            }`}
                            style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedSections.subcategories && (
                        <div className="px-4 pb-4 space-y-2">
                            {subcategories.map((subcategory) => (
                                <label key={subcategory.id} className="flex items-center space-x-2 cursor-pointer p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={filters.subcategories.includes(subcategory.id.toString())}
                                        onChange={() => handleCheckboxChange('subcategories', subcategory.id.toString())}
                                        style={{backgroundColor: isDarkMode ? theme.background.dark.card : theme.background.light.card, borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main}}
                                        className="rounded focus:ring-opacity-50"
                                    />
                                    <span style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}} className="text-sm">{subcategory.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Precio */}
                <div className="border-b" style={{borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main}}>
                    <button
                        onClick={() => toggleSection('price')}
                        className="w-full p-4 text-left flex items-center justify-between transition-colors"
                        style={{cursor: "pointer"}}
                    >
                        <span style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}} className="font-medium">Precio</span>
                        <svg 
                            className={`w-4 h-4 transform transition-transform ${
                                expandedSections.price ? 'rotate-180' : ''
                            }`}
                            style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedSections.price && (
                        <div className="px-4 pb-4 space-y-3">
                            <div>
                                <label style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}} className="block text-sm mb-1">Desde</label>
                                <input
                                    type="number"
                                    placeholder="$0"
                                    min="0"
                                    step="0.01"
                                    value={filters.minPrice}
                                    onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                    style={{borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main, backgroundColor: isDarkMode ? theme.background.dark.card : theme.background.light.card, color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}} className="block text-sm mb-1">Hasta</label>
                                <input
                                    type="number"
                                    placeholder="$999999"
                                    min="0"
                                    step="0.01"
                                    value={filters.maxPrice}
                                    onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                    style={{borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main, backgroundColor: isDarkMode ? theme.background.dark.card : theme.background.light.card, color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Proveedores */}
                <div>
                    <button
                        onClick={() => toggleSection('suppliers')}
                        className="w-full p-4 text-left flex items-center justify-between transition-colors"
                        style={{cursor: "pointer"}}
                    >
                        <span style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}} className="font-medium">Proveedores</span>
                        <svg 
                            className={`w-4 h-4 transform transition-transform ${
                                expandedSections.suppliers ? 'rotate-180' : ''
                            }`}
                            style={{color: isDarkMode ? theme.text.dark.muted : theme.text.light.muted}}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedSections.suppliers && (
                        <div className="px-4 pb-4 space-y-2">
                            {suppliers.map((supplier) => (
                                <label key={supplier.id} className="flex items-center space-x-2 cursor-pointer p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={filters.suppliers.includes(supplier.id.toString())}
                                        onChange={() => handleCheckboxChange('suppliers', supplier.id.toString())}
                                        style={{backgroundColor: isDarkMode ? theme.background.dark.card : theme.background.light.card, borderColor: isDarkMode ? theme.border.dark.main : theme.border.light.main}}
                                        className="rounded focus:ring-opacity-50"
                                    />
                                    <span style={{color: isDarkMode ? theme.text.dark.primary : theme.text.light.primary}} className="text-sm">{supplier.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductFilters;