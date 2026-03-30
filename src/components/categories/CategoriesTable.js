"use client";
import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaSearch, FaFolder, FaTags } from 'react-icons/fa';
import CategoriesModal from './CategoriesModal';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';

export default function CategoriesTable({
    categories = [],
    subcategories = [],
    loading = false,
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    onCreateSubcategory,
    onUpdateSubcategory,
    onDeleteSubcategory
}) {
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'subcategories'
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [modalType, setModalType] = useState('category'); // 'category' or 'subcategory'
    const [editingItem, setEditingItem] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filtrar categorías
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtrar subcategorías
    const filteredSubcategories = subcategories.filter(subcat =>
        subcat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Obtener nombre de categoría por ID
    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'Sin categoría';
    };

    // Abrir modal para crear
    const handleCreate = (type) => {
        setModalType(type);
        setModalMode('create');
        setEditingItem(null);
        setShowModal(true);
    };

    // Abrir modal para editar
    const handleEdit = (item, type) => {
        setModalType(type);
        setModalMode('edit');
        setEditingItem(item);
        setShowModal(true);
    };

    // Manejar envío del modal
    const handleModalSubmit = async (data) => {
        if (modalType === 'category') {
            if (modalMode === 'create') {
                return await onCreateCategory(data);
            } else {
                return await onUpdateCategory(editingItem.id, data);
            }
        } else {
            if (modalMode === 'create') {
                return await onCreateSubcategory(data);
            } else {
                return await onUpdateSubcategory(editingItem.id, data);
            }
        }
    };

    // Abrir modal de eliminación
    const handleDeleteClick = (item, type) => {
        setItemToDelete({ ...item, type });
        setShowDeleteModal(true);
    };

    // Confirmar eliminación
    const confirmDelete = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        try {
            if (itemToDelete.type === 'category') {
                await onDeleteCategory(itemToDelete);
            } else {
                await onDeleteSubcategory(itemToDelete);
            }
            setShowDeleteModal(false);
            setItemToDelete(null);
        } catch (err) {
            console.error('Error eliminando:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    // Cancelar eliminación
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    // Loading state
    if (loading && categories.length === 0 && subcategories.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <FaSpinner className="animate-spin mx-auto h-8 w-8 text-[#18c29c] mb-4" />
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Categorías y Subcategorías</h1>
                    <p className="text-gray-600 mt-1">Gestiona la organización de tus productos</p>
                </div>
            </div>

            {/* Tabs y búsqueda */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6" style={{maxWidth: "1600px"}}>
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Tabs */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                activeTab === 'categories'
                                    ? 'bg-white text-[#18c29c] shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <FaFolder className="text-sm" />
                            Categorías
                        </button>
                        <button
                            onClick={() => setActiveTab('subcategories')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                activeTab === 'subcategories'
                                    ? 'bg-white text-[#18c29c] shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <FaTags className="text-sm" />
                            Subcategorías
                        </button>
                    </div>

                    {/* Búsqueda */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Botón crear */}
                    <button
                        onClick={() => handleCreate(activeTab === 'categories' ? 'category' : 'subcategory')}
                        className="inline-flex items-center gap-2 bg-[#18c29c] text-white px-4 py-2 rounded-lg hover:bg-[#15a884] transition-colors font-medium shadow-sm whitespace-nowrap"
                    >
                        <FaPlus className="text-sm" />
                        {activeTab === 'categories' ? 'Nueva Categoría' : 'Nueva Subcategoría'}
                    </button>
                </div>

                {/* Contador */}
                <div className="mt-4 text-sm text-gray-600">
                    Mostrando {activeTab === 'categories' ? filteredCategories.length : filteredSubcategories.length} de{' '}
                    {activeTab === 'categories' ? categories.length : subcategories.length}{' '}
                    {activeTab === 'categories' ? 'categorías' : 'subcategorías'}
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{maxWidth: "1600px"}}>
                {/* Tabla Desktop */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Nombre
                                </th>
                                {activeTab === 'subcategories' && (
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Categoría
                                    </th>
                                )}
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {activeTab === 'categories' ? (
                                filteredCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            #{category.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FaFolder className="text-[#18c29c]" />
                                                <span className="text-sm font-medium text-gray-900">{category.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(category, 'category')}
                                                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                                                    title="Editar"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(category, 'category')}
                                                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredSubcategories.map((subcategory) => (
                                    <tr key={subcategory.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            #{subcategory.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FaTags className="text-[#18c29c]" />
                                                <span className="text-sm font-medium text-gray-900">{subcategory.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {getCategoryName(subcategory.category)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(subcategory, 'subcategory')}
                                                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                                                    title="Editar"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(subcategory, 'subcategory')}
                                                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Vista Mobile */}
                <div className="md:hidden divide-y divide-gray-200">
                    {activeTab === 'categories' ? (
                        filteredCategories.map((category) => (
                            <div key={category.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <FaFolder className="text-[#18c29c] text-xl" />
                                        <div>
                                            <p className="font-medium text-gray-900">{category.name}</p>
                                            <p className="text-sm text-gray-500">ID: #{category.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(category, 'category')}
                                            className="text-blue-600 hover:text-blue-800 p-2"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(category, 'category')}
                                            className="text-red-600 hover:text-red-800 p-2"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        filteredSubcategories.map((subcategory) => (
                            <div key={subcategory.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <FaTags className="text-[#18c29c] text-xl" />
                                        <div>
                                            <p className="font-medium text-gray-900">{subcategory.name}</p>
                                            <p className="text-xs text-gray-500">ID: #{subcategory.id}</p>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                                                {getCategoryName(subcategory.category)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(subcategory, 'subcategory')}
                                            className="text-blue-600 hover:text-blue-800 p-2"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(subcategory, 'subcategory')}
                                            className="text-red-600 hover:text-red-800 p-2"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Estado vacío */}
                {((activeTab === 'categories' && filteredCategories.length === 0) ||
                  (activeTab === 'subcategories' && filteredSubcategories.length === 0)) && (
                    <div className="text-center py-12">
                        {activeTab === 'categories' ? <FaFolder className="mx-auto h-12 w-12 text-gray-400" /> : <FaTags className="mx-auto h-12 w-12 text-gray-400" />}
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            {searchTerm ? 'No se encontraron resultados' : `No hay ${activeTab === 'categories' ? 'categorías' : 'subcategorías'}`}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm
                                ? 'Intenta con otros términos de búsqueda'
                                : `Comienza agregando tu primera ${activeTab === 'categories' ? 'categoría' : 'subcategoría'}`}
                        </p>
                        {!searchTerm && (
                            <div className="mt-6">
                                <button
                                    onClick={() => handleCreate(activeTab === 'categories' ? 'category' : 'subcategory')}
                                    className="inline-flex items-center gap-2 bg-[#18c29c] text-white px-4 py-2 rounded-lg hover:bg-[#15a884] transition-colors text-sm font-medium"
                                >
                                    <FaPlus className="text-sm" />
                                    {activeTab === 'categories' ? 'Nueva Categoría' : 'Nueva Subcategoría'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de crear/editar */}
            <CategoriesModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingItem(null);
                }}
                onSubmit={handleModalSubmit}
                mode={modalMode}
                type={modalType}
                item={editingItem}
                categories={categories}
            />

            {/* Modal de confirmación de eliminación */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                itemName={itemToDelete?.name}
                itemType={itemToDelete?.type === 'category' ? 'categoría' : 'subcategoría'}
                isDeleting={isDeleting}
            />
        </div>
    );
}