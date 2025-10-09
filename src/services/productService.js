import useApiMethods from '@/hooks/useApiMethods';

// Service para manejar operaciones relacionadas con productos
const useProductService = () => {
    const { getMethod, postMethod, putMethod, deleteMethod } = useApiMethods();

    const productService = {
        // Obtener todos los productos
        getAllProducts: async () => {
            try {
                const response = await getMethod('/products/');
                return response;
            } catch (error) {
                console.error('Error al obtener productos:', error);
                throw error;
            }
        },

        // Obtener un producto por ID
        getProductById: async (id) => {
            try {
                const response = await getMethod(`/products/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al obtener producto:', error);
                throw error;
            }
        },

        // Crear un nuevo producto
        createProduct: async (productData) => {
            try {
                const response = await postMethod('/products/', productData);
                return response;
            } catch (error) {
                console.error('Error al crear producto:', error);
                throw error;
            }
        },

        // Actualizar un producto
        updateProduct: async (id, productData) => {
            try {
                const response = await putMethod(`/products/${id}/`, productData);
                return response;
            } catch (error) {
                console.error('Error al actualizar producto:', error);
                throw error;
            }
        },

        // Eliminar un producto
        deleteProduct: async (id) => {
            try {
                const response = await deleteMethod(`/products/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al eliminar producto:', error);
                throw error;
            }
        },

        // Obtener todas las categorías
        getAllCategories: async () => {
            try {
                const response = await getMethod('/categories/');
                return response;
            } catch (error) {
                console.error('Error al obtener categorías:', error);
                throw error;
            }
        },

        // Obtener todas las subcategorías
        getAllSubcategories: async () => {
            try {
                const response = await getMethod('/subcategories/');
                return response;
            } catch (error) {
                console.error('Error al obtener subcategorías:', error);
                throw error;
            }
        },

        // Crear una nueva categoría
        createCategory: async (categoryData) => {
            try {
                const response = await postMethod('/categories/', categoryData);
                return response;
            } catch (error) {
                console.error('Error al crear categoría:', error);
                throw error;
            }
        },

        // Crear una nueva subcategoría
        createSubcategory: async (subcategoryData) => {
            try {
                const response = await postMethod('/subcategories/', subcategoryData);
                return response;
            } catch (error) {
                console.error('Error al crear subcategoría:', error);
                throw error;
            }
        },

        // PROVEEDORES - Asumo que tienes endpoints similares para suppliers
        getAllSuppliers: async () => {
            try {
                const response = await getMethod('/suppliers/'); // Ajustar según tu backend
                const suppliersArray = Array.isArray(response) ? response : 
                                  (response && response.results) ? response.results :
                                  (response && response.data) ? response.data : [];
                return suppliersArray;
            } catch (error) {
                console.error('Error al obtener proveedores:', error);
                throw error;
            }
        },

        createSupplier: async (supplierData) => {
            try {
                const response = await postMethod('/suppliers/', supplierData); // Ajustar según tu backend
                return response;
            } catch (error) {
                console.error('Error al crear proveedor:', error);
                throw error;
            }
        }
    };

  return productService;
};

export default useProductService;