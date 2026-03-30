import useApiMethods from '@/hooks/useApiMethods';

// Service para manejar operaciones relacionadas con depósitos
const useWarehouseService = () => {
    const { getMethod, postMethod, putMethod, patchMethod, deleteMethod } = useApiMethods();

    const warehouseService = {
        // Obtener todos los depósitos
        getAllWarehouses: async () => {
            try {
                const response = await getMethod('/warehouses/');
                // Normalizar respuesta a array
                const warehousesArray = Array.isArray(response) ? response : 
                                       (response && response.results) ? response.results :
                                       (response && response.data) ? response.data : [];
                return warehousesArray;
            } catch (error) {
                console.error('Error al obtener depósitos:', error);
                throw error;
            }
        },

        // Obtener un depósito por ID
        getWarehouseById: async (id) => {
            try {
                const response = await getMethod(`/warehouses/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al obtener depósito:', error);
                throw error;
            }
        },

        // Crear un nuevo depósito
        createWarehouse: async (warehouseData) => {
            try {
                const response = await postMethod('/warehouses/', warehouseData);
                return response;
            } catch (error) {
                console.error('Error al crear depósito:', error);
                throw error;
            }
        },

        // Actualizar un depósito (PUT completo)
        updateWarehouse: async (id, warehouseData) => {
            try {
                const response = await putMethod(`/warehouses/${id}/`, warehouseData);
                return response;
            } catch (error) {
                console.error('Error al actualizar depósito:', error);
                throw error;
            }
        },

        // Actualizar parcialmente un depósito (PATCH)
        partialUpdateWarehouse: async (id, warehouseData) => {
            try {
                const response = await patchMethod(`/warehouses/${id}/`, warehouseData);
                return response;
            } catch (error) {
                console.error('Error al actualizar parcialmente depósito:', error);
                throw error;
            }
        },

        // Eliminar un depósito
        deleteWarehouse: async (id) => {
            try {
                const response = await deleteMethod(`/warehouses/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al eliminar depósito:', error);
                throw error;
            }
        },

        // Obtener stock de un depósito
        getWarehouseStock: async (id) => {
            try {
                const response = await getMethod(`/warehouses/${id}/stock/`);
                // Normalizar respuesta a array
                const stockArray = Array.isArray(response) ? response : 
                                  (response && response.results) ? response.results :
                                  (response && response.data) ? response.data : [];
                return stockArray;
            } catch (error) {
                console.error('Error al obtener stock del depósito:', error);
                throw error;
            }
        }
    };

    return warehouseService;
};

export default useWarehouseService;
