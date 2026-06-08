"use client";
import React, { useEffect, useRef, useState } from 'react';
import { FaSpinner, FaLock, FaExclamationTriangle, FaRedo } from 'react-icons/fa';

const MP_SDK_URL = 'https://sdk.mercadopago.com/js/v2';

function loadMercadoPagoSDK() {
    return new Promise((resolve, reject) => {
        if (window.MercadoPago) { resolve(window.MercadoPago); return; }
        const existing = document.querySelector(`script[src="${MP_SDK_URL}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve(window.MercadoPago));
            existing.addEventListener('error', reject);
            return;
        }
        const script = document.createElement('script');
        script.src = MP_SDK_URL;
        script.onload = () => resolve(window.MercadoPago);
        script.onerror = () => reject(new Error('No se pudo cargar el SDK de Mercado Pago'));
        document.head.appendChild(script);
    });
}

export default function CardPaymentBrick({
    publicKey,
    amount,
    customerEmail = '',
    maxInstallments = 1,
    onSubmit,
    onError,
    isDarkMode,
    theme,
    resetKey = 0,   // incrementar desde el padre para forzar reinicio tras fallo
}) {
    const controllerRef = useRef(null);
    const [brickReady, setBrickReady] = useState(false);
    const [brickError, setBrickError] = useState(null);
    const [retryKey, setRetryKey] = useState(0);

    // Ref al callback más reciente: evita stale-closure cuando el padre re-renderiza
    // (el Brick captura onSubmit una sola vez al crear, pero siempre llama a la versión actual)
    const onSubmitRef = useRef(onSubmit);
    useEffect(() => { onSubmitRef.current = onSubmit; }, [onSubmit]);

    useEffect(() => {
        if (!publicKey || !amount) return;
        let mounted = true;

        const init = async () => {
            setBrickReady(false);
            setBrickError(null);

            // Destruir instancia previa si la hay
            if (controllerRef.current) {
                try { controllerRef.current.unmount(); } catch (_) {}
                controllerRef.current = null;
            }

            try {
                const MercadoPago = await loadMercadoPagoSDK();
                if (!mounted) return;

                const mp = new MercadoPago(publicKey, { locale: 'es-AR' });
                const builder = mp.bricks();

                controllerRef.current = await builder.create(
                    'cardPayment',
                    'mp-card-brick-container',
                    {
                        initialization: {
                            amount: parseFloat(amount),
                            payer: { email: customerEmail },
                        },
                        customization: {
                            visual: {
                                style: { theme: isDarkMode ? 'dark' : 'default' },
                                hideFormTitle: true,
                            },
                            paymentMethods: {
                                maxInstallments,
                                minInstallments: 1,
                            },
                        },
                        callbacks: {
                            onReady: () => { if (mounted) setBrickReady(true); },
                            onSubmit: async (formData) => {
                                // Usar ref para llamar siempre al callback más reciente del padre.
                                // Nunca lanzar: si el callback falla, el Brick queda en estado
                                // "enviando" y el botón queda bloqueado.
                                try {
                                    if (onSubmitRef.current) await onSubmitRef.current(formData);
                                } catch (_) {}
                            },
                            onError: (err) => {
                                if (!mounted) return;
                                if (err?.type === 'NON_CRITICAL') return;
                                setBrickError('Ocurrió un error en el formulario. Por favor, intenta nuevamente.');
                                if (onError) onError(err);
                            },
                        },
                    }
                );
            } catch (err) {
                if (mounted) setBrickError('No se pudo cargar el formulario de pago seguro. Verifica tu conexión.');
            }
        };

        init();

        return () => {
            mounted = false;
            if (controllerRef.current) {
                try { controllerRef.current.unmount(); } catch (_) {}
                controllerRef.current = null;
            }
        };
    }, [publicKey, amount, customerEmail, isDarkMode, maxInstallments, retryKey, resetKey]);

    const primaryColor = theme?.primary?.main || '#009EE3';
    const textMuted = isDarkMode
        ? theme?.text?.dark?.muted || '#a0a0a0'
        : theme?.text?.light?.muted || '#6c6c6c';

    if (!publicKey) {
        return (
            <div className="py-8 text-center text-sm" style={{ color: textMuted }}>
                Este método de pago no está configurado correctamente.
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            {/* Badge de seguridad */}
            <div className="flex items-center gap-2 text-xs" style={{ color: textMuted }}>
                <FaLock className="text-emerald-500 flex-shrink-0" />
                <span>Pago seguro con cifrado SSL · Nunca almacenamos tus datos de tarjeta</span>
            </div>

            {/* Error del brick */}
            {brickError && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p>{brickError}</p>
                        <button
                            type="button"
                            onClick={() => setRetryKey(k => k + 1)}
                            className="flex items-center gap-1 mt-2 text-xs font-medium underline"
                        >
                            <FaRedo className="text-[10px]" /> Reintentar
                        </button>
                    </div>
                </div>
            )}

            {/* Skeleton loading mientras el brick carga */}
            {!brickReady && !brickError && (
                <div className="space-y-3 animate-pulse">
                    <div className="h-4 w-24 rounded" style={{ backgroundColor: isDarkMode ? '#333' : '#e5e7eb' }} />
                    <div className="h-11 rounded-lg" style={{ backgroundColor: isDarkMode ? '#333' : '#e5e7eb' }} />
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-11 rounded-lg" style={{ backgroundColor: isDarkMode ? '#333' : '#e5e7eb' }} />
                        <div className="h-11 rounded-lg" style={{ backgroundColor: isDarkMode ? '#333' : '#e5e7eb' }} />
                    </div>
                    <div className="h-4 w-32 rounded" style={{ backgroundColor: isDarkMode ? '#333' : '#e5e7eb' }} />
                    <div className="h-11 rounded-lg" style={{ backgroundColor: isDarkMode ? '#333' : '#e5e7eb' }} />
                    <div className="flex items-center justify-center gap-2 mt-2" style={{ color: textMuted }}>
                        <FaSpinner className="animate-spin text-sm" style={{ color: primaryColor }} />
                        <span className="text-xs">Cargando formulario seguro...</span>
                    </div>
                </div>
            )}

            {/* Contenedor del Brick de MP — siempre presente en el DOM */}
            <div
                id="mp-card-brick-container"
                style={{ display: brickReady ? 'block' : 'none' }}
            />

            {/* Logos de medios de pago */}
            {brickReady && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-xs" style={{ color: textMuted }}>Aceptamos:</span>
                    {['Visa', 'Mastercard', 'Amex', 'Naranja', 'Cabal'].map(brand => (
                        <span
                            key={brand}
                            className="text-xs px-2 py-0.5 rounded border"
                            style={{
                                color: textMuted,
                                borderColor: isDarkMode ? theme?.border?.dark?.main : theme?.border?.light?.main,
                            }}
                        >
                            {brand}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
