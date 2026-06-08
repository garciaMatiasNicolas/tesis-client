"use client";
import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaStore, FaCalendar, FaWarehouse, FaDownload, FaUpload, FaFileExcel, FaSpinner } from 'react-icons/fa';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import WarehouseModal from './WarehouseModal';
import useWarehouseService from '@/services/warehouseService';

export default function WarehouseTable({ 
    warehouses = [], 
    loading = false, 
    error = null, 
    onDeleteWarehouse,
    onCreateWarehouse,
    onUpdateWarehouse,
    searchTerm = "",
    onSearchChange,
    showActions = true,
    onReload,
    onShowAlert
}) {
    const warehouseService = useWarehouseService();
    const fileInputRef = useRef(null);
    const [filteredWarehouses, setFilteredWarehouses] = useState([]);
    const [stores, setStores] = useState(["Todas"]);
    const [selectedStore, setSelectedStore] = useState("Todas");
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, warehouse: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [warehouseModal, setWarehouseModal] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [importing, setImporting] = useState(false);
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Efecto para filtrar depósitos
    useEffect(() => {
        let filtered = warehouses;

        // Filtrar por término de búsqueda
        if (searchTerm && searchTerm.trim() !== "") {
            filtered = filtered.filter(warehouse =>
                warehouse.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                warehouse.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                warehouse.store?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrar por tienda seleccionada
        if (selectedStore && selectedStore !== "Todas") {
            filtered = filtered.filter(warehouse => 
                warehouse.store?.name === selectedStore
            );
        }

        setFilteredWarehouses(filtered);
    }, [warehouses, searchTerm, selectedStore]);

    // Efecto para obtener tiendas únicas
    useEffect(() => {
        const uniqueStores = ["Todas", ...new Set(warehouses.map(w => w.store?.name).filter(Boolean))];
        setStores(uniqueStores);
    }, [warehouses]);

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Manejar eliminación de depósito
    const handleDeleteWarehouse = (warehouse) => {
        setDeleteModal({ isOpen: true, warehouse });
    };

    const confirmDeleteWarehouse = async () => {
        if (!deleteModal.warehouse || !onDeleteWarehouse) return;
        
        setIsDeleting(true);
        try {
            await onDeleteWarehouse(deleteModal.warehouse);
            closeDeleteModal();
        } catch (error) {
            console.error('Error eliminando depósito:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, warehouse: null });
        setIsDeleting(false);
    };

    // Manejar creación o actualización de depósito
    const handleCreateWarehouse = async (warehouse) => {
        try {
            if (editingWarehouse) {
                // Actualizar depósito existente
                if (onUpdateWarehouse) {
                    const result = await onUpdateWarehouse(editingWarehouse.id, warehouse);
                    if (result && result.success) {
                        handleCloseModal();
                    }
                    return result;
                }
            } else {
                // Crear nuevo depósito
                if (onCreateWarehouse) {
                    const result = await onCreateWarehouse(warehouse);
                    if (result && result.success) {
                        handleCloseModal();
                    }
                    return result;
                }
            }
        } catch (error) {
            console.error('Error en handleCreateWarehouse:', error);
            return { success: false, error: error.message };
        }
    };

    // Manejar edición de depósito
    const handleEditWarehouse = (warehouse) => {
        setEditingWarehouse(warehouse);
        setWarehouseModal(true);
    };

    // Manejar cierre del modal
    const handleCloseModal = () => {
        setWarehouseModal(false);
        setEditingWarehouse(null);
    };
    
    // Descargar plantilla Excel
    const handleDownloadTemplate = async () => {
        try {
            setDownloadingTemplate(true);
            const blob = await warehouseService.exportTemplate();
            
            // Validar que sea un Blob
            if (!blob || !(blob instanceof Blob)) {
                console.error('Respuesta no es un Blob:', blob);
                throw new Error('La respuesta del servidor no es válida');
            }
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'plantilla_depositos.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error descargando plantilla:', error);
            if (onShowAlert) {
                onShowAlert('danger', 'Error al descargar plantilla', 'No se pudo descargar la plantilla Excel. Intenta nuevamente.');
            }
        } finally {
            setDownloadingTemplate(false);
        }
    };
    
    // Exportar depósitos actuales
    const handleExport = async () => {
        try {
            setExporting(true);
            const blob = await warehouseService.exportData();
            
            // Validar que sea un Blob
            if (!blob || !(blob instanceof Blob)) {
                console.error('Respuesta no es un Blob:', blob);
                throw new Error('La respuesta del servidor no es válida');
            }
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'depositos_export.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exportando depósitos:', error);
            if (onShowAlert) {
                onShowAlert('danger', 'Error al exportar', 'No se pudieron exportar los depósitos. Intenta nuevamente.');
            }
        } finally {
            setExporting(false);
        }
    };
    
    // Importar depósitos desde Excel
    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        try {
            setImporting(true);
            const response = await warehouseService.importData(file);
            
            if (onShowAlert) {
                const hasErrors = response.errors && response.errors.length > 0;
                const errorDetails = hasErrors ? `\n\nErrores encontrados:\n${response.errors.join('\n')}` : '';
                const alertType = hasErrors ? 'warning' : 'success';
                const alertTitle = hasErrors ? 'Importación con errores' : 'Importación completada';
                
                onShowAlert(
                    alertType, 
                    alertTitle, 
                    `Creados: ${response.created}, Actualizados: ${response.updated}${errorDetails}`
                );
            }
            
            // Recargar lista de depósitos
            if (onReload) {
                await onReload();
            }
            
            // Limpiar input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error importando depósitos:', error);
            const errorMsg = error.response?.data?.error || 'Error al importar depósitos';
            
            if (onShowAlert) {
                onShowAlert('danger', 'Error al importar', errorMsg);
            }
        } finally {
            setImporting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18c29c]"></div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Depósitos</h1>
                    <p className="text-gray-600 mt-1">
                        Administra los depósitos de tu negocio
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Botones de importación/exportación */}
                    <button
                        onClick={handleDownloadTemplate}
                        disabled={downloadingTemplate}
                        className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm disabled:opacity-50"
                        title="Descargar plantilla Excel con catálogos de referencia"
                    >
                        {downloadingTemplate ? (
                            <><FaSpinner className="mr-2 animate-spin" /> Descargando...</>
                        ) : (
                            <><FaFileExcel className="mr-2" /> Plantilla</>
                        )}
                    </button>
                    
                    <button
                        onClick={handleExport}
                        disabled={exporting || warehouses.length === 0}
                        className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm disabled:opacity-50"
                        title="Exportar datos actuales a CSV"
                    >
                        {exporting ? (
                            <><FaSpinner className="mr-2 animate-spin" /> Exportando...</>
                        ) : (
                            <><FaDownload className="mr-2" /> Exportar</>
                        )}
                    </button>
                    
                    <div className="relative">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleImport}
                            className="hidden"
                            id="warehouse-file-input"
                        />
                        <label
                            htmlFor="warehouse-file-input"
                            className={`inline-flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 cursor-pointer text-sm ${
                                importing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <FaUpload className="mr-2" />
                            {importing ? 'Importando...' : 'Importar'}
                        </label>
                    </div>
                    
                    {showActions && (
                        <button
                            onClick={() => setWarehouseModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-[#18c29c] hover:bg-[#15a884] text-white rounded-lg transition-colors duration-200 shadow-sm"
                        >
                            <FaPlus className="mr-2" />
                            Nuevo Depósito
                        </button>
                    )}
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Búsqueda */}
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, dirección o tienda..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                            className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all duration-200"
                        />
                    </div>

                    {/* Filtro por tienda */}
                    <div className="relative">
                        <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                            className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all duration-200 appearance-none bg-white"
                        >
                            {stores.map((store) => (
                                <option key={store} value={store}>
                                    {store === "Todas" ? "Todas las tiendas" : store}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabla de depósitos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {filteredWarehouses.length === 0 ? (
                    <div className="text-center py-12">
                        <FaWarehouse className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay depósitos</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || selectedStore !== "Todas"
                                ? "No se encontraron depósitos con los filtros aplicados."
                                : "Comienza creando un nuevo depósito."}
                        </p>
                        {showActions && !searchTerm && selectedStore === "Todas" && (
                            <button
                                onClick={() => setWarehouseModal(true)}
                                className="mt-4 inline-flex items-center px-4 py-2 bg-[#18c29c] hover:bg-[#15a884] text-white rounded-lg transition-colors duration-200"
                            >
                                <FaPlus className="mr-2" />
                                Nuevo Depósito
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Depósito
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ubicación
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tienda
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha Creación
                                    </th>
                                    {showActions && (
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredWarehouses.map((warehouse) => (
                                    <tr key={warehouse.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-[#18c29c]/10 rounded-lg flex items-center justify-center">
                                                    <FaWarehouse className="h-6 w-6 text-[#18c29c]" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {warehouse.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                <div className="flex items-start">
                                                    <FaMapMarkerAlt className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium">{warehouse.address || 'N/A'}</p>
                                                        <p className="text-gray-600">{warehouse.city || 'N/A'}, {warehouse.state || 'N/A'}</p>
                                                        <p className="text-gray-500 text-xs">{warehouse.country || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <FaStore className="h-4 w-4 text-gray-400 mr-2" />
                                                {warehouse.store?.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <FaCalendar className="h-4 w-4 text-gray-400 mr-2" />
                                                {formatDate(warehouse.created_at)}
                                            </div>
                                        </td>
                                        {showActions && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEditWarehouse(warehouse)}
                                                    className="text-[#18c29c] hover:text-[#15a884] mr-4 inline-flex items-center transition-colors duration-150"
                                                    title="Editar"
                                                >
                                                    <FaEdit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteWarehouse(warehouse)}
                                                    className="text-red-600 hover:text-red-900 inline-flex items-center transition-colors duration-150"
                                                    title="Eliminar"
                                                >
                                                    <FaTrash className="h-4 w-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Información de resultados */}
            {filteredWarehouses.length > 0 && (
                <div className="text-sm text-gray-600">
                    Mostrando {filteredWarehouses.length} de {warehouses.length} depósito{warehouses.length !== 1 ? 's' : ''}
                </div>
            )}

            {/* Modal de eliminación */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDeleteWarehouse}
                itemName={`Depósito "${deleteModal.warehouse?.name}"`}
                itemType='Depósito'
                productName={deleteModal.warehouse?.name}
                isDeleting={isDeleting}
            />

            {/* Modal de creación/edición */}
            {warehouseModal && (
                <WarehouseModal
                    isOpen={warehouseModal}
                    onClose={handleCloseModal}
                    onSave={handleCreateWarehouse}
                    warehouse={editingWarehouse}
                />
            )}
        </div>
    );
}
