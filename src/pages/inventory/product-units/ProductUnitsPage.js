"use client";
import React, { useState } from "react";
import SideBar from "@/components/ui/SideBar";
import Alert from "@/components/ui/Alert";
import ProductUnitsTable from "@/components/products/ProductUnitsTable";
import { FaBox, FaInfoCircle } from "react-icons/fa";

export default function ProductUnitsPage() {
    const [alert, setAlert] = useState(null);

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        if (type === 'success') {
            setTimeout(() => setAlert(null), 5000);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            {/* Alert component */}
            {alert && (
                <Alert
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
            
            <SideBar
                onProfile={() => window.location.href = "/profile"}
                onSupport={() => showAlert("info", "Soporte", "Funcionalidad en desarrollo")}
                onLogout={() => showAlert("info", "Logout", "Funcionalidad en desarrollo")}
            />
            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-[#18c29c] rounded-lg">
                                        <FaBox className="text-2xl text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Unidades de Producto</h1>
                                        <p className="text-gray-600 mt-1">Gestión de conversiones y empaques</p>
                                    </div>
                                </div>
                            </div>

                            {/* Info banner */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <FaInfoCircle className="text-blue-600 text-xl mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-semibold mb-1">Acerca de las unidades de producto</p>
                                        <p>
                                            Las unidades definen cómo se empaquetan y convierten los productos. Por ejemplo:
                                        </p>
                                        <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                                            <li><span className="font-medium">Caja x12</span> - Factor de conversión: 12 unidades base</li>
                                            <li><span className="font-medium">Pallet x48</span> - Factor de conversión: 48 unidades base</li>
                                            <li><span className="font-medium">Display x6</span> - Factor de conversión: 6 unidades base</li>
                                        </ul>
                                        <p className="mt-2">
                                            Utiliza los botones de <span className="font-semibold">Importar/Exportar</span> para gestionar grandes cantidades de unidades de forma masiva.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de unidades */}
                    <ProductUnitsTable onShowAlert={showAlert} />
                </div>
            </main>
        </div>
    );
}
