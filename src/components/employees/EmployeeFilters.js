"use client";
import React from "react";
import { FaSearch, FaFilter, FaPlus, FaTimes } from "react-icons/fa";

const EmployeeFilters = ({ 
    searchTerm, 
    onSearchChange, 
    selectedStore, 
    onStoreChange,
    selectedBranch,
    onBranchChange,
    stores = [],
    branches = [],
    onAddEmployee,
    canAdd = false,
    totalEmployees = 0
}) => {
    const availableBranches = branches.filter(branch => 
        !selectedStore || branch.store === parseInt(selectedStore)
    );

    const clearFilters = () => {
        onSearchChange('');
        onStoreChange('');
        onBranchChange('');
    };

    const hasActiveFilters = searchTerm || selectedStore || selectedBranch;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Título y contador */}
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-[#223263]">
                        Empleados
                    </h1>
                    <span className="bg-[#18c29c] text-white px-3 py-1 rounded-full text-sm font-medium">
                        {totalEmployees} empleado{totalEmployees !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Botón agregar */}
                {canAdd && (
                    <button
                        onClick={onAddEmployee}
                        className="bg-[#18c29c] hover:bg-[#13a884] text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 whitespace-nowrap"
                    >
                        <FaPlus />
                        Agregar Empleado
                    </button>
                )}
            </div>

            {/* Filtros */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Búsqueda */}
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar empleados..."
                        className="text-gray-900 w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Filtro por tienda */}
                <div>
                    <select
                        className="text-gray-900 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent bg-white"
                        value={selectedStore}
                        onChange={(e) => onStoreChange(e.target.value)}
                    >
                        <option value="">Todas las tiendas</option>
                        {stores.map(store => (
                            <option key={store.id} value={store.id}>
                                {store.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filtro por sucursal */}
                <div>
                    <select
                        className="text-gray-900 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent bg-white"
                        value={selectedBranch}
                        onChange={(e) => onBranchChange(e.target.value)}
                        disabled={!selectedStore}
                    >
                        <option value="">Todas las sucursales</option>
                        {availableBranches.map(branch => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Limpiar filtros */}
                <div className="flex items-center">
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 text-gray-600 hover:text-red-600 px-4 py-3 border border-gray-300 rounded-lg hover:border-red-300 transition"
                        >
                            <FaTimes />
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Indicadores de filtros activos */}
            {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {searchTerm && (
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            <FaSearch className="text-xs" />
                            Búsqueda: "{searchTerm}"
                            <button
                                onClick={() => onSearchChange('')}
                                className="hover:text-blue-600"
                            >
                                <FaTimes className="text-xs" />
                            </button>
                        </span>
                    )}
                    
                    {selectedStore && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            <FaFilter className="text-xs" />
                            Tienda: {stores.find(s => s.id === parseInt(selectedStore))?.name}
                            <button
                                onClick={() => onStoreChange('')}
                                className="hover:text-green-600"
                            >
                                <FaTimes className="text-xs" />
                            </button>
                        </span>
                    )}
                    
                    {selectedBranch && (
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            <FaFilter className="text-xs" />
                            Sucursal: {branches.find(b => b.id === parseInt(selectedBranch))?.name}
                            <button
                                onClick={() => onBranchChange('')}
                                className="hover:text-purple-600"
                            >
                                <FaTimes className="text-xs" />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmployeeFilters;