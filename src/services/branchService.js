import useApiMethods from '@/hooks/useApiMethods';

// Service para manejar operaciones relacionadas con sucursales
const useBranchService = () => {
    const { getMethod, postMethod, putMethod, patchMethod, deleteMethod } = useApiMethods();

    const branchService = {
        // Obtener todas las sucursales
        getAllBranches: async () => {
            try {
                const response = await getMethod('/branches/');
                // Normalizar respuesta a array
                const branchesArray = Array.isArray(response) ? response : 
                                     (response && response.results) ? response.results :
                                     (response && response.data) ? response.data : [];
                return branchesArray;
            } catch (error) {
                console.error('Error al obtener sucursales:', error);
                throw error;
            }
        },

        // Obtener una sucursal por ID
        getBranchById: async (id) => {
            try {
                const response = await getMethod(`/branches/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al obtener sucursal:', error);
                throw error;
            }
        },

        // Crear una nueva sucursal
        createBranch: async (branchData) => {
            try {
                const response = await postMethod('/branches/', branchData);
                return response;
            } catch (error) {
                console.error('Error al crear sucursal:', error);
                throw error;
            }
        },

        // Actualizar una sucursal (PUT completo)
        updateBranch: async (id, branchData) => {
            try {
                const response = await putMethod(`/branches/${id}/`, branchData);
                return response;
            } catch (error) {
                console.error('Error al actualizar sucursal:', error);
                throw error;
            }
        },

        // Actualizar parcialmente una sucursal (PATCH)
        partialUpdateBranch: async (id, branchData) => {
            try {
                const response = await patchMethod(`/branches/${id}/`, branchData);
                return response;
            } catch (error) {
                console.error('Error al actualizar parcialmente sucursal:', error);
                throw error;
            }
        },

        // Eliminar una sucursal
        deleteBranch: async (id) => {
            try {
                const response = await deleteMethod(`/branches/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al eliminar sucursal:', error);
                throw error;
            }
        }
    };

    return branchService;
};

export default useBranchService;
