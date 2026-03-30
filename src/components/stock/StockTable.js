"use client";
import React, { useState, useEffect } from "react";
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
    FaInfoCircle
} from "react-icons/fa";
import StockMovementModal from "./StockMovementModal";
import useStockService from "@/services/stockService";

export default function StockTable({ 
    stockData = [], 
    loading = false, 
    error = null,
    searchTerm = "",
    onSearchChange
}) {
    const [filteredStock, setFilteredStock] = useState([]);
    const [warehouses, setWarehouses] = useState(["Todos"]);
    const [selectedWarehouse, setSelectedWarehouse] = useState("Todos");
    const [stockStatus, setStockStatus] = useState("Todos");
    const [selectedStockForMovements, setSelectedStockForMovements] = useState(null);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [movements, setMovements] = useState([]);
    const [loadingMovements, setLoadingMovements] = useState(false);
    
    const stockService = useStockService();

    // Efecto para filtrar stock
    useEffect(() => {
        const validStock = Array.isArray(stockData) ? stockData : [];
       
        let filtered = validStock.filter(item => {
            const matchesSearch = (item.product_detail?.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (item.product_detail?.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (item.location_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (item.warehouse_detail?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                 (item.branch_detail?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            
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
            
            return matchesSearch && matchesWarehouse && matchesStatus;
        });

        setFilteredStock(filtered);
    }, [stockData, searchTerm, selectedWarehouse, stockStatus]);

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
                                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
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
                    Mostrando {filteredStock.length} de {Array.isArray(stockData) ? stockData.length : 0} productos
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
                                                    <p className="text-sm font-medium text-gray-900 truncate">
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
                                        <td className="px-6 py-4">
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
                                                    <p className="text-sm text-gray-500">{item.product_detail?.supplier || 'Sin proveedor'}</p>
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
                            {searchTerm || selectedWarehouse !== "Todos" || stockStatus !== "Todos"
                                ? "No se encontraron productos con los filtros aplicados."
                                : "El inventario está vacío."}
                        </p>
                    </div>
                )}
            </div>

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
