"use client";
import React, { useEffect, useState, createContext, useContext, useCallback, useRef } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

// ─── Shared config ────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
    success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: FaCheckCircle,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
        titleColor: 'text-green-900',
        progressBar: 'bg-green-500',
    },
    danger: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: FaExclamationCircle,
        iconColor: 'text-red-600',
        iconBg: 'bg-red-100',
        titleColor: 'text-red-900',
        progressBar: 'bg-red-500',
    },
    warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: FaExclamationCircle,
        iconColor: 'text-yellow-600',
        iconBg: 'bg-yellow-100',
        titleColor: 'text-yellow-900',
        progressBar: 'bg-yellow-500',
    },
    info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: FaInfoCircle,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        titleColor: 'text-blue-900',
        progressBar: 'bg-blue-500',
    },
};

const POSITION_CLASSES = {
    'top-right':      'top-4 right-4 items-end',
    'top-left':       'top-4 left-4 items-start',
    'bottom-right':   'bottom-4 right-4 items-end',
    'bottom-left':    'bottom-4 left-4 items-start',
    'top-center':     'top-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-center':  'bottom-4 left-1/2 -translate-x-1/2 items-center',
};

// ─── ToastItem (used internally by ToastProvider) ─────────────────────────────

function ToastItem({ id, type = 'success', title, text, duration = 5000, onRemove }) {
    const [visible, setVisible]   = useState(false);
    const [leaving, setLeaving]   = useState(false);
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
    const Icon   = config.icon;

    useEffect(() => {
        const enterTimer = setTimeout(() => setVisible(true), 10);
        const closeTimer = setTimeout(handleClose, duration);
        return () => {
            clearTimeout(enterTimer);
            clearTimeout(closeTimer);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration]);

    function handleClose() {
        setLeaving(true);
        setTimeout(() => onRemove(id), 280);
    }

    return (
        <div
            className={`
                relative flex items-start gap-3 p-4 rounded-xl shadow-lg border-l-4
                ${config.border} ${config.bg}
                max-w-sm w-full pointer-events-auto overflow-hidden
                transition-all duration-300 ease-in-out
                ${visible && !leaving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
            `}
        >
            {/* Icon */}
            <div className={`flex-shrink-0 w-9 h-9 rounded-full ${config.iconBg} flex items-center justify-center mt-0.5`}>
                <Icon className={`w-4 h-4 ${config.iconColor}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
                {title && (
                    <p className={`text-sm font-semibold ${config.titleColor} leading-tight`}>
                        {title}
                    </p>
                )}
                {text && (
                    <p className={`text-sm text-gray-600 leading-snug ${title ? 'mt-0.5' : ''}`}>
                        {text}
                    </p>
                )}
            </div>

            {/* Close button */}
            <button
                onClick={handleClose}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
                aria-label="Cerrar"
            >
                <FaTimes className="w-3.5 h-3.5" />
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${config.progressBar}`}
                    style={{ animation: `toast-shrink ${duration}ms linear forwards` }}
                />
            </div>
        </div>
    );
}

// ─── ToastContext ─────────────────────────────────────────────────────────────

const ToastContext = createContext(null);

// ─── ToastProvider ────────────────────────────────────────────────────────────
// Wrap your app (or layout) with this to enable useToast anywhere below.
//
// Props:
//   position  – 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
//   maxToasts – max number of visible toasts at once (oldest removed when exceeded)

export function ToastProvider({ children, position = 'bottom-right', maxToasts = 5 }) {
    const [toasts, setToasts] = useState([]);
    const counter = useRef(0);

    const addToast = useCallback(({ type, title, text, duration = 5000 }) => {
        const id = ++counter.current;
        setToasts(prev => [...prev, { id, type, title, text, duration }].slice(-maxToasts));
        return id;
    }, [maxToasts]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const isBottom = position.startsWith('bottom');

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}

            <div
                className={`
                    fixed z-[9999] flex gap-2 pointer-events-none
                    ${isBottom ? 'flex-col-reverse' : 'flex-col'}
                    ${POSITION_CLASSES[position] || POSITION_CLASSES['bottom-right']}
                `}
            >
                {toasts.map(toast => (
                    <ToastItem key={toast.id} {...toast} onRemove={removeToast} />
                ))}
            </div>

            <style jsx global>{`
                @keyframes toast-shrink {
                    from { width: 100%; }
                    to   { width: 0%;   }
                }
            `}</style>
        </ToastContext.Provider>
    );
}

// ─── useToast ─────────────────────────────────────────────────────────────────
// Must be used inside <ToastProvider>.
//
// const { toast, success, error, warning, info } = useToast();
//
// toast({ type, title, text, duration })   – generic call
// success(title, text?, duration?)         – shorthand helpers
// error  (title, text?, duration?)
// warning(title, text?, duration?)
// info   (title, text?, duration?)

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');

    return {
        toast:   ctx.addToast,
        success: (title, text, duration) => ctx.addToast({ type: 'success', title, text, duration }),
        error:   (title, text, duration) => ctx.addToast({ type: 'danger',  title, text, duration }),
        warning: (title, text, duration) => ctx.addToast({ type: 'warning', title, text, duration }),
        info:    (title, text, duration) => ctx.addToast({ type: 'info',    title, text, duration }),
        dismiss: ctx.removeToast,
    };
}

// ─── Standalone Toast (no provider needed) ────────────────────────────────────
// Use this when you need a single, self-contained toast rendered directly in JSX.
//
// Props:
//   type      – 'success' | 'danger' | 'warning' | 'info'   (default: 'success')
//   title     – bold heading text
//   text      – body text
//   duration  – ms before auto-close                         (default: 5000)
//   onClose   – callback fired when the toast closes
//   position  – corner placement                             (default: 'bottom-right')

export default function Toast({
    type     = 'success',
    title,
    text,
    duration = 5000,
    onClose,
    position = 'bottom-right',
}) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [mounted, setMounted] = useState(true);
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
    const Icon   = config.icon;

    useEffect(() => {
        const enterTimer = setTimeout(() => setVisible(true), 10);
        const closeTimer = setTimeout(handleClose, duration);
        return () => {
            clearTimeout(enterTimer);
            clearTimeout(closeTimer);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration]);

    function handleClose() {
        setLeaving(true);
        setTimeout(() => {
            setMounted(false);
            if (onClose) onClose();
        }, 280);
    }

    if (!mounted) return null;

    const cornerClass = (POSITION_CLASSES[position] || POSITION_CLASSES['bottom-right'])
        .split(' ')
        .filter(c => !c.startsWith('items-'))
        .join(' ');

    return (
        <div className={`fixed z-[9999] ${cornerClass}`}>
            <div
                className={`
                    relative flex items-start gap-3 p-4 rounded-xl shadow-lg border-l-4
                    ${config.border} ${config.bg}
                    max-w-sm w-full overflow-hidden
                    transition-all duration-300 ease-in-out
                    ${visible && !leaving ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
                `}
            >
                <div className={`flex-shrink-0 w-9 h-9 rounded-full ${config.iconBg} flex items-center justify-center mt-0.5`}>
                    <Icon className={`w-4 h-4 ${config.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0 pr-1">
                    {title && (
                        <p className={`text-sm font-semibold ${config.titleColor} leading-tight`}>
                            {title}
                        </p>
                    )}
                    {text && (
                        <p className={`text-sm text-gray-600 leading-snug ${title ? 'mt-0.5' : ''}`}>
                            {text}
                        </p>
                    )}
                </div>

                <button
                    onClick={handleClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
                    aria-label="Cerrar"
                >
                    <FaTimes className="w-3.5 h-3.5" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${config.progressBar}`}
                        style={{ animation: `toast-shrink ${duration}ms linear forwards` }}
                    />
                </div>
            </div>

            <style jsx>{`
                @keyframes toast-shrink {
                    from { width: 100%; }
                    to   { width: 0%;   }
                }
            `}</style>
        </div>
    );
}
