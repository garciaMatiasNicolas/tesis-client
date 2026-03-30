"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaEye, FaEyeSlash, FaTimes, FaUser, FaLock } from 'react-icons/fa';

const UserLoginModal = ({ isOpen, onClose, onLogin, customerEmail, isDarkMode = false, theme }) => {
    const [formData, setFormData] = useState({
        email: customerEmail,
        password: ''
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Hook para manejar el montaje del componente
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Actualizar email cuando cambie customerEmail
    useEffect(() => {
        setFormData(prev => ({ ...prev, email: customerEmail || '' }));
    }, [customerEmail]);

    // Limpiar formulario cuando se abra/cierre el modal
    useEffect(() => {
        if (isOpen) {
            setFormData({ email: customerEmail, password: '' });
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen, customerEmail]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'El email es requerido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onLogin(formData);
        } catch (error) {
            console.error('Error en login:', error);
            setErrors({ general: 'Email o contraseña incorrectos' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !mounted) return null;

    const bgColor = isDarkMode ? theme?.background : 'bg-white';
    const textColor = isDarkMode ? theme?.text : 'text-gray-900';
    const borderColor = isDarkMode ? theme?.border : 'border-gray-300';

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 min-h-screen">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 backdrop-blur-md transition-all duration-300"
                style={{
                    backgroundColor: isDarkMode 
                        ? 'rgba(30, 30, 30, 0.4)' 
                        : 'rgba(255, 255, 255, 0.4)'
                }}
                onClick={onClose}
            />

            {/* Modal */}
            <div 
                className="relative w-full max-w-md rounded-xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100 z-[10000]"
                style={{
                    backgroundColor: isDarkMode 
                        ? theme?.background?.dark?.card || '#1e1e1e' 
                        : theme?.background?.light?.card || '#ffffff'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b"
                    style={{
                        borderColor: isDarkMode 
                            ? theme?.border?.dark?.main || '#3a3a3a' 
                            : theme?.border?.light?.main || '#e0e0e0'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{
                                    background: theme?.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)'
                                }}
                            >
                                <FaUser className="text-white text-sm" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold"
                                    style={{
                                        color: isDarkMode 
                                            ? theme?.text?.dark?.primary || '#ffffff' 
                                            : theme?.text?.light?.primary || '#252525'
                                    }}
                                >
                                    Inicia sesión
                                </h3>
                                <p className="text-sm"
                                    style={{
                                        color: isDarkMode 
                                            ? theme?.text?.dark?.secondary || '#e0e0e0' 
                                            : theme?.text?.light?.secondary || '#3e3e3e'
                                    }}
                                >
                                    Para finalizar tu pedido
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="hover:opacity-70 transition-opacity"
                            style={{
                                color: isDarkMode 
                                    ? theme?.text?.dark?.secondary || '#e0e0e0' 
                                    : theme?.text?.light?.secondary || '#3e3e3e'
                            }}
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
            <form onSubmit={handleSubmit} className="p-6">
                {/* Error general */}
                {errors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{errors.general}</p>
                    </div>
                )}

                {/* Email */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2"
                        style={{
                            color: isDarkMode 
                                ? theme?.text?.dark?.secondary || '#e0e0e0' 
                                : theme?.text?.light?.secondary || '#3e3e3e'
                        }}>
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        style={{
                            backgroundColor: isDarkMode 
                                ? theme?.background?.dark?.input || '#2a2a2a' 
                                : theme?.background?.light?.input || '#f9f9f9',
                            borderColor: errors.email 
                                ? '#ef4444' 
                                : isDarkMode 
                                    ? theme?.border?.dark?.main || '#3a3a3a' 
                                    : theme?.border?.light?.main || '#e0e0e0',
                            color: isDarkMode 
                                ? theme?.text?.dark?.primary || '#ffffff' 
                                : theme?.text?.light?.primary || '#252525'
                        }}
                        placeholder="tu@email.com"
                        readOnly={!!(customerEmail && customerEmail.trim())} // Solo readonly si viene email específico
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                </div>

                {/* Contraseña */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2"
                        style={{
                            color: isDarkMode 
                                ? theme?.text?.dark?.secondary || '#e0e0e0' 
                                : theme?.text?.light?.secondary || '#3e3e3e'
                        }}>
                        Contraseña
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            style={{
                                backgroundColor: isDarkMode 
                                    ? theme?.background?.dark?.input || '#2a2a2a' 
                                    : theme?.background?.light?.input || '#f9f9f9',
                                borderColor: errors.password 
                                    ? '#ef4444' 
                                    : isDarkMode 
                                        ? theme?.border?.dark?.main || '#3a3a3a' 
                                        : theme?.border?.light?.main || '#e0e0e0',
                                color: isDarkMode 
                                    ? theme?.text?.dark?.primary || '#ffffff' 
                                    : theme?.text?.light?.primary || '#252525'
                            }}
                            placeholder="••••••••"
                            disabled={isSubmitting}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity"
                            style={{
                                color: isDarkMode 
                                    ? theme?.text?.dark?.secondary || '#e0e0e0' 
                                    : theme?.text?.light?.secondary || '#3e3e3e'
                            }}
                            disabled={isSubmitting}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border rounded-lg hover:opacity-80 transition-all"
                        style={{
                            borderColor: isDarkMode 
                                ? theme?.border?.dark?.main || '#3a3a3a' 
                                : theme?.border?.light?.main || '#e0e0e0',
                            backgroundColor: 'transparent',
                            color: isDarkMode 
                                ? theme?.text?.dark?.primary || '#ffffff' 
                                : theme?.text?.light?.primary || '#252525'
                        }}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{
                            background: theme?.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)'
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Iniciando...
                            </>
                        ) : (
                            <>
                                <FaLock />
                                Iniciar Sesión
                            </>
                        )}
                    </button>
                </div>
            </form>
            </div>   

        </div>
    );

    // Usar createPortal para renderizar el modal en el body
    return createPortal(modalContent, document.body);
};

export default UserLoginModal;