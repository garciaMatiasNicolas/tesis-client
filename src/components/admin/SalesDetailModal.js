"use client";
import React, { useState, useEffect } from "react";
import {
    FaTimes,
    FaShoppingCart,
    FaUser,
    FaTruck,
    FaDollarSign,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaFileInvoiceDollar,
    FaCheck,
    FaClock,
    FaInfoCircle,
    FaBox,
    FaCreditCard,
    FaExclamationTriangle,
    FaSpinner,
    FaEdit,
    FaArrowRight,
    FaBan
} from "react-icons/fa";
import Alert from "@/components/ui/Alert";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import useBranchService from "@/services/branchService";
import useWarehouseService from "@/services/warehouseService";
import useStockService from "@/services/stockService";


export default function SalesDetailModal({ isOpen, onClose, sale, onUpdateStatus }) {
    const branchService = useBranchService();
    const warehouseService = useWarehouseService();
    const stockService = useStockService();
    const [updating, setUpdating] = useState(false);
    const [alert, setAlert] = useState(null);
    const [showOriginSelector, setShowOriginSelector] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [branches, setBranches] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [selectedOrigin, setSelectedOrigin] = useState({ type: 'branch', id: null });
    const [loadingOrigins, setLoadingOrigins] = useState(false);
    const [stockByLocation, setStockByLocation] = useState({});
    const [productsWithoutOrigin, setProductsWithoutOrigin] = useState([]);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: null,
        action: null,
        isProcessing: false,
        comment: '',
        requireComment: false
    });
    const [commentError, setCommentError] = useState('');
    const [showStockInconsistency, setShowStockInconsistency] = useState(false);
    const [stockInconsistencyData, setStockInconsistencyData] = useState(null);
    const [pendingActionAfterMovement, setPendingActionAfterMovement] = useState(null);

    // Resetear alert cuando el modal se abre/cierra
    useEffect(() => {
        if (!isOpen) {
            setAlert(null);
            setShowOriginSelector(false);
            setSelectedOrigin({ type: 'branch', id: null });
            setPendingAction(null);
        }
    }, [isOpen]);

    // Cargar sucursales, depósitos y stock disponible
    const loadOrigins = async () => {
        setLoadingOrigins(true);
        try {
            // Obtener productos sin origen especificado
            const productsData = sale.sales_items?.map(item => ({
                name: item.product_name || 'Producto',
                id: item.product,
                quantity: item.quantity
            })) || [];
            
            setProductsWithoutOrigin(productsData);
            
            // Cargar sucursales y depósitos
            const [branchesData, warehousesData] = await Promise.all([
                branchService.getAllBranches(),
                warehouseService.getAllWarehouses()
            ]);
            
            setBranches(branchesData || []);
            setWarehouses(warehousesData || []);
            
            // Cargar stock para cada producto en cada ubicación
            const stockData = {};
            
            for (const item of sale.sales_items || []) {
                try {
                    const productStock = await stockService.getByProduct(item.product);
                    const stockList = productStock.results || productStock || [];
                    
                    stockList.forEach(stock => {
                        const locationKey = stock.branch 
                            ? `branch_${stock.branch.id}`
                            : stock.warehouse
                            ? `warehouse_${stock.warehouse.id}`
                            : null;
                        
                        if (locationKey) {
                            if (!stockData[locationKey]) {
                                stockData[locationKey] = {};
                            }
                            stockData[locationKey][item.product] = {
                                quantity: parseFloat(stock.quantity || 0),
                                productName: item.product_name
                            };
                        }
                    });
                } catch (err) {
                    console.error(`Error loading stock for product ${item.product}:`, err);
                }
            }
            
            setStockByLocation(stockData);
        } catch (error) {
            console.error('Error loading origins:', error);
            setAlert({
                type: 'danger',
                title: 'Error al cargar ubicaciones',
                message: 'No se pudieron cargar las sucursales y depósitos. Por favor, intenta nuevamente.'
            });
        } finally {
            setLoadingOrigins(false);
        }
    };

    if (!isOpen || !sale) return null;

    // Status mapping
    const statusMap = {
        draft: { label: "Presupuesto", color: "text-gray-600 bg-gray-100", icon: FaFileInvoiceDollar, stepColor: "bg-gray-400" },
        pending: { label: "Pendiente", color: "text-yellow-600 bg-yellow-100", icon: FaClock, stepColor: "bg-yellow-500" },
        processing: { label: "En Preparación", color: "text-blue-600 bg-blue-100", icon: FaTruck, stepColor: "bg-blue-500" },
        completed: { label: "Completada", color: "text-green-600 bg-green-100", icon: FaCheck, stepColor: "bg-green-600" },
        cancelled: { label: "Cancelada", color: "text-red-600 bg-red-100", icon: FaTimes, stepColor: "bg-red-600" }
    };

    // Channel mapping
    const channelMap = {
        ecommerce: { label: "E-commerce", icon: FaShoppingCart },
        storefront: { label: "Local físico", icon: FaUser },
        wholesale: { label: "Mayorista", icon: FaFileInvoiceDollar }
    };

    // Helper functions
    const formatCurrency = (amount, currency = 'ARS') => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency,
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateShort = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-AR');
    };

    const StatusIcon = statusMap[sale.status]?.icon || FaClock;
    const ChannelIcon = channelMap[sale.sales_channel]?.icon || FaShoppingCart;

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
            description: 'Stock reservado, pendiente de pago/entrega'
        },
        { 
            status: 'processing', 
            label: 'En Preparación', 
            icon: FaBox,
            description: 'Orden en preparación para envío'
        },
        { 
            status: 'completed', 
            label: 'Completada', 
            icon: FaCheck,
            description: 'Orden pagada y entregada'
        }
    ];

    // Get current step index
    const getCurrentStepIndex = () => {
        if (sale.status === 'cancelled') return -1;
        return timelineSteps.findIndex(step => step.status === sale.status);
    };

    const currentStepIndex = getCurrentStepIndex();

    // Determinar acciones disponibles según el estado actual
    const getAvailableActions = () => {
        const actions = [];
        
        switch (sale.status) {
            case 'draft':
                actions.push({ 
                    label: 'Pasar a Pendiente', 
                    value: 'pending', 
                    color: 'bg-yellow-500 hover:bg-yellow-600',
                    icon: FaClock,
                    description: 'Confirmar orden y reservar stock'
                });
                actions.push({ 
                    label: 'Cancelar Orden', 
                    value: 'cancelled', 
                    color: 'bg-red-500 hover:bg-red-600',
                    icon: FaBan,
                    description: 'Cancelar este presupuesto'
                });
                break;
            case 'pending':
                actions.push({ 
                    label: 'Pasar a Preparación', 
                    value: 'processing', 
                    color: 'bg-blue-500 hover:bg-blue-600',
                    icon: FaBox,
                    description: 'Marcar como en preparación'
                });
                actions.push({ 
                    label: 'Cancelar Orden', 
                    value: 'cancelled', 
                    color: 'bg-red-500 hover:bg-red-600',
                    icon: FaBan,
                    description: 'Cancelar y liberar stock'
                });
                break;
                case 'processing':
                    if (!sale.was_payed) {
                        actions.push({ 
                            label: 'Marcar como Pagado', 
                            field: 'was_payed',
                            value: true, 
                        color: 'bg-green-500 hover:bg-green-600',
                        icon: FaCreditCard,
                        description: 'Confirmar recepción del pago'
                    });
                }
                if (!sale.was_delivered) {
                    actions.push({ 
                        label: 'Marcar como Entregado', 
                        field: 'was_delivered',
                        value: true, 
                        color: 'bg-blue-500 hover:bg-blue-600',
                        icon: FaTruck,
                        description: 'Confirmar entrega al cliente'
                    });
                }
                if (sale.was_payed && sale.was_delivered) {
                    actions.push({ 
                        label: 'Completar Orden', 
                        value: 'completed', 
                        color: 'bg-green-600 hover:bg-green-700',
                        icon: FaCheck,
                        description: 'Finalizar y confirmar stock'
                    });
                }
                actions.push({ 
                    label: 'Cancelar Orden', 
                    value: 'cancelled', 
                    color: 'bg-red-500 hover:bg-red-600',
                    icon: FaBan,
                    description: 'Cancelar y liberar stock'
                });
                break;
        }
        
        return actions;
    };

    const handleStatusUpdate = async (action, originData = null) => {
        if (!onUpdateStatus) return;

        let updateData = {};
        let requireComment = false; // Comentarios opcionales
        
        if (action.field) {
            updateData[action.field] = action.value;
            if (action.field === 'was_delivered' && action.value) {
                updateData.delivered_date = new Date().toISOString().split('T')[0];
            }
        } else {
            updateData.status = action.value;
        }

        setConfirmModal({
            isOpen: true,
            type: action.action || action.value,
            action: async (comment) => {
                try {
                    setConfirmModal(prev => ({ ...prev, isProcessing: true }));
                    setUpdating(true);
                    setAlert(null);
                    
                    // Agregar comentario si existe
                    const finalUpdateData = { ...updateData };
                    if (comment) {
                        finalUpdateData.comment = comment;
                    }
                    
                    // Agregar datos de origen si están disponibles
                    if (originData) {
                        if (originData.type === 'branch') {
                            finalUpdateData.branch_origin_id = originData.id;
                            finalUpdateData.warehouse_origin_id = null;
                        } else {
                            finalUpdateData.warehouse_origin_id = originData.id;
                            finalUpdateData.branch_origin_id = null;
                        }
                    }
                    
                    // Llamar a la función de actualización
                    await onUpdateStatus(sale.id, finalUpdateData);
                    
                    // Solo mostrar éxito si no hubo error
                    setAlert({
                        type: 'success',
                        title: 'Actualización exitosa',
                        message: `La orden ha sido actualizada correctamente.`
                    });
                    
                    // Cerrar modales
                    setConfirmModal({ isOpen: false, type: null, action: null, isProcessing: false, comment: '', requireComment: false });
                    
                    // Cerrar el modal principal después de 1.5 segundos
                    setTimeout(() => {
                        onClose();
                    }, 1500);
                } catch (error) {
                    console.error('Error updating sale:', error);
                    setConfirmModal(prev => ({ ...prev, isProcessing: false }));
                    
                    // Verificar si hay inconsistencia de stock (productos en diferentes ubicaciones)
                    if (error.response?.data?.stock_inconsistency) {
                        setConfirmModal({ isOpen: false, type: null, action: null, isProcessing: false, comment: '', requireComment: false });
                        setStockInconsistencyData({
                            details: error.response.data.inconsistency_details,
                            errors: error.response.data.sales_items,
                            currentOrigin: originData
                        });
                        setPendingActionAfterMovement(action);
                        setShowStockInconsistency(true);
                        setUpdating(false);
                        return;
                    }
                    
                    // Verificar si requiere selección de origen
                    if (error.response?.data?.requires_origin) {
                        setConfirmModal({ isOpen: false, type: null, action: null, isProcessing: false, comment: '', requireComment: false });
                        setPendingAction(action);
                        setShowOriginSelector(true);
                        await loadOrigins();
                        setUpdating(false);
                        return;
                    }
                    
                    // Parsear errores del backend
                    let errorMessages = [];
                    
                    if (error.response?.data) {
                        const data = error.response.data;
                        
                        Object.keys(data).forEach(key => {
                            const value = data[key];
                            if (Array.isArray(value)) {
                                value.forEach(msg => {
                                    errorMessages.push(msg);
                                });
                            } else if (typeof value === 'string') {
                                errorMessages.push(value);
                            }
                        });
                    }
                    
                    // Construir mensaje de error
                    const errorMessage = errorMessages.length > 0 
                        ? errorMessages.join(' ')
                        : 'Ocurrió un error al actualizar la orden. Por favor, intenta nuevamente.';
                    
                    // Mostrar error en el modal
                    setAlert({
                        type: 'danger',
                        title: 'Error al actualizar',
                        message: errorMessage
                    });
                } finally {
                    setUpdating(false);
                }
            },
            isProcessing: false,
            comment: '',
            requireComment
        });
        setCommentError('');
    };

    const closeConfirmModal = () => {
        if (confirmModal.isProcessing) return;
        setConfirmModal({
            isOpen: false,
            type: null,
            action: null,
            isProcessing: false,
            comment: '',
            requireComment: false
        });
        setCommentError('');
    };

    const confirmAction = async () => {
        if (confirmModal.requireComment && !confirmModal.comment.trim()) {
            setCommentError('El comentario es requerido');
            return;
        }
        
        setCommentError('');
        
        if (confirmModal.action) {
            await confirmModal.action(confirmModal.comment.trim());
        }
    };

    const getConfirmModalConfig = () => {
        const statusTranslations = {
            'pending_approval': 'Aprobar',
            'approved': 'Aprobar',
            'in_preparation': 'Preparar',
            'ready_to_ship': 'Preparar para envío',
            'shipped': 'Marcar como enviado',
            'delivered': 'Entregar',
            'completed': 'Completar',
            'cancelled': 'Cancelar'
        };

        if (confirmModal.type === 'status_change') {
            return {
                title: 'Confirmar cambio de estado',
                message: `¿Estás seguro que deseas ${statusTranslations[confirmModal.newStatus] || 'cambiar'} esta orden?`,
                confirmButtonText: 'Confirmar',
                actionType: 'info'
            };
        }

        return {
            title: 'Confirmar acción',
            message: '¿Estás seguro de realizar esta acción?',
            confirmButtonText: 'Confirmar',
            actionType: 'info'
        };
    };

    const handleOriginConfirm = async () => {
        if (!selectedOrigin.id) {
            setAlert({
                type: 'warning',
                title: 'Selección requerida',
                message: 'Por favor selecciona una sucursal o depósito de origen.'
            });
            return;
        }
        
        if (!pendingAction) {
            setAlert({
                type: 'danger',
                title: 'Error',
                message: 'No se encontró la acción pendiente.'
            });
            return;
        }
        
        setShowOriginSelector(false);
        await handleStatusUpdate(pendingAction, selectedOrigin);
    };

    const handleStockMovementOption = async (option) => {
        if (option === 'cancel') {
            setShowStockInconsistency(false);
            setStockInconsistencyData(null);
            setPendingActionAfterMovement(null);
            return;
        }

        if (option === 'view_details') {
            // Mostrar más detalles sobre las ubicaciones
            return;
        }

        if (option === 'change_origin') {
            // Permitir cambiar el origen
            setShowStockInconsistency(false);
            setShowOriginSelector(true);
            await loadOrigins();
            return;
        }

        if (option === 'create_movements') {
            window.location.href = '/movements';
            return;
        }
    };

    const availableActions = getAvailableActions();

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <FaShoppingCart className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                Orden de Venta #{sale.id}
                            </h3>
                            <p className="text-sm text-gray-600">
                                Gestiona el flujo y estado de la orden
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-full"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
                    {/* Alert */}
                    {alert && (
                        <div className="mb-4">
                            <Alert
                                type={alert.type}
                                title={alert.title}
                                text={alert.message}
                                onClose={() => setAlert(null)}
                            />
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Timeline de Estados */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                            <div className="flex items-center gap-2 mb-6">
                                <FaEdit className="text-blue-600 text-xl" />
                                <h4 className="font-bold text-blue-900 text-lg">Flujo de la Orden</h4>
                            </div>

                            {/* Timeline Visual */}
                            {sale.status !== 'cancelled' ? (
                                <div className="relative">
                                    {/* Progress Line */}
                                    <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 hidden md:block">
                                        <div 
                                            className="h-full bg-blue-600 transition-all duration-500"
                                            style={{ width: `${(currentStepIndex / (timelineSteps.length - 1)) * 100}%` }}
                                        />
                                    </div>

                                    {/* Steps */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                                        {timelineSteps.map((step, index) => {
                                            const StepIcon = step.icon;
                                            const isCompleted = index < currentStepIndex;
                                            const isCurrent = index === currentStepIndex;
                                            const isPending = index > currentStepIndex;

                                            return (
                                                <div key={step.status} className="flex flex-col items-center text-center">
                                                    {/* Icon Circle */}
                                                    <div className={`
                                                        w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-300
                                                        ${isCompleted ? 'bg-green-600 text-white shadow-lg scale-110' : ''}
                                                        ${isCurrent ? statusMap[step.status]?.stepColor + ' text-white shadow-xl scale-125 ring-4 ring-white' : ''}
                                                        ${isPending ? 'bg-gray-200 text-gray-400' : ''}
                                                    `}>
                                                        {isCompleted ? (
                                                            <FaCheck className="text-2xl" />
                                                        ) : (
                                                            <StepIcon className="text-2xl" />
                                                        )}
                                                    </div>

                                                    {/* Label */}
                                                    <p className={`font-semibold mb-1 ${
                                                        isCurrent ? 'text-blue-900 text-base' : 
                                                        isCompleted ? 'text-green-700' : 
                                                        'text-gray-500 text-sm'
                                                    }`}>
                                                        {step.label}
                                                    </p>

                                                    {/* Description */}
                                                    <p className={`text-xs ${
                                                        isCurrent ? 'text-blue-700 font-medium' : 
                                                        isCompleted ? 'text-green-600' : 
                                                        'text-gray-400'
                                                    }`}>
                                                        {step.description}
                                                    </p>

                                                    {/* Current Indicator */}
                                                    {isCurrent && (
                                                        <div className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full animate-pulse">
                                                            ACTUAL
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                /* Cancelled State */
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FaBan className="text-4xl text-red-600" />
                                        </div>
                                        <h4 className="text-xl font-bold text-red-900 mb-2">Orden Cancelada</h4>
                                        <p className="text-red-700">Esta orden ha sido cancelada y el stock ha sido liberado.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Estado Actual y Detalles */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <StatusIcon className={statusMap[sale.status]?.color.split(' ')[0]} />
                                    <h4 className="font-semibold text-gray-900">Estado Actual</h4>
                                </div>
                                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${statusMap[sale.status]?.color} mb-3`}>
                                    <StatusIcon />
                                    <span className="font-medium">{statusMap[sale.status]?.label}</span>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center gap-2">
                                        <FaCreditCard className={sale.was_payed ? "text-green-600" : "text-red-600"} />
                                        <span className={`text-sm font-medium ${sale.was_payed ? "text-green-800" : "text-red-800"}`}>
                                            {sale.was_payed ? "✓ Pagado" : "✗ Pendiente de Pago"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaTruck className={sale.was_delivered ? "text-green-600" : "text-yellow-600"} />
                                        <span className={`text-sm font-medium ${sale.was_delivered ? "text-green-800" : "text-yellow-800"}`}>
                                            {sale.was_delivered ? "✓ Entregado" : "✗ Pendiente de Entrega"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <ChannelIcon className="text-blue-600" />
                                    <h4 className="font-semibold text-gray-900">Canal de Venta</h4>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <ChannelIcon className="text-gray-400" />
                                    <span className="text-lg font-medium text-gray-900">
                                        {channelMap[sale.sales_channel]?.label || sale.sales_channel}
                                    </span>
                                </div>
                                {sale.payment_method && (
                                    <div className="mt-3">
                                        <span className="text-sm text-gray-600">Método de pago: </span>
                                        <span className="text-sm font-medium text-gray-900 capitalize">
                                            {sale.payment_method}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cliente y Empleado */}
                        {(sale.customer || sale.employee) && (
                            <div className="bg-white rounded-lg border border-gray-200">
                                <div className="grid md:grid-cols-2 gap-4 p-4">
                                    {sale.customer && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <FaUser className="text-blue-600" />
                                                <h4 className="font-semibold text-gray-900">Cliente</h4>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium text-gray-900">
                                                    {sale.customer.name || sale.customer.full_name}
                                                </p>
                                                {sale.customer.email && (
                                                    <p className="text-sm text-gray-600">{sale.customer.email}</p>
                                                )}
                                                {sale.customer.phone && (
                                                    <p className="text-sm text-gray-600">{sale.customer.phone}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {sale.employee && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <FaUser className="text-green-600" />
                                                <h4 className="font-semibold text-gray-900">Empleado</h4>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium text-gray-900">{sale.employee.name}</p>
                                                {sale.employee.email && (
                                                    <p className="text-sm text-gray-600">{sale.employee.email}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Información de Entrega */}
                        {(sale.delivery || sale.deliver_to || sale.transport) && (
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaTruck className="text-blue-600" />
                                    <h4 className="font-semibold text-blue-900">Información de Entrega</h4>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaMapMarkerAlt className="text-blue-600 text-sm" />
                                            <span className="text-sm font-medium text-blue-900">Dirección de entrega:</span>
                                        </div>
                                        <p className="text-sm text-blue-800 ml-6">
                                            {sale.deliver_to || 'No especificada'}
                                        </p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaCalendarAlt className="text-blue-600 text-sm" />
                                            <span className="text-sm font-medium text-blue-900">Fecha de entrega:</span>
                                        </div>
                                        <p className="text-sm text-blue-800 ml-6">
                                            {formatDateShort(sale.delivery_date)}
                                        </p>
                                    </div>
                                    {sale.transport && (
                                        <>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FaTruck className="text-blue-600 text-sm" />
                                                    <span className="text-sm font-medium text-blue-900">Transporte:</span>
                                                </div>
                                                <p className="text-sm text-blue-800 ml-6">{sale.transport}</p>
                                            </div>
                                            {sale.driver && (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaUser className="text-blue-600 text-sm" />
                                                        <span className="text-sm font-medium text-blue-900">Conductor:</span>
                                                    </div>
                                                    <p className="text-sm text-blue-800 ml-6">{sale.driver}</p>
                                                </div>
                                            )}
                                            {sale.patent && (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaInfoCircle className="text-blue-600 text-sm" />
                                                        <span className="text-sm font-medium text-blue-900">Patente:</span>
                                                    </div>
                                                    <p className="text-sm text-blue-800 ml-6 font-mono">{sale.patent}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Productos */}
                        {sale.sales_items && sale.sales_items.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200">
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <FaBox className="text-gray-600" />
                                        <h4 className="font-semibold text-gray-900">
                                            Productos ({sale.sales_items.length})
                                        </h4>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {sale.sales_items.map((item, index) => (
                                        <div key={index} className="p-4 hover:bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        {item.product_sku && (
                                                            <span className="text-blue-600 mr-2">SKU {item.product_sku}</span>
                                                        )}
                                                        {item.product_name || `Producto ID: ${item.product}`}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <p className="text-sm text-gray-600">
                                                            Cantidad: <span className="font-medium text-gray-900">{item.quantity}</span>
                                                        </p>
                                                        {item.product_unit_name && (
                                                            <p className="text-sm text-gray-600">
                                                                Unidad: <span className="font-medium text-blue-600">{item.product_unit_name}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">Precio unitario</p>
                                                    <p className="text-lg font-bold text-gray-900">
                                                        {formatCurrency(item.unit_price, sale.currency)}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Subtotal: <span className="font-medium">
                                                            {formatCurrency(item.unit_price * item.quantity, sale.currency)} x {item.product_unit_name || 'unidad(es)'}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Información Financiera */}
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center gap-2 mb-4">
                                <FaDollarSign className="text-green-600" />
                                <h4 className="font-semibold text-green-900">Resumen Financiero</h4>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-700">Costo de envío:</span>
                                    <span className="font-medium text-green-900">
                                        {formatCurrency(sale.shipping_cost, sale.currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-700">Impuestos:</span>
                                    <span className="font-medium text-green-900">
                                        {formatCurrency(sale.taxes, sale.currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-700">Descuento:</span>
                                    <span className="font-medium text-green-900">
                                        -{formatCurrency(sale.discount, sale.currency)}
                                    </span>
                                </div>
                                <div className="border-t border-green-300 pt-2 mt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-green-900">Total:</span>
                                        <span className="text-2xl font-bold text-green-900">
                                            {formatCurrency(sale.total_price, sale.currency)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Descripción */}
                        {sale.description && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaInfoCircle className="text-gray-600" />
                                    <h4 className="font-semibold text-gray-900">Descripción</h4>
                                </div>
                                <p className="text-sm text-gray-700">{sale.description}</p>
                            </div>
                        )}

                        {/* Fechas */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                                <FaCalendarAlt className="text-gray-600" />
                                <h4 className="font-semibold text-gray-900">Fechas</h4>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Creada:</span>
                                    <p className="font-medium text-gray-900">{formatDate(sale.created_at)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Última actualización:</span>
                                    <p className="font-medium text-gray-900">{formatDate(sale.updated_at)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal de Inconsistencia de Stock */}
                        {showStockInconsistency && stockInconsistencyData && (
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 border-2 border-red-300">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaExclamationTriangle className="text-red-600 text-2xl" />
                                    <h4 className="font-bold text-red-900 text-lg">Inconsistencia de Stock Detectada</h4>
                                </div>
                                
                                <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
                                    <p className="text-sm text-gray-700 mb-4">
                                        <strong>Problema:</strong> Los productos de esta orden están distribuidos en diferentes ubicaciones. 
                                        Una orden solo puede tener un único origen de stock.
                                    </p>
                                    
                                    {/* Lista de productos con inconsistencias */}
                                    <div className="space-y-4">
                                        {stockInconsistencyData.details.map((item, idx) => (
                                            <div key={idx} className="border-l-4 border-red-400 pl-4 py-2 bg-red-50">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">{item.product_name}</h5>
                                                        <p className="text-xs text-gray-600">SKU: {item.product_sku}</p>
                                                    </div>
                                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                                        Requiere: {item.required_qty} unidades
                                                    </span>
                                                </div>
                                                
                                                <div className="mt-3 space-y-2">
                                                    <div className="bg-white p-3 rounded border border-gray-200">
                                                        <p className="text-xs text-gray-600 mb-1">Origen seleccionado:</p>
                                                        <div className="flex justify-between items-center">
                                                            <p className="font-medium text-gray-900">
                                                                {item.current_origin.type === 'branch' ? '🏪 Sucursal' : '🏭 Depósito'} {item.current_origin.name}
                                                            </p>
                                                            <span className="text-red-600 font-semibold">
                                                                {item.current_origin.available} disponibles ❌
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {item.alternative_locations.length > 0 && (
                                                        <div className="bg-green-50 p-3 rounded border border-green-200">
                                                            <p className="text-xs text-green-700 font-medium mb-2">Stock en otras ubicaciones:</p>
                                                            {item.alternative_locations.map((loc, locIdx) => (
                                                                <div key={locIdx} className="flex justify-between items-center text-sm py-1">
                                                                    <span className="text-gray-700">
                                                                        {loc.type === 'branch' ? '🏪' : '🏭'} {loc.name}
                                                                    </span>
                                                                    <span className="text-green-700 font-semibold">
                                                                        {loc.available} unidades ✓
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Opciones de resolución */}
                                <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                                    <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                        <FaInfoCircle /> ¿Cómo resolverlo?
                                    </h5>
                                    <ul className="text-sm text-blue-800 space-y-2">
                                        <li>• <strong>Opción 1:</strong> Cambiar el origen de la orden a una ubicación que tenga todos los productos</li>
                                        <li>• <strong>Opción 2:</strong> Crear movimientos de stock para consolidar los productos en una sola ubicación</li>
                                        <li>• <strong>Opción 3:</strong> Ajustar manualmente el stock entre ubicaciones y volver a intentar</li>
                                    </ul>
                                </div>
                                
                                {/* Botones de acción */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleStockMovementOption('cancel')}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleStockMovementOption('change_origin')}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Cambiar Origen
                                    </button>
                                    <button
                                        onClick={() => handleStockMovementOption('create_movements')}
                                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                                        title="Próximamente: Crear movimientos automáticos"
                                    >
                                        Crear Movimientos
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Selector de Origen */}
                        {showOriginSelector && (
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border-2 border-orange-300">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaMapMarkerAlt className="text-orange-600 text-xl" />
                                    <h4 className="font-bold text-orange-900 text-lg">Seleccionar Origen de Stock</h4>
                                </div>
                                <p className="text-sm text-orange-700 mb-4">
                                    Esta orden requiere que especifiques desde dónde se despachará el stock:
                                </p>
                                
                                {/* Productos que necesitan origen */}
                                {productsWithoutOrigin.length > 0 && (
                                    <div className="bg-white rounded-lg p-4 mb-4 border border-orange-200">
                                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <FaBox className="text-orange-600" />
                                            Productos en esta orden ({productsWithoutOrigin.length})
                                        </h5>
                                        <ul className="space-y-1">
                                            {productsWithoutOrigin.map((product, idx) => (
                                                <li key={idx} className="text-sm text-gray-700 flex justify-between">
                                                    <span>• {product.name}</span>
                                                    <span className="font-medium">x{product.quantity}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {loadingOrigins ? (
                                    <div className="flex items-center justify-center py-8">
                                        <FaSpinner className="animate-spin text-4xl text-orange-600" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Selector de tipo */}
                                        <div className="flex gap-2 mb-4">
                                            <button
                                                onClick={() => setSelectedOrigin({ type: 'branch', id: null })}
                                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                                                    selectedOrigin.type === 'branch'
                                                        ? 'bg-orange-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                Sucursal
                                            </button>
                                            <button
                                                onClick={() => setSelectedOrigin({ type: 'warehouse', id: null })}
                                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                                                    selectedOrigin.type === 'warehouse'
                                                        ? 'bg-orange-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                Depósito
                                            </button>
                                        </div>

                                        {/* Lista de opciones */}
                                        <div className="max-h-64 overflow-y-auto space-y-2 bg-white p-4 rounded-lg border border-orange-200">
                                            {selectedOrigin.type === 'branch' ? (
                                                branches.length > 0 ? (
                                                    branches.map((branch) => {
                                                        const locationKey = `branch_${branch.id}`;
                                                        const locationStock = stockByLocation[locationKey] || {};
                                                        const hasStock = Object.keys(locationStock).length > 0;
                                                        
                                                        return (
                                                            <button
                                                                key={branch.id}
                                                                onClick={() => setSelectedOrigin({ type: 'branch', id: branch.id })}
                                                                className={`w-full text-left p-3 rounded-lg transition-all ${
                                                                    selectedOrigin.id === branch.id
                                                                        ? 'bg-orange-600 text-white'
                                                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                                                                }`}
                                                            >
                                                                <div className="font-medium flex items-center justify-between">
                                                                    {branch.name}
                                                                    {hasStock && (
                                                                        <span className={`text-xs px-2 py-1 rounded ${
                                                                            selectedOrigin.id === branch.id 
                                                                                ? 'bg-white/20' 
                                                                                : 'bg-green-100 text-green-800'
                                                                        }`}>
                                                                            Stock disponible
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {branch.address && (
                                                                    <div className="text-sm opacity-80 mt-1">{branch.address}</div>
                                                                )}
                                                                {hasStock && (
                                                                    <div className="mt-2 pt-2 border-t border-gray-200/20">
                                                                        {Object.entries(locationStock).map(([productId, stockInfo]) => (
                                                                            <div key={productId} className="text-xs opacity-80 flex justify-between">
                                                                                <span>{stockInfo.productName}</span>
                                                                                <span className="font-semibold">{stockInfo.quantity} unidades</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="text-center text-gray-500 py-4">No hay sucursales disponibles</p>
                                                )
                                            ) : (
                                                warehouses.length > 0 ? (
                                                    warehouses.map((warehouse) => {
                                                        const locationKey = `warehouse_${warehouse.id}`;
                                                        const locationStock = stockByLocation[locationKey] || {};
                                                        const hasStock = Object.keys(locationStock).length > 0;
                                                        
                                                        return (
                                                            <button
                                                                key={warehouse.id}
                                                                onClick={() => setSelectedOrigin({ type: 'warehouse', id: warehouse.id })}
                                                                className={`w-full text-left p-3 rounded-lg transition-all ${
                                                                    selectedOrigin.id === warehouse.id
                                                                        ? 'bg-orange-600 text-white'
                                                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                                                                }`}
                                                            >
                                                                <div className="font-medium flex items-center justify-between">
                                                                    {warehouse.name}
                                                                    {hasStock && (
                                                                        <span className={`text-xs px-2 py-1 rounded ${
                                                                            selectedOrigin.id === warehouse.id 
                                                                                ? 'bg-white/20' 
                                                                                : 'bg-green-100 text-green-800'
                                                                        }`}>
                                                                            Stock disponible
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {warehouse.location && (
                                                                    <div className="text-sm opacity-80 mt-1">{warehouse.location}</div>
                                                                )}
                                                                {hasStock && (
                                                                    <div className="mt-2 pt-2 border-t border-gray-200/20">
                                                                        {Object.entries(locationStock).map(([productId, stockInfo]) => (
                                                                            <div key={productId} className="text-xs opacity-80 flex justify-between">
                                                                                <span>{stockInfo.productName}</span>
                                                                                <span className="font-semibold">{stockInfo.quantity} unidades</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="text-center text-gray-500 py-4">No hay depósitos disponibles</p>
                                                )
                                            )}
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={() => setShowOriginSelector(false)}
                                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleOriginConfirm}
                                                disabled={!selectedOrigin.id}
                                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Confirmar y Continuar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Acciones Disponibles - Mejorado */}
                        {availableActions.length > 0 && sale.status !== 'completed' && sale.status !== 'cancelled' && (
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border-2 border-indigo-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaArrowRight className="text-indigo-600 text-xl animate-pulse" />
                                    <h4 className="font-bold text-indigo-900 text-lg">Acciones Disponibles</h4>
                                    <span className="ml-auto text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">
                                        {availableActions.length} acción{availableActions.length > 1 ? 'es' : ''}
                                    </span>
                                </div>
                                <p className="text-sm text-indigo-700 mb-4">
                                    Selecciona una acción para actualizar el estado de la orden:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {availableActions.map((action, index) => {
                                        const ActionIcon = action.icon;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleStatusUpdate(action)}
                                                disabled={updating}
                                                className={`${action.color} text-white px-4 py-3 rounded-lg transition-all font-medium flex flex-col items-start gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-0.5`}
                                            >
                                                <div className="flex items-center gap-2 w-full">
                                                    {updating ? <FaSpinner className="animate-spin" /> : <ActionIcon />}
                                                    <span className="font-bold">{action.label}</span>
                                                </div>
                                                {action.description && (
                                                    <span className="text-xs opacity-90 text-left">
                                                        {action.description}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Mensaje de ayuda según estado */}
                        {sale.status === 'pending' && (!sale.was_payed || !sale.was_delivered) && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <FaInfoCircle className="text-yellow-600 text-xl flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h5 className="font-semibold text-yellow-900 mb-1">Recordatorio</h5>
                                        <p className="text-sm text-yellow-800">
                                            Para completar esta orden, asegúrate de:
                                        </p>
                                        <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
                                            {!sale.was_payed && <li>Confirmar el pago del cliente</li>}
                                            {!sale.was_delivered && <li>Confirmar la entrega del pedido</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
                commentLabel="Comentario (opcional)"
                commentPlaceholder="Describe la actualización... (opcional)"
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