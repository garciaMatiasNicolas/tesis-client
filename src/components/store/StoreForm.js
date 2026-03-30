"use client";
import React, { useState } from "react";
import { FaStore, FaUpload, FaMapMarkerAlt, FaPhone, FaToggleOn, FaToggleOff, FaMapPin, FaGlobe, FaCity, FaMailBulk, FaSpinner, FaPalette, FaCheck } from "react-icons/fa";

export default function StoreForm({ store, onChange, onSave, loading = false, readOnly = false }) {
    // Paletas predeterminadas
    const themeOptions = [
        { id: "wine", name: "Vino", primary: "#9a334d", secondary: "#7a2639" },
        { id: "ocean", name: "Océano", primary: "#3498db", secondary: "#2980b9" },
        { id: "purple", name: "Púrpura", primary: "#9c27b0", secondary: "#7b1fa2" },
        { id: "mint", name: "Menta", primary: "#00bfa5", secondary: "#009688" },
        { id: "coral", name: "Coral", primary: "#ff7256", secondary: "#e05a44" },
        { id: "nordic", name: "Nórdico", primary: "#4a6fa5", secondary: "#3b5683" }
    ];

    const [formData, setFormData] = useState(store || {
        name: "",
        logo: null,
        dark_mode: false,
        country: "",
        state: "",
        postal_code: "",
        city: "",
        address: "",
        phone: "",
        is_active: false,
        view_only: true,
        theme_id: "wine",
    });

    const [logoPreview, setLogoPreview] = useState(store?.logo || null);

    const handleChange = (e) => {
        if (readOnly) return; // Prevent changes in readonly mode
        
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;
        
        let updatedData = { ...formData, [name]: newValue };
        
        setFormData(updatedData);
        
        if (onChange) {
            onChange(updatedData);
        }
    };

    const handleThemeSelect = (themeId) => {
        if (readOnly) return;
        
        const selectedTheme = themeOptions.find(theme => theme.id === themeId);
        
        const updatedData = {
            ...formData,
            theme_id: themeId,
            pallete_color: selectedTheme.primary,
            secondary_color: selectedTheme.secondary
        };
        
        setFormData(updatedData);
        
        if (onChange) {
            onChange(updatedData);
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

                {/* Configuración visual - modificada */}
                <div className="border border-gray-200 rounded-lg p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold text-[#223263] mb-3 md:mb-4 flex items-center gap-2">
                        <FaPalette className="text-[#18c29c] text-sm md:text-base" />
                        Selección de tema
                    </h3>
                    
                    {/* Selección de temas disponibles */}
                    <div className="mb-6">
                        <label className="block text-xs md:text-sm font-semibold text-[#223263] mb-3">
                            Temas disponibles 
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {themeOptions.map((theme) => {
                                const isSelected = formData.theme_id === theme.id;
                                return (
                                    <button
                                        key={theme.id}
                                        type="button"
                                        onClick={() => !readOnly && handleThemeSelect(theme.id)}
                                        className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                                            isSelected 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        } ${readOnly ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                        disabled={readOnly}
                                    >
                                        {/* Indicador de selección */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <FaCheck className="text-white text-xs" />
                                            </div>
                                        )}
                                        
                                        <div className="flex flex-col items-center space-y-3">
                                            {/* Gradiente de muestra */}
                                            <div 
                                                className="w-full h-12 rounded-md border border-gray-200 shadow-sm"
                                                style={{
                                                    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
                                                }}
                                            />
                                            
                                            {/* Nombre del tema */}
                                            <p className="text-sm font-medium text-gray-700 text-center">
                                                {theme.name}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Vista previa del tema seleccionado */}
                    <div className="mt-4 md:mt-6">
                        <label className="block text-xs md:text-sm font-semibold text-[#223263] mb-2">
                            Vista previa del tema: <span className="font-normal">{themeOptions.find(t => t.id === formData.theme_id)?.name}</span>
                        </label>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div 
                                    className="h-12 md:h-16 rounded-lg border border-gray-200 flex items-center justify-center text-white font-semibold text-sm md:text-base"
                                    style={{ backgroundColor: formData.pallete_color }}
                                >
                                    Primario
                                </div>
                            </div>
                            <div className="flex-1">
                                <div 
                                    className="h-12 md:h-16 rounded-lg border border-gray-200 flex items-center justify-center text-white font-semibold text-sm md:text-base"
                                    style={{ backgroundColor: formData.secondary_color }}
                                >
                                    Secundario
                                </div>
                            </div>
                            <div className="flex-1">
                                <div 
                                    className="h-12 md:h-16 rounded-lg border border-gray-200 flex items-center justify-center text-white font-semibold text-sm md:text-base"
                                    style={{ background: `linear-gradient(135deg, ${formData.pallete_color} 0%, ${formData.secondary_color} 100%)` }}
                                >
                                    Gradiente
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start sm:items-center justify-between gap-3 mt-6 md:mt-8">
                        <div className="flex-1">
                            <h4 className="text-sm md:text-base font-semibold text-[#223263]">Modo oscuro</h4>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">Selecciona si prefieres una tonalidad más oscura o clara para tu tienda</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => !readOnly && handleChange({ target: { name: 'dark_mode', type: 'checkbox', checked: !formData.dark_mode } })}
                            className={`flex items-center text-2xl md:text-3xl transition-colors flex-shrink-0 ${
                                formData.dark_mode ? 'text-[#18c29c]' : 'text-gray-400'
                            } ${readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                            disabled={readOnly}
                        >
                            {formData.dark_mode ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
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