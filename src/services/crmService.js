import useApiMethods from '@/hooks/useApiMethods';

class CrmService {
    constructor() {
        // Este service usará el hook useApiMethods, pero necesitamos
        // instanciarlo desde los componentes que lo usen
        this.apiMethods = null;
    }

    // Método para inicializar el service con los métodos API
    initialize(apiMethods) {
        this.apiMethods = apiMethods;
    }

    // ========================================
    // CRUD de Clientes
    // ========================================

    /**
     * Obtener lista de clientes con filtros opcionales
     * @param {Object} params - Parámetros de filtro
     * @returns {Promise} Lista de clientes
     */
    async getCustomers(params = {}) {
        if (!this.apiMethods) throw new Error('CrmService not initialized');
        
        try {
            const response = await this.apiMethods.getMethod('/crm/customers/', params);
            return response;
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    }

    /**
     * Obtener detalles de un cliente específico
     * @param {number} customerId - ID del cliente
     * @returns {Promise} Detalles del cliente
     */
    async getCustomer(customerId) {
        if (!this.apiMethods) throw new Error('CrmService not initialized');
        
        try {
            const response = await this.apiMethods.getMethod(`/crm/customers/${customerId}/`);
            return response;
        } catch (error) {
            console.error('Error fetching customer details:', error);
            throw error;
        }
    }

    /**
     * Crear un nuevo cliente
     * @param {Object} customerData - Datos del cliente
     * @returns {Promise} Cliente creado
     */
    async createCustomer(customerData) {
        if (!this.apiMethods) throw new Error('CrmService not initialized');
        
        try {
            const response = await this.apiMethods.postMethod('/crm/customers/', customerData);
            return response;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }

    /**
     * Actualizar un cliente existente
     * @param {number} customerId - ID del cliente
     * @param {Object} customerData - Datos a actualizar
     * @returns {Promise} Cliente actualizado
     */
    async updateCustomer(customerId, customerData) {
        if (!this.apiMethods) throw new Error('CrmService not initialized');
        
        try {
            const response = await this.apiMethods.putMethod(`/crm/customers/${customerId}/`, customerData);
            return response;
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    }

    /**
     * Actualización parcial de un cliente
     * @param {number} customerId - ID del cliente
     * @param {Object} customerData - Datos a actualizar
     * @returns {Promise} Cliente actualizado
     */
    async patchCustomer(customerId, customerData) {
        if (!this.apiMethods) throw new Error('CrmService not initialized');
        
        try {
            const response = await this.apiMethods.patchMethod(`/crm/customers/${customerId}/`, customerData);
            return response;
        } catch (error) {
            console.error('Error patching customer:', error);
            throw error;
        }
    }

    /**
     * Eliminar un cliente
     * @param {number} customerId - ID del cliente
     * @returns {Promise} Respuesta de eliminación
     */
    async deleteCustomer(customerId) {
        if (!this.apiMethods) throw new Error('CrmService not initialized');
        
        try {
            const response = await this.apiMethods.deleteMethod(`/crm/customers/${customerId}/`);
            return response;
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    }

    // ========================================
    // Gestión de Contactos
    // ========================================

    /**
     * Agregar un contacto al historial del cliente
     * @param {number} customerId - ID del cliente
     * @param {Object} contactData - Datos del contacto
     * @returns {Promise} Respuesta del contacto agregado
     */
    async addContact(customerId, contactData) {
        if (!this.apiMethods) throw new Error('CrmService not initialized');
        
        try {
            const response = await this.apiMethods.postMethod(`/crm/customers/${customerId}/contact/`, contactData);
            return response;
        } catch (error) {
            console.error('Error adding contact:', error);
            throw error;
        }
    }

    /**
     * Obtener historial de contactos de un cliente
     * @param {number} customerId - ID del cliente
     * @returns {Promise} Historial de contactos
     */
    async getContactHistory(customerId) {
        if (!this.apiMethods) throw new Error('CrmService not initialized');
        
        try {
            const response = await this.apiMethods.getMethod(`/crm/customers/${customerId}/contact_history/`);
            return response;
        } catch (error) {
            console.error('Error fetching contact history:', error);
            throw error;
        }
    }

    /**
     * Actualizar un contacto específico
     * @param {number} customerId - ID del cliente
     * @param {Object} contactData - Datos del contacto actualizado
     * @returns {Promise} Respuesta de actualización
     */
    async updateContact(customerId, contactData) {
        if (!this.apiMethods) throw new Error('CrmService not initialized');
        
        try {
            const response = await this.apiMethods.patchMethod(`/crm/customers/${customerId}/update_contact/`, contactData);
            return response;
        } catch (error) {
            console.error('Error updating contact:', error);
            throw error;
        }
    }

    /**
     * Eliminar un contacto específico
     * @param {number} customerId - ID del cliente
     * @param {number} contactIndex - Índice del contacto a eliminar
     * @returns {Promise} Respuesta de eliminación
     */
    async deleteContact(customerId, contactIndex) {
        if (!this.apiMethods) throw new Error('CrmService not initialized');
        
        try {
            const response = await this.apiMethods.deleteMethod(
                `/crm/customers/${customerId}/delete_contact/`,
                { contact_index: contactIndex }
            );
            return response;
        } catch (error) {
            console.error('Error deleting contact:', error);
            throw error;
        }
    }

    // ========================================
    // Estadísticas y Búsquedas
    // ========================================

    /**
     * Obtener estadísticas de clientes
     * @returns {Promise} Estadísticas del CRM
     */
    async getStats() {
        if (!this.apiMethods) throw new Error('CrmService not initialized');
        
        try {
            const response = await this.apiMethods.getMethod('/crm/customers/stats/');
            return response;
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    }

    /**
     * Búsqueda avanzada de clientes
     * @param {Object} searchParams - Parámetros de búsqueda
     * @returns {Promise} Resultados de búsqueda
     */
    async searchCustomers(searchParams) {
        if (!this.apiMethods) throw new Error('CrmService not initialized');
        
        try {
            const response = await this.apiMethods.getMethod('/crm/customers/search/', searchParams);
            return response;
        } catch (error) {
            console.error('Error searching customers:', error);
            throw error;
        }
    }

    /**
     * Actualizar información de compras de un cliente
     * @param {number} customerId - ID del cliente
     * @param {Object} purchaseData - Datos de compra
     * @returns {Promise} Respuesta de actualización
     */
    async updatePurchaseInfo(customerId, purchaseData) {
        if (!this.apiMethods) throw new Error('CrmService not initialized');
        
        try {
            const response = await this.apiMethods.patchMethod(`/crm/customers/${customerId}/update-purchase-info/`, purchaseData);
            return response;
        } catch (error) {
            console.error('Error updating purchase info:', error);
            throw error;
        }
    }

    // ========================================
    // Métodos de utilidad
    // ========================================

    /**
     * Formatear datos de cliente para display
     * @param {Object} customer - Datos del cliente
     * @returns {Object} Cliente formateado (mantiene todos los campos originales)
     */
    formatCustomerForDisplay(customer) {
        // Construir display_name basado en el tipo de cliente
        let displayName = '';
        if (customer.customer_type === 'person') {
            // Para personas: "Nombre Apellido"
            displayName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
        } else {
            // Para empresas: nombre de fantasía o razón social
            displayName = customer.fantasy_name || customer.name || '';
        }

        return {
            ...customer, // Mantener TODOS los campos originales
            display_name: displayName || customer.display_name || 'Sin nombre',
            formatted_total_spent: new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS'
            }).format(customer.total_spent || 0),
            formatted_last_contact: customer.contact_history && customer.contact_history.length > 0
                ? new Date(customer.contact_history[customer.contact_history.length - 1].date).toLocaleDateString('es-AR')
                : 'Sin contacto',
            contacts_count: customer.contact_history ? customer.contact_history.length : 0
        };
    }

    /**
     * Validar datos de cliente antes de enviar
     * @param {Object} customerData - Datos a validar
     * @returns {Object} Resultado de validación
     */
    validateCustomerData(customerData) {
        const errors = [];

        // Validaciones según tipo de cliente
        if (customerData.customer_type === 'person') {
            if (!customerData.first_name) errors.push('Nombre es requerido');
            if (!customerData.last_name) errors.push('Apellido es requerido');
        } else if (customerData.customer_type === 'company') {
            if (!customerData.name) errors.push('Razón social es requerida');
        }

        // Validaciones comunes
        if (!customerData.email) {
            errors.push('Email es requerido');
        } else if (!/\S+@\S+\.\S+/.test(customerData.email)) {
            errors.push('Email no es válido');
        }

        if (customerData.cuit && !/^\d{2}-\d{8}-\d{1}$/.test(customerData.cuit)) {
            errors.push('CUIT debe tener formato XX-XXXXXXXX-X');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// Exportar una instancia singleton
export default new CrmService();