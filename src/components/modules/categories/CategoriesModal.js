"use client";
import React, { useState, useEffect } from 'react';
import { FaTimes, FaFolder, FaTags, FaSave } from 'react-icons/fa';

const CategoriesModal = ({
    isOpen,
    onClose,
    onSubmit,
    mode = 'create', // 'create' or 'edit'
    type = 'category', // 'category' or 'subcategory'
    item = null,
    categories = []
}) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '' // Solo para subcategorías
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Resetear formulario cuando se abre/cierra el modal
    useEffect(() => {
        if (isOpen) {
            if (item && mode === 'edit') {
                setFormData({
                    name: item.name || '',
                    category: item.category || ''
                });
            } else {
                setFormData({
                    name: '',
                    category: ''
                });
            }
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen, item, mode]);

    // Manejar cambios en los inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        }

        if (type === 'subcategory' && !formData.category) {
            newErrors.category = 'La categoría es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const dataToSubmit = type === 'category'
                ? { name: formData.name }
                : { name: formData.name, category: parseInt(formData.category) };

            const result = await onSubmit(dataToSubmit);

            if (result && result.success) {
                onClose();
            } else if (result && result.validationErrors) {
                // Manejar errores de validación del backend
                const backendErrors = {};
                if (result.validationErrors.name) {
                    backendErrors.name = result.validationErrors.name.join(', ');
                }
                if (result.validationErrors.category) {
                    backendErrors.category = result.validationErrors.category.join(', ');
                }
                setErrors(backendErrors);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const isCategory = type === 'category';
    const title = mode === 'create'
        ? (isCategory ? 'Nueva Categoría' : 'Nueva Subcategoría')
        : (isCategory ? 'Editar Categoría' : 'Editar Subcategoría');

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#18c29c] rounded-lg">
                            {isCategory ? (
                                <FaFolder className="text-white text-lg" />
                            ) : (
                                <FaTags className="text-white text-lg" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                            <p className="text-sm text-gray-600">
                                {isCategory ? 'Categoría principal' : 'Subcategoría asociada'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={isSubmitting}
                    >
                        <FaTimes className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Nombre */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder={`Ingrese el nombre de la ${isCategory ? 'categoría' : 'subcategoría'}`}
                            disabled={isSubmitting}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Categoría (solo para subcategorías) */}
                    {!isCategory && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Categoría *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent ${
                                    errors.category ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isSubmitting}
                            >
                                <option value="">Seleccionar categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                            )}
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#18c29c] text-white rounded-lg hover:bg-[#15a884] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <FaSave className="text-sm" />
                                    {mode === 'create' ? 'Crear' : 'Actualizar'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoriesModal;