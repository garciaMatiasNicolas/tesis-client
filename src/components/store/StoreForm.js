"use client";
import React, { useState } from "react";
import { FaStore, FaUpload, FaMapMarkerAlt, FaPhone, FaToggleOn, FaToggleOff, FaMapPin, FaGlobe, FaCity, FaMailBulk, FaSpinner } from "react-icons/fa";

export default function StoreForm({ store, onChange, onSave, loading = false, readOnly = false }) {
    const [formData, setFormData] = useState(store || {
        name: "",
        logo: null,
        country: "",
        state: "",
        postal_code: "",
        city: "",
        address: "",
        phone: "",
        is_active: false,
        view_only: true
    });

    const [logoPreview, setLogoPreview] = useState(store?.logo || null);

    const handleChange = (e) => {
        if (readOnly) return; // Prevent changes in readonly mode
        
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
        
        if (onChange) {
            onChange({ ...formData, [name]: newValue });
        }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                logo: file
            }));
            
            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => setLogoPreview(e.target.result);
            reader.readAsDataURL(file);
            
            if (onChange) {
                onChange({ ...formData, logo: file });
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) {
            onSave(formData);
        }
    };

    if (!store) return (
        <div className="bg-white rounded-xl p-6 md:p-10 w-full max-w-2xl mx-auto text-gray-400 text-center shadow-lg">
            No tienes una tienda asociada.
        </div>
    );

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-4 md:p-8">
            <div className="mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-[#223263] mb-2">Configuración de la tienda</h2>
                <p className="text-sm md:text-base text-gray-600">Configura los datos principales de tu tienda</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* Logo de la tienda */}
                <div className="border border-gray-200 rounded-lg p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold text-[#223263] mb-3 md:mb-4 flex items-center gap-2">
                        <FaStore className="text-[#18c29c] text-sm md:text-base" />
                        Logo de la tienda
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <FaStore className="text-gray-400 text-lg md:text-2xl" />
                            )}
                        </div>
                        <div className="text-center sm:text-left">
                            {!readOnly && (
                                <label className="inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-[#18c29c] text-white rounded-md cursor-pointer hover:bg-[#13a884] transition text-sm md:text-base">
                                    <FaUpload className="text-xs md:text-sm" />
                                    Subir logo
                                    <input
                                        type="file"
                                        name="logo"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                            <p className="text-xs md:text-sm text-gray-600 mt-2">
                                {readOnly ? "Logo de la tienda" : "Tamaño recomendado: 100x100px"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Información básica */}
                <div className="border border-gray-200 rounded-lg p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold text-[#223263] mb-4 md:mb-6">Información básica</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <label className="block text-xs md:text-sm font-semibold text-[#223263] mb-2">
                                Nombre de la tienda
                            </label>
                            <div className="relative">
                                <FaStore className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#18c29c] text-xs md:text-sm" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Mi Tienda Online"
                                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-gray-600 text-sm md:text-base placeholder-gray-300"
                                    readOnly={readOnly}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs md:text-sm font-semibold text-[#223263] mb-2">
                                Teléfono
                            </label>
                            <div className="relative">
                                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#18c29c] text-xs md:text-sm" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+54 11 1234-5678"
                                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-gray-600 text-sm md:text-base placeholder-gray-300"
                                    readOnly={readOnly}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ubicación */}
                <div className="border border-gray-200 rounded-lg p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold text-[#223263] mb-4 md:mb-6 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-[#18c29c] text-sm md:text-base" />
                        Ubicación
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <div>
                            <label className="block text-xs md:text-sm font-semibold text-[#223263] mb-2">
                                País
                            </label>
                            <div className="relative">
                                <FaMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#18c29c] text-xs md:text-sm" />
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="Argentina"
                                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-gray-600 text-sm md:text-base placeholder-gray-300"
                                    readOnly={readOnly}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs md:text-sm font-semibold text-[#223263] mb-2">
                                Provincia/Estado
                            </label>
                            <div className="relative">
                                <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#18c29c] text-xs md:text-sm" />
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="Buenos Aires"
                                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-gray-600 text-sm md:text-base placeholder-gray-300"
                                    readOnly={readOnly}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs md:text-sm font-semibold text-[#223263] mb-2">
                                Ciudad
                            </label>
                            <div className="relative">
                                <FaCity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#18c29c] text-xs md:text-sm" />
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="CABA"
                                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-gray-600 text-sm md:text-base placeholder-gray-300"
                                    readOnly={readOnly}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs md:text-sm font-semibold text-[#223263] mb-2">
                                Código Postal
                            </label>
                            <div className="relative">
                                <FaMailBulk className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#18c29c] text-xs md:text-sm" />
                                <input
                                    type="text"
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    placeholder="1000"
                                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-gray-600 text-sm md:text-base placeholder-gray-300"
                                    readOnly={readOnly}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 md:mt-4">
                        <label className="block text-xs md:text-sm font-semibold text-[#223263] mb-2">
                            Dirección
                        </label>
                        <div className="relative">
                            <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#18c29c] text-xs md:text-sm" />
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Av. Corrientes 1234"
                                className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-gray-600 text-sm md:text-base placeholder-gray-300"
                                readOnly={readOnly}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Configuración de visibilidad */}
                <div className="border border-gray-200 rounded-lg p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold text-[#223263] mb-4 md:mb-6">Configuración de visibilidad</h3>
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-start sm:items-center justify-between gap-3">
                            <div className="flex-1">
                                <h4 className="text-sm md:text-base font-semibold text-[#223263]">Tienda activa</h4>
                                <p className="text-xs md:text-sm text-gray-600 mt-1">Los clientes pueden ver y acceder a tu tienda</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => !readOnly && handleChange({ target: { name: 'is_active', type: 'checkbox', checked: !formData.is_active } })}
                                className={`flex items-center text-2xl md:text-3xl transition-colors flex-shrink-0 ${
                                    formData.is_active ? 'text-[#18c29c]' : 'text-gray-400'
                                } ${readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                disabled={readOnly}
                            >
                                {formData.is_active ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                        </div>

                        <div className="flex items-start sm:items-center justify-between gap-3">
                            <div className="flex-1">
                                <h4 className="text-sm md:text-base font-semibold text-[#223263]">Solo lectura</h4>
                                <p className="text-xs md:text-sm text-gray-600 mt-1">Los clientes pueden ver productos pero no comprar. De esta manera, tu tienda funciona como una especie de catalogo para los clientes</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => !readOnly && handleChange({ target: { name: 'view_only', type: 'checkbox', checked: !formData.view_only } })}
                                className={`flex items-center text-2xl md:text-3xl transition-colors flex-shrink-0 ${
                                    formData.view_only ? 'text-[#18c29c]' : 'text-gray-400'
                                } ${readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                disabled={readOnly}
                            >
                                {formData.view_only ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Botón de guardar */}
                {!readOnly && (
                    <div className="flex justify-center pt-4 md:pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full sm:w-auto px-8 md:px-12 py-3 md:py-4 text-white font-semibold rounded-lg transition-colors text-base md:text-lg flex items-center justify-center gap-2 ${
                                loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-[#18c29c] hover:bg-[#13a884]'
                            }`}
                        >
                            {loading && <FaSpinner className="animate-spin" />}
                            {loading ? 'Guardando...' : 'Guardar tienda'}
                        </button>
                    </div>
                )}
                
                {readOnly && (
                    <div className="pt-4 md:pt-6">
                        <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800 text-xs md:text-sm text-center">
                                <strong>Modo solo lectura:</strong> No tienes permisos para editar la información de la tienda.
                            </p>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}