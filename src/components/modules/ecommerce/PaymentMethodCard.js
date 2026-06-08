"use client";
import React from 'react';
import {
    FaEdit,
    FaTrash,
    FaCreditCard,
    FaMoneyBillWave,
    FaUniversity,
    FaToggleOn,
    FaToggleOff,
    FaCheck,
    FaTimes,
    FaFlask,
    FaKey,
    FaExclamationTriangle,
    FaInfoCircle,
} from 'react-icons/fa';

const PROVIDER_CONFIG = {
    mercadopago: {
        label: 'Tarjeta Débito/Crédito/Prepaga',
        gradient: 'from-[#009EE3] to-[#0070BE]',
        icon: FaCreditCard,
    },
    mp_account: {
        label: 'Cuenta de Mercado Pago',
        gradient: 'from-[#009EE3] to-[#007ab8]',
        icon: FaCreditCard,
    },
    cash: {
        label: 'Efectivo',
        gradient: 'from-emerald-500 to-emerald-600',
        icon: FaMoneyBillWave,
    },
    bank_transfer: {
        label: 'Transferencia Bancaria',
        gradient: 'from-indigo-500 to-indigo-600',
        icon: FaUniversity,
    },
};

export default function PaymentMethodCard({ method, onEdit, onDelete, onToggleActive, loading = false }) {
    const providerCfg = PROVIDER_CONFIG[method.provider] || {
        label: method.provider,
        gradient: 'from-gray-500 to-gray-600',
        icon: FaCreditCard,
    };
    const Icon = providerCfg.icon;
    const isMpProvider = method.provider === 'mercadopago' || method.provider === 'mp_account';
    const hasCredentials = !isMpProvider || (method.public_key && method.public_key.length > 0);

    const needsConfig = isMpProvider && !hasCredentials;

    return (
        <div className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${!method.is_active ? 'border-gray-200 opacity-60' : needsConfig ? 'border-amber-300' : 'border-gray-200'}`}>
            {/* Cabecera con gradiente del proveedor */}
            <div className={`bg-gradient-to-r ${providerCfg.gradient} rounded-t-xl p-5`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Icon className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-base leading-tight">{method.name}</h3>
                            <span className="text-white/75 text-xs">{providerCfg.label}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 ${method.is_active ? 'bg-white/25 text-white' : 'bg-white/15 text-white/70'}`}>
                            {method.is_active ? <FaCheck className="text-[10px]" /> : <FaTimes className="text-[10px]" />}
                            {method.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        {method.is_test_mode && (
                            <span className="bg-amber-400/90 text-amber-900 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                <FaFlask className="text-[10px]" />
                                Prueba
                            </span>
                        )}
                        {needsConfig && (
                            <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <FaExclamationTriangle className="text-[10px]" />
                                Sin config.
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Cuerpo */}
            <div className="p-4 space-y-3">
                {/* Estado de integración MP — visible para ambos providers */}
                {isMpProvider && (
                    <div className={`flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-lg ${hasCredentials ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        <FaKey className="text-[10px] flex-shrink-0" />
                        <span>{hasCredentials ? 'Integración activa' : 'Sin credenciales — configurar en el panel admin'}</span>
                    </div>
                )}

                {/* Preview de configuración */}
                {method.provider === 'mercadopago' && method.config?.title && (
                    <div className="flex items-start gap-2 text-sm text-gray-500">
                        <FaInfoCircle className="text-xs mt-0.5 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{method.config.title}</span>
                    </div>
                )}
                {(method.provider === 'cash' || method.provider === 'bank_transfer') && method.config?.instructions && (
                    <p className="text-sm text-gray-500 line-clamp-2">{method.config.instructions}</p>
                )}
                {method.provider === 'bank_transfer' && method.config?.bank_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaUniversity className="text-xs text-gray-400" />
                        <span>{method.config.bank_name}</span>
                        {method.config.alias && (
                            <span className="text-gray-400">· CVU/Alias: {method.config.alias}</span>
                        )}
                    </div>
                )}
                {method.provider === 'mercadopago' && method.config?.installments && (
                    <p className="text-xs text-gray-400">
                        Hasta {method.config.installments === 1 ? 'pago en 1 cuota' : `${method.config.installments} cuotas`}
                    </p>
                )}

                {/* Acciones */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => onToggleActive(method)}
                        disabled={loading}
                        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                            method.is_active
                                ? 'text-gray-600 hover:bg-gray-100'
                                : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={method.is_active ? 'Desactivar método' : 'Activar método'}
                    >
                        {method.is_active ? (
                            <><FaToggleOn className="text-emerald-500 text-xl" /> Desactivar</>
                        ) : (
                            <><FaToggleOff className="text-gray-400 text-xl" /> Activar</>
                        )}
                    </button>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => onEdit(method)}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar método de pago"
                        >
                            <FaEdit className="text-sm" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(method)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar método de pago"
                        >
                            <FaTrash className="text-sm" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
