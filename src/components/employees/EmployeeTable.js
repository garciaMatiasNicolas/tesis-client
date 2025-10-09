"use client";
import React from "react";
import { FaEdit, FaTrash, FaUser, FaEnvelope, FaMapMarkerAlt, FaPhone, FaBriefcase } from "react-icons/fa";

const EmployeeTable = ({ 
    employees = [], 
    onEdit, 
    onDelete, 
    loading = false,
    userRole = "employee" 
}) => {
    const canEdit = ["superadmin", "manager"].includes(userRole);
    const canDelete = ["superadmin", "manager"].includes(userRole);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#18c29c]"></div>
                    <span className="ml-3 text-gray-600">Cargando empleados...</span>
                </div>
            </div>
        );
    }

    if (employees.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center">
                    <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-3">No hay empleados</h3>
                    <p className="text-gray-500">
                        {canEdit 
                            ? "¡Comienza agregando tu primer empleado!"
                            : "Aún no se han registrado empleados."
                        }
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Empleado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contacto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Puesto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sucursal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                DNI
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha Ingreso
                            </th>
                            {(canEdit || canDelete) && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {employee.profile_photo ? (
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    src={employee.profile_photo}
                                                    alt={employee.user_name}
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <FaUser className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {employee.user_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ID: {employee.id}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 flex items-center">
                                        <FaEnvelope className="text-gray-400 mr-2" />
                                        {employee.user_email}
                                    </div>
                                    {employee.phone && (
                                        <div className="text-sm text-gray-500 flex items-center mt-1">
                                            <FaPhone className="text-gray-400 mr-2" />
                                            {employee.phone}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-900">
                                        <FaBriefcase className="text-gray-400 mr-2" />
                                        {employee.position}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {employee.branch_name || 'Sin asignar'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {employee.store_name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {employee.dni}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(employee.date_joined).toLocaleDateString('es-ES')}
                                </td>
                                {(canEdit || canDelete) && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            {canEdit && (
                                                <button
                                                    onClick={() => onEdit(employee)}
                                                    className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-full transition-colors"
                                                    title="Editar empleado"
                                                >
                                                    <FaEdit />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => onDelete(employee)}
                                                    className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                    title="Eliminar empleado"
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeTable;