import useApiMethods from '@/hooks/useApiMethods';

// Service para manejar operaciones relacionadas con productos
const useProductService = () => {
    const { getMethod, postMethod, putMethod, deleteMethod } = useApiMethods();

    const productService = {
        // Obtener todos los productos
        getAllProducts: async (filters = {}) => {
            try {
                const params = new URLSearchParams();
                
                if (filters.page) params.append('page', filters.page);
                if (filters.page_size) params.append('page_size', filters.page_size);
                if (filters.search) params.append('search', filters.search);
                if (filters.category) params.append('category', filters.category);
                if (filters.status) params.append('status', filters.status);
                if (filters.supplier) params.append('supplier', filters.supplier);
                if (filters.all) params.append('all', filters.all);
                
                const queryString = params.toString();
                const url = queryString ? `/products/?${queryString}` : '/products/';
                
                const response = await getMethod(url);
                console.log('Productos obtenidos:', response);
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

        // Eliminar un producto (eliminación lógica - descontinuar)
        deleteProduct: async (id) => {
            try {
                const response = await deleteMethod(`/products/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al eliminar producto:', error);
                throw error;
            }
        },

        // Eliminar permanentemente un producto (eliminación física)
        permanentDeleteProduct: async (id) => {
            try {
                const response = await deleteMethod(`/products/${id}/permanent_delete/`);
                return response;
            } catch (error) {
                console.error('Error al eliminar permanentemente producto:', error);
                throw error;
            }
        },

        // Reactivar un producto descontinuado
        reactivateProduct: async (id) => {
            try {
                const response = await postMethod(`/products/${id}/reactivate/`);
                return response;
            } catch (error) {
                console.error('Error al reactivar producto:', error);
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
        },

        // PRODUCT UNITS - Unidades de conversión de productos
        // Obtener todas las unidades de un producto
        getProductUnits: async (productId) => {
            try {
                const response = await getMethod(`/productunits/?product=${productId}`);
                const unitsArray = Array.isArray(response) ? response : 
                                  (response && response.results) ? response.results :
                                  (response && response.data) ? response.data : [];
                return unitsArray;
            } catch (error) {
                console.error('Error al obtener unidades del producto:', error);
                throw error;
            }
        },

        // Obtener todas las unidades de conversión
        getAllProductUnits: async () => {
            try {
                const response = await getMethod('/productunits/');
                return response;
            } catch (error) {
                console.error('Error al obtener unidades de productos:', error);
                throw error;
            }
        },

        // Obtener una unidad de producto por ID
        getProductUnitById: async (id) => {
            try {
                const response = await getMethod(`/productunits/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al obtener unidad de producto:', error);
                throw error;
            }
        },

        // Crear una nueva unidad de producto
        createProductUnit: async (unitData) => {
            try {
                const response = await postMethod('/productunits/', unitData);
                return response;
            } catch (error) {
                console.error('Error al crear unidad de producto:', error);
                throw error;
            }
        },

        // Actualizar una unidad de producto
        updateProductUnit: async (id, unitData) => {
            try {
                const response = await putMethod(`/productunits/${id}/`, unitData);
                return response;
            } catch (error) {
                console.error('Error al actualizar unidad de producto:', error);
                throw error;
            }
        },

        // Eliminar una unidad de producto
        deleteProductUnit: async (id) => {
            try {
                const response = await deleteMethod(`/productunits/${id}/`);
                return response;
            } catch (error) {
                console.error('Error al eliminar unidad de producto:', error);
                throw error;
            }
        },

        // ============ PRODUCT UNITS IMPORT/EXPORT ============
        
        // Exportar plantilla Excel vacía para importación de unidades
        exportProductUnitsTemplate: async () => {
            try {
                const response = await getMethod('/productunits/export_template/', {}, true, true);
                return response;
            } catch (error) {
                console.error('Error al exportar plantilla de unidades:', error);
                throw error;
            }
        },

        // Exportar unidades actuales a CSV
        exportProductUnits: async () => {
            try {
                const response = await getMethod('/productunits/export/', {}, true, true);
                return response;
            } catch (error) {
                console.error('Error al exportar unidades:', error);
                throw error;
            }
        },

        // Importar unidades desde Excel
        importProductUnits: async (file) => {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const response = await postMethod('/productunits/import_data/', formData, true, true);
                return response;
            } catch (error) {
                console.error('Error al importar unidades:', error);
                throw error;
            }
        },

        // Subir imagen de producto
        uploadProductImage: async (productId, imageFile, slot = 'image_1') => {
            try {
                const formData = new FormData();
                formData.append('image', imageFile);
                formData.append('slot', slot);
                
                const response = await postMethod(`/products/${productId}/upload_image/`, formData, true, true);
                return response;
            } catch (error) {
                console.error('Error al subir imagen:', error);
                throw error;
            }
        },

        // Eliminar imagen de producto
        deleteProductImage: async (productId, slot = 'image_1') => {
            try {
                const response = await deleteMethod(`/products/${productId}/delete_image/?slot=${slot}`);
                return response;
            } catch (error) {
                console.error('Error al eliminar imagen:', error);
                throw error;
            }
        },

        // ============ IMPORT/EXPORT ============
        
        // Exportar plantilla Excel vacía para importación
        exportTemplate: async () => {
            try {
                const response = await getMethod('/products/export_template/', {}, true, true);
                return response;
            } catch (error) {
                console.error('Error al exportar plantilla:', error);
                throw error;
            }
        },

        // Exportar datos actuales a CSV
        exportData: async () => {
            try {
                const response = await getMethod('/products/export/', {}, true, true);
                return response;
            } catch (error) {
                console.error('Error al exportar productos:', error);
                throw error;
            }
        },

        // Importar productos desde Excel
        importData: async (file) => {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const response = await postMethod('/products/import_data/', formData, true, true);
                return response;
            } catch (error) {
                console.error('Error al importar productos:', error);
                throw error;
            }
        }
    };

  return productService;
};

export default useProductService;