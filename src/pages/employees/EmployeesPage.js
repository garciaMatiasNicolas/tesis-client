"use client";
import React, { useState, useEffect } from 'react';
import SideBar from '@/components/ui/SideBar';
import Alert from '@/components/ui/Alert';
import EmployeeTable from '@/components/employees/EmployeeTable';
import EmployeeModal from '@/components/employees/EmployeeModal';
import DeleteConfirmModal from '@/components/employees/DeleteConfirmModal';
import EmployeeFilters from '@/components/employees/EmployeeFilters';
import useApiMethods from '@/hooks/useApiMethods';
import { FaHome, FaUsers, FaList, FaPlus, FaStore } from 'react-icons/fa';

const EmployeesPage = () => {
    const { getMethod, postMethod, putMethod, deleteMethod } = useApiMethods();
    
    // Estado principal
    const [employees, setEmployees] = useState([]);
    const [stores, setStores] = useState([]);
    const [branches, setBranches] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Estado del usuario actual
    const [currentUser, setCurrentUser] = useState(null);
    
    // Estados de los modales
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    
    // Estados de filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStore, setSelectedStore] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    
    // Estado de alertas
    const [alert, setAlert] = useState({
        show: false,
        type: 'success',
        title: '',
        message: ''
    });

    // Sidebar items
    const sidebarItems = [
        { label: "Inicio", icon: <FaHome />, onClick: () => window.location.href = "/dashboard" },
        { label: "Perfil", icon: <FaStore />, onClick: () => window.location.href = "/profile" },
        {
            label: "Empleados",
            icon: <FaUsers />,
            dropdown: [
                { label: "Lista", icon: <FaList />, onClick: () => {} },
                { label: "Agregar", icon: <FaPlus />, onClick: () => handleAddEmployee() },
            ],
        },
    ];

    // Funciones para cargar datos
    const fetchCurrentUser = async () => {
        try {
            const response = await getMethod("/users/me/");
            setCurrentUser(response);
        } catch (error) {
            //console.error("Error obteniendo usuario actual:", error);
            showAlert('danger', 'Error', 'No se pudo obtener la información del usuario');
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await getMethod("/employees/");
            setEmployees(response.results || response || []);
        } catch (error) {
            //console.error("Error obteniendo empleados:", error);
            showAlert('danger', 'Error', 'No se pudieron cargar los empleados');
        }
    };

    const fetchStores = async () => {
        try {
            const response = await getMethod("/stores/");
            setStores(response.results || response || []);
        } catch (error) {
            //console.error("Error obteniendo tiendas:", error);
            showAlert('danger', 'Error', 'No se pudieron cargar las tiendas');
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await getMethod("/branches/");
            setBranches(response.results || response || []);
        } catch (error) {
            //console.error("Error obteniendo sucursales:", error);
            showAlert('danger', 'Error', 'No se pudieron cargar las sucursales');
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await getMethod("/users/");
            // Filtrar solo usuarios que pueden ser empleados
            let employeeUsers = (response.results || response || []).filter(user => 
                ['employee', 'manager'].includes(user.role)
            );
            
            // Si el usuario actual es manager, solo mostrar usuarios que no estén asignados a otras sucursales
            // o que estén en su misma sucursal
            if (currentUser?.role === 'manager') {
                // Esta lógica se puede implementar más adelante si es necesario
                // Por ahora mostramos todos los usuarios disponibles
            }
            
            setUsers(employeeUsers);
        } catch (error) {
            //console.error("Error obteniendo usuarios:", error);
            showAlert('danger', 'Error', 'No se pudieron cargar los usuarios');
        }
    };

    // Función para mostrar alertas
    const showAlert = (type, title, message) => {
        setAlert({
            show: true,
            type,
            title,
            message
        });
    };

    // Función para cargar todos los datos
    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchCurrentUser(),
                fetchEmployees(),
                fetchStores(),
                fetchBranches(),
                fetchUsers()
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Efecto para cargar datos al montar
    useEffect(() => {
        loadAllData();
    }, []);

    // Handlers para modales
    const handleAddEmployee = () => {
        setSelectedEmployee(null);
        setShowEmployeeModal(true);
    };

    const handleEditEmployee = (employee) => {
        setSelectedEmployee(employee);
        setShowEmployeeModal(true);
    };

    const handleDeleteEmployee = (employee) => {
        setSelectedEmployee(employee);
        setShowDeleteModal(true);
    };

    // Handler para crear/actualizar empleado
    const handleSubmitEmployee = async (employeeData) => {
        setSaving(true);
        try {
            if (selectedEmployee) {
                // Actualizar empleado existente
                const response = await putMethod(`/employees/${selectedEmployee.id}/`, employeeData);
                setEmployees(prev => 
                    prev.map(emp => emp.id === selectedEmployee.id ? response : emp)
                );
                showAlert('success', '¡Éxito!', 'Empleado actualizado correctamente');
            } else {
                // Crear nuevo empleado
                const response = await postMethod("/employees/", employeeData);
                setEmployees(prev => [...prev, response.employee || response]);
                showAlert('success', '¡Éxito!', 'Empleado creado correctamente');
            }
            setShowEmployeeModal(false);
            setSelectedEmployee(null);
        } catch (error) {
            console.error("Error guardando empleado:", error);
            
            // Si hay errores de validación específicos, los devolvemos al formulario
            if (error.response?.data && (
                typeof error.response.data === 'object' && 
                !error.response.data.error && 
                !error.response.data.message
            )) {
                // Este es un error de validación con campos específicos
                // Lo devolvemos al formulario para que lo maneje
                throw error;
            } else {
                // Error general, mostramos alerta y cerramos el modal
                const errorMessage = error.response?.data?.error || 
                                    error.response?.data?.message || 
                                    'Error al guardar el empleado';
                showAlert('danger', 'Error', errorMessage);
                setShowEmployeeModal(false);
                setSelectedEmployee(null);
            }
        } finally {
            setSaving(false);
        }
    };

    // Handler para confirmar eliminación
    const handleConfirmDelete = async (employee) => {
        setSaving(true);
        try {
            await deleteMethod(`/employees/${employee.id}/`);
            setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
            showAlert('success', '¡Éxito!', 'Empleado eliminado correctamente');
            setShowDeleteModal(false);
            setSelectedEmployee(null);
        } catch (error) {

            const errorMessage = error.response?.data?.error || 
                                error.response?.data?.message || 
                                'Error al eliminar el empleado';
            showAlert('danger', 'Error', errorMessage);
            setShowDeleteModal(false);
            setSelectedEmployee(null);
        } finally {
            setSaving(false);
        }
    };

    // Filtrar empleados basado en los filtros aplicados
    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = !searchTerm || 
            employee.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.dni?.toString().includes(searchTerm);

        const matchesStore = !selectedStore || 
            employee.store?.toString() === selectedStore;

        const matchesBranch = !selectedBranch || 
            employee.branch?.toString() === selectedBranch;

        return matchesSearch && matchesStore && matchesBranch;
    });

    // Verificar permisos
    const canAdd = currentUser && ['superadmin', 'manager'].includes(currentUser.role);

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            {alert.show && (
                <Alert
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert({ show: false, type: '', title: '', message: '' })}
                />
            )}
            
            <SideBar
                items={sidebarItems}
                onProfile={() => window.location.href = "/profile"}
                onSupport={() => showAlert("info", "Soporte", "Funcionalidad en desarrollo")}
                onLogout={() => showAlert("info", "Logout", "Funcionalidad en desarrollo")}
            />

            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Filtros y búsqueda */}
                    <EmployeeFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedStore={selectedStore}
                        onStoreChange={(value) => {
                            setSelectedStore(value);
                            setSelectedBranch(''); // Limpiar sucursal cuando cambia tienda
                        }}
                        selectedBranch={selectedBranch}
                        onBranchChange={setSelectedBranch}
                        stores={stores}
                        branches={branches}
                        onAddEmployee={handleAddEmployee}
                        canAdd={canAdd}
                        totalEmployees={filteredEmployees.length}
                    />

                    {/* Tabla de empleados */}
                    <EmployeeTable
                        employees={filteredEmployees}
                        onEdit={handleEditEmployee}
                        onDelete={handleDeleteEmployee}
                        loading={loading}
                        userRole={currentUser?.role}
                    />

                    {/* Modal para agregar/editar empleado */}
                    <EmployeeModal
                        isOpen={showEmployeeModal}
                        onClose={() => {
                            setShowEmployeeModal(false);
                            setSelectedEmployee(null);
                        }}
                        employee={selectedEmployee}
                        stores={stores}
                        branches={branches}
                        users={users}
                        onSubmit={handleSubmitEmployee}
                        loading={saving}
                        currentUser={currentUser}
                    />

                    {/* Modal de confirmación de eliminación */}
                    <DeleteConfirmModal
                        isOpen={showDeleteModal}
                        onClose={() => {
                            setShowDeleteModal(false);
                            setSelectedEmployee(null);
                        }}
                        employee={selectedEmployee}
                        onConfirm={handleConfirmDelete}
                        loading={saving}
                    />
                </div>
            </main>
        </div>
    );
};

export default EmployeesPage;