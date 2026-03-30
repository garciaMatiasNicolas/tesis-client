"use client";
import SupplierTable from '@/components/suppliers/SupplierTable';
import SideBar from '@/components/ui/SideBar';
import Alert from '@/components/ui/Alert';
import useApiMethods from '@/hooks/useApiMethods';
import React from 'react'

const SuppliersPage = () => {
    const { postMethod, deleteMethod, getMethod, patchMethod } = useApiMethods();
    const [suppliers, setSuppliers] = React.useState([]);
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

    // Cargar proveedores al montar el componente
    React.useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        try {
            setLoading(true);
            setError(null);
            setAlert(null);
            const response = await getMethod('/suppliers/');
            
            // Asegurar que siempre sea un array
            const suppliersArray = Array.isArray(response) ? response : 
                                  (response && response.results) ? response.results :
                                  (response && response.data) ? response.data : [];
            
            setSuppliers(suppliersArray);
        } catch (err) {
            console.error('Error cargando proveedores:', err);
            showAlert('danger', 'Error al cargar proveedores', 'No se pudieron cargar los proveedores. Por favor, intenta nuevamente.');
            setSuppliers([]); // Asegurar que siempre sea array en caso de error
        } finally {
            setLoading(false);
        }
    };

    // Manejar creación de proveedor
    const handleCreateSupplier = async (supplierData) => {
        try {
            setLoading(true);
            setError(null);
            setAlert(null);
            const response = await postMethod('/suppliers/', supplierData);
            
            if (response && response.supplier) {
                // Agregar el nuevo proveedor a la lista
                setSuppliers(prev => [response.supplier, ...prev]);
                showAlert('success', 'Proveedor creado', 'El proveedor se ha creado exitosamente.');
                return { success: true, data: response.supplier };
            } else if (response) {
                // Si la respuesta es directamente el proveedor
                setSuppliers(prev => [response, ...prev]);
                showAlert('success', 'Proveedor creado', 'El proveedor se ha creado exitosamente.');
                return { success: true, data: response };
            }
        } catch (err) {
            console.error('Error creando proveedor:', err);
            
            // Manejar errores de validación específicos del backend
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                let errorMessage = '';
                
                // Procesar errores de validación campo por campo
                const fieldErrors = [];
                if (errorData.website) {
                    fieldErrors.push(`Sitio web: ${errorData.website.join(', ')}`);
                }
                if (errorData.cuit) {
                    fieldErrors.push(`CUIT: ${errorData.cuit.join(', ')}`);
                }
                if (errorData.email) {
                    fieldErrors.push(`Email: ${errorData.email.join(', ')}`);
                }
                if (errorData.name) {
                    fieldErrors.push(`Nombre: ${errorData.name.join(', ')}`);
                }
                if (errorData.phone) {
                    fieldErrors.push(`Teléfono: ${errorData.phone.join(', ')}`);
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
            
            showAlert('danger', 'Error al crear proveedor', 'No se pudo crear el proveedor. Intenta nuevamente.');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Manejar actualización de proveedor
    const handleUpdateSupplier = async (supplierId, supplierData) => {
        try {
            setLoading(true);
            setError(null);
            setAlert(null);
            const response = await patchMethod(`/suppliers/${supplierId}/`, supplierData);
            
            if (response && response.supplier) {
                // Actualizar el proveedor en la lista
                setSuppliers(prev => prev.map(s => 
                    s.id === supplierId ? response.supplier : s
                ));
                showAlert('success', 'Proveedor actualizado', 'El proveedor se ha actualizado exitosamente.');
                return { success: true, data: response.supplier };
            } else if (response) {
                // Si la respuesta es directamente el proveedor
                setSuppliers(prev => prev.map(s => 
                    s.id === supplierId ? response : s
                ));
                showAlert('success', 'Proveedor actualizado', 'El proveedor se ha actualizado exitosamente.');
                return { success: true, data: response };
            }
        } catch (err) {
            console.error('Error actualizando proveedor:', err);
            
            // Manejar errores de validación específicos del backend
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                let errorMessage = '';
                
                // Procesar errores de validación campo por campo
                const fieldErrors = [];
                if (errorData.website) {
                    fieldErrors.push(`Sitio web: ${errorData.website.join(', ')}`);
                }
                if (errorData.cuit) {
                    fieldErrors.push(`CUIT: ${errorData.cuit.join(', ')}`);
                }
                if (errorData.email) {
                    fieldErrors.push(`Email: ${errorData.email.join(', ')}`);
                }
                if (errorData.name) {
                    fieldErrors.push(`Nombre: ${errorData.name.join(', ')}`);
                }
                if (errorData.phone) {
                    fieldErrors.push(`Teléfono: ${errorData.phone.join(', ')}`);
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
            
            showAlert('danger', 'Error al actualizar proveedor', 'No se pudo actualizar el proveedor. Intenta nuevamente.');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Manejar eliminación de proveedor
    const handleDeleteSupplier = async (supplier) => {
        try {
            setLoading(true);
            setError(null);
            setAlert(null);
            await deleteMethod(`/suppliers/${supplier.id}/`);
            
            // Eliminar proveedor de la lista
            setSuppliers(prev => prev.filter(s => s.id !== supplier.id));
            showAlert('success', 'Proveedor eliminado', `El proveedor "${supplier.name}" se ha eliminado exitosamente.`);
            return { success: true };
        } catch (err) {
            console.error('Error eliminando proveedor:', err);
            
            // Manejar errores específicos de eliminación
            let errorTitle = 'Error al eliminar proveedor';
            let errorMessage = 'No se pudo eliminar el proveedor.';
            
            if (err.response && err.response.data) {
                if (err.response.status === 404) {
                    errorMessage = 'El proveedor no existe o ya fue eliminado.';
                } else if (err.response.status === 403) {
                    errorMessage = 'No tienes permisos para eliminar este proveedor.';
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
                <SupplierTable
                    suppliers={suppliers}
                    loading={loading}
                    error={null} // Ya no pasamos el error aquí, usamos Alert
                    onDeleteSupplier={handleDeleteSupplier}
                    onCreateSupplier={handleCreateSupplier}
                    onUpdateSupplier={handleUpdateSupplier}
                    searchTerm={searchTerm}
                    onSearchChange={(term) => setSearchTerm(term)}
                    showActions={showActions}
                />
            </main>
        </div>
    )
}

export default SuppliersPage;