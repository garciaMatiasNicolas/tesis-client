"use client";
import React, { useState, useEffect, use } from "react";
import { 
    FaTimes, 
    FaUser, 
    FaCalendarAlt, 
    FaDollarSign, 
    FaShoppingCart,
    FaTruck,
    FaSpinner,
    FaPlus,
    FaTrash,
    FaFileInvoiceDollar,
    FaLink,
    FaUserPlus,
    FaSearch,
    FaExclamationTriangle,
    FaWarehouse,
    FaCheck,
    FaStore
} from "react-icons/fa";
import crmService from '@/services/crmService';
import useProductService from '@/services/productService';
import useApiMethods from "@/hooks/useApiMethods";
import { formatPrice } from "@/utils/formatData";
import Link from 'next/link';
import georefService from '@/services/georefService';

export default function SalesFormModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    loading = false, 
    salesOrder = null 
}) {
    const limitDecimalIntegerDigits = (value, maxIntegerDigits = 8) => {
        if (value === '' || value === null || value === undefined) return value;
        const sanitized = value.toString().replace(/[^0-9.]/g, '');
        const [integerPartRaw, decimalPartRaw = ''] = sanitized.split('.');
        const integerPart = integerPartRaw.slice(0, maxIntegerDigits);
        if (decimalPartRaw === '' && !sanitized.includes('.')) {
            return integerPart;
        }
        return `${integerPart}.${decimalPartRaw}`;
    };
    
    const [formData, setFormData] = useState({
        customer_id: '',
        sales_channel: 'ecommerce',
        payment_method: '',
        delivery_date: '',
        deliver_to: '',
        shipping_cost: '0',
        total_price: '0',
        taxes: '0',
        discount: '0',
        description: '',
        currency: 'ARS',
        was_payed: false,
        with_shipping: false,
        use_customer_address: false,
        transport: '',
        driver: '',
        patent: '',
        sales_items: [],
        branch_origin_id: null,
        warehouse_origin_id: null
    });

    // Estados para cliente
    const [customerType, setCustomerType] = useState('registered');
    const [newCustomerData, setNewCustomerData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'Argentina'
    });
    
    // Estados para Georef
    const [provincias, setProvincias] = useState([]);
    const [ciudadSearch, setCiudadSearch] = useState('');
    const [filteredCiudades, setFilteredCiudades] = useState([]);
    const [showCiudadDropdown, setShowCiudadDropdown] = useState(false);
    const [loadingCiudades, setLoadingCiudades] = useState(false);
    
    // Estados para búsqueda de clientes
    const [customerSearch, setCustomerSearch] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Estados para manejo de stock insuficiente
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockError, setStockError] = useState(null);
    const [availableBranches, setAvailableBranches] = useState([]);
    const [availableWarehouses, setAvailableWarehouses] = useState([]);
    const [selectedOrigin, setSelectedOrigin] = useState({
        type: '',
        id: null
    });

    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [errors, setErrors] = useState({});
    const [productUnits, setProductUnits] = useState({});
    const apiMethods = useApiMethods();

    // Inicializar servicios
    const productService = useProductService();

    // Función para parsear el error de stock
    const parseStockError = (errorMessage) => {
        const productMatch = errorMessage.match(/para '([^']+)'/);
        const requiredMatch = errorMessage.match(/requerido: ([\d.]+)/);
        const availableMatch = errorMessage.match(/disponible: ([\d.]+)/);
        const locationMatch = errorMessage.match(/en (Sucursal|Depósito) ([^(]+)/);
        
        // Extraer ubicaciones disponibles
        const branchMatches = [...errorMessage.matchAll(/Sucursal '([^']+)' \(ID: (\d+)\): ([\d.]+) unidades/g)];
        const warehouseMatches = [...errorMessage.matchAll(/Depósito '([^']+)' \(ID: (\d+)\): ([\d.]+) unidades/g)];
        
        return {
            productName: productMatch ? productMatch[1] : 'Producto',
            required: requiredMatch ? parseFloat(requiredMatch[1]) : 0,
            available: availableMatch ? parseFloat(availableMatch[1]) : 0,
            currentLocation: locationMatch ? `${locationMatch[1]} ${locationMatch[2].trim()}` : 'Ubicación actual',
            branches: branchMatches.map(match => ({
                name: match[1],
                id: parseInt(match[2]),
                quantity: parseFloat(match[3])
            })),
            warehouses: warehouseMatches.map(match => ({
                name: match[1],
                id: parseInt(match[2]),
                quantity: parseFloat(match[3])
            }))
        };
    };

    // Manejar selección de origen y reintentar
    const handleOriginSelect = () => {
        if (!selectedOrigin.type || !selectedOrigin.id) {
            alert('Por favor seleccione un origen');
            return;
        }

        // Actualizar formData con el origen seleccionado
        setFormData(prev => ({
            ...prev,
            branch_origin_id: selectedOrigin.type === 'branch' ? selectedOrigin.id : null,
            warehouse_origin_id: selectedOrigin.type === 'warehouse' ? selectedOrigin.id : null
        }));

        // Cerrar modal sin reenviar automáticamente
        setShowStockModal(false);
        
        // NO resetear selectedOrigin para poder mostrarlo en el formulario
        // El usuario verá el origen seleccionado y hará clic manualmente en "Crear Orden"
    };

    // Modal de selección de origen
    const StockOriginModal = () => {
        if (!showStockModal || !stockError) return null;

        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-orange-50">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <FaExclamationTriangle className="text-orange-500" />
                                Stock Insuficiente
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Seleccione un origen alternativo para completar la venta
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setShowStockModal(false);
                                setSelectedOrigin({ type: '', id: null });
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-200px)]">
                        {/* Información del producto */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-semibold text-red-900 mb-2">
                                Producto: {stockError.productName}
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-red-700">Cantidad requerida:</span>
                                    <p className="font-bold text-red-900">{stockError.required} unidades</p>
                                </div>
                                <div>
                                    <span className="text-red-700">Disponible en {stockError.currentLocation}:</span>
                                    <p className="font-bold text-red-900">{stockError.available} unidades</p>
                                </div>
                            </div>
                        </div>

                        {/* Selección de origen */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">
                                Seleccione un origen alternativo:
                            </h4>

                            {/* Sucursales disponibles */}
                            {availableBranches.length > 0 && (
                                <div className="border border-[#18c29c] rounded-lg p-4 bg-[#18c29c]/5">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        <FaStore className="inline mr-2" />
                                        Sucursales con stock disponible:
                                    </label>
                                    <div className="space-y-2">
                                        {availableBranches.map((branch) => (
                                            <label 
                                                key={branch.id}
                                                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                                                    selectedOrigin.type === 'branch' && selectedOrigin.id === branch.id
                                                        ? 'border-[#18c29c] bg-[#18c29c]/10'
                                                        : 'border-gray-300 hover:border-[#18c29c]/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="origin"
                                                        checked={selectedOrigin.type === 'branch' && selectedOrigin.id === branch.id}
                                                        onChange={() => setSelectedOrigin({ type: 'branch', id: branch.id })}
                                                        className="w-4 h-4 text-[#18c29c] focus:ring-[#18c29c]"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{branch.name}</p>
                                                        <p className="text-xs text-gray-500">ID: {branch.id}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-[#18c29c]">{branch.quantity} unidades</p>
                                                    <p className="text-xs text-gray-500">disponibles</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Depósitos disponibles */}
                            {availableWarehouses.length > 0 && (
                                <div className="border border-blue-500 rounded-lg p-4 bg-blue-50">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        <FaWarehouse className="inline mr-2" />
                                        Depósitos con stock disponible:
                                    </label>
                                    <div className="space-y-2">
                                        {availableWarehouses.map((warehouse) => (
                                            <label 
                                                key={warehouse.id}
                                                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                                                    selectedOrigin.type === 'warehouse' && selectedOrigin.id === warehouse.id
                                                        ? 'border-blue-500 bg-blue-100'
                                                        : 'border-gray-300 hover:border-blue-500/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="origin"
                                                        checked={selectedOrigin.type === 'warehouse' && selectedOrigin.id === warehouse.id}
                                                        onChange={() => setSelectedOrigin({ type: 'warehouse', id: warehouse.id })}
                                                        className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{warehouse.name}</p>
                                                        <p className="text-xs text-gray-500">ID: {warehouse.id}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-blue-600">{warehouse.quantity} unidades</p>
                                                    <p className="text-xs text-gray-500">disponibles</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Si no hay ninguna ubicación disponible */}
                            {availableBranches.length === 0 && availableWarehouses.length === 0 && (
                                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-center">
                                    <p className="text-gray-600">
                                        No hay stock disponible en ninguna ubicación
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                        <button
                            type="button"
                            onClick={() => {
                                setShowStockModal(false);
                                setSelectedOrigin({ type: '', id: null });
                            }}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleOriginSelect}
                            disabled={!selectedOrigin.type || !selectedOrigin.id}
                            className="px-6 py-2 bg-[#18c29c] text-white rounded-lg hover:bg-[#15a884] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <FaCheck />
                            Confirmar y Continuar
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    

    // Cargar clientes y productos desde la API
    useEffect(() => {
        const loadData = async () => {
            if (!isOpen || dataLoaded || !apiMethods) return;
            
            try {
                setLoadingData(true);
                
                // Inicializar servicios
                crmService.initialize(apiMethods);
                
                // Cargar clientes
                const customersResponse = await crmService.getCustomers();
                setCustomers(customersResponse.results || customersResponse || []);
                
                // Cargar productos usando el servicio
                const productsResponse = await productService.getAllProducts();
                setProducts(productsResponse.results || productsResponse || []);
                // Cargar provincias de Argentina
                if (!salesOrder) {
                    const provinciasData = await georefService.getProvincias();
                    setProvincias(provinciasData);
                }
                
                setDataLoaded(true);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, [isOpen, dataLoaded]);

    // Reset form when modal opens/closes or when editing different sale
    useEffect(() => {
        if (!isOpen) {
            setDataLoaded(false);
            setCustomerType('registered');
            setCustomerSearch('');
            setSelectedCustomer(null);
            setFilteredCustomers([]);
            setShowCustomerDropdown(false);
            setNewCustomerData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                country: 'Argentina'
            });
        }
        
        if (isOpen) {
            if (salesOrder) {
                // Edit mode - populate form with existing data
                setCustomerType('registered');
                if (salesOrder.customer) {
                    setSelectedCustomer(salesOrder.customer);
                    setCustomerSearch(salesOrder.customer.display_name || salesOrder.customer.full_name || 
                        `${salesOrder.customer.first_name || ''} ${salesOrder.customer.last_name || ''}`.trim() ||
                        salesOrder.customer.name || salesOrder.customer.email);
                }
                
                // Load units for all products in the sales order
                const loadUnitsForProducts = async () => {
                    const unitsMap = {};
                    for (const item of salesOrder.sales_items || []) {
                        if (item.product) {
                            try {
                                const units = await productService.getProductUnits(item.product);
                                unitsMap[item.product] = units || [];
                            } catch (error) {
                                console.error(`Error loading units for product ${item.product}:`, error);
                                unitsMap[item.product] = [];
                            }
                        }
                    };
                    setProductUnits(unitsMap);
                };

                loadUnitsForProducts();
                
                setFormData({
                    customer_id: salesOrder.customer?.id || '',
                    sales_channel: salesOrder.sales_channel || 'ecommerce',
                    payment_method: salesOrder.payment_method || '',
                    delivery_date: salesOrder.delivery_date || '',
                    deliver_to: salesOrder.deliver_to || '',
                    shipping_cost: salesOrder.shipping_cost?.toString() || '0',
                    total_price: salesOrder.total_price?.toString() || '0',
                    taxes: salesOrder.taxes?.toString() || '0',
                    discount: salesOrder.discount?.toString() || '0',
                    description: salesOrder.description || '',
                    currency: salesOrder.currency || 'ARS',
                    was_payed: salesOrder.was_payed || false,
                    with_shipping: salesOrder.transport || salesOrder.driver || salesOrder.patent ? true : false,
                    use_customer_address: false,
                    transport: salesOrder.transport || '',
                    driver: salesOrder.driver || '',
                    patent: salesOrder.patent || '',
                    branch_origin_id: null,
                    warehouse_origin_id: null,
                    sales_items: (salesOrder.sales_items || []).map(item => ({
                        product_id: item.product || '',
                        product_unit: item.product_unit || null,
                        quantity: item.quantity || 1,
                        unit_price: item.unit_price || 0
                    }))
                });
            } else {
                // Create mode - reset to default values
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                setFormData({
                    customer_id: '',
                    sales_channel: 'ecommerce',
                    payment_method: '',
                    delivery_date: tomorrow.toISOString().split('T')[0],
                    deliver_to: '',
                    shipping_cost: '0',
                    total_price: '0',
                    taxes: '0',
                    discount: '0',
                    description: '',
                    currency: 'ARS',
                    was_payed: false,
                    with_shipping: false,
                    use_customer_address: false,
                    transport: '',
                    driver: '',
                    patent: '',
                    branch_origin_id: null,
                    warehouse_origin_id: null,
                    sales_items: []
                });
            }
            setErrors({});
        };
    }, [isOpen, salesOrder]);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            const customerDropdown = document.querySelector('.customer-search-container');
            if (customerDropdown && !customerDropdown.contains(event.target)) {
                setShowCustomerDropdown(false);
            }
            
            const ciudadDropdown = document.querySelector('.ciudad-search-container');
            if (ciudadDropdown && !ciudadDropdown.contains(event.target)) {
                setShowCiudadDropdown(false);
            }
        };

        if (showCustomerDropdown || showCiudadDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCustomerDropdown, showCiudadDropdown]);

    // Calculate total price automatically
    useEffect(() => {
        const itemsTotal = formData.sales_items.reduce((sum, item) => {
            let effectivePrice = parseFloat(item.unit_price || 0);
            
            // Si hay una unidad seleccionada, multiplicar por el factor de conversión solo para el cálculo
            if (item.product_unit && item.product_id) {
                const units = productUnits[item.product_id] || [];
                const selectedUnit = units.find(u => u.id === parseInt(item.product_unit));
                if (selectedUnit && selectedUnit.conversion_factor) {
                    effectivePrice = effectivePrice * selectedUnit.conversion_factor;
                }
            }
            
            return sum + (effectivePrice * parseInt(item.quantity || 0));
        }, 0);

        const subtotal = itemsTotal;
        const taxes = parseFloat(formData.taxes || 0);
        const discount = parseFloat(formData.discount || 0);
        const shipping = parseFloat(formData.shipping_cost || 0);
        
        const total = subtotal + taxes + shipping - discount;

        setFormData(prev => ({
            ...prev,
            total_price: total.toFixed(2)
        }));
    }, [formData.sales_items, formData.taxes, formData.discount, formData.shipping_cost, products, productUnits]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const isDecimalField = ['shipping_cost', 'taxes', 'discount'].includes(name);
        const normalizedValue = isDecimalField ? limitDecimalIntegerDigits(value) : value;
        let updates = {
            [name]: type === 'checkbox' ? checked : normalizedValue
        };

        // Si se desmarca el envío, limpiar campos relacionados
        if (name === 'with_shipping' && !checked) {
            updates.transport = '';
            updates.driver = '';
            updates.patent = '';
            updates.shipping_cost = '0';
        }

        // Si se marca usar dirección del cliente
        if (name === 'use_customer_address' && checked) {
            const customer = selectedCustomer || customers.find(c => c.id === parseInt(formData.customer_id));
            if (customer && customer.address) {
                updates.deliver_to = customer.address;
            }
        }

        // Si se desmarca usar dirección del cliente, limpiar
        if (name === 'use_customer_address' && !checked) {
            updates.deliver_to = '';
        }

        setFormData(prev => ({
            ...prev,
            ...updates
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Manejar cambio en datos de nuevo cliente
    const handleNewCustomerChange = (e) => {
        const { name, value } = e.target;
        setNewCustomerData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Si cambia la provincia, limpiar ciudad
        if (name === 'state') {
            setCiudadSearch('');
            setFilteredCiudades([]);
            setNewCustomerData(prev => ({
                ...prev,
                city: ''
            }));
        }
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Manejar búsqueda de ciudades
    const handleCiudadSearch = async (value) => {
        setCiudadSearch(value);
        
        if (value.length >= 2 && newCustomerData.state) {
            setLoadingCiudades(true);
            try {
                const ciudades = await georefService.searchLocalidades(value, newCustomerData.state);
                setFilteredCiudades(ciudades);
                setShowCiudadDropdown(true);
            } catch (error) {
                console.error('Error buscando ciudades:', error);
                setFilteredCiudades([]);
            } finally {
                setLoadingCiudades(false);
            }
        } else {
            setFilteredCiudades([]);
            setShowCiudadDropdown(false);
        }
    };

    // Seleccionar ciudad de la búsqueda
    const handleSelectCiudad = (ciudad) => {
        setCiudadSearch(ciudad.nombre);
        setNewCustomerData(prev => ({
            ...prev,
            city: ciudad.nombre
        }));
        setShowCiudadDropdown(false);
        
        // Clear error
        if (errors.city) {
            setErrors(prev => ({
                ...prev,
                city: ''
            }));
        }
    };

    // Manejar búsqueda de clientes
    const handleCustomerSearch = (value) => {
        setCustomerSearch(value);
        
        if (value.length >= 2) {
            const filtered = customers.filter(customer => {
                const displayName = customer.display_name || customer.full_name || 
                    `${customer.first_name || ''} ${customer.last_name || ''}`.trim() ||
                    customer.name || customer.email || '';
                const searchLower = value.toLowerCase();
                return displayName.toLowerCase().includes(searchLower) ||
                    (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
                    (customer.cuit && customer.cuit.includes(searchLower));
            });
            setFilteredCustomers(filtered);
            setShowCustomerDropdown(true);
        } else {
            setFilteredCustomers([]);
            setShowCustomerDropdown(false);
        }
    };

    // Seleccionar cliente de la búsqueda
    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setCustomerSearch(customer.display_name || customer.full_name || 
            `${customer.first_name || ''} ${customer.last_name || ''}`.trim() ||
            customer.name || customer.email);
        setFormData(prev => ({
            ...prev,
            customer_id: customer.id
        }));
        setShowCustomerDropdown(false);
        
        // Clear error
        if (errors.customer_id) {
            setErrors(prev => ({
                ...prev,
                customer_id: ''
            }));
        }
    };

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            sales_items: [...prev.sales_items, { product_id: '', product_unit: null, quantity: '1', unit_price: 0 }]
        }));
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({
            ...prev,
            sales_items: prev.sales_items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = async (index, field, value) => {
        // Si se cambia el producto, cargar sus unidades
        if (field === 'product_id' && value) {
            try {
                const units = await productService.getProductUnits(parseInt(value));
                setProductUnits(prev => ({
                    ...prev,
                    [value]: units || []
                }));
                
                // Obtener el precio del producto y asignarlo automáticamente
                const product = products.find(p => p.id === parseInt(value));
                const basePrice = product ? (product.price || 0) : 0;
                
                // Reset product_unit and set unit_price when product changes
                setFormData(prev => ({
                    ...prev,
                    sales_items: prev.sales_items.map((item, i) => 
                        i === index ? { 
                            ...item, 
                            product_id: value, 
                            product_unit: null,
                            unit_price: basePrice  // Asignar precio automáticamente
                        } : item
                    )
                }));
            } catch (error) {
                console.error('Error loading product units:', error);
                const product = products.find(p => p.id === parseInt(value));
                const basePrice = product ? (product.price || 0) : 0;
                
                setFormData(prev => ({
                    ...prev,
                    sales_items: prev.sales_items.map((item, i) => 
                        i === index ? { 
                            ...item, 
                            product_id: value, 
                            product_unit: null,
                            unit_price: basePrice
                        } : item
                    )
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                sales_items: prev.sales_items.map((item, i) => 
                    i === index ? { ...item, [field]: value } : item
                )
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validar según tipo de cliente
        if (customerType === 'registered') {
            if (!formData.customer_id) {
                newErrors.customer_id = 'Debe seleccionar un cliente';
            }
        } else {
            // Validar datos de nuevo cliente
            if (!newCustomerData.first_name) {
                newErrors.first_name = 'El nombre es requerido';
            }
            if (!newCustomerData.last_name) {
                newErrors.last_name = 'El apellido es requerido';
            }
            if (!newCustomerData.email) {
                newErrors.email = 'El email es requerido';
            } else if (!/\S+@\S+\.\S+/.test(newCustomerData.email)) {
                newErrors.email = 'Email no válido';
            }
            if (!newCustomerData.phone) {
                newErrors.phone = 'El teléfono es requerido';
            }
        }

        if (!formData.payment_method) {
            newErrors.payment_method = 'El método de pago es requerido';
        }

        if (!formData.sales_channel) {
            newErrors.sales_channel = 'El canal de venta es requerido';
        }

        if (!formData.delivery_date) {
            newErrors.delivery_date = 'La fecha de entrega es requerida';
        }

        // Validaciones de envío
        if (formData.with_shipping) {
            if (!formData.deliver_to || formData.deliver_to.trim() === '') {
                newErrors.deliver_to = 'La dirección de entrega es requerida';
            }
            if (!formData.shipping_cost || parseFloat(formData.shipping_cost) <= 0) {
                newErrors.shipping_cost = 'El costo de envío debe ser mayor a 0';
            }
        }

        // Validación de impuestos (obligatorio)
        if (!formData.taxes || formData.taxes === '') {
            newErrors.taxes = 'Los impuestos son requeridos';
        }

        if (formData.sales_items.length === 0) {
            newErrors.sales_items = 'Debe agregar al menos un producto';
        }

        // Validate each item
        formData.sales_items.forEach((item, index) => {
            if (!item.product_id) {
                newErrors[`item_${index}_product`] = 'Producto requerido';
            }
            if (!item.quantity || parseInt(item.quantity) <= 0) {
                newErrors[`item_${index}_quantity`] = 'Cantidad debe ser mayor a 0';
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
            let customerId = formData.customer_id;
            
            // Si es un nuevo cliente, crearlo primero
            if (customerType === 'new') {
                crmService.initialize(apiMethods);
                const newCustomer = await crmService.createCustomer({
                    customer_type: 'person',
                    ...newCustomerData
                });
                customerId = newCustomer.id;
            }
            
            // Convert string numbers to proper types
            const submitData = {
                ...formData,
                customer_id: parseInt(customerId),
                shipping_cost: parseFloat(formData.shipping_cost || 0),
                total_price: parseFloat(formData.total_price || 0),
                taxes: parseFloat(formData.taxes || 0),
                discount: parseFloat(formData.discount || 0),
                branch_origin_id: formData.branch_origin_id || null,
                warehouse_origin_id: formData.warehouse_origin_id || null,
                sales_items: formData.sales_items.map(item => ({
                    product_id: parseInt(item.product_id),
                    product_unit: item.product_unit ? parseInt(item.product_unit) : null,
                    quantity: parseInt(item.quantity),
                    unit_price: parseFloat(item.unit_price || 0)
                }))
            };
            await onSubmit(submitData);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
            
            // Verificar si es un error de stock
            if (error.response?.data?.sales_items) {
                const stockErrors = error.response.data.sales_items;
                
                // Si es un array de errores, tomar el primero
                const errorMessage = Array.isArray(stockErrors) ? stockErrors[0] : stockErrors;
                
                // Verificar si contiene información sobre otras ubicaciones
                if (typeof errorMessage === 'string' && 
                    (errorMessage.includes('Stock disponible en otras ubicaciones') || 
                     errorMessage.includes('Stock en otras ubicaciones'))) {
                    
                    // Parsear el error
                    const parsedError = parseStockError(errorMessage);
                    setStockError(parsedError);
                    setAvailableBranches(parsedError.branches);
                    setAvailableWarehouses(parsedError.warehouses);
                    setShowStockModal(true);
                    return;
                }
            }
            
            // Si no es error de stock, mostrar errores normales
            if (error.response?.data) {
                const backendErrors = {};
                Object.keys(error.response.data).forEach(key => {
                    const errorMsg = Array.isArray(error.response.data[key]) 
                        ? error.response.data[key][0] 
                        : error.response.data[key];
                    backendErrors[key] = errorMsg;
                });
                setErrors(backendErrors);
            }
        }
    };

    if (!isOpen) return null;

    const channelOptions = [
        { value: 'ecommerce', label: 'E-commerce', icon: FaShoppingCart },
        { value: 'storefront', label: 'Local físico', icon: FaUser },
        { value: 'wholesale', label: 'Mayorista', icon: FaFileInvoiceDollar }
    ];

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
        <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {salesOrder ? 'Editar Orden de Venta' : 'Nueva Orden de Venta'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} data-sales-form className="overflow-y-auto max-h-[calc(90vh-140px)]">
                        <div className="p-6 space-y-6">
                            {/* Sección de Cliente - Solo en modo creación */}
                            {!salesOrder && (
                                <div className="border border-[#18c29c]/30 bg-[#18c29c]/5 p-4 rounded-lg space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <FaUser />
                                        Información del Cliente
                                    </h3>
                                    
                                    {/* Radio buttons para tipo de cliente */}
                                    <div className="flex gap-6">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="customerType"
                                                value="registered"
                                                checked={customerType === 'registered'}
                                                onChange={(e) => {
                                                    setCustomerType(e.target.value);
                                                    setErrors({});
                                                }}
                                                className="w-4 h-4 text-[#18c29c] focus:ring-[#18c29c]"
                                            />
                                            <span className="ml-2 text-sm font-medium text-gray-900">Cliente Registrado</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="customerType"
                                                value="new"
                                                checked={customerType === 'new'}
                                                onChange={(e) => {
                                                    setCustomerType(e.target.value);
                                                    setErrors({});
                                                }}
                                            className="w-4 h-4 text-[#18c29c] focus:ring-[#18c29c]"
                                        />
                                        <span className="ml-2 text-sm font-medium text-gray-900">
                                            <FaUserPlus className="inline mr-1" />
                                            Nuevo Cliente
                                        </span>
                                    </label>
                                </div>

                                {/* Cliente Registrado - Búsqueda */}
                                {customerType === 'registered' && (
                                    <div className="relative customer-search-container">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <FaSearch className="inline mr-2" />
                                            Buscar Cliente *
                                        </label>
                                        <input
                                            type="text"
                                            value={customerSearch}
                                            onChange={(e) => handleCustomerSearch(e.target.value)}
                                            onFocus={() => {
                                                if (filteredCustomers.length > 0) {
                                                    setShowCustomerDropdown(true);
                                                }
                                            }}
                                            placeholder="Buscar por nombre, email o CUIT..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent"
                                            disabled={loadingData}
                                        />
                                        
                                        {/* Dropdown de resultados */}
                                        {showCustomerDropdown && filteredCustomers.length > 0 && (
                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {filteredCustomers.map((customer) => {
                                                    const displayName = customer.display_name || customer.full_name || 
                                                        `${customer.first_name || ''} ${customer.last_name || ''}`.trim() ||
                                                        customer.name || customer.email;
                                                    return (
                                                        <div
                                                            key={customer.id}
                                                            onClick={() => handleSelectCustomer(customer)}
                                                            className="px-4 py-2 hover:bg-[#18c29c]/10 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="font-medium text-gray-900">{displayName}</div>
                                                            {customer.email && (
                                                                <div className="text-xs text-gray-500">{customer.email}</div>
                                                            )}
                                                            {customer.cuit && (
                                                                <div className="text-xs text-gray-500">CUIT: {customer.cuit}</div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        
                                        {errors.customer_id && (
                                            <p className="text-red-500 text-sm mt-1">{errors.customer_id}</p>
                                        )}
                                        
                                        {selectedCustomer && (
                                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <div className="text-sm text-green-800">
                                                    ✓ Cliente seleccionado: <strong>{selectedCustomer.display_name || selectedCustomer.full_name}</strong>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Nuevo Cliente - Formulario */}
                                {customerType === 'new' && (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <p className="text-sm text-blue-800">
                                                <strong>Nota:</strong> Solo puedes crear clientes persona física desde aquí. 
                                                Para clientes empresa, por favor ve al{' '}
                                                <Link href="/crm" className="text-blue-600 hover:text-blue-800 underline font-medium">
                                                    módulo de CRM <FaLink className="inline" />
                                                </Link>
                                            </p>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nombre *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    value={newCustomerData.first_name}
                                                    onChange={handleNewCustomerChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent"
                                                    placeholder="Nombre del cliente"
                                                />
                                                {errors.first_name && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Apellido *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={newCustomerData.last_name}
                                                    onChange={handleNewCustomerChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent"
                                                    placeholder="Apellido del cliente"
                                                />
                                                {errors.last_name && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={newCustomerData.email}
                                                    onChange={handleNewCustomerChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent"
                                                    placeholder="email@ejemplo.com"
                                                />
                                                {errors.email && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Teléfono *
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={newCustomerData.phone}
                                                    onChange={handleNewCustomerChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent"
                                                    placeholder="+54 9 11 1234-5678"
                                                />
                                                {errors.phone && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                                )}
                                            </div>
                                            
                                            {/* País */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    País
                                                </label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    value={newCustomerData.country}
                                                    onChange={handleNewCustomerChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent"
                                                    placeholder="País"
                                                />
                                            </div>
                                            
                                            {/* Provincia */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Provincia
                                                </label>
                                                <select
                                                    name="state"
                                                    value={newCustomerData.state}
                                                    onChange={handleNewCustomerChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent"
                                                >
                                                    <option value="">Seleccionar provincia</option>
                                                    {provincias.map((provincia) => (
                                                        <option key={provincia.id} value={provincia.nombre}>
                                                            {provincia.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            {/* Ciudad con búsqueda */}
                                            <div className="relative ciudad-search-container">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <FaSearch className="inline mr-2" />
                                                    Ciudad
                                                </label>
                                                <input
                                                    type="text"
                                                    value={ciudadSearch}
                                                    onChange={(e) => handleCiudadSearch(e.target.value)}
                                                    onFocus={() => {
                                                        if (filteredCiudades.length > 0) {
                                                            setShowCiudadDropdown(true);
                                                        }
                                                    }}
                                                    placeholder={newCustomerData.state ? "Buscar ciudad..." : "Primero selecciona una provincia"}
                                                    disabled={!newCustomerData.state}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                />
                                                
                                                {/* Dropdown de ciudades */}
                                                {showCiudadDropdown && filteredCiudades.length > 0 && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                        {filteredCiudades.map((ciudad) => (
                                                            <div
                                                                key={ciudad.id}
                                                                onClick={() => handleSelectCiudad(ciudad)}
                                                                className="px-4 py-2 hover:bg-[#18c29c]/10 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                            >
                                                                <div className="font-medium text-gray-900">{ciudad.nombre}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {loadingCiudades && (
                                                    <div className="absolute right-3 top-10 text-gray-400">
                                                        <FaSpinner className="animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Dirección */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Dirección
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={newCustomerData.address}
                                                    onChange={handleNewCustomerChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent"
                                                    placeholder="Calle, número, piso, dpto"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cliente en modo edición - Solo lectura */}
                        {salesOrder && (
                            <div className="border border-gray-300 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                                    <FaUser />
                                    Cliente
                                </h3>
                                
                                {selectedCustomer && (
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Nombre:</span>
                                                <p className="text-base font-semibold text-gray-900">
                                                    {selectedCustomer.display_name || selectedCustomer.full_name || 
                                                    `${selectedCustomer.first_name || ''} ${selectedCustomer.last_name || ''}`.trim() ||
                                                    selectedCustomer.name || 'Sin nombre'}
                                                </p>
                                            </div>
                                            {selectedCustomer.email && (
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">Email:</span>
                                                    <p className="text-sm text-gray-900">{selectedCustomer.email}</p>
                                                </div>
                                            )}
                                            {selectedCustomer.phone && (
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                                                    <p className="text-sm text-gray-900">{selectedCustomer.phone}</p>
                                                </div>
                                            )}
                                            {selectedCustomer.cuit && (
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">CUIT:</span>
                                                    <p className="text-sm text-gray-900 font-mono">{selectedCustomer.cuit}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-xs text-gray-500 italic">
                                                ℹ️ El cliente no puede ser modificado en una orden existente
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                            {/* Canal de Venta */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Canal de Venta *
                                    </label>
                                    <select
                                        name="sales_channel"
                                        value={formData.sales_channel}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent"
                                    >
                                        {channelOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.sales_channel && (
                                        <p className="text-red-500 text-sm mt-1">{errors.sales_channel}</p>
                                    )}
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Método de Pago *
                                    </label>
                                    <select
                                        name="payment_method"
                                        value={formData.payment_method}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent"
                                    >
                                        <option value="">Seleccionar método</option>
                                        {paymentMethods.map(method => (
                                            <option key={method} value={method}>
                                                {method}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.payment_method && (
                                        <p className="text-red-500 text-sm mt-1">{errors.payment_method}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estado de Pago
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="was_payed"
                                            checked={formData.was_payed}
                                            onChange={handleInputChange}
                                            className="rounded border-gray-300 text-[#18c29c] shadow-sm focus:border-[#18c29c] focus:ring text-black focus:ring-[#18c29c] focus:ring-opacity-50"
                                        />
                                        <span className="ml-2 text-sm text-gray-900">
                                            Orden pagada
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Shipping Checkbox */}
                            <div className="border-t border-gray-200 pt-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="with_shipping"
                                        checked={formData.with_shipping}
                                        onChange={handleInputChange}
                                        className="rounded border-gray-300 text-[#18c29c] shadow-sm focus:border-[#18c29c] focus:ring focus:ring-[#18c29c] focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-900">
                                        <FaTruck className="inline mr-2" />
                                        Incluye envío
                                    </span>
                                </label>
                            </div>

                            {/* Delivery Section */}
                            <div className={`grid grid-cols-1 ${formData.with_shipping ? 'md:grid-cols-2' : ''} gap-4`}>
                                <div style={{maxWidth: "350px"}}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaCalendarAlt className="inline mr-2" />
                                        Fecha de Entrega *
                                    </label>
                                    <input
                                        type="date"
                                        name="delivery_date"
                                        value={formData.delivery_date}
                                        onChange={handleInputChange}
                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent"
                                    />
                                    {errors.delivery_date && (
                                        <p className="text-red-500 text-sm mt-1">{errors.delivery_date}</p>
                                    )}
                                </div>

                                {formData.with_shipping && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Dirección de Entrega *
                                        </label>
                                        <input
                                            type="text"
                                            name="deliver_to"
                                            value={formData.deliver_to}
                                            onChange={handleInputChange}
                                            disabled={formData.use_customer_address}
                                            placeholder="Dirección completa de entrega"
                                            className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                        {errors.deliver_to && (
                                            <p className="text-red-500 text-sm mt-1">{errors.deliver_to}</p>
                                        )}
                                        <label className="flex items-center mt-2">
                                            <input
                                                type="checkbox"
                                                name="use_customer_address"
                                                checked={formData.use_customer_address}
                                                onChange={handleInputChange}
                                                disabled={!formData.customer_id}
                                                className="rounded border-gray-300 text-[#18c29c] shadow-sm focus:border-[#18c29c] focus:ring focus:ring-[#18c29c] focus:ring-opacity-50 disabled:opacity-50"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">
                                                Usar dirección del cliente
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Transport Section - Solo visible si with_shipping es true */}
                            {formData.with_shipping && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-[#18c29c]/30 bg-[#18c29c]/10 p-4 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <FaTruck className="inline mr-2" />
                                            Transporte
                                        </label>
                                        <input
                                            type="text"
                                            name="transport"
                                            value={formData.transport}
                                            onChange={handleInputChange}
                                            placeholder="Empresa de transporte"
                                            className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Conductor
                                        </label>
                                        <input
                                            type="text"
                                            name="driver"
                                            value={formData.driver}
                                            onChange={handleInputChange}
                                            placeholder="Nombre del conductor"
                                            className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Patente
                                        </label>
                                        <input
                                            type="text"
                                            name="patent"
                                            value={formData.patent}
                                            onChange={handleInputChange}
                                            placeholder="Patente del vehículo"
                                            className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Products Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        <FaShoppingCart className="inline mr-2" />
                                        Productos *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="bg-[#18c29c] text-white px-3 py-1 rounded text-sm hover:bg-[#15a884] transition-colors flex items-center gap-1"
                                    >
                                        <FaPlus className="text-xs" />
                                        Agregar Producto
                                    </button>
                                </div>
                                {formData.sales_items.map((item, index) => {
                                    const selectedProduct = products.find(p => p.id === parseInt(item.product_id));
                                    const availableUnits = item.product_id ? (productUnits[item.product_id] || []) : [];
                                    
                                    return (
                                        <div key={index} className="flex gap-2 mb-2 items-start">
                                            <div className="flex-1">
                                                <select
                                                    value={item.product_id}
                                                    onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                                                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                                    disabled={loadingData}
                                                >
                                                    <option value="">{loadingData ? 'Cargando productos...' : 'Seleccionar producto'}</option>
                                                    {products.map(product => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.description} - SKU {product.sku} - ${product.price || 0}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors[`item_${index}_product`] && (
                                                    <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_product`]}</p>
                                                )}
                                            </div>
                                            
                                            {/* Product Unit Selector */}
                                            {item.product_id && selectedProduct && (
                                                <div className="w-40">
                                                    <select
                                                        value={item.product_unit || ''}
                                                        onChange={(e) => handleItemChange(index, 'product_unit', e.target.value)}
                                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                                    >
                                                        <option value="">
                                                            {selectedProduct.base_unit_name || 'unidad'} (Base)
                                                        </option>
                                                        {availableUnits.map(unit => (
                                                            <option key={unit.id} value={unit.id}>
                                                                {unit.name} ({unit.conversion_factor} {selectedProduct.base_unit_name || 'unidad'})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {/* Unit Price Input */}
                                            {item.product_id && selectedProduct && (
                                                <div className="w-40 flex items-start">
                                                    <FaDollarSign className="inline mr-2 mt-3" color="black" />
                                                    <input
                                                        type="number"
                                                        value={item.unit_price}
                                                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                                        placeholder="Precio Unitario"
                                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                                    />
                                                    {errors[`item_${index}_unit_price`] && (
                                                        <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_unit_price`]}</p>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="w-24">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    placeholder="Cant."
                                                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                                />
                                                {errors[`item_${index}_quantity`] && (
                                                    <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_quantity`]}</p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="text-red-600 hover:text-red-800 p-2"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    );
                                })}

                                {errors.sales_items && (
                                    <p className="text-red-500 text-sm mt-1">{errors.sales_items}</p>
                                )}
                            </div>

                            {/* Origen de Stock Seleccionado - Mostrar si hay un origen alternativo */}
                            {(formData.branch_origin_id || formData.warehouse_origin_id) && (
                                <div className="border border-blue-500 bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-1">
                                                {selectedOrigin.type === 'branch' ? (
                                                    <><FaStore className="text-blue-600" /> Origen: Sucursal Alternativa</>
                                                ) : (
                                                    <><FaWarehouse className="text-blue-600" /> Origen: Depósito</>
                                                )}
                                            </h4>
                                            <p className="text-sm text-blue-800">
                                                {selectedOrigin.type === 'branch' 
                                                    ? availableBranches.find(b => b.id === selectedOrigin.id)?.name 
                                                    : availableWarehouses.find(w => w.id === selectedOrigin.id)?.name
                                                }
                                                {' '}(ID: {selectedOrigin.id})
                                            </p>
                                            <p className="text-xs text-blue-700 mt-1">
                                                ℹ️ El stock se tomará de esta ubicación al crear la orden
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    branch_origin_id: null,
                                                    warehouse_origin_id: null
                                                }));
                                                setSelectedOrigin({ type: '', id: null });
                                                setAvailableBranches([]);
                                                setAvailableWarehouses([]);
                                            }}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                                        >
                                            <FaTimes />
                                            Quitar origen
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Financial Section */}

                            {/* Financial Section */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Envío {formData.with_shipping && '*'}
                                    </label>
                                    <input
                                        type="number"
                                        name="shipping_cost"
                                        value={formData.shipping_cost}
                                        onChange={handleInputChange}
                                        disabled={!formData.with_shipping}
                                        step="0.01"
                                        min="0"
                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                    {errors.shipping_cost && (
                                        <p className="text-red-500 text-sm mt-1">{errors.shipping_cost}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Impuestos *
                                    </label>
                                    <input
                                        type="number"
                                        name="taxes"
                                        value={formData.taxes}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                    />
                                    {errors.taxes && (
                                        <p className="text-red-500 text-sm mt-1">{errors.taxes}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descuento
                                    </label>
                                    <input
                                        type="number"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaDollarSign className="inline mr-2" />
                                        Total
                                    </label>
                                    <input
                                        type="text"
                                        value={`${formatPrice(formData.total_price)}`}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Descripción adicional de la orden..."
                                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-[#18c29c] text-white rounded-lg hover:bg-[#15a884] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading && <FaSpinner className="animate-spin" />}
                                {salesOrder ? 'Actualizar Orden' : 'Crear Orden'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* Modal de selección de origen */}
            <StockOriginModal />
        </>
    );
}