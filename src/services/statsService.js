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
    async getStatsOverview() {
        if (!this.apiMethods) throw new Error('StatsService not initialized');
        
        try {
            const response = await this.apiMethods.getMethod('/billing/stats/overview/');
            return response;
        } catch (error) {
            console.error('Error fetching stats overview:', error);
            throw error;
        }
    }

    /**
     * Obtener datos del gráfico de ventas
     * @param {string} period - 'week', 'month', o 'year'
     * @returns {Promise} Datos del gráfico
     */
    async getSalesChart(period = 'week') {
        if (!this.apiMethods) throw new Error('StatsService not initialized');
        
        try {
            const response = await this.apiMethods.getMethod('/billing/stats/sales-chart/', { period });
            return response;
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
    async getTopProducts(limit = 6) {
        if (!this.apiMethods) throw new Error('StatsService not initialized');
        
        try {
            const response = await this.apiMethods.getMethod('/billing/stats/top-products/', { limit });
            return response;
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
    async getSalesByChannel() {
        if (!this.apiMethods) throw new Error('StatsService not initialized');
        
        try {
            const response = await this.apiMethods.getMethod('/billing/stats/sales-by-channel/');
            return response;
        } catch (error) {
            console.error('Error fetching sales by channel:', error);
            throw error;
        }
    }

    /**
     * Obtener resumen de órdenes por estado
     * @returns {Promise} Resumen de órdenes
     */
    async getOrderStatusSummary() {
        if (!this.apiMethods) throw new Error('StatsService not initialized');
        
        try {
            const response = await this.apiMethods.getMethod('/billing/stats/order-status/');
            return response;
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
