"use client";
import React, { useRef, useState, useEffect } from "react";
import { FaCamera, FaYoutube, FaDollarSign, FaTag, FaWeight, FaRulerVertical, FaRulerHorizontal, FaCube, FaBoxes, FaSpinner } from "react-icons/fa";
import SupplierModal from "../suppliers/SupplierModal";
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
    storage_unit: '',
    show_price: true,
    promotional_price: '',
    video_url: '',
    product_type: 'physical'
  });
  
  // Related data states
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  // Selected values
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierCost, setSupplierCost] = useState('');
  
  // New items
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  
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
            storage_unit: product.storage_unit || '',
            show_price: product.show_price !== false,
            promotional_price: product.promotional_price || '',
            video_url: product.video_url || '',
            product_type: product.product_type || 'physical'
          });
          
          setSelectedCategory(product.category?.id || '');
          setSelectedSubcategory(product.subcategory?.id || '');
          setSelectedSupplier(product.supplier || null);
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

  // Handle category creation
  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      const categoryData = { name: newCategory.trim() };
      const newCat = await productService.createCategory(categoryData);
      setCategories(prev => [...prev, newCat]);
      setSelectedCategory(newCat.id);
      setNewCategory('');
      showAlert('success', 'Categoría creada', `Categoría "${newCategory.trim()}" fue creada con éxito`);
    } catch (error) {
      console.error('Error creating category:', error);
      
      const validationErrors = parseValidationErrors(error);
      if (validationErrors) {
        showAlert('danger', 'Error de validación', validationErrors);
      } else {
        showAlert('danger', 'Error', 'Error al crear la categoría. Por favor, inténtalo de nuevo.');
      }
    }
  };

  // Handle subcategory creation
  const handleCreateSubcategory = async () => {
    if (!newSubcategory.trim() || !selectedCategory) return;
    
    try {
      const subcategoryData = { 
        name: newSubcategory.trim(),
        category: selectedCategory 
      };
      const newSubcat = await productService.createSubcategory(subcategoryData);
      setSubcategories(prev => [...prev, newSubcat]);
      setSelectedSubcategory(newSubcat.id);
      setNewSubcategory('');
      showAlert('success', 'Subcategoría creada', `Subcategoría "${newSubcategory.trim()}" fue creada con éxito`);
    } catch (error) {
      console.error('Error creating subcategory:', error);
      
      const validationErrors = parseValidationErrors(error);
      if (validationErrors) {
        showAlert('danger', 'Error de validación', validationErrors);
      } else {
        showAlert('danger', 'Error', 'Error al crear la subcategoría. Por favor, inténtalo de nuevo.');
      }
    }
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
            storage_unit: '',
            show_price: true,
            promotional_price: '',
            video_url: '',
            product_type: 'physical'
          });
          setSelectedCategory('');
          setSelectedSubcategory('');
          setSelectedSupplier(null);
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
    sub => sub.category === selectedCategory || sub.category_id === selectedCategory
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
  }

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

          {/* Video */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <FaYoutube className="text-[#FF0000]" /> Video URL
            </label>
            <input
              type="url"
              placeholder="YouTube or Vimeo link about your product"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900"
              value={formData.video_url}
              onChange={(e) => handleInputChange('video_url', e.target.value)}
            />
            <span className="text-xs text-gray-500">
              e.g: https://www.youtube.com/watch?v=1sHECDDS-zc
            </span>
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
              ¿El producto proviene de un proveedor externo?
            </label>
            <button
              type="button"
              className="bg-[#18c29c] text-white px-4 py-2 rounded hover:bg-[#15a884] transition"
              onClick={() => setSupplierModalOpen(true)}
            >
              {selectedSupplier ? "Cambiar proveedor" : "Seleccionar proveedor"}
            </button>
            {selectedSupplier && (
              <div className="mt-2 text-gray-900">
                <span className="font-semibold">Proveedor:</span> {selectedSupplier.name} <br />
                {supplierCost && (
                  <>
                    <span className="font-semibold">Costo:</span> ${supplierCost}
                  </>
                )}
              </div>
            )}
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
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm mb-1 text-gray-800 flex items-center gap-1">
                  <FaBoxes className="text-[#18c29c]" /> Unidad de Almacenamiento
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#18c29c] text-gray-900"
                  placeholder="e.g: Caja, Bolsa, Pallet"
                  value={formData.storage_unit}
                  onChange={(e) => handleInputChange('storage_unit', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Categories and Subcategories */}
          <div className="mb-8 flex flex-wrap gap-6">
            <div className="flex-1 min-w-[250px]">
              <label className="block font-semibold mb-2 text-gray-800">Categoría</label>
              <div className="flex gap-2 mb-2">
                <select
                  className="border border-gray-300 rounded px-3 py-2 text-gray-900 w-full"
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
                <input
                  type="text"
                  className="border border-gray-300 rounded px-3 py-2 text-gray-900 w-full"
                  placeholder="Nueva categoría"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button
                  type="button"
                  className="bg-[#18c29c] text-white px-3 py-2 rounded hover:bg-[#15a884] transition whitespace-nowrap"
                  onClick={handleCreateCategory}
                  disabled={!newCategory.trim()}
                >
                  Crear
                </button>
              </div>
            </div>
            <div className="flex-1 min-w-[250px]">
              <label className="block font-semibold mb-2 text-gray-800">Subcategoría</label>
              <div className="flex gap-2">
                <select
                  className="border border-gray-300 rounded px-3 py-2 text-gray-900 w-full"
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  disabled={!selectedCategory}
                >
                  <option value="">Seleccionar subcategoría</option>
                  {filteredSubcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  className="border border-gray-300 rounded px-3 py-2 text-gray-900 w-full"
                  placeholder="Nueva subcategoría"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  disabled={!selectedCategory}
                />
                <button
                  type="button"
                  className="bg-[#18c29c] text-white px-3 py-2 rounded hover:bg-[#15a884] transition whitespace-nowrap"
                  onClick={handleCreateSubcategory}
                  disabled={!selectedCategory || !newSubcategory.trim()}
                >
                  Crear
                </button>
              </div>
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
        
        {/* Supplier Modal */}
        <SupplierModal
          open={supplierModalOpen}
          onClose={() => setSupplierModalOpen(false)}
          onSelectSupplier={(supplier, cost) => {
            setSelectedSupplier(supplier);
            setSupplierCost(cost);
          }}
          suppliers={suppliers}
        />
        
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