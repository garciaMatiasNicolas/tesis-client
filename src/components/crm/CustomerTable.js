"use client";
import React, { useState, useEffect } from "react";
import { FaUser, FaBuilding, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSpinner, FaCalendarAlt, FaDollarSign, FaChevronDown, FaChevronRight, FaShoppingCart, FaComment, FaCommentDots, FaSave, FaTimes } from "react-icons/fa";

export default function CustomerTable({ 
    customers = [], 
    loading = false, 
    error = null, 
    onDeleteCustomer,
    onCreateCustomer,
    onUpdateCustomer,
    onEditCustomer,
    onAddContact,
    searchTerm = "",
    onSearchChange,
    onFilterChange,
    showActions = true,
    stats = null
}) {
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [customerTypes, setCustomerTypes] = useState(["Todos"]);
    const [selectedType, setSelectedType] = useState("Todos");
    const [countries, setCountries] = useState(["Todos"]);
    const [selectedCountry, setSelectedCountry] = useState("Todos");
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [newComments, setNewComments] = useState({});
    const [editingComment, setEditingComment] = useState(null);
    const [loadingContacts, setLoadingContacts] = useState({});
    const [contactHistories, setContactHistories] = useState({});
    const [showContactForm, setShowContactForm] = useState({});

    // Efecto para filtrar clientes
    useEffect(() => {
        // Asegurar que customers sea siempre un array
        const validCustomers = Array.isArray(customers) ? customers : [];
        console.log('Clientes recibidos:', validCustomers);
        
        let filtered = validCustomers.filter(customer => {
            const matchesSearch = (customer.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (customer.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (customer.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (customer.fantasy_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (customer.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (customer.cuit?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            
            const matchesType = selectedType === "Todos" || customer.customer_type === selectedType;
            const matchesCountry = selectedCountry === "Todos" || customer.country === selectedCountry;
            
            return matchesSearch && matchesType && matchesCountry;
        });

        console.log('Clientes filtrados:', filtered);
        setFilteredCustomers(filtered);
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
        if (customer.display_name) return customer.display_name;
        
        if (customer.customer_type === 'person') {
            return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Sin nombre';
        }
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

    // Manejar expansión de filas
    const toggleRowExpansion = (customerId) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(customerId)) {
            newExpandedRows.delete(customerId);
        } else {
            newExpandedRows.add(customerId);
            // Cargar historial de contactos cuando se expande
            loadContactHistory(customerId);
        }
        setExpandedRows(newExpandedRows);
    };

    // Cargar historial de contactos cuando se expande una fila
    const loadContactHistory = async (customerId) => {
        if (contactHistories[customerId] || loadingContacts[customerId]) {
            return; // Ya se cargó o está cargando
        }

        try {
            setLoadingContacts(prev => ({ ...prev, [customerId]: true }));
            
            // Aquí sería ideal tener una función en el servicio CRM para obtener el historial
            // Por ahora, usamos los datos que ya vienen en el cliente o intentamos llamar directamente
            const customer = customers.find(c => c.id === customerId);
            if (customer && customer.contact_history) {
                setContactHistories(prev => ({ 
                    ...prev, 
                    [customerId]: customer.contact_history
                }));
            }
        } catch (error) {
            console.error('Error loading contact history:', error);
        } finally {
            setLoadingContacts(prev => ({ ...prev, [customerId]: false }));
        }
    };

    // Manejar agregar contacto
    const handleAddContact = async (customerId) => {
        const comment = newComments[customerId];
        if (comment && comment.trim() && onAddContact) {
            try {
                const contactData = {
                    comment: comment.trim(),
                    contacted_by: null // Se establecerá en el backend
                };
                
                await onAddContact(customerId, contactData);
                
                // Limpiar el comentario temporal
                setNewComments({
                    ...newComments,
                    [customerId]: ''
                });

                // Recargar el historial de contactos
                setContactHistories(prev => ({ ...prev, [customerId]: null }));
                await loadContactHistory(customerId);
                
            } catch (error) {
                console.error('Error adding contact:', error);
                alert('Error al agregar el contacto. Por favor, intenta nuevamente.');
            }
        }
    };

    // Manejar mostrar/ocultar formulario de contacto
    const toggleContactForm = (customerId) => {
        setShowContactForm(prev => ({
            ...prev,
            [customerId]: !prev[customerId]
        }));
    };

    // Manejar edición de comentario existente (placeholder para futura implementación)
    const handleEditComment = (customerId, commentIndex, newText) => {
        console.log('Editar contacto', commentIndex, 'del cliente', customerId, ':', newText);
        setEditingComment(null);
    };

    // Cancelar edición de comentario
    const cancelEditComment = () => {
        setEditingComment(null);
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filtro de tipo */}
                    <div className="lg:w-48">
                        <select
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12">
                                    
                                </th>
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
                                    Actividad
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
                                const isExpanded = expandedRows.has(customer.id);
                                
                                return (
                                    <React.Fragment key={customer.id}>
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleRowExpansion(customer.id)}
                                                    className="text-gray-400 hover:text-[#18c29c] transition-colors p-1"
                                                >
                                                    {isExpanded ? (
                                                        <FaChevronDown className="text-sm" />
                                                    ) : (
                                                        <FaChevronRight className="text-sm" />
                                                    )}
                                                </button>
                                            </td>
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
                                                    <p>{customer.city || 'Sin ciudad'}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {customer.state || 'Sin provincia'}, {customer.country || 'Sin país'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {customer.last_date_contacted && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <FaCalendarAlt className="text-gray-400" />
                                                        <span>Contactado: {formatDate(customer.last_date_contacted)}</span>
                                                    </div>
                                                )}
                                                {customer.last_purchase_date && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <FaCalendarAlt className="text-gray-400" />
                                                        <span>Última compra: {formatDate(customer.last_purchase_date)}</span>
                                                    </div>
                                                )}
                                                {!customer.last_date_contacted && !customer.last_purchase_date && (
                                                    <span className="text-xs text-gray-400">Sin actividad</span>
                                                )}
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
                                                    <button className="text-gray-400 hover:text-[#18c29c] transition-colors p-1">
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
                                                    >
                                                        <FaTrash className="text-sm" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                    
                                    {/* Fila expandida con detalles */}
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={showActions ? 8 : 7} className="px-6 py-0">
                                                <div className="bg-gray-50 -mx-6 px-6 py-6">
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        {/* Historial de compras */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <FaShoppingCart className="text-[#18c29c]" />
                                                                <h4 className="font-semibold text-gray-900">Historial de Compras</h4>
                                                            </div>
                                                            
                                                            {customer.purchases && customer.purchases.length > 0 ? (
                                                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                                                    {customer.purchases.map((purchase, index) => (
                                                                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                                                                            <div className="flex justify-between items-start mb-2">
                                                                                <div>
                                                                                    <p className="font-medium text-gray-900">
                                                                                        Orden #{purchase.order_number}
                                                                                    </p>
                                                                                    <p className="text-sm text-gray-600">
                                                                                        {formatDate(purchase.date)}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <p className="font-semibold text-gray-900">
                                                                                        {formatCurrency(purchase.total)}
                                                                                    </p>
                                                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                                        purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                                        purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                                        'bg-red-100 text-red-800'
                                                                                    }`}>
                                                                                        {purchase.status === 'completed' ? 'Completada' :
                                                                                         purchase.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            {purchase.items && (
                                                                                <div className="text-sm text-gray-600">
                                                                                    <p className="font-medium mb-1">Productos:</p>
                                                                                    <ul className="space-y-1">
                                                                                        {purchase.items.map((item, itemIndex) => (
                                                                                            <li key={itemIndex} className="flex justify-between">
                                                                                                <span>{item.product_name} x{item.quantity}</span>
                                                                                                <span>{formatCurrency(item.price * item.quantity)}</span>
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-8 text-gray-500">
                                                                    <FaShoppingCart className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                                                    <p>No hay compras registradas</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Comentarios */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <FaCommentDots className="text-[#18c29c]" />
                                                                <h4 className="font-semibold text-gray-900">Comentarios</h4>
                                                            </div>
                                                            
                                                            {/* Agregar nuevo comentario */}
                                                            <div className="mb-4">
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Agregar comentario..."
                                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-sm"
                                                                        value={newComments[customer.id] || ''}
                                                                        onChange={(e) => setNewComments({
                                                                            ...newComments,
                                                                            [customer.id]: e.target.value
                                                                        })}
                                                                        onKeyPress={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                handleAddComment(customer.id);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <button
                                                                        onClick={() => handleAddComment(customer.id)}
                                                                        disabled={!newComments[customer.id]?.trim()}
                                                                        className="px-3 py-2 bg-[#18c29c] text-white rounded-lg hover:bg-[#15a884] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        <FaSave className="text-sm" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Lista de contactos existentes */}
                                                            {contactHistories[customer.id] && contactHistories[customer.id].length > 0 ? (
                                                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                                                    {contactHistories[customer.id].map((contact, index) => (
                                                                        <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                                                                            {editingComment === `${customer.id}-${index}` ? (
                                                                                <div className="space-y-2">
                                                                                    <textarea
                                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-sm"
                                                                                        rows="3"
                                                                                        defaultValue={contact.comment}
                                                                                        onKeyPress={(e) => {
                                                                                            if (e.key === 'Enter' && e.ctrlKey) {
                                                                                                handleEditComment(customer.id, index, e.target.value);
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <div className="flex gap-2">
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                const textarea = e.target.closest('.space-y-2').querySelector('textarea');
                                                                                                handleEditComment(customer.id, index, textarea.value);
                                                                                            }}
                                                                                            className="px-2 py-1 bg-[#18c29c] text-white rounded text-xs hover:bg-[#15a884] transition-colors"
                                                                                        >
                                                                                            <FaSave className="text-xs" />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={cancelEditComment}
                                                                                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition-colors"
                                                                                        >
                                                                                            <FaTimes className="text-xs" />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div>
                                                                                    <div className="flex justify-between items-start mb-2">
                                                                                        <div className="flex-1">
                                                                                            <p className="text-sm text-gray-900">{contact.comment}</p>
                                                                                        </div>
                                                                                        <button
                                                                                            onClick={() => setEditingComment(`${customer.id}-${index}`)}
                                                                                            className="text-gray-400 hover:text-[#18c29c] transition-colors ml-2"
                                                                                        >
                                                                                            <FaEdit className="text-xs" />
                                                                                        </button>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                                                                        <span>Contactado: {formatDate(contact.date)}</span>
                                                                                        <span>Por: {contact.contacted_by || 'Sistema'}</span>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : customer.contact_history && customer.contact_history.length > 0 ? (
                                                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                                                    {customer.contact_history.map((contact, index) => (
                                                                        <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                                                                            <div>
                                                                                <div className="flex justify-between items-start mb-2">
                                                                                    <div className="flex-1">
                                                                                        <p className="text-sm text-gray-900">{contact.comment}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex justify-between items-center text-xs text-gray-500">
                                                                                    <span>Contactado: {formatDate(contact.date)}</span>
                                                                                    <span>Por: {contact.contacted_by || 'Sistema'}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : loadingContacts[customer.id] ? (
                                                                <div className="text-center py-4 text-gray-500">
                                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#18c29c] mx-auto"></div>
                                                                    <p className="mt-2 text-sm">Cargando historial de contactos...</p>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-8 text-gray-500">
                                                                    <FaComment className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                                                    <p>No hay contactos registrados</p>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Comentario principal del cliente */}
                                                            {customer.comments && (
                                                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                                    <h5 className="font-medium text-blue-900 mb-2">Comentario Principal:</h5>
                                                                    <p className="text-sm text-blue-800">{customer.comments}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
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
                            const isExpanded = expandedRows.has(customer.id);
                            
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
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => toggleRowExpansion(customer.id)}
                                                        className="text-gray-400 hover:text-[#18c29c] transition-colors p-1"
                                                    >
                                                        {isExpanded ? (
                                                            <FaChevronDown className="text-sm" />
                                                        ) : (
                                                            <FaChevronRight className="text-sm" />
                                                        )}
                                                    </button>
                                                    {showActions && (
                                                        <div className="flex items-center gap-2">
                                                            <button className="text-gray-400 hover:text-[#18c29c] transition-colors p-1">
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
                                                            >
                                                                <FaTrash className="text-sm" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
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
                                            
                                            {/* Contenido expandido para móvil */}
                                            {isExpanded && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <div className="space-y-4">
                                                        {/* Historial de compras móvil */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <FaShoppingCart className="text-[#18c29c]" />
                                                                <h4 className="font-semibold text-gray-900 text-sm">Compras</h4>
                                                            </div>
                                                            
                                                            {customer.purchases && customer.purchases.length > 0 ? (
                                                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                                                    {customer.purchases.slice(0, 3).map((purchase, index) => (
                                                                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                                                            <div className="flex justify-between items-start mb-1">
                                                                                <span className="text-xs font-medium text-gray-900">
                                                                                    #{purchase.order_number}
                                                                                </span>
                                                                                <span className="text-xs font-semibold text-gray-900">
                                                                                    {formatCurrency(purchase.total)}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-xs text-gray-600">
                                                                                    {formatDate(purchase.date)}
                                                                                </span>
                                                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                                                                    purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                                    purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                                    'bg-red-100 text-red-800'
                                                                                }`}>
                                                                                    {purchase.status === 'completed' ? 'OK' :
                                                                                     purchase.status === 'pending' ? 'Pend.' : 'Canc.'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {customer.purchases.length > 3 && (
                                                                        <p className="text-xs text-gray-500 text-center">
                                                                            Y {customer.purchases.length - 3} compras más...
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-4 text-gray-500">
                                                                    <FaShoppingCart className="mx-auto h-6 w-6 text-gray-300 mb-1" />
                                                                    <p className="text-xs">Sin compras</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Comentarios móvil */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <FaCommentDots className="text-[#18c29c]" />
                                                                <h4 className="font-semibold text-gray-900 text-sm">Comentarios</h4>
                                                            </div>
                                                            
                                                            {/* Input para nuevo comentario */}
                                                            <div className="mb-3">
                                                                <div className="flex gap-1">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Nuevo comentario..."
                                                                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#18c29c] focus:border-transparent"
                                                                        value={newComments[customer.id] || ''}
                                                                        onChange={(e) => setNewComments({
                                                                            ...newComments,
                                                                            [customer.id]: e.target.value
                                                                        })}
                                                                        onKeyPress={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                handleAddComment(customer.id);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <button
                                                                        onClick={() => handleAddComment(customer.id)}
                                                                        disabled={!newComments[customer.id]?.trim()}
                                                                        className="px-2 py-1 bg-[#18c29c] text-white rounded text-xs hover:bg-[#15a884] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        <FaSave className="text-xs" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Lista de contactos */}
                                                            {(contactHistories[customer.id] || customer.contact_history) && 
                                                             (contactHistories[customer.id] || customer.contact_history).length > 0 ? (
                                                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                                                    {(contactHistories[customer.id] || customer.contact_history).slice(0, 2).map((contact, index) => (
                                                                        <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                                                                            <p className="text-gray-900 mb-1">{contact.comment}</p>
                                                                            <div className="flex justify-between text-xs text-gray-500">
                                                                                <span>Contactado: {formatDate(contact.date)}</span>
                                                                                <span>Por: {contact.contacted_by || 'Sistema'}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {(contactHistories[customer.id] || customer.contact_history).length > 2 && (
                                                                        <p className="text-xs text-gray-500 text-center">
                                                                            Y {(contactHistories[customer.id] || customer.contact_history).length - 2} contactos más...
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : loadingContacts[customer.id] ? (
                                                                <div className="text-center py-4 text-gray-500">
                                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#18c29c] mx-auto"></div>
                                                                    <p className="mt-1 text-xs">Cargando contactos...</p>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-4 text-gray-500">
                                                                    <FaComment className="mx-auto h-6 w-6 text-gray-300 mb-1" />
                                                                    <p className="text-xs">Sin contactos registrados</p>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Comentario principal */}
                                                            {customer.comments && (
                                                                <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                                                                    <p className="text-xs font-medium text-blue-900 mb-1">Comentario Principal:</p>
                                                                    <p className="text-xs text-blue-800">{customer.comments}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
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
        </div>
    );
}