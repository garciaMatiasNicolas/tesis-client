"use client";
import React, { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

export default function SupplierModal({ 
    open, 
    onClose, 
    onSelectSupplier, 
    onCreateSupplier,
    suppliers = [],
    mode = "select" // "select" para productos, "create" para página de proveedores
}) {
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [addingNew, setAddingNew] = useState(mode === "create");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [newSupplier, setNewSupplier] = useState({
        name: "",
        fantasy_name: "",
        email: "",
        phone: "",
        website: "",
        cuit: "",
        country: "",
        state: "",
        postal_code: "",
        city: "",
        address: "",
    });

    // Asegurar que suppliers siempre sea un array
    const validSuppliers = Array.isArray(suppliers) ? suppliers : [];

    const handleSelectSupplier = () => {
        const supplier = validSuppliers.find(s => s.id === parseInt(selectedSupplier));
        if (supplier) {
            onSelectSupplier(supplier);
            resetForm();
            onClose();
        }
    };

    const handleAddSupplier = async () => {
        if (!newSupplier.name.trim()) {
            setErrors({ name: ['El nombre es obligatorio'] });
            return;
        }

        setLoading(true);
        setErrors({});
        
        try {
            if (mode === "create") {
                // Modo crear: usar la función del padre que maneja la API
                if (onCreateSupplier) {
                    const result = await onCreateSupplier(newSupplier);
                    if (result && result.success) {
                        resetForm();
                        onClose();
                    } else if (result && result.validationErrors) {
                        setErrors(result.validationErrors);
                    }
                }
            } else {
                // Modo seleccionar: crear y seleccionar con costo (para productos)
                if (newSupplier.name) {
                    onSelectSupplier(newSupplier);
                    resetForm();
                    onClose();
                }
            }
        } catch (error) {
            console.error('Error en handleAddSupplier:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedSupplier("");
        setAddingNew(mode === "create");
        setErrors({});
        setLoading(false);
        setNewSupplier({
            name: "",
            fantasy_name: "",
            email: "",
            phone: "",
            website: "",
            cuit: "",
            country: "",
            state: "",
            postal_code: "",
            city: "",
            address: "",
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                    onClick={handleClose}
                >
                    <FaTimes size={20} />
                </button>
                
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                    {mode === "create" ? "Agregar Proveedor" : "Proveedor del Producto"}
                </h2>
                
                {/* Modo seleccionar (desde productos) */}
                {mode === "select" && !addingNew ? (
                <>
                    <label className="block mb-2 text-gray-800 font-semibold">Seleccionar Proveedor</label>
                    
                    {validSuppliers.length === 0 ? (
                        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded text-center">
                            <p className="text-gray-600 text-sm">No hay proveedores disponibles</p>
                        </div>
                    ) : (
                        <select
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                        >
                            <option value="">Selecciona un proveedor</option>
                            {validSuppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                            ))}
                        </select>
                    )}
                    
                    <div className="flex justify-between">
                        <button
                            type="button"
                            className="bg-[#18c29c] text-white px-4 py-2 rounded hover:bg-[#15a884] transition disabled:opacity-50"
                            onClick={handleSelectSupplier}
                            disabled={!selectedSupplier || validSuppliers.length === 0}
                        >
                            Seleccionar
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-2 text-[#18c29c] hover:underline"
                            onClick={() => setAddingNew(true)}
                        >
                            <FaPlus /> Agregar nuevo proveedor
                        </button>
                    </div>
                </>
                ) : (
                /* Formulario para crear nuevo proveedor */
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                        {mode === "create" ? "Información del Proveedor" : "Nuevo Proveedor"}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <input
                                className={`w-full border rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Nombre *"
                                value={newSupplier.name}
                                onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>
                            )}
                        </div>
                        <div>
                            <input
                                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                placeholder="Nombre de Fantasía"
                                value={newSupplier.fantasy_name}
                                onChange={e => setNewSupplier({ ...newSupplier, fantasy_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <input
                                className={`w-full border rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Correo Electrónico"
                                type="email"
                                value={newSupplier.email}
                                onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
                            )}
                        </div>
                        <div>
                            <input
                                className={`w-full border rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent ${
                                    errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Teléfono"
                                value={newSupplier.phone}
                                onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-xs mt-1">{errors.phone[0]}</p>
                            )}
                        </div>
                        <div>
                            <input
                                className={`w-full border rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent ${
                                    errors.website ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Sitio Web (ej: https://ejemplo.com)"
                                type="url"
                                value={newSupplier.website}
                                onChange={e => setNewSupplier({ ...newSupplier, website: e.target.value })}
                            />
                            {errors.website && (
                                <p className="text-red-500 text-xs mt-1">{errors.website[0]}</p>
                            )}
                        </div>
                        <div>
                            <input
                                className={`w-full border rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent ${
                                    errors.cuit ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="CUIT (11 dígitos)"
                                value={newSupplier.cuit}
                                onChange={e => setNewSupplier({ ...newSupplier, cuit: e.target.value })}
                            />
                            {errors.cuit && (
                                <p className="text-red-500 text-xs mt-1">{errors.cuit[0]}</p>
                            )}
                        </div>
                        <div>
                            <input
                                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                placeholder="País"
                                value={newSupplier.country}
                                onChange={e => setNewSupplier({ ...newSupplier, country: e.target.value })}
                            />
                        </div>
                        <div>
                            <input
                                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                placeholder="Provincia/Estado"
                                value={newSupplier.state}
                                onChange={e => setNewSupplier({ ...newSupplier, state: e.target.value })}
                            />
                        </div>
                        <div>
                            <input
                                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                placeholder="Código Postal"
                                value={newSupplier.postal_code}
                                onChange={e => setNewSupplier({ ...newSupplier, postal_code: e.target.value })}
                            />
                        </div>
                        <div>
                            <input
                                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                placeholder="Ciudad"
                                value={newSupplier.city}
                                onChange={e => setNewSupplier({ ...newSupplier, city: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <input
                                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                placeholder="Dirección"
                                value={newSupplier.address}
                                onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })}
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-between mt-4">
                        <button
                            type="button"
                            className={`px-4 py-2 rounded transition ${
                                loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-[#18c29c] hover:bg-[#15a884]'
                            } text-white`}
                            onClick={handleAddSupplier}
                            disabled={!newSupplier.name || loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Guardando...
                                </div>
                            ) : (
                                mode === "create" 
                                    ? "Guardar Proveedor" 
                                    : "Guardar y Seleccionar"
                            )}
                        </button>
                        
                        {mode === "select" && (
                            <button
                                type="button"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
                                onClick={() => setAddingNew(false)}
                            >
                                <FaTimes /> Cancelar
                            </button>
                        )}
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}