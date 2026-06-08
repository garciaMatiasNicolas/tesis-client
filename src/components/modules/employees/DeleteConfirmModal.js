"use client";
import React from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

const DeleteConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    employee,
    loading = false 
}) => {
    if (!isOpen || !employee) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <FaExclamationTriangle className="text-red-600 text-xl" />
                        <h2 className="text-xl font-bold text-gray-800">
                            Confirmar Eliminación
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-gray-700 mb-4">
                            ¿Estás seguro de que deseas eliminar a este empleado?
                        </p>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                {employee.profile_photo ? (
                                    <img
                                        src={employee.profile_photo}
                                        alt={employee.user_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                        <FaExclamationTriangle className="text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-red-800">
                                        {employee.user_name}
                                    </p>
                                    <p className="text-red-600 text-sm">
                                        {employee.position} - {employee.user_email}
                                    </p>
                                    <p className="text-red-600 text-sm">
                                        DNI: {employee.dni}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-red-600 text-sm mt-4 font-medium">
                            <FaExclamationTriangle className="inline mr-2" />
                            Esta acción no se puede deshacer.
                        </p>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => onConfirm(employee)}
                            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Eliminando...' : 'Eliminar Empleado'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;