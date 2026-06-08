"use client";
import { FaUser, FaSave, FaCamera, FaSpinner, FaSearch } from "react-icons/fa";
import { useRef, useState, useEffect } from "react";
import georefService from "@/services/georefService";

// Componente para editar datos de perfil
const UserForm = ({ user, onChange, onSave, loading = false, saving = false }) => {
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef();
    
    // Estados para Georef API
    const [provincias, setProvincias] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [loadingProvincias, setLoadingProvincias] = useState(false);
    const [loadingCiudades, setLoadingCiudades] = useState(false);
    const [selectedProvinciaId, setSelectedProvinciaId] = useState(null);
    const [citySearchTerm, setCitySearchTerm] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    // Cargar provincias al montar el componente
    useEffect(() => {
        loadProvincias();
    }, []);

    // Inicializar estados de georef cuando hay datos del usuario
    useEffect(() => {
        if (user?.employee_info?.country === 'Argentina' && user.employee_info.state) {
            const provincia = provincias.find(p => p.nombre === user.employee_info.state);
            if (provincia) {
                setSelectedProvinciaId(provincia.id);
                loadCiudades(provincia.id, provincia.nombre);
            }
        }
        if (user?.employee_info?.city) {
            setCitySearchTerm(user.employee_info.city);
        }
    }, [user, provincias]);

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
        onChange({ 
            ...user, 
            employee_info: { 
                ...user.employee_info, 
                city: cityName 
            } 
        });
        setCitySearchTerm(cityName);
        setShowCityDropdown(false);
    };

    // Manejar cambio de provincia
    const handleProvinciaChange = (selectedId) => {
        const provincia = provincias.find(p => p.id === selectedId);
        
        if (provincia) {
            setSelectedProvinciaId(selectedId);
            onChange({ 
                ...user, 
                employee_info: { 
                    ...user.employee_info, 
                    state: provincia.nombre, 
                    city: '',
                    country: 'Argentina'
                } 
            });
            setCitySearchTerm('');
            loadCiudades(selectedId, provincia.nombre);
        }
    };

    // Manejar cambio de país
    const handleCountryChange = (value) => {
        onChange({ 
            ...user, 
            employee_info: { 
                ...user.employee_info, 
                country: value, 
                state: '', 
                city: '' 
            } 
        });
        setSelectedProvinciaId(null);
        setCiudades([]);
        setCitySearchTerm('');
    };

    // Si no hay usuario o está cargando, mostrar estado de carga
    if (!user || loading) {
        return (
            <div className="bg-white rounded-xl p-6 md:p-10 w-full max-w-2xl mx-auto">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18c29c] mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando datos del usuario...</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                onChange({ ...user, avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <form className="bg-white rounded-xl p-6 md:p-10 w-full max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-[#223263] mb-6 flex items-center gap-2">
                <FaUser className="text-[#18c29c]" /> Datos de perfil
            </h2>
            <div className="flex flex-col items-center mb-6">
                <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-[#18c29c]">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Avatar"
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <FaUser className="text-gray-300 w-16 h-16" />
                        )}
                    </div>
                    <button
                        type="button"
                        className="absolute bottom-2 right-2 bg-[#18c29c] text-white rounded-full p-2 shadow hover:bg-[#18c29c] transition"
                        onClick={() => fileInputRef.current.click()}
                        title="Cambiar foto"
                    >
                        <FaCamera />
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                    />
                </div>
            </div>
            {/* Datos básicos del usuario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#18c29c] text-gray-600"
                        value={user?.first_name || ''}
                        onChange={e => onChange({ ...user, first_name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#18c29c] text-gray-600"
                        value={user?.last_name || ''}
                        onChange={e => onChange({ ...user, last_name: e.target.value })}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600"
                        value={user?.email || ''}
                        disabled
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <input
                        className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600"
                        value={user?.role || ''}
                        disabled
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activo</label>
                    <input
                        className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600"
                        value={user?.is_active ? "Sí" : "No"}
                        disabled
                    />
                </div>
            </div>

            {/* Información del empleado si es empleado o manager */}
            {user?.employee_info && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                        Información del Empleado
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Posición</label>
                            <input
                                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600"
                                value={user.employee_info.position || ''}
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                            <input
                                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600"
                                value={user.employee_info.dni || ''}
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CUIL</label>
                            <input
                                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600"
                                value={user.employee_info.cuil || ''}
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#18c29c] text-gray-600"
                                value={user.employee_info.phone || ''}
                                onChange={e => onChange({ 
                                    ...user, 
                                    employee_info: { 
                                        ...user.employee_info, 
                                        phone: e.target.value 
                                    } 
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                            <input
                                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600"
                                value={user.employee_info.birth || ''}
                                type="date"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso</label>
                            <input
                                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600"
                                value={user.employee_info.date_joined || ''}
                                type="date"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tienda</label>
                            <input
                                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600"
                                value={user.employee_info.store_name || ''}
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal</label>
                            <input
                                className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600"
                                value={user.employee_info.branch_name || ''}
                                disabled
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                            <input
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#18c29c] text-gray-600"
                                value={user.employee_info.address || ''}
                                onChange={e => onChange({ 
                                    ...user, 
                                    employee_info: { 
                                        ...user.employee_info, 
                                        address: e.target.value 
                                    } 
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                            <select
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#18c29c] text-gray-600"
                                value={user.employee_info.country || ''}
                                onChange={e => handleCountryChange(e.target.value)}
                            >
                                <option value="">Seleccione un país</option>
                                <option value="Argentina">Argentina</option>
                                <option value="Brasil">Brasil</option>
                                <option value="Chile">Chile</option>
                                <option value="Uruguay">Uruguay</option>
                                <option value="Paraguay">Paraguay</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estado/Provincia
                                {user.employee_info.country === 'Argentina' && loadingProvincias && (
                                    <FaSpinner className="inline ml-2 animate-spin text-gray-400 text-xs" />
                                )}
                            </label>
                            {user.employee_info.country === 'Argentina' ? (
                                <select
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#18c29c] text-gray-600"
                                    value={selectedProvinciaId || ''}
                                    onChange={e => handleProvinciaChange(e.target.value)}
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
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#18c29c] text-gray-600"
                                    value={user.employee_info.state || ''}
                                    onChange={e => onChange({ 
                                        ...user, 
                                        employee_info: { 
                                            ...user.employee_info, 
                                            state: e.target.value 
                                        } 
                                    })}
                                    placeholder="Ej: Buenos Aires"
                                />
                            )}
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ciudad
                                {user.employee_info.country === 'Argentina' && loadingCiudades && (
                                    <FaSpinner className="inline ml-2 animate-spin text-gray-400 text-xs" />
                                )}
                            </label>
                            {user.employee_info.country === 'Argentina' ? (
                                <>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={citySearchTerm || user.employee_info.city || ''}
                                            onChange={(e) => {
                                                handleCitySearch(e.target.value);
                                                onChange({ 
                                                    ...user, 
                                                    employee_info: { 
                                                        ...user.employee_info, 
                                                        city: e.target.value 
                                                    } 
                                                });
                                            }}
                                            onFocus={() => {
                                                if (ciudades.length > 0) {
                                                    setShowCityDropdown(true);
                                                }
                                            }}
                                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#18c29c] text-gray-600 pr-10"
                                            placeholder={selectedProvinciaId ? "Buscar ciudad..." : "Primero seleccione provincia"}
                                            disabled={!selectedProvinciaId}
                                        />
                                        <FaSearch className="absolute right-3 top-3 text-gray-400 text-sm" />
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
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#18c29c] text-gray-600"
                                    value={user.employee_info.city || ''}
                                    onChange={e => onChange({ 
                                        ...user, 
                                        employee_info: { 
                                            ...user.employee_info, 
                                            city: e.target.value 
                                        } 
                                    })}
                                    placeholder="Ej: La Plata"
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                            <input
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#18c29c] text-gray-600"
                                value={user.employee_info.postal_code || ''}
                                onChange={e => onChange({ 
                                    ...user, 
                                    employee_info: { 
                                        ...user.employee_info, 
                                        postal_code: e.target.value 
                                    } 
                                })}
                            />
                        </div>
                    </div>
                </div>
            )}
            <button
                type="button"
                className={`mt-8 flex items-center gap-2 bg-[#18c29c] hover:bg-[#18c29c] text-white px-6 py-2 rounded-md font-semibold text-lg transition ${
                    saving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => onSave(user)}
                disabled={saving}
            >
                {saving ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                    </>
                ) : (
                    <>
                        <FaSave /> Guardar cambios
                    </>
                )}
            </button>
        </form>
    );
};

export default UserForm;