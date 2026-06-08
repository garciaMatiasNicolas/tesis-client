"use client";
import React from 'react';
import {
    FaCreditCard,
    FaCog,
    FaInfoCircle,
} from 'react-icons/fa';

const INSTALLMENT_OPTIONS = [1, 3, 6, 9, 12, 18, 24];

function SectionTitle({ icon: Icon, title }) {
    return (
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 pb-2 border-b border-gray-100">
            <Icon className="text-[#009EE3]" />
            {title}
        </h4>
    );
}

function Toggle({ checked, onChange, disabled = false }) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={`relative inline-flex h-5 w-10 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${checked ? 'bg-[#009EE3]' : 'bg-gray-300'}`}
        >
            <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-1'}`}
            />
        </button>
    );
}

export default function MercadoPagoConfigPanel({ config = {}, onChange, showInstallments = true }) {
    const handleChange = (key, value) => {
        onChange({ ...config, [key]: value });
    };

    return (
        <div className="space-y-6">
            {/* ── Cuotas — solo para tarjetas ── */}
            {showInstallments && (
                <div>
                    <SectionTitle icon={FaCreditCard} title="Cuotas" />
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Cuotas máximas
                        </label>
                        <select
                            value={config.installments ?? 12}
                            onChange={(e) => handleChange('installments', parseInt(e.target.value, 10))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009EE3] text-gray-900"
                        >
                            {INSTALLMENT_OPTIONS.map((n) => (
                                <option key={n} value={n}>
                                    {n === 1 ? 'Sin cuotas (pago único)' : `Hasta ${n} cuotas`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* ── Configuración Avanzada ── */}
            <div>
                <SectionTitle icon={FaCog} title="Configuración Avanzada" />
                <div className="space-y-3">
                    {/* Descriptor bancario */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Nombre en el resumen de tarjeta
                        </label>
                        <input
                            type="text"
                            value={config.statement_descriptor || ''}
                            onChange={(e) =>
                                handleChange('statement_descriptor', e.target.value.toUpperCase().slice(0, 22))
                            }
                            placeholder="TU TIENDA"
                            maxLength={22}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009EE3] focus:border-transparent text-gray-900 placeholder-gray-400"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            {(config.statement_descriptor || '').length}/22 caracteres · Solo mayúsculas
                        </p>
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <FaInfoCircle className="flex-shrink-0" />
                            Texto que aparece en el resumen de la tarjeta del comprador. Si no se configura, aparece el nombre genérico de Mercado Pago.
                        </p>
                    </div>

                    {/* Aprobación inmediata (modo binario) */}
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Aprobación inmediata</p>
                            <p className="text-xs text-gray-500">
                                El pago se aprueba o rechaza al instante, sin estados intermedios de revisión manual.
                                Recomendado para evitar pagos pendientes.
                            </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            <Toggle
                                checked={!!config.binary_mode}
                                onChange={(val) => handleChange('binary_mode', val)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
