"use client";
import React from 'react';
import SupplierTable from '@/components/suppliers/SupplierTable';
import SideBar from '@/components/ui/SideBar';
import Alert from '@/components/ui/Alert';
import Pagination from '@/components/ui/Pagination';
import useSupplierService from '@/services/supplierService';

const SuppliersPage = () => {
    const supplierService = useSupplierService();
    const [suppliers, setSuppliers] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [showActions, setShowActions] = React.useState(true);
    const [alert, setAlert] = React.useState(null);
    
    // Estados de paginación
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [totalCount, setTotalCount] = React.useState(0);
    const [itemsPerPage] = React.useState(10);

    // Función para mostrar alertas
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        // Auto-ocultar después de 5 segundos para alertas de éxito
        if (type === 'success') {
            setTimeout(() => setAlert(null), 5000);
        }
    };

    // Cargar proveedores al montar el componente y cuando cambie la página o filtros
    React.useEffect(() => {
        loadSuppliers(currentPage);
    }, [currentPage]);
    
    // Resetear a página 1 cuando cambie el término de búsqueda
    React.useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            loadSuppliers(1);
        }
    }, [searchTerm]);

    const loadSuppliers = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            setAlert(null);
            const response = await supplierService.getAllSuppliers({
                page,
                page_size: itemsPerPage,
                search: searchTerm
            });
            
            // Manejar respuesta paginada
            if (response && response.results) {
                setSuppliers(response.results);
                setTotalCount(response.count || 0);
                setTotalPages(Math.ceil((response.count || 0) / itemsPerPage));
            } else {
                // Respuesta sin paginación (fallback para compatibilidad)
                const suppliersArray = Array.isArray(response) ? response : 
                                      (response && response.data) ? response.data : [];
                setSuppliers(suppliersArray);
                setTotalCount(suppliersArray.length);
                setTotalPages(1);
            }
        } catch (err) {
            console.error('Error cargando proveedores:', err);
            showAlert('danger', 'Error al cargar proveedores', 'No se pudieron cargar los proveedores. Por favor, intenta nuevamente.');
            setSuppliers([]);
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
            const response = await supplierService.createSupplier(supplierData);
            
            if (response && response.supplier) {
                showAlert('success', 'Proveedor creado', 'El proveedor se ha creado exitosamente.');
                // Recargar lista actual
                await loadSuppliers(currentPage);
                return { success: true, data: response.supplier };
            } else if (response) {
                showAlert('success', 'Proveedor creado', 'El proveedor se ha creado exitosamente.');
                await loadSuppliers(currentPage);
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
            const response = await supplierService.updateSupplier(supplierId, supplierData);
            
            if (response && response.supplier) {
                showAlert('success', 'Proveedor actualizado', 'El proveedor se ha actualizado exitosamente.');
                await loadSuppliers(currentPage);
                return { success: true, data: response.supplier };
            } else if (response) {
                showAlert('success', 'Proveedor actualizado', 'El proveedor se ha actualizado exitosamente.');
                await loadSuppliers(currentPage);
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
            await supplierService.deleteSupplier(supplier.id);
            
            showAlert('success', 'Proveedor eliminado', `El proveedor "${supplier.name}" se ha eliminado exitosamente.`);
            // Recargar lista actual, o página anterior si esta queda vacía
            const remainingCount = totalCount - 1;
            const newTotalPages = Math.ceil(remainingCount / itemsPerPage);
            const pageToLoad = currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;
            
            if (pageToLoad !== currentPage) {
                setCurrentPage(pageToLoad);
            } else {
                await loadSuppliers(currentPage);
            }
            
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
    
    // Handlers de paginación
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
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
                onSupport={() => showAlert('info', 'Soporte', 'Funcionalidad en desarrollo')}
                onLogout={() => showAlert('info', 'Logout', 'Funcionalidad en desarrollo')}
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
                    onReload={() => loadSuppliers(currentPage)}
                    onShowAlert={showAlert}
                />
                
                {/* Paginación */}
                {!loading && suppliers.length > 0 && (
                    <div className="mt-6 px-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalCount={totalCount}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                            onPreviousPage={handlePreviousPage}
                            onNextPage={handleNextPage}
                            itemName="proveedores"
                        />
                    </div>
                )}
            </main>
        </div>
    )
}

export default SuppliersPage;