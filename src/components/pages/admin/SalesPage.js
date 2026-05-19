"use client";
import React, { useState, useEffect } from 'react';
import SalesTable from '@/components/admin/SalesTable';
import SalesFormModal from '@/components/admin/SalesFormModal';
import SideBar from '@/components/ui/SideBar';
import Alert from '@/components/ui/Alert';
import useApiMethods from '@/hooks/useApiMethods';
import salesOrderService from '@/services/salesOrderService';

const SalesPage = () => {
    const [salesOrders, setSalesOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showActions, setShowActions] = useState(true);
    const [stats, setStats] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    // Estados para el modal
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingSale, setEditingSale] = useState(null);

    // Estado para alertas
    const [alert, setAlert] = useState(null);

    // Inicializar API methods y service
    const apiMethods = useApiMethods();

    useEffect(() => {
        if (apiMethods && !isInitialized) {
            salesOrderService.initialize(apiMethods);
            setIsInitialized(true);
        }
    }, [apiMethods, isInitialized]);

    // Cargar órdenes de venta desde la API
    useEffect(() => {
        const loadSalesOrders = async () => {
            if (!isInitialized) return;

            try {
                setLoading(true);
                setError(null);
                
                // Obtener órdenes de venta desde la API con paginación
                const response = await salesOrderService.getSalesOrders({
                    page: currentPage,
                    page_size: pageSize
                });
                
                setSalesOrders(response.results || []);
                setTotalCount(response.count || 0);
                setTotalPages(Math.ceil((response.count || 0) / pageSize));
                
                // Calcular estadísticas
                const calculatedStats = salesOrderService.calculateStats(response.results || []);
                setStats(calculatedStats);
                
            } catch (err) {
                console.error('Error loading sales orders:', err);
                
                // Si es un error 404 (página no encontrada), volver a la página 1
                if (err.response && err.response.status === 404) {
                    if (currentPage > 1) {
                        setCurrentPage(1);
                        return; // El useEffect se ejecutará de nuevo con currentPage = 1
                    }
                }
                
                setError('Error al cargar las órdenes de venta. Por favor, intenta nuevamente.');
                setSalesOrders([]);
            } finally {
                setLoading(false);
            }
        };

        loadSalesOrders();
    }, [isInitialized, currentPage]);

    // Mostrar alerta
    const showAlert = (message, type = 'success') => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 5000);
    };

    // Manejar creación de orden
    const handleCreateSale = () => {
        setEditingSale(null);
        setShowModal(true);
    };

    // Manejar edición de orden
    const handleEditSale = (sale) => {
        setEditingSale(sale);
        setShowModal(true);
    };

    // Manejar envío del formulario del modal
    const handleModalSubmit = async (saleData) => {
        try {
            setModalLoading(true);

            // Asegurar que el servicio esté inicializado
            if (!isInitialized || !salesOrderService.apiMethods) {
                if (apiMethods) {
                    salesOrderService.initialize(apiMethods);
                    setIsInitialized(true);
                } else {
                    throw new Error('API methods no disponibles');
                }
            }

            if (editingSale) {
                // Actualizar orden existente
                const updatedSale = await salesOrderService.updateSalesOrder(editingSale.id, saleData);
                
                // Actualizar en la lista local
                const updatedSales = salesOrders.map(sale => 
                    sale.id === editingSale.id ? updatedSale : sale
                );
                setSalesOrders(updatedSales);
                
                // Recalcular estadísticas
                setStats(salesOrderService.calculateStats(updatedSales));
                
                showAlert('Orden de venta actualizada exitosamente');
                
                // Cerrar modal solo si fue exitoso
                setShowModal(false);
                setEditingSale(null);
            } else {
                // Crear nueva orden
                const newSale = await salesOrderService.createSalesOrder(saleData);
                
                // Agregar a la lista local
                const updatedSales = [newSale, ...salesOrders];
                setSalesOrders(updatedSales);
                
                // Recalcular estadísticas
                setStats(salesOrderService.calculateStats(updatedSales));
                
                showAlert('Orden de venta creada exitosamente');
                
                // Cerrar modal solo si fue exitoso
                setShowModal(false);
                setEditingSale(null);
            }
            
        } catch (err) {
            console.error('Error submitting sale:', err);
            // Re-lanzar el error para que el formulario pueda manejarlo
            // (especialmente para el modal de selección de origen de stock)
            throw err;
        } finally {
            setModalLoading(false);
        }
    };

    // Cerrar modal
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSale(null);
        setModalLoading(false);
    };

    // Manejar eliminación de orden
    const handleDeleteSale = async (sale) => {
        try {
            setLoading(true);
            
            // Eliminar orden desde la API
            await salesOrderService.deleteSalesOrder(sale.id);
            
            // Remover orden de la lista local
            const updatedSales = salesOrders.filter(s => s.id !== sale.id);
            setSalesOrders(updatedSales);
            
            // Recalcular estadísticas
            setStats(salesOrderService.calculateStats(updatedSales));
            
            showAlert('Orden de venta eliminada exitosamente');
        } catch (err) {
            console.error('Error deleting sale:', err);
            showAlert('Error al eliminar la orden de venta', 'danger');
        } finally {
            setLoading(false);
        }
    };

    // Manejar actualización de estado
    const handleUpdateStatus = async (saleId, updateData) => {
        try {
            // Actualizar estado en la API
            const updatedSale = await salesOrderService.patchSalesOrder(saleId, updateData);
            
            // Actualizar en la lista local
            const updatedSales = salesOrders.map(sale => 
                sale.id === saleId ? updatedSale : sale
            );
            setSalesOrders(updatedSales);
            
            // Recalcular estadísticas
            setStats(salesOrderService.calculateStats(updatedSales));
            
            // Retornar la venta actualizada para que el modal sepa que fue exitoso
            return updatedSale;
        } catch (err) {
            console.error('Error updating status:', err);
            // Lanzar el error para que el modal lo maneje
            throw err;
        }
    };

    // Manejar búsqueda
    const handleSearchChange = (term) => {
        setSearchTerm(term);
    };

    // Manejar cambio de página
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Manejar descarga de PDF
    const handleDownloadPDF = async (saleId) => {
        try {
            await salesOrderService.downloadPDF(saleId);
            showAlert('PDF descargado exitosamente');
        } catch (err) {
            console.error('Error downloading PDF:', err);
            showAlert('Error al descargar el PDF', 'danger');
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <SideBar
                onProfile={() => window.location.href = "/profile"}
                onSupport={() => alert("Soporte")}
                onLogout={() => alert("Cerrar sesión")}
            />
            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                {/* Alert */}
                {alert && (
                    <div className="mb-4">
                        <Alert 
                            message={alert.message} 
                            type={alert.type} 
                            onClose={() => setAlert(null)} 
                        />
                    </div>
                )}

                <SalesTable
                    salesOrders={salesOrders}
                    loading={loading}
                    error={error}
                    onDeleteSale={handleDeleteSale}
                    onCreateSale={handleCreateSale}
                    onEditSale={handleEditSale}
                    onUpdateStatus={handleUpdateStatus}
                    onDownloadPDF={handleDownloadPDF}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    showActions={showActions}
                    stats={stats}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                />

                {/* Modal para crear/editar orden */}
                <SalesFormModal
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    onSubmit={handleModalSubmit}
                    loading={modalLoading}
                    salesOrder={editingSale}
                />
            </main>
        </div>
    );
};

export default SalesPage;