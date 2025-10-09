"use client";
import CustomerTable from '@/components/crm/CustomerTable';
import CustomerFormModal from '@/components/crm/CustomerFormModal';
import SideBar from '@/components/ui/SideBar';
import useApiMethods from '@/hooks/useApiMethods';
import crmService from '@/services/crmService';
import React from 'react'

const CrmPage = () => {
    const [customers, setCustomers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [showActions, setShowActions] = React.useState(true);
    const [stats, setStats] = React.useState(null);
    const [filters, setFilters] = React.useState({
        type: '',
        has_purchases: '',
        min_spent: '',
        max_spent: ''
    });

    // Estados para el modal
    const [showModal, setShowModal] = React.useState(false);
    const [modalLoading, setModalLoading] = React.useState(false);
    const [editingCustomer, setEditingCustomer] = React.useState(null);

    const apiMethods = useApiMethods();

    // Inicializar el servicio CRM
    React.useEffect(() => {
        crmService.initialize(apiMethods);
    }, [apiMethods]);

    // Cargar clientes al montar el componente
    React.useEffect(() => {
        loadCustomers();
        loadStats();
    }, []);

    // Recargar clientes cuando cambien los filtros de búsqueda
    React.useEffect(() => {
        if (searchTerm.length > 2 || searchTerm.length === 0) {
            loadCustomers();
        }
    }, [searchTerm, filters]);

    // Función para cargar clientes desde la API
    const loadCustomers = async () => {
        try {
            setLoading(true);
            setError(null);

            // Construir parámetros de búsqueda
            const params = {
                search: searchTerm,
                ...filters
            };

            // Limpiar parámetros vacíos
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await crmService.getCustomers(params);
            
            // La respuesta puede ser paginada o directa
            const customersList = response.results || response;
            
            // Formatear clientes para display
            const formattedCustomers = customersList.map(customer => 
                crmService.formatCustomerForDisplay(customer)
            );

            setCustomers(formattedCustomers);
        } catch (err) {
            console.error('Error loading customers:', err);
            setError('Error al cargar los clientes. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar estadísticas
    const loadStats = async () => {
        try {
            const statsData = await crmService.getStats();
            setStats(statsData);
        } catch (err) {
            console.error('Error loading stats:', err);
            // No mostramos error para stats, solo logueamos
        }
    };

    // Manejar creación de cliente
    const handleCreateCustomer = () => {
        setEditingCustomer(null);
        setShowModal(true);
    };

    // Manejar edición de cliente
    const handleEditCustomer = (customer) => {
        setEditingCustomer(customer);
        setShowModal(true);
    };

    // Manejar envío del formulario del modal
    const handleModalSubmit = async (customerData) => {
        try {
            setModalLoading(true);
            
            // Validar datos antes de enviar
            const validation = crmService.validateCustomerData(customerData);
            if (!validation.isValid) {
                setError(`Errores de validación: ${validation.errors.join(', ')}`);
                throw new Error('Validation failed');
            }

            let result;
            if (editingCustomer) {
                // Actualizar cliente existente
                result = await crmService.updateCustomer(editingCustomer.id, customerData);
                console.log("Cliente actualizado exitosamente:", result);
            } else {
                // Crear nuevo cliente
                result = await crmService.createCustomer(customerData);
                console.log("Cliente creado exitosamente:", result);
            }
            
            // Recargar la lista de clientes
            await loadCustomers();
            await loadStats();
            
            // Cerrar modal
            setShowModal(false);
            setEditingCustomer(null);
            setError(null);
            
        } catch (err) {
            console.error('Error submitting customer:', err);
            if (err.message !== 'Validation failed') {
                setError(editingCustomer 
                    ? 'Error al actualizar el cliente. Por favor, intenta nuevamente.'
                    : 'Error al crear el cliente. Por favor, intenta nuevamente.'
                );
            }
            throw err; // Re-throw para que el modal pueda manejar el estado de loading
        } finally {
            setModalLoading(false);
        }
    };

    // Cerrar modal
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCustomer(null);
        setModalLoading(false);
    };

    // Manejar eliminación de cliente
    const handleDeleteCustomer = async (customer) => {
        try {
            const confirmDelete = window.confirm(
                `¿Estás seguro de que deseas eliminar a ${customer.display_name}?`
            );
            
            if (!confirmDelete) return;

            setLoading(true);
            await crmService.deleteCustomer(customer.id);
            
            // Recargar la lista de clientes
            await loadCustomers();
            await loadStats();
            
            console.log("Cliente eliminado exitosamente:", customer.id);
        } catch (err) {
            console.error('Error deleting customer:', err);
            setError('Error al eliminar el cliente. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Manejar actualización de cliente
    const handleUpdateCustomer = async (customerId, customerData) => {
        try {
            setLoading(true);
            
            const updatedCustomer = await crmService.updateCustomer(customerId, customerData);
            
            // Recargar la lista de clientes
            await loadCustomers();
            
            console.log("Cliente actualizado exitosamente:", updatedCustomer);
        } catch (err) {
            console.error('Error updating customer:', err);
            setError('Error al actualizar el cliente. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Manejar agregar contacto
    const handleAddContact = async (customerId, contactData) => {
        try {
            const response = await crmService.addContact(customerId, contactData);
            
            // Recargar la lista de clientes para mostrar el nuevo contacto
            await loadCustomers();
            
            console.log("Contacto agregado exitosamente:", response);
            return response;
        } catch (err) {
            console.error('Error adding contact:', err);
            throw err;
        }
    };

    // Manejar búsqueda
    const handleSearchChange = (term) => {
        setSearchTerm(term);
    };

    // Manejar cambios en filtros
    const handleFilterChange = (newFilters) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            ...newFilters
        }));
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <SideBar
                onProfile={() => window.location.href = "/profile"}
                onSupport={() => alert("Soporte")}
                onLogout={() => alert("Cerrar sesión")}
            />
            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                <CustomerTable
                    customers={customers}
                    loading={loading}
                    error={error}
                    onDeleteCustomer={handleDeleteCustomer}
                    onCreateCustomer={handleCreateCustomer}
                    onUpdateCustomer={handleUpdateCustomer}
                    onEditCustomer={handleEditCustomer}
                    onAddContact={handleAddContact}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    onFilterChange={handleFilterChange}
                    showActions={showActions}
                    stats={stats}
                />

                {/* Modal para crear/editar cliente */}
                <CustomerFormModal
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    onSubmit={handleModalSubmit}
                    loading={modalLoading}
                    customer={editingCustomer}
                />
            </main>
        </div>
    )
}

export default CrmPage;