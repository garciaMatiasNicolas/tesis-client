"use client";
import React, { useState } from 'react';
import { 
    FaSearch, 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaEye,
    FaFileInvoice,
    FaWarehouse,
    FaTruck,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaBox
} from 'react-icons/fa';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import PurchaseDetailModal from './PurchaseDetailModal';
import { formatDate, formatPrice } from '@/utils/formatData';

export default function PurchaseOrdersTable({
    purchaseOrders = [],
    loading = false,
    error = null,
    onDeletePurchase,
    onCreatePurchase,
    onEditPurchase,
    onUpdateStatus,
    onUpdatePayment,
    onUpdateReceived,
    searchTerm = "",
    onSearchChange,
    showActions = true,
    stats = null,
    currentPage = 1,
    totalPages = 1,
    totalCount = 0,
    pageSize = 10,
    onPageChange
}) {
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, purchase: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [detailModal, setDetailModal] = useState({ isOpen: false, purchase: null });
    const [filterStatus, setFilterStatus] = useState('all');

    // Obtener badge de estado
    const getStatusBadge = (status) => {
        const badges = {
            'pending': {
                label: 'Pendiente',
                color: 'bg-yellow-100 text-yellow-800',
                icon: <FaClock className="inline mr-1" />
            },
            'approved': {
                label: 'Aprobada',
                color: 'bg-green-100 text-green-800',
                icon: <FaCheckCircle className="inline mr-1" />
            },
            'rejected': {
                label: 'Rechazada',
                color: 'bg-red-100 text-red-800',
                icon: <FaTimesCircle className="inline mr-1" />
            }
        };
        
        const badge = badges[status] || badges['pending'];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.icon}
                {badge.label}
            </span>
        );
    };

    // Formatear moneda usando formatPrice de utils
    const formatCurrency = formatPrice;

    // Filtrar órdenes
    const filteredOrders = purchaseOrders.filter(order => {
        const matchesSearch = 
            order.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    // Manejar eliminación
    const handleDeleteClick = (purchase) => {
        setDeleteModal({ isOpen: true, purchase });
    };

    const confirmDelete = async () => {
        if (!deleteModal.purchase || !onDeletePurchase) return;
        
        setIsDeleting(true);
        try {
            await onDeletePurchase(deleteModal.purchase);
            closeDeleteModal();
        } catch (error) {
            console.error('Error eliminando orden:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, purchase: null });
        setIsDeleting(false);
    };

    // Manejar detalles
    const handleViewDetails = (purchase) => {
        setDetailModal({ isOpen: true, purchase });
    };

    const closeDetailModal = () => {
        setDetailModal({ isOpen: false, purchase: null });
    };

    // Loading state
    if (loading && purchaseOrders.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18c29c]"></div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con estadísticas */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Órdenes de Compra</h1>
                    <p className="text-gray-600 mt-1">
                        Administra las órdenes de compra a proveedores
                    </p>
                </div>
                {showActions && (
                    <button
                        onClick={onCreatePurchase}
                        className="inline-flex items-center px-4 py-2 bg-[#18c29c] hover:bg-[#15a884] text-white rounded-lg transition-colors duration-200 shadow-sm"
                    >
                        <FaPlus className="mr-2" />
                        Nueva Orden de Compra
                    </button>
                )}
            </div>

            {/* Estadísticas */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <FaFileInvoice className="text-gray-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pendientes</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <FaClock className="text-yellow-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Aprobadas</p>
                                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <FaCheckCircle className="text-green-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Rechazadas</p>
                                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <FaTimesCircle className="text-red-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Monto Total</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
                            </div>
                            <div className="w-12 h-12 bg-[#18c29c]/10 rounded-full flex items-center justify-center">
                                <span className="text-[#18c29c] text-xl font-bold">$</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Búsqueda */}
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por proveedor, método de pago o descripción..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all duration-200 text-black"
                        />
                    </div>

                    {/* Filtro por estado */}
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all duration-200 appearance-none bg-white text-black"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pending">Pendientes</option>
                            <option value="approved">Aprobadas</option>
                            <option value="rejected">Rechazadas</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabla de órdenes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <FaFileInvoice className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes de compra</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || filterStatus !== 'all'
                                ? "No se encontraron órdenes con los filtros aplicados."
                                : "Comienza creando una nueva orden de compra."}
                        </p>
                        {showActions && !searchTerm && filterStatus === 'all' && (
                            <button
                                onClick={onCreatePurchase}
                                className="mt-4 inline-flex items-center px-4 py-2 bg-[#18c29c] hover:bg-[#15a884] text-white rounded-lg transition-colors duration-200"
                            >
                                <FaPlus className="mr-2" />
                                Nueva Orden de Compra
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID ORDEN
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Proveedor
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Destino
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Método de Pago
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha Entrega
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pagado
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        {showActions && (
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    #{order.id || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-[#18c29c]/10 rounded-lg flex items-center justify-center">
                                                        <FaTruck className="h-5 w-5 text-[#18c29c]" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {order.supplier?.name || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {order.items?.length || 0} items
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    {order.warehouse_destination?.name ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Dep: {order.warehouse_destination.name}
                                                        </span>
                                                    ) : order.branch_destination?.name ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            Suc: {order.branch_destination.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Sin destino</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {order.payment_method || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(order.delivery_date)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {order.was_payed ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <FaCheckCircle className="mr-1" /> Sí
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        <FaClock className="mr-1" /> No
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(order.total_price)}
                                                </div>
                                            </td>
                                            {showActions && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleViewDetails(order)}
                                                        className="text-gray-600 hover:text-gray-900 mr-3 inline-flex items-center transition-colors duration-150"
                                                        title="Ver detalles"
                                                    >
                                                        <FaEye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onEditPurchase(order)}
                                                        className="text-[#18c29c] hover:text-[#15a884] mr-3 inline-flex items-center transition-colors duration-150"
                                                        title="Editar"
                                                    >
                                                        <FaEdit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(order)}
                                                        className="text-red-600 hover:text-red-900 inline-flex items-center transition-colors duration-150"
                                                        title="Eliminar"
                                                    >
                                                        <FaTrash className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                                            Mostrando{' '}
                                            <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span>
                                            {' '}-{' '}
                                            <span className="font-medium">
                                                {Math.min(currentPage * pageSize, totalCount)}
                                            </span>
                                            {' '}de{' '}
                                            <span className="font-medium">{totalCount}</span>
                                            {' '}resultados
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
                                                ←
                                            </button>
                                            {[...Array(totalPages)].map((_, idx) => (
                                                <button
                                                    key={idx + 1}
                                                    onClick={() => onPageChange(idx + 1)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        currentPage === idx + 1
                                                            ? 'z-10 bg-[#18c29c] border-[#18c29c] text-white'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => onPageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Siguiente</span>
                                                →
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal de eliminación */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                itemName={`# ORDEN ${deleteModal.purchase?.id || ''}`}
                itemType="Orden de Compra"
                deleteButtonText="Eliminar Orden"
                isDeleting={isDeleting}
            />

            {/* Modal de detalles */}
            {detailModal.isOpen && (
                <PurchaseDetailModal
                    isOpen={detailModal.isOpen}
                    onClose={closeDetailModal}
                    purchase={detailModal.purchase}
                    onUpdateStatus={onUpdateStatus}
                    onUpdatePayment={onUpdatePayment}
                    onUpdateReceived={onUpdateReceived}
                />
            )}
        </div>
    );
}
