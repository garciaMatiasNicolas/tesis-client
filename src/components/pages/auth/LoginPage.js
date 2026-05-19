"use client";
import { useState, useEffect } from "react";
import AuthForm from "@/components/auth/AuthForm";
import Enable2FA from "@/components/auth/Enable2FA";
import useApiMethods from "@/hooks/useApiMethods";
import Alert from "@/components/ui/Alert";
import { setAuthTokenIntoCookie } from "@/services/auth";
import { useRouter } from "next/navigation";
import useEcommerceService from "@/services/ecommerceService";

const LoginPage = () => {
    const { postMethod } = useApiMethods();
    const { getConfigEcommerce } = useEcommerceService();
    const [showOtp, setShowOtp] = useState(false);
    const [showEnable2FA, setShowEnable2FA] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [email, setEmail] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertTitle, setAlertTitle] = useState("");
    const [alertType, setAlertType] = useState("");
    const [user, setUser] = useState(null); // Para almacenar el usuario si es necesario
    const [loading, setLoading] = useState(false);
    const [storeConfig, setStoreConfig] = useState(null);
    const router = useRouter();

    // Obtener configuración de la tienda al cargar el componente
    useEffect(() => {
        const fetchStoreConfig = async () => {
            try {
                const config = await getConfigEcommerce();
                setStoreConfig(config);
            } catch (error) {
                console.error('Error al obtener configuración de la tienda:', error);
            }
        };
        fetchStoreConfig();
    }, []);

    const handleLogin = async (data) => {
        setLoading(true);
        
        try {
            const response = await postMethod("/auth/login/", data, false);
            setEmail(response.user_email);
            setUser(response.user_name);
            
            // Validar que el rol no sea "client"
            if (response.user_role === "client") {
                setAlertMessage("Los clientes no tienen autorización para acceder al panel administrativo. Por favor, utilice la tienda en línea.");
                setAlertTitle("Acceso Denegado");
                setAlertType("danger");
                setShowAlert(true);
                setLoading(false);
                return;
            }
            
            localStorage.setItem("user_role", response.user_role); 
            
            if (response.message === "2fa_required") {
                setShowOtp(true);
            } else if (response.message === "2fa_not_enabled") {
                setQrData({
                    qr_code: response.qr_code,
                    otp_uri: response.otp_uri
                });
                setShowEnable2FA(true);                
            };
        } catch (err) {
            if (err?.response?.data?.error === "credentials_invalid") {
                setAlertMessage("Email o contraseña incorrectos. Intente nuevamente.");
                setAlertTitle("Error");
                setAlertType("danger");
                setShowAlert(true);
            } else if (err?.response?.data?.error === "not_authorized") {
                setAlertMessage("Los clientes no tienen autorización para acceder al panel administrativo. Por favor, utilice la tienda en línea.");
                setAlertTitle("Acceso Denegado");
                setAlertType("danger");
                setShowAlert(true);
            } else {
                setAlertMessage("Ocurrió un error al iniciar sesión. Si persiste, contactar a soporte.");
                setAlertTitle("Error");
                setAlertType("danger");
                setShowAlert(true);
            };
        }
        setLoading(false);
    };

    const handleOtpSubmit = async (otp) => {
        setLoading(true);
        
        try {
            const response = await postMethod("/auth/verify-otp/", { email, otp }, false);
            const { access, refresh } = response;
            setAuthTokenIntoCookie(access, refresh);
            setAlertMessage("Inicio de sesión exitoso.");
            setAlertTitle("Éxito");
            setAlertType("success");
            setShowAlert(true);
            router.push("/dashboard");
        } catch (err) {
            if (err?.response?.data?.error === "otp_invalid") {
                setAlertMessage("Código 2FA inválido.");
                setAlertTitle("Error");
                setAlertType("danger");
                setShowAlert(true);
            } else if (err?.response?.data?.error === "user_not_found") {
                setAlertMessage("Whoops! Usuario no encontrado.");
                setAlertTitle("Error");
                setAlertType("danger");
                setShowAlert(true);
            } else if (err?.response?.data?.error === "2fa_not_enabled") {
                setAlertMessage("El usuario no tiene habilitada la autenticación en dos pasos.");
                setAlertTitle("Error");
                setAlertType("danger");
                setShowAlert(true);
            } else {
                setAlertMessage("Ocurrió un error al verificar el código 2FA. Si persiste, contactar a soporte.");
                setAlertTitle("Error");
                setAlertType("danger");
                setShowAlert(true);
            };
        };

        setLoading(false);
    };

    return (
        <div
            style={{
                backgroundImage: "url('/assets/bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
            {showAlert && (
                <Alert
                    title={alertTitle}
                    text={alertMessage}
                    type={alertType}
                    onClose={() => setShowAlert(false)}
                />
            )}

            <div className="absolute inset-0 w-full h-full bg-black" style={{ opacity: 0.4 }}></div>
            <div className="z-10 flex items-center justify-center w-full min-h-screen">
                {showEnable2FA && qrData ? (
                    <Enable2FA qrData={qrData} email={email} />
                ) : (
                    <AuthForm
                        user={user}                     
                        onSubmit={handleLogin}
                        loading={loading}
                        showOtp={showOtp}
                        onOtpSubmit={handleOtpSubmit}
                        storeLogo={storeConfig?.logo}
                        storeName={storeConfig?.name}
                    />
                )}
            </div>
        </div>
    );
};

export default LoginPage;
