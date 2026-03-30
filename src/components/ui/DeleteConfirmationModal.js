import React from 'react';
import { FaTrash, FaTimes, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

export default function DeleteConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    // Props compatibles con versión anterior
    productName,
    itemName,
    itemType = 'producto',
    isDeleting = false,
    deleteButtonText = 'Eliminar',
    // Nuevos props para mayor flexibilidad
    title,
    message,
    detailLabel,
    detailValue,
    warningMessage,
    confirmButtonText,
    confirmButtonColor = 'red', // red, yellow, green, blue
    actionType = 'delete', // delete, warning, info, success
    isProcessing = false,
    commentLabel = 'Comentario',
    commentPlaceholder = 'Escribe un comentario...',
    commentValue = '',
    onCommentChange,
    commentRequired = false,
    commentError = ''
}) {
    if (!isOpen) return null;

    // Compatibilidad con props anteriores
    const displayName = detailValue || itemName || productName;
    const itemLabel = detailLabel || (itemType === 'cliente' ? 'Cliente' : itemType === 'producto' ? 'Producto' : 'Item');
    const processing = isProcessing || isDeleting;
    const buttonText = confirmButtonText || deleteButtonText;

    // Configuración según el tipo de acción
    const actionConfig = {
        delete: {
            icon: FaTrash,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            title: title || 'Confirmar eliminación',
            message: message || `¿Estás seguro de que deseas eliminar este ${itemType}?`,
            warning: warningMessage || 'Esta acción no se puede deshacer.',
            warningColor: 'text-red-600',
            buttonBg: 'bg-red-600 hover:bg-red-700',
            buttonIcon: FaTrash,
            processingText: 'Eliminando...'
        },
        warning: {
            icon: FaExclamationTriangle,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            title: title || 'Confirmar acción',
            message: message || '¿Estás seguro de que deseas realizar esta acción?',
            warning: warningMessage || 'Esta acción puede tener consecuencias importantes.',
            warningColor: 'text-yellow-600',
            buttonBg: confirmButtonColor === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' : 
                      confirmButtonColor === 'green' ? 'bg-green-600 hover:bg-green-700' :
                      confirmButtonColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                      'bg-red-600 hover:bg-red-700',
            buttonIcon: FaExclamationTriangle,
            processingText: 'Procesando...'
        },
        info: {
            icon: FaInfoCircle,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            title: title || 'Confirmar acción',
            message: message || '¿Deseas continuar con esta acción?',
            warning: warningMessage || 'Por favor, revisa la información antes de confirmar.',
            warningColor: 'text-blue-600',
            buttonBg: 'bg-blue-600 hover:bg-blue-700',
            buttonIcon: FaCheckCircle,
            processingText: 'Procesando...'
        },
        success: {
            icon: FaCheckCircle,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            title: title || 'Confirmar acción',
            message: message || '¿Deseas continuar con esta acción?',
            warning: warningMessage || 'Confirma para proceder.',
            warningColor: 'text-green-600',
            buttonBg: 'bg-green-600 hover:bg-green-700',
            buttonIcon: FaCheckCircle,
            processingText: 'Procesando...'
        }
    };

    const config = actionConfig[actionType] || actionConfig.delete;
    const Icon = config.icon;
    const ButtonIcon = config.buttonIcon;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${config.iconBg} rounded-full flex items-center justify-center`}>
                            <Icon className={`${config.iconColor} text-lg`} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {config.title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        disabled={processing}
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-600 mb-2">
                        {config.message}
                    </p>
                    {displayName && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <p className="text-sm text-gray-500">{itemLabel}:</p>
                            <p className="font-medium text-gray-900">{displayName}</p>
                        </div>
                    )}
                    <p className={`text-sm ${config.warningColor}`}>
                        {config.warning}
                    </p>

                    {(commentRequired || onCommentChange) && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {commentLabel}{commentRequired ? ' *' : ''}
                            </label>
                            <textarea
                                value={commentValue}
                                onChange={(e) => onCommentChange && onCommentChange(e.target.value)}
                                placeholder={commentPlaceholder}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all duration-200 text-black"
                            />
                            {commentError && (
                                <p className="text-xs text-red-600 mt-1">{commentError}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        disabled={processing}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2 ${config.buttonBg} text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2`}
                        disabled={processing || (commentRequired && !commentValue.trim())}
                    >
                        {processing ? (
                            <>
                                <FaSpinner className="animate-spin text-sm" />
                                {config.processingText}
                            </>
                        ) : (
                            <>
                                <ButtonIcon className="text-sm" />
                                {buttonText}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}