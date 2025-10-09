"use client";
import React, { useState, useEffect } from "react";
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaEnvelope, FaPhone, FaGlobe, FaMapMarkerAlt, FaSpinner } from "react-icons/fa";
import Link from "next/link";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import SupplierModal from "@/components/suppliers/SupplierModal";

export default function SupplierTable({ 
    suppliers = [], 
    loading = false, 
    error = null, 
    onDeleteSupplier,
    onCreateSupplier,
    searchTerm = "",
    onSearchChange,
    showActions = true 
}) {
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [countries, setCountries] = useState(["Todos"]);
    const [selectedCountry, setSelectedCountry] = useState("Todos");
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, supplier: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [supplierModal, setSupplierModal] = useState(false);

    // Efecto para filtrar proveedores
    useEffect(() => {
        // Asegurar que suppliers sea siempre un array
        const validSuppliers = Array.isArray(suppliers) ? suppliers : [];
        
        let filtered = validSuppliers.filter(supplier => {
            const matchesSearch = (supplier.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (supplier.fantasy_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (supplier.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (supplier.cuit?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            
            const matchesCountry = selectedCountry === "Todos" || supplier.country === selectedCountry;
            
            return matchesSearch && matchesCountry;
        });

        setFilteredSuppliers(filtered);
    }, [suppliers, searchTerm, selectedCountry]);

    // Efecto para obtener países únicos
    useEffect(() => {
        // Asegurar que suppliers sea siempre un array
        const validSuppliers = Array.isArray(suppliers) ? suppliers : [];
        const uniqueCountries = [...new Set(validSuppliers.map(supplier => supplier.country).filter(Boolean))];
        setCountries(["Todos", ...uniqueCountries]);
    }, [suppliers]);

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        return new Date(dateString).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Manejar eliminación de proveedor
    const handleDeleteSupplier = (supplier) => {
        setDeleteModal({ isOpen: true, supplier });
    };

    const confirmDeleteSupplier = async () => {
        if (!deleteModal.supplier) return;
        
        try {
            setIsDeleting(true);
            await onDeleteSupplier(deleteModal.supplier);
            setDeleteModal({ isOpen: false, supplier: null });
        } catch (err) {
            console.error('Error al eliminar proveedor:', err);
            // El error se manejará en el componente padre
        } finally {
            setIsDeleting(false);
        }
    };

    const closeDeleteModal = () => {
        if (!isDeleting) {
            setDeleteModal({ isOpen: false, supplier: null });
        }
    };

    // Manejar creación de proveedor
    const handleCreateSupplier = (supplier) => {
        if (onCreateSupplier) {
            onCreateSupplier(supplier);
        }
        setSupplierModal(false);
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <FaSpinner className="animate-spin mx-auto h-8 w-8 text-[#18c29c] mb-4" />
                    <p className="text-gray-600">Cargando proveedores...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="text-red-600">⚠️</div>
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Error al cargar los datos</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="ml-auto bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con botón de agregar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Proveedores</h1>
                    <p className="text-gray-600 mt-1">Gestiona tu red de proveedores</p>
                </div>
                <button
                    onClick={() => setSupplierModal(true)}
                    className="inline-flex items-center gap-2 bg-[#18c29c] text-white px-4 py-2 rounded-lg hover:bg-[#15a884] transition-colors font-medium shadow-sm"
                >
                    <FaPlus className="text-sm" />
                    Agregar Proveedor
                </button>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Barra de búsqueda */}
                    <div className="flex-1">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, email, CUIT..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filtro de país */}
                    <div className="lg:w-64">
                        <select
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                        >
                            {countries.map(country => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Resultados */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <span>
                        Mostrando {filteredSuppliers.length} de {Array.isArray(suppliers) ? suppliers.length : 0} proveedores
                    </span>
                    <span className="text-[#18c29c] font-medium">
                        Total de proveedores activos: {Array.isArray(suppliers) ? suppliers.length : 0}
                    </span>
                </div>
            </div>

            {/* Tabla de proveedores */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabla Desktop */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Proveedor
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Contacto
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    CUIT
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Ubicación
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Fecha
                                </th>
                                {showActions && (
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSuppliers.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#18c29c] to-[#15a884] rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FaBuilding className="text-white text-lg" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {supplier.name || 'Sin nombre'}
                                                </p>
                                                {supplier.fantasy_name && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {supplier.fantasy_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {supplier.email && (
                                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                                    <FaEnvelope className="text-gray-400 text-xs" />
                                                    <span className="truncate">{supplier.email}</span>
                                                </div>
                                            )}
                                            {supplier.phone && (
                                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                                    <FaPhone className="text-gray-400 text-xs" />
                                                    <span>{supplier.phone}</span>
                                                </div>
                                            )}
                                            {supplier.website && (
                                                <div className="flex items-center gap-2 text-sm text-blue-600">
                                                    <FaGlobe className="text-gray-400 text-xs" />
                                                    <a 
                                                        href={supplier.website} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="hover:underline truncate"
                                                    >
                                                        Web
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-mono text-gray-900">
                                            {supplier.cuit || 'Sin CUIT'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-2">
                                            <FaMapMarkerAlt className="text-gray-400 text-xs mt-1 flex-shrink-0" />
                                            <div className="text-sm text-gray-900">
                                                <p>{supplier.city || 'Sin ciudad'}</p>
                                                <p className="text-xs text-gray-500">
                                                    {supplier.state || 'Sin provincia'}, {supplier.country || 'Sin país'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm text-gray-900">
                                                {formatDate(supplier.created_at)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Actualizado: {formatDate(supplier.updated_at)}
                                            </p>
                                        </div>
                                    </td>
                                    {showActions && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="text-gray-400 hover:text-[#18c29c] transition-colors p-1">
                                                    <FaEye className="text-sm" />
                                                </button>
                                                <Link
                                                    href={`/suppliers/edit/${supplier.id}`}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDeleteSupplier(supplier)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Cards Mobile */}
                <div className="lg:hidden">
                    <div className="divide-y divide-gray-200">
                        {filteredSuppliers.map((supplier) => (
                            <div key={supplier.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#18c29c] to-[#15a884] rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FaBuilding className="text-white text-xl" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {supplier.name || 'Sin nombre'}
                                                </h3>
                                                {supplier.fantasy_name && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {supplier.fantasy_name}
                                                    </p>
                                                )}
                                            </div>
                                            {showActions && (
                                                <div className="flex items-center gap-2 ml-2">
                                                    <button className="text-gray-400 hover:text-[#18c29c] transition-colors p-1">
                                                        <FaEye className="text-sm" />
                                                    </button>
                                                    <Link
                                                        href={`/suppliers/edit/${supplier.id}`}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                                    >
                                                        <FaEdit className="text-sm" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDeleteSupplier(supplier)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                    >
                                                        <FaTrash className="text-sm" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Información de contacto */}
                                        <div className="mt-3 space-y-1">
                                            {supplier.email && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <FaEnvelope className="text-gray-400" />
                                                    <span className="text-gray-900 truncate">{supplier.email}</span>
                                                </div>
                                            )}
                                            {supplier.phone && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <FaPhone className="text-gray-400" />
                                                    <span className="text-gray-900">{supplier.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <span className="text-gray-500">CUIT:</span>
                                                <p className="font-medium text-gray-900 font-mono">
                                                    {supplier.cuit || 'Sin CUIT'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Ubicación:</span>
                                                <p className="font-medium text-gray-900">
                                                    {supplier.city || 'Sin ciudad'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">País:</span>
                                                <p className="font-medium text-gray-900">
                                                    {supplier.country || 'Sin país'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Creado:</span>
                                                <p className="font-medium text-gray-900">
                                                    {formatDate(supplier.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Estado vacío */}
                {filteredSuppliers.length === 0 && (
                    <div className="text-center py-12">
                        <FaBuilding className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay proveedores</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || selectedCountry !== "Todos" 
                                ? "No se encontraron proveedores con los filtros aplicados."
                                : "Comienza agregando tu primer proveedor."}
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => setSupplierModal(true)}
                                className="inline-flex items-center gap-2 bg-[#18c29c] text-white px-4 py-2 rounded-lg hover:bg-[#15a884] transition-colors text-sm font-medium"
                            >
                                <FaPlus className="text-sm" />
                                Agregar Proveedor
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de confirmación de eliminación */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDeleteSupplier}
                productName={deleteModal.supplier?.name || deleteModal.supplier?.fantasy_name}
                isDeleting={isDeleting}
                title="Confirmar eliminación de proveedor"
                message="¿Estás seguro de que deseas eliminar este proveedor?"
                itemLabel="Proveedor a eliminar:"
                deleteButtonText="Eliminar Proveedor"
            />

            {/* Modal de agregar proveedor */}
            <SupplierModal
                open={supplierModal}
                onClose={() => setSupplierModal(false)}
                mode="create"
                onCreateSupplier={handleCreateSupplier}
            />
        </div>
    );
}