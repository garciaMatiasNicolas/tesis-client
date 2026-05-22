class StatsService {
    constructor() {
        // Este service usará el hook useApiMethods, pero necesitamos
        // instanciarlo desde los componentes que lo usen
        this.apiMethods = null;
    }

    // Método para inicializar el service con los métodos API
    initialize(apiMethods) {
        if (apiMethods) {
            this.apiMethods = apiMethods;
        }
    }

    // ========================================
    // Estadísticas del Dashboard
    // ========================================

    /**
     * Obtener métricas principales del dashboard
     * @returns {Promise} Métricas principales
     */
    async getStatsOverview(dateFrom = null, dateTo = null, groupFilter = {}, comparisonMode = 'previous_period') {
        if (!this.apiMethods) throw new Error('StatsService not initialized');

        try {
            const params = { comparison_mode: comparisonMode };
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo)   params.date_to   = dateTo;
            if (groupFilter.categoryId)    params.category_id    = groupFilter.categoryId;
            if (groupFilter.subcategoryId) params.subcategory_id = groupFilter.subcategoryId;
            if (groupFilter.productId)     params.product_id     = groupFilter.productId;
            if (groupFilter.supplierId)    params.supplier_id    = groupFilter.supplierId;
            return await this.apiMethods.getMethod('/billing/stats/overview/', params);
        } catch (error) {
            console.error('Error fetching stats overview:', error);
            throw error;
        }
    }

    async getFilterOptions(categoryId = null, subcategoryId = null) {
        if (!this.apiMethods) throw new Error('StatsService not initialized');

        try {
            const params = {};
            if (categoryId)    params.category_id    = categoryId;
            if (subcategoryId) params.subcategory_id = subcategoryId;
            return await this.apiMethods.getMethod('/billing/stats/filter-options/', params);
        } catch (error) {
            console.error('Error fetching filter options:', error);
            throw error;
        }
    }

    /**
     * Obtener datos del gráfico de ventas
     * @param {string} period - 'week', 'month', o 'year'
     * @returns {Promise} Datos del gráfico
     */
    async getSalesChart(period = 'month', dateFrom = null, dateTo = null) {
        if (!this.apiMethods) throw new Error('StatsService not initialized');
        
        try {
            const params = { period };
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo)   params.date_to   = dateTo;
            return await this.apiMethods.getMethod('/billing/stats/sales-chart/', params);
        } catch (error) {
            console.error('Error fetching sales chart:', error);
            throw error;
        }
    }

    /**
     * Obtener productos más vendidos
     * @param {number} limit - Cantidad de productos a retornar
     * @returns {Promise} Lista de productos más vendidos
     */
    async getTopProducts(limit = 6, dateFrom = null, dateTo = null, groupFilter = {}) {
        if (!this.apiMethods) throw new Error('StatsService not initialized');

        try {
            const params = { limit };
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo)   params.date_to   = dateTo;
            if (groupFilter.categoryId)    params.category_id    = groupFilter.categoryId;
            if (groupFilter.subcategoryId) params.subcategory_id = groupFilter.subcategoryId;
            if (groupFilter.productId)     params.product_id     = groupFilter.productId;
            if (groupFilter.supplierId)    params.supplier_id    = groupFilter.supplierId;
            return await this.apiMethods.getMethod('/billing/stats/top-products/', params);
        } catch (error) {
            console.error('Error fetching top products:', error);
            throw error;
        }
    }

    /**
     * Obtener alertas de stock bajo
     * @param {number} limit - Cantidad de alertas a retornar
     * @returns {Promise} Lista de alertas de stock
     */
    async getStockAlerts(limit = 10) {
        if (!this.apiMethods) throw new Error('StatsService not initialized');
        
        try {
            const response = await this.apiMethods.getMethod('/billing/stats/stock-alerts/', { limit });
            return response;
        } catch (error) {
            console.error('Error fetching stock alerts:', error);
            throw error;
        }
    }

    /**
     * Obtener distribución de ventas por canal
     * @returns {Promise} Distribución de ventas
     */
    async getSalesByChannel(dateFrom = null, dateTo = null, groupFilter = {}) {
        if (!this.apiMethods) throw new Error('StatsService not initialized');

        try {
            const params = {};
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo)   params.date_to   = dateTo;
            if (groupFilter.categoryId)    params.category_id    = groupFilter.categoryId;
            if (groupFilter.subcategoryId) params.subcategory_id = groupFilter.subcategoryId;
            if (groupFilter.productId)     params.product_id     = groupFilter.productId;
            if (groupFilter.supplierId)    params.supplier_id    = groupFilter.supplierId;
            return await this.apiMethods.getMethod('/billing/stats/sales-by-channel/', params);
        } catch (error) {
            console.error('Error fetching sales by channel:', error);
            throw error;
        }
    }

    async getOrderStatusSummary(dateFrom = null, dateTo = null, groupFilter = {}) {
        if (!this.apiMethods) throw new Error('StatsService not initialized');

        try {
            const params = {};
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo)   params.date_to   = dateTo;
            if (groupFilter.categoryId)    params.category_id    = groupFilter.categoryId;
            if (groupFilter.subcategoryId) params.subcategory_id = groupFilter.subcategoryId;
            if (groupFilter.productId)     params.product_id     = groupFilter.productId;
            if (groupFilter.supplierId)    params.supplier_id    = groupFilter.supplierId;
            return await this.apiMethods.getMethod('/billing/stats/order-status/', params);
        } catch (error) {
            console.error('Error fetching order status summary:', error);
            throw error;
        }
    }

    // ========================================
    // Métodos de utilidad
    // ========================================

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
     * Formatear porcentaje
     * @param {number} value - Valor decimal
     * @returns {string} Porcentaje formateado
     */
    formatPercentage(value) {
        return `${(value * 100).toFixed(1)}%`;
    }

    /**
     * Obtener color para tendencia
     * @param {string} trend - Tipo de tendencia ('up', 'down', 'neutral')
     * @returns {string} Clase de color
     */
    getTrendColor(trend) {
        const colorMap = {
            up: 'text-green-600',
            down: 'text-red-600',
            neutral: 'text-gray-600'
        };
        return colorMap[trend] || 'text-gray-600';
    }

    /**
     * Obtener icono para tendencia
     * @param {string} trend - Tipo de tendencia ('up', 'down', 'neutral')
     * @returns {string} Icono
     */
    getTrendIcon(trend) {
        const iconMap = {
            up: '↑',
            down: '↓',
            neutral: '→'
        };
        return iconMap[trend] || '→';
    }
}

// Exportar una instancia singleton
export default new StatsService();
