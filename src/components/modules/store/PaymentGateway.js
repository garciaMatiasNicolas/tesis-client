"use client";
import React, { useState, useEffect } from 'react';
import {
    FaCreditCard,
    FaMoneyBillWave,
    FaUniversity,
    FaSpinner,
    FaShieldAlt,
    FaLock,
} from 'react-icons/fa';
import CardPaymentBrick from '@/components/modules/store/CardPaymentBrick';
import MpAccountBrick from '@/components/modules/store/MpAccountBrick';
import BankTransferView from '@/components/modules/store/BankTransferView';
import CashPaymentView from '@/components/modules/store/CashPaymentView';

const PROVIDER_META = {
    mercadopago: {
        icon: FaCreditCard,
        label: 'Tarjeta Débito/Crédito',
        description: 'Visa, Mastercard, débito, prepaga y más',
    },
    mp_account: {
        icon: FaMoneyBillWave,
        label: 'Mercado Pago',
        description: 'Pagá con el saldo de tu cuenta',
    },
    bank_transfer: {
        icon: FaUniversity,
        label: 'Transferencia bancaria',
        description: 'CBU / CVU · Alias',
    },
    cash: {
        icon: FaMoneyBillWave,
        label: 'Efectivo',
        description: 'Pagás al recibir el pedido',
    },
};

function MethodTab({ method, isActive, onSelect, isDarkMode, theme }) {
    const meta = PROVIDER_META[method.provider] || { icon: FaCreditCard, label: method.name, description: '' };
    const Icon = meta.icon;
    const primaryColor = theme?.primary?.main || '#9a334d';
    const borderActive = primaryColor;
    const borderInactive = isDarkMode ? theme?.border?.dark?.main || '#3a3a3a' : theme?.border?.light?.main || '#e0e0e0';
    const bgActive = `${primaryColor}10`;
    const bgInactive = isDarkMode ? theme?.background?.dark?.card || '#1e1e1e' : theme?.background?.light?.card || '#ffffff';
    const textPrimary = isDarkMode ? theme?.text?.dark?.primary || '#fff' : theme?.text?.light?.primary || '#252525';
    const textMuted = isDarkMode ? theme?.text?.dark?.muted || '#a0a0a0' : theme?.text?.light?.muted || '#6c6c6c';

    return (
        <button
            type="button"
            onClick={() => onSelect(method)}
            className="flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all"
            style={{
                borderColor: isActive ? borderActive : borderInactive,
                backgroundColor: isActive ? bgActive : bgInactive,
            }}
        >
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                    backgroundColor: isActive ? `${primaryColor}25` : isDarkMode ? '#2a2a2a' : '#f3f4f6',
                }}
            >
                <Icon
                    className="text-lg"
                    style={{ color: isActive ? primaryColor : textMuted }}
                />
            </div>
            <div className="min-w-0">
                <p
                    className="text-sm font-semibold truncate"
                    style={{ color: isActive ? primaryColor : textPrimary }}
                >
                    {method.name || meta.label}
                </p>
                <p className="text-xs truncate" style={{ color: textMuted }}>
                    {meta.description}
                </p>
            </div>
            {isActive && (
                <div
                    className="ml-auto w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                >
                    <svg viewBox="0 0 12 10" className="w-2.5 h-2.5 fill-white">
                        <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            )}
        </button>
    );
}

export default function PaymentGateway({
    orderTotal,
    customerEmail,
    onCardPaymentSubmit,
    onNonCardConfirm,
    onMpAccountPayment,
    isProcessing,
    isDarkMode,
    theme,
    getPaymentMethods,
    brickResetKey = 0,
}) {
    const [methods, setMethods] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        if (!getPaymentMethods) return;
        const fetch = async () => {
            try {
                setLoading(true);
                const data = await getPaymentMethods();
                const list = Array.isArray(data) ? data : data?.results || [];
                setMethods(list);
                if (list.length === 1) setSelected(list[0]);
            } catch {
                setFetchError('No se pudieron cargar los métodos de pago.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const primaryColor = theme?.primary?.main || '#9a334d';
    const primaryGradient = theme?.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)';
    const textMuted = isDarkMode ? theme?.text?.dark?.muted || '#a0a0a0' : theme?.text?.light?.muted || '#6c6c6c';
    const borderColor = isDarkMode ? theme?.border?.dark?.main || '#3a3a3a' : theme?.border?.light?.main || '#e0e0e0';

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 gap-3" style={{ color: textMuted }}>
                <FaSpinner className="animate-spin text-xl flex-shrink-0" style={{ color: primaryColor }} />
                <span className="text-sm">Cargando métodos de pago...</span>
            </div>
        );
    }

    if (fetchError || methods.length === 0) {
        return (
            <p className="text-sm text-center py-6" style={{ color: textMuted }}>
                {fetchError || 'No hay métodos de pago disponibles en este momento.'}
            </p>
        );
    }

    const mpMethod = methods.find(m => m.provider === 'mercadopago');
    const mpPublicKey = mpMethod?.public_key || null;
    const mpConfig = mpMethod?.config || {};

    const mpAccountMethod = methods.find(m => m.provider === 'mp_account');
    const mpAccountPublicKey = mpAccountMethod?.public_key || null;

    return (
        <div className="space-y-5">
            {/* Header de seguridad */}
            <div className="flex items-center gap-2.5 text-xs" style={{ color: textMuted }}>
                <FaShieldAlt className="text-emerald-500 flex-shrink-0" />
                <span>Pago 100% seguro · Datos cifrados · Procesado por Mercado Pago</span>
                <FaLock className="text-emerald-500 flex-shrink-0 ml-auto" />
            </div>

            {/* Selector de método */}
            {methods.length > 1 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: textMuted }}>
                        Elegí cómo pagar
                    </p>
                    {methods.map(m => (
                        <MethodTab
                            key={m.id}
                            method={m}
                            isActive={selected?.id === m.id}
                            onSelect={setSelected}
                            isDarkMode={isDarkMode}
                            theme={theme}
                        />
                    ))}
                </div>
            )}

            {/* Separador */}
            {selected && (
                <div className="border-t pt-4" style={{ borderColor }}>
                    {/* ── Mercado Pago con Bricks ── */}
                    {selected.provider === 'mercadopago' && (
                        <CardPaymentBrick
                            publicKey={mpPublicKey}
                            amount={orderTotal}
                            customerEmail={customerEmail}
                            maxInstallments={parseInt(mpConfig.installments, 10) || 1}
                            onSubmit={onCardPaymentSubmit}
                            isDarkMode={isDarkMode}
                            theme={theme}
                            resetKey={brickResetKey}
                        />
                    )}

                    {/* ── Cuenta de Mercado Pago ── */}
                    {selected.provider === 'mp_account' && (
                        <MpAccountBrick
                            onSubmit={onMpAccountPayment || onCardPaymentSubmit}
                            isProcessing={isProcessing}
                            isDarkMode={isDarkMode}
                            theme={theme}
                        />
                    )}

                    {/* ── Transferencia bancaria ── */}
                    {selected.provider === 'bank_transfer' && (
                        <BankTransferView
                            config={selected.config || {}}
                            amount={orderTotal}
                            onConfirm={() => onNonCardConfirm(selected)}
                            isProcessing={isProcessing}
                            isDarkMode={isDarkMode}
                            theme={theme}
                        />
                    )}

                    {/* ── Efectivo ── */}
                    {selected.provider === 'cash' && (
                        <CashPaymentView
                            config={selected.config || {}}
                            amount={orderTotal}
                            onConfirm={() => onNonCardConfirm(selected)}
                            isProcessing={isProcessing}
                            isDarkMode={isDarkMode}
                            theme={theme}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
