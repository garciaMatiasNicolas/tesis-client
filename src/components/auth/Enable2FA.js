"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa";
import useApiMethods from "@/hooks/useApiMethods";
import Alert from "../ui/Alert";

export default function Enable2FA({ qrData, otpLength = 6, email }) {
    const [step, setStep] = useState(1);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertTitle, setAlertTitle] = useState("");
    const [alertType, setAlertType] = useState("");
    const [otp, setOtp] = useState(Array(otpLength).fill(""));
    const inputsRef = useRef([]);
    const { postMethod } = useApiMethods();
    const router = useRouter();

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

    const handleFinish = async () => {
        try {
            const otpCode = otp.join("");
            const response = await postMethod("/auth/enable-2fa/", { otp: otpCode, email: email}, false);

            if (response.message === "2fa_enabled_success") {
                setAlertMessage("Autenticación en dos pasos activada exitosamente. Redirigiendo...");
                setAlertTitle("Éxito");
                setAlertType("success");
                setShowAlert(true);
                router.push("/dashboard");
            };
        } catch (error) {
            if (error?.response?.data?.error === "otp_invalid") {
                setAlertMessage("Código 2FA inválido.");
                setAlertTitle("Error")
                setAlertType("danger");
                setShowAlert(true);
                setOtp(Array(otpLength).fill(""));
            } else {
                setAlertMessage("Ocurrió un error al activar la autenticación en dos pasos. Si persiste, contactar a soporte.");
                setAlertTitle("Error");
                setAlertType("danger");
                setShowAlert(true);
                setOtp(Array(otpLength).fill(""));
            }
        }
    };

    return (
        <div className="max-w-md w-full mx-auto bg-white p-8 rounded-xl shadow-lg">
            {showAlert && (
                <Alert
                    title={alertTitle}
                    text={alertMessage}
                    type={alertType}
                    onClose={() => setShowAlert(false)}
                />
            )}
            {/* Stepper */}
            <div className="flex justify-between items-center mb-8">
                {["Activar", "Configurar", "QR", "Ingresar"].map((label, idx) => (
                    <div key={label} className="flex-1 flex flex-col items-center">
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
                        <span className={`mt-2 text-xs font-semibold transition-colors duration-300
                         ${step === idx + 1 ? "text-[#18c29c]" : "text-gray-400"}`}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Steps */}
            {step === 1 && (
                <div className="flex flex-col gap-6 px-2 py-2 text-center">
                    <h2 className="text-xl font-bold text-[#223263] mb-2">Debes activar la autenticación en dos pasos</h2>
                    <p className="text-gray-600">
                        Por razones de seguridad, es obligatorio activar el segundo factor de autenticación (2FA) para proteger tu cuenta.
                        <br />
                        Este proceso solo toma un minuto y ayuda a mantener tu información segura.
                    </p>
                    <button
                        type="button"
                        onClick={() => setStep(2)}
                        style={{ cursor: "pointer" }}
                        className="w-full bg-[#18c29c] hover:bg-[#13a884] text-white py-2 rounded-md font-semibold text-lg mt-4 transition disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        Siguiente <FaArrowRight   />
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="flex flex-col gap-6 px-2 py-2 text-center">
                    <h2 className="text-xl font-bold text-[#223263] mb-2">Configura Google Authenticator</h2>
                    <p className="text-gray-600">
                        Descarga la app <b>Google Authenticator</b> en tu teléfono de confianza.<br />
                        Luego, presiona el botón para ver el código QR y escanéalo con la app.
                    </p>
                    <button
                        type="button"
                        onClick={() => setStep(3)}
                        style={{ cursor: "pointer" }}
                        className="w-full bg-[#18c29c] hover:bg-[#13a884] text-white py-2 rounded-md font-semibold text-lg mt-4 transition flex justify-center items-center gap-2"
                    >
                        Mostrar QR <FaArrowRight   />
                    </button>
                </div>
            )}

            {step === 3 && (
                <div className="flex flex-col gap-6 px-2 py-2 text-center">
                    <h2 className="text-xl font-bold text-[#223263] mb-2">Escanea el código QR</h2>
                    <p className="text-gray-600">
                        Abre Google Authenticator y escanea este código QR.<br />
                        Guarda el acceso solo en un dispositivo de confianza.
                        Una vez escaneado, la app generará un código de 6 dígitos que deberás ingresar para completar la configuración.
                    </p>
                    {qrData?.qr_code && (
                        <img
                            src={qrData.qr_code}
                            alt="QR Google Authenticator"
                            className="mx-auto my-4 border rounded shadow"
                            style={{ width: 200, height: 200 }}
                        />
                    )}
                    <button
                        type="button" 
                        style={{ cursor: "pointer" }}
                        onClick={() => setStep(4)}
                        className="w-full bg-[#18c29c] hover:bg-[#13a884] text-white py-2 rounded-md font-semibold text-lg mt-4 transition flex justify-center items-center gap-2"
                    >
                        Probar 2FA <FaArrowRight   />
                    </button>
                </div>
            )}

            {step === 4 && (
                <div className="flex flex-col gap-6 px-2 py-2 text-center">
                    <h2 className="text-xl font-bold text-[#223263] mb-2">Ingresar Código</h2>
                    <p className="text-gray-600">
                        Utiliza el codigo generado en Google Authenticator para ingresar y completar la configuración de 2FA.
                    </p>
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
                    <button
                        type="button"
                        onClick={handleFinish}
                        style={{ cursor: "pointer" }}
                        className="w-full bg-[#18c29c] hover:bg-[#13a884] text-white py-2 rounded-md font-semibold text-lg mt-4 transition flex justify-center items-center gap-2"
                    >
                        Validar codigo en ingresar <FaArrowRight   />
                    </button>
                </div>
            )}
        </div>
    );
};