"use client";
import React, { useState, useEffect } from "react";
import { FaPlus, FaTimes, FaSpinner, FaSearch } from "react-icons/fa";
import georefService from "@/services/georefService";

export default function SupplierModal({ 
    open, 
    onClose, 
    onSelectSupplier, 
    onCreateSupplier,
    suppliers = [],
    mode = "select", // "select" para productos, "create" para página de proveedores, "edit" para editar
    supplierToEdit = null
}) {
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [addingNew, setAddingNew] = useState(mode === "create" || mode === "edit");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Estados para Georef API
    const [provincias, setProvincias] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [loadingProvincias, setLoadingProvincias] = useState(false);
    const [loadingCiudades, setLoadingCiudades] = useState(false);
    const [selectedProvinciaId, setSelectedProvinciaId] = useState(null);
    const [citySearchTerm, setCitySearchTerm] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    
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
        lead_time_days: "",
    });

    // Asegurar que suppliers siempre sea un array
    const validSuppliers = Array.isArray(suppliers) ? suppliers : [];

    // Cargar provincias al abrir el modal
    useEffect(() => {
        if (open) {
            loadProvincias();
        }
    }, [open]);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showCityDropdown && !event.target.closest('.relative')) {
                setShowCityDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCityDropdown]);

    // Cargar datos del proveedor al editar
    React.useEffect(() => {
        if (supplierToEdit && mode === "edit") {
            setNewSupplier({
                name: supplierToEdit.name || "",
                fantasy_name: supplierToEdit.fantasy_name || "",
                email: supplierToEdit.email || "",
                phone: supplierToEdit.phone || "",
                website: supplierToEdit.website || "",
                cuit: supplierToEdit.cuit || "",
                country: supplierToEdit.country || "",
                state: supplierToEdit.state || "",
                postal_code: supplierToEdit.postal_code || "",
                city: supplierToEdit.city || "",
                address: supplierToEdit.address || "",
                lead_time_days: supplierToEdit.lead_time_days || "",
            });
            setAddingNew(true);
            
            // Si tiene provincia y es Argentina, buscar el ID y cargar ciudades
            if (supplierToEdit.state && supplierToEdit.country === 'Argentina') {
                const provincia = provincias.find(p => p.nombre === supplierToEdit.state);
                if (provincia) {
                    setSelectedProvinciaId(provincia.id);
                    loadCiudades(provincia.id, provincia.nombre);
                }
            }
            
            // Establecer término de búsqueda de ciudad
            if (supplierToEdit.city) {
                setCitySearchTerm(supplierToEdit.city);
            }
        } else if (mode === "create") {
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
                lead_time_days: "",
            });
            setAddingNew(true);
        }
    }, [supplierToEdit, mode, open, provincias]);

    // Cargar provincias desde la API de Georef
    const loadProvincias = async () => {
        try {
            setLoadingProvincias(true);
            const data = await georefService.getProvincias();
            setProvincias(data);
        } catch (error) {
            console.error('Error loading provincias:', error);
        } finally {
            setLoadingProvincias(false);
        }
    };

    // Cargar ciudades cuando se selecciona una provincia
    const loadCiudades = async (provinciaId, provinciaNombre) => {
        try {
            setLoadingCiudades(true);
            setCiudades([]);
            const data = await georefService.getLocalidades(provinciaId, provinciaNombre);
            setCiudades(data);
        } catch (error) {
            console.error('Error loading ciudades:', error);
        } finally {
            setLoadingCiudades(false);
        }
    };

    // Manejar búsqueda de ciudades
    const handleCitySearch = async (searchTerm) => {
        setCitySearchTerm(searchTerm);
        
        if (searchTerm.length >= 2 && selectedProvinciaId) {
            try {
                setLoadingCiudades(true);
                const data = await georefService.searchLocalidades(searchTerm, selectedProvinciaId);
                setCiudades(data);
                setShowCityDropdown(true);
            } catch (error) {
                console.error('Error searching ciudades:', error);
            } finally {
                setLoadingCiudades(false);
            }
        } else if (searchTerm.length === 0 && selectedProvinciaId) {
            const provincia = provincias.find(p => p.id === selectedProvinciaId);
            if (provincia) {
                loadCiudades(selectedProvinciaId, provincia.nombre);
            }
        }
    };

    // Seleccionar ciudad del dropdown
    const selectCity = (cityName) => {
        setNewSupplier({ ...newSupplier, city: cityName });
        setCitySearchTerm(cityName);
        setShowCityDropdown(false);
    };

    // Manejar cambio de provincia
    const handleProvinciaChange = (e) => {
        const selectedId = e.target.value;
        const provincia = provincias.find(p => p.id === selectedId);
        
        if (provincia) {
            setSelectedProvinciaId(selectedId);
            setNewSupplier({ ...newSupplier, state: provincia.nombre, city: '' });
            setCitySearchTerm('');
            loadCiudades(selectedId, provincia.nombre);
        }
    };

    // Manejar cambio de país
    const handleCountryChange = (value) => {
        setNewSupplier({ ...newSupplier, country: value, state: '', city: '' });
        setSelectedProvinciaId(null);
        setCiudades([]);
        setCitySearchTerm('');
    };

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
            if (mode === "create" || mode === "edit") {
                // Modo crear o editar: usar la función del padre que maneja la API
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
        setAddingNew(mode === "create" || mode === "edit");
        setErrors({});
        setLoading(false);
        setSelectedProvinciaId(null);
        setCiudades([]);
        setCitySearchTerm('');
        setShowCityDropdown(false);
        if (mode !== "edit") {
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
                lead_time_days: "",
            });
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                    onClick={handleClose}
                >
                    <FaTimes size={20} />
                </button>
                
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                    {mode === "edit" ? "Editar Proveedor" : mode === "create" ? "Agregar Proveedor" : "Proveedor del Producto"}
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
                    <h3 className="text-lg font-semibold mb-6 text-gray-900">
                        {mode === "edit" ? "Actualizar Información del Proveedor" : mode === "create" ? "Información del Proveedor" : "Nuevo Proveedor"}
                    </h3>
                    
                    {/* Información Básica */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">Información Básica</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className={`w-full border rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all ${
                                        errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="Ej: Distribuidora López"
                                    value={newSupplier.name}
                                    onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <span>⚠</span> {errors.name[0]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de Fantasía
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                    placeholder="Ej: López S.A."
                                    value={newSupplier.fantasy_name}
                                    onChange={e => setNewSupplier({ ...newSupplier, fantasy_name: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Información de Contacto */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">Información de Contacto</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Correo Electrónico
                                </label>
                                <input
                                    className={`w-full border rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all ${
                                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="ejemplo@proveedor.com"
                                    type="email"
                                    value={newSupplier.email}
                                    onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <span>⚠</span> {errors.email[0]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono
                                </label>
                                <input
                                    className={`w-full border rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all ${
                                        errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="+54 11 1234-5678"
                                    value={newSupplier.phone}
                                    onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <span>⚠</span> {errors.phone[0]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sitio Web
                                </label>
                                <input
                                    className={`w-full border rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all ${
                                        errors.website ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="https://www.ejemplo.com"
                                    type="url"
                                    value={newSupplier.website}
                                    onChange={e => setNewSupplier({ ...newSupplier, website: e.target.value })}
                                />
                                {errors.website && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <span>⚠</span> {errors.website[0]}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Información Fiscal y Logística */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">Información Fiscal y Logística</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CUIT
                                </label>
                                <input
                                    className={`w-full border rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all ${
                                        errors.cuit ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="20-12345678-9"
                                    value={newSupplier.cuit}
                                    onChange={e => setNewSupplier({ ...newSupplier, cuit: e.target.value })}
                                />
                                {errors.cuit && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <span>⚠</span> {errors.cuit[0]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tiempo de Entrega (días)
                                    <span className="text-gray-500 text-xs ml-1">- Lead Time</span>
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                    placeholder="Ej: 7"
                                    type="number"
                                    min="0"
                                    value={newSupplier.lead_time_days}
                                    onChange={e => setNewSupplier({ ...newSupplier, lead_time_days: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Días estimados para la entrega de pedidos</p>
                            </div>
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">Dirección</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    País
                                </label>
                                <select
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                    value={newSupplier.country}
                                    onChange={e => handleCountryChange(e.target.value)}
                                >
                                    <option value="">Seleccione un país</option>
                                    <option value="Argentina">Argentina</option>
                                    <option value="Brasil">Brasil</option>
                                    <option value="Chile">Chile</option>
                                    <option value="Colombia">Colombia</option>
                                    <option value="México">México</option>
                                    <option value="Perú">Perú</option>
                                    <option value="Uruguay">Uruguay</option>
                                    <option value="Paraguay">Paraguay</option>
                                    <option value="Bolivia">Bolivia</option>
                                    <option value="Ecuador">Ecuador</option>
                                    <option value="Venezuela">Venezuela</option>
                                    <option value="España">España</option>
                                    <option value="Estados Unidos">Estados Unidos</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Provincia/Estado
                                    {newSupplier.country === 'Argentina' && loadingProvincias && (
                                        <FaSpinner className="inline ml-2 animate-spin text-gray-400 text-xs" />
                                    )}
                                </label>
                                {newSupplier.country === 'Argentina' ? (
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                        value={selectedProvinciaId || ''}
                                        onChange={handleProvinciaChange}
                                        disabled={loadingProvincias}
                                    >
                                        <option value="">Seleccione una provincia</option>
                                        {provincias.map(provincia => (
                                            <option key={provincia.id} value={provincia.id}>
                                                {provincia.nombre}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                        placeholder="Ej: Buenos Aires"
                                        value={newSupplier.state}
                                        onChange={e => setNewSupplier({ ...newSupplier, state: e.target.value })}
                                    />
                                )}
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ciudad/Localidad
                                    {newSupplier.country === 'Argentina' && loadingCiudades && (
                                        <FaSpinner className="inline ml-2 animate-spin text-gray-400 text-xs" />
                                    )}
                                </label>
                                {newSupplier.country === 'Argentina' ? (
                                    <>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={citySearchTerm || newSupplier.city}
                                                onChange={(e) => {
                                                    handleCitySearch(e.target.value);
                                                    setNewSupplier({ ...newSupplier, city: e.target.value });
                                                }}
                                                onFocus={() => {
                                                    if (ciudades.length > 0) {
                                                        setShowCityDropdown(true);
                                                    }
                                                }}
                                                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                                placeholder={selectedProvinciaId ? "Buscar ciudad..." : "Primero seleccione provincia"}
                                                disabled={!selectedProvinciaId}
                                            />
                                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                        </div>
                                        
                                        {/* Dropdown de ciudades */}
                                        {showCityDropdown && ciudades.length > 0 && (
                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {ciudades.map((ciudad) => (
                                                    <button
                                                        key={ciudad.id}
                                                        type="button"
                                                        onClick={() => selectCity(ciudad.nombre)}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-900 transition-colors"
                                                    >
                                                        {ciudad.nombre}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {selectedProvinciaId && ciudades.length === 0 && !loadingCiudades && (
                                            <p className="mt-1 text-xs text-gray-500">
                                                Escriba al menos 2 letras para buscar
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <input
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                        placeholder="Ej: La Plata"
                                        value={newSupplier.city}
                                        onChange={e => setNewSupplier({ ...newSupplier, city: e.target.value })}
                                    />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Código Postal
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                    placeholder="Ej: 1900"
                                    value={newSupplier.postal_code}
                                    onChange={e => setNewSupplier({ ...newSupplier, postal_code: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dirección
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[#18c29c] focus:border-transparent transition-all"
                                    placeholder="Calle, número, piso, departamento"
                                    value={newSupplier.address}
                                    onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })}
                                />
                            </div>
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
                                mode === "edit"
                                    ? "Actualizar Proveedor"
                                    : mode === "create" 
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