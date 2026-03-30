"use client";
import React from "react";
import Link from "next/link";
import { FaBoxes, FaEdit, FaTrash } from "react-icons/fa";
import { formatPrice, formatDate } from "@/utils/formatData";

export default function ProductsTable({ 
    products = [], 
    onDeleteProduct, 
    onReactivateProduct 
}) {
    // Badge de stock
    const getStockBadge = (stock) => {
        if (stock <= 5) {
            return <span className="px-2 py-1 text-xs text-center font-medium bg-red-100 text-red-800 rounded-full">Bajo</span>;
        } else if (stock <= 15) {
            return <span className="px-2 py-1 text-xs text-center font-medium bg-yellow-100 text-yellow-800 rounded-full">Medio</span>;
        } else {
            return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Alto</span>;
        }
    };

    return (
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
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#18c29c] to-[#15a884] rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FaBoxes className="text-white text-lg" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {product.description 
                                                    ? (product.description.length > 15 
                                                        ? product.description.substring(0, 15) + '...' 
                                                        : product.description)
                                                    : 'Sin descripción'}
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
                                <td className="px-6 py-4">
                                    {product.status === 'discontinued' ? (
                                        <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">Descontinuado</span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Activo</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {product.status === 'discontinued' ? (
                                            <button
                                                onClick={() => onReactivateProduct(product)}
                                                className="text-gray-400 hover:text-green-600 transition-colors p-1"
                                                title="Reactivar producto"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <>
                                                <Link
                                                    href={`/products/edit/${product.id}`}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </Link>
                                                <button 
                                                    onClick={() => onDeleteProduct(product)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </>
                                        )}
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
                    {products.map((product) => (
                        <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#18c29c] to-[#15a884] rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FaBoxes className="text-white text-xl" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                {product.description 
                                                    ? (product.description.length > 12 
                                                        ? product.description.substring(0, 12) + '...' 
                                                        : product.description)
                                                    : 'Sin descripción'}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                SKU: {product.sku || 'Sin SKU'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-2">
                                            {product.status === 'discontinued' ? (
                                                <button
                                                    onClick={() => onReactivateProduct(product)}
                                                    className="text-gray-400 hover:text-green-600 transition-colors p-1"
                                                    title="Reactivar producto"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <>
                                                    <Link
                                                        href={`/products/${product.id}/edit`}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                                    >
                                                        <FaEdit className="text-sm" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => onDeleteProduct(product)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                    >
                                                        <FaTrash className="text-sm" />
                                                    </button>
                                                </>
                                            )}
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
            {products.length === 0 && (
                <div className="text-center py-12">
                    <FaBoxes className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        No se encontraron productos para mostrar.
                    </p>
                </div>
            )}
        </div>
    );
}
