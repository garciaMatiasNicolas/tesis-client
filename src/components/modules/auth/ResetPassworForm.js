"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import useApiMethods from "@/hooks/useApiMethods";
import useUserService from "@/services/userService";
import Alert from "../../ui/Alert";

const RECOVERY_OPTIONS = [
    {
        type: "full_recovery",
        icon: "🔒",
        label: "Olvidé mi contraseña y no tengo acceso al autenticador",
        description: "Restableceremos tu contraseña y vincularás un nuevo dispositivo 2FA al ingresar.",
    },
    {
        type: "password_only",
        icon: "🔑",
        label: "Olvidé mi contraseña pero tengo acceso al autenticador",
        description: "Confirmarás con tu código de Google Authenticator antes de cambiar la contraseña.",
    },
    {
        type: "2fa_only",
        icon: "📱",
        label: "Recuerdo mi contraseña pero perdí acceso al autenticador",
        description: "Confirmarás con tu contraseña actual y vincularás un nuevo dispositivo 2FA.",
    },
];

const STEPS = ["Email", "Situación", "Confirmar", "Listo"];

export default function ResetPasswordForm() {
    const [step, setStep] = useState(1);
    const [recoveryType, setRecoveryType] = useState("");
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [form, setForm] = useState({
        email: "",
        token: "",
        otp: Array(6).fill(""),
        newPassword: "",
        confirmPassword: "",
        currentPassword: "",
    });

    const inputsRef = useRef([]);
    const { postMethod } = useApiMethods();
    const { checkEmailExists } = useUserService();
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleOtpChange = (e, idx) => {
        const val = e.target.value.replace(/[^0-9]/g, "");
        const newOtp = [...form.otp];
        if (val) {
            newOtp[idx] = val[0];
            setForm((prev) => ({ ...prev, otp: newOtp }));
            if (idx < 5) inputsRef.current[idx + 1]?.focus();
        } else {
            newOtp[idx] = "";
            setForm((prev) => ({ ...prev, otp: newOtp }));
        }
    };

    const handleOtpKeyDown = (e, idx) => {
        if (e.key === "Backspace") {
            const newOtp = [...form.otp];
            if (form.otp[idx]) {
                newOtp[idx] = "";
                setForm((prev) => ({ ...prev, otp: newOtp }));
            } else if (idx > 0) {
                inputsRef.current[idx - 1]?.focus();
            }
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!form.email) return;
        setLoading(true);
        try {
            const result = await checkEmailExists(form.email);
            if (!result.has_user) {
                setAlert({
                    type: "warning",
                    title: "Email no encontrado",
                    text: "No existe ninguna cuenta asociada a ese email.",
                });
                return;
            }
            if (result.is_client) {
                setAlert({
                    type: "info",
                    title: "Cuenta de cliente",
                    text: "Este email pertenece a una cuenta de la tienda. Para recuperar tu contraseña andá a la sección de recuperación de la tienda.",
                });
                return;
            }
            setStep(2);
        } catch (error) {
            setAlert({
                type: "danger",
                title: "Error",
                text: "No se pudo verificar el email. Intentá nuevamente.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMethodSelect = async (type) => {
        setRecoveryType(type);
        setLoading(true);
        try {
            await postMethod("/auth/recovery/request/", { email: form.email, recovery_type: type }, false);
            setStep(3);
        } catch {
            setAlert({
                type: "danger",
                title: "Error al enviar el correo",
                text: "No pudimos enviar el email de recuperación. Verificá tu dirección e intentá nuevamente.",
            });
        } finally {
            setLoading(false);
        }
    };

    const isConfirmDisabled = () => {
        if (!form.token) return true;
        if (recoveryType === "full_recovery" || recoveryType === "password_only") {
            if (!form.newPassword || !form.confirmPassword) return true;
            if (form.newPassword !== form.confirmPassword) return true;
        }
        if (recoveryType === "password_only" && form.otp.some((d) => !d)) return true;
        if (recoveryType === "2fa_only" && !form.currentPassword) return true;
        return false;
    };

    const handleConfirmSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const ERROR_MESSAGES = {
            invalid_token: "Token inválido. Verificá el código recibido por email.",
            token_expired: "El token expiró. Solicitá uno nuevo.",
            otp_invalid: "Código de Google Authenticator inválido.",
            password_invalid: "Contraseña incorrecta.",
        };

        try {
            if (recoveryType === "full_recovery") {
                await postMethod("/auth/recovery/full/", {
                    token: form.token,
                    new_password: form.newPassword,
                }, false);
            } else if (recoveryType === "password_only") {
                await postMethod("/auth/recovery/password/", {
                    token: form.token,
                    otp: form.otp.join(""),
                    new_password: form.newPassword,
                }, false);
            } else if (recoveryType === "2fa_only") {
                await postMethod("/auth/recovery/2fa/", {
                    token: form.token,
                    password: form.currentPassword,
                }, false);
            }
            setStep(4);
        } catch (error) {
            const errorCode = error?.response?.data?.error;
            setAlert({
                type: "danger",
                title: "Error",
                text: ERROR_MESSAGES[errorCode] || "Ocurrió un error inesperado. Intentá nuevamente.",
            });
        } finally {
            setLoading(false);
        }
    };

    const Spinner = () => (
        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    );

    return (
        <form
            onSubmit={
                step === 1 ? handleEmailSubmit :
                step === 3 ? handleConfirmSubmit :
                (e) => e.preventDefault()
            }
            className="w-[520px] mx-auto bg-white p-8 rounded-xl shadow-lg"
        >
            {alert && (
                <Alert
                    title={alert.title}
                    text={alert.text}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                />
            )}

            {/* Stepper */}
            <div className="flex justify-between items-center mb-8">
                {STEPS.map((label, idx) => (
                    <div key={label} className="flex-1 flex flex-col items-center">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-300
                            ${step === idx + 1 ? "bg-[#18c29c] border-[#18c29c] text-white scale-110 shadow-lg"
                            : step > idx + 1 ? "bg-[#18c29c] border-[#18c29c] text-white"
                            : "bg-white border-gray-300 text-gray-400"}`}
                        >
                            {step > idx + 1 ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (idx + 1)}
                        </div>
                        <span className={`mt-2 text-xs font-semibold transition-colors duration-300
                            ${step === idx + 1 ? "text-[#18c29c]" : "text-gray-400"}`}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="relative min-h-[360px]">

                {/* Step 1 — Email */}
                <div className={`absolute inset-0 flex flex-col justify-center transition-all duration-500
                    ${step === 1 ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"}`}>
                    <h2 className="text-xl font-bold text-[#223263] mb-1 text-center">Recuperar acceso</h2>
                    <p className="text-gray-500 text-sm text-center mb-8">Ingresá tu email para comenzar el proceso</p>
                    <label className="font-semibold text-[#495057] text-sm">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full mb-6 mt-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-[#495057] bg-white"
                        placeholder="tu@email.com"
                    />
                    <button
                        type="submit"
                        disabled={!form.email || loading}
                        className="w-full bg-[#18c29c] hover:bg-[#18c29c] text-white py-2 rounded-md font-semibold text-lg transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                    >
                        {loading ? <Spinner /> : "Continuar"}
                    </button>
                </div>

                {/* Step 2 — Select situation */}
                <div className={`absolute inset-0 flex flex-col justify-center transition-all duration-500
                    ${step === 2 ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"}`}>
                    <h2 className="text-xl font-bold text-[#223263] mb-1 text-center">¿Cuál es tu situación?</h2>
                    <p className="text-gray-500 text-sm text-center mb-5">Seleccioná la opción que mejor describe tu caso</p>
                    <div className="flex flex-col gap-3">
                        {RECOVERY_OPTIONS.map(({ type, icon, label, description }) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => handleMethodSelect(type)}
                                disabled={loading}
                                className="flex items-start gap-3 w-full text-left px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-[#18c29c] hover:bg-[#f0fdf9] transition-all duration-200 disabled:opacity-60 cursor-pointer"
                            >
                                <span className="text-2xl mt-0.5 leading-none">{icon}</span>
                                <div>
                                    <p className="font-semibold text-[#223263] text-sm leading-snug">{label}</p>
                                    <p className="text-gray-500 text-xs mt-1 leading-snug">{description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                    {loading && (
                        <div className="flex items-center justify-center mt-4 gap-2 text-[#18c29c] text-sm">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                            </svg>
                            Enviando correo...
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="mt-4 text-[#18c29c] hover:underline text-sm font-medium self-start"
                    >
                        ← Volver
                    </button>
                </div>

                {/* Step 3 — Confirm */}
                <div className={`absolute inset-0 flex flex-col justify-center transition-all duration-500
                    ${step === 3 ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"}`}>
                    {step === 3 && (
                        <>
                            {/* Email notice */}
                            <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-[#f0fdf9] border border-[#18c29c] rounded-lg text-sm text-[#0d7a61]">
                                <span>✉️</span>
                                <span>Enviamos un email a <strong>{form.email}</strong>. Copiá el token recibido.</span>
                            </div>

                            <div className="flex flex-col gap-3 overflow-y-auto max-h-[280px] pr-1">
                                {/* Token field */}
                                <div>
                                    <label className="font-semibold text-[#495057] text-sm">Token del email</label>
                                    <input
                                        type="text"
                                        name="token"
                                        value={form.token}
                                        onChange={handleChange}
                                        className="w-full mt-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-[#495057] bg-white font-mono text-sm"
                                        placeholder="Pegá el token aquí"
                                    />
                                </div>

                                {/* OTP — only for password_only */}
                                {recoveryType === "password_only" && (
                                    <div>
                                        <label className="font-semibold text-[#495057] text-sm">Código de Google Authenticator</label>
                                        <div className="flex gap-2 mt-2">
                                            {form.otp.map((digit, idx) => (
                                                <input
                                                    key={idx}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    ref={(el) => (inputsRef.current[idx] = el)}
                                                    onChange={(e) => handleOtpChange(e, idx)}
                                                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                                                    className="w-10 h-12 text-center text-gray-600 text-2xl border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Current password — only for 2fa_only */}
                                {recoveryType === "2fa_only" && (
                                    <div>
                                        <label className="font-semibold text-[#495057] text-sm">Contraseña actual</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={form.currentPassword}
                                            onChange={handleChange}
                                            autoComplete="off"
                                            className="w-full mt-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-[#495057] bg-white"
                                            placeholder="******"
                                        />
                                    </div>
                                )}

                                {/* New password — for full_recovery and password_only */}
                                {(recoveryType === "full_recovery" || recoveryType === "password_only") && (
                                    <>
                                        <div>
                                            <label className="font-semibold text-[#495057] text-sm">Nueva contraseña</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={form.newPassword}
                                                onChange={handleChange}
                                                autoComplete="off"
                                                className="w-full mt-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-[#495057] bg-white"
                                                placeholder="******"
                                            />
                                        </div>
                                        <div>
                                            <label className="font-semibold text-[#495057] text-sm">Confirmar contraseña</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={form.confirmPassword}
                                                onChange={handleChange}
                                                autoComplete="off"
                                                className="w-full mt-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-[#495057] bg-white"
                                                placeholder="******"
                                            />
                                            {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                                                <p className="text-red-500 text-xs mt-1">Las contraseñas no coinciden</p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-3 mt-5">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="text-[#18c29c] hover:underline text-sm font-medium self-center"
                                >
                                    ← Volver
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || isConfirmDisabled()}
                                    className="flex-1 bg-[#18c29c] hover:bg-[#18c29c] text-white py-2 rounded-md font-semibold text-lg transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loading ? <Spinner /> : (
                                        recoveryType === "2fa_only" ? "Revincular autenticador" : "Restablecer contraseña"
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Step 4 — Success */}
                <div className={`absolute inset-0 flex flex-col justify-center items-center text-center transition-all duration-500
                    ${step === 4 ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"}`}>
                    <div className="w-20 h-20 bg-[#f0fdf9] rounded-full flex items-center justify-center mb-5 shadow-sm">
                        <svg className="w-10 h-10 text-[#18c29c]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-[#223263] mb-2">
                        {recoveryType === "2fa_only" ? "¡Autenticador reseteado!" : "¡Contraseña restablecida!"}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                        {recoveryType === "password_only"
                            ? "Tu contraseña fue actualizada correctamente. Ya podés iniciar sesión."
                            : "Al iniciar sesión deberás escanear un nuevo código QR para vincular tu dispositivo de autenticación."}
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="mt-8 w-full bg-[#18c29c] hover:bg-[#18c29c] text-white py-2 rounded-md font-semibold text-lg transition cursor-pointer"
                    >
                        Ir al login
                    </button>
                </div>

            </div>
        </form>
    );
}
