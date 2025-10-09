"use client";
import React, { useState, useEffect } from "react";
import SideBar from "@/components/ui/SideBar";
import Link from "next/link";
import ProtectedRoute from "@/services/ProtectedRoute";
import useProductService from "@/services/productService";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { FaHome, FaBoxes, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaTag, FaWarehouse, FaList, FaSpinner } from "react-icons/fa";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["Todas"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const productService = useProductService();

  // Cargar datos desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar productos y categorías en paralelo
        const [productsData, categoriesData] = await Promise.all([
          productService.getAllProducts(),
          productService.getAllCategories()
        ]);

        setProducts(productsData || []);
        
        // Crear lista de categorías con "Todas" al inicio
        const categoryNames = categoriesData?.map(cat => cat.name) || [];
        setCategories(["Todas", ...categoryNames]);
        
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Manejar eliminación de producto
  const handleDeleteProduct = (product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const confirmDeleteProduct = async () => {
    if (!deleteModal.product) return;
    
    try {
      setIsDeleting(true);
      await productService.deleteProduct(deleteModal.product.id);
      setProducts(products.filter(product => product.id !== deleteModal.product.id));
      setDeleteModal({ isOpen: false, product: null });
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      alert('Error al eliminar el producto. Por favor, intenta nuevamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, product: null });
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (product.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (product.category?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "Todas" || product.category?.name === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Badge de stock
  const getStockBadge = (stock) => {
    if (stock <= 5) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Stock Bajo</span>;
    } else if (stock <= 15) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Stock Medio</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Stock Alto</span>;
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-[#f8fafc]">
        <SideBar
          onProfile={() => window.location.href = "/profile"}
          onSupport={() => showAlert("info", "Soporte", "Funcionalidad en desarrollo")}
          onLogout={() => showAlert("info", "Logout", "Funcionalidad en desarrollo")}
        />
        <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Productos</h1>
                  <p className="text-gray-600 mt-1">Gestiona tu inventario de productos</p>
                </div>
                <Link
                  href="/products/create"
                  className="inline-flex items-center gap-2 bg-[#18c29c] text-white px-4 py-2 rounded-lg hover:bg-[#15a884] transition-colors font-medium shadow-sm"
                >
                  <FaPlus className="text-sm" />
                  Agregar Producto
                </Link>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FaSpinner className="animate-spin mx-auto h-8 w-8 text-[#18c29c] mb-4" />
                  <p className="text-gray-600">Cargando productos...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
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
            )}

            {/* Content - Solo mostrar si no hay loading ni error */}
            {!loading && !error && (
              <>
                {/* Filtros y búsqueda */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Barra de búsqueda */}
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por SKU, descripción o categoría..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filtro de categoría */}
                <div className="lg:w-64">
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botón de filtros avanzados */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaFilter className="text-sm" />
                  Filtros
                </button>
              </div>

              {/* Resultados */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>
                  Mostrando {filteredProducts.length} de {products.length} productos
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
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Proveedor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Fecha
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
                                {product.description || 'Sin descripción'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                SKU: {product.sku || 'Sin SKU'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {product.category?.name || 'Sin categoría'}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {product.subcategory?.name || 'Sin subcategoría'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatPrice(product.price || 0)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Costo: {formatPrice(product.cost_price || 0)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-900">
                              {product.stock_total || 0} unidades
                            </span>
                            {getStockBadge(product.stock_total || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{product.supplier?.name || 'Sin proveedor'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{product.created_at ? formatDate(product.created_at) : 'Sin fecha'}</p>
                          <p className="text-xs text-gray-500">Actualizado: {product.updated_at ? formatDate(product.updated_at) : 'Sin fecha'}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-gray-400 hover:text-[#18c29c] transition-colors p-1">
                              <FaEye className="text-sm" />
                            </button>
                            <Link
                              href={`/products/edit/${product.id}`}
                              className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                            >
                              <FaEdit className="text-sm" />
                            </Link>
                            <button 
                              onClick={() => handleDeleteProduct(product)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            >
                              <FaTrash className="text-sm" />
                            </button>
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
                                {product.description || 'Sin descripción'}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                SKU: {product.sku || 'Sin SKU'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <button className="text-gray-400 hover:text-[#18c29c] transition-colors p-1">
                                <FaEye className="text-sm" />
                              </button>
                              <Link
                                href={`/products/${product.id}/edit`}
                                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                              >
                                <FaEdit className="text-sm" />
                              </Link>
                              <button 
                                onClick={() => handleDeleteProduct(product)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              >
                                <FaTrash className="text-sm" />
                              </button>
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
                      : "Comienza agregando tu primer producto."}
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/products/create"
                      className="inline-flex items-center gap-2 bg-[#18c29c] text-white px-4 py-2 rounded-lg hover:bg-[#15a884] transition-colors text-sm font-medium"
                    >
                      <FaPlus className="text-sm" />
                      Agregar Producto
                    </Link>
                  </div>
                </div>
              )}
            </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteProduct}
        productName={deleteModal.product?.description || deleteModal.product?.sku}
        isDeleting={isDeleting}
      />
    </ProtectedRoute>
  );
}