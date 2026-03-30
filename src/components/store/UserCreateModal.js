import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import useEmailValidation from '../../hooks/useEmailValidation';

const UserCreateModal = ({ isOpen, onClose, onCreateUser, customerData, isDarkMode = false, theme, existingUser }) => {
    const [formData, setFormData] = useState({
        email: customerData?.email || '',
        password: '',
        confirmPassword: '',
        role: 'client',
        first_name: customerData?.firstName || '',
        last_name: customerData?.lastName || ''
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hook para validación de email en tiempo real
    const { emailStatus, validateEmail, resetValidation } = useEmailValidation();

    // Efecto para limpiar validación cuando se abra el modal
    useEffect(() => {
        if (isOpen && formData.email) {
            validateEmail(formData.email);
        } else if (!isOpen) {
            resetValidation();
        }
    }, [isOpen, resetValidation, formData.email]);

    // Validaciones de contraseña
    const passwordValidations = {
        minLength: formData.password.length >= 8,
        hasUpperCase: /[A-Z]/.test(formData.password),
        hasLowerCase: /[a-z]/.test(formData.password),
        hasNumber: /\d/.test(formData.password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
    };

    const isPasswordValid = Object.values(passwordValidations).every(Boolean);
    const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpiar errores cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Validar email en tiempo real
        if (name === 'email') {
            validateEmail(value);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'El email es requerido';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Ingresa un email válido';
        } else if (emailStatus.error) {
            newErrors.email = emailStatus.error;
        } else if (emailStatus.isAvailable === false) {
            newErrors.email = 'Este email ya está en uso';
        }
        
        // Validar contraseña
        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (!isPasswordValid) {
            newErrors.password = 'La contraseña no cumple con los requisitos de seguridad';
        }
        
        // Validar confirmación de contraseña
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (!passwordsMatch) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {

            const userData = {
                email: formData.email,
                password: formData.password,
                role: formData.role,
                first_name: formData.first_name,
                last_name: formData.last_name
            }
            const customerProfileData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: customerData?.phone || '',
                address: customerData?.address || '',
                state: customerData?.state || '',
                country: customerData?.country || '',
                city: customerData?.city || '',
                postal_code: customerData?.postal_code || ''
            };

            await onCreateUser(userData, customerProfileData);
        } catch (error) {
            setErrors({ submit: 'Error al crear el usuario. Inténtalo nuevamente.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 backdrop-blur-sm transition-all duration-300"
                style={{
                    backgroundColor: isDarkMode 
                        ? 'rgba(0, 0, 0, 0.7)' 
                        : 'rgba(0, 0, 0, 0.5)'
                }}
                onClick={onClose}
            />
            
            {/* Modal */}
            <div 
                className="relative w-full max-w-md rounded-xl shadow-2xl transform transition-all duration-300 animate-fade-in"
                style={{
                    backgroundColor: isDarkMode 
                        ? theme?.background?.dark?.card || '#1e1e1e' 
                        : theme?.background?.light?.card || '#ffffff'
                }}
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
                                    Crear cuenta
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-2"
                            style={{
                                color: isDarkMode 
                                    ? theme?.text?.dark?.primary || '#ffffff' 
                                    : theme?.text?.light?.primary || '#252525'
                            }}
                        >
                            Email
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 pr-12 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                                style={{
                                    backgroundColor: isDarkMode 
                                        ? theme?.background?.dark?.elevated || '#252525' 
                                        : theme?.background?.light?.elevated || '#f5f0e8',
                                    borderColor: errors.email || emailStatus.error 
                                        ? '#ef4444' 
                                        : emailStatus.isAvailable === true
                                        ? '#10b981'
                                        : (isDarkMode 
                                            ? theme?.border?.dark?.main || '#3a3a3a' 
                                            : theme?.border?.light?.main || '#e0e0e0'),
                                    color: isDarkMode 
                                        ? theme?.text?.dark?.primary || '#ffffff' 
                                        : theme?.text?.light?.primary || '#252525',
                                    focusRingColor: theme?.primary?.main || '#9a334d'
                                }}
                                placeholder="tu@email.com"
                            />
                            
                            {/* Indicador de validación en tiempo real */}
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                {emailStatus.isValidating ? (
                                    <FaSpinner className="animate-spin text-blue-500" />
                                ) : emailStatus.isAvailable === true ? (
                                    <FaCheck className="text-green-500" />
                                ) : emailStatus.isAvailable === false ? (
                                    <FaTimes className="text-red-500" />
                                ) : null}
                            </div>
                        </div>
                        
                        {/* Mensajes de validación */}
                        {errors.email && (
                            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                        )}
                        {!errors.email && emailStatus.error && (
                            <p className="text-sm text-red-500 mt-1">{emailStatus.error}</p>
                        )}
                        {!errors.email && !emailStatus.error && emailStatus.isAvailable === true && (
                            <p className="text-sm text-green-500 mt-1 flex items-center">
                                <FaCheck className="mr-1" />
                                Email disponible
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium mb-2"
                            style={{
                                color: isDarkMode 
                                    ? theme?.text?.dark?.primary || '#ffffff' 
                                    : theme?.text?.light?.primary || '#252525'
                            }}
                        >
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 pr-12 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                                style={{
                                    backgroundColor: isDarkMode 
                                        ? theme?.background?.dark?.elevated || '#252525' 
                                        : theme?.background?.light?.elevated || '#f5f0e8',
                                    borderColor: errors.password 
                                        ? '#ef4444' 
                                        : (isDarkMode 
                                            ? theme?.border?.dark?.main || '#3a3a3a' 
                                            : theme?.border?.light?.main || '#e0e0e0'),
                                    color: isDarkMode 
                                        ? theme?.text?.dark?.primary || '#ffffff' 
                                        : theme?.text?.light?.primary || '#252525'
                                }}
                                placeholder="Contraseña segura"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:opacity-70"
                                style={{
                                    color: isDarkMode 
                                        ? theme?.text?.dark?.secondary || '#e0e0e0' 
                                        : theme?.text?.light?.secondary || '#3e3e3e'
                                }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Password Requirements */}
                    {formData.password && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium"
                                style={{
                                    color: isDarkMode 
                                        ? theme?.text?.dark?.secondary || '#e0e0e0' 
                                        : theme?.text?.light?.secondary || '#3e3e3e'
                                }}
                            >
                                Requisitos de contraseña:
                            </p>
                            <div className="grid grid-cols-1 gap-1 text-xs">
                                {[
                                    { key: 'minLength', text: 'Mínimo 8 caracteres' },
                                    { key: 'hasUpperCase', text: 'Una letra mayúscula' },
                                    { key: 'hasLowerCase', text: 'Una letra minúscula' },
                                    { key: 'hasNumber', text: 'Un número' },
                                    { key: 'hasSpecialChar', text: 'Un carácter especial' }
                                ].map(({ key, text }) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        {passwordValidations[key] ? (
                                            <FaCheck className="text-green-500 text-xs" />
                                        ) : (
                                            <FaTimes className="text-red-500 text-xs" />
                                        )}
                                        <span style={{
                                            color: passwordValidations[key] 
                                                ? '#10b981' 
                                                : (isDarkMode 
                                                    ? theme?.text?.dark?.muted || '#a0a0a0' 
                                                    : theme?.text?.light?.muted || '#666666')
                                        }}>
                                            {text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium mb-2"
                            style={{
                                color: isDarkMode 
                                    ? theme?.text?.dark?.primary || '#ffffff' 
                                    : theme?.text?.light?.primary || '#252525'
                            }}
                        >
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 pr-12 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                                style={{
                                    backgroundColor: isDarkMode 
                                        ? theme?.background?.dark?.elevated || '#252525' 
                                        : theme?.background?.light?.elevated || '#f5f0e8',
                                    borderColor: errors.confirmPassword 
                                        ? '#ef4444' 
                                        : (isDarkMode 
                                            ? theme?.border?.dark?.main || '#3a3a3a' 
                                            : theme?.border?.light?.main || '#e0e0e0'),
                                    color: isDarkMode 
                                        ? theme?.text?.dark?.primary || '#ffffff' 
                                        : theme?.text?.light?.primary || '#252525'
                                }}
                                placeholder="Confirma tu contraseña"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:opacity-70"
                                style={{
                                    color: isDarkMode 
                                        ? theme?.text?.dark?.secondary || '#e0e0e0' 
                                        : theme?.text?.light?.secondary || '#3e3e3e'
                                }}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                        )}
                        {formData.confirmPassword && passwordsMatch && (
                            <div className="flex items-center space-x-2 mt-1">
                                <FaCheck className="text-green-500 text-xs" />
                                <span className="text-xs text-green-500">Las contraseñas coinciden</span>
                            </div>
                        )}
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                            <p className="text-sm text-red-700">{errors.submit}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-lg border transition-colors hover:opacity-80"
                            style={{
                                borderColor: isDarkMode 
                                    ? theme?.border?.dark?.main || '#3a3a3a' 
                                    : theme?.border?.light?.main || '#e0e0e0',
                                backgroundColor: isDarkMode 
                                    ? theme?.background?.dark?.card || '#1e1e1e' 
                                    : theme?.background?.light?.card || '#ffffff',
                                color: isDarkMode 
                                    ? theme?.text?.dark?.secondary || '#e0e0e0' 
                                    : theme?.text?.light?.secondary || '#3e3e3e'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={
                                !isPasswordValid || 
                                !passwordsMatch || 
                                !formData.email || 
                                isSubmitting || 
                                emailStatus.isValidating || 
                                emailStatus.isAvailable !== true
                            }
                            className="flex-1 py-3 px-4 rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            style={{
                                background: theme?.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)',
                                color: '#ffffff'
                            }}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creando...
                                </div>
                            ) : (
                                'Crear cuenta'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserCreateModal;