"use client";
import React, { useState, useRef, useEffect } from "react";
import { 
    FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, 
    FaBriefcase, FaCamera, FaIdCard, FaSave, FaTimes, FaBuilding,
    FaSpinner, FaCheck, FaExclamationTriangle, FaSearch
} from "react-icons/fa";
import useEmailValidation from "@/hooks/useEmailValidation";
import { useFormErrors, extractDjangoErrors } from "@/utils/errorUtils";
import georefService from "@/services/georefService";

const EmployeeForm = ({ 
    employee = null, 
    stores = [],
    branches = [],
    users = [],
    onSubmit, 
    onCancel, 
    loading = false,
    isEdit = false,
    serverErrors = null, // Errores del servidor
    currentUser = null // Usuario actual para validar permisos
}) => {
    const fileInputRef = useRef();
    const [preview, setPreview] = useState(null);
    
    // Hooks para validación
    const { emailStatus, validateEmail, resetValidation } = useEmailValidation();
    const { 
        setFieldError, 
        clearFieldError, 
        setErrors: setFormErrors, 
        clearAllErrors,
        hasError,
        getError 
    } = useFormErrors();
    
    // Estados para Georef API
    const [provincias, setProvincias] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [loadingProvincias, setLoadingProvincias] = useState(false);
    const [loadingCiudades, setLoadingCiudades] = useState(false);
    const [selectedProvinciaId, setSelectedProvinciaId] = useState(null);
    const [citySearchTerm, setCitySearchTerm] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        // Datos del usuario (solo para creación)
        email: employee?.user_email || '',
        first_name: employee?.user_name?.split(' ')[0] || '',
        last_name: employee?.user_name?.split(' ').slice(1).join(' ') || '',
        password: '',
        role: employee?.user ? (users.find(u => u.id === employee.user)?.role || 'manager') : 'manager',
        
        // Datos del empleado
        user: employee?.user || '',
        store: employee?.store || (() => {
            // Si es manager, usar su tienda automáticamente
            if (currentUser?.role === 'manager' && currentUser?.employee_info?.store) {
                return currentUser.employee_info.store;
            }
            return stores.length > 0 ? stores[0].id : '';
        })(),
        branch: employee?.branch || '',
        profile_photo: employee?.profile_photo || null,
        birth: employee?.birth || '',
        date_joined: employee?.date_joined || new Date().toISOString().split('T')[0],
        position: employee?.position || '',
        dni: employee?.dni || '',
        cuil: employee?.cuil || '',
        country: employee?.country || 'Argentina',
        state: employee?.state || '',
        postal_code: employee?.postal_code || '',
        city: employee?.city || '',
        address: employee?.address || '',
        phone: employee?.phone || ''
    });

    // Efecto para manejar errores del servidor cuando cambian
    useEffect(() => {
        if (serverErrors) {
            const extractedErrors = extractDjangoErrors(serverErrors);
            if (extractedErrors.hasErrors) {
                setFormErrors(extractedErrors.fieldErrors);
            }
        }
    }, [serverErrors, setFormErrors]);

    // Cargar provincias al montar el componente
    useEffect(() => {
        loadProvincias();
    }, []);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showCityDropdown && !event.target.closest('.city-search-container')) {
                setShowCityDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCityDropdown]);

    // Cargar ciudades cuando hay un empleado con provincia de Argentina
    useEffect(() => {
        if (employee && employee.state && employee.country === 'Argentina') {
            const provincia = provincias.find(p => p.nombre === employee.state);
            if (provincia) {
                setSelectedProvinciaId(provincia.id);
                loadCiudades(provincia.id, provincia.nombre);
            }
        }
        if (employee && employee.city) {
            setCitySearchTerm(employee.city);
        }
    }, [employee, provincias]);

    // Efecto para asignar automáticamente la sucursal del manager
    useEffect(() => {
        if (currentUser?.role === 'manager' && currentUser?.employee_info?.branch && !isEdit) {
            setFormData(prev => ({
                ...prev,
                branch: currentUser.employee_info.branch,
                store: currentUser.employee_info.store
            }));
        }
    }, [currentUser, isEdit]);

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
        setFormData(prev => ({ ...prev, city: cityName }));
        setCitySearchTerm(cityName);
        setShowCityDropdown(false);
        clearFieldError('city');
    };

    // Manejar cambio de provincia
    const handleProvinciaChange = (selectedId) => {
        const provincia = provincias.find(p => p.id === selectedId);
        
        if (provincia) {
            setSelectedProvinciaId(selectedId);
            setFormData(prev => ({ ...prev, state: provincia.nombre, city: '' }));
            setCitySearchTerm('');
            loadCiudades(selectedId, provincia.nombre);
            clearFieldError('state');
        }
    };

    // Manejar cambio de país
    const handleCountryChange = (value) => {
        setFormData(prev => ({ ...prev, country: value, state: '', city: '' }));
        setSelectedProvinciaId(null);
        setCiudades([]);
        setCitySearchTerm('');
        clearFieldError('country');
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Limpiar error del campo cuando el usuario empieza a escribir
        clearFieldError(field);
        
        // Validar email en tiempo real para nuevos empleados
        if (field === 'email' && !isEdit) {
            if (value) {
                validateEmail(value);
            } else {
                resetValidation();
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                handleChange('profile_photo', file);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        clearAllErrors();
        let isValid = true;

        // Validaciones para creación de usuario (solo si no estamos editando)
        if (!isEdit) {
            if (!formData.email) {
                setFieldError('email', ['El email es obligatorio']);
                isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                setFieldError('email', ['El formato del email no es válido']);
                isValid = false;
            } else if (emailStatus.error) {
                setFieldError('email', [emailStatus.error]);
                isValid = false;
            } else if (emailStatus.isAvailable === false) {
                setFieldError('email', ['Este email ya está en uso']);
                isValid = false;
            }
            
            if (!formData.first_name) {
                setFieldError('first_name', ['El nombre es obligatorio']);
                isValid = false;
            }
            
            if (!formData.last_name) {
                setFieldError('last_name', ['El apellido es obligatorio']);
                isValid = false;
            }
        }
        
        // Validación del rol (tanto para creación como edición)
        if (!formData.role || !['manager', 'employee'].includes(formData.role)) {
            setFieldError('role', ['El rol debe ser Manager o Empleado']);
            isValid = false;
        }

        // Validar que no se pueda cambiar el rol de un manager con sucursales asignadas
        if (isEdit && isManagerWithBranches() && employee) {
            const employeeUser = users.find(u => u.id === employee.user);
            if (employeeUser && employeeUser.role === 'manager' && formData.role !== 'manager') {
                setFieldError('role', ['No se puede cambiar el rol de este manager porque tiene sucursales asignadas']);
                isValid = false;
            }
        }

        // Validaciones del empleado
        if (!formData.store) {
            setFieldError('store', ['La tienda es obligatoria']);
            isValid = false;
        }
        
        if (!formData.position) {
            setFieldError('position', ['El puesto es obligatorio']);
            isValid = false;
        }
        
        if (!formData.dni) {
            setFieldError('dni', ['El DNI es obligatorio']);
            isValid = false;
        } else if (!/^\d{7,8}$/.test(formData.dni)) {
            setFieldError('dni', ['El DNI debe tener entre 7 y 8 dígitos']);
            isValid = false;
        }
        
        if (!formData.birth) {
            setFieldError('birth', ['La fecha de nacimiento es obligatoria']);
            isValid = false;
        }
        
        if (!formData.date_joined) {
            setFieldError('date_joined', ['La fecha de ingreso es obligatoria']);
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            //console.log("Submitting Employee Form with data:", formData);
            console.log(employee?.store);
            console.log(currentUser?.employee_info?.store);
            //await onSubmit(formData);
        } catch (error) {
            console.error("Error en EmployeeForm:", error);
            
            // Extraer errores de Django del error de respuesta
            const extractedErrors = extractDjangoErrors(error.response?.data);
            if (extractedErrors.hasErrors) {
                setFormErrors(extractedErrors.fieldErrors);
                
                // Mostrar errores no relacionados con campos específicos
                if (extractedErrors.nonFieldErrors.length > 0) {
                    console.error("Errores generales:", extractedErrors.nonFieldErrors);
                }
            }
        }
    };

    // Filtrar datos según el rol del usuario actual
    const getFilteredStores = () => {
        if (currentUser?.role === 'superadmin') {
            return stores; // Superadmin puede ver todas las tiendas
        } else if (currentUser?.role === 'manager') {
            // Manager solo puede ver su tienda (obtener de currentUser.employee_info si está disponible)
            // Por ahora limitamos a la primera tienda disponible o la tienda del empleado siendo editado
            if (employee?.store) {
                return stores.filter(store => store.id === employee.store);
            }
            // Para crear nuevo empleado, usar la primera tienda disponible
            return stores.slice(0, 1);
        }
        return stores;
    };

    const getFilteredBranches = () => {
        const baseFilter = branches.filter(branch => 
            branch.store === parseInt(formData.store)
        );
        
        if (currentUser?.role === 'manager') {
            // Manager solo puede asignar empleados a su propia sucursal
            // Necesitamos obtener la sucursal del manager actual
            return baseFilter.filter(branch => {
                // Por ahora mostramos todas las sucursales de la tienda seleccionada
                // La validación real se hará en el backend
                return true;
            });
        }
        
        return baseFilter;
    };

    const filteredStores = getFilteredStores();
    const filteredBranches = getFilteredBranches();

    // Verificar si el empleado es manager con sucursales asignadas
    const isManagerWithBranches = () => {
        if (!isEdit || !employee) return false;
        
        // Verificar si el usuario actual del empleado es manager
        const employeeUser = users.find(u => u.id === employee.user);
        if (!employeeUser || employeeUser.role !== 'manager') return false;
        
        // Verificar si tiene sucursales asignadas como manager
        const managedBranches = branches.filter(branch => branch.manager === employee.user);
        return managedBranches.length > 0;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto de perfil */}
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-[#18c29c]">
                        {preview || employee?.profile_photo ? (
                            <img
                                src={preview || employee?.profile_photo}
                                alt="Avatar"
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <FaUser className="text-gray-300 w-12 h-12" />
                        )}
                    </div>
                    <button
                        type="button"
                        className="absolute bottom-0 right-0 bg-[#18c29c] text-white rounded-full p-2 shadow hover:bg-[#13a884] transition"
                        onClick={() => fileInputRef.current.click()}
                        title="Cambiar foto"
                    >
                        <FaCamera className="text-sm" />
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            {/* Datos del usuario */}
            {!isEdit ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                        <FaUser className="text-blue-600" />
                        Datos del Usuario
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    className={`text-gray-900 w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] ${
                                        hasError('email') ? 'border-red-500' : 
                                        emailStatus.isAvailable === true ? 'border-green-500' :
                                        emailStatus.isAvailable === false ? 'border-red-500' :
                                        'border-gray-300'
                                    }`}
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="empleado@empresa.com"
                                />
                                
                                {/* Indicador de estado de validación */}
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {emailStatus.isValidating && (
                                        <FaSpinner className="text-blue-500 animate-spin text-sm" />
                                    )}
                                    {!emailStatus.isValidating && emailStatus.isAvailable === true && (
                                        <FaCheck className="text-green-500 text-sm" />
                                    )}
                                    {!emailStatus.isValidating && (emailStatus.isAvailable === false || hasError('email')) && (
                                        <FaExclamationTriangle className="text-red-500 text-sm" />
                                    )}
                                </div>
                            </div>
                            
                            {/* Mostrar errores o estado de validación */}
                            {hasError('email') && (
                                <p className="text-red-500 text-sm mt-1">{getError('email')}</p>
                            )}
                            {!hasError('email') && emailStatus.error && (
                                <p className="text-red-500 text-sm mt-1">{emailStatus.error}</p>
                            )}
                            {!hasError('email') && !emailStatus.error && emailStatus.isAvailable === true && (
                                <p className="text-green-600 text-sm mt-1">✓ Email disponible</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña Temporal
                            </label>
                            <input
                                type="password"
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c]"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                placeholder="Dejar vacío para contraseña por defecto"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                className={`w-full px-4 text-gray-900 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] ${
                                    hasError('first_name') ? 'border-red-500' : 'border-gray-300'
                                }`}
                                value={formData.first_name}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                                placeholder="Juan"
                            />
                            {hasError('first_name') && (
                                <p className="text-red-500 text-sm mt-1">{getError('first_name')}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Apellido *
                            </label>
                            <input
                                type="text"
                                className={`w-full px-4 text-gray-900 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] ${
                                    hasError('last_name') ? 'border-red-500' : 'border-gray-300'
                                }`}
                                value={formData.last_name}
                                onChange={(e) => handleChange('last_name', e.target.value)}
                                placeholder="Pérez"
                            />
                            {hasError('last_name') && (
                                <p className="text-red-500 text-sm mt-1">{getError('last_name')}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rol *
                            </label>
                            <select
                                className={`w-full px-4 text-gray-900 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] ${
                                    hasError('role') ? 'border-red-500' : 'border-gray-300'
                                }`}
                                value={formData.role}
                                onChange={(e) => handleChange('role', e.target.value)}
                            >
                                <option value="manager">Admin Sucursal</option>
                                <option value="employee">Empleado</option>
                            </select>
                            {hasError('role') && (
                                <p className="text-red-500 text-sm mt-1">{getError('role')}</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                        <FaUser className="text-blue-600" />
                        Datos del Usuario
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rol del Usuario *
                            </label>
                            <select
                                className={`w-full px-4 text-gray-900 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] ${
                                    hasError('role') ? 'border-red-500' : 'border-gray-300'
                                } ${isManagerWithBranches() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                value={formData.role}
                                onChange={(e) => handleChange('role', e.target.value)}
                                disabled={isManagerWithBranches()}
                            >
                                <option value="manager">Admin Sucursal</option>
                                <option value="employee">Empleado</option>
                            </select>
                            {hasError('role') && (
                                <p className="text-red-500 text-sm mt-1">{getError('role')}</p>
                            )}
                            {isManagerWithBranches() ? (
                                <p className="text-amber-600 text-sm mt-1 flex items-center gap-1">
                                    <FaExclamationTriangle className="text-amber-500" />
                                    No se puede cambiar el rol de este manager porque tiene sucursales asignadas. 
                                    Primero debe reasignar la gestión de las sucursales a otro manager.
                                </p>
                            ) : (
                                <p className="text-gray-500 text-sm mt-1">
                                    El cambio de rol afectará los permisos del usuario en el sistema.
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-gray-600">
                                <strong>Email:</strong> {employee?.user_email || 'No disponible'}
                            </p>
                            <p className="text-gray-600 mt-2">
                                <strong>Nombre completo:</strong> {employee?.user_name || 'No disponible'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Datos laborales */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <FaBriefcase className="text-green-600" />
                    Información Laboral
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tienda *
                        </label>
                        <div className="relative">
                            <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <select
                                className={`w-full text-gray-900 pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] ${
                                    hasError('store') ? 'border-red-500' : 'border-gray-300'
                                }`}
                                value={formData.store}
                                onChange={(e) => handleChange('store', e.target.value)}
                                disabled={currentUser?.role === 'manager' && filteredStores.length === 1}
                            >
                                <option value="">Seleccionar tienda</option>
                                {filteredStores.map(store => (
                                    <option key={store.id} value={store.id}>
                                        {store.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {hasError('store') && (
                            <p className="text-red-500 text-sm mt-1">{getError('store')}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sucursal
                        </label>
                        <select
                            className="w-full px-4 text-gray-900 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c]"
                            value={formData.branch}
                            onChange={(e) => handleChange('branch', e.target.value)}
                            disabled={!formData.store}
                        >
                            <option value="">Sin sucursal asignada</option>
                            {filteredBranches.map(branch => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Puesto *
                        </label>
                        <div className="relative">
                            <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className={`w-full text-gray-900 pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] ${
                                    hasError('position') ? 'border-red-500' : 'border-gray-300'
                                }`}
                                value={formData.position}
                                onChange={(e) => handleChange('position', e.target.value)}
                                placeholder="Vendedor"
                            />
                        </div>
                        {hasError('position') && (
                            <p className="text-red-500 text-sm mt-1">{getError('position')}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de Ingreso *
                        </label>
                        <div className="relative">
                            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                className={`w-full pl-10 text-gray-900 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] ${
                                    hasError('date_joined') ? 'border-red-500' : 'border-gray-300'
                                }`}
                                value={formData.date_joined}
                                onChange={(e) => handleChange('date_joined', e.target.value)}
                            />
                        </div>
                        {hasError('date_joined') && (
                            <p className="text-red-500 text-sm mt-1">{getError('date_joined')}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Datos personales */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <FaIdCard className="text-purple-600" />
                    Información Personal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            DNI *
                        </label>
                        <div className="relative">
                            <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className={`w-full text-gray-900 pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] ${
                                    hasError('dni') ? 'border-red-500' : 'border-gray-300'
                                }`}
                                value={formData.dni}
                                onChange={(e) => handleChange('dni', e.target.value)}
                                placeholder="12345678"
                            />
                        </div>
                        {hasError('dni') && (
                            <p className="text-red-500 text-sm mt-1">{getError('dni')}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            CUIL
                        </label>
                        <input
                            type="text"
                            className={`w-full text-gray-900 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] ${
                                hasError('cuil') ? 'border-red-500' : 'border-gray-300'
                            }`}
                            value={formData.cuil}
                            onChange={(e) => handleChange('cuil', e.target.value)}
                            placeholder="20-12345678-9"
                        />
                        {hasError('cuil') && (
                            <p className="text-red-500 text-sm mt-1">{getError('cuil')}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de Nacimiento *
                        </label>
                        <div className="relative">
                            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                className={`w-full text-gray-900 pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] ${
                                    hasError('birth') ? 'border-red-500' : 'border-gray-300'
                                }`}
                                value={formData.birth}
                                onChange={(e) => handleChange('birth', e.target.value)}
                            />
                        </div>
                        {hasError('birth') && (
                            <p className="text-red-500 text-sm mt-1">{getError('birth')}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono
                        </label>
                        <div className="relative">
                            <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                className={`w-full text-gray-900 pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#18c29c] ${
                                    hasError('phone') ? 'border-red-500' : 'border-gray-300'
                                }`}
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="+54 11 1234-5678"
                            />
                        </div>
                        {hasError('phone') && (
                            <p className="text-red-500 text-sm mt-1">{getError('phone')}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Dirección */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-orange-600" />
                    Dirección
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            País
                        </label>
                        <select
                            className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c]"
                            value={formData.country}
                            onChange={(e) => handleCountryChange(e.target.value)}
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
                            Estado/Provincia
                            {formData.country === 'Argentina' && loadingProvincias && (
                                <FaSpinner className="inline ml-2 animate-spin text-gray-400 text-xs" />
                            )}
                        </label>
                        {formData.country === 'Argentina' ? (
                            <select
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c]"
                                value={selectedProvinciaId || ''}
                                onChange={(e) => handleProvinciaChange(e.target.value)}
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
                                type="text"
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c]"
                                value={formData.state}
                                onChange={(e) => handleChange('state', e.target.value)}
                                placeholder="Buenos Aires"
                            />
                        )}
                    </div>

                    <div className="relative city-search-container">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ciudad/Localidad
                            {formData.country === 'Argentina' && loadingCiudades && (
                                <FaSpinner className="inline ml-2 animate-spin text-gray-400 text-xs" />
                            )}
                        </label>
                        {formData.country === 'Argentina' ? (
                            <>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={citySearchTerm || formData.city}
                                        onChange={(e) => {
                                            handleCitySearch(e.target.value);
                                            handleChange('city', e.target.value);
                                        }}
                                        onFocus={() => {
                                            if (ciudades.length > 0) {
                                                setShowCityDropdown(true);
                                            }
                                        }}
                                        className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c]"
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
                                type="text"
                                className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c]"
                                value={formData.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                placeholder="CABA"
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código Postal
                        </label>
                        <input
                            type="text"
                            className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c]"
                            value={formData.postal_code}
                            onChange={(e) => handleChange('postal_code', e.target.value)}
                            placeholder="1000"
                        />
                    </div>

                    <div className="md:col-span-2 lg:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dirección
                        </label>
                        <input
                            type="text"
                            className="w-full text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c]"
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            placeholder="Av. Corrientes 1234"
                        />
                    </div>
                </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    disabled={loading}
                >
                    <FaTimes />
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-6 py-3 bg-[#18c29c] hover:bg-[#13a884] text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Guardando...
                        </>
                    ) : (
                        <>
                            <FaSave />
                            {isEdit ? 'Actualizar' : 'Crear'} Empleado
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default EmployeeForm;