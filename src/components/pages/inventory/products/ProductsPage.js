"use client";
import React, { useState } from "react";
import SideBar from "@/components/ui/SideBar";
import Alert from "@/components/ui/Alert";
import Link from "next/link";
import useProductService from "@/services/productService";
import ProductsTable from "@/components/modules/products/ProductsTable";
import { FaPlus } from "react-icons/fa";

export default function ProductsPage() {
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteType, setDeleteType] = useState('discontinue'); // 'discontinue' o 'permanent'
    const [permanentDeleteConfirmModal, setPermanentDeleteConfirmModal] = useState({ isOpen: false, product: null });
    const [reactivateModal, setReactivateModal] = useState({ isOpen: false, product: null });
    const [isReactivating, setIsReactivating] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [alert, setAlert] = useState(null);

    const productService = useProductService();

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        if (type === 'success') {
            setTimeout(() => setAlert(null), 5000);
        }
    };

    // Manejar eliminación de producto
    const handleDeleteProduct = (product) => {
        setDeleteModal({ isOpen: true, product });
    };

    const confirmDeleteProduct = async () => {
        if (!deleteModal.product) return;
        
        try {
            setIsDeleting(true);
            
            if (deleteType === 'discontinue') {
                // Eliminación lógica - marcar como descontinuado
                await productService.deleteProduct(deleteModal.product.id);
                setDeleteModal({ isOpen: false, product: null });
                setDeleteType('discontinue');
                // Trigger refresh de la tabla
                setRefreshTrigger(prev => prev + 1);
            } else {
                // Eliminación permanente - abrir segundo modal de confirmación
                setPermanentDeleteConfirmModal({ isOpen: true, product: deleteModal.product });
                setDeleteModal({ isOpen: false, product: null });
                setDeleteType('discontinue');
            }
        } catch (err) {
            alert('Error al eliminar el producto. Por favor, intenta nuevamente.');
        } finally {
            setIsDeleting(false);
        }
    };

    const closeDeleteModal = () => {
        if (!isDeleting) {
            setDeleteModal({ isOpen: false, product: null });
            setDeleteType('discontinue');
        }
    };

    const confirmPermanentDelete = async () => {
        if (!permanentDeleteConfirmModal.product) return;
        
        try {
            setIsDeleting(true);
            // Eliminación física permanente
            await productService.permanentDeleteProduct(permanentDeleteConfirmModal.product.id);
            setPermanentDeleteConfirmModal({ isOpen: false, product: null });
            // Trigger refresh de la tabla
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            alert('Error al eliminar el producto permanentemente. Por favor, intenta nuevamente.');
        } finally {
            setIsDeleting(false);
        }
    };

    const closePermanentDeleteConfirmModal = () => {
        if (!isDeleting) {
            setPermanentDeleteConfirmModal({ isOpen: false, product: null });
        }
    };

    // Reactivar producto descontinuado
    const handleReactivateProduct = (product) => {
        setReactivateModal({ isOpen: true, product });
    };

    const confirmReactivateProduct = async () => {
        if (!reactivateModal.product) return;

        try {
            setIsReactivating(true);
            await productService.reactivateProduct(reactivateModal.product.id);
            setReactivateModal({ isOpen: false, product: null });
            // Trigger refresh de la tabla
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            console.error('Error al reactivar producto:', err);
            alert('Error al reactivar el producto. Por favor, intenta nuevamente.');
        } finally {
            setIsReactivating(false);
        }
    };

    const closeReactivateModal = () => {
        if (!isReactivating) {
            setReactivateModal({ isOpen: false, product: null });
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            {/* Alert component */}
            {alert && (
                <Alert
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
            
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

                    {/* Tabla de productos */}
                    <ProductsTable
                        key={refreshTrigger}
                        onDeleteProduct={handleDeleteProduct}
                        onReactivateProduct={handleReactivateProduct}
                        onShowAlert={showAlert}
                    />
                </div>
            </main>
            
            {/* Modal de confirmación de eliminación */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar Producto
                            </h3>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-gray-600 mb-4">
                                ¿Qué deseas hacer con el producto <span className="font-semibold text-gray-900">{deleteModal.product?.description}</span>?
                            </p>

                            {/* Opciones */}
                            <div className="space-y-3">
                                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${deleteType === 'discontinue' ? 'border-[#18c29c] bg-[#18c29c]/5' : 'border-gray-200'}`}>
                                    <input
                                        type="radio"
                                        name="deleteType"
                                        value="discontinue"
                                        checked={deleteType === 'discontinue'}
                                        onChange={(e) => setDeleteType(e.target.value)}
                                        className="mt-1 accent-[#18c29c]"
                                    />
                                    <div className="ml-3">
                                        <div className="font-semibold text-gray-900">Descontinuar producto</div>
                                        <div className="text-sm text-gray-600">El producto se marcará como descontinuado pero se mantendrá en el historial. Puedes reactivarlo después.</div>
                                    </div>
                                </label>

                                <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${deleteType === 'permanent' ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                                    <input
                                        type="radio"
                                        name="deleteType"
                                        value="permanent"
                                        checked={deleteType === 'permanent'}
                                        onChange={(e) => setDeleteType(e.target.value)}
                                        className="mt-1 accent-red-500"
                                    />
                                    <div className="ml-3">
                                        <div className="font-semibold text-gray-900">Eliminar permanentemente</div>
                                        <div className="text-sm text-gray-600">El producto será eliminado de forma permanente y toda la información relacionada a el se perderá. Esta acción no se puede deshacer.</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 p-6 pt-0 border-t border-gray-200 pt-5">
                            <button
                                onClick={closeDeleteModal}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeleteProduct}
                                disabled={isDeleting}
                                className={`flex-1 px-6 py-3 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                                    deleteType === 'discontinue' 
                                        ? 'bg-[#18c29c] hover:bg-[#15a884]' 
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando...
                                    </>
                                ) : (
                                    deleteType === 'discontinue' ? 'Descontinuar' : 'Eliminar Permanentemente'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de reactivación */}
            {reactivateModal.isOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reactivar Producto
                            </h3>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-gray-600 mb-4">
                                ¿Estás seguro de que deseas reactivar el producto <span className="font-semibold text-gray-900">{reactivateModal.product?.description}</span>?
                            </p>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-800">
                                    El producto volverá a estar disponible y podrás gestionarlo normalmente.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 p-6 pt-0 border-t border-gray-200 pt-5">
                            <button
                                onClick={closeReactivateModal}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                disabled={isReactivating}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmReactivateProduct}
                                disabled={isReactivating}
                                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                {isReactivating ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Reactivando...
                                    </>
                                ) : (
                                    'Reactivar Producto'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación final para eliminación permanente */}
            {permanentDeleteConfirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border-2 border-red-500">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 bg-red-50">
                            <h3 className="text-xl font-bold text-red-900 flex items-center gap-2">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                ⚠️ Confirmación Final
                            </h3>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-gray-900 font-semibold mb-3">
                                Esta acción es IRREVERSIBLE
                            </p>
                            <p className="text-gray-600 mb-4">
                                Estás a punto de eliminar permanentemente el producto <span className="font-bold text-red-600">{permanentDeleteConfirmModal.product?.description}</span>.
                            </p>
                            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                                <ul className="text-sm text-red-800 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-600 font-bold">•</span>
                                        <span>El producto será eliminado de la base de datos</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-600 font-bold">•</span>
                                        <span>Se perderá todo el historial relacionado</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-600 font-bold">•</span>
                                        <span>Esta acción NO se puede deshacer</span>
                                    </li>
                                </ul>
                            </div>
                            <p className="text-gray-900 font-semibold mt-4">
                                ¿Estás completamente seguro de continuar?
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 p-6 pt-0 border-t border-gray-200 pt-5">
                            <button
                                onClick={closePermanentDeleteConfirmModal}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmPermanentDelete}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Eliminando...
                                    </>
                                ) : (
                                    'Sí, Eliminar Permanentemente'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}