"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaEye, FaEyeSlash, FaTimes, FaUser, FaLock, FaKey, FaCheck, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import useApiMethods from '@/hooks/useApiMethods';
import useUserService from '@/services/userService';

const FP_STEPS = ['Email', 'Confirmar', 'Listo'];

const UserLoginModal = ({ isOpen, onClose, onLogin, customerEmail, isDarkMode = false, theme }) => {
    // --- Login state ---
    const [formData, setFormData] = useState({ email: customerEmail || '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    // --- Forgot password state ---
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [fpStep, setFpStep] = useState(1);
    const [fpLoading, setFpLoading] = useState(false);
    const [fpError, setFpError] = useState('');
    const [fpForm, setFpForm] = useState({ email: '', token: '', newPassword: '', confirmPassword: '' });
    const [showFpPassword, setShowFpPassword] = useState(false);
    const [showFpConfirmPassword, setShowFpConfirmPassword] = useState(false);

    const { postMethod } = useApiMethods();
    const { checkEmailExists } = useUserService();

    const fpPasswordValidations = {
        minLength: fpForm.newPassword.length >= 8,
        hasUpperCase: /[A-Z]/.test(fpForm.newPassword),
        hasLowerCase: /[a-z]/.test(fpForm.newPassword),
        hasNumber: /\d/.test(fpForm.newPassword),
    };
    const isFpPasswordValid = Object.values(fpPasswordValidations).every(Boolean);
    const fpPasswordsMatch = fpForm.newPassword === fpForm.confirmPassword && fpForm.confirmPassword !== '';
    const isFpConfirmDisabled = !fpForm.token || !isFpPasswordValid || !fpPasswordsMatch || fpLoading;

    useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

    useEffect(() => {
        setFormData(prev => ({ ...prev, email: customerEmail || '' }));
    }, [customerEmail]);

    useEffect(() => {
        if (isOpen) {
            setFormData({ email: customerEmail || '', password: '' });
            setErrors({});
            setIsSubmitting(false);
            setShowForgotPassword(false);
            setFpStep(1);
            setFpError('');
            setFpForm({ email: '', token: '', newPassword: '', confirmPassword: '' });
        }
    }, [isOpen, customerEmail]);

    // --- Login handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'El email es requerido';
        if (!formData.password) newErrors.password = 'La contraseña es requerida';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            await onLogin(formData);
        } catch {
            setErrors({ general: 'Email o contraseña incorrectos' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Forgot password handlers ---
    const handleFpChange = (e) => {
        const { name, value } = e.target;
        setFpForm(prev => ({ ...prev, [name]: value }));
        setFpError('');
    };

    const openForgotPassword = () => {
        setFpForm(prev => ({ ...prev, email: formData.email || '' }));
        setFpStep(1);
        setFpError('');
        setShowForgotPassword(true);
    };

    const closeForgotPassword = () => {
        setShowForgotPassword(false);
        setFpStep(1);
        setFpError('');
        setFpForm({ email: '', token: '', newPassword: '', confirmPassword: '' });
    };

    const handleFpEmailSubmit = async (e) => {
        e.preventDefault();
        setFpLoading(true);
        setFpError('');
        try {
            const result = await checkEmailExists(fpForm.email);
            if (!result.has_user) {
                setFpError('No existe ninguna cuenta de la tienda asociada a ese email.');
                return;
            }
            if (!result.is_client) {
                setFpError('Este email pertenece a una cuenta del panel de gestión.');
                return;
            }
            await postMethod('/auth/recovery/client/request/', { email: fpForm.email }, false);
            setFpStep(2);
        } catch {
            setFpError('No se pudo enviar el correo de recuperación. Intentá nuevamente.');
        } finally {
            setFpLoading(false);
        }
    };

    const handleFpConfirmSubmit = async (e) => {
        e.preventDefault();
        setFpLoading(true);
        setFpError('');
        const ERROR_MESSAGES = {
            invalid_token: 'Token inválido. Verificá el código recibido por email.',
            token_expired: 'El token expiró. Solicitá uno nuevo.',
        };
        try {
            await postMethod('/auth/recovery/client/confirm/', {
                token: fpForm.token,
                new_password: fpForm.newPassword,
            }, false);
            setFpStep(3);
        } catch (err) {
            const code = err?.response?.data?.error;
            setFpError(ERROR_MESSAGES[code] || 'Ocurrió un error inesperado. Intentá nuevamente.');
        } finally {
            setFpLoading(false);
        }
    };

    if (!isOpen || !mounted) return null;

    // Theme helpers
    const bg          = isDarkMode ? theme?.background?.dark?.card  || '#1e1e1e' : theme?.background?.light?.card  || '#ffffff';
    const bgInput     = isDarkMode ? theme?.background?.dark?.input || '#2a2a2a' : theme?.background?.light?.input || '#f9f9f9';
    const border      = isDarkMode ? theme?.border?.dark?.main      || '#3a3a3a' : theme?.border?.light?.main      || '#e0e0e0';
    const textPrimary = isDarkMode ? theme?.text?.dark?.primary     || '#ffffff' : theme?.text?.light?.primary     || '#252525';
    const textSecondary = isDarkMode ? theme?.text?.dark?.secondary || '#e0e0e0' : theme?.text?.light?.secondary   || '#3e3e3e';
    const primaryGradient = theme?.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)';
    const primaryMain = theme?.primary?.main || '#9a334d';

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 min-h-screen">
            {/* Backdrop */}
            <div
                className="absolute inset-0 backdrop-blur-md transition-all duration-300"
                style={{ backgroundColor: isDarkMode ? 'rgba(30,30,30,0.4)' : 'rgba(255,255,255,0.4)' }}
                onClick={onClose}
            />

            {/* Modal card */}
            <div
                className="relative w-full max-w-md rounded-xl shadow-2xl z-[10000]"
                style={{ backgroundColor: bg }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="p-6 border-b" style={{ borderColor: border }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {/* Back arrow — only inside forgot password flow (steps 1-2) */}
                            {showForgotPassword && fpStep < 3 && (
                                <button
                                    onClick={fpStep === 1 ? closeForgotPassword : () => { setFpStep(s => s - 1); setFpError(''); }}
                                    className="hover:opacity-70 transition-opacity"
                                    style={{ color: textSecondary }}
                                >
                                    <FaArrowLeft className="w-4 h-4" />
                                </button>
                            )}
                            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ background: primaryGradient }}>
                                {showForgotPassword
                                    ? <FaKey className="text-white text-sm" />
                                    : <FaUser className="text-white text-sm" />
                                }
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold" style={{ color: textPrimary }}>
                                    {showForgotPassword ? 'Recuperar contraseña' : 'Inicia sesión'}
                                </h3>
                                <p className="text-sm" style={{ color: textSecondary }}>
                                    {showForgotPassword
                                        ? fpStep === 1 ? 'Ingresá tu email'
                                        : fpStep === 2 ? `Código enviado a ${fpForm.email}`
                                        : 'Contraseña restablecida'
                                        : 'Para finalizar tu pedido'
                                    }
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="hover:opacity-70 transition-opacity" style={{ color: textSecondary }}>
                            <FaTimes className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Stepper — visible only in forgot password mode */}
                    {showForgotPassword && (
                        <div className="flex items-center mt-5">
                            {FP_STEPS.map((label, idx) => (
                                <React.Fragment key={label}>
                                    <div className="flex flex-col items-center">
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                                            style={{
                                                background: fpStep >= idx + 1 ? primaryGradient : 'transparent',
                                                border: fpStep < idx + 1 ? `2px solid ${border}` : 'none',
                                                color: fpStep >= idx + 1 ? '#ffffff' : textSecondary,
                                            }}>
                                            {fpStep > idx + 1 ? <FaCheck className="text-xs" /> : idx + 1}
                                        </div>
                                        <span className="text-xs mt-1 font-medium"
                                            style={{ color: fpStep === idx + 1 ? primaryMain : textSecondary }}>
                                            {label}
                                        </span>
                                    </div>
                                    {idx < FP_STEPS.length - 1 && (
                                        <div className="flex-1 h-px mx-2 mb-4"
                                            style={{ backgroundColor: fpStep > idx + 1 ? primaryMain : border }} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── LOGIN FORM ── */}
                {!showForgotPassword && (
                    <form onSubmit={handleSubmit} className="p-6">
                        {errors.general && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">{errors.general}</p>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                                disabled={isSubmitting} placeholder="tu@email.com"
                                readOnly={!!(customerEmail && customerEmail.trim())}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                style={{ backgroundColor: bgInput, borderColor: errors.email ? '#ef4444' : border, color: textPrimary }} />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Contraseña</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} name="password"
                                    value={formData.password} onChange={handleInputChange}
                                    disabled={isSubmitting} placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                    style={{ backgroundColor: bgInput, borderColor: errors.password ? '#ef4444' : border, color: textPrimary }} />
                                <button type="button" onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
                                    style={{ color: textSecondary }} disabled={isSubmitting}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                            <div className="flex justify-end mt-2">
                                <button type="button" onClick={openForgotPassword}
                                    className="text-sm hover:underline hover:opacity-70 transition-opacity"
                                    style={{ color: primaryMain }}>
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} disabled={isSubmitting}
                                className="flex-1 px-4 py-3 border rounded-lg hover:opacity-80 transition-all"
                                style={{ borderColor: border, backgroundColor: 'transparent', color: textPrimary }}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={isSubmitting}
                                className="flex-1 px-4 py-3 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ background: primaryGradient }}>
                                {isSubmitting
                                    ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Iniciando...</>
                                    : <><FaLock />Iniciar Sesión</>
                                }
                            </button>
                        </div>
                    </form>
                )}

                {/* ── FORGOT PASSWORD — STEP 1: Email ── */}
                {showForgotPassword && fpStep === 1 && (
                    <form onSubmit={handleFpEmailSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Email</label>
                            <input type="email" name="email" value={fpForm.email} onChange={handleFpChange}
                                placeholder="tu@email.com"
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                style={{ backgroundColor: bgInput, borderColor: border, color: textPrimary }} />
                        </div>

                        {fpError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{fpError}</p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={closeForgotPassword}
                                className="flex-1 px-4 py-3 border rounded-lg hover:opacity-80 transition-all"
                                style={{ borderColor: border, backgroundColor: 'transparent', color: textPrimary }}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={!fpForm.email || fpLoading}
                                className="flex-1 px-4 py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                                style={{ background: primaryGradient }}>
                                {fpLoading ? <FaSpinner className="animate-spin" /> : 'Enviar código'}
                            </button>
                        </div>
                    </form>
                )}

                {/* ── FORGOT PASSWORD — STEP 2: Token + new password ── */}
                {showForgotPassword && fpStep === 2 && (
                    <form onSubmit={handleFpConfirmSubmit} className="p-6 space-y-4">
                        <div className="p-3 rounded-lg border text-sm"
                            style={{ backgroundColor: isDarkMode ? 'rgba(24,194,156,0.1)' : '#f0fdf9', borderColor: primaryMain, color: primaryMain }}>
                            ✉️ Revisá tu casilla y pegá el código recibido.
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Código de recuperación</label>
                            <input type="text" name="token" value={fpForm.token} onChange={handleFpChange}
                                placeholder="Pegá el código aquí"
                                className="w-full px-4 py-3 border rounded-lg font-mono text-sm focus:ring-2 focus:border-transparent transition-all"
                                style={{ backgroundColor: bgInput, borderColor: border, color: textPrimary }} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Nueva contraseña</label>
                            <div className="relative">
                                <input type={showFpPassword ? 'text' : 'password'} name="newPassword"
                                    value={fpForm.newPassword} onChange={handleFpChange}
                                    autoComplete="off" placeholder="Contraseña segura"
                                    className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                    style={{ backgroundColor: bgInput, borderColor: border, color: textPrimary }} />
                                <button type="button" onClick={() => setShowFpPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70" style={{ color: textSecondary }}>
                                    {showFpPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {fpForm.newPassword && (
                            <div className="grid grid-cols-2 gap-1">
                                {[
                                    { key: 'minLength',   text: 'Mín. 8 caracteres' },
                                    { key: 'hasUpperCase', text: 'Una mayúscula' },
                                    { key: 'hasLowerCase', text: 'Una minúscula' },
                                    { key: 'hasNumber',    text: 'Un número' },
                                ].map(({ key, text }) => (
                                    <div key={key} className="flex items-center gap-1 text-xs">
                                        {fpPasswordValidations[key]
                                            ? <FaCheck className="text-green-500 flex-shrink-0" />
                                            : <FaTimes className="text-red-400 flex-shrink-0" />
                                        }
                                        <span style={{ color: fpPasswordValidations[key] ? '#10b981' : textSecondary }}>{text}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Confirmar contraseña</label>
                            <div className="relative">
                                <input type={showFpConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                                    value={fpForm.confirmPassword} onChange={handleFpChange}
                                    autoComplete="off" placeholder="Repetí tu contraseña"
                                    className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
                                    style={{
                                        backgroundColor: bgInput,
                                        borderColor: fpForm.confirmPassword ? (fpPasswordsMatch ? '#10b981' : '#ef4444') : border,
                                        color: textPrimary,
                                    }} />
                                <button type="button" onClick={() => setShowFpConfirmPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70" style={{ color: textSecondary }}>
                                    {showFpConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {fpForm.confirmPassword && fpPasswordsMatch && (
                                <div className="flex items-center gap-1 mt-1">
                                    <FaCheck className="text-green-500 text-xs" />
                                    <span className="text-xs text-green-500">Las contraseñas coinciden</span>
                                </div>
                            )}
                            {fpForm.confirmPassword && !fpPasswordsMatch && (
                                <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                            )}
                        </div>

                        {fpError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{fpError}</p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => { setFpStep(1); setFpError(''); }}
                                className="flex-1 px-4 py-3 border rounded-lg hover:opacity-80 transition-all"
                                style={{ borderColor: border, backgroundColor: 'transparent', color: textPrimary }}>
                                Volver
                            </button>
                            <button type="submit" disabled={isFpConfirmDisabled}
                                className="flex-1 px-4 py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                                style={{ background: primaryGradient }}>
                                {fpLoading ? <FaSpinner className="animate-spin" /> : 'Restablecer'}
                            </button>
                        </div>
                    </form>
                )}

                {/* ── FORGOT PASSWORD — STEP 3: Success ── */}
                {showForgotPassword && fpStep === 3 && (
                    <div className="p-6 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ background: isDarkMode ? 'rgba(24,194,156,0.15)' : '#f0fdf9' }}>
                            <FaCheck className="text-3xl" style={{ color: primaryMain }} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-1" style={{ color: textPrimary }}>
                                ¡Contraseña restablecida!
                            </h4>
                            <p className="text-sm" style={{ color: textSecondary }}>
                                Tu contraseña fue actualizada. Ya podés iniciar sesión.
                            </p>
                        </div>
                        <button type="button" onClick={closeForgotPassword}
                            className="w-full py-3 px-4 rounded-lg font-medium text-white hover:opacity-90 transition-all"
                            style={{ background: primaryGradient }}>
                            Volver al login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default UserLoginModal;
