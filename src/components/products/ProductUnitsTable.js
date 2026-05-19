"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaEdit, FaTrash, FaSearch, FaSpinner, FaDownload, FaUpload, FaFileExcel, FaBox } from "react-icons/fa";
import useProductService from "@/services/productService";
import Pagination from "@/components/ui/Pagination";

export default function ProductUnitsTable({ onShowAlert }) {
    const fileInputRef = useRef(null);
    const [productUnits, setProductUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Estados de importación/exportación
    const [importing, setImporting] = useState(false);
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);
    const [exporting, setExporting] = useState(false);
    
    const productService = useProductService();

    // Cargar unidades desde el backend
    useEffect(() => {
        fetchProductUnits();
    }, []);

    const fetchProductUnits = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await productService.getAllProductUnits();
            const unitsArray = Array.isArray(response) ? response : 
                              (response && response.results) ? response.results :
                              (response && response.data) ? response.data : [];
            
            setProductUnits(unitsArray);
        } catch (err) {
            console.error('Error al cargar unidades:', err);
            setError(err.message || 'Error al cargar las unidades de producto');
            setProductUnits([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar unidades LOCALMENTE
    const getFilteredUnits = () => {
        return productUnits.filter(unit => {
            const matchesSearch = 
                (unit.product?.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (unit.product?.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (unit.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            
            return matchesSearch;
        });
    };

    // Paginación
    const filteredUnits = getFilteredUnits();
    const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUnits = filteredUnits.slice(startIndex, startIndex + itemsPerPage);

    // Funciones de paginación
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // ============ IMPORT/EXPORT HANDLERS ============

    // Descargar plantilla Excel
    const handleDownloadTemplate = async () => {
        try {
            setDownloadingTemplate(true);
            const blob = await productService.exportProductUnitsTemplate();
            
            if (!blob || !(blob instanceof Blob)) {
                console.error('Respuesta no es un Blob:', blob);
                throw new Error('La respuesta del servidor no es válida');
            }
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'plantilla_unidades_producto.xlsx';
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
    
    // Exportar unidades actuales
    const handleExport = async () => {
        try {
            setExporting(true);
            const blob = await productService.exportProductUnits();
            
            if (!blob || !(blob instanceof Blob)) {
                console.error('Respuesta no es un Blob:', blob);
                throw new Error('La respuesta del servidor no es válida');
            }
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `unidades_producto_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exportando unidades:', error);
            if (onShowAlert) {
                onShowAlert('danger', 'Error al exportar', 'No se pudieron exportar las unidades. Intenta nuevamente.');
            }
        } finally {
            setExporting(false);
        }
    };
    
    // Importar unidades desde Excel
    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        try {
            setImporting(true);
            const response = await productService.importProductUnits(file);
            
            // Verificar si hubo errores
            const hasErrors = response.errors && response.errors.length > 0;
            let errorDetails = '';
            
            if (hasErrors) {
                errorDetails = '\n\nErrores:\n' + response.errors.join('\n');
            }
            
            if (onShowAlert) {
                onShowAlert(
                    hasErrors ? 'warning' : 'success',
                    hasErrors ? 'Importación completada con errores' : 'Importación exitosa',
                    `Creados: ${response.created || 0}, Actualizados: ${response.updated || 0}${errorDetails}`
                );
            }
            
            // Recargar datos
            fetchProductUnits();
        } catch (error) {
            console.error('Error importando unidades:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error desconocido';
            if (onShowAlert) {
                onShowAlert('danger', 'Error al importar', errorMessage);
            }
        } finally {
            setImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // ============ RENDER ============

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-4xl text-[#18c29c]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Búsqueda */}
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por SKU, producto o unidad..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Botones de importación/exportación */}
                    <div className="flex gap-2">
                        {/* Descargar Plantilla */}
                        <button
                            onClick={handleDownloadTemplate}
                            disabled={downloadingTemplate}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {downloadingTemplate ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Descargando...
                                </>
                            ) : (
                                <>
                                    <FaFileExcel />
                                    Plantilla
                                </>
                            )}
                        </button>

                        {/* Exportar */}
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {exporting ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Exportando...
                                </>
                            ) : (
                                <>
                                    <FaDownload />
                                    Exportar
                                </>
                            )}
                        </button>

                        {/* Importar */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImport}
                            accept=".xlsx,.xls"
                            className="hidden"
                        />
                        <button
                            onClick={triggerFileInput}
                            disabled={importing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {importing ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Importando...
                                </>
                            ) : (
                                <>
                                    <FaUpload />
                                    Importar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            {currentUnits.length === 0 ? (
                <div className="p-12 text-center">
                    <FaBox className="mx-auto text-6xl text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">
                        {searchTerm ? 'No se encontraron unidades con ese criterio' : 'No hay unidades de producto registradas'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        SKU Producto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Producto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Unidad
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Factor Conversión
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentUnits.map((unit) => (
                                    <tr 
                                        key={unit.id} 
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono text-gray-900 font-medium">
                                                {unit.product?.sku || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {unit.product?.description || 'Producto no disponible'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900 font-medium">
                                                {unit.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                × {unit.conversion_factor}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="p-6 border-t border-gray-200">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPreviousPage={handlePreviousPage}
                                onNextPage={handleNextPage}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Info footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                    <span>
                        Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredUnits.length)} de {filteredUnits.length} unidades
                    </span>
                    <span className="text-gray-500">
                        Total registrado: {productUnits.length} unidades
                    </span>
                </div>
            </div>
        </div>
    );
}
