"use client";
import React, { useState } from "react";
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
    FaUser
} from "react-icons/fa";

export default function StockMovementModal({ isOpen, onClose, stockItem, movements = [], loading = false }) {
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
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#18c29c] to-[#15a884] px-6 py-5 text-white">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-2">Historial de Movimientos</h2>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-white/90">
                                    <span className="font-medium">
                                        {stockItem?.product_detail?.description || 'Producto'}
                                    </span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>SKU: {stockItem?.product_detail?.sku || 'N/A'}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>{stockItem?.location_name || 'Sin ubicación'}</span>
                                </div>
                                <div className="mt-3 flex items-center gap-4 text-sm">
                                    <div className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                                        Stock actual: <span className="font-bold">{stockItem?.quantity || 0}</span> {stockItem?.product_detail?.base_unit_name || 'uni.'}
                                    </div>
                                    <div className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                                        {movements.length} movimiento{movements.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <FaSpinner className="animate-spin text-4xl text-[#18c29c] mb-4" />
                                <p className="text-gray-600">Cargando movimientos...</p>
                            </div>
                        ) : movements.length === 0 ? (
                            <div className="text-center py-12">
                                <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900">Sin movimientos</h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    No hay movimientos registrados para este stock.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {Object.entries(groupedMovements).map(([date, dayMovements]) => (
                                    <div key={date}>
                                        {/* Fecha del día */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <FaCalendarAlt className="text-gray-400" />
                                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                                                {date}
                                            </h3>
                                            <div className="flex-1 h-px bg-gray-200" />
                                        </div>

                                        {/* Movimientos del día */}
                                        <div className="space-y-3">
                                            {dayMovements.map((movement) => (
                                                <div 
                                                    key={movement.id}
                                                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        {/* Indicador de tipo de movimiento */}
                                                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                                                            movement.movement_type === 'IN' 
                                                                ? 'bg-green-100' 
                                                                : 'bg-red-100'
                                                        }`}>
                                                            {movement.movement_type === 'IN' ? (
                                                                <FaArrowDown className="text-green-600 text-xl" />
                                                            ) : (
                                                                <FaArrowUp className="text-red-600 text-xl" />
                                                            )}
                                                        </div>

                                                        {/* Información del movimiento */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className={`text-sm font-semibold ${
                                                                            movement.movement_type === 'IN' 
                                                                                ? 'text-green-700' 
                                                                                : 'text-red-700'
                                                                        }`}>
                                                                            {movement.movement_type === 'IN' ? 'INGRESO' : 'EGRESO'}
                                                                        </span>
                                                                        <span className="text-lg font-bold text-gray-900">
                                                                            {movement.movement_type === 'IN' ? '+' : '-'}{movement.quantity}
                                                                        </span>
                                                                        <span className="text-sm text-gray-500">
                                                                            {stockItem?.product_detail?.base_unit_name || 'uni.'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                                                        <div className="flex items-center gap-1">
                                                                            {getLocationIcon(movement.from_location)}
                                                                            <span>Desde: {getLocationName(movement.from_location)}</span>
                                                                        </div>
                                                                        <span>→</span>
                                                                        <div className="flex items-center gap-1">
                                                                            {getLocationIcon(movement.to_location)}
                                                                            <span>Hacia: {getLocationName(movement.to_location)}</span>
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
                                                                <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                                                                    {movement.sale_number && (
                                                                        <span className="bg-white px-2 py-1 rounded border border-gray-200">
                                                                            Venta #{movement.sale_number}
                                                                        </span>
                                                                    )}
                                                                    {movement.purchase_number && (
                                                                        <span className="bg-white px-2 py-1 rounded border border-gray-200">
                                                                            Compra #{movement.purchase_number}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Nota */}
                                                            {movement.note && (
                                                                <div className="mt-2 bg-white rounded border border-gray-200 p-2">
                                                                    <div className="flex items-start gap-2">
                                                                        <FaStickyNote className="text-gray-400 text-xs mt-0.5 flex-shrink-0" />
                                                                        <p className="text-xs text-gray-700">{movement.note}</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Historial de Comentarios */}
                                                            {movement.comments && movement.comments.length > 0 && (
                                                                <div className="mt-3 space-y-2">
                                                                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                                                                        <FaComments className="text-[#18c29c]" />
                                                                        <span>Historial ({movement.comments.length})</span>
                                                                    </div>
                                                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                                                        {movement.comments.map((comment, idx) => (
                                                                            <div 
                                                                                key={idx} 
                                                                                className="bg-white rounded border border-gray-200 p-3"
                                                                            >
                                                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                                                    <div className="flex items-center gap-2">
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
                                                                                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                                                                        <span className="px-2 py-0.5 bg-gray-100 rounded">
                                                                                            {getStatusBadge(comment.status_before).text}
                                                                                        </span>
                                                                                        <span>→</span>
                                                                                        <span className="px-2 py-0.5 bg-gray-100 rounded">
                                                                                            {getStatusBadge(comment.status_after).text}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                                
                                                                                {/* Comentario */}
                                                                                <p className="text-xs text-gray-700 leading-relaxed">
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
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Total de movimientos: <span className="font-semibold text-gray-900">{movements.length}</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
