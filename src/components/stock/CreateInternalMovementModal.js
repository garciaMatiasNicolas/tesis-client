"use client";
import React, { useState, useEffect } from 'react';
import { FaTimes, FaExchangeAlt, FaWarehouse, FaStore, FaBox, FaSave } from 'react-icons/fa';
import useProductService from '@/services/productService';
import useWarehouseService from '@/services/warehouseService';
import useBranchService from '@/services/branchService';
import useStockService from '@/services/stockService';

const CreateInternalMovementModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        product: '',
        fromLocationType: 'WHA', // WHA o BRA
        fromLocation: '',
        toLocationType: 'WHA', // WHA o BRA
        toLocation: '',
        quantity: '',
        note: ''
    });

    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const productService = useProductService();
    const warehouseService = useWarehouseService();
    const branchService = useBranchService();
    const stockService = useStockService();

    // Cargar productos, depósitos y sucursales
    useEffect(() => {
        const loadData = async () => {
            if (!isOpen) return;
            
            setLoadingData(true);
            try {
                const [productsData, warehousesData, branchesData] = await Promise.all([
                    productService.getAllProducts(),
                    warehouseService.getAllWarehouses(),
                    branchService.getAllBranches()
                ]);

                setProducts(productsData || []);
                setWarehouses(warehousesData || []);
                setBranches(branchesData || []);
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('No se pudieron cargar los datos necesarios');
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    // Limpiar formulario al cerrar
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                product: '',
                fromLocationType: 'WHA',
                fromLocation: '',
                toLocationType: 'WHA',
                toLocation: '',
                quantity: '',
                note: ''
            });
            setSelectedProduct(null);
            setError(null);
        }
    }, [isOpen]);

    // Actualizar producto seleccionado
    useEffect(() => {
        if (formData.product) {
            const product = products.find(p => p.id === parseInt(formData.product));
            setSelectedProduct(product);
        } else {
            setSelectedProduct(null);
        }
    }, [formData.product, products]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Resetear ubicación si cambia el tipo
        if (name === 'fromLocationType') {
            setFormData(prev => ({ ...prev, fromLocation: '' }));
        }
        if (name === 'toLocationType') {
            setFormData(prev => ({ ...prev, toLocation: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validaciones
        if (!formData.product) {
            setError('Debe seleccionar un producto');
            return;
        }
        if (!formData.fromLocation) {
            setError('Debe seleccionar una ubicación de origen');
            return;
        }
        if (!formData.toLocation) {
            setError('Debe seleccionar una ubicación de destino');
            return;
        }
        if (formData.fromLocationType === formData.toLocationType && formData.fromLocation === formData.toLocation) {
            setError('El origen y destino deben ser diferentes');
            return;
        }
        if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
            setError('La cantidad debe ser mayor a 0');
            return;
        }

        setLoading(true);
        try {
            // Llamar al backend para crear el movimiento
            await stockService.createInternalMovement(formData);
            
            onSuccess && onSuccess();
            onClose();
        } catch (err) {
            console.error('Error al crear movimiento:', err);
            
            // Manejar diferentes tipos de errores
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('No se pudo crear el movimiento interno');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#18c29c] bg-opacity-10 rounded-lg flex items-center justify-center">
                            <FaExchangeAlt className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Nuevo Movimiento Interno</h2>
                            <p className="text-sm text-gray-500">Transferencia entre ubicaciones</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <span className="text-red-600 text-sm">⚠️</span>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {loadingData ? (
                        <div className="text-center py-8">
                            <div className="animate-spin mx-auto h-8 w-8 border-4 border-[#18c29c] border-t-transparent rounded-full"></div>
                            <p className="text-gray-500 mt-3">Cargando datos...</p>
                        </div>
                    ) : (
                        <>
                            {/* Producto */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Producto *
                                </label>
                                <select
                                    name="product"
                                    value={formData.product}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                                    disabled={loading}
                                >
                                    <option value="">Seleccionar producto</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.sku} - {product.description}
                                        </option>
                                    ))}
                                </select>
                                {selectedProduct && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Stock base: {selectedProduct.stock || 0} {selectedProduct.base_unit_name}
                                    </p>
                                )}
                            </div>

                            {/* Origen */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Origen *
                                    </label>
                                    <select
                                        name="fromLocationType"
                                        value={formData.fromLocationType}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                                        disabled={loading}
                                    >
                                        <option value="WHA">Depósito</option>
                                        <option value="BRA">Sucursal</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ubicación de Origen *
                                    </label>
                                    <select
                                        name="fromLocation"
                                        value={formData.fromLocation}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                                        disabled={loading}
                                    >
                                        <option value="">Seleccionar ubicación</option>
                                        {formData.fromLocationType === 'WHA'
                                            ? warehouses.map(warehouse => (
                                                <option key={warehouse.id} value={warehouse.id}>
                                                    {warehouse.name}
                                                </option>
                                            ))
                                            : branches.map(branch => (
                                                <option key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>

                            {/* Destino */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Destino *
                                    </label>
                                    <select
                                        name="toLocationType"
                                        value={formData.toLocationType}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                                        disabled={loading}
                                    >
                                        <option value="WHA">Depósito</option>
                                        <option value="BRA">Sucursal</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ubicación de Destino *
                                    </label>
                                    <select
                                        name="toLocation"
                                        value={formData.toLocation}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                                        disabled={loading}
                                    >
                                        <option value="">Seleccionar ubicación</option>
                                        {formData.toLocationType === 'WHA'
                                            ? warehouses.map(warehouse => (
                                                <option key={warehouse.id} value={warehouse.id}>
                                                    {warehouse.name}
                                                </option>
                                            ))
                                            : branches.map(branch => (
                                                <option key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>

                            {/* Cantidad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cantidad *
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                    min="0.01"
                                    step="0.01"
                                    placeholder="Ingrese la cantidad"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-black"
                                    disabled={loading}
                                />
                                {selectedProduct && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Unidad: {selectedProduct.base_unit_name}
                                    </p>
                                )}
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notas (Opcional)
                                </label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Información adicional sobre el movimiento..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent resize-none text-black"
                                    disabled={loading}
                                />
                            </div>
                        </>
                    )}
                </form>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading || loadingData}
                        className="px-6 py-2.5 bg-[#18c29c] hover:bg-[#15a280] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Creando...
                            </>
                        ) : (
                            <>
                                <FaSave className="w-4 h-4" />
                                Crear Movimiento
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateInternalMovementModal;
