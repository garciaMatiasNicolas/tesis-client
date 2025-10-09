"use client";
import React, { useState } from "react";

export default function ResetPasswordForm({ loading = false, error = "" }) {
    const [step, setStep] = useState(1);
    const [method, setMethod] = useState("");
    const [form, setForm] = useState({
        email: "",
        code: "",
        token: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [localError, setLocalError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
        setLocalError("");
    };

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        if (!form.email) {
            setLocalError("Por favor ingresa tu email.");
            return;
        }
        setStep(2);
    };

    const handleMethodSelect = (e) => {
        setMethod(e.target.value);
        setStep(3);
    };

    const handleFinalSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica de envío
    };

    const handleBack = () => {
        if (step === 2) setStep(1);
        if (step === 3) setStep(2);
    };

    const steps = [
        { label: "Email" },
        { label: "Método" },
        { label: "Nueva contraseña" },
    ];

    return (
        <form
            onSubmit={
                step === 1
                    ? handleEmailSubmit
                    : step === 3
                    ? handleFinalSubmit
                    : (e) => e.preventDefault()
            }
            className="w-[500px] mx-auto bg-white p-8 rounded-xl shadow-lg"
        >
            {/* Stepper */}
            <div className="flex justify-between items-center mb-8">
                {steps.map((s, idx) => (
                    <div key={s.label} className="flex-1 flex flex-col items-center">
                        <button
                            type="button"
                            onClick={() => {
                                if (step > idx + 1) setStep(idx + 1);
                            }}
                            className="focus:outline-none"
                        >
                            <div
                                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-300
                                    ${step === idx + 1
                                        ? "bg-[#18c29c] border-[#18c29c] text-white scale-110 shadow-lg"
                                        : step > idx + 1
                                        ? "bg-[#18c29c] border-[#18c29c] text-white"
                                        : "bg-white border-gray-300 text-gray-400"
                                    }`}
                            >
                                {idx + 1}
                            </div>
                        </button>
                        <span className={`mt-2 text-xs font-semibold transition-colors duration-300
                            ${step === idx + 1 ? "text-[#18c29c]" : "text-gray-400"}`}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="relative h-[340px]">
                {/* Step 1 */}
                <div className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ease-in-out
                    ${step === 1 ? "opacity-100 scale-100 z-10 pointer-events-auto" : "opacity-0 scale-95 z-0 pointer-events-none"}
                `}>
                    <div className="px-2 py-2">
                        <label className="font-semibold text-[#495057]">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full mb-4 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-[#495057] bg-white"
                            placeholder="tu@email.com"
                        />
                        {localError && (
                            <div className="text-red-500 mb-3 text-sm">{localError}</div>
                        )}
                        <button
                            type="submit"
                            style={{ cursor: "pointer" }}
                            disabled={loading || !form.email}
                            className="w-full bg-[#18c29c] hover:bg-[#13a884] text-white py-2 rounded-md font-semibold text-lg mb-4 transition disabled:opacity-60"
                        >
                            Continuar
                        </button>
                    </div>
                </div>

                {/* Step 2 */}
                <div className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ease-in-out
                    ${step === 2 ? "opacity-100 scale-100 z-10 pointer-events-auto" : "opacity-0 scale-95 z-0 pointer-events-none"}
                `}>
                    <div className="flex flex-col gap-6 bg-[#f8fafc] px-12 py-16 rounded-lg shadow-inner">
                        <label className="font-semibold text-[#495057] mb-2">
                            ¿Cómo quieres recibir el código?
                        </label>
                        <button
                            type="button"
                            value="email"
                            onClick={handleMethodSelect}
                            className={`w-full py-3 rounded-md font-semibold text-lg transition-all duration-200 ${
                                method === "email"
                                    ? "bg-[#18c29c] text-white shadow"
                                    : "bg-gray-100 text-[#223263] hover:bg-[#e6f7f3]"
                            }`}
                        >
                            Recibir código por Email
                        </button>
                        <button
                            type="button"
                            value="token"
                            onClick={handleMethodSelect}
                            className={`w-full py-3 rounded-md font-semibold text-lg transition-all duration-200 ${
                                method === "token"
                                    ? "bg-[#18c29c] text-white shadow"
                                    : "bg-gray-100 text-[#223263] hover:bg-[#e6f7f3]"
                            }`}
                        >
                            Usar token de app móvil (2FA)
                        </button>
                        <button
                            type="button"
                            onClick={handleBack}
                            className="mt-2 text-[#18c29c] hover:underline text-sm font-medium self-start"
                        >
                            ← Volver
                        </button>
                    </div>
                </div>

                {/* Step 3 */}
                <div className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ease-in-out
                    ${step === 3 ? "opacity-100 scale-100 z-10 pointer-events-auto" : "opacity-0 scale-95 z-0 pointer-events-none"}
                `}>
                    <div className="flex flex-col gap-2 px-2 py-2">
                        {method === "email" ? (
                            <>
                                <label className="font-semibold text-[#495057]">
                                    Código recibido por email
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={form.code}
                                    onChange={handleChange}
                                    className="w-full mb-4 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-[#495057] bg-white"
                                    placeholder="Ingresa el código"
                                />
                            </>
                        ) : (
                            <>
                                <label className="font-semibold text-[#495057]">
                                    Token de la app móvil
                                </label>
                                <input
                                    type="text"
                                    name="token"
                                    value={form.token}
                                    onChange={handleChange}
                                    className="w-full mb-4 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-[#495057] bg-white"
                                    placeholder="Ingresa el token"
                                />
                            </>
                        )}
                        <label className="font-semibold text-[#495057]">Nueva contraseña</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={form.newPassword}
                            onChange={handleChange}
                            autoComplete="off"
                            className="w-full mb-4 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-[#495057] bg-white"
                            placeholder="******"
                        />
                        <label className="font-semibold text-[#495057]">Confirmar contraseña</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            autoComplete="off"
                            className="w-full mb-4 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-[#495057] bg-white"
                            placeholder="******"
                        />
                        {form.newPassword !== form.confirmPassword && (
                            <div className="text-red-500 mb-3 text-sm">
                                Las contraseñas no coinciden
                            </div>
                        )}
                        {error && (
                            <div className="text-red-500 mb-3 text-sm">{error}</div>
                        )}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="text-[#18c29c] hover:underline text-sm font-medium"
                            >
                                ← Volver
                            </button>
                            <button
                                type="submit"
                                style={{ cursor: "pointer" }}
                                disabled={
                                    loading ||
                                    !form.newPassword ||
                                    !form.confirmPassword ||
                                    form.newPassword !== form.confirmPassword ||
                                    (method === "email" && !form.code) ||
                                    (method === "token" && !form.token)
                                }
                                className="flex-1 bg-[#18c29c] hover:bg-[#13a884] text-white py-2 rounded-md font-semibold text-lg mb-4 transition disabled:opacity-60"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin h-5 w-5 mr-2 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            />
                                        </svg>
                                    </span>
                                ) : (
                                    "Restablecer contraseña"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}