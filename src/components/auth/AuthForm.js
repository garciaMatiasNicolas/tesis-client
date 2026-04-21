import React, { useState, useRef } from "react";

export default function AuthForm({
    user,
    onSubmit,
    loading = false,
    showOtp = false,
    onOtpSubmit,
    otpLength = 6,
    storeLogo = null,
    storeName = null,
}) {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [otp, setOtp] = useState(Array(otpLength).fill(""));
    const inputsRef = useRef([]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    const handleOtpChange = (e, idx) => {
        const val = e.target.value.replace(/[^0-9]/g, "");
        let newOtp = [...otp];
        if (val) {
            newOtp[idx] = val[0];
            setOtp(newOtp);
            // Move to next input
            if (idx < otpLength - 1) {
                inputsRef.current[idx + 1]?.focus();
            }
        } else {
            // Si el input queda vacío, borra el dígito
            newOtp[idx] = "";
            setOtp(newOtp);
        }
    };

    const handleOtpKeyDown = (e, idx) => {
        if (e.key === "Backspace") {
            if (otp[idx]) {
                // Si hay valor, bórralo
                let newOtp = [...otp];
                newOtp[idx] = "";
                setOtp(newOtp);
            } else if (idx > 0) {
                // Si está vacío, mueve el foco al anterior
                inputsRef.current[idx - 1]?.focus();
            }
        }
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        onOtpSubmit(otp.join(""));
    };

    return (
        <form
            onSubmit={showOtp ? handleOtpSubmit : handleSubmit}
            className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg"
        >
            {!showOtp && 
                <div className="text-center mb-6">
                    {storeLogo && (
                        <div className="flex justify-center mb-4">
                            <img 
                                src={storeLogo} 
                                alt={storeName || "Logo"} 
                                className="h-20 w-20 object-contain rounded-lg"
                            />
                        </div>
                    )}
                    <h2 className="text-2xl font-bold mb-1 text-[#223263]">
                        {storeName || "Bienvenido de vuelta"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Inicia sesión para continuar 
                    </p>
                </div>
            }
            {!showOtp && (
                <>
                    <label className="font-semibold text-[#495057]">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full mb-4 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-[#495057] bg-white"
                        placeholder="admin@tuempresa.com"
                    />
                    <label className="font-semibold text-[#495057]">Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        autoComplete="off"
                        className="w-full mb-4 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-[#495057] bg-white"
                        placeholder="******"
                    />
                </>
            )}
            {showOtp && (
                <>
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-1 text-[#223263]">
                            Hola👋🏼 {user || ""}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Ingresa el código de autenticación de Google Authenticator para continuar  
                        </p>
                    </div>
                    <div className="mb-4">
                        <label className="font-semibold text-[#495057] block mb-2">Código 2FA</label>
                        <div className="flex gap-2 justify-center">
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    ref={el => inputsRef.current[idx] = el}
                                    onChange={e => handleOtpChange(e, idx)}
                                    onKeyDown={e => handleOtpKeyDown(e, idx)}
                                    className="w-10 h-12 text-center text-gray-600 text-2xl border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}

            <button
                type="submit"
                style={{ cursor: "pointer" }}
                disabled={loading}
                className="w-full bg-[#18c29c] hover:bg-[#13a884] text-white py-2 rounded-md font-semibold text-lg mb-4 transition disabled:opacity-60"
            >
                {loading ? "Cargando..." : showOtp ? "Verificar código" : "Iniciar sesión"}
            </button>
        </form>
    );
};