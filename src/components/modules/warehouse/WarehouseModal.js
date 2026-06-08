"use client";
import React, { useState, useEffect } from 'react';
import { FaTimes, FaWarehouse, FaMapMarkerAlt } from 'react-icons/fa';

export default function WarehouseModal({ isOpen, onClose, onSave, warehouse = null }) {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        country: ''
    });
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Cargar datos del depósito si estamos editando
    useEffect(() => {
        if (warehouse) {
            setFormData({
                name: warehouse.name || '',
                address: warehouse.address || '',
                city: warehouse.city || '',
                state: warehouse.state || '',
                country: warehouse.country || ''
            });
        } else {
            setFormData({
                name: '',
                address: '',
                city: '',
                state: '',
                country: ''
            });
        }
        setErrors({});
    }, [warehouse, isOpen]);

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name || formData.name.trim() === '') {
            newErrors.name = 'El nombre es requerido';
        }

        if (!formData.address || formData.address.trim() === '') {
            newErrors.address = 'La dirección es requerida';
        }

        if (!formData.city || formData.city.trim() === '') {
            newErrors.city = 'La ciudad es requerida';
        }

        if (!formData.state || formData.state.trim() === '') {
            newErrors.state = 'La provincia es requerida';
        }

        if (!formData.country || formData.country.trim() === '') {
            newErrors.country = 'El país es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar cambios en los campos
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSaving(true);
        try {
            const result = await onSave(formData);
            
            // Si hubo errores de validación del backend
            if (result && !result.success && result.validationErrors) {
                setErrors(result.validationErrors);
            }
        } catch (error) {
            console.error('Error guardando depósito:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Manejar cierre del modal
    const handleClose = () => {
        if (!isSaving) {
            setFormData({
                name: '',
                address: '',
                city: '',
                state: '',
                country: ''
            });
            setErrors({});
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all"
                onClick={handleClose}
            ></div>

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {warehouse ? 'Editar Depósito' : 'Nuevo Depósito'}
                        </h3>
                        <button
                            onClick={handleClose}
                            disabled={isSaving}
                            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                        >
                            <FaTimes className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Nombre del depósito */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center">
                                    <FaWarehouse className="mr-2 text-gray-400" />
                                    Nombre del Depósito
                                    <span className="text-red-500 ml-1">*</span>
                                </div>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 text-black py-2 border rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all duration-200 ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Ej: Depósito Central"
                                disabled={isSaving}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>
                        
                        {/* País */}
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center">
                                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                                    País
                                    <span className="text-red-500 ml-1">*</span>
                                </div>
                            </label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black transition-all duration-200 ${
                                    errors.country ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Ej: Argentina"
                                disabled={isSaving}
                            />
                            {errors.country && (
                                <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                            )}
                        </div>
                        
                        {/* Provincia */}
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center">
                                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                                    Provincia
                                    <span className="text-red-500 ml-1">*</span>
                                </div>
                            </label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black transition-all duration-200 ${
                                    errors.state ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Ej: CABA"
                                disabled={isSaving}
                            />
                            {errors.state && (
                                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                            )}
                        </div>

                        {/* Ciudad */}
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center">
                                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                                    Ciudad
                                    <span className="text-red-500 ml-1">*</span>
                                </div>
                            </label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black transition-all duration-200 ${
                                    errors.city ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Ej: Buenos Aires"
                                disabled={isSaving}
                            />
                            {errors.city && (
                                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                            )}
                        </div>

                        {/* Dirección */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center">
                                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                                    Dirección
                                    <span className="text-red-500 ml-1">*</span>
                                </div>
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black transition-all duration-200 ${
                                    errors.address ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Ej: Av. Libertador 1234"
                                disabled={isSaving}
                            />
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                            )}
                        </div>

                        {/* Footer - Botones */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSaving}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-4 py-2 bg-[#18c29c] hover:bg-[#15a884] text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    warehouse ? 'Actualizar' : 'Crear Depósito'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
