

"use client";
import React from "react";
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
    FaExclamationTriangle
} from "react-icons/fa";

export default function SalesDetailModal({ isOpen, onClose, sale }) {
    if (!isOpen || !sale) return null;

    // Status mapping
    const statusMap = {
        pending: { label: "Pendiente", color: "text-yellow-600 bg-yellow-100", icon: FaClock },
        approved: { label: "Aprobado", color: "text-green-600 bg-green-100", icon: FaCheck },
        rejected: { label: "Rechazado", color: "text-red-600 bg-red-100", icon: FaExclamationTriangle }
    };

    // Channel mapping
    const channelMap = {
        ecommerce: { label: "E-commerce", icon: FaShoppingCart },
        storefront: { label: "Local físico", icon: FaUser },
        wholesale: { label: "Mayorista", icon: FaFileInvoiceDollar }
    };

    // Format currency
    const formatCurrency = (amount, currency = 'ARS') => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency,
        }).format(amount || 0);
    };

    // Format date
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

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
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
                                Detalles completos de la orden
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
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    <div className="space-y-6">
                        {/* Estado y Canal */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <StatusIcon className={statusMap[sale.status]?.color.split(' ')[0]} />
                                    <h4 className="font-semibold text-gray-900">Estado</h4>
                                </div>
                                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${statusMap[sale.status]?.color}`}>
                                    <StatusIcon />
                                    <span className="font-medium">{statusMap[sale.status]?.label}</span>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <FaCreditCard className={sale.was_payed ? "text-green-600" : "text-red-600"} />
                                    <span className={`text-sm font-medium ${sale.was_payed ? "text-green-800" : "text-red-800"}`}>
                                        {sale.was_payed ? "Pagado" : "Pago Pendiente"}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <ChannelIcon className="text-blue-600" />
                                    <h4 className="font-semibold text-gray-900">Canal de Venta</h4>
                                </div>
                                <div className="flex items-center gap-2">
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
                                                            {formatCurrency(item.unit_price * item.quantity, sale.currency)}
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
        </div>
    );
}