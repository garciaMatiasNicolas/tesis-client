import React, { useState, useRef, useEffect } from 'react';

const ProductSort = ({ sortBy, sortOrder, onSortChange, isDarkMode, theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const sortOptions = [
        { value: '', label: 'Más relevantes', field: '', order: 'asc' },
        { value: 'price_asc', label: 'Menor precio', field: 'price', order: 'asc' },
        { value: 'price_desc', label: 'Mayor precio', field: 'price', order: 'desc' },
        { value: 'name_asc', label: 'A-Z', field: 'name', order: 'asc' },
        { value: 'name_desc', label: 'Z-A', field: 'name', order: 'desc' },
        { value: 'created_at', label: 'Más nuevos', field: 'created_at', order: 'desc' }
    ];

    const getCurrentLabel = () => {
        if (!sortBy) return 'Más relevantes';
        const current = sortOptions.find(opt => opt.field === sortBy && opt.order === sortOrder);
        return current ? current.label : 'Ordenar por';
    };

    const handleSelect = (field, order) => {
        onSortChange(field, order);
        setIsOpen(false);
    };

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex items-center justify-end mb-6">
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80 transition-all text-sm min-w-[180px] justify-between"
                    style={{
                        backgroundColor: isDarkMode ? theme.background?.dark?.card : theme.background?.light?.card,
                        borderColor: isDarkMode ? theme.border?.dark?.main : theme.border?.light?.main,
                        color: isDarkMode ? theme.text?.dark?.primary : theme.text?.light?.primary
                    }}
                >
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" style={{
                            color: isDarkMode ? theme.text?.dark?.muted : theme.text?.light?.muted
                        }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                        <span>{getCurrentLabel()}</span>
                    </div>
                    <svg 
                        className={`w-4 h-4 transform transition-transform ${
                            isOpen ? 'rotate-180' : ''
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

                {/* Dropdown menu */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-56 border rounded-lg shadow-lg z-50" style={{
                        backgroundColor: isDarkMode ? theme.background?.dark?.card : theme.background?.light?.card,
                        borderColor: isDarkMode ? theme.border?.dark?.main : theme.border?.light?.main
                    }}>
                        <div className="py-1">
                            {sortOptions.map((option) => {
                                const isActive = option.field === sortBy && option.order === sortOrder;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSelect(option.field, option.order)}
                                        className="w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between hover:opacity-80"
                                        style={{
                                            backgroundColor: isActive 
                                                ? theme.primary?.main
                                                : 'transparent',
                                            color: isActive
                                                ? '#ffffff'
                                                : (isDarkMode ? theme.text?.dark?.primary : theme.text?.light?.primary),
                                            fontWeight: isActive ? 500 : 400
                                        }}
                                    >
                                        <span>{option.label}</span>
                                        {isActive && (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductSort;