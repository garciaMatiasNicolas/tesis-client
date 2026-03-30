"use client";
import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaPlus, FaTrash } from 'react-icons/fa';
import useProductService from '@/services/productService';
import useEcommerceService from '@/services/ecommerceService';
import useWarehouseService from '@/services/warehouseService';
import useBranchService from '@/services/branchService';

export default function PurchaseFormModal({
    isOpen,
    onClose,
    onSubmit,
    loading = false,
    purchaseOrder = null
}) {
    const [formData, setFormData] = useState({
        supplier: null,
        payment_method: '',
        delivery_date: '',
        description: '',
        comment: '',
        transport: '',
        driver: '',
        patent: '',
        currency: 'ARS',
        taxes: 0,
        discount: 0,
        shipping_cost: 0,
        warehouse_destination: null,
        branch_destination: null,
        items: []
    });

    const [errors, setErrors] = useState({});
    
    // Estados para datos de API
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [productUnits, setProductUnits] = useState({}); // { productId: [units] }

    // Servicios
    const { getAllProducts, getProductUnits } = useProductService();
    const { getSuppliers } = useEcommerceService();
    const { getAllWarehouses } = useWarehouseService();
    const { getAllBranches } = useBranchService();

    // Cargar proveedores y productos al abrir el modal
    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        try {
            setLoadingData(true);
            const [suppliersData, productsData, warehousesData, branchesData] = await Promise.all([
                getSuppliers(),
                getAllProducts(),
                getAllWarehouses(),
                getAllBranches()
            ]);
            
            setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
            setProducts(Array.isArray(productsData) ? productsData.filter(product => product.status !== "discontinued") : []);
            setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);
            setBranches(Array.isArray(branchesData) ? branchesData : []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    // Cargar datos si es edición
    useEffect(() => {
        if (purchaseOrder && !loadingData && products.length > 0) {
            // Load units for all products in the purchase order
            const loadUnitsForProducts = async () => {
                const unitsMap = {};
                for (const item of purchaseOrder.items || []) {
                    const productId = item.product?.id || item.product;
                    if (productId) {
                        try {
                            const units = await getProductUnits(productId);
                            unitsMap[productId] = units || [];
                        } catch (error) {
                            console.error(`Error loading units for product ${productId}:`, error);
                            unitsMap[productId] = [];
                        }
                    }
                }
                setProductUnits(unitsMap);
            };
            loadUnitsForProducts();
            
            setFormData({
                supplier: purchaseOrder.supplier || null,
                payment_method: purchaseOrder.payment_method || '',
                delivery_date: purchaseOrder.delivery_date || '',
                description: purchaseOrder.description || '',
                comment: '',
                transport: purchaseOrder.transport || '',
                driver: purchaseOrder.driver || '',
                patent: purchaseOrder.patent || '',
                currency: purchaseOrder.currency || 'ARS',
                taxes: purchaseOrder.taxes || 0,
                discount: purchaseOrder.discount || 0,
                shipping_cost: purchaseOrder.shipping_cost || 0,
                items: (purchaseOrder.items || []).map(item => {
                    // Buscar el producto completo del array de productos
                    const productId = item.product?.id || item.product;
                    const fullProduct = products.find(p => p.id === productId);
                    
                    return {
                        product: fullProduct || item.product || null,
                        product_unit: item.product_unit || null,
                        quantity: item.quantity || 1,
                        unit_price: item.unit_price || fullProduct?.cost_price || 0
                    };
                })
            });
        } else if (!purchaseOrder) {
            resetForm();
        }
    }, [purchaseOrder, isOpen, loadingData, products]);

    const resetForm = () => {
        setFormData({
            supplier: null,
            payment_method: '',
            delivery_date: '',
            description: '',
            comment: '',
            transport: '',
            driver: '',
            patent: '',
            currency: 'ARS',
            taxes: 0,
            discount: 0,
            shipping_cost: 0,
            warehouse_destination: null,
            branch_destination: null,
            items: []
        });
        setErrors({});
        setProductUnits({});
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.supplier) {
            newErrors.supplier = 'El proveedor es obligatorio';
        }

        if (!formData.payment_method) {
            newErrors.payment_method = 'El método de pago es obligatorio';
        }

        if (!formData.delivery_date) {
            newErrors.delivery_date = 'La fecha de entrega es obligatoria';
        }

        if (formData.items.length === 0) {
            newErrors.items = 'Debe agregar al menos un producto';
        }

        if (purchaseOrder && !formData.comment.trim()) {
            newErrors.comment = 'Debe ingresar un comentario de actualización';
        }

        // Validar items
        formData.items.forEach((item, index) => {
            if (!item.product) {
                newErrors[`item_${index}_product`] = 'Seleccione un producto';
            }
            if (!item.quantity || item.quantity <= 0) {
                newErrors[`item_${index}_quantity`] = 'Cantidad inválida';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        
        try {
            // Calcular subtotal de items usando calculateItemSubtotal que considera conversion_factor
            const subtotal = formData.items.reduce((sum, item) => {
                return sum + calculateItemSubtotal(item);
            }, 0);
            
            // Calcular total con taxes, discount y shipping
            const total_price = subtotal + parseFloat(formData.taxes || 0) + parseFloat(formData.shipping_cost || 0) - parseFloat(formData.discount || 0);
            
            const dataToSubmit = {
                ...formData,
                total_price,
                status: purchaseOrder ? purchaseOrder.status : 'pending',
                was_buyed: purchaseOrder ? purchaseOrder.was_buyed : false
            };
    
            await onSubmit(dataToSubmit);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Manejo de items
    const addItem = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                {
                    product: null,
                    product_unit: null,
                    quantity: 1,
                    unit_price: 0
                }
            ]
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = async (index, field, value) => {
        const newItems = [...formData.items];
        
        // If changing product, load its units and reset product_unit
        if (field === 'product') {
            const productId = value?.id;
            if (productId) {
                try {
                    const units = await getProductUnits(productId);
                    setProductUnits(prev => ({
                        ...prev,
                        [productId]: units || []
                    }));
                } catch (error) {
                    console.error('Error loading product units:', error);
                }
            }
            
            newItems[index] = {
                ...newItems[index],
                product: value,
                product_unit: null,
                unit_price: value?.cost_price || 0
            };
        } else {
            newItems[index] = {
                ...newItems[index],
                [field]: value
            };
        }
        
        setFormData({ ...formData, items: newItems });
    };

    // Calcular subtotal de un item
    const calculateItemSubtotal = (item) => {
        let conversionFactor = 1;
        
        // Si hay una unidad seleccionada, obtener su factor de conversión
        if (item.product_unit && item.product?.id) {
            const units = productUnits[item.product.id] || [];
            const selectedUnit = units.find(u => u.id === parseInt(item.product_unit));
            if (selectedUnit) {
                conversionFactor = selectedUnit.conversion_factor;
            }
        }
        
        // Subtotal = precio_unitario × conversion_factor × cantidad
        return (item.unit_price || 0) * conversionFactor * (item.quantity || 0);
    };

    // Calcular total de la orden
    const calculateTotal = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
        const taxes = parseFloat(formData.taxes || 0);
        const discount = parseFloat(formData.discount || 0);
        const shippingCost = parseFloat(formData.shipping_cost || 0);
        
        return subtotal + taxes + shippingCost - discount;
    };

    // Formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    };

    if (!isOpen) return null;

    const paymentMethods = [
        'Efectivo',
        'Tarjeta de Crédito',
        'Tarjeta de Débito',
        'Transferencia Bancaria',
        'Cheque',
        'Mercado Pago',
        'Otro'
    ];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {purchaseOrder ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
                    </h3>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Loading indicator */}
                    {loadingData && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                            <FaSpinner className="animate-spin text-blue-600" />
                            <span className="text-sm text-blue-800">Cargando proveedores y productos...</span>
                        </div>
                    )}

                    {/* Información General */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
                            Información General
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Proveedor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.supplier?.id || ''}
                                    onChange={(e) => {
                                        const supplier = suppliers.find(s => s.id === parseInt(e.target.value));
                                        setFormData({ ...formData, supplier });
                                    }}
                                    disabled={loadingData}
                                    className={`w-full px-3 py-2 text-black border rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all ${
                                        errors.supplier ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Seleccione un proveedor</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.supplier && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <span>⚠</span> {errors.supplier}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Método de Pago <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.payment_method}
                                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                    className={`w-full px-3 py-2 text-black border rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all ${
                                        errors.payment_method ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Seleccionar método</option>
                                    {paymentMethods.map(method => (
                                        <option key={method} value={method}>
                                            {method}
                                        </option>
                                    ))}
                                </select>
                                {errors.payment_method && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <span>⚠</span> {errors.payment_method}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Entrega <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.delivery_date}
                                    onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                                    className={`w-full px-3 py-2 text-black border rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all ${
                                        errors.delivery_date ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                />
                                {errors.delivery_date && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <span>⚠</span> {errors.delivery_date}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Moneda
                                </label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                >
                                    <option value="ARS">ARS - Peso Argentino</option>
                                    <option value="USD">USD - Dólar Estadounidense</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Destino */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
                            Destino
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Depósito de Destino
                                </label>
                                <select
                                    value={formData.warehouse_destination || ''}
                                    onChange={(e) => {
                                        const warehouseId = e.target.value ? parseInt(e.target.value) : null;
                                        const warehouse = warehouseId ? warehouses.find(w => w.id === warehouseId) : null;
                                        setFormData({ 
                                            ...formData, 
                                            warehouse_destination: warehouse?.id || null,
                                            branch_destination: null // Limpiar sucursal si se selecciona depósito
                                        });
                                    }}
                                    disabled={loadingData || formData.branch_destination}
                                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all disabled:bg-gray-100"
                                >
                                    <option value="">Seleccione un depósito (opcional)</option>
                                    {warehouses.map(warehouse => (
                                        <option key={warehouse.id} value={warehouse.id}>
                                            {warehouse.name}
                                        </option>
                                    ))}
                                </select>
                                {formData.branch_destination && (
                                    <p className="text-xs text-gray-500 mt-1">Desactivado porque hay una sucursal seleccionada</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sucursal de Destino
                                </label>
                                <select
                                    value={formData.branch_destination?.id || formData.branch_destination || ''}
                                    onChange={(e) => {
                                        const branchId = e.target.value ? parseInt(e.target.value) : null;
                                        const branch = branchId ? branches.find(b => b.id === branchId) : null;
                                        setFormData({ 
                                            ...formData, 
                                            branch_destination: branch?.id || null,
                                            warehouse_destination: null // Limpiar depósito si se selecciona sucursal
                                        });
                                    }}
                                    disabled={loadingData || formData.warehouse_destination}
                                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all disabled:bg-gray-100"
                                >
                                    <option value="">Seleccione una sucursal (opcional)</option>
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                                {formData.warehouse_destination && (
                                    <p className="text-xs text-gray-500 mt-1">Desactivado porque hay un depósito seleccionado</p>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            * Si no selecciona ningún destino, se asignará automáticamente la sucursal Casa Central
                        </p>
                    </div>

                    {/* Información de Transporte */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
                            Información de Transporte
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Transporte
                                </label>
                                <input
                                    type="text"
                                    value={formData.transport}
                                    onChange={(e) => setFormData({ ...formData, transport: e.target.value })}
                                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                    placeholder="Nombre de la empresa de transporte"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Conductor
                                </label>
                                <input
                                    type="text"
                                    value={formData.driver}
                                    onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                    placeholder="Nombre del conductor"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Patente
                                </label>
                                <input
                                    type="text"
                                    value={formData.patent}
                                    onChange={(e) => setFormData({ ...formData, patent: e.target.value })}
                                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                    placeholder="Patente del vehículo"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Costos Adicionales */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
                            Costos Adicionales
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Impuestos
                                </label>
                                <input
                                    type="number"
                                    value={formData.taxes}
                                    onChange={(e) => setFormData({ ...formData, taxes: e.target.value })}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descuento
                                </label>
                                <input
                                    type="number"
                                    value={formData.discount}
                                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Costo de Envío
                                </label>
                                <input
                                    type="number"
                                    value={formData.shipping_cost}
                                    onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
                            Descripción
                        </h4>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                            placeholder="Descripción general de la orden de compra..."
                        />
                    </div>

                    {purchaseOrder && (
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
                                Comentario de actualización <span className="text-red-500">*</span>
                            </h4>
                            <textarea
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                rows={3}
                                className={`w-full px-3 py-2 text-black border rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all ${
                                    errors.comment ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Describe el motivo de la actualización..."
                            />
                            {errors.comment && (
                                <p className="text-red-500 text-sm mt-1">{errors.comment}</p>
                            )}
                        </div>
                    )}

                    {/* Items de la orden */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-200 flex-1">
                                Productos <span className="text-red-500">*</span>
                            </h4>
                            <button
                                type="button"
                                onClick={addItem}
                                className="ml-4 inline-flex items-center px-3 py-1 bg-[#18c29c] hover:bg-[#15a884] text-white text-sm rounded-lg transition-colors"
                            >
                                <FaPlus className="mr-1" /> Agregar Producto
                            </button>
                        </div>

                        {errors.items && (
                            <p className="text-red-500 text-sm mb-3 flex items-center gap-1">
                                <span>⚠</span> {errors.items}
                            </p>
                        )}

                        {formData.items.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <p className="text-gray-500">No hay productos agregados</p>
                                <p className="text-sm text-gray-400 mt-1">Haz clic en "Agregar Producto" para comenzar</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {formData.items.map((item, index) => {
                                    const selectedProduct = item.product;
                                    const availableUnits = selectedProduct?.id ? (productUnits[selectedProduct.id] || []) : [];
                                    
                                    return (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                <div className="md:col-span-4">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Producto
                                                    </label>
                                                    <select
                                                        value={item.product?.id || ''}
                                                        onChange={(e) => {
                                                            const product = products.find(p => p.id === parseInt(e.target.value));
                                                            updateItem(index, 'product', product);
                                                        }}
                                                        disabled={loadingData}
                                                        className={`w-full text-black px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-[#18c29c] ${
                                                            errors[`item_${index}_product`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    >
                                                        <option value="">Seleccione...</option>
                                                        {products.map(product => (
                                                            <option key={product.id} value={product.id}>
                                                                {product.description} (SKU - {product.sku})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                
                                                {/* Product Unit Selector */}
                                                {selectedProduct && (
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Unidad
                                                        </label>
                                                        <select
                                                            value={item.product_unit || ''}
                                                            onChange={(e) => updateItem(index, 'product_unit', e.target.value || null)}
                                                            className="w-full text-black px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#18c29c]"
                                                        >
                                                            <option value="">
                                                                {selectedProduct.base_unit_name || 'unidad'} (Base)
                                                            </option>
                                                            {availableUnits.map(unit => (
                                                                <option key={unit.id} value={unit.id}>
                                                                    {unit.unit_name} ({unit.conversion_factor} {selectedProduct.base_unit_name || 'unidad'})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                
                                                <div className={selectedProduct ? "md:col-span-2" : "md:col-span-2"}>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Cantidad
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        className={`w-full text-black px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-[#18c29c] ${
                                                            errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    />
                                                </div>
                                                <div className={selectedProduct ? "md:col-span-2" : "md:col-span-2"}>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Precio Unit.
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                        className={`w-full text-black px-2 py-1.5 text-sm text-right border rounded focus:ring-2 focus:ring-[#18c29c] ${
                                                            errors[`item_${index}_unit_price`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    />
                                                </div>
                                                <div className={selectedProduct ? "md:col-span-2" : "md:col-span-2"}>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Subtotal
                                                    </label>
                                                    <div className="px-2 py-1.5 text-black text-sm font-semibold bg-white border border-gray-300 rounded">
                                                        {formatCurrency(calculateItemSubtotal(item))}
                                                    </div>
                                                </div>
                                                <div className="md:col-span-1 flex items-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="w-full px-2 py-1.5 text-red-600 hover:bg-red-50 border border-red-300 rounded transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <FaTrash className="mx-auto" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Total */}
                        {formData.items.length > 0 && (
                            <div className="mt-4 flex justify-end">
                                <div className="bg-gray-100 px-6 py-3 rounded-lg">
                                    <div className="text-sm text-gray-600">Total de la Orden</div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(calculateTotal())}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-[#18c29c] text-white rounded-lg hover:bg-[#15a884] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                purchaseOrder ? 'Actualizar Orden' : 'Crear Orden'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
