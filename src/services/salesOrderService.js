

class SalesOrderService {
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
    // CRUD de Órdenes de Venta
    // ========================================

    /**
     * Obtener lista de órdenes de venta con filtros opcionales
     * @param {Object} params - Parámetros de filtro (status, sales_channel, customer_id)
     * @returns {Promise} Lista de órdenes de venta
     */
    async getSalesOrders(params = {}) {
        if (!this.apiMethods) throw new Error('SalesOrderService not initialized');
        
        try {
            const response = await this.apiMethods.getMethod('/billing/sales-orders/', params);
            return response;
        } catch (error) {
            console.error('Error fetching sales orders:', error);
            throw error;
        }
    }

    /**
     * Obtener detalles de una orden de venta específica
     * @param {number} saleId - ID de la orden de venta
     * @returns {Promise} Detalles de la orden
     */
    async getSalesOrder(saleId) {
        if (!this.apiMethods) throw new Error('SalesOrderService not initialized');
        
        try {
            const response = await this.apiMethods.getMethod(`/billing/sales-orders/${saleId}/`);
            return response;
        } catch (error) {
            console.error('Error fetching sales order details:', error);
            throw error;
        }
    }

    /**
     * Crear una nueva orden de venta
     * @param {Object} saleData - Datos de la orden de venta
     * @returns {Promise} Orden creada
     */
    async createSalesOrder(saleData) {
        if (!this.apiMethods) throw new Error('SalesOrderService not initialized');
        
        try {
            // Transformar datos del formulario al formato esperado por la API
            const transformedData = this.transformFormDataToApi(saleData);
            
            const response = await this.apiMethods.postMethod('/billing/sales-orders/', transformedData);
            return response;
        } catch (error) {
            console.error('Error creating sales order:', error);
            throw error;
        }
    }

    /**
     * Actualizar una orden de venta existente
     * @param {number} saleId - ID de la orden
     * @param {Object} saleData - Datos a actualizar
     * @returns {Promise} Orden actualizada
     */
    async updateSalesOrder(saleId, saleData) {
        if (!this.apiMethods) throw new Error('SalesOrderService not initialized');
        
        try {
            // Transformar datos del formulario al formato esperado por la API
            const transformedData = this.transformFormDataToApi(saleData);
            
            const response = await this.apiMethods.putMethod(`/billing/sales-orders/${saleId}/`, transformedData);
            return response;
        } catch (error) {
            console.error('Error updating sales order:', error);
            throw error;
        }
    }

    /**
     * Actualización parcial de una orden de venta
     * @param {number} saleId - ID de la orden
     * @param {Object} saleData - Datos a actualizar
     * @returns {Promise} Orden actualizada
     */
    async patchSalesOrder(saleId, saleData) {
        if (!this.apiMethods) throw new Error('SalesOrderService not initialized');
        
        try {
            const response = await this.apiMethods.patchMethod(`/billing/sales-orders/${saleId}/`, saleData);
            return response;
        } catch (error) {
            console.error('Error patching sales order:', error);
            throw error;
        }
    }

    /**
     * Eliminar una orden de venta
     * @param {number} saleId - ID de la orden
     * @returns {Promise} Respuesta de eliminación
     */
    async deleteSalesOrder(saleId) {
        if (!this.apiMethods) throw new Error('SalesOrderService not initialized');
        
        try {
            const response = await this.apiMethods.deleteMethod(`/billing/sales-orders/${saleId}/`);
            return response;
        } catch (error) {
            console.error('Error deleting sales order:', error);
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
            customer_id: formData.customer_id,
            sales_channel: formData.sales_channel,
            payment_method: formData.payment_method,
            delivery: formData.with_shipping || false,
            delivery_date: formData.delivery_date,
            deliver_to: formData.deliver_to || '',
            shipping_cost: parseFloat(formData.shipping_cost || 0),
            total_price: parseFloat(formData.total_price || 0),
            taxes: parseFloat(formData.taxes || 0),
            discount: parseFloat(formData.discount || 0),
            description: formData.description || '',
            currency: formData.currency || 'ARS',
            status: formData.status,
            was_payed: formData.was_payed || false,
            transport: formData.transport || '',
            driver: formData.driver || '',
            patent: formData.patent || '',
            branch_origin_id: formData.branch_origin_id || null,
            warehouse_origin_id: formData.warehouse_origin_id || null,
            sales_items: (formData.sales_items || []).map(item => ({
                product: item.product_id,
                product_unit: item.product_unit ? parseInt(item.product_unit) : null,
                quantity: parseInt(item.quantity),
                unit_price: parseFloat(item.unit_price || 0)  
            }))
        };
    }

    /**
     * Formatear orden de venta para display
     * @param {Object} sale - Datos de la orden
     * @returns {Object} Orden formateada
     */
    formatSaleForDisplay(sale) {
        return {
            ...sale,
            formatted_total_price: this.formatCurrency(sale.total_price, sale.currency),
            formatted_shipping_cost: this.formatCurrency(sale.shipping_cost, sale.currency),
            formatted_taxes: this.formatCurrency(sale.taxes, sale.currency),
            formatted_discount: this.formatCurrency(sale.discount, sale.currency),
            formatted_delivery_date: this.formatDate(sale.delivery_date),
            formatted_created_at: this.formatDateTime(sale.created_at),
            formatted_updated_at: this.formatDateTime(sale.updated_at),
            status_label: this.getStatusLabel(sale.status),
            channel_label: this.getChannelLabel(sale.sales_channel),
            payment_status_label: sale.was_payed ? 'Pagado' : 'Pendiente'
        };
    }

    /**
     * Formatear moneda
     * @param {number} amount - Monto
     * @param {string} currency - Código de moneda
     * @returns {string} Monto formateado
     */
    formatCurrency(amount, currency = 'ARS') {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency,
        }).format(amount || 0);
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
     * Obtener etiqueta de canal
     * @param {string} channel - Canal de venta
     * @returns {string} Etiqueta del canal
     */
    getChannelLabel(channel) {
        const channelMap = {
            ecommerce: 'E-commerce',
            storefront: 'Local físico',
            wholesale: 'Mayorista'
        };
        return channelMap[channel] || channel;
    }

    /**
     * Calcular estadísticas de órdenes de venta
     * @param {Array} salesOrders - Lista de órdenes
     * @returns {Object} Estadísticas calculadas
     */
    calculateStats(salesOrders) {
        if (!Array.isArray(salesOrders) || salesOrders.length === 0) {
            return {
                total_sales: 0,
                total_amount: 0,
                pending_sales: 0,
                approved_sales: 0,
                rejected_sales: 0,
                paid_sales: 0,
            };
        }

        return {
            total_sales: salesOrders.length,
            total_amount: salesOrders.reduce((sum, sale) => sum + parseFloat(sale.total_price || 0), 0),
            pending_sales: salesOrders.filter(sale => sale.status === 'pending').length,
            approved_sales: salesOrders.filter(sale => sale.status === 'approved').length,
            rejected_sales: salesOrders.filter(sale => sale.status === 'rejected').length,
            paid_sales: salesOrders.filter(sale => sale.was_payed).length,
        };
    }

    /**
     * Validar datos de orden de venta antes de enviar
     * @param {Object} saleData - Datos a validar
     * @returns {Object} Resultado de validación
     */
    validateSaleData(saleData) {
        const errors = [];

        // Validaciones básicas
        if (!saleData.customer_id) {
            errors.push('Cliente es requerido');
        }

        if (!saleData.payment_method) {
            errors.push('Método de pago es requerido');
        }

        if (!saleData.sales_channel) {
            errors.push('Canal de venta es requerido');
        }

        if (!saleData.status) {
            errors.push('Estado es requerido');
        }

        if (!saleData.delivery_date) {
            errors.push('Fecha de entrega es requerida');
        }

        // Validación de impuestos
        if (saleData.taxes === undefined || saleData.taxes === '') {
            errors.push('Impuestos son requeridos');
        }

        // Validaciones de envío
        if (saleData.with_shipping) {
            if (!saleData.deliver_to || saleData.deliver_to.trim() === '') {
                errors.push('Dirección de entrega es requerida cuando incluye envío');
            }
            if (!saleData.shipping_cost || parseFloat(saleData.shipping_cost) <= 0) {
                errors.push('Costo de envío debe ser mayor a 0 cuando incluye envío');
            }
        }

        // Validación de productos
        if (!saleData.sales_items || saleData.sales_items.length === 0) {
            errors.push('Debe incluir al menos un producto');
        } else {
            saleData.sales_items.forEach((item, index) => {
                if (!item.product_id) {
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
}

// Exportar una instancia singleton
export default new SalesOrderService();
