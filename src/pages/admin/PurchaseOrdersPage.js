"use client";
import React, { useState, useEffect } from 'react';
import PurchaseOrdersTable from '@/components/admin/PurchaseOrdersTable';
import PurchaseFormModal from '@/components/admin/PurchaseFormModal';
import SideBar from '@/components/ui/SideBar';
import Alert from '@/components/ui/Alert';
import useApiMethods from '@/hooks/useApiMethods';
import purchaseOrderService from '@/services/purchaseOrderService';

const PurchaseOrdersPage = () => {
    // Inicializar API methods
    const apiMethods = useApiMethods();

    // Inicializar service
    useEffect(() => {
        purchaseOrderService.initialize(apiMethods);
    }, [apiMethods]);

    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showActions, setShowActions] = useState(true);
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    // Estados para el modal
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState(null);

    // Estado para alertas
    const [alert, setAlert] = useState(null);

    // Cargar órdenes de compra
    useEffect(() => {
        loadPurchaseOrders();
    }, [currentPage]);

    const loadPurchaseOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await purchaseOrderService.getPurchaseOrders({
                page: currentPage,
                page_size: pageSize
            });
            
            // Manejar respuesta paginada o array simple
            if (response.results) {
                setPurchaseOrders(response.results);
                setTotalCount(response.count || 0);
                setTotalPages(Math.ceil((response.count || 0) / pageSize));
            } else if (Array.isArray(response)) {
                setPurchaseOrders(response);
                setTotalCount(response.length);
                setTotalPages(1);
            }
        } catch (err) {
            console.error('Error loading purchase orders:', err);
            setError('Error al cargar las órdenes de compra');
            showAlert('Error al cargar las órdenes de compra', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Calcular estadísticas
    const stats = purchaseOrderService.calculateStats(purchaseOrders);

    // Mock data eliminado - ahora usa datos reales del backend
    const mockPurchaseOrders_REMOVED = [
        {
            id: 1,
            employee: {
                id: 1,
                user: {
                    first_name: 'Juan',
                    last_name: 'Pérez'
                }
            },
            supplier: {
                id: 1,
                name: 'Distribuidora López S.A.',
                phone: '+54 11 4567-8900',
                email: 'contacto@lopez.com.ar'
            },
            payment_method: 'Transferencia Bancaria',
            delivery_date: '2025-01-30',
            total_price: 125000.00,
            description: 'Compra de materiales para stock',
            status: 'pending',
            was_buyed: false,
            transport: 'Transporte Rápido S.A.',
            driver: 'Carlos González',
            patent: 'AB123CD',
            currency: 'ARS',
            taxes: 26250.00,
            discount: 0.00,
            shipping_cost: 5000.00,
            items: [
                {
                    id: 1,
                    product: {
                        id: 1,
                        name: 'Producto A',
                        sku: 'PROD-001'
                    },
                    quantity: 50
                }
            ],
            comments: [],
            created_at: '2025-01-15T10:30:00Z',
            updated_at: '2025-01-15T10:30:00Z'
        },
        {
            id: 2,
            employee: {
                id: 2,
                user: {
                    first_name: 'María',
                    last_name: 'García'
                }
            },
            supplier: {
                id: 2,
                name: 'Importadora García',
                phone: '+54 11 5678-9012',
                email: 'ventas@garcia.com'
            },
            payment_method: 'Cheque 30 días',
            delivery_date: '2025-02-05',
            total_price: 450000.00,
            description: 'Pedido mensual de mercadería',
            status: 'approved',
            was_buyed: true,
            transport: 'Logística del Norte',
            driver: 'Roberto Martínez',
            patent: 'CD456EF',
            currency: 'ARS',
            taxes: 94500.00,
            discount: 22500.00,
            shipping_cost: 12000.00,
            items: [
                {
                    id: 2,
                    product: {
                        id: 2,
                        name: 'Producto B',
                        sku: 'PROD-002'
                    },
                    quantity: 120
                }
            ],
            comments: [
                {
                    user: 'Admin',
                    comment: 'Orden aprobada por gerencia',
                    timestamp: '2025-01-16T09:15:00Z'
                }
            ],
            created_at: '2025-01-14T14:20:00Z',
            updated_at: '2025-01-16T09:15:00Z'
        },
        {
            id: 3,
            employee: {
                id: 1,
                user: {
                    first_name: 'Juan',
                    last_name: 'Pérez'
                }
            },
            supplier: {
                id: 3,
                name: 'Mayorista del Sur',
                phone: '+54 11 6789-0123',
                email: 'pedidos@mayoristasur.com'
            },
            payment_method: 'Efectivo',
            delivery_date: '2025-01-25',
            total_price: 78500.00,
            description: 'Compra urgente para reposición',
            status: 'approved',
            was_buyed: true,
            transport: 'Transporte Propio',
            driver: 'Luis Fernández',
            patent: 'EF789GH',
            currency: 'ARS',
            taxes: 16485.00,
            discount: 3925.00,
            shipping_cost: 0.00,
            items: [
                {
                    id: 3,
                    product: {
                        id: 3,
                        name: 'Producto C',
                        sku: 'PROD-003'
                    },
                    quantity: 80
                }
            ],
            comments: [],
            created_at: '2025-01-10T08:45:00Z',
            updated_at: '2025-01-25T16:30:00Z'
        },
        {
            id: 4,
            employee: {
                id: 2,
                user: {
                    first_name: 'María',
                    last_name: 'García'
                }
            },
            supplier: {
                id: 1,
                name: 'Distribuidora López S.A.',
                phone: '+54 11 4567-8900',
                email: 'contacto@lopez.com.ar'
            },
            payment_method: 'Cuenta Corriente',
            delivery_date: '2025-01-22',
            total_price: 95000.00,
            description: 'Orden cancelada',
            status: 'rejected',
            was_buyed: false,
            transport: null,
            driver: null,
            patent: null,
            currency: 'ARS',
            taxes: 19950.00,
            discount: 0.00,
            shipping_cost: 8000.00,
            items: [
                {
                    id: 4,
                    product: {
                        id: 1,
                        name: 'Producto A',
                        sku: 'PROD-001'
                    },
                    quantity: 60
                }
            ],
            comments: [
                {
                    user: 'Admin',
                    comment: 'Cancelado por falta de stock del proveedor',
                    timestamp: '2025-01-12T10:00:00Z'
                }
            ],
            created_at: '2025-01-08T11:00:00Z',
            updated_at: '2025-01-12T10:00:00Z'
        }
    ];

    // Mostrar alerta
    const showAlert = (message, type = 'success') => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 5000);
    };

    const getApiErrorMessage = (err, fallback) => {
        const status = err?.response?.status;
        const data = err?.response?.data;

        if (data) {
            if (typeof data === 'string') return data;
            if (data.detail) return data.detail;
            if (data.message) return data.message;

            if (typeof data === 'object') {
                const firstKey = Object.keys(data)[0];
                const value = data[firstKey];
                if (Array.isArray(value)) return value[0];
                if (typeof value === 'string') return value;
            }
        }

        if (status === 404) return 'Recurso no encontrado.';
        if (status === 403) return 'No tienes permisos para realizar esta acción.';

        return fallback;
    };

    // Manejar creación de orden
    const handleCreatePurchase = () => {
        setEditingPurchase(null);
        setShowModal(true);
    };

    // Manejar edición de orden
    const handleEditPurchase = (purchase) => {
        setEditingPurchase(purchase);
        setShowModal(true);
    };

    // Manejar envío del formulario del modal
    const handleModalSubmit = async (purchaseData) => {
        try {
            setModalLoading(true);
            // Validar datos antes de enviar
            const validation = purchaseOrderService.validatePurchaseData(purchaseData);
            if (!validation.isValid) {
                showAlert(validation.errors[0], 'danger');
                return;
            }

            if (editingPurchase) {
                // Actualizar orden existente
                await purchaseOrderService.updatePurchaseOrder(
                    editingPurchase.id,
                    purchaseData
                );
                showAlert('Orden de compra actualizada exitosamente');
            } else {
                // Crear nueva orden
                await purchaseOrderService.createPurchaseOrder(purchaseData);
                showAlert('Orden de compra creada exitosamente');
            }
            
            // Recargar lista
            await loadPurchaseOrders();
            
            // Cerrar modal
            setShowModal(false);
            setEditingPurchase(null);
            
        } catch (err) {
            console.error('Error submitting purchase:', err);
            const fallback = editingPurchase
                ? 'Error al actualizar la orden de compra'
                : 'Error al crear la orden de compra';
            showAlert(getApiErrorMessage(err, fallback), 'danger');
        } finally {
            setModalLoading(false);
        }
    };

    // Cerrar modal
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPurchase(null);
        setModalLoading(false);
    };

    // Manejar eliminación de orden
    const handleDeletePurchase = async (purchase) => {
        try {
            setLoading(true);
            
            // Eliminar orden
            await purchaseOrderService.deletePurchaseOrder(purchase.id);
            
            // Recargar lista
            await loadPurchaseOrders();
            
            showAlert('Orden de compra eliminada exitosamente');
        } catch (err) {
            console.error('Error deleting purchase:', err);
            showAlert(getApiErrorMessage(err, 'Error al eliminar la orden de compra'), 'danger');
        } finally {
            setLoading(false);
        }
    };

    // Manejar actualización de estado
    const handleUpdateStatus = async (purchaseId, status, comment) => {
        try {
            // Actualizar estado
            await purchaseOrderService.patchPurchaseOrder(purchaseId, { status, comment });
            
            // Recargar lista
            await loadPurchaseOrders();
            
            const statusLabels = {
                'pending': 'Pendiente',
                'approved': 'Aprobada',
                'rejected': 'Rechazada'
            };
            showAlert(`Estado actualizado a: ${statusLabels[status]}`);
        } catch (err) {
            console.error('Error updating status:', err);
            showAlert(getApiErrorMessage(err, 'Error al actualizar el estado'), 'danger');
        }
    };

    // Manejar actualización de pago
    const handleUpdatePayment = async (purchaseId, wasPayed, comment) => {
        try {
            await purchaseOrderService.patchPurchaseOrder(purchaseId, { was_payed: wasPayed, comment });
            await loadPurchaseOrders();
            showAlert(wasPayed ? 'Orden marcada como pagada' : 'Orden marcada como no pagada');
        } catch (err) {
            console.error('Error updating payment:', err);
            showAlert(getApiErrorMessage(err, 'Error al actualizar el estado de pago'), 'danger');
        }
    };

    // Manejar actualización de recepción
    const handleUpdateReceived = async (purchaseId, received, receivedDate, comment) => {
        try {
            await purchaseOrderService.patchPurchaseOrder(purchaseId, { 
                received: received,
                received_date: receivedDate,
                comment
            });
            await loadPurchaseOrders();
            showAlert(received ? 'Orden marcada como recibida' : 'Orden marcada como no recibida');
        } catch (err) {
            console.error('Error updating received:', err);
            showAlert(getApiErrorMessage(err, 'Error al actualizar el estado de recepción'), 'danger');
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
            // loadPurchaseOrders se ejecutará automáticamente por el useEffect
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

                <PurchaseOrdersTable
                    purchaseOrders={purchaseOrders}
                    loading={loading}
                    error={error}
                    onDeletePurchase={handleDeletePurchase}
                    onCreatePurchase={handleCreatePurchase}
                    onEditPurchase={handleEditPurchase}
                    onUpdateStatus={handleUpdateStatus}
                    onUpdatePayment={handleUpdatePayment}
                    onUpdateReceived={handleUpdateReceived}
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
                <PurchaseFormModal
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    onSubmit={handleModalSubmit}
                    loading={modalLoading}
                    purchaseOrder={editingPurchase}
                />
            </main>
        </div>
    );
};

export default PurchaseOrdersPage;
