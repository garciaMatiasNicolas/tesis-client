import ResetPasswordForm from '@/components/auth/ResetPassworForm';
import React from 'react'

const ResetPassword = () => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Fondo con imagen opaca */}
            <div className="absolute inset-0 w-full h-full -z-10">
                <img
                src="/assets/AuthBG.jpg"
                alt="background"
                className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 w-full h-full bg-white bg-opacity-40"></div>
            </div>
            {/* Formulario centrado */}
            <div className="z-10 flex items-center justify-center w-full min-h-screen">
                <ResetPasswordForm />
            </div>
        </div>
    )
}

export default ResetPassword;