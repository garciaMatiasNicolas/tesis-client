"use client";
import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaCheckCircle, FaSpinner, FaSearch } from "react-icons/fa";
import useEmailValidation from "@/hooks/useEmailValidation";
import georefService from "@/services/georefService";

const CustomerFormModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    loading = false,
    customer = null // Para edición
}) => {
    const [formData, setFormData] = useState({
        customer_type: 'person',
        // Campos para personas
        first_name: '',
        last_name: '',
        date_of_birth: '',
        // Campos para empresas
        name: '',
        fantasy_name: '',
        cuit: '',
        // Campos comunes
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'Argentina',
        postal_code: '',
        comments: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { emailStatus, validateEmail, resetValidation } = useEmailValidation();
    
    // Estados para Georef API
    const [provincias, setProvincias] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [loadingProvincias, setLoadingProvincias] = useState(false);
    const [loadingCiudades, setLoadingCiudades] = useState(false);
    const [selectedProvinciaId, setSelectedProvinciaId] = useState(null);
    const [citySearchTerm, setCitySearchTerm] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    // Cargar provincias al abrir el modal
    useEffect(() => {
        if (isOpen) {
            loadProvincias();
        }
    }, [isOpen]);

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

    // Resetear formulario cuando se abre/cierra el modal
    useEffect(() => {
        if (isOpen) {
            if (customer) {
                // Modo edición - cargar datos del cliente
                setFormData({
                    customer_type: customer.customer_type || 'person',
                    first_name: customer.first_name || '',
                    last_name: customer.last_name || '',
                    date_of_birth: customer.date_of_birth || '',
                    name: customer.name || '',
                    fantasy_name: customer.fantasy_name || '',
                    cuit: customer.cuit || '',
                    email: customer.email || '',
                    phone: customer.phone || '',
                    address: customer.address || '',
                    city: customer.city || '',
                    state: customer.state || '',
                    country: customer.country || 'Argentina',
                    postal_code: customer.postal_code || '',
                    comments: customer.comments || ''
                });
                
                // Si tiene provincia y es Argentina, buscar el ID y cargar ciudades
                if (customer.state && customer.country === 'Argentina') {
                    const provincia = provincias.find(p => p.nombre === customer.state);
                    if (provincia) {
                        setSelectedProvinciaId(provincia.id);
                        loadCiudades(provincia.id, provincia.nombre);
                    }
                }
                
                // Establecer término de búsqueda de ciudad
                if (customer.city) {
                    setCitySearchTerm(customer.city);
                }
            } else {
                // Modo creación - formulario limpio
                setFormData({
                    customer_type: 'person',
                    first_name: '',
                    last_name: '',
                    date_of_birth: '',
                    name: '',
                    fantasy_name: '',
                    cuit: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    state: '',
                    country: 'Argentina',
                    postal_code: '',
                    comments: ''
                });
                setSelectedProvinciaId(null);
                setCiudades([]);
                setCitySearchTerm('');
            }
            setErrors({});
            setIsSubmitting(false);
            resetValidation();
            setShowCityDropdown(false);
        }
    }, [isOpen, customer, provincias]);

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
            
            // Usar localidades en lugar de municipios para tener más opciones
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
            // Si se borra la búsqueda, recargar todas las ciudades de la provincia
            const provincia = provincias.find(p => p.id === selectedProvinciaId);
            if (provincia) {
                loadCiudades(selectedProvinciaId, provincia.nombre);
            }
        }
    };

    // Seleccionar ciudad del dropdown
    const selectCity = (cityName) => {
        setFormData(prev => ({
            ...prev,
            city: cityName
        }));
        setCitySearchTerm(cityName);
        setShowCityDropdown(false);
        
        if (errors.city) {
            setErrors(prev => ({
                ...prev,
                city: ''
            }));
        }
    };

    // Manejar cambio de provincia
    const handleProvinciaChange = (e) => {
        const selectedId = e.target.value;
        const provincia = provincias.find(p => p.id === selectedId);
        
        if (provincia) {
            setSelectedProvinciaId(selectedId);
            setFormData(prev => ({
                ...prev,
                state: provincia.nombre,
                city: '' // Limpiar ciudad al cambiar provincia
            }));
            setCitySearchTerm('');
            
            // Cargar ciudades de la provincia seleccionada
            loadCiudades(selectedId, provincia.nombre);
            
            if (errors.state) {
                setErrors(prev => ({
                    ...prev,
                    state: ''
                }));
            }
        }
    };

    // Manejar cambios en los inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Validar email en tiempo real solo si no estamos editando
        if (name === 'email' && !customer) {
            validateEmail(value);
        }
    };

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        // Validaciones según tipo de cliente
        if (formData.customer_type === 'person') {
            if (!formData.first_name.trim()) {
                newErrors.first_name = 'El nombre es requerido';
            }
            if (!formData.last_name.trim()) {
                newErrors.last_name = 'El apellido es requerido';
            }
        } else if (formData.customer_type === 'company') {
            if (!formData.name.trim()) {
                newErrors.name = 'La razón social es requerida';
            }
            if (formData.cuit && !/^\d{2}-\d{8}-\d{1}$/.test(formData.cuit)) {
                newErrors.cuit = 'El CUIT debe tener formato XX-XXXXXXXX-X';
            }
        }

        // Validaciones comunes
        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El email no es válido';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'El teléfono es requerido';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'La dirección es requerida';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'La ciudad es requerida';
        }

        if (!formData.state.trim()) {
            newErrors.state = 'La provincia/estado es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Limpiar campos vacíos según el tipo de cliente
            const cleanData = { ...formData };
            
            if (cleanData.customer_type === 'person') {
                // Limpiar campos de empresa
                delete cleanData.name;
                delete cleanData.fantasy_name;
                delete cleanData.cuit;
            } else {
                // Limpiar campos de persona
                delete cleanData.first_name;
                delete cleanData.last_name;
                delete cleanData.date_of_birth;
            }

            // Limpiar campos vacíos
            Object.keys(cleanData).forEach(key => {
                if (cleanData[key] === '') {
                    delete cleanData[key];
                }
            });

            await onSubmit(cleanData);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
            // El error se maneja en el componente padre
        } finally {
            setIsSubmitting(false);
        }
    };

    // Países disponibles
    const countries = [
        'Argentina', 'Brasil', 'Chile', 'Colombia', 'México', 
        'Perú', 'Uruguay', 'Paraguay', 'Bolivia', 'Ecuador',
        'Venezuela', 'España', 'Estados Unidos', 'Otro'
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#18c29c] rounded-lg">
                            {formData.customer_type === 'person' ? (
                                <FaUser className="text-white text-lg" />
                            ) : (
                                <FaBuilding className="text-white text-lg" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {formData.customer_type === 'person' 
                                    ? 'Información de persona física' 
                                    : 'Información de empresa'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={isSubmitting}
                    >
                        <FaTimes className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Tipo de cliente */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Cliente *
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, customer_type: 'person' }))}
                                className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                                    formData.customer_type === 'person'
                                        ? 'border-[#18c29c] bg-green-50 text-[#18c29c]'
                                        : 'border-gray-300 hover:border-gray-400 text-black'
                                }`}
                                disabled={isSubmitting}
                            >
                                <FaUser className="text-lg" />
                                <div className="text-left">
                                    <div className="font-medium">Persona Física</div>
                                    <div className="text-xs text-gray-500">Cliente individual</div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, customer_type: 'company' }))}
                                className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                                    formData.customer_type === 'company'
                                        ? 'border-[#18c29c] bg-green-50 text-[#18c29c]'
                                        : 'border-gray-300 hover:border-gray-400 text-black'
                                }`}
                                disabled={isSubmitting}
                            >
                                <FaBuilding className="text-lg" />
                                <div className="text-left">
                                    <div className="font-medium">Empresa</div>
                                    <div className="text-xs text-gray-500">Cliente corporativo</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Campos específicos según tipo */}
                        {formData.customer_type === 'person' ? (
                            <>
                                {/* Nombre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent ${
                                            errors.first_name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Ingrese el nombre"
                                        disabled={isSubmitting}
                                    />
                                    {errors.first_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                                    )}
                                </div>

                                {/* Apellido */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Apellido *
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent ${
                                            errors.last_name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Ingrese el apellido"
                                        disabled={isSubmitting}
                                    />
                                    {errors.last_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                                    )}
                                </div>

                                {/* Fecha de nacimiento */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Nacimiento
                                    </label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleInputChange}
                                        className="w-full px-4 text-black py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Razón Social */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Razón Social *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 text-black border rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent ${
                                            errors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Ingrese la razón social"
                                        disabled={isSubmitting}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Nombre de Fantasía */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre de Fantasía
                                    </label>
                                    <input
                                        type="text"
                                        name="fantasy_name"
                                        value={formData.fantasy_name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent"
                                        placeholder="Nombre comercial"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* CUIT */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FaIdCard className="inline mr-1" />
                                        CUIT
                                    </label>
                                    <input
                                        type="text"
                                        name="cuit"
                                        value={formData.cuit}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent ${
                                            errors.cuit ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="XX-XXXXXXXX-X"
                                        disabled={isSubmitting}
                                    />
                                    {errors.cuit && (
                                        <p className="mt-1 text-sm text-red-600">{errors.cuit}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaEnvelope className="inline mr-1" />
                                Email *
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent ${
                                        errors.email || emailStatus.error ? 'border-red-500' : 
                                        emailStatus.isAvailable ? 'border-green-500' : 'border-gray-300'
                                    }`}
                                    placeholder="correo@ejemplo.com"
                                    disabled={isSubmitting}
                                />
                                {/* Indicador de validación */}
                                {!customer && formData.email && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {emailStatus.isValidating && (
                                            <FaSpinner className="animate-spin text-gray-400" />
                                        )}
                                        {!emailStatus.isValidating && emailStatus.isAvailable && (
                                            <FaCheckCircle className="text-green-500" />
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Mensajes de validación */}
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                            {!customer && emailStatus.error && (
                                <p className="mt-1 text-sm text-red-600">{emailStatus.error}</p>
                            )}
                            {!customer && emailStatus.isAvailable && formData.email && (
                                <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                                    <FaCheckCircle className="text-xs" />
                                    Email disponible
                                </p>
                            )}
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaPhone className="inline mr-1" />
                                Teléfono *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent ${
                                    errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="+54 11 1234-5678"
                                disabled={isSubmitting}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>

                        {/* Dirección */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaMapMarkerAlt className="inline mr-1" />
                                Dirección *
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent ${
                                    errors.address ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Calle, número, departamento"
                                disabled={isSubmitting}
                            />
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                            )}
                        </div>

                        {/* País */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                País
                            </label>
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent"
                                disabled={isSubmitting}
                            >
                                {countries.map(country => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Provincia/Estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Provincia *
                                {formData.country === 'Argentina' && loadingProvincias && (
                                    <FaSpinner className="inline ml-2 animate-spin text-gray-400 text-xs" />
                                )}
                            </label>
                            {formData.country === 'Argentina' ? (
                                <select
                                    name="state"
                                    value={selectedProvinciaId || ''}
                                    onChange={handleProvinciaChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent ${
                                        errors.state ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    disabled={isSubmitting || loadingProvincias}
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
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent ${
                                        errors.state ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Provincia o Estado"
                                    disabled={isSubmitting}
                                />
                            )}
                            {errors.state && (
                                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                            )}
                        </div>

                        {/* Ciudad */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ciudad/Localidad *
                                {formData.country === 'Argentina' && loadingCiudades && (
                                    <FaSpinner className="inline ml-2 animate-spin text-gray-400 text-xs" />
                                )}
                            </label>
                            {formData.country === 'Argentina' ? (
                                <>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            autoComplete='off'
                                            name="city"
                                            value={citySearchTerm || formData.city}
                                            onChange={(e) => {
                                                handleCitySearch(e.target.value);
                                                handleInputChange(e);
                                            }}
                                            onFocus={() => {
                                                if (ciudades.length > 0) {
                                                    setShowCityDropdown(true);
                                                }
                                            }}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent ${
                                                errors.city ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder={selectedProvinciaId ? "Buscar ciudad o localidad..." : "Primero seleccione una provincia"}
                                            disabled={isSubmitting || !selectedProvinciaId}
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
                                    
                                    {/* Mensaje de ayuda */}
                                    {selectedProvinciaId && ciudades.length === 0 && !loadingCiudades && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Escriba al menos 2 letras para buscar ciudades
                                        </p>
                                    )}
                                </>
                            ) : (
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent ${
                                        errors.city ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Ciudad"
                                    disabled={isSubmitting}
                                />
                            )}
                            {errors.city && (
                                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                            )}
                        </div>



                        {/* Código Postal */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Código Postal
                            </label>
                            <input
                                type="text"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent"
                                placeholder="1234"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Comentarios */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comentarios
                            </label>
                            <textarea
                                name="comments"
                                value={formData.comments}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] text-black focus:border-transparent"
                                placeholder="Información adicional del cliente..."
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || loading || emailStatus.isValidating || (!customer && emailStatus.error) || (!customer && formData.email && emailStatus.isAvailable === false)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#18c29c] text-white rounded-lg hover:bg-[#15a884] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting || loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <FaSave className="text-sm" />
                                    {customer ? 'Actualizar Cliente' : 'Crear Cliente'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerFormModal;