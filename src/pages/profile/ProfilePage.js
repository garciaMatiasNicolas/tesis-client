"use client";
import React, { useEffect, useState } from "react";
import SideBar from "../../components/ui/SideBar";
import Alert from "@/components/ui/Alert";
import { FaUser, FaStore, FaCog, FaUsers, FaHome, FaList, FaPlus, FaBuilding } from "react-icons/fa";
import UserForm from "@/components/profile/forms/UserForm";
import StoreForm from "@/components/store/StoreForm";
import GeneralSettings from "@/components/profile/Settings";
import BranchesForm from "@/components/profile/forms/BranchesForm";
import useApiMethods from "@/hooks/useApiMethods";

const tabs = [
    { label: "Perfil", icon: <FaUser />, section: "profile" },
    { label: "Tienda", icon: <FaStore />, section: "store" },
    { label: "Sucursales", icon: <FaBuilding />, section: "branches" },
    { label: "Configuración", icon: <FaCog />, section: "settings" },
];

export default function ProfilePage() {
    const { getMethod, putMethod, postMethod, deleteMethod } = useApiMethods();
    const [section, setSection] = useState("profile");
    const [user, setUser] = useState([]); // Usar datos iniciales como objeto
    const [store, setStore] = useState(null);
    const [branches, setBranches] = useState([]); // Usar datos iniciales completos
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false); // Cambiar a false inicialmente
    const [saving, setSaving] = useState(false);

    // Alert state
    const [alert, setAlert] = useState({
        show: false,
        type: 'success',
        title: '',
        message: ''
    });

    // Función para obtener datos del usuario actual
    const fetchUser = async () => {
        try {
            const response = await getMethod("/users/me/");
            setUser(response);
        } catch (error) {
            setAlert({
                show: true,
                type: 'danger',
                title: 'Error',
                message: 'No se pudieron cargar los datos del usuario.'
            });
        }
    };

    // Función para obtener tienda
    const fetchStore = async () => {
        try {
            const response = await getMethod("/stores/");
            if (response && response.length > 0) {
                setStore(response[0]); // Asumiendo que el usuario tiene una tienda
            }
        } catch (error) {
            setAlert({
                show: true,
                type: 'danger',
                title: 'Error',
                message: 'No se pudo cargar los datos de la tienda.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Función para actualizar usuario
    const handleUpdateUser = async (userData) => {
        setSaving(true);
        try {
            let hasErrors = false;
            
            // Actualizar datos básicos del usuario
            const cleanUserData = {
                first_name: userData?.first_name || '',
                last_name: userData?.last_name || '',
                email: userData?.email || '',
            };

            await putMethod(`/users/${user.id}/`, cleanUserData);
            
            // Si hay datos de empleado que se pueden modificar, actualizarlos también
            if (userData?.employee_info && userData.employee_info.id) {
                const employeeData = {
                    // Solo enviar los campos editables que pueden cambiar
                    phone: userData.employee_info.phone || '',
                    address: userData.employee_info.address || '',
                    city: userData.employee_info.city || '',
                    state: userData.employee_info.state || '',
                    country: userData.employee_info.country || '',
                    postal_code: userData.employee_info.postal_code || '',
                };

                try {
                    // Actualizar los datos del empleado - ahora solo campos editables
                    await putMethod(`/employees/${userData.employee_info.id}/`, employeeData);
                } catch (employeeError) {
                    hasErrors = true;
                    
                    // Mostrar errores específicos si están disponibles
                    const errorMessage = employeeError.response?.data ? 
                        Object.entries(employeeError.response.data)
                            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                            .join('\n') :
                        'Los datos básicos se actualizaron, pero hubo un error con los datos del empleado.';
                    
                    setAlert({
                        show: true,
                        type: 'warning',
                        title: 'Actualización parcial',
                        message: errorMessage
                    });
                }
            }
            
            // Recargar los datos del usuario para obtener la información actualizada
            await fetchUser();
            
            if (!hasErrors) {
                setAlert({
                    show: true,
                    type: 'success',
                    title: '¡Éxito!',
                    message: 'Todos los datos se han actualizado correctamente.'
                });
            }
        } catch (error) {
            setAlert({
                show: true,
                type: 'danger',
                title: 'Error',
                message: error.response?.data?.message || 'No se pudieron actualizar los datos del usuario.'
            });
        } finally {
            setSaving(false);
        }
    };

    // Función para actualizar tienda
    const handleUpdateStore = async (formData) => {
        setSaving(true);
        try {
            // Verificar si hay un logo para subir
            const hasFile = formData.logo instanceof File;
            let dataToSend = formData;

            // Si hay un archivo, convertir a FormData
            if (hasFile) {
                const form = new FormData();
                Object.keys(formData).forEach(key => {
                    if (formData[key] !== null && formData[key] !== undefined) {
                        form.append(key, formData[key]);
                    }
                });
                dataToSend = form;
            }

            if (store?.id) {
                await putMethod(`/stores/${store.id}/`, dataToSend, true, hasFile);
                setAlert({
                    show: true,
                    type: 'success',
                    title: '¡Éxito!',
                    message: 'La tienda se ha actualizado correctamente.'
                });
                fetchStore(); // Recargar datos
            } else {
                const response = await postMethod("/stores/", dataToSend, true, hasFile);
                setStore(response);
                setAlert({
                    show: true,
                    type: 'success',
                    title: '¡Tienda creada!',
                    message: 'Tu tienda se ha creado exitosamente.'
                });
            }
        } catch (error) {
            setAlert({
                show: true,
                type: 'danger',
                title: 'Error',
                message: error.response?.data?.message || 'Ocurrió un error al guardar la tienda.'
            });
        } finally {
            setSaving(false);
        }
    };

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const response = await getMethod("/branches/");
            const branchesData = response.results || [];
            
            // Si no hay usuarios cargados todavía, cargarlos primero
            if (users.length === 0) {
                await fetchManagers();
            }
            
            // Añadir los nombres de los managers a cada sucursal para mostrar en la UI
            const branchesWithManagerNames = branchesData.map(branch => {
                if (branch.manager) {
                    const managerUser = users.find(user => user.id === branch.manager);
                    if (managerUser) {
                        return {
                            ...branch,
                            manager_name: `${managerUser.first_name} ${managerUser.last_name}`
                        };
                    }
                }
                return branch;
            });
            
            setBranches(branchesWithManagerNames);
        } catch (error) {
            setAlert({
                show: true,
                type: 'danger',
                title: 'Error',
                message: 'No se pudieron cargar los datos de las sucursales.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener usuarios con roles de manager y superadmin
    const fetchManagers = async () => {
        try {
            const response = await getMethod("/users/");
            // Manejar diferentes formatos de respuesta
            const usersList = response.results || response || [];
            // Filtrar solo usuarios con roles manager o superadmin
            const managers = usersList.filter(user => 
                user.role === 'manager' || user.role === 'superadmin'
            );
            setUsers(managers);
        } catch (error) {
            setAlert({
                show: true,
                type: 'danger',
                title: 'Error',
                message: 'No se pudieron cargar los usuarios managers.'
            });
        }
    };

    // Cargar todos los datos al montar el componente
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                await Promise.all([
                    fetchUser(),
                    fetchStore(),
                    fetchManagers(), // Cargar managers reales del backend primero
                    fetchBranches()  // Cargar sucursales después para usar los datos de managers
                ]);
            } catch (error) {
                setAlert({
                    show: true,
                    type: 'danger',
                    title: 'Error',
                    message: 'No se pudieron cargar los datos iniciales.'
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);
    
    // Efecto para actualizar los nombres de managers en las sucursales cuando cambian los usuarios
    useEffect(() => {
        // Solo si tenemos tanto branches como users cargados
        if (branches.length > 0 && users.length > 0) {
            const updatedBranches = branches.map(branch => {
                if (branch.manager) {
                    const managerUser = users.find(user => user.id === branch.manager);
                    if (managerUser) {
                        return {
                            ...branch,
                            manager_name: `${managerUser.first_name} ${managerUser.last_name}`
                        };
                    }
                }
                return branch;
            });
            setBranches(updatedBranches);
        }
    }, [users]);

    // Sidebar igual que en Dashboard, con items según permisos
    const sidebarItems = [
        { label: "Inicio", icon: <FaHome />, onClick: () => window.location.href = "/dashboard" },
        {
            label: "Empleados",
            icon: <FaUsers />,
            dropdown: [
                { label: "Lista", icon: <FaList />, onClick: () => {} },
                { label: "Agregar", icon: <FaPlus />, onClick: () => {} },
            ],
        },
    ];

    // Handlers para sucursales
    const handleBranchChange = (idx, newBranch) => {
        const updatedBranches = [...branches];
        updatedBranches[idx] = newBranch;
        setBranches(updatedBranches);
        
        // No actualizamos automáticamente el backend aquí
        // Los cambios se confirman con el botón "Confirmar cambios"
    };

    const handleBranchAdd = () => {
        const newBranch = {
            id: `temp-${Date.now()}`, // ID temporal con formato correcto
            name: "",
            country: "",
            state: "",
            postal_code: "",
            city: "",
            address: "",
            store: store?.id,
            manager: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setBranches(prev => [...prev, newBranch]);
    };

    const handleBranchRemove = async (id) => {
        if (id.toString().startsWith("temp")) {
            // Remover localmente si es temporal
            setBranches(branches => branches.filter(b => b.id !== id));
        } else {
            // Eliminar del backend
            try {
                await deleteMethod(`/branches/${id}/`);
                setBranches(branches => branches.filter(b => b.id !== id));
                setAlert({
                    show: true,
                    type: 'success',
                    title: 'Sucursal eliminada',
                    message: 'La sucursal se ha eliminado correctamente.'
                });
            } catch (error) {
                setAlert({
                    show: true,
                    type: 'danger',
                    title: 'Error',
                    message: 'No se pudo eliminar la sucursal.'
                });
            }
        }
    };

    const handleBranchSave = async (branch) => {
        setSaving(true);
        try {
            if (branch.id.toString().startsWith("temp")) {
                // Crear nueva sucursal
                const branchData = { ...branch };
                delete branchData.id; // Remover ID temporal
                delete branchData.created_at; // Remover timestamps
                delete branchData.updated_at;
                delete branchData.manager_name; // Eliminar campo de UI
                
                const response = await postMethod("/branches/", branchData);
                
                // Actualizar la lista local con los datos del backend
                setBranches(prev => prev.map(b => 
                    b.id === branch.id ? response : b
                ));
                
                setAlert({
                    show: true,
                    type: 'success',
                    title: 'Sucursal creada',
                    message: 'La nueva sucursal se ha creado correctamente.'
                });
            } else {
                // Actualizar sucursal existente
                const branchData = { ...branch };
                delete branchData.created_at; // No enviar timestamps
                delete branchData.updated_at;
                delete branchData.manager_name; // Eliminar campo de UI
                
                const response = await putMethod(`/branches/${branch.id}/`, branchData);
                
                // Actualizar la lista local con los datos del backend
                setBranches(prev => prev.map(b => 
                    b.id === branch.id ? response : b
                ));
                
                setAlert({
                    show: true,
                    type: 'success',
                    title: 'Sucursal actualizada',
                    message: 'Los cambios se han guardado correctamente.'
                });
            }
        } catch (error) {
            if (error.response && error.response.data.manager) {
                setAlert({
                    show: true,
                    type: 'danger',
                    title: 'Error',
                    message: error.response.data.manager[0]
                });
            } else {
                setAlert({
                    show: true,
                    type: 'danger',
                    title: 'Error',
                    message: `No se pudo ${branch.id.toString().startsWith("temp") ? 'crear' : 'actualizar'} la sucursal.`
                });
            }
            fetchBranches(); // Recargar sucursales para sincronizar
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc] items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#18c29c] mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            {alert.show && (
                <Alert
                    type={alert.type}
                    title={alert.title}
                    text={alert.message}
                    onClose={() => setAlert({ show: false, type: '', title: '', message: '' })}
                />
            )}
            
            <SideBar
                items={sidebarItems}
                onProfile={() => window.location.href = "/profile"}
                onSupport={() => alert("Soporte")}
                onLogout={() => alert("Cerrar sesión")}
            />

            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto" style={{maxWidth: "1400px"}}>
                <div className="w-full h-full">
                    <div className="w-full h-full flex rounded-xl shadow-lg bg-white overflow-hidden">
                        {/* Mini sidebar de navegación de perfil */}
                        <nav className="hidden md:block w-48 lg:w-56 border-r border-gray-100 bg-white py-4 md:py-8">
                            <ul className="flex flex-col gap-1 md:gap-2 px-2 md:px-4">
                                {tabs.map(tab => (
                                    <li key={tab.section}>
                                        <button
                                            onClick={() => setSection(tab.section)}
                                            className={`flex items-center gap-2 w-full px-2 md:px-4 py-2 md:py-3 rounded-md font-semibold transition text-sm md:text-base
                                                ${section === tab.section
                                                    ? "bg-[#18c29c] text-white shadow"
                                                    : "text-[#223263] hover:bg-[#e6f7f3]"}
                                            `}
                                        >
                                            <span className="text-xs md:text-sm">{tab.icon}</span>
                                            <span className="text-xs md:text-sm">{tab.label}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        {/* Para mobile, navegación arriba */}
                        <div className="block md:hidden w-full p-2 md:p-4">
                            <nav className="mb-2 md:mb-4 p-2 md:p-5">
                                <ul className="flex gap-1 md:gap-2 flex-wrap">
                                    {tabs.map(tab => (
                                        <li key={tab.section}>
                                            <button
                                                onClick={() => setSection(tab.section)}
                                                className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 rounded-md font-semibold transition text-xs md:text-base
                                                    ${section === tab.section
                                                        ? "bg-[#18c29c] text-white shadow"
                                                        : "bg-gray-100 text-[#223263] hover:bg-[#e6f7f3]"}
                                                `}
                                            >
                                                <span className="text-xs">{tab.icon}</span>
                                                <span className="hidden sm:inline text-xs md:text-sm">{tab.label}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                        {/* Contenido según tab */}
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                                {section === "profile" && (
                                    <UserForm 
                                        user={user} 
                                        onChange={setUser} 
                                        onSave={handleUpdateUser}
                                        loading={loading}
                                        saving={saving}
                                    />
                                )}
                                {section === "store" && (
                                    ["superadmin", "manager", "employee"].includes(user?.role)
                                        ? <StoreForm 
                                            store={store}
                                            onChange={setStore}
                                            onSave={handleUpdateStore}
                                            readOnly={!["superadmin"].includes(user?.role)}
                                            loading={loading}
                                        />
                                        : <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 text-center text-gray-400 text-sm md:text-base">No tienes acceso a datos de tienda.</div>
                                )}
                                {section === "branches" && (
                                    ["superadmin", "manager", "employee"].includes(user?.role)
                                        ? <BranchesForm
                                            branches={branches}
                                            onChange={handleBranchChange}
                                            onAdd={handleBranchAdd}
                                            onRemove={handleBranchRemove}
                                            onSave={handleBranchSave}
                                            userRole={user?.role}
                                            loading={loading || saving}
                                            users={users} // Ahora contiene los managers reales del backend
                                            store={store} // Pasar información de la store para validaciones
                                            currentUser={user} // Pasar usuario actual para validar permisos por sucursal
                                        />
                                        : <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 text-center text-gray-400 text-sm md:text-base">No tienes acceso a sucursales.</div>
                                )}
                                {section === "settings" && <GeneralSettings />}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};