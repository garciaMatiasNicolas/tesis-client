"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    FaTimes, 
    FaArrowUp, 
    FaArrowDown,
    FaShoppingCart,
    FaTruck,
    FaWarehouse,
    FaStore,
    FaExchangeAlt,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaSpinner,
    FaStickyNote,
    FaCalendarAlt,
    FaComments,
    FaUser,
    FaHistory
} from "react-icons/fa";

export default function StockMovementModal({ isOpen, onClose, stockItem, isMovementTable = false, movements = [], loading = false }) {
    const router = useRouter();
    
    if (!isOpen) return null;

    // Obtener el ícono según el origen/destino
    const getLocationIcon = (locationType) => {
        const icons = {
            'PUR': <FaShoppingCart className="text-blue-500" />,
            'SAL': <FaTruck className="text-green-500" />,
            'WHA': <FaWarehouse className="text-purple-500" />,
            'BRA': <FaStore className="text-orange-500" />,
            'MOV': <FaExchangeAlt className="text-gray-500" />
        };
        return icons[locationType] || <FaExchangeAlt className="text-gray-500" />;
    };

    // Obtener el nombre del tipo de ubicación
    const getLocationName = (locationType) => {
        const names = {
            'PUR': 'Compra',
            'SAL': 'Venta',
            'WHA': 'Depósito',
            'BRA': 'Sucursal',
            'MOV': 'Movimiento'
        };
        return names[locationType] || 'Desconocido';
    };

    // Obtener badge de estado
    const getStatusBadge = (status) => {
        const badges = {
            'PEN': {
                color: 'bg-yellow-100 text-yellow-800',
                icon: <FaClock className="text-xs" />,
                text: 'Pendiente'
            },
            'TRAN': {
                color: 'bg-blue-100 text-blue-800',
                icon: <FaSpinner className="text-xs" />,
                text: 'En tránsito'
            },
            'REC': {
                color: 'bg-green-100 text-green-800',
                icon: <FaCheckCircle className="text-xs" />,
                text: 'Recibido'
            },
            'CAN': {
                color: 'bg-red-100 text-red-800',
                icon: <FaTimesCircle className="text-xs" />,
                text: 'Cancelado'
            }
        };

        const badge = badges[status] || badges['TRAN'];

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.icon}
                {badge.text}
            </span>
        );
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Formatear fecha para comentarios (más completo)
    const formatCommentDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    };

    // Agrupar movimientos por fecha
    const groupedMovements = movements.reduce((acc, movement) => {
        const date = new Date(movement.date).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(movement);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-all"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#18c29c] to-[#15a884] px-4 sm:px-6 py-3 sm:py-4 text-white">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h2 className="text-lg sm:text-xl font-bold mb-1.5">{!isMovementTable ? 'Historial (Última Semana)' : 'Detalles del Movimiento'}</h2>
                                
                                {!isMovementTable && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs sm:text-sm text-white/90">
                                        <span className="font-medium truncate">
                                            {stockItem?.product_detail?.description || 'Producto'}
                                        </span>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="truncate">SKU: {stockItem?.product_detail?.sku || 'N/A'}</span>
                                </div>)}

                                {!isMovementTable &&
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                    <div className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
                                        Stock: <span className="font-bold">{stockItem?.quantity || 0}</span> {stockItem?.product_detail?.base_unit_name || 'uni.'}
                                    </div>
                                    <div className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
                                        {movements.length} mov.
                                    </div>
                                </div>}
                                
                            </div>
                            <button
                                onClick={onClose}
                                className="ml-2 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <FaTimes className="text-lg" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-320px)] p-3 sm:p-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <FaSpinner className="animate-spin text-3xl text-[#18c29c] mb-3" />
                                <p className="text-sm text-gray-600">Cargando...</p>
                            </div>
                        ) : movements.length === 0 ? (
                            <div className="text-center py-8">
                                <FaExchangeAlt className="mx-auto h-10 w-10 text-gray-400" />
                                <h3 className="mt-3 text-base font-medium text-gray-900">Sin movimientos</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    No hay movimientos en la última semana.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(groupedMovements).map(([date, dayMovements]) => (
                                    <div key={date}>
                                        {/* Fecha del día */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <FaCalendarAlt className="text-gray-400 text-xs" />
                                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">
                                                {date}
                                            </h3>
                                            <div className="flex-1 h-px bg-gray-200" />
                                        </div>

                                        {/* Movimientos del día */}
                                        <div className="space-y-2">
                                            {dayMovements.map((movement) => (
                                                <div 
                                                    key={movement.id}
                                                    className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors border border-gray-200"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {/* Indicador de tipo de movimiento */}
                                                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                                                            movement.movement_type === 'IN' 
                                                                ? 'bg-green-100' 
                                                                : 'bg-red-100'
                                                        }`}>
                                                            {movement.movement_type === 'IN' ? (
                                                                <FaArrowDown className="text-green-600 text-lg" />
                                                            ) : (
                                                                <FaArrowUp className="text-red-600 text-lg" />
                                                            )}
                                                        </div>

                                                        {/* Información del movimiento */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-1.5 mb-1">
                                                                        <span className={`text-xs font-semibold ${
                                                                            movement.movement_type === 'IN' 
                                                                                ? 'text-green-700' 
                                                                                : 'text-red-700'
                                                                        }`}>
                                                                            {movement.movement_type === 'IN' ? 'INGRESO' : 'EGRESO'}
                                                                        </span>
                                                                        <span className="text-base font-bold text-gray-900">
                                                                            {movement.movement_type === 'IN' ? '+' : '-'}{movement.quantity}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500">
                                                                            {stockItem?.product_detail?.base_unit_name || 'uni.'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
                                                                        <div className="flex items-center gap-1">
                                                                            {getLocationIcon(movement.from_location)}
                                                                            <span className="text-xs">De: {getLocationName(movement.from_location)}</span>
                                                                        </div>
                                                                        <span>→</span>
                                                                        <div className="flex items-center gap-1">
                                                                            {getLocationIcon(movement.to_location)}
                                                                            <span className="text-xs">A: {getLocationName(movement.to_location)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right flex-shrink-0">
                                                                    {getStatusBadge(movement.status)}
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        {formatDate(movement.date)}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Referencias */}
                                                            {(movement.sale_number || movement.purchase_number) && (
                                                                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
                                                                    {movement.sale_number && (
                                                                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-xs">
                                                                            Venta #{movement.sale_number}
                                                                        </span>
                                                                    )}
                                                                    {movement.purchase_number && (
                                                                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-xs">
                                                                            Compra #{movement.purchase_number}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Nota */}
                                                            {movement.note && (
                                                                <div className="mt-1.5 bg-white rounded border border-gray-200 p-2">
                                                                    <div className="flex items-start gap-1.5">
                                                                        <FaStickyNote className="text-gray-400 text-xs mt-0.5 flex-shrink-0" />
                                                                        <p className="text-xs text-gray-700">{movement.note}</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Historial de Comentarios */}
                                                            {movement.comments && movement.comments.length > 0 && (
                                                                <div className="mt-2 space-y-1.5">
                                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                                                                        <FaComments className="text-[#18c29c]" />
                                                                        <span>Historial ({movement.comments.length})</span>
                                                                    </div>
                                                                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                                                        {movement.comments.map((comment, idx) => (
                                                                            <div 
                                                                                key={idx} 
                                                                                className="bg-white rounded border border-gray-200 p-2"
                                                                            >
                                                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                                                    <div className="flex items-center gap-1.5">
                                                                                        <FaUser className="text-gray-400 text-xs" />
                                                                                        <span className="text-xs font-semibold text-gray-700">
                                                                                            {comment.user || 'Sistema'}
                                                                                        </span>
                                                                                    </div>
                                                                                    <span className="text-xs text-gray-500">
                                                                                        {formatCommentDate(comment.date)}
                                                                                    </span>
                                                                                </div>
                                                                                
                                                                                {/* Cambio de estado si existe */}
                                                                                {comment.status_before && comment.status_after && (
                                                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                                                                                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                                                                                            {getStatusBadge(comment.status_before).text}
                                                                                        </span>
                                                                                        <span>→</span>
                                                                                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                                                                                            {getStatusBadge(comment.status_after).text}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                                
                                                                                {/* Comentario */}
                                                                                <p className="text-xs text-gray-700 leading-snug">
                                                                                    {comment.comment}
                                                                                </p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                       
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50">
                        <div className="flex flex-col gap-2">
                            {/* Información de movimientos */}
                            {!isMovementTable && (
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-600">
                                        Total (última semana): <span className="font-semibold text-gray-900">{movements.length}</span>
                                    </div>  
                                </div>
                            )}
                            
                            {/* Aclaración y botones */}
                            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 ${!isMovementTable ? 'border-t border-gray-200' : ''}`}>
                               {!isMovementTable && (
                                <div className="flex-1 flex items-start gap-1.5 text-xs text-gray-600">
                                    <FaHistory className="text-[#18c29c] mt-0.5 flex-shrink-0 text-xs" />
                                    <p className="leading-tight">
                                        <span className="font-medium text-gray-700">Nota:</span> Solo última semana. Ver historial completo en el botón.
                                    </p>
                                </div>)}
                                <div className="flex gap-2 flex-shrink-0">
                                    {
                                        !isMovementTable && (
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    router.push('/movements');
                                                }}
                                                className="px-3 py-1.5 text-xs sm:text-sm bg-[#18c29c] hover:bg-[#15a884] text-white rounded transition-colors font-medium flex items-center gap-1.5 whitespace-nowrap"
                                            >
                                                <FaHistory className="text-xs" />
                                                <span className="hidden sm:inline">Ver Historial</span>
                                                <span className="sm:hidden">Historial</span>
                                            </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="px-3 py-1.5 text-xs sm:text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors font-medium"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
