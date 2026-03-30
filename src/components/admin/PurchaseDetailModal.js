"use client";
import React, { useState } from 'react';
import { FaTimes, FaFileInvoice, FaCalendar, FaWarehouse, FaTruck, FaBox } from 'react-icons/fa';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { formatDate as formatDateUtil, formatPrice } from '@/utils/formatData';

export default function PurchaseDetailModal({
    isOpen,
    onClose,
    purchase,
    onUpdateStatus,
    onUpdatePayment,
    onUpdateReceived
}) {
    if (!isOpen || !purchase) return null;

    // Estados para modales de confirmación
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: null, // 'approve', 'reject', 'payment', 'received'
        action: null,
        isProcessing: false,
        comment: '',
        requireComment: false
    });

    const [commentError, setCommentError] = useState('');

    // Usar funciones de formato de utils
    const formatDate = formatDateUtil;
    const formatCurrency = formatPrice;

    // Obtener badge de estado
    const getStatusBadge = (status) => {
        const badges = {
            'pending': {
                label: 'Pendiente',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
            },
            'approved': {
                label: 'Aprobado',
                color: 'bg-green-100 text-green-800 border-green-200'
            },
            'rejected': {
                label: 'Rechazado',
                color: 'bg-red-100 text-red-800 border-red-200'
            }
        };
        
        const badge = badges[status] || badges['pending'];
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    // Obtener badge de comprado
    const getBuyedBadge = (wasBuyed) => {
        return wasBuyed ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-green-100 text-green-800 border-green-200">
                Sí
            </span>
        ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-gray-100 text-gray-800 border-gray-200">
                No
            </span>
        );
    };

    const handleStatusChange = (newStatus) => {
        setConfirmModal({
            isOpen: true,
            type: newStatus === 'approved' ? 'approve' : 'reject',
            action: (comment) => {
                if (onUpdateStatus) {
                    onUpdateStatus(purchase.id, newStatus, comment);
                    onClose();
                }
            },
            isProcessing: false,
            comment: '',
            requireComment: true
        });
        setCommentError('');
    };

    const handlePaymentChange = (wasPayed) => {
        setConfirmModal({
            isOpen: true,
            type: wasPayed ? 'mark-payed' : 'unmark-payed',
            action: (comment) => {
                if (onUpdatePayment) {
                    setConfirmModal(prev => ({ ...prev, isProcessing: true }));
                    onUpdatePayment(purchase.id, wasPayed, comment);
                    setTimeout(() => {
                        setConfirmModal({ isOpen: false, type: null, action: null, isProcessing: false, comment: '', requireComment: false });
                        onClose();
                    }, 500);
                }
            },
            isProcessing: false,
            comment: '',
            requireComment: true
        });
        setCommentError('');
    };

    const handleReceivedChange = (received, receivedDate) => {
        setConfirmModal({
            isOpen: true,
            type: received ? 'mark-received' : 'unmark-received',
            action: (comment) => {
                if (onUpdateReceived) {
                    setConfirmModal(prev => ({ ...prev, isProcessing: true }));
                    onUpdateReceived(purchase.id, received, receivedDate, comment);
                    setTimeout(() => {
                        setConfirmModal({ isOpen: false, type: null, action: null, isProcessing: false, comment: '', requireComment: false });
                        onClose();
                    }, 500);
                }
            },
            isProcessing: false,
            comment: '',
            requireComment: true
        });
        setCommentError('');
    };

    const closeConfirmModal = () => {
        if (!confirmModal.isProcessing) {
            setConfirmModal({ isOpen: false, type: null, action: null, isProcessing: false, comment: '', requireComment: false });
            setCommentError('');
        }
    };

    const confirmAction = () => {
        if (confirmModal.action) {
            if (confirmModal.requireComment && !confirmModal.comment.trim()) {
                setCommentError('Debe ingresar un comentario.');
                return;
            }
            confirmModal.action(confirmModal.comment.trim());
        }
    };

    // Configuración del modal según el tipo de acción
    const getConfirmModalConfig = () => {
        const configs = {
            'approve': {
                actionType: 'warning',
                title: 'Confirmar aprobación',
                message: '¿Estás seguro de que deseas aprobar esta orden de compra?',
                detailLabel: 'Orden',
                detailValue: `# ORDEN ${purchase.id}`,
                warningMessage: 'Esta acción puede activar procesos de facturación, notificaciones y actualización de inventario.',
                confirmButtonText: 'Aprobar',
                confirmButtonColor: 'green'
            },
            'reject': {
                actionType: 'warning',
                title: 'Confirmar rechazo',
                message: '¿Estás seguro de que deseas rechazar esta orden de compra?',
                detailLabel: 'Orden',
                detailValue: `# ORDEN ${purchase.id}`,
                warningMessage: 'Esta acción cancelará la orden y puede notificar al proveedor.',
                confirmButtonText: 'Rechazar',
                confirmButtonColor: 'red'
            },
            'mark-payed': {
                actionType: 'info',
                title: 'Marcar como pagado',
                message: '¿Confirmas que esta orden fue pagada?',
                detailLabel: 'Orden',
                detailValue: `# ORDEN ${purchase.id} - ${purchase.supplier?.name || 'Sin proveedor'}`,
                warningMessage: 'Esto actualizará el estado de pago en el sistema y puede afectar reportes financieros.',
                confirmButtonText: 'Marcar como Pagado',
                confirmButtonColor: 'green'
            },
            'unmark-payed': {
                actionType: 'warning',
                title: 'Marcar como no pagado',
                message: '¿Estás seguro de revertir el estado de pago?',
                detailLabel: 'Orden',
                detailValue: `# ORDEN ${purchase.id}`,
                warningMessage: 'Esto actualizará el estado de pago y puede afectar reportes financieros.',
                confirmButtonText: 'Marcar como No Pagado',
                confirmButtonColor: 'yellow'
            },
            'mark-received': {
                actionType: 'success',
                title: 'Confirmar recepción',
                message: '¿Confirmas que la mercancía fue recibida?',
                detailLabel: 'Orden',
                detailValue: `# ORDEN ${purchase.id}`,
                warningMessage: 'Se registrará la fecha actual como fecha de recepción y puede actualizar el inventario.',
                confirmButtonText: 'Confirmar Recepción',
                confirmButtonColor: 'blue'
            },
            'unmark-received': {
                actionType: 'warning',
                title: 'Revertir recepción',
                message: '¿Estás seguro de revertir el estado de recepción?',
                detailLabel: 'Orden',
                detailValue: `# ORDEN ${purchase.id}`,
                warningMessage: 'Se eliminará la fecha de recepción y puede afectar el inventario.',
                confirmButtonText: 'Revertir Recepción',
                confirmButtonColor: 'yellow'
            }
        };
        return configs[confirmModal.type] || {};
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#18c29c]/10 rounded-full flex items-center justify-center">
                            <FaFileInvoice className="text-[#18c29c] text-lg" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                Orden de Compra #{purchase.id}
                            </h3>
                            <p className="text-sm text-gray-500">Detalles de la Orden de Compra</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Información General */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                                    Información de la Orden
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <FaCalendar className="text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-xs text-gray-500">Fecha de Entrega</p>
                                            <p className="text-sm font-medium text-gray-900">{formatDate(purchase.delivery_date)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <FaFileInvoice className="text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-xs text-gray-500">Método de Pago</p>
                                            <p className="text-sm font-medium text-gray-900">{purchase.payment_method || 'No especificado'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-4 h-4 mt-1 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Moneda</p>
                                            <p className="text-sm font-medium text-gray-900">{purchase.currency || 'ARS'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-4 h-4 mt-1 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Estado</p>
                                            <div className="mt-1">
                                                {getStatusBadge(purchase.status)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-4 h-4 mt-1 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">¿Fue Pagado?</p>
                                            <div className="mt-1">
                                                {getBuyedBadge(purchase.was_payed)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-4 h-4 mt-1 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">¿Fue Recibido?</p>
                                            <div className="mt-1">
                                                {getBuyedBadge(purchase.received)}
                                            </div>
                                        </div>
                                    </div>
                                    {purchase.received_date && (
                                        <div className="flex items-start gap-2">
                                            <FaCalendar className="text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-xs text-gray-500">Fecha de Recepción</p>
                                                <p className="text-sm font-medium text-gray-900">{formatDate(purchase.received_date)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                                    Proveedor
                                </h4>
                                <div className="space-y-3">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Proveedor</p>
                                        <p className="text-sm font-medium text-gray-900">{purchase.supplier?.name || 'No especificado'}</p>
                                        {purchase.supplier?.phone && (
                                            <p className="text-xs text-gray-600 mt-1">Tel: {purchase.supplier.phone}</p>
                                        )}
                                        {purchase.supplier?.email && (
                                            <p className="text-xs text-gray-600">Email: {purchase.supplier.email}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                                    Destino
                                </h4>
                                <div className="space-y-3">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        {purchase.warehouse_destination ? (
                                            <>
                                                <p className="text-xs text-gray-500 mb-1">Depósito de Destino</p>
                                                <p className="text-sm font-medium text-blue-800">{purchase.warehouse_destination.name}</p>
                                                {purchase.warehouse_destination.address && (
                                                    <p className="text-xs text-gray-600 mt-1">Dirección: {purchase.warehouse_destination.address}</p>
                                                )}
                                            </>
                                        ) : purchase.branch_destination ? (
                                            <>
                                                <p className="text-xs text-gray-500 mb-1">Sucursal de Destino</p>
                                                <p className="text-sm font-medium text-purple-800">{purchase.branch_destination.name}</p>
                                                {purchase.branch_destination.address && (
                                                    <p className="text-xs text-gray-600 mt-1">Dirección: {purchase.branch_destination.address}</p>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-xs text-gray-500 mb-1">Destino</p>
                                                <p className="text-sm text-gray-400">Sin destino especificado</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cambiar Estado */}
                    {purchase.status !== 'approved' && purchase.status !== 'rejected' && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                                Cambiar Estado
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {purchase.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusChange('approved')}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Aprobar Orden
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange('rejected')}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Rechazar Orden
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {purchase.status !== 'rejected' && (
                        <>
                            {/* Actualizar Pago */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                                    Estado de Pago
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {!purchase.was_payed ? (
                                        <button
                                            onClick={() => handlePaymentChange(true)}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Marcar como Pagado
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handlePaymentChange(false)}
                                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Marcar como No Pagado
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Actualizar Recepción */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                                    Estado de Recepción
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {!purchase.received ? (
                                        <button
                                            onClick={() => {
                                                const today = new Date().toISOString().split('T')[0];
                                                handleReceivedChange(true, today);
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Marcar como Recibido
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleReceivedChange(false, null)}
                                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Marcar como No Recibido
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Información de Transporte */}
                    {(purchase.transport || purchase.driver || purchase.patent) && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                                Información de Transporte
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {purchase.transport && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Transporte</p>
                                        <p className="text-sm font-medium text-gray-900">{purchase.transport}</p>
                                    </div>
                                )}
                                {purchase.driver && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Conductor</p>
                                        <p className="text-sm font-medium text-gray-900">{purchase.driver}</p>
                                    </div>
                                )}
                                {purchase.patent && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Patente</p>
                                        <p className="text-sm font-medium text-gray-900">{purchase.patent}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Productos */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                            Productos ({purchase.items?.length || 0} items)
                            {console.log(purchase.items)}
                        </h4>
                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Producto
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Unidad
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Cantidad
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Precio Unit.
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {purchase.items && purchase.items.length > 0 ? (
                                        purchase.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {item.product_description || 'Producto sin nombre'}
                                                        </p>
                                                        {item.product_sku && (
                                                            <p className="text-xs text-gray-500">SKU - {item.product_sku}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-gray-700">
                                                        {`${item.product_unit_name} x ${item.product_unit_conversion_factor}` || item.product_base_unit_name || 'Unidad'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="text-sm text-gray-900">{item.quantity}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="text-sm text-gray-900">{formatCurrency(item.product_cost_price || 0)}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formatCurrency((item.product_cost_price || 0) * (item.quantity || 0) * (item.product_unit_conversion_factor || 1))}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500">
                                                No hay productos en esta orden
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Resumen de Costos */}
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-end">
                                <div className="w-full md:w-1/2 space-y-2">
                                    {purchase.taxes > 0 && (
                                        <div className="flex justify-between py-2 px-4 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-600">Impuestos</span>
                                            <span className="text-sm font-medium text-gray-900">{formatCurrency(purchase.taxes)}</span>
                                        </div>
                                    )}
                                    {purchase.discount > 0 && (
                                        <div className="flex justify-between py-2 px-4 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-600">Descuento</span>
                                            <span className="text-sm font-medium text-red-600">-{formatCurrency(purchase.discount)}</span>
                                        </div>
                                    )}
                                    {purchase.shipping_cost > 0 && (
                                        <div className="flex justify-between py-2 px-4 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-600">Costo de Envío</span>
                                            <span className="text-sm font-medium text-gray-900">{formatCurrency(purchase.shipping_cost)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-3 px-4 bg-[#18c29c]/10 rounded-lg border border-[#18c29c]/20">
                                        <span className="text-base font-semibold text-gray-700">Total</span>
                                        <span className="text-2xl font-bold text-gray-900">{formatCurrency(purchase.total_price)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    {purchase.description && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                                Descripción
                            </h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-700">{purchase.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Comentarios */}
                    {purchase.comments && purchase.comments.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                                Comentarios
                            </h4>
                            <div className="space-y-2">
                                {purchase.comments.map((comment, index) => (
                                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <p className="text-sm text-gray-700">
                                            {comment?.comment || 'Comentario'}
                                        </p>
                                        {Array.isArray(comment?.fields_updated) && comment.fields_updated.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-xs font-semibold text-gray-600">Campos actualizados:</p>
                                                <ul className="text-xs text-gray-600 list-disc pl-4">
                                                    {comment.fields_updated.map((field, idx) => (
                                                        <li key={idx}>{field}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {comment?.updated_from && Object.keys(comment.updated_from).length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-xs font-semibold text-gray-600">Cambios:</p>
                                                <ul className="text-xs text-gray-600 list-disc pl-4">
                                                    {Object.entries(comment.updated_from).map(([field, change], idx) => (
                                                        <li key={idx}>
                                                            {field}: {Object.keys(change || {})[0]} → {Object.values(change || {})[0]}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {(comment?.created_at || comment?.updated_at) && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {comment?.updated_at
                                                    ? `Actualizado: ${formatDate(comment.updated_at)}`
                                                    : `Creado: ${formatDate(comment.created_at)}`}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Timestamps */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                            <div>
                                <p>Creado: {formatDate(purchase.created_at)}</p>
                            </div>
                            <div className="text-right">
                                <p>Última actualización: {formatDate(purchase.updated_at)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>

            {/* Modal de confirmación */}
            <DeleteConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmAction}
                isProcessing={confirmModal.isProcessing}
                commentLabel="Comentario"
                commentPlaceholder="Describe la actualización..."
                commentValue={confirmModal.comment}
                onCommentChange={(value) => {
                    setConfirmModal(prev => ({ ...prev, comment: value }));
                    if (commentError) setCommentError('');
                }}
                commentRequired={confirmModal.requireComment}
                commentError={commentError}
                {...getConfirmModalConfig()}
            />
        </div>
    );
}
