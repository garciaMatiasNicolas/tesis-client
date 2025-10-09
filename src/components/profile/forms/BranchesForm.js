"use client";
import { useState } from "react";
import { FaPlus, FaBuilding, FaTrash, FaMapMarkerAlt, FaUser, FaSave, FaEdit, FaTimes, FaCheck } from "react-icons/fa";

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
    const [disabled, setDisabled] = useState(false);
    
    const canEdit = ["superadmin", "manager"].includes(userRole);
    const canDelete = ["superadmin"].includes(userRole);
    const canAdd = ["superadmin"].includes(userRole);

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
    };

    const confirmChanges = async (branch) => {
        // Validar antes de guardar
        if (validationErrors[branch.id]) {
            setDisabled(true);
            return;
        }
        
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
                                        Nombre de la sucursal
                                    </label>
                                    <input
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                            isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100'
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
                                </div>

                                {/* Manager */}
                                <div className="lg:col-span-1">
                                    <label className="block text-sm font-semibold text-[#223263] mb-2">
                                        Manager
                                        {branch.name && branch.name.endsWith("- Sucursal Principal") && (
                                            <span className="text-xs text-blue-600 ml-2">(Solo propietario)</span>
                                        )}
                                    </label>
                                    <select
                                        className={`disabled:cursor-not-allowed w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                            isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100'
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
                                    <label className="block text-sm font-semibold text-[#223263] mb-2">País</label>
                                    <input
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                            isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100'
                                        }`}
                                        value={branch.country || ''}
                                        onChange={e => isEditingBranch && onChange(idx, { ...branch, country: e.target.value })}
                                        placeholder="Argentina"
                                        readOnly={!isEditingBranch}
                                    />
                                </div>
                                
                                {/* Estado/Provincia */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#223263] mb-2">Estado/Provincia</label>
                                    <input
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                            isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100'
                                        }`}
                                        value={branch.state || ''}
                                        onChange={e => isEditingBranch && onChange(idx, { ...branch, state: e.target.value })}
                                        placeholder="Buenos Aires"
                                        readOnly={!isEditingBranch}
                                    />
                                </div>

                                {/* Código postal */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#223263] mb-2">Código Postal</label>
                                    <input
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                            isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100'
                                        }`}
                                        value={branch.postal_code || ''}
                                        onChange={e => isEditingBranch && onChange(idx, { ...branch, postal_code: e.target.value })}
                                        placeholder="1000"
                                        readOnly={!isEditingBranch}
                                    />
                                </div>
                                
                                {/* Ciudad */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#223263] mb-2">Ciudad</label>
                                    <input
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                            isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100'
                                        }`}
                                        value={branch.city || ''}
                                        onChange={e => isEditingBranch && onChange(idx, { ...branch, city: e.target.value })}
                                        placeholder="Buenos Aires"
                                        readOnly={!isEditingBranch}
                                    />
                                </div>
                                
                                {/* Dirección */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-[#223263] mb-2">Dirección</label>
                                    <input
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18c29c] text-gray-600 ${
                                            isEditingBranch ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-100'
                                        }`}
                                        value={branch.address || ''}
                                        onChange={e => isEditingBranch && onChange(idx, { ...branch, address: e.target.value })}
                                        placeholder="Av. Corrientes 1234"
                                        readOnly={!isEditingBranch}
                                    />
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
                                        disabled={loading || disabled || validationErrors[branch.id]}
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