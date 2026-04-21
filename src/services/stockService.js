import useApiMethods from '@/hooks/useApiMethods';

// Service para manejar operaciones relacionadas con stock
const useStockService = () => {
    const { getMethod, postMethod } = useApiMethods();

    const stockService = {
        // Obtener todo el stock
        getAll: async (filters = {}) => {
            try {
                const params = new URLSearchParams();
                
                if (filters.product) params.append('product', filters.product);
                if (filters.warehouse) params.append('warehouse', filters.warehouse);
                if (filters.branch) params.append('branch', filters.branch);
                if (filters.low_stock) params.append('low_stock', 'true');
                
                const queryString = params.toString();
                const url = queryString ? `/stock/?${queryString}` : '/stock/';
                
                const response = await getMethod(url);
                return response;
            } catch (error) {
                console.error('Error al obtener stock:', error);
                throw error;
            }
        },

        // Obtener stock por ID
        getById: async (id) => {
            try {
                const response = await getMethod(`/stock/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al obtener stock por ID:', error);
                throw error;
            }
        },

        // Obtener alertas de stock bajo
        getLowStockAlerts: async () => {
            try {
                const response = await getMethod('/stock/low_stock_alert/');
                return response;
            } catch (error) {
                console.error('Error al obtener alertas de stock bajo:', error);
                throw error;
            }
        },

        // Obtener stock filtrado por producto
        getByProduct: async (productId) => {
            try {
                const response = await getMethod(`/stock/?product=${productId}`);
                return response;
            } catch (error) {
                console.error('Error al obtener stock por producto:', error);
                throw error;
            }
        },

        // Obtener stock filtrado por depósito
        getByWarehouse: async (warehouseId) => {
            try {
                const response = await getMethod(`/stock/?warehouse=${warehouseId}`);
                return response;
            } catch (error) {
                console.error('Error al obtener stock por depósito:', error);
                throw error;
            }
        },

        // Obtener stock filtrado por sucursal
        getByBranch: async (branchId) => {
            try {
                const response = await getMethod(`/stock/?branch=${branchId}`);
                return response;
            } catch (error) {
                console.error('Error al obtener stock por sucursal:', error);
                throw error;
            }
        },

        // ============ STOCK MOVEMENTS ============

        // Obtener todos los movimientos de stock
        getAllMovements: async (filters = {}) => {
            try {
                const params = new URLSearchParams();
                
                if (filters.product) params.append('product', filters.product);
                if (filters.warehouse) params.append('warehouse', filters.warehouse);
                if (filters.branch) params.append('branch', filters.branch);
                if (filters.movement_type) params.append('movement_type', filters.movement_type);
                if (filters.status) params.append('status', filters.status);
                if (filters.from_location) params.append('from_location', filters.from_location);
                if (filters.to_location) params.append('to_location', filters.to_location);
                if (filters.sale) params.append('sale', filters.sale);
                if (filters.purchase) params.append('purchase', filters.purchase);
                if (filters.date_from) params.append('date_from', filters.date_from);
                if (filters.date_to) params.append('date_to', filters.date_to);
                if (filters.page) params.append('page', filters.page);
                if (filters.page_size) params.append('page_size', filters.page_size);
                
                const queryString = params.toString();
                const url = queryString ? `/stock-movements/?${queryString}` : '/stock-movements/';
                
                const response = await getMethod(url);
                return response;
            } catch (error) {
                console.error('Error al obtener movimientos de stock:', error);
                throw error;
            }
        },

        // Obtener movimiento por ID
        getMovementById: async (id) => {
            try {
                const response = await getMethod(`/stock-movements/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al obtener movimiento por ID:', error);
                throw error;
            }
        },

        // Obtener movimientos por producto de las ultima semana
        getMovementsByProduct: async (productId) => {
            try {
                const response = await getMethod(`/stock-movements/by_product/?product_id=${productId}&date_from=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&date_to=${new Date().toISOString()}`);
                return response;
            } catch (error) {
                console.error('Error al obtener movimientos por producto:', error);
                throw error;
            }
        },

        // Obtener movimientos por ubicación (warehouse o branch)
        getMovementsByLocation: async (warehouseId = null, branchId = null) => {
            try {
                const params = new URLSearchParams();
                if (warehouseId) params.append('warehouse_id', warehouseId);
                if (branchId) params.append('branch_id', branchId);
                
                const response = await getMethod(`/stock-movements/by_location/?${params.toString()}`);
                return response;
            } catch (error) {
                console.error('Error al obtener movimientos por ubicación:', error);
                throw error;
            }
        },

        // Obtener movimientos recientes
        getRecentMovements: async (limit = 50) => {
            try {
                const response = await getMethod(`/stock-movements/recent/?limit=${limit}`);
                return response;
            } catch (error) {
                console.error('Error al obtener movimientos recientes:', error);
                throw error;
            }
        },

        // Obtener movimientos pendientes
        getPendingMovements: async () => {
            try {
                const response = await getMethod('/stock-movements/pending/');
                return response;
            } catch (error) {
                console.error('Error al obtener movimientos pendientes:', error);
                throw error;
            }
        },

        // Crear movimiento interno de stock
        createInternalMovement: async (movementData) => {
            try {
                const response = await postMethod('/stock-movements/', movementData);
                return response;
            } catch (error) {
                console.error('Error al crear movimiento interno:', error);
                throw error;
            }
        }
    };

    return stockService;
};

export default useStockService;
