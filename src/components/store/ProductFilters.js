import React, { useState, useEffect } from 'react';

const ProductFilters = ({ 
    categories = [], 
    subcategories = [], 
    suppliers = [],
    onFiltersChange,
    onClearFilters,
    isDarkMode,
    theme,
    isMobile = false
}) => {
    const [filters, setFilters] = useState({
        categories: [],
        subcategories: [],
        suppliers: [],
        minPrice: '',
        maxPrice: '',
        search: ''
    });

    const [priceRange, setPriceRange] = useState({
        min: 0,
        max: 1000000,
        currentMin: '',
        currentMax: ''
    });

    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        subcategories: true,
        suppliers: true,
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
        let count = filters.categories.length + filters.subcategories.length + filters.suppliers.length;
        // Contar rango de precio como 1 filtro si hay min o max
        if (filters.minPrice || filters.maxPrice) {
            count += 1;
        }
        return count;
    };

    return (
        <div className={isMobile ? "" : "w-80 rounded-lg border sticky top-4"} style={{
            backgroundColor: isMobile ? 'transparent' : (isDarkMode ? theme.background?.dark?.card : theme.background?.light?.card),
            borderColor: isMobile ? 'transparent' : (isDarkMode ? theme.border?.dark?.main : theme.border?.light?.main)
        }}>
            {/* Header */}
            <div className="p-4 border-b rounded-lg" style={{
                backgroundColor: isDarkMode ? theme.background?.dark?.card : theme.background?.light?.card,
                borderColor: isDarkMode ? theme.border?.dark?.main : theme.border?.light?.main
            }}>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold" style={{
                        color: isDarkMode ? theme.text?.dark?.primary : theme.text?.light?.primary
                    }}>
                        Filtros {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
                    </h3>
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearAll}
                            className="text-sm font-medium transition-colors hover:opacity-80 cursor-pointer"
                            style={{
                                color: theme.primary?.main
                            }}
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Búsqueda */}
            <div className="p-4 border-b rounded-lg" style={{
                backgroundColor: isDarkMode ? theme.background?.dark?.card : theme.background?.light?.card,
                borderColor: isDarkMode ? theme.border?.dark?.main : theme.border?.light?.main
            }}>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={filters.search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 transition-all"
                        style={{
                            backgroundColor: isDarkMode ? theme.background?.dark?.main : theme.background?.light?.main,
                            borderColor: isDarkMode ? theme.border?.dark?.main : theme.border?.light?.main,
                            color: isDarkMode ? theme.text?.dark?.primary : theme.text?.light?.primary
                        }}
                    />
                    <svg 
                        className="absolute left-3 top-2.5 w-4 h-4"
                        style={{
                            color: isDarkMode ? theme.text?.dark?.muted : theme.text?.light?.muted
                        }}
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
                <div className="p-4 border-b rounded-lg" style={{
                    backgroundColor: isDarkMode ? theme.background?.dark?.card : theme.background?.light?.card,
                    borderColor: isDarkMode ? theme.border?.dark?.main : theme.border?.light?.main
                }}>
                    <div className="flex flex-wrap gap-2">
                        {filters.categories.map(catId => {
                            const cat = categories.find(c => c.id.toString() === catId.toString());
                            return cat ? (
                                <button
                                    key={catId}
                                    onClick={() => handleCheckboxChange('categories', catId)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80 border cursor-pointer"
                                    style={{
                                        backgroundColor: theme.primary?.main,
                                        color: '#ffffff',
                                        borderColor: theme.primary?.main
                                    }}
                                >
                                    {cat.name}
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            ) : null;
                        })}
                        {filters.subcategories.map(subId => {
                            const sub = subcategories.find(s => s.id.toString() === subId.toString());
                            return sub ? (
                                <button
                                    key={subId}
                                    onClick={() => handleCheckboxChange('subcategories', subId)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80 border cursor-pointer"
                                    style={{
                                        backgroundColor: theme.primary?.main,
                                        color: '#ffffff',
                                        borderColor: theme.primary?.main
                                    }}
                                >
                                    {sub.name}
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            ) : null;
                        })}
                        {filters.suppliers.map(suppId => {
                            const supp = suppliers.find(s => s.id.toString() === suppId.toString());
                            return supp ? (
                                <button
                                    key={suppId}
                                    onClick={() => handleCheckboxChange('suppliers', suppId)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80 border cursor-pointer"
                                    style={{
                                        backgroundColor: theme.primary?.main,
                                        color: '#ffffff',
                                        borderColor: theme.primary?.main
                                    }}
                                >
                                    {supp.name}
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            ) : null;
                        })}
                        {(filters.minPrice || filters.maxPrice) && (
                            <button
                                onClick={() => {
                                    const newFilters = { ...filters, minPrice: '', maxPrice: '' };
                                    setFilters(newFilters);
                                    onFiltersChange(newFilters);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80 border cursor-pointer"
                                style={{
                                    backgroundColor: theme.primary?.main,
                                    color: '#ffffff',
                                    borderColor: theme.primary?.main
                                }}
                            >
                                ${filters.minPrice ? Number(filters.minPrice).toLocaleString('es-AR') : '0'} - ${filters.maxPrice ? Number(filters.maxPrice).toLocaleString('es-AR') : '∞'}
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Precio */}
                <div className="border-b" style={{
                    borderColor: isDarkMode ? theme.border?.dark?.main : theme.border?.light?.main
                }}>
                    <button
                        onClick={() => toggleSection('price')}
                        className="w-full p-4 text-left flex items-center justify-between hover:opacity-80 transition-all cursor-pointer"
                    >
                        <span className="font-medium" style={{
                            color: isDarkMode ? theme.text?.dark?.primary : theme.text?.light?.primary
                        }}>Precio</span>
                        <svg 
                            className={`w-5 h-5 transform transition-transform ${
                                expandedSections.price ? 'rotate-180' : ''
                            }`}
                            style={{
                                color: isDarkMode ? theme.text?.dark?.muted : theme.text?.light?.muted
                            }}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedSections.price && (
                        <div className="px-4 pb-4 space-y-4">
                            {/* Mostrar rango actual */}
                            <div className="flex items-center justify-between text-sm">
                                <div>
                                    <span className="text-xs block mb-1" style={{
                                        color: isDarkMode ? theme.text?.dark?.muted : theme.text?.light?.muted
                                    }}>Desde</span>
                                    <div className="font-semibold" style={{
                                        color: isDarkMode ? theme.text?.dark?.primary : theme.text?.light?.primary
                                    }}>$ {Number(filters.minPrice || 0).toLocaleString('es-AR')}</div>
                                </div>
                                <span className="text-lg" style={{
                                    color: isDarkMode ? theme.text?.dark?.muted : theme.text?.light?.muted
                                }}>-</span>
                                <div>
                                    <span className="text-xs block mb-1" style={{
                                        color: isDarkMode ? theme.text?.dark?.muted : theme.text?.light?.muted
                                    }}>Hasta</span>
                                    <div className="font-semibold" style={{
                                        color: isDarkMode ? theme.text?.dark?.primary : theme.text?.light?.primary
                                    }}>{filters.maxPrice ? `$ ${Number(filters.maxPrice).toLocaleString('es-AR')}` : '$ ∞'}</div>
                                </div>
                            </div>

                            {/* Deslizadores de rango */}
                            <div className="space-y-3">
                                <div className="relative">
                                    <label className="text-xs mb-1 block" style={{
                                        color: isDarkMode ? theme.text?.dark?.muted : theme.text?.light?.muted
                                    }}>Precio mínimo</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000000"
                                        step="10000"
                                        value={filters.minPrice || 0}
                                        onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                        className="w-full cursor-pointer"
                                        style={{
                                            accentColor: theme.primary?.main,
                                            background: `linear-gradient(to right, ${theme.primary?.main} 0%, ${theme.primary?.main} ${((filters.minPrice || 0) / 1000000) * 100}%, ${isDarkMode ? '#374151' : '#e5e7eb'} ${((filters.minPrice || 0) / 1000000) * 100}%, ${isDarkMode ? '#374151' : '#e5e7eb'} 100%)`
                                        }}
                                    />
                                </div>
                                <div className="relative">
                                    <label className="text-xs mb-1 block" style={{
                                        color: isDarkMode ? theme.text?.dark?.muted : theme.text?.light?.muted
                                    }}>Precio máximo</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000000"
                                        step="10000"
                                        value={filters.maxPrice || 1000000}
                                        onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                        className="w-full cursor-pointer"
                                        style={{
                                            accentColor: theme.primary?.main,
                                            background: `linear-gradient(to right, ${isDarkMode ? '#374151' : '#e5e7eb'} 0%, ${isDarkMode ? '#374151' : '#e5e7eb'} ${((filters.maxPrice || 1000000) / 1000000) * 100}%, ${theme.primary?.main} ${((filters.maxPrice || 1000000) / 1000000) * 100}%, ${theme.primary?.main} 100%)`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Inputs manuales opcionales */}
                            <details className="group">
                                <summary className="text-sm font-medium cursor-pointer hover:opacity-80 transition-all list-none flex items-center justify-between" style={{
                                    color: theme.primary?.main
                                }}>
                                    <span>Ingresar valores manualmente</span>
                                    <svg className="w-4 h-4 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </summary>
                                <div className="flex gap-2 mt-3">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            placeholder="Mín"
                                            min="0"
                                            step="1000"
                                            value={filters.minPrice || ''}
                                            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 transition-all"
                                            style={{
                                                backgroundColor: isDarkMode ? theme.background?.dark?.main : theme.background?.light?.main,
                                                borderColor: isDarkMode ? theme.border?.dark?.main : theme.border?.light?.main,
                                                color: isDarkMode ? theme.text?.dark?.primary : theme.text?.light?.primary
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            placeholder="Máx"
                                            min="0"
                                            step="1000"
                                            value={filters.maxPrice || ''}
                                            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 transition-all"
                                            style={{
                                                backgroundColor: isDarkMode ? theme.background?.dark?.main : theme.background?.light?.main,
                                                borderColor: isDarkMode ? theme.border?.dark?.main : theme.border?.light?.main,
                                                color: isDarkMode ? theme.text?.dark?.primary : theme.text?.light?.primary
                                            }}
                                        />
                                    </div>
                                </div>
                            </details>
                        </div>
                    )}
                </div>

                {/* Categorías */}
                <div className="border-b" style={{
                    borderColor: isDarkMode ? theme.border?.dark?.main : theme.border?.light?.main
                }}>
                    <button
                        onClick={() => toggleSection('categories')}
                        className="w-full p-4 text-left flex items-center justify-between hover:opacity-80 transition-all cursor-pointer"
                    >
                        <span className="font-medium" style={{
                            color: isDarkMode ? theme.text?.dark?.primary : theme.text?.light?.primary
                        }}>Categorías</span>
                        <svg 
                            className={`w-5 h-5 transform transition-transform ${
                                expandedSections.categories ? 'rotate-180' : ''
                            }`}
                            style={{
                                color: isDarkMode ? theme.text?.dark?.muted : theme.text?.light?.muted
                            }}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedSections.categories && (
                        <div className="px-4 pb-4 space-y-2.5">
                            {categories.map((category) => (
                                <label key={category.id} className="flex items-center space-x-3 cursor-pointer hover:opacity-80 p-2 rounded transition-all">
                                    <input
                                        type="checkbox"
                                        checked={filters.categories.includes(category.id.toString())}
                                        onChange={() => handleCheckboxChange('categories', category.id.toString())}
                                        className="w-4 h-4 rounded focus:ring-2"
                                        style={{
                                            accentColor: theme.primary?.main
                                        }}
                                    />
                                    <span className="text-sm" style={{
                                        color: isDarkMode ? theme.text?.dark?.secondary : theme.text?.light?.secondary
                                    }}>{category.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Subcategorías */}
                <div className="border-b" style={{
                    borderColor: isDarkMode ? theme.border?.dark?.main : theme.border?.light?.main
                }}>
                    <button
                        onClick={() => toggleSection('subcategories')}
                        className="w-full p-4 text-left flex items-center justify-between hover:opacity-80 transition-all cursor-pointer"
                    >
                        <span className="font-medium" style={{
                            color: isDarkMode ? theme.text?.dark?.primary : theme.text?.light?.primary
                        }}>Subcategorías</span>
                        <svg 
                            className={`w-5 h-5 transform transition-transform ${
                                expandedSections.subcategories ? 'rotate-180' : ''
                            }`}
                            style={{
                                color: isDarkMode ? theme.text?.dark?.muted : theme.text?.light?.muted
                            }}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedSections.subcategories && (
                        <div className="px-4 pb-4 space-y-2.5">
                            {subcategories.map((subcategory) => (
                                <label key={subcategory.id} className="flex items-center space-x-3 cursor-pointer hover:opacity-80 p-2 rounded transition-all">
                                    <input
                                        type="checkbox"
                                        checked={filters.subcategories.includes(subcategory.id.toString())}
                                        onChange={() => handleCheckboxChange('subcategories', subcategory.id.toString())}
                                        className="w-4 h-4 rounded focus:ring-2"
                                        style={{
                                            accentColor: theme.primary?.main
                                        }}
                                    />
                                    <span className="text-sm" style={{
                                        color: isDarkMode ? theme.text?.dark?.secondary : theme.text?.light?.secondary
                                    }}>{subcategory.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Proveedores */}
                <div>
                    <button
                        onClick={() => toggleSection('suppliers')}
                        className="w-full p-4 text-left flex items-center justify-between hover:opacity-80 transition-all cursor-pointer"
                    >
                        <span className="font-medium" style={{
                            color: isDarkMode ? theme.text?.dark?.primary : theme.text?.light?.primary
                        }}>Proveedores</span>
                        <svg 
                            className={`w-5 h-5 transform transition-transform ${
                                expandedSections.suppliers ? 'rotate-180' : ''
                            }`}
                            style={{
                                color: isDarkMode ? theme.text?.dark?.muted : theme.text?.light?.muted
                            }}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {expandedSections.suppliers && (
                        <div className="px-4 pb-4 space-y-2.5">
                            {suppliers.map((supplier) => (
                                <label key={supplier.id} className="flex items-center space-x-3 cursor-pointer hover:opacity-80 p-2 rounded transition-all">
                                    <input
                                        type="checkbox"
                                        checked={filters.suppliers.includes(supplier.id.toString())}
                                        onChange={() => handleCheckboxChange('suppliers', supplier.id.toString())}
                                        className="w-4 h-4 rounded focus:ring-2"
                                        style={{
                                            accentColor: theme.primary?.main
                                        }}
                                    />
                                    <span className="text-sm" style={{
                                        color: isDarkMode ? theme.text?.dark?.secondary : theme.text?.light?.secondary
                                    }}>{supplier.name}</span>
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