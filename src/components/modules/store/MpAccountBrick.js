"use client";
import React from 'react';
import { FaWallet, FaSpinner, FaArrowRight, FaLock } from 'react-icons/fa';

/**
 * Botón de pago con cuenta de Mercado Pago.
 * Usa el flujo de preferencia + redirect (Checkout Pro) en lugar del Payment Brick
 * con wallet_purchase, que requiere un preferenceId en la inicialización y falla
 * sin él con "No payment type was selected".
 *
 * onSubmit: () => void — debe crear la orden + preferencia y redirigir al init_point.
 */
export default function MpAccountBrick({
    onSubmit,
    isProcessing = false,
    isDarkMode,
    theme,
}) {
    const textMuted = isDarkMode
        ? theme?.text?.dark?.muted || '#a0a0a0'
        : theme?.text?.light?.muted || '#6c6c6c';
    const cardBg = isDarkMode
        ? theme?.background?.dark?.card || '#1e1e1e'
        : '#f0f8fe';
    const borderCol = '#009EE320';

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center gap-2 text-xs" style={{ color: textMuted }}>
                <FaWallet className="text-[#009EE3] flex-shrink-0" />
                <span>Serás redirigido al sitio de Mercado Pago para completar el pago con tu cuenta o saldo.</span>
            </div>

            <div
                className="rounded-xl border p-5 flex flex-col items-center gap-3 text-center"
                style={{ backgroundColor: cardBg, borderColor: borderCol }}
            >
                <div className="flex items-center gap-2">
                    <FaWallet className="text-[#009EE3] text-2xl" />
                    <span className="font-bold text-[#009EE3] text-xl">Mercado Pago</span>
                </div>
                <p className="text-xs" style={{ color: textMuted }}>
                    Usá el saldo de tu cuenta, tarjeta guardada o cualquier medio disponible en Mercado Pago.
                </p>

                <button
                    type="button"
                    onClick={() => onSubmit?.()}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: isProcessing ? '#0081bb' : '#009EE3' }}
                    onMouseEnter={e => { if (!isProcessing) e.currentTarget.style.backgroundColor = '#0081bb'; }}
                    onMouseLeave={e => { if (!isProcessing) e.currentTarget.style.backgroundColor = '#009EE3'; }}
                >
                    {isProcessing ? (
                        <><FaSpinner className="animate-spin text-sm" /> Preparando pago...</>
                    ) : (
                        <>Pagar con Mercado Pago <FaArrowRight className="text-sm" /></>
                    )}
                </button>

                <div className="flex items-center gap-1 text-xs" style={{ color: textMuted }}>
                    <FaLock className="text-emerald-500 text-[10px]" />
                    <span>Pago seguro procesado por Mercado Pago</span>
                </div>
            </div>
        </div>
    );
}
