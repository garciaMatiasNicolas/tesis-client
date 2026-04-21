"use client";
import React, { useState, useEffect } from 'react';
import { 
    FaSearch, 
    FaArrowUp, 
    FaArrowDown, 
    FaExchangeAlt,
    FaFilter,
    FaCalendarAlt,
    FaBox,
    FaWarehouse,
    FaStore,
    FaShoppingCart,
    FaTruck,
    FaInfoCircle,
    FaSpinner,
    FaChevronLeft,
    FaChevronRight,
    FaEye,
    FaPlus
} from 'react-icons/fa';
import useStockService from '@/services/stockService';
import useApiMethods from '@/hooks/useApiMethods';
import salesOrderService from '@/services/salesOrderService';
import purchaseOrderService from '@/services/purchaseOrderService';
import StockMovementModal from './StockMovementModal';
import SalesDetailModal from '../admin/SalesDetailModal';
import PurchaseDetailModal from '../admin/PurchaseDetailModal';
import CreateInternalMovementModal from './CreateInternalMovementModal';

const StockMovementTable = ({ searchTerm = "", onSearchChange }) => {
    const [movements, setMovements] = useState([]);
    const [filteredMovements, setFilteredMovements] = useState([]);
    const [movementType, setMovementType] = useState("Todos");
    const [status, setStatus] = useState("Todos");
    const [location, setLocation] = useState("Todos");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [locations, setLocations] = useState(["Todos"]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 5;
    
    // Modales
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [selectedMovementForModal, setSelectedMovementForModal] = useState(null);
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [loadingModal, setLoadingModal] = useState(false);
    const [isCreateMovementModalOpen, setIsCreateMovementModalOpen] = useState(false);
    
    const [isInitialized, setIsInitialized] = useState(false);
    
    const stockService = useStockService();
    const apiMethods = useApiMethods();

    // Inicializar servicios
    useEffect(() => {
        if (apiMethods && !isInitialized) {
            salesOrderService.initialize(apiMethods);
            purchaseOrderService.initialize(apiMethods);
            setIsInitialized(true);
        }
    }, [apiMethods, isInitialized]);

    // Cargar movimientos desde el backend con paginación
    useEffect(() => {
        const loadMovements = async () => {
            if (!isInitialized) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const filters = {
                    page: currentPage,
                    page_size: itemsPerPage
                };
                
                // Aplicar filtros al backend
                if (movementType !== "Todos") {
                    filters.movement_type = movementType;
                }
                
                if (status !== "Todos") {
                    filters.status = status;
                }
                
                if (dateFrom) {
                    filters.date_from = dateFrom;
                }
                
                if (dateTo) {
                    filters.date_to = dateTo + 'T23:59:59';
                }
                
                const response = await stockService.getAllMovements(filters);
                
                if (response.results) {
                    setMovements(response.results);
                    setTotalCount(response.count || response.results.length);
                } else {
                    setMovements([]);
                    setTotalCount(0);
                }
            } catch (err) {
                console.error('Error al cargar movimientos:', err);
                setError('No se pudieron cargar los movimientos de stock');
                setMovements([]);
                setTotalCount(0);
            } finally {
                setLoading(false);
            }
        };
        
        loadMovements();
    }, [movementType, status, dateFrom, dateTo, currentPage, isInitialized, itemsPerPage]);

    // Obtener ubicaciones únicas
    useEffect(() => {
        const uniqueLocations = new Set();
        movements.forEach(movement => {
            if (movement.warehouse_detail?.name) {
                uniqueLocations.add(movement.warehouse_detail.name);
            }
            if (movement.branch_detail?.name) {
                uniqueLocations.add(movement.branch_detail.name);
            }
        });
        setLocations(["Todos", ...Array.from(uniqueLocations)]);
    }, [movements]);

    // Filtrar movimientos (filtros locales: búsqueda y ubicación)
    useEffect(() => {
        let filtered = movements.filter(movement => {
            // Filtro por búsqueda
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                (movement.product_detail?.sku || '').toLowerCase().includes(searchLower) ||
                (movement.product_detail?.description || '').toLowerCase().includes(searchLower) ||
                (movement.warehouse_detail?.name || '').toLowerCase().includes(searchLower) ||
                (movement.branch_detail?.name || '').toLowerCase().includes(searchLower) ||
                (movement.note || '').toLowerCase().includes(searchLower);

            // Filtro por ubicación
            const matchesLocation = location === "Todos" || 
                movement.warehouse_detail?.name === location ||
                movement.branch_detail?.name === location;

            return matchesSearch && matchesLocation;
        });

        setFilteredMovements(filtered);
    }, [movements, searchTerm, location]);

    // Obtener badge de tipo de movimiento
    const getMovementTypeBadge = (type) => {
        if (type === 'IN') {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    <FaArrowDown className="w-3 h-3" />
                    Ingreso
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                <FaArrowUp className="w-3 h-3" />
                Egreso
            </span>
        );
    };

    // Obtener badge de estado
    const getStatusBadge = (statusCode) => {
        const statusMap = {
            'PEN': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
            'TRAN': { label: 'En Tránsito', color: 'bg-blue-100 text-blue-800' },
            'REC': { label: 'Recibido', color: 'bg-green-100 text-green-800' },
            'CAN': { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' }
        };

        const statusInfo = statusMap[statusCode] || { label: statusCode, color: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
            </span>
        );
    };

    // Obtener icono y texto para from/to location
    const getLocationInfo = (locationType) => {
        const locationMap = {
            'PUR': { icon: FaShoppingCart, label: 'Compra', color: 'text-blue-600' },
            'SAL': { icon: FaTruck, label: 'Venta', color: 'text-green-600' },
            'WHA': { icon: FaWarehouse, label: 'Depósito', color: 'text-purple-600' },
            'BRA': { icon: FaStore, label: 'Sucursal', color: 'text-orange-600' },
            'MOV': { icon: FaExchangeAlt, label: 'Movimiento', color: 'text-teal-600' }
        };

        const info = locationMap[locationType] || { icon: FaBox, label: locationType, color: 'text-gray-600' };
        const Icon = info.icon;

        return (
            <span className={`inline-flex items-center gap-1 ${info.color}`}>
                <Icon className="w-3 h-3" />
                {info.label}
            </span>
        );
    };

    // Renderizar botón de ubicación con enlace a orden si es PUR o SAL
    const renderLocationWithOrder = (locationType, movement) => {
        const locationMap = {
            'PUR': { icon: FaShoppingCart, label: 'Compra', color: 'text-blue-600', hoverColor: 'hover:bg-blue-50' },
            'SAL': { icon: FaTruck, label: 'Venta', color: 'text-green-600', hoverColor: 'hover:bg-green-50' },
            'WHA': { icon: FaWarehouse, label: 'Depósito', color: 'text-purple-600', hoverColor: 'hover:bg-purple-50' },
            'BRA': { icon: FaStore, label: 'Sucursal', color: 'text-orange-600', hoverColor: 'hover:bg-orange-50' },
            'MOV': { icon: FaExchangeAlt, label: 'Movimiento', color: 'text-teal-600', hoverColor: 'hover:bg-teal-50' }
        };

        const info = locationMap[locationType] || { icon: FaBox, label: locationType, color: 'text-gray-600', hoverColor: 'hover:bg-gray-50' };
        const Icon = info.icon;

        // Si es compra y tiene orden de compra
        if (locationType === 'PUR' && movement.purchase_detail) {
            return (
                <button
                    onClick={() => handleViewPurchase(movement.purchase)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded transition-colors ${info.color} ${info.hoverColor} font-medium text-xs`}
                    title="Ver orden de compra"
                    style={{cursor: "pointer"}}
                >
                    <Icon className="w-3 h-3" />
                    <span>{movement.purchase_detail.order_number}</span>
                </button>
            );
        }

        // Si es venta y tiene orden de venta
        if (locationType === 'SAL' && movement.sale_detail) {
            return (
                <button
                    onClick={() => handleViewSale(movement.sale)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded transition-colors ${info.color} ${info.hoverColor} font-medium text-xs`}
                    title="Ver orden de venta"
                    style={{cursor: "pointer"}}
                >
                    <Icon className="w-3 h-3" />
                    <span>{movement.sale_detail.order_number}</span>
                </button>
            );
        }

        // Para otros tipos, mostrar solo el label
        return (
            <span className={`inline-flex items-center gap-1 ${info.color}`}>
                <Icon className="w-3 h-3" />
                {info.label}
            </span>
        );
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Paginación: Los movimientos ya vienen paginados del backend
    const paginatedMovements = filteredMovements;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Funciones de paginación - ahora resetean a página 1 cuando cambian filtros
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Calcular páginas a mostrar (máximo 5 botones)
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    // Función para abrir modal de movimiento
    const handleViewMovement = (movement) => {
        setSelectedMovementForModal(movement);
        setIsMovementModalOpen(true);
    };

    // Función para cerrar modal de movimiento
    const handleCloseMovementModal = () => {
        setIsMovementModalOpen(false);
        setSelectedMovementForModal(null);
    };

    // Función para abrir modal de venta
    const handleViewSale = async (saleId) => {
        if (!isInitialized) return;
        
        setLoadingModal(true);
        setIsSaleModalOpen(true);
        try {
            const sale = await salesOrderService.getSalesOrder(saleId);
            setSelectedSale(sale);
        } catch (error) {
            console.error('Error al cargar la venta:', error);
            setError('No se pudo cargar la información de la venta');
        } finally {
            setLoadingModal(false);
        }
    };

    // Función para cerrar modal de venta
    const handleCloseSaleModal = () => {
        setIsSaleModalOpen(false);
        setSelectedSale(null);
    };

    // Función para abrir modal de compra
    const handleViewPurchase = async (purchaseId) => {
        if (!isInitialized) return;
        
        setLoadingModal(true);
        setIsPurchaseModalOpen(true);
        try {
            const purchase = await purchaseOrderService.getPurchaseOrder(purchaseId);
            setSelectedPurchase(purchase);
        } catch (error) {
            console.error('Error al cargar la compra:', error);
            setError('No se pudo cargar la información de la compra');
        } finally {
            setLoadingModal(false);
        }
    };

    // Función para cerrar modal de compra
    const handleClosePurchaseModal = () => {
        setIsPurchaseModalOpen(false);
        setSelectedPurchase(null);
    };

    // Función para manejar éxito en creación de movimiento
    const handleMovementCreated = async () => {
        // Recargar movimientos
        setCurrentPage(1);
        try {
            const filters = {
                page: 1,
                page_size: itemsPerPage
            };
            
            if (movementType !== "Todos") {
                filters.movement_type = movementType;
            }
            
            if (status !== "Todos") {
                filters.status = status;
            }
            
            if (dateFrom) {
                filters.date_from = dateFrom;
            }
            
            if (dateTo) {
                filters.date_to = dateTo + 'T23:59:59';
            }
            
            const response = await stockService.getAllMovements(filters);
            
            if (response.results) {
                setMovements(response.results);
                setTotalCount(response.count || response.results.length);
            }
        } catch (err) {
            console.error('Error al recargar movimientos:', err);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <FaSpinner className="animate-spin mx-auto h-8 w-8 text-[#18c29c] mb-4" />
                    <p className="text-gray-600">Cargando movimientos de stock...</p>
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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Movimientos de Stock</h1>
                    <p className="text-gray-600 mt-1">Historial de ingresos y egresos de inventario</p>
                </div>
                <button
                    onClick={() => setIsCreateMovementModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#18c29c] hover:bg-[#15a280] text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                    <FaPlus className="w-4 h-4" />
                    Nuevo Movimiento Interno
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <FaFilter className="text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                </div>

                {/* Primera fila: Búsqueda */}
                <div className="space-y-4">
                    <div className="w-full">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por producto, SKU, ubicación o notas..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                                value={searchTerm}
                                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Segunda fila: Filtros de tipo, estado y ubicación */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Movimiento</label>
                            <select
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                                value={movementType}
                                onChange={(e) => {
                                    setMovementType(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="Todos">Todos los tipos</option>
                                <option value="IN">Ingresos</option>
                                <option value="OUT">Egresos</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                            <select
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="Todos">Todos los estados</option>
                                <option value="PEN">Pendiente</option>
                                <option value="TRAN">En Tránsito</option>
                                <option value="REC">Recibido</option>
                                <option value="CAN">Cancelado</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                            <select
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            >
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>
                                        {loc === "Todos" ? "Todas las ubicaciones" : loc}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tercera fila: Filtros de fecha */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaCalendarAlt className="text-gray-400" />
                                Fecha Desde
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaCalendarAlt className="text-gray-400" />
                                Fecha Hasta
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Resultados y botón limpiar filtros */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Mostrando {filteredMovements.length} de {movements.length} movimientos
                    </div>
                    {(movementType !== "Todos" || status !== "Todos" || location !== "Todos" || dateFrom || dateTo || searchTerm) && (
                        <button
                            onClick={() => {
                                setMovementType("Todos");
                                setStatus("Todos");
                                setLocation("Todos");
                                setDateFrom("");
                                setDateTo("");
                                setCurrentPage(1);
                                onSearchChange && onSearchChange("");
                            }}
                            className="text-sm text-[#18c29c] hover:text-[#15a280] font-medium transition-colors"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla de movimientos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabla Desktop */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Producto
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Origen
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Destino
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Ubicación
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Cantidad
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Referencia
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedMovements.map((movement) => (
                                <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(movement.date)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">
                                                {movement.product_detail?.description || '-'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                SKU: {movement.product_detail?.sku || '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getMovementTypeBadge(movement.movement_type)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {renderLocationWithOrder(movement.from_location, movement)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {renderLocationWithOrder(movement.to_location, movement)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {movement.warehouse_detail?.name || movement.branch_detail?.name || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {movement.quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(movement.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            {/* Botón para ver detalles del movimiento */}
                                            <button
                                                onClick={() => handleViewMovement(movement)}
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                                                title="Ver detalles del movimiento"
                                                style={{cursor: "pointer"}}
                                            >
                                                <FaEye className="w-3 h-3" />
                                                <span>Ver Movimiento</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Vista Mobile */}
                <div className="lg:hidden">
                    <div className="divide-y divide-gray-200">
                        {paginatedMovements.map((movement) => (
                            <div key={movement.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                            {movement.product_detail?.description || '-'}
                                        </h3>
                                        <p className="text-xs text-gray-500">SKU: {movement.product_detail?.sku || '-'}</p>
                                    </div>
                                    {getMovementTypeBadge(movement.movement_type)}
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Fecha:</span>
                                        <span className="font-medium text-gray-900">
                                            {formatDate(movement.date)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Origen:</span>
                                        {renderLocationWithOrder(movement.from_location, movement)}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Destino:</span>
                                        {renderLocationWithOrder(movement.to_location, movement)}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Ubicación:</span>
                                        <span className="font-medium text-gray-900">
                                            {movement.warehouse_detail?.name || movement.branch_detail?.name || '-'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Cantidad:</span>
                                        <span className="font-semibold text-gray-900">
                                            {movement.quantity}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Estado:</span>
                                        {getStatusBadge(movement.status)}
                                    </div>

                                    {/* Botones de referencia */}
                                    <div className="pt-2 border-t border-gray-100">
                                        <span className="text-gray-600 text-xs mb-2 block">Referencias:</span>
                                        <div className="flex flex-col gap-2">
                                            {/* Botón para ver detalles del movimiento */}
                                            <button
                                                onClick={() => handleViewMovement(movement)}
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                                                style={{cursor: "pointer"}}
                                            >
                                                <FaEye className="w-3 h-3" />
                                                <span>Ver Movimiento</span>
                                            </button>
                                        </div>
                                    </div>

                                    {movement.note && (
                                        <div className="pt-2 border-t border-gray-100">
                                            <p className="text-xs text-gray-500">
                                                <FaInfoCircle className="inline mr-1" />
                                                {movement.note}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Empty state */}
                {filteredMovements.length === 0 && (
                    <div className="text-center py-12">
                        <FaBox className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay movimientos</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || movementType !== "Todos" || status !== "Todos" || location !== "Todos" || dateFrom || dateTo
                                ? "No se encontraron movimientos con los filtros aplicados."
                                : "No hay movimientos de stock registrados."}
                        </p>
                    </div>
                )}
            </div>

            {/* Paginación */}
            {filteredMovements.length > 0 && totalPages > 1 && !searchTerm && location === "Todos" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                                    currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                            >
                                <FaChevronLeft className="mr-2" />
                                Anterior
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                                    currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                            >
                                Siguiente
                                <FaChevronRight className="ml-2" />
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalCount)}</span> de{' '}
                                    <span className="font-medium">{totalCount}</span> movimientos
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                                            currentPage === 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="sr-only">Anterior</span>
                                        <FaChevronLeft className="h-5 w-5" />
                                    </button>
                                    
                                    {getPageNumbers().map((pageNumber, index) => (
                                        pageNumber === '...' ? (
                                            <span
                                                key={`ellipsis-${index}`}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                            >
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={pageNumber}
                                                onClick={() => handlePageClick(pageNumber)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    currentPage === pageNumber
                                                        ? 'z-10 bg-[#18c29c] border-[#18c29c] text-white'
                                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        )
                                    ))}
                                    
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                                            currentPage === totalPages
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="sr-only">Siguiente</span>
                                        <FaChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mensaje informativo cuando hay filtros locales activos */}
            {(searchTerm || location !== "Todos") && totalCount > itemsPerPage && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                    <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                        <strong>Nota:</strong> Los filtros de búsqueda y ubicación solo se aplican a los resultados de la página actual. 
                        Usa los filtros de "Tipo de Movimiento", "Estado" y "Fecha" en la parte superior para filtrar todos los movimientos.
                    </p>
                </div>
            )}

            {/* Modales */}
            {/* Modal de detalles del movimiento */}
            {selectedMovementForModal && (
                <StockMovementModal
                    isOpen={isMovementModalOpen}
                    onClose={handleCloseMovementModal}
                    stockItem={{
                        product: selectedMovementForModal.product_detail,
                        warehouse: selectedMovementForModal.warehouse_detail,
                        branch: selectedMovementForModal.branch_detail
                    }}
                    movements={[selectedMovementForModal]}
                    isMovementTable={true}
                    loading={false}
                />
            )}

            {/* Modal de detalles de venta */}
            {isSaleModalOpen && (
                <SalesDetailModal
                    isOpen={isSaleModalOpen}
                    onClose={handleCloseSaleModal}
                    sale={selectedSale}
                    onUpdateStatus={() => {}}
                />
            )}

            {/* Modal de detalles de compra */}
            {isPurchaseModalOpen && (
                <PurchaseDetailModal
                    isOpen={isPurchaseModalOpen}
                    onClose={handleClosePurchaseModal}
                    purchase={selectedPurchase}
                    onUpdateStatus={() => {}}
                />
            )}

            {/* Modal de crear movimiento interno */}
            <CreateInternalMovementModal
                isOpen={isCreateMovementModalOpen}
                onClose={() => setIsCreateMovementModalOpen(false)}
                onSuccess={handleMovementCreated}
            />
        </div>
    );
};

export default StockMovementTable;