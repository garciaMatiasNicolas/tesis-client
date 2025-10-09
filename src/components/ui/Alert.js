import { useState } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaTimes, FaInfoCircle } from "react-icons/fa";
import clsx from "clsx";

const typeStyles = {
    success: {
        icon: <FaCheckCircle className="text-green-500 text-2xl mr-3" />,
        bg: "bg-green-50 border-green-400",
        text: "text-green-800",
        border: "border-green-400",
    },
    warning: {
        icon: <FaExclamationTriangle className="text-yellow-500 text-2xl mr-3" />,
        bg: "bg-yellow-50 border-yellow-400",
        text: "text-yellow-800",
        border: "border-yellow-400",
    },
    danger: {
        icon: <FaTimesCircle className="text-red-500 text-2xl mr-3" />,
        bg: "bg-red-50 border-red-400",
        text: "text-red-800",
        border: "border-red-400",
    },
    info: {
        icon: <FaInfoCircle className="text-blue-500 text-2xl mr-3" />,
        bg: "bg-blue-50 border-blue-400",
        text: "text-blue-800",
        border: "border-blue-400",
    },
};

export default function Alert({ title, text, message, type = "success", onClose }) {
    const [show, setShow] = useState(true);
    const style = typeStyles[type] || typeStyles.success;
    
    // Usar message como respaldo si text no está disponible
    const displayText = text || message;

    const handleClose = () => {
        setShow(false);
        if (onClose) onClose();
    };

    if (!show) return null;

    return (
        <div
            className={clsx(
                "fixed top-6 left-1/2 -translate-x-1/2 z-50 min-w-[320px] max-w-md px-6 py-4 rounded-lg border shadow-lg flex items-start gap-2 transition-all duration-300",
                style.bg,
                style.border,
                style.text,
                "opacity-100 scale-100"
            )}
            role="alert"
            style={{ transition: "all 0.3s cubic-bezier(.4,2,.6,1)" }}
        >
        {style.icon}
        <div className="flex-1">
            <div className="font-bold text-base mb-1">{title}</div>
            <div className="text-sm">{displayText}</div>
        </div>
        <button
            onClick={handleClose}
            className="ml-2 text-xl text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
        >
            <FaTimes />
        </button>
        </div>
    );
}