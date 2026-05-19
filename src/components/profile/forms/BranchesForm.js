"use client";
import { useState, useEffect } from "react";
import { FaPlus, FaBuilding, FaTrash, FaMapMarkerAlt, FaUser, FaSave, FaEdit, FaTimes, FaCheck, FaSpinner, FaSearch } from "react-icons/fa";
import georefService from "@/services/georefService";

const BranchesForm = ({ 
    branches = [], 
    onChange, 
    onAdd, 
    onRemove, 
    onSave, 
    userRole = "employee", 
    loading = false, 
    users = [],
    store = null, // Agregar información de la store para validaciones
    currentUser = null // Información del usuario actual para validar permisos
}) => {
    const [editingBranches, setEditingBranches] = useState(new Set());
    const [validationErrors, setValidationErrors] = useState({});
    const [fieldErrors, setFieldErrors] = useState({}); // Errores de campos individuales
    const [disabled, setDisabled] = useState(false);
    
    // Estados para Georef API (por sucursal)
    const [provincias, setProvincias] = useState([]);
    const [ciudadesPorBranch, setCiudadesPorBranch] = useState({}); // { branchId: [ciudades] }
    const [loadingProvincias, setLoadingProvincias] = useState(false);
    const [loadingCiudades, setLoadingCiudades] = useState({});  // { branchId: boolean }
    const [selectedProvinciaId, setSelectedProvinciaId] = useState({}); // { branchId: provinciaId }
    const [citySearchTerm, setCitySearchTerm] = useState({}); // { branchId: searchTerm }
    const [showCityDropdown, setShowCityDropdown] = useState({}); // { branchId: boolean }
    
    const canEdit = ["superadmin", "manager"].includes(userRole);
    const canDelete = ["superadmin"].includes(userRole);
    const canAdd = ["superadmin"].includes(userRole);

    // Cargar provincias al montar el componente
    useEffect(() => {
        loadProvincias();
    }, []);

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
    const loadCiudades = async (branchId, provinciaId, provinciaNombre) => {
        try {
            setLoadingCiudades(prev => ({ ...prev, [branchId]: true }));
            setCiudadesPorBranch(prev => ({ ...prev, [branchId]: [] }));
            const data = await georefService.getLocalidades(provinciaId, provinciaNombre);
            setCiudadesPorBranch(prev => ({ ...prev, [branchId]: data }));
        } catch (error) {
            console.error('Error loading ciudades:', error);
        } finally {
            setLoadingCiudades(prev => ({ ...prev, [branchId]: false }));
        }
    };

    // Manejar búsqueda de ciudades
    const handleCitySearch = async (branchId, searchTerm, provinciaId) => {
        setCitySearchTerm(prev => ({ ...prev, [branchId]: searchTerm }));
        
        if (searchTerm.length >= 2 && provinciaId) {
            try {
                setLoadingCiudades(prev => ({ ...prev, [branchId]: true }));
                const data = await georefService.searchLocalidades(searchTerm, provinciaId);
                setCiudadesPorBranch(prev => ({ ...prev, [branchId]: data }));
                setShowCityDropdown(prev => ({ ...prev, [branchId]: true }));
            } catch (error) {
                console.error('Error searching ciudades:', error);
            } finally {
                setLoadingCiudades(prev => ({ ...prev, [branchId]: false }));
            }
        } else if (searchTerm.length === 0 && provinciaId) {
            const provincia = provincias.find(p => p.id === provinciaId);
            if (provincia) {
                loadCiudades(branchId, provinciaId, provincia.nombre);
            }
        }
    };

    // Seleccionar ciudad del dropdown
    const selectCity = (branchId, idx, branch, cityName) => {
        onChange(idx, { ...branch, city: cityName });
        setCitySearchTerm(prev => ({ ...prev, [branchId]: cityName }));
        setShowCityDropdown(prev => ({ ...prev, [branchId]: false }));
    };

    // Manejar cambio de provincia
    const handleProvinciaChange = (branchId, idx, branch, selectedId) => {
        const provincia = provincias.find(p => p.id === selectedId);
        
        if (provincia) {
            setSelectedProvinciaId(prev => ({ ...prev, [branchId]: selectedId }));
            onChange(idx, { ...branch, state: provincia.nombre, city: '', country: 'Argentina' });
            setCitySearchTerm(prev => ({ ...prev, [branchId]: '' }));
            loadCiudades(branchId, selectedId, provincia.nombre);
        }
    };

    // Manejar cambio de país
    const handleCountryChange = (branchId, idx, branch, value) => {
        onChange(idx, { ...branch, country: value, state: '', city: '' });
        setSelectedProvinciaId(prev => ({ ...prev, [branchId]: null }));
        setCiudadesPorBranch(prev => ({ ...prev, [branchId]: [] }));
        setCitySearchTerm(prev => ({ ...prev, [branchId]: '' }));
    };

    // Inicializar estados de georef cuando se comienza a editar una sucursal con datos de Argentina
    useEffect(() => {
        branches.forEach(branch => {
            if (branch.country === 'Argentina' && branch.state && !selectedProvinciaId[branch.id]) {
                const provincia = provincias.find(p => p.nombre === branch.state);
                if (provincia) {
                    setSelectedProvinciaId(prev => ({ ...prev, [branch.id]: provincia.id }));
                    loadCiudades(branch.id, provincia.id, provincia.nombre);
                }
            }
            if (branch.city && !citySearchTerm[branch.id]) {
                setCitySearchTerm(prev => ({ ...prev, [branch.id]: branch.city }));
            }
        });
    }, [branches, provincias]);

    // Función para verificar si el usuario puede editar una sucursal específica
    const canEditBranch = (branch, user) => {
        if (userRole === "superadmin") return true; // Superadmin puede editar todo
        if (userRole === "manager") {
            // Manager solo puede editar sus propias sucursales
            return branch.manager === user?.id;
        }
        return false; // Otros roles no pueden editar
    };

    const availableManagers = users.filter(user => 
        ["manager", "superadmin"].includes(user.role)
    );

    // Funciones para manejar el estado de edición
    const startEditing = (branchId) => {
        const newEditingBranches = new Set(editingBranches);
        newEditingBranches.add(branchId);
        setEditingBranches(newEditingBranches);
    };

    const cancelEditing = (branchId) => {
        const newEditingBranches = new Set(editingBranches);
        newEditingBranches.delete(branchId);
        setEditingBranches(newEditingBranches);
        setDisabled(false);
        setValidationErrors({});
        // Limpiar errores de campos para esta sucursal
        const newFieldErrors = { ...fieldErrors };
        delete newFieldErrors[branchId];
        setFieldErrors(newFieldErrors);
    };

    // Validar todos los campos obligatorios de una sucursal
    const validateBranch = (branch) => {
        const errors = {};
        
        if (!branch.name || !branch.name.trim()) {
            errors.name = 'El nombre de la sucursal es obligatorio';
        }
        if (!branch.manager) {
            errors.manager = 'El manager es obligatorio';
        }
        if (!branch.country || !branch.country.trim()) {
            errors.country = 'El país es obligatorio';
        }
        if (!branch.state || !branch.state.trim()) {
            errors.state = 'La provincia/estado es obligatoria';
        }
        if (!branch.city || !branch.city.trim()) {
            errors.city = 'La ciudad es obligatoria';
        }
        if (!branch.postal_code || !branch.postal_code.trim()) {
            errors.postal_code = 'El código postal es obligatorio';
        }
        if (!branch.address || !branch.address.trim()) {
            errors.address = 'La dirección es obligatoria';
        }
        
        return errors;
    };

    const confirmChanges = async (branch) => {
        // Validar campos obligatorios
        const errors = validateBranch(branch);
        
        if (Object.keys(errors).length > 0) {
            setFieldErrors(prev => ({ ...prev, [branch.id]: errors }));
            setDisabled(true);
            return;
        }
        
        // Validar antes de guardar (validaciones de negocio)
        if (validationErrors[branch.id]) {
            setDisabled(true);
            return;
        }
        
        // Limpiar errores de campos
        const newFieldErrors = { ...fieldErrors };
        delete newFieldErrors[branch.id];
        setFieldErrors(newFieldErrors);
        
        await onSave(branch);
        cancelEditing(branch.id);
    };

    const isEditing = (branchId) => {
        return editingBranches.has(branchId);
    };

    if (!loading && branches.length === 0) {
        return (
            <div className="w-full h-full bg-white rounded-xl p-8">
                <div className="text-center">
                    <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-3">No hay sucursales</h3>
                    <p className="text-gray-500 mb-6">
                        {canAdd 
                            ? "¡Comienza creando tu primera sucursal!"
                            : "Aún no se han configurado sucursales."
                        }
                    </p>
                    {canAdd && (
                        <button
                            type="button"
                            className="bg-[#18c29c] hover:bg-[#13a884] text-white px-6 py-3 rounded-lg font-semibold transition"
                            onClick={onAdd}
                        >
                            <FaPlus className="inline mr-2" />
                            Crear primera sucursal
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        
        <div className="w-full h-full bg-white rounded-xl p-6 overflow-y-auto">
            
            <div className="mb-6">
                <h2 className="text-xl font-bold text-[#223263] mb-2 flex items-center gap-2">
                    <FaBuilding className="text-[#18c29c]" /> 
                    Sucursales ({branches.length})
                </h2>
                <p className="text-sm text-gray-600">
                    {canEdit ? "Administra las sucursales de la tienda" : "Visualiza las sucursales de la tienda"}
                </p>
            </div>
            
            <div className="space-y-6">
                {branches?.map((branch, idx) => {
                                    const isNewBranch = typeof branch.id === 'string' && branch.id.startsWith('temp');
                                    const isEditingBranch = (isEditing(branch.id) || isNewBranch) && canEditBranch(branch, currentUser);                    return (
                        <div key={branch.id} className={`border border-gray-200 rounded-lg p-6 transition-all duration-200 ${
                            isEditingBranch 
                                ? 'bg-blue-50 border-blue-200 shadow-md' 
                                : 'bg-gray-50'
                        }`}>
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold text-[#223263]">
                                        {branch.name || `Sucursal ${idx + 1}`}
                                    </h3>
                                    {userRole === "manager" && !canEditBranch(branch, currentUser) && (
                                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                                            Solo lectura
                                        </span>
                                    )}
                                    {isNewBranch && (
                                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                            Nueva
                                        </span>
                                    )}
                                    {isEditingBranch && !isNewBranch && (
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                            Editando
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Botón de editar (lápiz) */}
                                    {!isNewBranch && canEdit && !isEditingBranch && canEditBranch(branch, currentUser) && (
                                        <button
                                            type="button"
                                            className="text-blue-500 hover:bg-blue-50 px-3 py-2 rounded transition"
                                            onClick={() => startEditing(branch.id)}
                                            title="Editar sucursal"
                                            disabled={loading}
                                        >
                                            <FaEdit />
                                        </button>
                                    )}
                                    
                                    {/* Mostrar mensaje si no puede editar */}
                                    {!isNewBranch && canEdit && !isEditingBranch && !canEditBranch(branch, currentUser) && (
                                        <span className="text-gray-400 px-3 py-2 text-sm" title="No puedes editar esta sucursal">
                                            <FaEdit />
                                        </span>
                                    )}
                                    
                                    {/* Botón de cancelar edición */}
                                    {!isNewBranch && isEditingBranch && (
                                        <button
                                            type="button"
                                            className="text-gray-500 hover:bg-gray-100 px-3 py-2 rounded transition"
                                            onClick={() => cancelEditing(branch.id)}
                                            title="Cancelar edición"
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                    
                                    {/* Botón eliminar */}
                                    {canDelete && (
                                        <button
                                            type="button"
                                            className="text-red-500 hover:bg-red-50 px-3 py-2 rounded transition"
                                            onClick={() => onRemove(branch.id)}
                                            title="Eliminar sucursal"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Nombre de la sucursal */}
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="block text-sm font-semibold text-[#223263] mb-2">
                                        Nombre de la sucursal <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                            fieldErrors[branch.id]?.name ? 'border-red-500 bg-red-50' : (isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100')
                                        }`}
                                        value={branch.name || ''}
                                        onChange={e => {
                                            if (!isEditingBranch) return;
                                            
                                            const newName = e.target.value;
                                            const updatedBranch = { ...branch, name: newName };
                                            
                                            // Si el nombre cambia a sucursal principal, validar el manager
                                            if (newName.endsWith("- Sucursal Principal") && branch.manager && branch.manager !== store?.owner) {
                                                setValidationErrors(prev => ({
                                                    ...prev,
                                                    [branch.id]: "Solo el propietario de la tienda puede ser manager de la sucursal principal."
                                                }));
                                            } else {
                                                // Limpiar errores si ya no es sucursal principal
                                                const newErrors = { ...validationErrors };
                                                delete newErrors[branch.id];
                                                setValidationErrors(newErrors);
                                            }
                                            
                                            onChange(idx, updatedBranch);
                                        }}
                                        placeholder="Sucursal Centro"
                                        readOnly={!isEditingBranch}
                                    />
                                    {fieldErrors[branch.id]?.name && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <span>⚠</span> {fieldErrors[branch.id].name}
                                        </p>
                                    )}
                                </div>

                                {/* Manager */}
                                <div className="lg:col-span-1">
                                    <label className="block text-sm font-semibold text-[#223263] mb-2">
                                        Manager <span className="text-red-500">*</span>
                                        {branch.name && branch.name.endsWith("- Sucursal Principal") && (
                                            <span className="text-xs text-blue-600 ml-2">(Solo propietario)</span>
                                        )}
                                    </label>
                                    <select
                                        className={`disabled:cursor-not-allowed w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                            fieldErrors[branch.id]?.manager ? 'border-red-500 bg-red-50' : (isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100')
                                        }`}
                                        value={branch.manager || ''}
                                        onChange={e => {
                                            if (!isEditingBranch) return;
                                            
                                            const selectedManagerId = e.target.value ? parseInt(e.target.value) : null;
                                            
                                            // Limpiar errores previos para este branch
                                            const newErrors = { ...validationErrors };
                                            delete newErrors[branch.id];
                                            setValidationErrors(newErrors);
                                            
                                            // Validación: Solo el owner puede ser manager de la sucursal principal
                                            if (branch.name && branch.name.endsWith("- Sucursal Principal")) {
                                                if (selectedManagerId && selectedManagerId !== store?.owner) {
                                                    setValidationErrors(prev => ({
                                                        ...prev,
                                                        [branch.id]: "Solo el propietario de la tienda puede ser manager de la sucursal principal."
                                                    }));
                                                    return;
                                                }
                                            }
                                            
                                            onChange(idx, { 
                                                ...branch, 
                                                manager: selectedManagerId,
                                                // Actualizar también el nombre del manager para la UI
                                                manager_name: selectedManagerId ? 
                                                    (() => {
                                                        const selectedManager = availableManagers.find(m => m.id === selectedManagerId);
                                                        return selectedManager ? `${selectedManager.first_name} ${selectedManager.last_name}` : '';
                                                    })() 
                                                    : ''
                                            });
                                        }}
                                        disabled={!isEditingBranch || loading || userRole !== "superadmin"}
                                    >
                                        <option value="">Sin manager asignado</option>
                                        {availableManagers.map(manager => (
                                            <option key={manager.id} value={manager.id}>
                                                {manager.first_name} {manager.last_name}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {/* Mostrar error de validación */}
                                    {validationErrors[branch.id] && (
                                        <p className="text-sm text-red-500 mt-1 font-medium">
                                            {validationErrors[branch.id]}
                                        </p>
                                    )}
                                    
                                    {/* Mostrar error de campo obligatorio */}
                                    {fieldErrors[branch.id]?.manager && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <span>⚠</span> {fieldErrors[branch.id].manager}
                                        </p>
                                    )}
                                    
                                    {/* Mostrar nombre del manager actual si no está en modo edición */}
                                    {!isEditingBranch && branch.manager_name && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Actual: {branch.manager_name}
                                        </p>
                                    )}
                                    {!isEditingBranch && branch.manager && !branch.manager_name && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Manager ID: {branch.manager}
                                        </p>
                                    )}
                                </div>

                                {/* País */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#223263] mb-2">País <span className="text-red-500">*</span></label>
                                    <select
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                            fieldErrors[branch.id]?.country ? 'border-red-500 bg-red-50' : (isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100')
                                        }`}
                                        value={branch.country || ''}
                                        onChange={e => isEditingBranch && handleCountryChange(branch.id, idx, branch, e.target.value)}
                                        disabled={!isEditingBranch}
                                    >
                                        <option value="">Seleccione un país</option>
                                        <option value="Argentina">Argentina</option>
                                        <option value="Brasil">Brasil</option>
                                        <option value="Chile">Chile</option>
                                        <option value="Uruguay">Uruguay</option>
                                        <option value="Paraguay">Paraguay</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                    {fieldErrors[branch.id]?.country && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <span>⚠</span> {fieldErrors[branch.id].country}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Estado/Provincia */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#223263] mb-2">
                                        Estado/Provincia <span className="text-red-500">*</span>
                                        {branch.country === 'Argentina' && loadingProvincias && (
                                            <FaSpinner className="inline ml-2 animate-spin text-gray-400 text-xs" />
                                        )}
                                    </label>
                                    {branch.country === 'Argentina' ? (
                                        <select
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                                fieldErrors[branch.id]?.state ? 'border-red-500 bg-red-50' : (isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100')
                                            }`}
                                            value={selectedProvinciaId[branch.id] || ''}
                                            onChange={e => isEditingBranch && handleProvinciaChange(branch.id, idx, branch, e.target.value)}
                                            disabled={!isEditingBranch || loadingProvincias}
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
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                                fieldErrors[branch.id]?.state ? 'border-red-500 bg-red-50' : (isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100')
                                            }`}
                                            value={branch.state || ''}
                                            onChange={e => isEditingBranch && onChange(idx, { ...branch, state: e.target.value })}
                                            placeholder="Buenos Aires"
                                            readOnly={!isEditingBranch}
                                        />
                                    )}
                                    {fieldErrors[branch.id]?.state && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <span>⚠</span> {fieldErrors[branch.id].state}
                                        </p>
                                    )}
                                </div>

                               {/* Código postal */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#223263] mb-2">Código Postal <span className="text-red-500">*</span></label>
                                    <input
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                            fieldErrors[branch.id]?.postal_code ? 'border-red-500 bg-red-50' : (isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100')
                                        }`}
                                        value={branch.postal_code || ''}
                                        onChange={e => isEditingBranch && onChange(idx, { ...branch, postal_code: e.target.value })}
                                        placeholder="1000"
                                        readOnly={!isEditingBranch}
                                    />
                                    {fieldErrors[branch.id]?.postal_code && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <span>⚠</span> {fieldErrors[branch.id].postal_code}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Ciudad */}
                                <div className="relative">
                                    <label className="block text-sm font-semibold text-[#223263] mb-2">
                                        Ciudad <span className="text-red-500">*</span>
                                        {branch.country === 'Argentina' && loadingCiudades[branch.id] && (
                                            <FaSpinner className="inline ml-2 animate-spin text-gray-400 text-xs" />
                                        )}
                                    </label>
                                    {branch.country === 'Argentina' ? (
                                        <>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={citySearchTerm[branch.id] || branch.city || ''}
                                                    onChange={(e) => {
                                                        if (!isEditingBranch) return;
                                                        handleCitySearch(branch.id, e.target.value, selectedProvinciaId[branch.id]);
                                                        onChange(idx, { ...branch, city: e.target.value });
                                                    }}
                                                    onFocus={() => {
                                                        if (ciudadesPorBranch[branch.id]?.length > 0) {
                                                            setShowCityDropdown(prev => ({ ...prev, [branch.id]: true }));
                                                        }
                                                    }}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                                        fieldErrors[branch.id]?.city ? 'border-red-500 bg-red-50' : (isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100')
                                                    }`}
                                                    placeholder={selectedProvinciaId[branch.id] ? "Buscar ciudad..." : "Primero seleccione provincia"}
                                                    disabled={!selectedProvinciaId[branch.id] || !isEditingBranch}
                                                    readOnly={!isEditingBranch}
                                                />
                                                {isEditingBranch && <FaSearch className="absolute right-4 top-4 text-gray-400 text-sm" />}
                                            </div>
                                            
                                            {/* Dropdown de ciudades */}
                                            {isEditingBranch && showCityDropdown[branch.id] && ciudadesPorBranch[branch.id]?.length > 0 && (
                                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                    {ciudadesPorBranch[branch.id].map((ciudad) => (
                                                        <button
                                                            key={ciudad.id}
                                                            type="button"
                                                            onClick={() => selectCity(branch.id, idx, branch, ciudad.nombre)}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-900 transition-colors"
                                                        >
                                                            {ciudad.nombre}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {isEditingBranch && selectedProvinciaId[branch.id] && !ciudadesPorBranch[branch.id]?.length && !loadingCiudades[branch.id] && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Escriba al menos 2 letras para buscar
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <input
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                                fieldErrors[branch.id]?.city ? 'border-red-500 bg-red-50' : (isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100')
                                            }`}
                                            value={branch.city || ''}
                                            onChange={e => isEditingBranch && onChange(idx, { ...branch, city: e.target.value })}
                                            placeholder="Buenos Aires"
                                            readOnly={!isEditingBranch}
                                        />
                                    )}
                                    {fieldErrors[branch.id]?.city && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <span>⚠</span> {fieldErrors[branch.id].city}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Dirección */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-[#223263] mb-2">Dirección <span className="text-red-500">*</span></label>
                                    <input
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                            fieldErrors[branch.id]?.address ? 'border-red-500 bg-red-50' : (isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100')
                                        }`}
                                        value={branch.address || ''}
                                        onChange={e => isEditingBranch && onChange(idx, { ...branch, address: e.target.value })}
                                        placeholder="Av. Corrientes 1234"
                                        readOnly={!isEditingBranch}
                                    />
                                    {fieldErrors[branch.id]?.address && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <span>⚠</span> {fieldErrors[branch.id].address}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Botón de confirmar cambios - solo aparece cuando se está editando */}
                            {isEditingBranch && (
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        className={`bg-[#18c29c] hover:bg-[#13a884] text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                            loading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        onClick={() => confirmChanges(branch)}
                                        disabled={loading || disabled || validationErrors[branch.id] || (fieldErrors[branch.id] && Object.keys(fieldErrors[branch.id]).length > 0)}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <FaCheck />
                                                Confirmar cambios
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {canAdd && (
                <div className="mt-6">
                    <button
                        type="button"
                        className={`bg-[#18c29c] hover:bg-[#13a884] text-white px-6 py-3 rounded-lg font-semibold transition ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={onAdd}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                Cargando...
                            </>
                        ) : (
                            <>
                                <FaPlus className="inline mr-2" />
                                Agregar sucursal
                            </>
                        )}
                    </button>
                </div>
            )}
            
            {!canEdit && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm text-center">
                        <strong>Modo solo lectura:</strong> No tienes permisos para editar las sucursales.
                    </p>
                </div>
            )}
        </div>
    );
};

export default BranchesForm;