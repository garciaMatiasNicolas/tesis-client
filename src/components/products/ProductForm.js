"use client";
import React, { useRef, useState, useEffect } from "react";
import { FaCamera, FaDollarSign, FaTag, FaWeight, FaRulerVertical, FaRulerHorizontal, FaCube, FaBoxes, FaSpinner } from "react-icons/fa";
import useProductService from "@/services/productService";
import Alert from "@/components/ui/Alert";

export default function ProductForm({ product = null, isEditing = false, onProductCreated, onCancel }) {
  const fileInputRef = useRef();
  const productService = useProductService();
  
  // Form states
  const [formData, setFormData] = useState({
    sku: '',
    description: '',
    price: '',
    cost_price: '',
    weight: '',
    height: '',
    width: '',
    depth: '',
    safety_stock: '',
    unit_type: 'count',
    base_unit_name: 'unit',
    show_price: true,
    promotional_price: '',
    product_type: 'physical'
  });
  
  // Product units for conversion
  const [productUnits, setProductUnits] = useState([]);
  const [originalProductUnits, setOriginalProductUnits] = useState([]); // Para trackear unidades al editar
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitFactor, setNewUnitFactor] = useState('');
  
  // Related data states
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  // Selected values
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Alert states
  const [alert, setAlert] = useState(null);

  // Helper function to show alerts
  const showAlert = (type, title, message) => {
    setAlert({ type, title, message });
    // Auto-hide alert after 5 seconds
    setTimeout(() => setAlert(null), 5000);
  };

  // Helper function to parse Django validation errors
  const parseValidationErrors = (error) => {
    // Field name translations to Spanish
    const fieldTranslations = {
      'sku': 'SKU',
      'name': 'Nombre',
      'description': 'Descripción del producto',
      'price': 'Precio',
      'cost_price': 'Precio de costo',
      'weight': 'Peso',
      'height': 'Altura',
      'width': 'Ancho', 
      'depth': 'Profundidad',
      'storage_unit': 'Unidad de almacenamiento',
      'video_url': 'URL del video',
      'category': 'Categoría',
      'subcategory': 'Subcategoría',
      'supplier': 'Proveedor',
      'non_field_errors': 'Errores generales'
    };

    // Common error message translations
    const errorTranslations = {
      'already exists': 'ya existe',
      'This field is required': 'Este campo es obligatorio',
      'This field may not be blank': 'Este campo no puede estar vacío',
      'Enter a valid': 'Ingresa un',
      'Ensure this value': 'Asegúrate de que este valor',
      'with this': 'con este',
      'product with this sku already exists.': 'Ya existe un producto con este SKU.',
      'category with this name already exists.': 'Ya existe una categoría con este nombre.',
      'subcategory with this name already exists.': 'Ya existe una subcategoría con este nombre.',
      'Enter a valid URL.': 'Ingresa una URL válida.',
      'Enter a valid number.': 'Ingresa un número válido.',
      'This field may not be blank.': 'Este campo no puede estar vacío.',
      'Invalid input.': 'Entrada inválida.',
      'A valid integer is required.': 'Se requiere un número entero válido.',
      'A valid number is required.': 'Se requiere un número válido.'
    };

    if (error.response && error.response.data) {
      const errorData = error.response.data;
      const errorMessages = [];

      // Handle different error response formats
      if (typeof errorData === 'object') {
        // Process field-specific errors
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            const fieldName = fieldTranslations[field] || field;
            errorData[field].forEach(message => {
              let translatedMessage = message;
              
              // Apply translations to common error patterns
              Object.keys(errorTranslations).forEach(pattern => {
                if (translatedMessage.toLowerCase().includes(pattern.toLowerCase())) {
                  translatedMessage = translatedMessage.replace(new RegExp(pattern, 'gi'), errorTranslations[pattern]);
                }
              });

              // Format with bullet point for better readability
              if (field === 'non_field_errors') {
                errorMessages.push(`• ${translatedMessage}`);
              } else {
                errorMessages.push(`• ${fieldName}: ${translatedMessage}`);
              }
            });
          } else if (typeof errorData[field] === 'string') {
            // Handle single string errors
            const fieldName = fieldTranslations[field] || field;
            let translatedMessage = errorData[field];
            
            Object.keys(errorTranslations).forEach(pattern => {
              if (translatedMessage.toLowerCase().includes(pattern.toLowerCase())) {
                translatedMessage = translatedMessage.replace(new RegExp(pattern, 'gi'), errorTranslations[pattern]);
              }
            });

            errorMessages.push(`• ${fieldName}: ${translatedMessage}`);
          }
        });
      } else if (typeof errorData === 'string') {
        // Handle simple string error responses
        errorMessages.push(`• ${errorData}`);
      }

      return errorMessages.length > 0 ? errorMessages.join('\n') : null;
    }

    return null;
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [categoriesData, subcategoriesData, suppliersData] = await Promise.all([
          productService.getAllCategories(),
          productService.getAllSubcategories(),
          productService.getAllSuppliers().catch(() => []) // Fallback if suppliers endpoint doesn't exist
        ]);
        
        setCategories(categoriesData || []);
        setSubcategories(subcategoriesData || []);
        setSuppliers(suppliersData || []);
        
        // If editing, populate form
        if (product) {
          setFormData({
            sku: product.sku || '',
            description: product.description || '',
            price: product.price || '',
            cost_price: product.cost_price || '',
            weight: product.weight || '',
            height: product.height || '',
            width: product.width || '',
            depth: product.depth || '',
            safety_stock: product.safety_stock ?? '',
            unit_type: product.unit_type || 'count',
            base_unit_name: product.base_unit_name || 'unit',
            show_price: product.show_price !== false,
            promotional_price: product.promotional_price || '',
            product_type: product.product_type || 'physical'
          });
          
          setSelectedCategory(product.category?.id || '');
          setSelectedSubcategory(product.subcategory?.id || '');
          setSelectedSupplier(product.supplier || null);
          
          // Load product units if editing
          try {
            const units = await productService.getProductUnits(product.id);
            const formattedUnits = units.map(u => ({
              id: u.id,
              name: u.name,
              conversion_factor: parseFloat(u.conversion_factor)
            }));
            setProductUnits(formattedUnits);
            setOriginalProductUnits(formattedUnits); // Guardar copia para comparar eliminaciones
          } catch (error) {
            console.error('Error al cargar unidades del producto:', error);
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [product]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle adding a new product unit
  const handleAddProductUnit = () => {
    if (!newUnitName.trim() || !newUnitFactor || parseFloat(newUnitFactor) <= 0) {
      showAlert('warning', 'Datos incompletos', 'Por favor completa el nombre y el factor de conversión (debe ser mayor a 0).');
      return;
    }
    
    const newUnit = {
      id: Date.now(), // Temporary ID for new units
      name: newUnitName.trim(),
      conversion_factor: parseFloat(newUnitFactor)
    };
    
    setProductUnits(prev => [...prev, newUnit]);
    setNewUnitName('');
    setNewUnitFactor('');
  };

  // Handle removing a product unit
  const handleRemoveProductUnit = (unitId) => {
    setProductUnits(prev => prev.filter(u => u.id !== unitId));
  };

  // Handle editing a product unit
  const handleEditProductUnit = (unitId, field, value) => {
    setProductUnits(prev => prev.map(u => 
      u.id === unitId ? { ...u, [field]: value } : u
    ));
  };



  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.sku) {
      showAlert('warning', 'Faltan campos de completar', 'Por favor completa los campos de Descripción del producto y SKU.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const productData = {
        ...formData,
        category: selectedCategory || null,
        subcategory: selectedSubcategory || null,
        supplier: selectedSupplier?.id || null,
        price: parseFloat(formData.price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        promotional_price: parseFloat(formData.promotional_price) || null,
        safety_stock: parseFloat(formData.safety_stock) || 0,
        weight: parseFloat(formData.weight) || null,
        height: parseFloat(formData.height) || null,
        width: parseFloat(formData.width) || null,
        depth: parseFloat(formData.depth) || null,
      };
      
      let result;
      if (product) {
        result = await productService.updateProduct(product.id, productData);
      } else {
        result = await productService.createProduct(productData);
      }
      
      // Gestionar Product Units después de crear/actualizar el producto
      const productId = result.id;
      
      // 1. Identificar unidades nuevas (id temporal), existentes y eliminadas
      const newUnits = productUnits.filter(u => u.id > 1000000000000); // IDs temporales de Date.now()
      const existingUnits = productUnits.filter(u => u.id <= 1000000000000); // IDs reales del backend
      const deletedUnits = originalProductUnits.filter(
        origUnit => !productUnits.find(u => u.id === origUnit.id)
      );
      
      // 2. Crear nuevas unidades
      for (const unit of newUnits) {
        try {
          await productService.createProductUnit({
            product: productId,
            name: unit.name,
            conversion_factor: unit.conversion_factor
          });
        } catch (error) {
          console.error('Error al crear unidad:', error);
          showAlert('warning', 'Error parcial', `No se pudo crear la unidad "${unit.name}"`);
        }
      }
      
      // 3. Actualizar unidades existentes
      for (const unit of existingUnits) {
        try {
          await productService.updateProductUnit(unit.id, {
            product: productId,
            name: unit.name,
            conversion_factor: unit.conversion_factor
          });
        } catch (error) {
          console.error('Error al actualizar unidad:', error);
          showAlert('warning', 'Error parcial', `No se pudo actualizar la unidad "${unit.name}"`);
        }
      }
      
      // 4. Eliminar unidades que fueron removidas
      for (const unit of deletedUnits) {
        try {
          await productService.deleteProductUnit(unit.id);
        } catch (error) {
          console.error('Error al eliminar unidad:', error);
          showAlert('warning', 'Error parcial', `No se pudo eliminar la unidad "${unit.name}"`);
        }
      }
      
      if (onProductCreated) {
        onProductCreated(result);
      } else {
        showAlert('success', 
          product ? 'Producto actualizado' : 'Producto creado', 
          product ? 'El producto ha sido actualizado con éxito!' : 'El producto ha sido creado con éxito!'
        );
        // Reset form if creating new product
        if (!product) {
          setFormData({
            sku: '',
            description: '',
            price: '',
            cost_price: '',
            weight: '',
            height: '',
            width: '',
            depth: '',
            safety_stock: '',
            unit_type: 'count',
            base_unit_name: 'unit',
            show_price: true,
            promotional_price: '',
            product_type: 'physical'
          });
          setSelectedCategory('');
          setSelectedSubcategory('');
          setSelectedSupplier(null);
          setProductUnits([]);
          setNewUnitName('');
          setNewUnitFactor('');
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      
      const validationErrors = parseValidationErrors(error);
      if (validationErrors) {
        showAlert('danger', 'Error de validación', validationErrors);
      } else {
        showAlert('danger', 'Error al guardar el producto', 'Error al guardar el producto. Por favor verifica tu conexión e inténtalo de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Filter subcategories by selected category
  const filteredSubcategories = subcategories.filter(
    sub => {
      if (!selectedCategory) return false;
      const categoryId = parseInt(selectedCategory);
      return sub.category === categoryId || sub.category_id === categoryId;
    }
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto h-8 w-8 text-[#18c29c] mb-4" />
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  };



  return (
    <div className="flex justify-center items-start min-h-screen w-full bg-[#f8fafc]">
      <div className="w-full max-w-[1500px] bg-white rounded-xl shadow p-8 mt-8 mb-8">
        <h1 className="text-2xl font-bold mb-8 text-gray-900">
          {product ? 'Editar producto' : 'Agregar producto'}
        </h1>
        
        <form onSubmit={handleSubmit}>
          {/* Name and SKU */}
          <div className="mb-6 flex flex-wrap gap-6">
            <div className="flex-1 min-w-[250px]">
              <label className="block font-semibold mb-2 text-gray-800">
                Descripción del producto <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <FaTag className="text-[#18c29c] mr-2" />
                <input
                  type="text"
                  placeholder="Ejemplo: Remera de algodón negra premium"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex-1 min-w-[250px]">
              <label className="block font-semibold mb-2 text-gray-800">
                SKU <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <FaBoxes className="text-[#18c29c] mr-2" />
                <input
                  type="text"
                  placeholder="SKU de producto"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-800">Fotos</label>
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="flex-1 min-w-[200px] border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center p-4 min-h-[120px] cursor-pointer hover:border-[#18c29c] transition"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <FaCamera className="text-3xl text-gray-400 mb-2" />
                  <span className="text-gray-700 text-sm text-center">
                    {idx === 1
                      ? "Sube la vista frontal"
                      : idx === 2
                      ? "Prueba diferentes ángulos"
                      : "Muestra variantes"}
                  </span>
                  {idx === 1 && (
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-700 mt-2">
              Tamaño mínimo recomendado: <span className="text-[#18c29c]">1024px</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-6 flex flex-wrap gap-6">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm mb-1 text-gray-800 flex items-center gap-1">
                <FaDollarSign className="text-[#18c29c]" /> Precio regular
              </label>
              <div className="flex items-center">
                <span className="bg-gray-100 px-3 py-2 rounded-l border border-gray-300 border-r-0 text-gray-700">$</span>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-r px-3 py-2 focus:outline-[#18c29c] text-gray-900"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm mb-1 text-gray-800 flex items-center gap-1">
                <FaDollarSign className="text-[#18c29c]" /> Costo
              </label>
              <div className="flex items-center">
                <span className="bg-gray-100 px-3 py-2 rounded-l border border-gray-300 border-r-0 text-gray-700">$</span>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-r px-3 py-2 focus:outline-[#18c29c] text-gray-900"
                  min="0"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => handleInputChange('cost_price', e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm mb-1 text-gray-800 flex items-center gap-1">
                <FaBoxes className="text-[#18c29c]" /> Stock de seguridad
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900"
                min="0"
                step="0.0001"
                placeholder="Cantidad mínima recomendada"
                value={formData.safety_stock}
                onChange={(e) => handleInputChange('safety_stock', e.target.value)}
              />
            </div>
            <div className="flex items-center mt-4 md:mt-7 min-w-[250px]">
              <input 
                type="checkbox" 
                className="mr-2 accent-[#18c29c]"
                checked={formData.show_price}
                onChange={(e) => handleInputChange('show_price', e.target.checked)}
              />
              <span className="text-sm text-gray-800">Mostrar precio en la tienda</span>
            </div>
          </div>

          {/* Supplier */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-800">
              Proveedor (opcional)
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900"
              value={selectedSupplier?.id || ''}
              onChange={(e) => {
                const supplierId = e.target.value;
                const supplier = suppliers.find(s => s.id === parseInt(supplierId));
                setSelectedSupplier(supplier || null);
              }}
            >
              <option value="">Seleccionar proveedor</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Type */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-800">Tipo de producto</label>
            <div className="flex gap-6 flex-wrap">
              <label className="flex items-center text-gray-800">
                <input
                  type="radio"
                  name="product_type"
                  value="physical"
                  checked={formData.product_type === "physical"}
                  onChange={(e) => handleInputChange('product_type', e.target.value)}
                  className="accent-[#18c29c] mr-2"
                />
                Físico
              </label>
              <label className="flex items-center text-gray-800">
                <input
                  type="radio"
                  name="product_type"
                  value="digital"
                  checked={formData.product_type === "digital"}
                  onChange={(e) => handleInputChange('product_type', e.target.value)}
                  className="accent-[#18c29c] mr-2"
                />
                Digital o Servicio
              </label>
            </div>
          </div>

          {/* Weight and dimensions - Only for physical products */}
          {formData.product_type === "physical" && (
            <div className="mb-6 flex flex-wrap gap-6">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm mb-1 text-gray-800 flex items-center gap-1">
                  <FaWeight className="text-[#18c29c]" /> Peso (kg)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900"
                  min="0"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm mb-1 text-gray-800 flex items-center gap-1">
                  <FaRulerVertical className="text-[#18c29c]" /> Altura (cm)
                </label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900" 
                  min="0"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm mb-1 text-gray-800 flex items-center gap-1">
                  <FaRulerHorizontal className="text-[#18c29c]" /> Ancho (cm)
                </label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900" 
                  min="0"
                  value={formData.width}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm mb-1 text-gray-800 flex items-center gap-1">
                  <FaCube className="text-[#18c29c]" /> Profundidad (cm)
                </label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900" 
                  min="0"
                  value={formData.depth}
                  onChange={(e) => handleInputChange('depth', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Unit Type and Base Unit */}
          <div className="mb-6 flex flex-wrap gap-6">
            <div className="flex-1 min-w-[250px]">
              <label className="block font-semibold mb-2 text-gray-800">
                Tipo de Unidad <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900"
                value={formData.unit_type}
                onChange={(e) => handleInputChange('unit_type', e.target.value)}
                required
              >
                <option value="count">Recuento (Unidades)</option>
                <option value="weight">Peso (Kilos/Gramos)</option>
                <option value="volume">Volumen (Litros/Mililitros)</option>
              </select>
            </div>
            <div className="flex-1 min-w-[250px]">
              <label className="block font-semibold mb-2 text-gray-800">
                Unidad Base <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900"
                value={formData.base_unit_name}
                onChange={(e) => handleInputChange('base_unit_name', e.target.value)}
                required
              >
                <option value="unit">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="g">Gramo</option>
                <option value="l">Litro</option>
                <option value="ml">Mililitro</option>
              </select>
            </div>
          </div>

          {/* Product Units Conversion Table */}
          {formData.unit_type && formData.base_unit_name && (
            <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaBoxes className="text-[#18c29c]" />
                Unidades de Conversión
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Define las diferentes unidades de empaque/venta y su factor de conversión respecto a la unidad base ({formData.base_unit_name}).
              </p>

              {/* Add New Unit Form */}
              <div className="bg-white p-4 rounded border border-gray-300 mb-4">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium mb-1 text-gray-800">
                      Nombre de la Unidad
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900"
                      placeholder="ej: Caja, Docena, Pallet"
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium mb-1 text-gray-800">
                      Factor de Conversión
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900"
                      placeholder="ej: 12 (si 1 caja = 12 unidades)"
                      min="0.0001"
                      step="0.0001"
                      value={newUnitFactor}
                      onChange={(e) => setNewUnitFactor(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddProductUnit}
                    className="bg-[#18c29c] text-white px-6 py-2 rounded font-medium hover:bg-[#15a884] transition"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {/* Units Table */}
              {productUnits.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300 rounded">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
                          Unidad
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
                          Factor de Conversión
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
                          Equivalencia
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-300">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {productUnits.map((unit, index) => (
                        <tr key={unit.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 border-b border-gray-200">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm"
                              value={unit.name}
                              onChange={(e) => handleEditProductUnit(unit.id, 'name', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-3 border-b border-gray-200">
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm"
                              min="0.0001"
                              step="0.0001"
                              value={unit.conversion_factor}
                              onChange={(e) => handleEditProductUnit(unit.id, 'conversion_factor', parseFloat(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                            1 {unit.name} = {unit.conversion_factor} {formData.base_unit_name}
                          </td>
                          <td className="px-4 py-3 text-center border-b border-gray-200">
                            <button
                              type="button"
                              onClick={() => handleRemoveProductUnit(unit.id)}
                              className="text-red-600 hover:text-red-800 transition font-medium text-sm"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {productUnits.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No hay unidades de conversión definidas. Agrega una unidad para comenzar.
                </div>
              )}
            </div>
          )}

          {/* Categories and Subcategories */}
          <div className="mb-8 flex flex-wrap gap-6">
            <div className="flex-1 min-w-[250px]">
              <label className="block font-semibold mb-2 text-gray-800">Categoría</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory(''); // Reset subcategory when category changes
                }}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[250px]">
              <label className="block font-semibold mb-2 text-gray-800">Subcategoría</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                disabled={!selectedCategory}
              >
                <option value="">Seleccionar subcategoría</option>
                {filteredSubcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#18c29c] text-white px-6 py-2 rounded font-semibold hover:bg-[#15a884] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && <FaSpinner className="animate-spin" />}
              {submitting 
                ? (product ? 'Actualizando Producto...' : 'Creando Producto...') 
                : (product ? 'Actualizar Producto' : 'Guardar Producto')
              }
            </button>
          </div>
        </form>
        

        
        {/* Alert Component */}
        {alert && (
          <Alert
            type={alert.type}
            title={alert.title}
            text={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
      </div>
    </div>
  );
};