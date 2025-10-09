"use client";
import React from "react";
import { FaTimes, FaUser, FaEdit } from "react-icons/fa";
import EmployeeForm from "./EmployeeForm";

const EmployeeModal = ({ 
    isOpen, 
    onClose, 
    employee = null,
    stores = [],
    branches = [],
    users = [],
    onSubmit,
    loading = false,
    currentUser = null
}) => {
    if (!isOpen) return null;

    const isEdit = employee !== null;

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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out scale-100 opacity-100">
                {/* Header del modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        {isEdit ? (
                            <>
                                <FaEdit className="text-blue-600 text-xl" />
                                <h2 className="text-xl font-bold text-gray-800">
                                    Editar Empleado
                                </h2>
                            </>
                        ) : (
                            <>
                                <FaUser className="text-[#18c29c] text-xl" />
                                <h2 className="text-xl font-bold text-gray-800">
                                    Nuevo Empleado
                                </h2>
                            </>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Contenido del modal */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {isEdit && employee && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-2">
                                Editando empleado: {employee.user_name}
                            </h3>
                            <p className="text-blue-600 text-sm">
                                ID: {employee.id} | Email: {employee.user_email}
                            </p>
                        </div>
                    )}

                    <EmployeeForm
                        employee={employee}
                        stores={stores}
                        branches={branches}
                        users={users}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        loading={loading}
                        isEdit={isEdit}
                        currentUser={currentUser}
                    />
                </div>
            </div>
        </div>
    );
};

export default EmployeeModal;