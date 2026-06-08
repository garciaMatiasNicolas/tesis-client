"use client";
import React, { useState } from 'react';
import { FaUniversity, FaCopy, FaCheck, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { formatPrice } from '@/utils/formatData';

function CopyField({ label, value, isDarkMode, theme }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    if (!value) return null;

    const bgCard = isDarkMode ? theme?.background?.dark?.elevated || '#252525' : theme?.background?.light?.elevated || '#f5f0e8';
    const borderColor = isDarkMode ? theme?.border?.dark?.main || '#3a3a3a' : theme?.border?.light?.main || '#e0e0e0';
    const textPrimary = isDarkMode ? theme?.text?.dark?.primary || '#ffffff' : theme?.text?.light?.primary || '#252525';
    const textMuted = isDarkMode ? theme?.text?.dark?.muted || '#a0a0a0' : theme?.text?.light?.muted || '#6c6c6c';

    return (
        <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: textMuted }}>{label}</p>
            <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border"
                style={{ backgroundColor: bgCard, borderColor }}
            >
                <span className="flex-1 font-mono text-sm font-semibold tracking-wide" style={{ color: textPrimary }}>
                    {value}
                </span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all"
                    style={{
                        color: copied ? '#10b981' : textMuted,
                        backgroundColor: copied ? '#10b98120' : 'transparent',
                    }}
                >
                    {copied ? <FaCheck className="text-[10px]" /> : <FaCopy className="text-[10px]" />}
                    {copied ? 'Copiado' : 'Copiar'}
                </button>
            </div>
        </div>
    );
}

export default function BankTransferView({ config = {}, amount, onConfirm, isProcessing, isDarkMode, theme }) {
    const bgCard = isDarkMode ? theme?.background?.dark?.card || '#1e1e1e' : theme?.background?.light?.card || '#ffffff';
    const borderColor = isDarkMode ? theme?.border?.dark?.main || '#3a3a3a' : theme?.border?.light?.main || '#e0e0e0';
    const textPrimary = isDarkMode ? theme?.text?.dark?.primary || '#ffffff' : theme?.text?.light?.primary || '#252525';
    const textSecondary = isDarkMode ? theme?.text?.dark?.secondary || '#e0e0e0' : theme?.text?.light?.secondary || '#3e3e3e';
    const textMuted = isDarkMode ? theme?.text?.dark?.muted || '#a0a0a0' : theme?.text?.light?.muted || '#6c6c6c';
    const primaryColor = theme?.primary?.main || '#9a334d';
    const primaryGradient = theme?.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)';

    return (
        <div className="space-y-4">
            {/* Datos bancarios */}
            <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: bgCard, borderColor }}>
                <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor }}>
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}20` }}
                    >
                        <FaUniversity className="text-sm" style={{ color: primaryColor }} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold" style={{ color: textPrimary }}>
                            {config.bank_name || 'Transferencia Bancaria'}
                        </p>
                        {config.account_holder && (
                            <p className="text-xs" style={{ color: textMuted }}>
                                Titular: {config.account_holder}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <CopyField label="CBU / CVU" value={config.cbu} isDarkMode={isDarkMode} theme={theme} />
                    <CopyField label="Alias" value={config.alias} isDarkMode={isDarkMode} theme={theme} />
                </div>
            </div>

            {/* Monto */}
            <div
                className="py-4 px-5 rounded-xl text-center border"
                style={{
                    borderColor: `${primaryColor}40`,
                    background: `${primaryColor}0D`,
                }}
            >
                <p className="text-xs mb-1" style={{ color: textMuted }}>Monto a transferir</p>
                <p className="text-3xl font-bold" style={{ color: primaryColor }}>
                    {formatPrice(amount)}
                </p>
                <p className="text-xs mt-1" style={{ color: textMuted }}>
                    Transferí exactamente este monto para agilizar la confirmación
                </p>
            </div>

            {/* Instrucciones */}
            {config.instructions && (
                <div
                    className="flex items-start gap-3 p-3.5 rounded-lg text-sm"
                    style={{ backgroundColor: isDarkMode ? '#1f1e1e' : '#f9f8f7', color: textSecondary }}
                >
                    <FaInfoCircle className="flex-shrink-0 mt-0.5 text-sm" style={{ color: primaryColor }} />
                    <p className="leading-relaxed">{config.instructions}</p>
                </div>
            )}

            {/* Botón de confirmación */}
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
                    <><FaUniversity /> Ya realicé la transferencia</>
                )}
            </button>
        </div>
    );
}
