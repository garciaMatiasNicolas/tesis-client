"use client";
import React, { useState, useEffect } from "react";
import { 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaSearch,  
    FaEye,  
    FaDollarSign, 
    FaShoppingCart, 
    FaUser,
    FaTruck,
    FaCheck,
    FaTimes,
    FaClock,
    FaSpinner,
    FaFileInvoiceDollar
} from "react-icons/fa";
import CustomerDetailModal from "@/components/crm/CustomerDetailModal";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import SalesDetailModal from "@/components/admin/SalesDetailModal";
import { formatPrice, formatDate } from "@/utils/formatData";

export default function SalesTable({ 
    salesOrders = [], 
    loading = false, 
    error = null, 
    onDeleteSale,
    onCreateSale,
    onEditSale,
    onUpdateStatus,
    searchTerm = "",
    onSearchChange,
    showActions = true,
    stats = null,
    currentPage = 1,
    totalPages = 1,
    totalCount = 0,
    pageSize = 8,
    onPageChange
}) {
    const [filteredSales, setFilteredSales] = useState([]);
    const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState("Todos");
    const [selectedChannel, setSelectedChannel] = useState("Todos");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);

    // Delivery status options
    const deliveryStatusOptions = ["Todos", "Entregado", "Pendiente"];
    const channelOptions = ["Todos", "ecommerce", "storefront", "wholesale"];

    // Channel mapping for display
    const channelMap = {
        ecommerce: { label: "E-commerce", icon: FaShoppingCart },
        storefront: { label: "Local físico", icon: FaUser },
        wholesale: { label: "Mayorista", icon: FaFileInvoiceDollar }
    };

    // Helper function to get customer display name
    const getCustomerDisplayName = (customer) => {
        if (!customer) return 'Cliente no asignado';
        
        if (customer.customer_type === 'company') {
            return customer.name || 'Empresa sin nombre';
        } else {
            // Person
            if (customer.first_name || customer.last_name) {
                return `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
            }
            return customer.name || 'Persona sin nombre';
        }
    };

    // Filter sales orders
    useEffect(() => {
        const validSales = Array.isArray(salesOrders) ? salesOrders : [];
        
        let filtered = validSales.filter(sale => {
            const customerName = getCustomerDisplayName(sale.customer);
            const matchesSearch = 
                customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (sale.customer?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (sale.customer?.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (sale.id?.toString() || '').includes(searchTerm.toLowerCase()) ||
                (sale.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            
            const matchesDeliveryStatus = 
                selectedDeliveryStatus === "Todos" || 
                (selectedDeliveryStatus === "Entregado" && sale.was_delivered) ||
                (selectedDeliveryStatus === "Pendiente" && !sale.was_delivered);
            const matchesChannel = selectedChannel === "Todos" || sale.sales_channel === selectedChannel;
            
            return matchesSearch && matchesDeliveryStatus && matchesChannel;
        });

        // Sort the filtered results
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === "customer") {
                aValue = getCustomerDisplayName(a.customer);
                bValue = getCustomerDisplayName(b.customer);
            }

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortOrder === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredSales(filtered);
    }, [salesOrders, searchTerm, selectedDeliveryStatus, selectedChannel, sortBy, sortOrder]);

    // Handle delivery status update
    const handleDeliveryUpdate = async (saleId, wasDelivered) => {
        if (onUpdateStatus) {
            const updateData = { was_delivered: wasDelivered };
            // Si se marca como entregado, agregar la fecha actual
            if (wasDelivered) {
                updateData.delivered_date = new Date().toISOString().split('T')[0];
            } else {
                // Si se desmarca, limpiar la fecha
                updateData.delivered_date = null;
            }
            await onUpdateStatus(saleId, updateData);
        }
    };

    // Handle payment status update
    const handlePaymentUpdate = async (saleId, wasPayed) => {
        if (onUpdateStatus) {
            await onUpdateStatus(saleId, { was_payed: wasPayed });
        }
    };

    // Handle sort
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    // Handle customer detail view
    const handleCustomerClick = (customer) => {
        if (customer) {
            setSelectedCustomer(customer);
            setShowCustomerModal(true);
        }
    };

    const handleCloseCustomerModal = () => {
        setShowCustomerModal(false);
        setSelectedCustomer(null);
    };

    // Handle delete sale with confirmation
    const handleDeleteClick = (sale) => {
        setSaleToDelete(sale);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!saleToDelete || !onDeleteSale) return;
        
        setIsDeleting(true);
        try {
            await onDeleteSale(saleToDelete);
            setShowDeleteModal(false);
            setSaleToDelete(null);
        } catch (error) {
            console.error('Error al eliminar orden:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setSaleToDelete(null);
    };

    // Handle view sale details
    const handleViewDetails = (sale) => {
        setSelectedSale(sale);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedSale(null);
    };

    // Calculate stats from filtered sales
    const filteredStats = {
        total_sales: filteredSales.length,
        total_amount: filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total_price || 0), 0),
        delivered_sales: filteredSales.filter(sale => sale.was_delivered).length,
        pending_delivery: filteredSales.filter(sale => !sale.was_delivered).length,
        paid_sales: filteredSales.filter(sale => sale.was_payed).length,
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-4xl text-[#18c29c]" />
                <span className="ml-2 text-lg text-gray-600">Cargando órdenes de venta...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with title and actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Órdenes de Venta</h1>
                    <p className="text-gray-600 mt-1">Gestiona las órdenes de venta y su estado</p>
                </div>
                <button
                    onClick={onCreateSale}
                    className="inline-flex items-center gap-2 bg-[#18c29c] text-white px-4 py-2 rounded-lg hover:bg-[#15a884] transition-colors text-sm font-medium"
                >
                    <FaPlus className="text-sm" />
                    Nueva Orden
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total de Ventas</p>
                            <p className="text-2xl font-bold text-gray-900">{filteredStats.total_sales}</p>
                        </div>
                        <FaShoppingCart className="text-2xl text-[#18c29c]" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Monto Total</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatPrice(filteredStats.total_amount)}
                            </p>
                        </div>
                        <FaDollarSign className="text-2xl text-green-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Entregados</p>
                            <p className="text-2xl font-bold text-green-600">{filteredStats.delivered_sales}</p>
                        </div>
                        <FaTruck className="text-2xl text-green-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pagadas</p>
                            <p className="text-2xl font-bold text-green-600">{filteredStats.paid_sales}</p>
                        </div>
                        <FaCheck className="text-2xl text-green-500" />
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por cliente, ID de orden o descripción..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full text-black pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select
                            value={selectedDeliveryStatus}
                            onChange={(e) => setSelectedDeliveryStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                        >
                            {deliveryStatusOptions.map(status => (
                                <option key={status} value={status}>
                                    {status === "Todos" ? "Todos los estados" : status}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedChannel}
                            onChange={(e) => setSelectedChannel(e.target.value)}
                            className="px-3 text-black py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                        >
                            {channelOptions.map(channel => (
                                <option key={channel} value={channel}>
                                    {channel === "Todos" ? "Todos los canales" : channelMap[channel]?.label || channel}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('id')}
                                >
                                    ID Orden
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('customer')}
                                >
                                    Cliente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Canal
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('total_price')}
                                >
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado Entrega
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pago
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('delivery_date')}
                                >
                                    Fecha pactada de Entrega
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('created_at')}
                                >
                                    Creada
                                </th>
                                {showActions && (
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSales.map((sale) => {
                                const ChannelIcon = channelMap[sale.sales_channel]?.icon || FaShoppingCart;
                                
                                return (
                                    <tr key={sale.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{sale.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div 
                                                className="text-sm font-medium text-[#15a884] hover:text-[#18c29c] cursor-pointer transition-colors"
                                                onClick={() => handleCustomerClick(sale.customer)}
                                                title="Ver detalles del cliente"
                                            >
                                                {getCustomerDisplayName(sale.customer)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {sale.customer?.email || ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <ChannelIcon className="text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">
                                                    {channelMap[sale.sales_channel]?.label || sale.sales_channel}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatPrice(sale.total_price, sale.currency)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <button
                                                    onClick={() => handleDeliveryUpdate(sale.id, !sale.was_delivered)}
                                                    className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                                                        sale.was_delivered 
                                                            ? 'text-green-800 bg-green-100 hover:bg-green-200' 
                                                            : 'text-yellow-800 bg-yellow-100 hover:bg-yellow-200'
                                                    }`}
                                                >
                                                    {sale.was_delivered ? <FaTruck /> : <FaClock />}
                                                    {sale.was_delivered ? 'Entregado' : 'Pendiente'}
                                                </button>
                                                {sale.was_delivered && sale.delivered_date && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {formatDate(sale.delivered_date)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handlePaymentUpdate(sale.id, !sale.was_payed)}
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    sale.was_payed 
                                                        ? 'text-green-800 bg-green-100 hover:bg-green-200' 
                                                        : 'text-red-800 bg-red-100 hover:bg-red-200'
                                                }`}
                                            >
                                                {sale.was_payed ? 'Pagado' : 'Pendiente'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(sale.delivery_date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(sale.created_at)}
                                        </td>
                                        {showActions && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => onEditSale(sale)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Editar orden"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewDetails(sale)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Ver detalles"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(sale)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Eliminar orden"
                                                    >
                                                        <FaTrash />
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

                {filteredSales.length === 0 && (
                    <div className="text-center py-12">
                        <FaShoppingCart className="mx-auto text-4xl text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes de venta</h3>
                        <p className="text-gray-500 mb-4">
                            {searchTerm || selectedChannel !== "Todos"
                                ? "No se encontraron órdenes que coincidan con los filtros aplicados."
                                : "Comienza creando tu primera orden de venta."
                            }
                        </p>
                        <button
                            onClick={onCreateSale}
                            className="bg-[#18c29c] text-white px-4 py-2 rounded-lg hover:bg-[#15a884] transition-colors"
                        >
                            Crear Primera Orden
                        </button>
                    </div>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-b-lg">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> a <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> de{' '}
                                    <span className="font-medium">{totalCount}</span> resultados
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => onPageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Anterior</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        // Mostrar primera, última, actual y páginas adyacentes
                                        if (
                                            pageNumber === 1 ||
                                            pageNumber === totalPages ||
                                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => onPageChange(pageNumber)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        currentPage === pageNumber
                                                            ? 'z-10 bg-[#18c29c] bg-opacity-10 border-[#18c29c] text-[#18c29c]'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        } else if (
                                            pageNumber === currentPage - 2 ||
                                            pageNumber === currentPage + 2
                                        ) {
                                            return (
                                                <span
                                                    key={pageNumber}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                                >
                                                    ...
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}
                                    <button
                                        onClick={() => onPageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Siguiente</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de detalle del cliente */}
            <CustomerDetailModal
                isOpen={showCustomerModal}
                onClose={handleCloseCustomerModal}
                customer={selectedCustomer}
                readOnly={true}
            />

            {/* Modal de confirmación de eliminación */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                itemName={saleToDelete ? `Orden #${saleToDelete.id} - ${getCustomerDisplayName(saleToDelete.customer)}` : ''}
                itemType="orden de venta"
                isDeleting={isDeleting}
            />

            {/* Modal de detalle de la orden */}
            <SalesDetailModal
                isOpen={showDetailModal}
                onClose={handleCloseDetailModal}
                sale={selectedSale}
            />
        </div>
    );
}