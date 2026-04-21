"use client";
import React, { useState, useEffect } from 'react';
import { 
    FaTimes, FaFileInvoice, FaCalendar, FaWarehouse, FaTruck, FaBox,
    FaClock, FaCheck, FaFileInvoiceDollar, FaShoppingCart
} from 'react-icons/fa';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { formatDate as formatDateUtil, formatPrice } from '@/utils/formatData';

export default function PurchaseDetailModal({
    isOpen,
    onClose,
    purchase,
    onUpdateStatus
}) {
    const [updating, setUpdating] = useState(false);
    const [alert, setAlert] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: null,
        action: null,
        isProcessing: false,
        comment: '',
        requireComment: false
    });
    const [commentError, setCommentError] = useState('');

   // Resetear alert cuando el modal se abre/cierra
    useEffect(() => {
        if (!isOpen) {
            setAlert(null);
            setUpdating(false);
        }
    }, [isOpen]);

    if (!isOpen || !purchase) return null;

    // Usar funciones de formato de utils
    const formatDate = formatDateUtil;
    const formatCurrency = formatPrice;

    // Status mapping
    const statusMap = {
        draft: { label: "Presupuesto", color: "text-gray-600 bg-gray-100", icon: FaFileInvoiceDollar, stepColor: "bg-gray-400" },
        pending: { label: "Pendiente", color: "text-yellow-600 bg-yellow-100", icon: FaClock, stepColor: "bg-yellow-500" },
        completed: { label: "Completada", color: "text-green-600 bg-green-100", icon: FaCheck, stepColor: "bg-green-600" },
        cancelled: { label: "Cancelada", color: "text-red-600 bg-red-100", icon: FaTimes, stepColor: "bg-red-600" }
    };

    const StatusIcon = statusMap[purchase.status]?.icon || FaClock;

    // Timeline steps configuration
    const timelineSteps = [
        { 
            status: 'draft', 
            label: 'Presupuesto', 
            icon: FaFileInvoiceDollar,
            description: 'Orden creada como presupuesto'
        },
        { 
            status: 'pending', 
            label: 'Pendiente', 
            icon: FaClock,
            description: 'En espera de pago y recepción'
        },
        { 
            status: 'completed', 
            label: 'Completada', 
            icon: FaCheck,
            description: 'Orden pagada y recibida'
        }
    ];

    // Get current step index
    const getCurrentStepIndex = () => {
        return timelineSteps.findIndex(step => step.status === purchase.status);
    };

    const currentStepIndex = getCurrentStepIndex();

    // Determinar acciones disponibles según el estado actual
    const getAvailableActions = () => {
        const actions = [];

        switch (purchase.status) {
            case 'draft':
                actions.push({
                    label: 'Pasar a Pendiente',
                    action: 'to_pending',
                    color: 'bg-yellow-600 hover:bg-yellow-700',
                    icon: FaClock,
                    description: 'Marca la orden como pendiente de pago y recepción'
                });
                actions.push({
                    label: 'Cancelar Orden',
                    action: 'to_cancelled',
                    color: 'bg-red-600 hover:bg-red-700',
                    icon: FaTimes,
                    description: 'Cancela esta orden de compra'
                });
                break;

            case 'pending':
                // Puede marcar como pagado
                if (!purchase.was_payed) {
                    actions.push({
                        label: 'Marcar como Pagado',
                        action: 'mark_payed',
                        color: 'bg-green-600 hover:bg-green-700',
                        icon: FaCheck,
                        description: 'Marca la orden como pagada'
                    });
                }
                
                // Puede marcar como recibido solo si ya está pagado
                if (purchase.was_payed && !purchase.received) {
                    actions.push({
                        label: 'Marcar como Recibido',
                        action: 'mark_received',
                        color: 'bg-blue-600 hover:bg-blue-700',
                        icon: FaBox,
                        description: 'Marca la mercancía como recibida'
                    });
                }

                // Puede completar si está pagado y recibido
                if (purchase.was_payed && purchase.received) {
                    actions.push({
                        label: 'Completar Orden',
                        action: 'to_completed',
                        color: 'bg-green-600 hover:bg-green-700',
                        icon: FaCheck,
                        description: 'Completa la orden de compra'
                    });
                }

                actions.push({
                    label: 'Cancelar Orden',
                    action: 'to_cancelled',
                    color: 'bg-red-600 hover:bg-red-700',
                    icon: FaTimes,
                    description: 'Cancela esta orden de compra'
                });
                break;

            case 'completed':
                // No hay acciones disponibles
                break;

            case 'cancelled':
                // No hay acciones disponibles
                break;
        }

        return actions;
    };

    const handleStatusUpdate = async (action) => {
        if (!onUpdateStatus) return;

        let updateData = {};
        let requireComment = false; // Comentarios opcionales

        switch (action) {
            case 'to_pending':
                updateData = { status: 'pending' };
                break;
            case 'to_completed':
                updateData = { status: 'completed' };
                break;
            case 'to_cancelled':
                updateData = { status: 'cancelled' };
                break;
            case 'mark_payed':
                updateData = { was_payed: true };
                break;
            case 'mark_received':
                const today = new Date().toISOString().split('T')[0];
                updateData = { received: true, received_date: today };
                break;
        }

        setConfirmModal({
            isOpen: true,
            type: action,
            action: async (comment) => {
                try {
                    setConfirmModal(prev => ({ ...prev, isProcessing: true }));
                    
                    // Solo incluir comment si no está vacío
                    const updatePayload = { ...updateData };
                    if (comment && comment.trim()) {
                        updatePayload.comment = comment;
                    }
                    
                    await onUpdateStatus(purchase.id, updatePayload);
                    setConfirmModal({ isOpen: false, type: null, action: null, isProcessing: false, comment: '', requireComment: false });
                    onClose();
                } catch (error) {
                    console.error('Error updating purchase status:', error);
                    setConfirmModal(prev => ({ ...prev, isProcessing: false }));
                    setAlert({
                        type: 'error',
                        message: error.response?.data?.detail || 'Error al actualizar el estado'
                    });
                }
            },
            isProcessing: false,
            comment: '',
            requireComment
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
            // Si hay comentario lo enviamos, sino vacío
            confirmModal.action(confirmModal.comment.trim());
        }
    };

    // Configuración del modal según el tipo de acción
    const getConfirmModalConfig = () => {
        const configs = {
            'to_pending': {
                actionType: 'info',
                title: 'Pasar a Pendiente',
                message: '¿Confirmas pasar esta orden a estado pendiente?',
                detailLabel: 'Orden',
                detailValue: `# ORDEN ${purchase.id}`,
                warningMessage: 'La orden estará en espera de pago y recepción. Se crearán movimientos de stock en tránsito.',
                confirmButtonText: 'Confirmar',
                confirmButtonColor: 'yellow'
            },
            'to_completed': {
                actionType: 'success',
                title: 'Completar Orden',
                message: '¿Confirmas completar esta orden de compra?',
                detailLabel: 'Orden',
                detailValue: `# ORDEN ${purchase.id}`,
                warningMessage: 'Esta acción es irreversible. La orden quedará finalizada y el stock se actualizará.',
                confirmButtonText: 'Completar',
                confirmButtonColor: 'green'
            },
            'to_cancelled': {
                actionType: 'warning',
                title: 'Cancelar Orden',
                message: '¿Estás seguro de cancelar esta orden de compra?',
                detailLabel: 'Orden',
                detailValue: `# ORDEN ${purchase.id}`,
                warningMessage: 'Esta acción es irreversible. Se cancelarán los movimientos de stock asociados.',
                confirmButtonText: 'Cancelar Orden',
                confirmButtonColor: 'red'
            },
            'mark_payed': {
                actionType: 'success',
                title: 'Marcar como Pagado',
                message: '¿Confirmas que esta orden fue pagada?',
                detailLabel: 'Orden',
                detailValue: `# ORDEN ${purchase.id}`,
                warningMessage: 'Esto actualizará el estado de pago en el sistema.',
                confirmButtonText: 'Marcar como Pagado',
                confirmButtonColor: 'green'
            },
            'mark_received': {
                actionType: 'success',
                title: 'Marcar como Recibido',
                message: '¿Confirmas que la mercancía fue recibida?',
                detailLabel: 'Orden',
                detailValue: `# ORDEN ${purchase.id}`,
                warningMessage: 'Se registrará la fecha actual como fecha de recepción.',
                confirmButtonText: 'Confirmar Recepción',
                confirmButtonColor: 'blue'
            }
        };
        return configs[confirmModal.type] || {};
    };

    const availableActions = getAvailableActions();

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#18c29c]/10 rounded-full flex items-center justify-center">
                            <StatusIcon className="text-[#18c29c] text-lg" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                Orden de Compra #{purchase.id}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {statusMap[purchase.status]?.label || purchase.status}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Alert */}
                {alert && (
                    <div className={`mx-6 mt-6 p-4 rounded-lg ${
                        alert.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                        alert.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                        'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                        <p className="text-sm">{alert.message}</p>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Timeline Stepper */}
                    {purchase.status !== 'cancelled' && (
                        <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-6">Progreso de la Orden</h4>
                            <div className="relative">
                                {/* Línea de progreso */}
                                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200" style={{ zIndex: 0 }}></div>
                                <div 
                                    className="absolute top-5 left-0 h-1 bg-[#18c29c] transition-all duration-500"
                                    style={{ 
                                        width: `${(currentStepIndex / (timelineSteps.length - 1)) * 100}%`,
                                        zIndex: 0
                                    }}
                                ></div>

                                {/* Steps */}
                                <div className="relative flex justify-between" style={{ zIndex: 1 }}>
                                    {timelineSteps.map((step, index) => {
                                        const StepIcon = step.icon;
                                        const isCompleted = index < currentStepIndex;
                                        const isCurrent = index === currentStepIndex;
                                        const isPending = index > currentStepIndex;

                                        return (
                                            <div key={step.status} className="flex flex-col items-center flex-1">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                                    isCompleted ? 'bg-[#18c29c] border-[#18c29c]' :
                                                    isCurrent ? 'bg-white border-[#18c29c] ring-4 ring-[#18c29c]/20' :
                                                    'bg-white border-gray-300'
                                                } transition-all duration-300`}>
                                                    <StepIcon className={`text-lg ${
                                                        isCompleted ? 'text-white' :
                                                        isCurrent ? 'text-[#18c29c]' :
                                                        'text-gray-400'
                                                    }`} />
                                                </div>
                                                <p className={`mt-2 text-xs font-medium text-center ${
                                                    isCurrent ? 'text-[#18c29c]' : 'text-gray-600'
                                                }`}>
                                                    {step.label}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500 text-center max-w-[120px]">
                                                    {step.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Additional Status Info */}
                            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${purchase.was_payed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm text-gray-700">
                                        {purchase.was_payed ? 'Pagado' : 'Pendiente de pago'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${purchase.received ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm text-gray-700">
                                        {purchase.received ? 'Recibido' : 'Pendiente de recepción'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cancelled Status */}
                    {purchase.status === 'cancelled' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <FaTimes className="text-red-600 text-xl" />
                                <div>
                                    <h4 className="text-sm font-semibold text-red-800">Orden Cancelada</h4>
                                    <p className="text-xs text-red-600 mt-1">Esta orden ha sido cancelada y no puede ser modificada.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Available Actions */}
                    {availableActions.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-lg border border-blue-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4">Acciones Disponibles</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {availableActions.map((action, index) => {
                                    const ActionIcon = action.icon;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleStatusUpdate(action.action)}
                                            disabled={updating}
                                            className={`${action.color} text-white px-4 py-3 rounded-lg transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg flex items-center gap-2 justify-center`}
                                        >
                                            <ActionIcon />
                                            {action.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

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
                                                        {item.product_unit_name ? `${item.product_unit_name} x ${item.product_unit_conversion_factor}` : item.product_base_unit_name || 'Unidad'}
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
                                Historial de Comentarios
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
