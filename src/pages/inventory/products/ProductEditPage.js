"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import SideBar from "@/components/ui/SideBar";
import ProductForm from "@/components/products/ProductForm";
import useProductService from "@/services/productService";
import { FaHome, FaBoxes, FaPlus, FaList, FaTag, FaWarehouse, FaEdit, FaSpinner } from "react-icons/fa";

export default function ProductEditPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id;
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const productService = useProductService();

    // Sidebar items
    const sidebarItems = [
            { label: "Inicio", icon: <FaHome />, onClick: () => router.push("/dashboard") },
            { 
                label: "Productos", 
                icon: <FaBoxes />, 
                dropdown: [
                    { label: "Lista", icon: <FaList />, onClick: () => router.push("/products") },
                    { label: "Agregar", icon: <FaPlus />, onClick: () => router.push("/products/create") },
                    { label: "Categorías", icon: <FaTag />, onClick: () => router.push("/products/categories") },
                    { label: "Stock", icon: <FaWarehouse />, onClick: () => router.push("/products/stock") },
                ]
            },
    ];

    // Cargar producto para editar
    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                setError("ID de producto no válido");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                // Obtener el producto específico por ID
                const foundProduct = await productService.getProductById(productId);
                
                if (!foundProduct) {
                    setError("Producto no encontrado");
                    return;
                }
                
                setProduct(foundProduct);
            } catch (err) {
                setError('Error al cargar el producto. Por favor, intenta nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    // Manejar actualización exitosa del producto
    const handleProductUpdated = () => {
        router.push("/products");
    };

    // Manejar cancelación
    const handleCancel = () => {
        router.push("/products");
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <SideBar 
                    items={sidebarItems}
                    onProfile={() => router.push("/profile")}
                    onSupport={() => alert("Support")}
                    onLogout={() => alert("Logout")}
                />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <FaSpinner className="animate-spin mx-auto h-8 w-8 text-[#18c29c] mb-4" />
                        <p className="text-gray-600">Loading product...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <SideBar 
                    items={sidebarItems}
                    onProfile={() => router.push("/profile")}
                    onSupport={() => alert("Support")}
                    onLogout={() => alert("Logout")}
                />
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                            <div className="text-red-500 mb-4">
                                <FaEdit className="mx-auto h-12 w-12" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar el producto</h2>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={handleCancel}
                                className="bg-[#18c29c] text-white px-6 py-2 rounded-lg hover:bg-[#15a884] transition-colors"
                            >
                                Volver a productos
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <SideBar 
                items={sidebarItems}
                onProfile={() => router.push("/profile")}
                onSupport={() => alert("Support")}
                onLogout={() => alert("Logout")}
            />
            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                {/* Product Form */}
                <ProductForm
                    product={product}
                    isEditing={true}
                    onProductCreated={handleProductUpdated}
                    onCancel={handleCancel}
                />
            </main>
        </div>
    );
}