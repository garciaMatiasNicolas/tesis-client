import useApiMethods from '@/hooks/useApiMethods';

// Service para manejar operaciones relacionadas con usuarios
const useUserService = () => {
    const { getMethod, postMethod, putMethod, deleteMethod } = useApiMethods();

    const userService = {
        // Obtener todos los usuarios
        getAllUsers: async () => {
            try {
                const response = await getMethod('/users/');
                return response;
            } catch (error) {
                console.error('Error al obtener usuarios:', error);
                throw error;
            }
        },

        // Obtener información del usuario actual
        getCurrentUser: async () => {
            try {
                const response = await getMethod('/users/me/');
                return response;
            } catch (error) {
                console.error('Error al obtener usuario actual:', error);
                throw error;
            }
        },

        // Obtener un usuario por ID
        getUserById: async (id) => {
            try {
                const response = await getMethod(`/users/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al obtener usuario:', error);
                throw error;
            }
        },

        // Crear un nuevo usuario
        createUser: async (userData) => {
            try {
                const response = await postMethod('/users/', userData);
                return response;
            } catch (error) {
                console.error('Error al crear usuario:', error);
                throw error;
            }
        },

        // Actualizar un usuario
        updateUser: async (id, userData) => {
            try {
                const response = await putMethod(`/users/${id}/`, userData);
                return response;
            } catch (error) {
                console.error('Error al actualizar usuario:', error);
                throw error;
            }
        },

        // Eliminar un usuario
        deleteUser: async (id) => {
            try {
                const response = await deleteMethod(`/users/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                throw error;
            }
        },

        // Verificar si un email existe
        checkEmailExists: async (email) => {
            try {
                const response = await getMethod(`/users/email-exists/?email=${email}`);
                return response;
            } catch (error) {
                console.error('Error al verificar email:', error);
                throw error;
            }
        },

        // Verificar si el usuario es cliente
        verifyIsClient: async () => {
            try {
                const response = await getMethod('/users/verify-is-client/');
                return response;
            } catch (error) {
                console.error('Error al verificar si es cliente:', error);
                throw error;
            }
        },

        // EMPLOYEES - Gestión de empleados
        
        // Obtener todos los empleados
        getAllEmployees: async () => {
            try {
                const response = await getMethod('/employees/');
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
        }
    };

    return userService;
};

export default useUserService;
