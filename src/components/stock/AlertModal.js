"use client";
import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const AlertModal = ({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    type = "success", // success, error, info
    autoClose = true,
    autoCloseDelay = 3000
}) => {
    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);
            
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, autoCloseDelay, onClose]);

    if (!isOpen) return null;

    const typeConfig = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: FaCheckCircle,
            iconColor: 'text-green-600',
            titleColor: 'text-green-900'
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: FaExclamationCircle,
            iconColor: 'text-red-600',
            titleColor: 'text-red-900'
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: FaInfoCircle,
            iconColor: 'text-blue-600',
            titleColor: 'text-blue-900'
        }
    };

    const config = typeConfig[type] || typeConfig.info;
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-all"
                onClick={onClose}
            />
            
            {/* Alert */}
            <div className="flex min-h-full items-start justify-center p-4 pt-20">
                <div className={`relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 border-l-4 ${config.border} transform transition-all animate-slide-down`}>
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes className="w-4 h-4" />
                    </button>

                    {/* Content */}
                    <div className="flex items-start gap-4 pr-8">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${config.iconColor}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-base font-semibold ${config.titleColor} mb-1`}>
                                {title}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {message}
                            </p>
                        </div>
                    </div>

                    {/* Progress bar for auto-close */}
                    {autoClose && (
                        <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${config.iconColor.replace('text-', 'bg-')} transition-all`}
                                style={{
                                    animation: `shrink ${autoCloseDelay}ms linear`,
                                    width: '100%'
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes shrink {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }
                
                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AlertModal;
