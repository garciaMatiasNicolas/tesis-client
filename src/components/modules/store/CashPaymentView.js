"use client";
import React from 'react';
import { FaMoneyBillWave, FaSpinner, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { formatPrice } from '@/utils/formatData';

export default function CashPaymentView({ config = {}, amount, onConfirm, isProcessing, isDarkMode, theme }) {
    const bgCard = isDarkMode ? theme?.background?.dark?.card || '#1e1e1e' : theme?.background?.light?.card || '#ffffff';
    const borderColor = isDarkMode ? theme?.border?.dark?.main || '#3a3a3a' : theme?.border?.light?.main || '#e0e0e0';
    const textPrimary = isDarkMode ? theme?.text?.dark?.primary || '#ffffff' : theme?.text?.light?.primary || '#252525';
    const textSecondary = isDarkMode ? theme?.text?.dark?.secondary || '#e0e0e0' : theme?.text?.light?.secondary || '#3e3e3e';
    const textMuted = isDarkMode ? theme?.text?.dark?.muted || '#a0a0a0' : theme?.text?.light?.muted || '#6c6c6c';
    const primaryColor = theme?.primary?.main || '#9a334d';
    const primaryGradient = theme?.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)';

    const steps = [
        'Confirma tu pedido haciendo clic en el botón de abajo',
        'Recibirás la confirmación de tu pedido',
        'Abonás en efectivo al momento de la entrega o en el local',
    ];

    return (
        <div className="space-y-4">
            {/* Total destacado */}
            <div
                className="flex flex-col items-center py-6 px-5 rounded-xl border"
                style={{ backgroundColor: bgCard, borderColor }}
            >
                <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: '#10b98120' }}
                >
                    <FaMoneyBillWave className="text-2xl text-emerald-500" />
                </div>
                <p className="text-xs mb-1" style={{ color: textMuted }}>Total a pagar en efectivo</p>
                <p className="text-4xl font-bold" style={{ color: primaryColor }}>
                    {formatPrice(amount)}
                </p>
            </div>

            {/* Pasos */}
            <div className="space-y-2">
                {steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                        <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-white"
                            style={{ background: primaryGradient }}
                        >
                            {i + 1}
                        </div>
                        <p style={{ color: textSecondary }}>{step}</p>
                    </div>
                ))}
            </div>

            {/* Instrucciones personalizadas */}
            {config.instructions && (
                <div
                    className="flex items-start gap-3 p-3.5 rounded-lg text-sm"
                    style={{ backgroundColor: isDarkMode ? '#1f1e1e' : '#f9f8f7', color: textSecondary }}
                >
                    <FaInfoCircle className="flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                    <p className="leading-relaxed">{config.instructions}</p>
                </div>
            )}

            {/* Confirmación */}
            <button
                type="button"
                onClick={onConfirm}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
                style={{ background: primaryGradient, opacity: isProcessing ? 0.7 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
            >
                {isProcessing ? (
                    <><FaSpinner className="animate-spin" /> Procesando pedido...</>
                ) : (
                    <><FaCheckCircle /> Confirmar pedido en efectivo</>
                )}
            </button>
        </div>
    );
}
