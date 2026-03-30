import useApiMethods from '@/hooks/useApiMethods';

class PurchaseOrderService {
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
    // CRUD de Órdenes de Compra
    // ========================================

    /**
     * Obtener lista de órdenes de compra con filtros opcionales
     * @param {Object} params - Parámetros de filtro (status, supplier_id, was_buyed)
     * @returns {Promise} Lista de órdenes de compra
     */
    async getPurchaseOrders(params = {}) {
        if (!this.apiMethods) throw new Error('PurchaseOrderService not initialized');
        
        try {
            const response = await this.apiMethods.getMethod('/billing/purchase-orders/', params);
            console.log('Purchase orders response:', response);
            return response;
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
            throw error;
        }
    }

    /**
     * Obtener detalles de una orden de compra específica
     * @param {number} purchaseId - ID de la orden de compra
     * @returns {Promise} Detalles de la orden
     */
    async getPurchaseOrder(purchaseId) {
        if (!this.apiMethods) throw new Error('PurchaseOrderService not initialized');
        
        try {
            const response = await this.apiMethods.getMethod(`/billing/purchase-orders/${purchaseId}/`);
            return response;
        } catch (error) {
            console.error('Error fetching purchase order details:', error);
            throw error;
        }
    }

    /**
     * Crear una nueva orden de compra
     * @param {Object} purchaseData - Datos de la orden de compra
     * @returns {Promise} Orden creada
     */
    async createPurchaseOrder(purchaseData) {
        if (!this.apiMethods) throw new Error('PurchaseOrderService not initialized');
        
        try {
            // Transformar datos del formulario al formato esperado por la API
            const transformedData = this.transformFormDataToApi(purchaseData);
            console.log('Transformed data for creating purchase order:', transformedData);
            const response = await this.apiMethods.postMethod('/billing/purchase-orders/', transformedData);
            return response;
        } catch (error) {
            console.error('Error creating purchase order:', error);
            throw error;
        }
    }

    /**
     * Actualizar una orden de compra existente
     * @param {number} purchaseId - ID de la orden
     * @param {Object} purchaseData - Datos a actualizar
     * @returns {Promise} Orden actualizada
     */
    async updatePurchaseOrder(purchaseId, purchaseData) {
        if (!this.apiMethods) throw new Error('PurchaseOrderService not initialized');
        
        try {
            // Transformar datos del formulario al formato esperado por la API
            const transformedData = this.transformFormDataToApi(purchaseData);
            
            const response = await this.apiMethods.putMethod(`/billing/purchase-orders/${purchaseId}/`, transformedData);
            return response;
        } catch (error) {
            console.error('Error updating purchase order:', error);
            throw error;
        }
    }

    /**
     * Actualización parcial de una orden de compra
     * @param {number} purchaseId - ID de la orden
     * @param {Object} purchaseData - Datos a actualizar
     * @returns {Promise} Orden actualizada
     */
    async patchPurchaseOrder(purchaseId, purchaseData) {
        if (!this.apiMethods) throw new Error('PurchaseOrderService not initialized');
        
        try {
            const response = await this.apiMethods.patchMethod(`/billing/purchase-orders/${purchaseId}/`, purchaseData);
            return response;
        } catch (error) {
            console.error('Error patching purchase order:', error);
            throw error;
        }
    }

    /**
     * Eliminar una orden de compra
     * @param {number} purchaseId - ID de la orden
     * @returns {Promise} Respuesta de eliminación
     */
    async deletePurchaseOrder(purchaseId) {
        if (!this.apiMethods) throw new Error('PurchaseOrderService not initialized');
        
        try {
            const response = await this.apiMethods.deleteMethod(`/billing/purchase-orders/${purchaseId}/`);
            return response;
        } catch (error) {
            console.error('Error deleting purchase order:', error);
            throw error;
        }
    }

    // ========================================
    // Métodos de utilidad
    // ========================================

    /**
     * Transformar datos del formulario al formato de la API
     * @param {Object} formData - Datos del formulario
     * @returns {Object} Datos transformados para la API
     */
    transformFormDataToApi(formData) {
        return {
            supplier_id: formData.supplier?.id || formData.supplier_id,
            comment: formData.comment || undefined,
            payment_method: formData.payment_method,
            delivery_date: formData.delivery_date,
            total_price: parseFloat(formData.total_price || 0),
            description: formData.description || '',
            status: formData.status || 'pending',
            was_payed: formData.was_payed || false,
            received: formData.received || false,
            received_date: formData.received_date || null,
            transport: formData.transport || '',
            driver: formData.driver || '',
            patent: formData.patent || '',
            currency: formData.currency || 'ARS',
            taxes: parseFloat(formData.taxes || 0),
            discount: parseFloat(formData.discount || 0),
            shipping_cost: parseFloat(formData.shipping_cost || 0),
            warehouse_destination_id: formData.warehouse_destination || null,
            branch_destination_id: formData.branch_destination || null,
            comments: formData.comments || [],
            items: (formData.items || []).map(item => ({
                product: item.product?.id || item.product_id,
                product_unit: item.product_unit ? parseInt(item.product_unit) : null,
                quantity: parseInt(item.quantity),
                unit_price: parseFloat(item.unit_price || 0)
            }))
        };
    }

    /**
     * Formatear orden de compra para display
     * @param {Object} purchase - Datos de la orden
     * @returns {Object} Orden formateada
     */
    formatPurchaseForDisplay(purchase) {
        return {
            ...purchase,
            formatted_total_price: this.formatCurrency(purchase.total_price, purchase.currency),
            formatted_shipping_cost: this.formatCurrency(purchase.shipping_cost, purchase.currency),
            formatted_taxes: this.formatCurrency(purchase.taxes, purchase.currency),
            formatted_discount: this.formatCurrency(purchase.discount, purchase.currency),
            formatted_delivery_date: this.formatDate(purchase.delivery_date),
            formatted_created_at: this.formatDateTime(purchase.created_at),
            formatted_updated_at: this.formatDateTime(purchase.updated_at),
            status_label: this.getStatusLabel(purchase.status),
            payed_status_label: purchase.was_payed ? 'Sí' : 'No',
            received_status_label: purchase.received ? 'Sí' : 'No',
            formatted_received_date: this.formatDate(purchase.received_date)
        };
    }

    /**
     * Formatear moneda
     * @param {number} amount - Monto
     * @param {string} currency - Código de moneda
     * @returns {string} Monto formateado
     */
    formatCurrency(amount, currency = 'ARS') {
        const value = parseFloat(amount);
        if (isNaN(value)) return '$0.00';
        
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency,
        }).format(value);
    }

    /**
     * Formatear fecha
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} Fecha formateada
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-AR');
    }

    /**
     * Formatear fecha y hora
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} Fecha y hora formateada
     */
    formatDateTime(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('es-AR');
    }

    /**
     * Obtener etiqueta de estado
     * @param {string} status - Estado de la orden
     * @returns {string} Etiqueta del estado
     */
    getStatusLabel(status) {
        const statusMap = {
            pending: 'Pendiente',
            approved: 'Aprobado',
            rejected: 'Rechazado'
        };
        return statusMap[status] || status;
    }

    /**
     * Calcular estadísticas de órdenes de compra
     * @param {Array} purchaseOrders - Lista de órdenes
     * @returns {Object} Estadísticas calculadas
     */
    calculateStats(purchaseOrders) {
        if (!Array.isArray(purchaseOrders) || purchaseOrders.length === 0) {
            return {
                total: 0,
                total_amount: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                buyed: 0,
            };
        }

        return {
            total: purchaseOrders.length,
            total_amount: purchaseOrders.reduce((sum, purchase) => sum + parseFloat(purchase.total_price || 0), 0),
            pending: purchaseOrders.filter(purchase => purchase.status === 'pending').length,
            approved: purchaseOrders.filter(purchase => purchase.status === 'approved').length,
            rejected: purchaseOrders.filter(purchase => purchase.status === 'rejected').length,
            payed: purchaseOrders.filter(purchase => purchase.was_payed).length,
            received: purchaseOrders.filter(purchase => purchase.received).length,
        };
    }

    /**
     * Validar datos de orden de compra antes de enviar
     * @param {Object} purchaseData - Datos a validar
     * @returns {Object} Resultado de validación
     */
    validatePurchaseData(purchaseData) {
        const errors = [];

        // Validaciones básicas
        if (!purchaseData.supplier && !purchaseData.supplier_id) {
            errors.push('Proveedor es requerido');
        }

        if (!purchaseData.payment_method) {
            errors.push('Método de pago es requerido');
        }

        if (!purchaseData.delivery_date) {
            errors.push('Fecha de entrega es requerida');
        }

        // Validación de productos
        if (!purchaseData.items || purchaseData.items.length === 0) {
            errors.push('Debe incluir al menos un producto');
        } else {
            purchaseData.items.forEach((item, index) => {
                if (!item.product && !item.product_id) {
                    errors.push(`Producto ${index + 1}: debe seleccionar un producto`);
                }
                if (!item.quantity || parseInt(item.quantity) <= 0) {
                    errors.push(`Producto ${index + 1}: cantidad debe ser mayor a 0`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Calcular total de la orden de compra
     * @param {Object} purchaseData - Datos de la orden
     * @returns {number} Total calculado
     */
    calculateTotal(purchaseData) {
        const subtotal = (purchaseData.items || []).reduce((sum, item) => {
            return sum + (parseInt(item.quantity || 0) * parseFloat(item.unit_price || 0));
        }, 0);

        const taxes = parseFloat(purchaseData.taxes || 0);
        const discount = parseFloat(purchaseData.discount || 0);
        const shippingCost = parseFloat(purchaseData.shipping_cost || 0);

        return subtotal + taxes + shippingCost - discount;
    }
}

// Exportar una instancia singleton
export default new PurchaseOrderService();
