import useApiMethods from '@/hooks/useApiMethods';

// Service para manejar operaciones relacionadas con proveedores
const useSupplierService = () => {
    const { getMethod, postMethod, patchMethod, deleteMethod } = useApiMethods();

    const supplierService = {
        // Obtener todos los proveedores con paginación y filtros
        getAllSuppliers: async (filters = {}) => {
            try {
                const params = new URLSearchParams();
                
                if (filters.page) params.append('page', filters.page);
                if (filters.page_size) params.append('page_size', filters.page_size);
                if (filters.search) params.append('search', filters.search);
                if (filters.country) params.append('country', filters.country);
                if (filters.active) params.append('active', filters.active);
                
                const queryString = params.toString();
                const url = queryString ? `/suppliers/?${queryString}` : '/suppliers/';
                
                const response = await getMethod(url);
                return response;
            } catch (error) {
                console.error('Error al obtener proveedores:', error);
                throw error;
            }
        },

        // Obtener un proveedor por ID
        getSupplierById: async (id) => {
            try {
                const response = await getMethod(`/suppliers/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al obtener proveedor:', error);
                throw error;
            }
        },

        // Crear un nuevo proveedor
        createSupplier: async (supplierData) => {
            try {
                const response = await postMethod('/suppliers/', supplierData);
                return response;
            } catch (error) {
                console.error('Error al crear proveedor:', error);
                throw error;
            }
        },

        // Actualizar un proveedor (PATCH)
        updateSupplier: async (id, supplierData) => {
            try {
                const response = await patchMethod(`/suppliers/${id}/`, supplierData);
                return response;
            } catch (error) {
                console.error('Error al actualizar proveedor:', error);
                throw error;
            }
        },

        // Eliminar un proveedor
        deleteSupplier: async (id) => {
            try {
                const response = await deleteMethod(`/suppliers/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al eliminar proveedor:', error);
                throw error;
            }
        },

        // Exportar plantilla Excel vacía
        exportTemplate: async () => {
            try {
                const response = await getMethod('/suppliers/export_template/', {}, true, true);
                return response;
            } catch (error) {
                console.error('Error al exportar plantilla:', error);
                throw error;
            }
        },

        // Exportar todos los proveedores a Excel
        exportData: async () => {
            try {
                const response = await getMethod('/suppliers/export/', {}, true, true);
                return response;
            } catch (error) {
                console.error('Error al exportar proveedores:', error);
                throw error;
            }
        },

        // Importar proveedores desde Excel
        importData: async (file) => {
            try {
                const formData = new FormData();
                formData.append('file', file);
                
                const response = await postMethod('/suppliers/import_data/', formData, true, true);
                return response;
            } catch (error) {
                console.error('Error al importar proveedores:', error);
                throw error;
            }
        },
    };

    return supplierService;
};

export default useSupplierService;
