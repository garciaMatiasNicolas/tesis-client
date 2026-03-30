"use client";
import WarehouseTable from '@/components/warehouse/WarehouseTable';
import SideBar from "@/components/ui/SideBar";
import Alert from '@/components/ui/Alert';
import useWarehouseService from '@/services/warehouseService';
import React from 'react'

const WarehousePage = () => {
    const warehouseService = useWarehouseService();
    const [warehouses, setWarehouses] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [showActions, setShowActions] = React.useState(true);
    const [alert, setAlert] = React.useState(null);

    // Función para mostrar alertas
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        // Auto-ocultar después de 5 segundos para alertas de éxito
        if (type === 'success') {
            setTimeout(() => setAlert(null), 5000);
        }
    };

    // Cargar depósitos al montar el componente
    React.useEffect(() => {
        loadWarehouses();
    }, []);

    const loadWarehouses = async () => {
        try {
            setLoading(true);
            setError(null);
            setAlert(null);
            const response = await warehouseService.getAllWarehouses();
            
            // Asegurar que siempre sea un array
            const warehousesArray = Array.isArray(response) ? response : [];
            
            setWarehouses(warehousesArray);
        } catch (err) {
            showAlert('danger', 'Error al cargar depósitos', 'No se pudieron cargar los depósitos. Por favor, intenta nuevamente.');
            setWarehouses([]); // Asegurar que siempre sea array en caso de error
        } finally {
            setLoading(false);
        }
    };

    // Manejar creación de depósito
    const handleCreateWarehouse = async (warehouseData) => {
        try {
            setLoading(true);
            setError(null);
            setAlert(null);
            const response = await warehouseService.createWarehouse(warehouseData);
            
            if (response) {
                // Agregar el nuevo depósito a la lista
                setWarehouses(prev => [response, ...prev]);
                showAlert('success', 'Depósito creado', 'El depósito se ha creado exitosamente.');
                return { success: true, data: response };
            }
        } catch (err) {
            console.error('Error creando depósito:', err);
            
            // Manejar errores de validación específicos del backend
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                let errorMessage = '';
                
                // Procesar errores de validación campo por campo
                const fieldErrors = [];
                if (errorData.name) {
                    fieldErrors.push(`Nombre: ${errorData.name.join(', ')}`);
                }
                if (errorData.address) {
                    fieldErrors.push(`Dirección: ${errorData.address.join(', ')}`);
                }
                if (errorData.store) {
                    fieldErrors.push(`Tienda: ${errorData.store.join(', ')}`);
                }
                
                if (fieldErrors.length > 0) {
                    errorMessage = fieldErrors.join(' | ');
                } else {
                    errorMessage = 'Por favor revisa los datos ingresados.';
                }
                
                showAlert('danger', 'Error de validación', errorMessage);
                return { 
                    success: false, 
                    error: errorMessage,
                    validationErrors: errorData 
                };
            }
            
            showAlert('danger', 'Error al crear depósito', 'No se pudo crear el depósito. Intenta nuevamente.');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Manejar actualización de depósito
    const handleUpdateWarehouse = async (warehouseId, warehouseData) => {
        try {
            setLoading(true);
            setError(null);
            setAlert(null);
            const response = await warehouseService.partialUpdateWarehouse(warehouseId, warehouseData);
            
            if (response) {
                // Actualizar el depósito en la lista
                setWarehouses(prev => prev.map(w => 
                    w.id === warehouseId ? response : w
                ));
                showAlert('success', 'Depósito actualizado', 'El depósito se ha actualizado exitosamente.');
                return { success: true, data: response };
            }
        } catch (err) {
            console.error('Error actualizando depósito:', err);
            
            // Manejar errores de validación específicos del backend
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                let errorMessage = '';
                
                // Procesar errores de validación campo por campo
                const fieldErrors = [];
                if (errorData.name) {
                    fieldErrors.push(`Nombre: ${errorData.name.join(', ')}`);
                }
                if (errorData.address) {
                    fieldErrors.push(`Dirección: ${errorData.address.join(', ')}`);
                }
                if (errorData.store) {
                    fieldErrors.push(`Tienda: ${errorData.store.join(', ')}`);
                }
                
                if (fieldErrors.length > 0) {
                    errorMessage = fieldErrors.join(' | ');
                } else {
                    errorMessage = 'Por favor revisa los datos ingresados.';
                }
                
                showAlert('danger', 'Error de validación', errorMessage);
                return { 
                    success: false, 
                    error: errorMessage,
                    validationErrors: errorData 
                };
            }
            
            showAlert('danger', 'Error al actualizar depósito', 'No se pudo actualizar el depósito. Intenta nuevamente.');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Manejar eliminación de depósito
    const handleDeleteWarehouse = async (warehouse) => {
        try {
            setLoading(true);
            setError(null);
            setAlert(null);
            await warehouseService.deleteWarehouse(warehouse.id);
            
            // Eliminar depósito de la lista
            setWarehouses(prev => prev.filter(w => w.id !== warehouse.id));
            showAlert('success', 'Depósito eliminado', `El depósito "${warehouse.name}" se ha eliminado exitosamente.`);
            return { success: true };
        } catch (err) {
            console.error('Error eliminando depósito:', err);
            
            // Manejar errores específicos de eliminación
            let errorTitle = 'Error al eliminar depósito';
            let errorMessage = 'No se pudo eliminar el depósito.';
            
            if (err.response && err.response.data) {
                if (err.response.status === 404) {
                    errorMessage = 'El depósito no existe o ya fue eliminado.';
                } else if (err.response.status === 403) {
                    errorMessage = 'No tienes permisos para eliminar este depósito.';
                } else if (err.response.data.error) {
                    errorMessage = err.response.data.error;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                }
            }
            
            showAlert('danger', errorTitle, errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
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
                onSupport={() => alert("Soporte")}
                onLogout={() => alert("Cerrar sesión")}
            />
            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                <WarehouseTable
                    warehouses={warehouses}
                    loading={loading}
                    error={null} // Ya no pasamos el error aquí, usamos Alert
                    onDeleteWarehouse={handleDeleteWarehouse}
                    onCreateWarehouse={handleCreateWarehouse}
                    onUpdateWarehouse={handleUpdateWarehouse}
                    searchTerm={searchTerm}
                    onSearchChange={(term) => setSearchTerm(term)}
                    showActions={showActions}
                />
            </main>
        </div>
    );
}

export default WarehousePage;