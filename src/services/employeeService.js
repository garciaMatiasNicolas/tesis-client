import useApiMethods from '@/hooks/useApiMethods';

// Service para manejar operaciones relacionadas con empleados
const useEmployeeService = () => {
    const { getMethod, postMethod, putMethod, deleteMethod } = useApiMethods();

    const employeeService = {
        // Obtener todos los empleados con paginación y filtros
        getAllEmployees: async (filters = {}) => {
            try {
                const params = new URLSearchParams();
                
                if (filters.page) params.append('page', filters.page);
                if (filters.page_size) params.append('page_size', filters.page_size);
                if (filters.search) params.append('search', filters.search);
                if (filters.store) params.append('store', filters.store);
                if (filters.branch) params.append('branch', filters.branch);
                if (filters.position) params.append('position', filters.position);
                
                const queryString = params.toString();
                const url = queryString ? `/employees/?${queryString}` : '/employees/';
                
                const response = await getMethod(url);
                return response;
            } catch (error) {
                console.error('Error al obtener empleados:', error);
                throw error;
            }
        },

        // Obtener un empleado por ID
        getEmployeeById: async (id) => {
            try {
                const response = await getMethod(`/employees/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al obtener empleado:', error);
                throw error;
            }
        },

        // Obtener empleados por sucursal
        getEmployeesByBranch: async (branchId) => {
            try {
                const response = await getMethod(`/employees/by_branch/?branch_id=${branchId}`);
                return response;
            } catch (error) {
                console.error('Error al obtener empleados por sucursal:', error);
                throw error;
            }
        },

        // Crear un nuevo empleado
        createEmployee: async (employeeData) => {
            try {
                const response = await postMethod('/employees/', employeeData);
                return response;
            } catch (error) {
                console.error('Error al crear empleado:', error);
                throw error;
            }
        },

        // Actualizar un empleado
        updateEmployee: async (id, employeeData) => {
            try {
                const response = await putMethod(`/employees/${id}/`, employeeData);
                return response;
            } catch (error) {
                console.error('Error al actualizar empleado:', error);
                throw error;
            }
        },

        // Eliminar un empleado
        deleteEmployee: async (id) => {
            try {
                const response = await deleteMethod(`/employees/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al eliminar empleado:', error);
                throw error;
            }
        },
    };

    return employeeService;
};

export default useEmployeeService;
