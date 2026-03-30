"use client";
import React, { useState, useEffect } from "react";
import { FaUser, FaBuilding, FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSpinner, FaCalendarAlt, FaDollarSign } from "react-icons/fa";
import CustomerDetailModal from "./CustomerDetailModal";

export default function CustomerTable({ 
    customers = [], 
    loading = false, 
    error = null, 
    onDeleteCustomer,
    onCreateCustomer,
    onEditCustomer,
    onAddContact,
    searchTerm = "",
    onSearchChange,
    showActions = true,
    stats = null
}) {
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [customerTypes, setCustomerTypes] = useState(["Todos"]);
    const [selectedType, setSelectedType] = useState("Todos");
    const [countries, setCountries] = useState(["Todos"]);
    const [selectedCountry, setSelectedCountry] = useState("Todos");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Efecto para filtrar clientes
    useEffect(() => {
        // Asegurar que customers sea siempre un array
        const validCustomers = Array.isArray(customers) ? customers : [];
       
        let filtered = validCustomers.filter(customer => {
            const matchesSearch = (customer.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (customer.display_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (customer.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (customer.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (customer.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (customer.fantasy_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (customer.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (customer.cuit?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            
            const matchesType = selectedType === "Todos" || customer.customer_type === selectedType;
            const matchesCountry = selectedCountry === "Todos" || customer.country === selectedCountry;
            
            return matchesSearch && matchesType && matchesCountry;
        });

        setFilteredCustomers(filtered);
        console.log(customers)
    }, [customers, searchTerm, selectedType, selectedCountry]);

    // Efecto para obtener tipos y países únicos
    useEffect(() => {
        // Asegurar que customers sea siempre un array
        const validCustomers = Array.isArray(customers) ? customers : [];
        
        const uniqueTypes = [...new Set(validCustomers.map(customer => customer.customer_type).filter(Boolean))];
        const uniqueCountries = [...new Set(validCustomers.map(customer => customer.country).filter(Boolean))];
        
        setCustomerTypes(["Todos", ...uniqueTypes]);
        setCountries(["Todos", ...uniqueCountries]);
    }, [customers]);

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        return new Date(dateString).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Formatear moneda
    const formatCurrency = (amount) => {
        if (!amount || amount === 0) return '$0';
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    };

    // Obtener nombre completo del cliente
    const getCustomerDisplayName = (customer) => {
        // Primero intentar usar display_name si existe
        if (customer.display_name && customer.display_name.trim()) {
            return customer.display_name;
        }
        
        // Si no hay display_name, usar full_name
        if (customer.full_name && customer.full_name.trim()) {
            return customer.full_name;
        }
        
        // Fallback para otros campos (por compatibilidad)
        if (customer.customer_type === 'person') {
            const firstName = customer.first_name || '';
            const lastName = customer.last_name || '';
            if (firstName || lastName) {
                return `${firstName} ${lastName}`.trim();
            }
        }
        
        // Últimos fallbacks
        return customer.name || customer.fantasy_name || 'Sin nombre';
    };

    // Obtener icono según tipo de cliente
    const getCustomerIcon = (customerType) => {
        return customerType === 'person' ? FaUser : FaBuilding;
    };

    // Manejar eliminación de cliente
    const handleDeleteCustomer = (customer) => {
        if (onDeleteCustomer) {
            onDeleteCustomer(customer);
        }
    };

    // Abrir modal de detalles del cliente
    const handleViewCustomerDetails = (customer) => {
        setSelectedCustomer(customer);
        setIsDetailModalOpen(true);
    };

    // Cerrar modal de detalles
    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedCustomer(null);
    };

    // Callback cuando se agrega un contacto (para recargar datos si es necesario)
    const handleContactAdded = () => {
        // Aquí podrías recargar la lista de clientes si es necesario
        // Por ahora solo cerramos y podríamos notificar al componente padre
        console.log('Contact added successfully');
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <FaSpinner className="animate-spin mx-auto h-8 w-8 text-[#18c29c] mb-4" />
                    <p className="text-gray-600">Cargando clientes...</p>
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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clientes</h1>
                    <p className="text-gray-600 mt-1">Gestiona tu base de clientes</p>
                </div>
                <button
                    onClick={() => onCreateCustomer && onCreateCustomer()}
                    className="inline-flex items-center gap-2 bg-[#18c29c] text-white px-4 py-2 rounded-lg hover:bg-[#15a884] transition-colors font-medium shadow-sm"
                >
                    <FaPlus className="text-sm" />
                    Agregar Cliente
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                                value={searchTerm}
                                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filtro de tipo */}
                    <div className="lg:w-48">
                        <select
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            {customerTypes.map(type => (
                                <option key={type} value={type}>
                                    {type === "Todos" ? "Todos los tipos" : 
                                     type === "person" ? "Personas" : 
                                     type === "company" ? "Empresas" : type}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro de país */}
                    <div className="lg:w-48">
                        <select
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
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

                {/* Resultados y estadísticas */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
                    <div className="text-gray-600">
                        <span>
                            Mostrando {filteredCustomers.length} de {Array.isArray(customers) ? customers.length : 0} clientes
                        </span>
                        {stats && (
                            <div className="mt-1 text-xs text-gray-500">
                                Total en sistema: {stats.total_customers} | 
                                Con compras: {stats.customers_with_purchases} | 
                                Contactados: {stats.customers_with_contacts}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 text-xs">
                        <span className="text-[#18c29c] font-medium">
                            Clientes activos: {Array.isArray(customers) ? customers.length : 0}
                        </span>
                        {stats && (
                            <span className="text-gray-500">
                                Ingresos totales: {new Intl.NumberFormat('es-AR', {
                                    style: 'currency',
                                    currency: 'ARS'
                                }).format(stats.total_revenue || 0)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabla de clientes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabla Desktop */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Cliente
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Contacto
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Tipo/CUIT
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Ubicación
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Total Gastado
                                </th>
                                {showActions && (
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCustomers.map((customer) => {
                                const CustomerIcon = getCustomerIcon(customer.customer_type);
                                
                                return (
                                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-[#18c29c] to-[#15a884] rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <CustomerIcon className="text-white text-lg" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {getCustomerDisplayName(customer)}
                                                    </p>
                                                    {customer.customer_type === 'company' && customer.fantasy_name && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {customer.fantasy_name}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        ID: {customer.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {customer.email && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-900">
                                                        <FaEnvelope className="text-gray-400 text-xs" />
                                                        <span className="truncate">{customer.email}</span>
                                                    </div>
                                                )}
                                                {customer.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-900">
                                                        <FaPhone className="text-gray-400 text-xs" />
                                                        <span>{customer.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    customer.customer_type === 'person' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {customer.customer_type === 'person' ? 'Persona' : 'Empresa'}
                                                </span>
                                                {customer.cuit && (
                                                    <p className="text-sm font-mono text-gray-600 mt-1">
                                                        CUIT: {customer.cuit}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2">
                                                <FaMapMarkerAlt className="text-gray-400 text-xs mt-1 flex-shrink-0" />
                                                <div className="text-sm text-gray-900">
                                                    {customer.address && (
                                                        <p className="font-medium">{customer.address}</p>
                                                    )}
                                                    <p>{customer.city || 'Sin ciudad'}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {customer.state || 'Sin provincia'}, {customer.country || 'Sin país'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FaDollarSign className="text-green-500 text-sm" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(customer.total_spent)}
                                                </span>
                                            </div>
                                        </td>
                                        {showActions && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewCustomerDetails(customer)}
                                                        className="text-gray-400 hover:text-[#18c29c] transition-colors p-1"
                                                        title="Ver detalles"
                                                    >
                                                        <FaEye className="text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={() => onEditCustomer && onEditCustomer(customer)}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                                        title="Editar cliente"
                                                    >
                                                        <FaEdit className="text-sm" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteCustomer(customer)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                        title="Eliminar cliente"
                                                    >
                                                        <FaTrash className="text-sm" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Cards Mobile */}
                <div className="lg:hidden">
                    <div className="divide-y divide-gray-200">
                        {filteredCustomers.map((customer) => {
                            const CustomerIcon = getCustomerIcon(customer.customer_type);
                            
                            return (
                                <div key={customer.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="w-16 h-16 bg-gradient-to-br from-[#18c29c] to-[#15a884] rounded-lg flex items-center justify-center flex-shrink-0">
                                            <CustomerIcon className="text-white text-xl" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                                        {getCustomerDisplayName(customer)}
                                                    </h3>
                                                    {customer.customer_type === 'company' && customer.fantasy_name && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {customer.fantasy_name}
                                                        </p>
                                                    )}
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                                        customer.customer_type === 'person' 
                                                            ? 'bg-blue-100 text-blue-800' 
                                                            : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {customer.customer_type === 'person' ? 'Persona' : 'Empresa'}
                                                    </span>
                                                </div>
                                                {showActions && (
                                                    <div className="flex items-center gap-2 ml-2">
                                                        <button
                                                            onClick={() => handleViewCustomerDetails(customer)}
                                                            className="text-gray-400 hover:text-[#18c29c] transition-colors p-1"
                                                            title="Ver detalles"
                                                        >
                                                            <FaEye className="text-sm" />
                                                        </button>
                                                        <button
                                                            onClick={() => onEditCustomer && onEditCustomer(customer)}
                                                            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                                            title="Editar cliente"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteCustomer(customer)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                            title="Eliminar cliente"
                                                        >
                                                            <FaTrash className="text-sm" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Información de contacto */}
                                            <div className="mt-3 space-y-1">
                                                {customer.email && (
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <FaEnvelope className="text-gray-400" />
                                                        <span className="text-gray-900 truncate">{customer.email}</span>
                                                    </div>
                                                )}
                                                {customer.phone && (
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <FaPhone className="text-gray-400" />
                                                        <span className="text-gray-900">{customer.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                                                <div>
                                                    <span className="text-gray-500">Ubicación:</span>
                                                    <p className="font-medium text-gray-900">
                                                        {customer.city || 'Sin ciudad'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Total gastado:</span>
                                                    <p className="font-medium text-gray-900">
                                                        {formatCurrency(customer.total_spent)}
                                                    </p>
                                                </div>
                                                {customer.cuit && (
                                                    <div className="col-span-2">
                                                        <span className="text-gray-500">CUIT:</span>
                                                        <p className="font-medium text-gray-900 font-mono">
                                                            {customer.cuit}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Estado vacío */}
                {filteredCustomers.length === 0 && (
                    <div className="text-center py-12">
                        <FaUser className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || selectedType !== "Todos" || selectedCountry !== "Todos"
                                ? "No se encontraron clientes con los filtros aplicados."
                                : "Comienza agregando tu primer cliente."}
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => onCreateCustomer && onCreateCustomer()}
                                className="inline-flex items-center gap-2 bg-[#18c29c] text-white px-4 py-2 rounded-lg hover:bg-[#15a884] transition-colors text-sm font-medium"
                            >
                                <FaPlus className="text-sm" />
                                Agregar Cliente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de detalles del cliente */}
            <CustomerDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                customer={selectedCustomer}
                onContactAdded={handleContactAdded}
            />
        </div>
    );
}