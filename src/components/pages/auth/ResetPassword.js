import ResetPasswordForm from '@/components/modules/auth/ResetPassworForm';
import React from 'react'

const ResetPassword = () => {
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
            {/* Formulario centrado */}
            <div className="absolute inset-0 w-full h-full bg-black" style={{ opacity: 0.4 }}></div>
            <div className="z-10 flex items-center justify-center w-full min-h-screen">
                <ResetPasswordForm />
            </div>
        </div>
    )
}

export default ResetPassword;