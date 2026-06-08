"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
    FaBox, 
    FaSearch, 
    FaWarehouse, 
    FaTruck, 
    FaShoppingCart, 
    FaExclamationTriangle,
    FaCheckCircle,
    FaUser,
    FaBuilding,
    FaSpinner,
    FaHistory,
    FaInfoCircle,
    FaDownload,
    FaFileExcel,
    FaUpload
} from "react-icons/fa";
import StockMovementModal from "./StockMovementModal";
import useStockService from "@/services/stockService";
import Pagination from "@/components/ui/Pagination";

export default function StockTable({ onShowAlert }) {
    const [stockData, setStockData] = useState([]);
    const [warehouses, setWarehouses] = useState(["Todos"]);
    const [selectedWarehouse, setSelectedWarehouse] = useState("Todos");
    const [stockStatus, setStockStatus] = useState("Todos");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStockForMovements, setSelectedStockForMovements] = useState(null);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [movements, setMovements] = useState([]);
    const [loadingMovements, setLoadingMovements] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados de exportación e importación
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);
    
    // Ref para input de archivo
    const fileInputRef = useRef(null);
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 5;
    
    const stockService = useStockService();

    // Resetear a página 1 cuando cambia el término de búsqueda
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Cargar stock desde el backend con paginación y búsqueda
    useEffect(() => {
        const fetchStockData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const filters = {
                    page: currentPage,
                    page_size: itemsPerPage
                };
                
                // Agregar búsqueda si existe
                if (searchTerm) {
                    filters.search = searchTerm;
                }
                
                const response = await stockService.getAll(filters);
                
                // La respuesta viene en formato paginado: { count: X, results: [...], next, previous }
                setStockData(response.results || []);
                setTotalCount(response.count || 0);
            } catch (err) {
                console.error('Error al cargar datos de stock:', err);
                setError(err.message || 'Error al cargar la información del stock');
                setStockData([]);
                setTotalCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchStockData();
    }, [currentPage, itemsPerPage, searchTerm]);

    // Filtrar stock localmente por warehouse y estado (búsqueda se hace en backend)
    const getFilteredStock = () => {
        let filtered = stockData.filter(item => {
            const matchesWarehouse = selectedWarehouse === "Todos" || item.location_name === selectedWarehouse;
            
            let matchesStatus = true;
            if (stockStatus !== "Todos") {
                const quantity = item.quantity || 0;
                const safetyStock = item.product_detail?.safety_stock || 0;
                
                if (stockStatus === "Bajo") {
                    matchesStatus = item.is_low_stock === true;
                } else if (stockStatus === "Normal") {
                    matchesStatus = quantity > safetyStock && quantity <= safetyStock * 2;
                } else if (stockStatus === "Alto") {
                    matchesStatus = quantity > safetyStock * 2;
                }
            }
            
            return matchesWarehouse && matchesStatus;
        });

        return filtered;
    };

    // Obtener ubicaciones únicas (de todos los datos de stock, no solo paginados)
    useEffect(() => {
        const fetchAllWarehouses = async () => {
            try {
                // Obtener todos los stocks sin paginación solo para obtener las ubicaciones
                const response = await stockService.getAll({ page_size: 1000 });
                const allStocks = response.results || [];
                const uniqueWarehouses = [...new Set(allStocks.map(item => item.location_name).filter(Boolean))];
                setWarehouses(["Todos", ...uniqueWarehouses]);
            } catch (err) {
                console.error('Error al cargar ubicaciones:', err);
            }
        };

        fetchAllWarehouses();
    }, []);

    // Efecto para obtener Ubicaciones únicos
    useEffect(() => {
        const validStock = Array.isArray(stockData) ? stockData : [];
        const uniqueWarehouses = [...new Set(validStock.map(item => item.location_name).filter(Boolean))];
        setWarehouses(["Todos", ...uniqueWarehouses]);
    }, [stockData]);

    // Cargar movimientos desde el backend
    const loadMovements = async (stockItem) => {
        setLoadingMovements(true);
        try {
            // Obtener movimientos por producto
            const response = await stockService.getMovementsByProduct(stockItem.product);
            const movementsData = response.results || response;
            
            // Filtrar por la ubicación específica si existe warehouse o branch
            let filteredMovements = movementsData;
            if (stockItem.warehouse) {
                filteredMovements = movementsData.filter(m => m.warehouse === stockItem.warehouse);
            } else if (stockItem.branch) {
                filteredMovements = movementsData.filter(m => m.branch === stockItem.branch);
            }
            
            setMovements(Array.isArray(filteredMovements) ? filteredMovements : []);
        } catch (err) {
            console.error('Error al cargar movimientos:', err);
            setMovements([]);
        } finally {
            setLoadingMovements(false);
        }
    };

    // Manejar apertura del modal de movimientos
    const handleViewMovements = async (stockItem) => {
        setSelectedStockForMovements(stockItem);
        setIsMovementModalOpen(true);
        await loadMovements(stockItem);
    };

    // Cerrar modal de movimientos
    const handleCloseMovementModal = () => {
        setIsMovementModalOpen(false);
        setSelectedStockForMovements(null);
        setMovements([]);
    };

    // Funciones de paginación
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        const totalPages = Math.ceil(totalCount / itemsPerPage);
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Exportar stock actual
    const handleExport = async () => {
        try {
            setExporting(true);
            const blob = await stockService.exportData();
            
            // Validar que sea un Blob
            if (!blob || !(blob instanceof Blob)) {
                console.error('Respuesta no es un Blob:', blob);
                throw new Error('La respuesta del servidor no es válida');
            }
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'stock_export.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exportando stock:', error);
            if (onShowAlert) {
                onShowAlert('danger', 'Error al exportar', 'No se pudo exportar el stock. Intenta nuevamente.');
            }
        } finally {
            setExporting(false);
        }
    };

    // Descargar plantilla de ajuste de stock
    const handleDownloadTemplate = async () => {
        try {
            setDownloadingTemplate(true);
            const blob = await stockService.exportTemplate();
            
            // Validar que sea un Blob
            if (!blob || !(blob instanceof Blob)) {
                console.error('Respuesta no es un Blob:', blob);
                throw new Error('La respuesta del servidor no es válida');
            }
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'plantilla_ajuste_stock.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            if (onShowAlert) {
                onShowAlert('success', 'Plantilla descargada', 'La plantilla se descargó correctamente. Complete las columnas "Nueva Cantidad" y "Motivo".');
            }
        } catch (error) {
            console.error('Error descargando plantilla:', error);
            if (onShowAlert) {
                onShowAlert('danger', 'Error al descargar plantilla', 'No se pudo descargar la plantilla. Intenta nuevamente.');
            }
        } finally {
            setDownloadingTemplate(false);
        }
    };

    // Importar ajustes de stock
    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        try {
            setImporting(true);
            const response = await stockService.importData(file);
            
            if (onShowAlert) {
                const hasErrors = response.errors && response.errors.length > 0;
                const errorDetails = hasErrors ? `\n\nErrores encontrados:\n${response.errors.join('\n')}` : '';
                const alertType = hasErrors ? 'warning' : 'success';
                const alertTitle = hasErrors ? 'Ajuste con errores' : 'Ajuste completado';
                
                onShowAlert(
                    alertType, 
                    alertTitle, 
                    `Ajustes creados: ${response.created}${errorDetails}`
                );
            }
            
            // Recargar datos de stock
            const filters = {
                page: currentPage,
                page_size: itemsPerPage
            };
            const newResponse = await stockService.getAll(filters);
            setStockData(newResponse.results || []);
            setTotalCount(newResponse.count || 0);
            
            // Limpiar input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error importando ajustes de stock:', error);
            const errorMsg = error.response?.data?.error || 'Error al importar ajustes de stock';
            
            if (onShowAlert) {
                onShowAlert('danger', 'Error al importar', errorMsg);
            }
        } finally {
            setImporting(false);
        }
    };

    // Obtener stock filtrado para la página actual
    const filteredStock = getFilteredStock();

    // Obtener badge de estado de stock
    const getStockStatusBadge = (currentStock, safetyStock) => {
        if (currentStock <= safetyStock) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <FaExclamationTriangle className="text-xs" />
                    Stock Bajo
                </span>
            );
        } else if (currentStock <= safetyStock * 2) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Stock Normal
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaCheckCircle className="text-xs" />
                    Stock Alto
                </span>
            );
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <FaSpinner className="animate-spin mx-auto h-8 w-8 text-[#18c29c] mb-4" />
                    <p className="text-gray-600">Cargando información de stock...</p>
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Control de Stock</h1>
                    <p className="text-gray-600 mt-1">Gestiona el inventario y ubicaciones</p>
                </div>
                
                {/* Botones de acciones */}
                <div className="flex flex-wrap gap-2">
                    {/* Botón de descargar plantilla */}
                    <button
                        onClick={handleDownloadTemplate}
                        disabled={downloadingTemplate}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors font-medium text-sm"
                        title="Descargar plantilla para ajuste de stock"
                    >
                        {downloadingTemplate ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                <span>Descargando...</span>
                            </>
                        ) : (
                            <>
                                <FaFileExcel />
                                <span>Plantilla</span>
                            </>
                        )}
                    </button>

                    {/* Botón de exportar CSV */}
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition-colors font-medium text-sm"
                        title="Exportar datos actuales de stock a CSV"
                    >
                        {exporting ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                <span>Exportando...</span>
                            </>
                        ) : (
                            <>
                                <FaDownload />
                                <span>Exportar</span>
                            </>
                        )}
                    </button>

                    {/* Botón de importar ajustes */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg transition-colors font-medium text-sm"
                        title="Importar ajustes de stock desde plantilla"
                    >
                        {importing ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                <span>Importando...</span>
                            </>
                        ) : (
                            <>
                                <FaUpload />
                                <span>Importar</span>
                            </>
                        )}
                    </button>

                    {/* Input oculto para archivo */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleImport}
                        className="hidden"
                    />
                </div>
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
                                placeholder="Buscar por producto, SKU, ubicación o proveedor..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                                value={searchTerm}
                                autoFocus={true}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filtro de ubicación */}
                    <div className="lg:w-56">
                        <select
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                            value={selectedWarehouse}
                            onChange={(e) => setSelectedWarehouse(e.target.value)}
                        >
                            {warehouses.map(warehouse => (
                                <option key={warehouse} value={warehouse}>
                                    {warehouse === "Todos" ? "Todas las ubicaciones" : warehouse}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro de estado de stock */}
                    <div className="lg:w-48">
                        <select
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                            value={stockStatus}
                            onChange={(e) => setStockStatus(e.target.value)}
                        >
                            <option value="Todos">Todos los estados</option>
                            <option value="Bajo">Stock Bajo</option>
                            <option value="Normal">Stock Normal</option>
                            <option value="Alto">Stock Alto</option>
                        </select>
                    </div>
                </div>

                {/* Resultados */}
                <div className="mt-4 text-sm text-gray-600">
                    {searchTerm ? (
                        <>Encontrados {totalCount} productos para "{searchTerm}"</>
                    ) : (
                        <>Mostrando {filteredStock.length} de {totalCount} productos en esta página</>
                    )}
                </div>
            </div>

            {/* Tabla de stock */}
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
                                    Stock Físico
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <span className="inline-flex items-center gap-2">
                                        Ventas Pendientes
                                        <FaInfoCircle
                                            color="#FFCA1A"
                                            title="Cantidad de unidades de ordenes de venta aprobadas pendientes a entregar"
                                        />
                                    </span>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <span className="inline-flex items-center gap-2">
                                        Compras Pendientes
                                        <FaInfoCircle
                                            color="#FFCA1A"
                                            title="Cantidad de unidades de ordenes de compra aprobadas pendientes a recibir"
                                        />
                                    </span>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Ubicación
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Stock Seguridad
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Proveedor
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStock.map((item) => {
                                const quantity = item.quantity || 0;
                                const safetyStock = item.product_detail?.safety_stock || 0;
                                const isLowStock = item.is_low_stock || false;
                                
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-[#18c29c] to-[#15a884] rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <FaBox className="text-white text-lg" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate ">
                                                        {item.product_detail?.description || 'Sin descripción'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        SKU: {item.product_detail?.sku || 'N/A'}
                                                    </p>
                                                    {getStockStatusBadge(quantity, safetyStock)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-gray-900">{quantity}</p>
                                                <p className="text-xs text-gray-500">{item.product_detail?.base_unit_name || 'unidades'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FaShoppingCart className="text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">{item.sale_order_pending || 0}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FaTruck className="text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">{item.purchase_order_pending || 0}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FaWarehouse className="text-gray-400 text-sm" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {item.location_name || 'Sin asignar'}
                                                    </p>
                                                    {item.warehouse_detail?.address && (
                                                        <p className="text-xs text-gray-500">{item.warehouse_detail.address}, {item.warehouse_detail.city}</p>
                                                    )}
                                                    {item.branch_detail?.address && (
                                                        <p className="text-xs text-gray-500">{item.branch_detail.address}, {item.branch_detail.city}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-gray-900">{safetyStock}</p>
                                                <p className="text-xs text-gray-500">mínimo</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FaBuilding className="text-gray-400 text-sm" />
                                                <div>
                                                    <p className="text-sm text-gray-500 whitespace-nowrap">{(item.product_detail?.supplier.length > 18 ? item.product_detail?.supplier.slice(0, 18) + '...' : item.product_detail?.supplier) || 'Sin proveedor'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => handleViewMovements(item)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#18c29c] hover:bg-[#15a884] text-white rounded-lg transition-colors text-sm font-medium"
                                                    title="Ver historial de movimientos"
                                                >
                                                    <FaHistory className="text-sm" />
                                                    <span className="hidden xl:inline">Movimientos</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Cards Mobile */}
                <div className="lg:hidden">
                    <div className="divide-y divide-gray-200">
                        {filteredStock.map((item) => {
                            const quantity = item.quantity || 0;
                            const safetyStock = item.product_detail?.safety_stock || 0;
                            const isLowStock = item.is_low_stock || false;
                            
                            return (
                                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="w-16 h-16 bg-gradient-to-br from-[#18c29c] to-[#15a884] rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FaBox className="text-white text-xl" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                {item.product_detail?.description || 'Sin descripción'}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                SKU: {item.product_detail?.sku || 'N/A'}
                                            </p>
                                            <div className="mt-2">
                                                {getStockStatusBadge(quantity, safetyStock)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Stock actual:</span>
                                            <p className="font-semibold text-gray-900 text-lg">{quantity} {item.product_detail?.base_unit_name || 'uni.'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Stock seguridad:</span>
                                            <p className="font-medium text-gray-900">{safetyStock} {item.product_detail?.base_unit_name || 'uni.'}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-500 flex items-center gap-1">
                                                <FaWarehouse className="text-xs" /> Ubicación:
                                            </span>
                                            <p className="font-medium text-gray-900">
                                                {item.location_name || 'Sin asignar'}
                                            </p>
                                            {item.warehouse_detail?.address && (
                                                <p className="text-xs text-gray-500 mt-1">{item.warehouse_detail.address}, {item.warehouse_detail.city}</p>
                                            )}
                                            {item.branch_detail?.address && (
                                                <p className="text-xs text-gray-500 mt-1">{item.branch_detail.address}, {item.branch_detail.city}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Botón de movimientos en mobile */}
                                    <div className="mt-4">
                                        <button
                                            onClick={() => handleViewMovements(item)}
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#18c29c] hover:bg-[#15a884] text-white rounded-lg transition-colors text-sm font-medium"
                                        >
                                            <FaHistory />
                                            Ver historial de movimientos
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Estado vacío */}
                {filteredStock.length === 0 && (
                    <div className="text-center py-12">
                        <FaBox className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos en stock</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm
                                ? `No se encontraron productos que coincidan con "${searchTerm}".`
                                : selectedWarehouse !== "Todos" || stockStatus !== "Todos"
                                ? "No se encontraron productos con los filtros aplicados."
                                : "El inventario está vacío."}
                        </p>
                    </div>
                )}
            </div>

            {/* Paginación */}
            <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalCount / itemsPerPage)}
                totalCount={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onPreviousPage={handlePreviousPage}
                onNextPage={handleNextPage}
                itemName="productos"
            />

            {/* Modal de movimientos */}
            <StockMovementModal
                isOpen={isMovementModalOpen}
                onClose={handleCloseMovementModal}
                stockItem={selectedStockForMovements}
                movements={movements}
                loading={loadingMovements}
            />
        </div>
    );
}
