"use client";
import { FaCog } from "react-icons/fa";

const GeneralSettings = () => {
    return (
        <div className="bg-white rounded-xl p-6 md:p-10 w-full max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-[#223263] mb-6 flex items-center gap-2">
                <FaCog className="text-[#18c29c]" /> Configuración general
            </h2>
            <div className="text-gray-500">Próximamente podrás configurar opciones generales de la app.</div>
        </div>
    );
};

export default GeneralSettings;