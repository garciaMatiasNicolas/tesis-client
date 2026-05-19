"use client";
import CategoriesTable from '@/components/categories/CategoriesTable';
import SideBar from '@/components/ui/SideBar';
import Alert from '@/components/ui/Alert';
import useApiMethods from '@/hooks/useApiMethods';
import React from 'react';

const CategoriesPage = () => {
    const { postMethod, deleteMethod, getMethod, patchMethod } = useApiMethods();
    const [categories, setCategories] = React.useState([]);
    const [subcategories, setSubcategories] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [alert, setAlert] = React.useState(null);

    // Función para mostrar alertas
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        // Auto-ocultar después de 5 segundos para alertas de éxito
        if (type === 'success') {
            setTimeout(() => setAlert(null), 5000);
        }
    };

    // Cargar categorías y subcategorías al montar el componente
    React.useEffect(() => {
        loadCategories();
        loadSubcategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await getMethod('/categories/');
            const categoriesArray = Array.isArray(response) ? response : 
                                   (response && response.results) ? response.results :
                                   (response && response.data) ? response.data : [];
            setCategories(categoriesArray);
        } catch (err) {
            console.error('Error cargando categorías:', err);
            showAlert('danger', 'Error al cargar categorías', 'No se pudieron cargar las categorías.');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const loadSubcategories = async () => {
        try {
            const response = await getMethod('/subcategories/');
            const subcategoriesArray = Array.isArray(response) ? response : 
                                      (response && response.results) ? response.results :
                                      (response && response.data) ? response.data : [];
            setSubcategories(subcategoriesArray);
        } catch (err) {
            console.error('Error cargando subcategorías:', err);
            setSubcategories([]);
        }
    };

    // Manejar creación de categoría
    const handleCreateCategory = async (categoryData) => {
        try {
            setLoading(true);
            const response = await postMethod('/categories/', categoryData);
            
            if (response) {
                setCategories(prev => [response, ...prev]);
                showAlert('success', 'Categoría creada', 'La categoría se ha creado exitosamente.');
                return { success: true, data: response };
            }
        } catch (err) {
            console.error('Error creando categoría:', err);
            
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                let errorMessage = '';
                
                if (errorData.name) {
                    errorMessage = `Nombre: ${errorData.name.join(', ')}`;
                } else {
                    errorMessage = 'Por favor revisa los datos ingresados.';
                }
                
                showAlert('danger', 'Error de validación', errorMessage);
                return { success: false, error: errorMessage, validationErrors: errorData };
            }
            
            showAlert('danger', 'Error al crear categoría', 'No se pudo crear la categoría.');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Manejar actualización de categoría
    const handleUpdateCategory = async (categoryId, categoryData) => {
        try {
            setLoading(true);
            const response = await patchMethod(`/categories/${categoryId}/`, categoryData);
            
            if (response) {
                setCategories(prev => prev.map(c => c.id === categoryId ? response : c));
                showAlert('success', 'Categoría actualizada', 'La categoría se ha actualizado exitosamente.');
                return { success: true, data: response };
            }
        } catch (err) {
            console.error('Error actualizando categoría:', err);
            
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                let errorMessage = errorData.name ? `Nombre: ${errorData.name.join(', ')}` : 'Por favor revisa los datos ingresados.';
                showAlert('danger', 'Error de validación', errorMessage);
                return { success: false, error: errorMessage, validationErrors: errorData };
            }
            
            showAlert('danger', 'Error al actualizar categoría', 'No se pudo actualizar la categoría.');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Manejar eliminación de categoría
    const handleDeleteCategory = async (category) => {
        try {
            setLoading(true);
            await deleteMethod(`/categories/${category.id}/`);
            
            setCategories(prev => prev.filter(c => c.id !== category.id));
            showAlert('success', 'Categoría eliminada', `La categoría "${category.name}" se ha eliminado exitosamente.`);
            return { success: true };
        } catch (err) {
            console.error('Error eliminando categoría:', err);
            
            let errorMessage = 'No se pudo eliminar la categoría.';
            if (err.response && err.response.data) {
                errorMessage = err.response.data.error || err.response.data.message || errorMessage;
            }
            
            showAlert('danger', 'Error al eliminar categoría', errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Manejar creación de subcategoría
    const handleCreateSubcategory = async (subcategoryData) => {
        try {
            setLoading(true);
            const response = await postMethod('/subcategories/', subcategoryData);
            
            if (response) {
                setSubcategories(prev => [response, ...prev]);
                showAlert('success', 'Subcategoría creada', 'La subcategoría se ha creado exitosamente.');
                return { success: true, data: response };
            }
        } catch (err) {
            console.error('Error creando subcategoría:', err);
            
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                let errorMessage = '';
                
                if (errorData.name) {
                    errorMessage = `Nombre: ${errorData.name.join(', ')}`;
                } else if (errorData.category) {
                    errorMessage = `Categoría: ${errorData.category.join(', ')}`;
                } else {
                    errorMessage = 'Por favor revisa los datos ingresados.';
                }
                
                showAlert('danger', 'Error de validación', errorMessage);
                return { success: false, error: errorMessage, validationErrors: errorData };
            }
            
            showAlert('danger', 'Error al crear subcategoría', 'No se pudo crear la subcategoría.');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Manejar actualización de subcategoría
    const handleUpdateSubcategory = async (subcategoryId, subcategoryData) => {
        try {
            setLoading(true);
            const response = await patchMethod(`/subcategories/${subcategoryId}/`, subcategoryData);
            
            if (response) {
                setSubcategories(prev => prev.map(s => s.id === subcategoryId ? response : s));
                showAlert('success', 'Subcategoría actualizada', 'La subcategoría se ha actualizado exitosamente.');
                return { success: true, data: response };
            }
        } catch (err) {
            console.error('Error actualizando subcategoría:', err);
            
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                let errorMessage = 'Por favor revisa los datos ingresados.';
                if (errorData.name) errorMessage = `Nombre: ${errorData.name.join(', ')}`;
                if (errorData.category) errorMessage = `Categoría: ${errorData.category.join(', ')}`;
                
                showAlert('danger', 'Error de validación', errorMessage);
                return { success: false, error: errorMessage, validationErrors: errorData };
            }
            
            showAlert('danger', 'Error al actualizar subcategoría', 'No se pudo actualizar la subcategoría.');
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Manejar eliminación de subcategoría
    const handleDeleteSubcategory = async (subcategory) => {
        try {
            setLoading(true);
            await deleteMethod(`/subcategories/${subcategory.id}/`);
            
            setSubcategories(prev => prev.filter(s => s.id !== subcategory.id));
            showAlert('success', 'Subcategoría eliminada', `La subcategoría "${subcategory.name}" se ha eliminado exitosamente.`);
            return { success: true };
        } catch (err) {
            console.error('Error eliminando subcategoría:', err);
            
            let errorMessage = 'No se pudo eliminar la subcategoría.';
            if (err.response && err.response.data) {
                errorMessage = err.response.data.error || err.response.data.message || errorMessage;
            }
            
            showAlert('danger', 'Error al eliminar subcategoría', errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            {/* Alert component */}
            {alert && (
                <Alert
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
            
            <SideBar
                onProfile={() => window.location.href = "/profile"}
                onSupport={() => alert("Soporte")}
                onLogout={() => alert("Cerrar sesión")}
            />
            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                <CategoriesTable
                    categories={categories}
                    subcategories={subcategories}
                    loading={loading}
                    onCreateCategory={handleCreateCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onCreateSubcategory={handleCreateSubcategory}
                    onUpdateSubcategory={handleUpdateSubcategory}
                    onDeleteSubcategory={handleDeleteSubcategory}
                />
            </main>
        </div>
    )
}

export default CategoriesPage;