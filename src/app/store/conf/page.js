"use client";
import ProtectedRoute from "@/services/ProtectedRoute";
import StoreForm from "@/components/store/StoreForm";
import Alert from "@/components/ui/Alert";
import useApiMethods from "@/hooks/useApiMethods";
import { useState, useEffect } from "react";
import StoreConfPage from "@/pages/store/conf/StoreConfPage";

export default function StoreConfigPage() {
    const { getMethod, putMethod, postMethod } = useApiMethods();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Alert state
    const [alert, setAlert] = useState({
        show: false,
        type: 'success',
        title: '',
        message: ''
    });

    // Cargar datos de la tienda
    useEffect(() => {
        const fetchStore = async () => {
            try {
                const response = await getMethod("/stores/");
                console.log("Respuesta de la API de tiendas:", response);
                if (response && response.length > 0) {
                    setStore(response[0]); // Asumiendo que el usuario tiene una tienda
                }
            } catch (error) {
                console.error("Error cargando tienda:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, []);

    const handleSave = async (formData) => {
        setSaving(true);
        try {
            if (store?.id) {
                // Actualizar tienda existente
                await putMethod(`/stores/${store.id}/`, formData);
                setAlert({
                    show: true,
                    type: 'success',
                    title: '¡Éxito!',
                    message: 'La tienda se ha actualizado correctamente.'
                });
            } else {
                // Crear nueva tienda
                const response = await postMethod("/stores/", formData);
                setStore(response);
                setAlert({
                    show: true,
                    type: 'success',
                    title: '¡Tienda creada!',
                    message: 'Tu tienda se ha creado exitosamente.'
                });
            }
        } catch (error) {
            console.error("Error guardando tienda:", error);
            setAlert({
                show: true,
                type: 'danger',
                title: 'Error',
                message: error.response?.data?.message || 'Ocurrió un error al guardar la tienda. Por favor, inténtalo de nuevo.'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#18c29c] mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando configuración de la tienda...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            {/* Alert component */}
            {alert.show && (
                <Alert
                    title={alert.title}
                    text={alert.message}
                    type={alert.type}
                    onClose={() => setAlert(prev => ({ ...prev, show: false }))}
                />
            )}
            
            <StoreConfPage 
                store={store}
                setStore={setStore}
                handleSave={handleSave}
                saving={saving}
            />
        </ProtectedRoute>
    );
}