"use client";
import React, { useState, useEffect } from 'react';
import {
    FaTimes,
    FaSpinner,
    FaCreditCard,
    FaMoneyBillWave,
    FaUniversity,
    FaChevronDown,
    FaChevronUp,
    FaCheck,
    FaInfoCircle,
    FaWallet,
    FaShieldAlt ,
} from 'react-icons/fa';
import MercadoPagoConfigPanel from '@/components/modules/ecommerce/MercadoPagoConfigPanel';

// ─── Proveedores disponibles ───────────────────────────────────────────────────

const PROVIDERS = [
    {
        id: 'mercadopago',
        name: 'Tarjeta Débito / Crédito / Prepaga',
        description: 'El cliente ingresa los datos de su tarjeta directamente en la tienda (Mercado Pago)',
        gradient: 'from-[#009EE3] to-[#0070BE]',
        icon: FaCreditCard,
    },
    {
        id: 'mp_account',
        name: 'Cuenta de Mercado Pago',
        description: 'El cliente paga con el saldo de su cuenta de Mercado Pago',
        gradient: 'from-[#009EE3] to-[#007ab8]',
        icon: FaWallet,
    },
    {
        id: 'cash',
        name: 'Efectivo',
        description: 'Pago al momento de la entrega',
        gradient: 'from-emerald-500 to-emerald-600',
        icon: FaMoneyBillWave,
    },
    {
        id: 'bank_transfer',
        name: 'Transferencia Bancaria',
        description: 'CBU / CVU o alias',
        gradient: 'from-indigo-500 to-indigo-600',
        icon: FaUniversity,
    },
];

const DEFAULT_CONFIGS = {
    mercadopago: {
        installments: 12,
        statement_descriptor: '',
        binary_mode: false,
    },
    mp_account: {
        statement_descriptor: '',
        binary_mode: false,
    },
    cash: { instructions: '' },
    bank_transfer: { bank_name: '', account_holder: '', cbu: '', alias: '', instructions: '' },
};

const DEFAULT_NAMES = {
    mercadopago: 'Tarjeta Débito/Crédito',
    mp_account: 'Mercado Pago',
    cash: 'Efectivo',
    bank_transfer: 'Transferencia Bancaria',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const IS_MP_PROVIDER = (p) => p === 'mercadopago' || p === 'mp_account';

function buildForm(method = null) {
    if (method) {
        return {
            name: method.name || '',
            provider: method.provider || '',
            is_active: method.is_active ?? true,
            is_test_mode: IS_MP_PROVIDER(method.provider) ? (method.is_test_mode ?? true) : false,
            config: method.config || {},
        };
    }
    return { name: '', provider: '', is_active: true, is_test_mode: false, config: {} };
}

function Toggle({ label, description, checked, onChange }) {
    return (
        <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg">
            <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-5 w-10 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-[#18c29c]' : 'bg-gray-300'}`}
            >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
        </div>
    );
}

function FormField({ label, required, error, children }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function PaymentMethodFormModal({
    isOpen,
    onClose,
    onSubmit,
    loading = false,
    paymentMethod = null,
}) {
    const [form, setForm] = useState(() => buildForm(paymentMethod));
    const [errors, setErrors] = useState({});
    const [showCustomization, setShowCustomization] = useState(false);

    const isEditing = !!paymentMethod;

    useEffect(() => {
        if (isOpen) {
            setForm(buildForm(paymentMethod));
            setErrors({});
            setShowCustomization(isEditing);
        }
    }, [isOpen, paymentMethod]);

    if (!isOpen) return null;

    const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
    const setConfig = (key, value) => setForm(prev => ({ ...prev, config: { ...prev.config, [key]: value } }));

    const handleProviderSelect = (providerId) => {
        setForm(prev => ({
            ...prev,
            provider: providerId,
            name: prev.name || DEFAULT_NAMES[providerId] || '',
            config: DEFAULT_CONFIGS[providerId] || {},
            is_test_mode: IS_MP_PROVIDER(providerId) ? prev.is_test_mode : false,
        }));
        setErrors(prev => ({ ...prev, provider: undefined }));
    };

    const validate = () => {
        const errs = {};
        if (!form.provider) errs.provider = 'Seleccioná un proveedor';
        if (!form.name.trim()) errs.name = 'El nombre es obligatorio';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        await onSubmit(form);
    };

    const inputClass = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-gray-900 placeholder-gray-400';
    const isMp = IS_MP_PROVIDER(form.provider);

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#18c29c]/10 rounded-full flex items-center justify-center">
                            <FaCreditCard className="text-[#18c29c] text-lg" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {isEditing ? 'Editar método de pago' : 'Agregar método de pago'}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {isEditing ? `Editando: ${paymentMethod.name}` : 'Configurá cómo querés recibir pagos'}
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} disabled={loading}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 disabled:opacity-50">
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="overflow-y-auto flex-1 p-6 space-y-6">

                        {/* Selección de proveedor */}
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-3">
                                Método de pago<span className="text-red-500 ml-0.5">*</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {PROVIDERS.map(provider => {
                                    const Icon = provider.icon;
                                    const selected = form.provider === provider.id;
                                    return (
                                        <button
                                            key={provider.id}
                                            type="button"
                                            onClick={() => handleProviderSelect(provider.id)}
                                            className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${selected ? 'border-[#18c29c] bg-[#18c29c]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                                        >
                                            {selected && (
                                                <span className="absolute top-2 right-2 w-5 h-5 bg-[#18c29c] rounded-full flex items-center justify-center">
                                                    <FaCheck className="text-white text-[10px]" />
                                                </span>
                                            )}
                                            <div className={`w-9 h-9 bg-gradient-to-r ${provider.gradient} rounded-lg flex items-center justify-center mb-2.5`}>
                                                <Icon className="text-white text-base" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-800">{provider.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{provider.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.provider && <p className="text-xs text-red-600 mt-2">{errors.provider}</p>}
                        </div>

                        {form.provider && (
                            <>
                                {/* Configuración general */}
                                <div className="border-t border-gray-100 pt-5 space-y-4">
                                    <p className="text-sm font-semibold text-gray-700">Configuración</p>

                                    <FormField label="Nombre visible para el cliente" required error={errors.name}>
                                        <input type="text" value={form.name}
                                            onChange={e => setField('name', e.target.value)}
                                            placeholder="Ej: Pagá con tarjeta"
                                            className={inputClass} />
                                    </FormField>

                                    <div className="space-y-2">
                                        <Toggle
                                            label="Método activo"
                                            description="Los clientes verán esta opción en el checkout"
                                            checked={form.is_active}
                                            onChange={val => setField('is_active', val)}
                                        />
                                        {isMp && (
                                            <Toggle
                                                label="Modo prueba (sandbox)"
                                                description="Transacciones de test sin cobros reales — desactivar al salir a producción"
                                                checked={form.is_test_mode}
                                                onChange={val => setField('is_test_mode', val)}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Aviso: credenciales gestionadas desde el panel de administración Django */}
                                {isMp && (
                                    <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 border-t border-gray-100 mt-4">
                                        <FaShieldAlt className="flex-shrink-0 mt-0.5 text-blue-500" />
                                        <div>
                                            <p className="font-medium">Credenciales gestionadas desde el panel admin</p>
                                            <p className="text-xs text-blue-700 mt-0.5">
                                                La Public Key y el Access Token se configuran en el panel de administración del sistema (Django Admin). Acá solo configurás las opciones de negocio.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Instrucciones para Efectivo */}
                                {form.provider === 'cash' && (
                                    <div className="border-t border-gray-100 pt-5 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <FaInfoCircle className="text-emerald-500 text-sm" />
                                            <p className="text-sm font-semibold text-gray-700">Instrucciones para el cliente</p>
                                        </div>
                                        <textarea
                                            value={form.config.instructions || ''}
                                            onChange={e => setConfig('instructions', e.target.value)}
                                            placeholder="Ej: Abonás en efectivo al momento de recibir el pedido. El monto exacto facilita el proceso."
                                            rows={4}
                                            className={inputClass}
                                        />
                                    </div>
                                )}

                                {/* Datos bancarios para Transferencia */}
                                {form.provider === 'bank_transfer' && (
                                    <div className="border-t border-gray-100 pt-5 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <FaUniversity className="text-indigo-500 text-sm" />
                                            <p className="text-sm font-semibold text-gray-700">Datos bancarios</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormField label="Banco">
                                                <input type="text" value={form.config.bank_name || ''}
                                                    onChange={e => setConfig('bank_name', e.target.value)}
                                                    placeholder="Ej: Banco Galicia"
                                                    className={inputClass} />
                                            </FormField>
                                            <FormField label="Titular de la cuenta">
                                                <input type="text" value={form.config.account_holder || ''}
                                                    onChange={e => setConfig('account_holder', e.target.value)}
                                                    placeholder="Nombre completo del titular"
                                                    className={inputClass} />
                                            </FormField>
                                            <FormField label="CBU / CVU">
                                                <input type="text" value={form.config.cbu || ''}
                                                    onChange={e => setConfig('cbu', e.target.value)}
                                                    placeholder="22 dígitos"
                                                    className={inputClass} />
                                            </FormField>
                                            <FormField label="Alias">
                                                <input type="text" value={form.config.alias || ''}
                                                    onChange={e => setConfig('alias', e.target.value)}
                                                    placeholder="mi.alias.banco"
                                                    className={inputClass} />
                                            </FormField>
                                        </div>
                                        <FormField label="Instrucciones adicionales">
                                            <textarea
                                                value={form.config.instructions || ''}
                                                onChange={e => setConfig('instructions', e.target.value)}
                                                placeholder="Ej: Enviá el comprobante a pedidos@tienda.com con el número de orden."
                                                rows={3}
                                                className={inputClass}
                                            />
                                        </FormField>
                                    </div>
                                )}

                                {/* Opciones del checkout — ambos proveedores MP */}
                                {isMp && (
                                    <div className="border-t border-gray-100 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowCustomization(!showCustomization)}
                                            className="flex items-center justify-between w-full text-left group"
                                        >
                                            <span className="text-sm font-semibold text-gray-700">
                                                Opciones del checkout
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-gray-600">
                                                {showCustomization ? 'Ocultar' : 'Cuotas, descriptor, modo binario...'}
                                                {showCustomization ? <FaChevronUp /> : <FaChevronDown />}
                                            </span>
                                        </button>
                                        {showCustomization && (
                                            <div className="mt-5">
                                                <MercadoPagoConfigPanel
                                                    config={form.config}
                                                    onChange={newConfig => setForm(p => ({ ...p, config: newConfig }))}
                                                    showInstallments={form.provider === 'mercadopago'}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
                        <button type="button" onClick={onClose} disabled={loading}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading || !form.provider}
                            className="flex-1 px-4 py-2 bg-[#18c29c] text-white rounded-lg hover:bg-[#15a884] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? (
                                <><FaSpinner className="animate-spin text-sm" />{isEditing ? 'Guardando...' : 'Agregando...'}</>
                            ) : (
                                isEditing ? 'Guardar cambios' : 'Agregar método'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
