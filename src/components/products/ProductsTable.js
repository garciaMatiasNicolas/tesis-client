"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FaBoxes, FaEdit, FaTrash, FaSearch, FaFilter, FaSpinner, FaDownload, FaUpload, FaFileExcel } from "react-icons/fa";
import { formatPrice, formatDate } from "@/utils/formatData";
import useProductService from "@/services/productService";
import Pagination from "@/components/ui/Pagination";

const ITEMS_PER_PAGE = 5;

export default function ProductsTable({ 
    onDeleteProduct, 
    onReactivateProduct,
    onShowAlert
}) {
    const fileInputRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryMap, setCategoryMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    
    // Estados de importación/exportación
    const [importing, setImporting] = useState(false);
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);
    const [exporting, setExporting] = useState(false);
    
    const productService = useProductService();
    const filtersRef = useRef({ search: '', category: '' });

    // Debounce del término de búsqueda (500ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Efecto 1: Detectar cambios de filtros y resetear página a 1
    useEffect(() => {
        const filtersChanged = 
            filtersRef.current.search !== debouncedSearchTerm || 
            filtersRef.current.category !== selectedCategoryId;
        
        if (filtersChanged && currentPage !== 1) {
            filtersRef.current = { search: debouncedSearchTerm, category: selectedCategoryId };
            setCurrentPage(1);
        } else {
            filtersRef.current = { search: debouncedSearchTerm, category: selectedCategoryId };
        }
    }, [debouncedSearchTerm, selectedCategoryId, currentPage]);

    // Efecto 2: Cargar productos desde el backend con paginación
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const filters = {
                    page: currentPage,
                    page_size: ITEMS_PER_PAGE
                };
                
                // Agregar búsqueda si existe (usar debouncedSearchTerm)
                if (debouncedSearchTerm.trim()) {
                    filters.search = debouncedSearchTerm.trim();
                }
                
                // Agregar categoría si se ha seleccionado
                if (selectedCategoryId) {
                    filters.category = selectedCategoryId;
                }
                
                const response = await productService.getAllProducts(filters);
                
                // La respuesta viene en formato paginado: { count: X, results: [...], next, previous }
                setProducts(response.results || []);
                setTotalCount(response.count || 0);
            } catch (err) {
                console.error('Error al cargar productos:', err);
                setError(err.message || 'Error al cargar los productos');
                setProducts([]);
                setTotalCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage, debouncedSearchTerm, selectedCategoryId]);

    // Cargar categorías
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await productService.getAllCategories();
                if (categoriesData && Array.isArray(categoriesData)) {
                    setCategories(categoriesData);
                    
                    // Crear mapeo de ID a nombre
                    const map = {};
                    categoriesData.forEach(cat => {
                        map[cat.id] = cat.name;
                    });
                    setCategoryMap(map);
                }
            } catch (err) {
                console.error('Error al cargar categorías:', err);
            }
        };

        fetchCategories();
    }, []);

    // Los productos ya vienen filtrados del backend, no filtrar localmente

    // Descargar plantilla Excel
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Descargar plantilla Excel
    const handleDownloadTemplate = async () => {
        try {
            setDownloadingTemplate(true);
            const blob = await productService.exportTemplate();
            
            // Validar que sea un Blob
            if (!blob || !(blob instanceof Blob)) {
                console.error('Respuesta no es un Blob:', blob);
                throw new Error('La respuesta del servidor no es válida');
            }
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'plantilla_productos.xlsx';
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
    
    // Exportar productos actuales
    const handleExport = async () => {
        try {
            setExporting(true);
            const blob = await productService.exportData();
            
            // Validar que sea un Blob
            if (!blob || !(blob instanceof Blob)) {
                console.error('Respuesta no es un Blob:', blob);
                throw new Error('La respuesta del servidor no es válida');
            }
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'productos_export.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exportando productos:', error);
            if (onShowAlert) {
                onShowAlert('danger', 'Error al exportar', 'No se pudieron exportar los productos. Intenta nuevamente.');
            }
        } finally {
            setExporting(false);
        }
    };
    
    // Importar productos desde Excel
    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        try {
            setImporting(true);
            const response = await productService.importData(file);
            
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
            
            // Recargar productos
            const filters = {
                page: currentPage,
                page_size: ITEMS_PER_PAGE
            };
            const newResponse = await productService.getAllProducts(filters);
            if (newResponse && newResponse.results) {
                setProducts(newResponse.results);
                setTotalCount(newResponse.count || 0);
            }
            
            // Limpiar input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error importando productos:', error);
            const errorMsg = error.response?.data?.error || 'Error al importar productos';
            
            if (onShowAlert) {
                onShowAlert('danger', 'Error al importar', errorMsg);
            }
        } finally {
            setImporting(false);
        }
    };

    // Obtener productos filtrados para la página actual
    const filteredProducts = products;

    // Badge de stock
    const getStockBadge = (stock) => {
        if (stock <= 5) {
            return <span className="px-2 py-1 text-xs text-center font-medium bg-red-100 text-red-800 rounded-full">Bajo</span>;
        } else if (stock <= 15) {
            return <span className="px-2 py-1 text-xs text-center font-medium bg-yellow-100 text-yellow-800 rounded-full">Medio</span>;
        } else {
            return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Alto</span>;
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <FaSpinner className="animate-spin mx-auto h-8 w-8 text-[#18c29c] mb-4" />
                    <p className="text-gray-600">Cargando productos...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="text-red-600">⚠️</div>
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Error al cargar los datos</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="ml-auto bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Botones de importación/exportación */}
            <div className="flex flex-wrap gap-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleImport}
                    className="hidden"
                    disabled={importing}
                />
                
                <button
                    onClick={handleDownloadTemplate}
                    disabled={downloadingTemplate}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors font-medium text-sm"
                    title="Descargar plantilla Excel con catálogos de referencia"
                >
                    {downloadingTemplate ? (
                        <>
                            <FaSpinner className="animate-spin" />
                            <span>Descargando...</span>
                        </>
                    ) : (
                        <>
                            <FaFileExcel />
                            <span>Descargar Plantilla</span>
                        </>
                    )}
                </button>

                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition-colors font-medium text-sm"
                    title="Exportar datos actuales a CSV"
                >
                    {exporting ? (
                        <>
                            <FaSpinner className="animate-spin" />
                            <span>Exportando...</span>
                        </>
                    ) : (
                        <>
                            <FaDownload />
                            <span>Exportar CSV</span>
                        </>
                    )}
                </button>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg transition-colors font-medium text-sm"
                    title="Importar productos desde Excel"
                >
                    {importing ? (
                        <>
                            <FaSpinner className="animate-spin" />
                            <span>Importando...</span>
                        </>
                    ) : (
                        <>
                            <FaUpload />
                            <span>Importar Excel</span>
                        </>
                    )}
                </button>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Barra de búsqueda */}
                    <div className="flex-1">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                autoFocus="on"
                                placeholder="Buscar por SKU, descripción o categoría..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-gray-900"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filtro de categoría */}
                    <div className="lg:w-64">
                        <select
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-gray-900"
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Resultados */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <span>
                        Mostrando {filteredProducts.length} de {totalCount} productos en esta página
                    </span>
                    <span className="text-[#18c29c] font-medium">
                        Stock total: {products.reduce((sum, p) => sum + (p.stock_total || 0), 0)} unidades
                    </span>
                </div>
            </div>

            {/* Tabla de productos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabla Desktop */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Producto
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Categoría
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Precio
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Proveedor
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#18c29c] to-[#15a884] rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FaBoxes className="text-white text-lg" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {product.description 
                                                    ? (product.description.length > 15 
                                                        ? product.description.substring(0, 15) + '...' 
                                                        : product.description)
                                                    : 'Sin descripción'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                SKU: {product.sku || 'Sin SKU'}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {product.category?.name || 'Sin categoría'}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {product.subcategory?.name || 'Sin subcategoría'}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formatPrice(product.price || 0)}
                                        </p>
                                        <p className="text-xs text-gray-500 whitespace-nowrap">
                                            Costo: {formatPrice(product.cost_price || 0)}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-900">{product.supplier?.name || 'Sin proveedor'}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-900">{product.created_at ? formatDate(product.created_at) : 'Sin fecha'}</p>
                                    <p className="text-xs text-gray-500">Actualizado: {product.updated_at ? formatDate(product.updated_at) : 'Sin fecha'}</p>
                                </td>
                                <td className="px-6 py-4">
                                    {product.status === 'discontinued' ? (
                                        <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">Descontinuado</span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Activo</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {product.status === 'discontinued' ? (
                                            <button
                                                onClick={() => onReactivateProduct(product)}
                                                className="text-gray-400 hover:text-green-600 transition-colors p-1"
                                                title="Reactivar producto"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <>
                                                <Link
                                                    href={`/products/edit/${product.id}`}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </Link>
                                                <button 
                                                    onClick={() => onDeleteProduct(product)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>

                {/* Cards Mobile */}
                <div className="lg:hidden">
                    <div className="divide-y divide-gray-200">
                        {filteredProducts.map((product) => (
                        <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#18c29c] to-[#15a884] rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FaBoxes className="text-white text-xl" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                {product.description 
                                                    ? (product.description.length > 12 
                                                        ? product.description.substring(0, 12) + '...' 
                                                        : product.description)
                                                    : 'Sin descripción'}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                SKU: {product.sku || 'Sin SKU'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-2">
                                            {product.status === 'discontinued' ? (
                                                <button
                                                    onClick={() => onReactivateProduct(product)}
                                                    className="text-gray-400 hover:text-green-600 transition-colors p-1"
                                                    title="Reactivar producto"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <>
                                                    <Link
                                                        href={`/products/${product.id}/edit`}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                                    >
                                                        <FaEdit className="text-sm" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => onDeleteProduct(product)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                    >
                                                        <FaTrash className="text-sm" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {product.category?.name || 'Sin categoría'}
                                        </span>
                                        {getStockBadge(product.stock_total || 0)}
                                    </div>
                                    
                                    <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <span className="text-gray-500">Precio:</span>
                                            <p className="font-semibold text-gray-900">{formatPrice(product.price || 0)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Stock:</span>
                                            <p className="font-semibold text-gray-900">{product.stock_total || 0} unidades</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Proveedor:</span>
                                            <p className="font-medium text-gray-900">{product.supplier?.name || 'Sin proveedor'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Creado:</span>
                                            <p className="font-medium text-gray-900">{product.created_at ? formatDate(product.created_at) : 'Sin fecha'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>

                {/* Estado vacío */}
                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <FaBoxes className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || selectedCategory !== "Todas"
                                ? "No se encontraron productos con los filtros aplicados."
                                : "No se encontraron productos para mostrar."}
                        </p>
                    </div>
                )}
            </div>

            {/* Paginación */}
            <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
                totalCount={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
                onPreviousPage={handlePreviousPage}
                onNextPage={handleNextPage}
                itemName="productos"
            />
        </div>
    );
}
