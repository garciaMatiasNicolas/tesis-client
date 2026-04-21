"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStoreWithTheme } from '@/hooks/useStore';
import { isAuthenticated } from '@/services/auth';
import StoreHeader from '@/components/store/StoreHeader';
import useApiMethods from '@/hooks/useApiMethods';
import useEcommerceService from '@/services/ecommerceService';
import Alert from '@/components/ui/Alert';

const ClientProfilePage = () => {
    const router = useRouter();
    const { 
        isDarkMode, 
        theme, 
        storeConfig, 
        storeActive 
    } = useStoreWithTheme();
    const { getCustomerData, updateCustomerProfile, getMyOrders } = useEcommerceService();
    const { getMethod } = useApiMethods();

    // Estados
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [error, setErrors] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'success',
        title: '',
        message: ''
    });
    const [userData, setUserData] = useState({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        memberSince: ''
    });

    const getCustomer = async () => {
        try {
            const data = await getCustomerData();
            
            setUserData({
                id: data.id || '',
                firstName: data.first_name || '',
                lastName: data.last_name || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                city: data.city || '',
                state: data.state || '',
                postalCode: data.postal_code || '',
                memberSince: data.created_at || '',
                country: data.country || ''
            });
        } catch (error) {
            setErrors('Error al cargar los datos del cliente.');

        }
    };

    // Estado para pedidos reales
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);

    // Cargar pedidos del cliente
    const loadOrders = async () => {
        try {
            setOrdersLoading(true);
            const ordersData = await getMyOrders();
            setOrders(ordersData);
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    // Verificar autenticación
    useEffect(() => {
        const checkAuth = async () => {
            const auth = await isAuthenticated();
            if (!auth) {
                router.push('/store');
                return;
            }
            
            const response = await getMethod("/auth/verify-client/", {}, true);
            if (!response.is_client) { 
                router.push('/store');
                return;
            };
            
            await getCustomer();
            setLoading(false);
            console.log(`theme: ${JSON.stringify(theme)}`); // Debug del tema
        };
        checkAuth();
    }, [router]);

    // Cargar pedidos cuando se selecciona la pestaña de pedidos
    useEffect(() => {
        if (activeTab === 'orders' && !loading) {
            loadOrders();
        }
    }, [activeTab, loading]);
 
    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            
            // Mapear los campos del frontend al formato del backend
            const updateData = {
                first_name: userData.firstName,
                last_name: userData.lastName,
                email: userData.email,
                phone: userData.phone,
                address: userData.address,
                city: userData.city,
                state: userData.state,
                country: userData.country,
                postal_code: userData.postalCode
            };

            // Llamar al endpoint de actualización
            const updatedCustomer = await updateCustomerProfile(updateData);
            
            // Actualizar el estado local con los datos actualizados
            setUserData({
                id: updatedCustomer.id || userData.id,
                firstName: updatedCustomer.first_name || '',
                lastName: updatedCustomer.last_name || '',
                email: updatedCustomer.email || '',
                phone: updatedCustomer.phone || '',
                address: updatedCustomer.address || '',
                city: updatedCustomer.city || '',
                state: updatedCustomer.state || '',
                country: updatedCustomer.country || '',
                postalCode: updatedCustomer.postal_code || '',
                memberSince: updatedCustomer.created_at || userData.memberSince
            });

            setIsEditing(false);
            setErrors(null);
            
            // Mostrar alert de éxito
            setAlertConfig({
                type: 'success',
                title: '¡Perfil actualizado!',
                message: 'Tus datos han sido guardados correctamente.'
            });
            setShowAlert(true);
            
            // Auto-cerrar el alert después de 4 segundos
            setTimeout(() => {
                setShowAlert(false);
            }, 4000);
            
        } catch (error) {
            setErrors('Error al actualizar el perfil. Por favor, intenta de nuevo.');
            
            // Mostrar alert de error
            setAlertConfig({
                type: 'danger',
                title: 'Error al actualizar',
                message: 'No se pudieron guardar los cambios. Por favor, intenta de nuevo.'
            });
            setShowAlert(true);
            
            // Auto-cerrar el alert de error después de 5 segundos
            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return '#10b981';
            case 'pending':
                return '#f59e0b';
            case 'processing':
                return '#3b82f6';
            case 'draft':
                return '#6b7280';
            case 'cancelled':
                return '#ef4444';
            default:
                return isDarkMode ? theme.text?.dark?.secondary : theme.text?.light?.secondary;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'Completado';
            case 'pending':
                return 'Confirmado';
            case 'processing':
                return 'En Preparación';
            case 'draft':
                return 'Presupuesto';
            case 'cancelled':
                return 'Cancelado';
            default:
                return status;
        }
    };

    const getStatusProgress = (status) => {
        switch (status) {
            case 'draft':
                return { percentage: 25, step: '1 de 4' };
            case 'pending':
                return { percentage: 50, step: '2 de 4' };
            case 'processing':
                return { percentage: 75, step: '3 de 4' };
            case 'completed':
                return { percentage: 100, step: '4 de 4' };
            case 'cancelled':
                return { percentage: 0, step: 'Cancelado' };
            default:
                return { percentage: 0, step: '-' };
        }
    };

    const toggleOrderExpanded = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const timelineSteps = [
        { 
            status: 'draft', 
            label: 'Presupuesto',
            description: 'Tu pedido ha sido creado como presupuesto'
        },
        { 
            status: 'pending', 
            label: 'Confirmado',
            description: 'Pedido confirmado, stock reservado'
        },
        { 
            status: 'processing', 
            label: 'En Preparación',
            description: 'Tu pedido está siendo preparado'
        },
        { 
            status: 'completed', 
            label: 'Completado',
            description: 'Pedido entregado con éxito'
        }
    ];

    const getCurrentStepIndex = (status) => {
        if (status === 'cancelled') return -1;
        return timelineSteps.findIndex(step => step.status === status);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ 
                    backgroundColor: isDarkMode 
                        ? theme.background?.dark?.main || '#121212' 
                        : theme.background?.light?.main || '#f8f5f0'
                }}>
                <div className="text-center">
                    <div className="w-8 h-8 border-t-2 border-r-2 rounded-full animate-spin mx-auto mb-4"
                        style={{ borderColor: isDarkMode ? theme.primary?.dark?.main || '#7a2639' : theme.primary?.light?.main || '#9a334d' }}>
                    </div>
                    <p style={{ color: isDarkMode ? theme.text?.dark?.secondary || '#e0e0e0' : theme.text?.light?.secondary || '#3e3e3e' }}>
                        Cargando perfil...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen transition-colors duration-300"
            style={{ 
                backgroundColor: isDarkMode 
                    ? theme.background?.dark?.main || '#121212' 
                    : theme.background?.light?.main || '#f8f5f0'
            }}>
            
            <StoreHeader 
                isDarkMode={isDarkMode}
                storeConfig={storeConfig}
                theme={theme}
                setIsCartOpen={() => {}}
                getTotalCartItems={() => 0}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header del perfil */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                            style={{ background: theme.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)' }}>
                            {userData.firstName[0]}{userData.lastName[0]}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold"
                                style={{ 
                                    color: isDarkMode 
                                        ? theme.text?.dark?.primary || '#ffffff' 
                                        : theme.text?.light?.primary || '#252525'
                                }}>
                                {userData.firstName} {userData.lastName}
                            </h1>
                            <p style={{ 
                                color: isDarkMode 
                                    ? theme.text?.dark?.secondary || '#e0e0e0' 
                                    : theme.text?.light?.secondary || '#3e3e3e'
                            }}>
                                Miembro desde {new Date(userData.memberSince).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navegación por tabs */}
                <div className="mb-8">
                    <div className="flex space-x-1 p-1 rounded-lg"
                        style={{ 
                            backgroundColor: isDarkMode 
                                ? theme.background?.dark?.card || '#1e1e1e' 
                                : theme.background?.light?.card || '#ffffff'
                        }}>
                        {[
                            { id: 'profile', label: 'Mi Perfil', icon: '👤' },
                            { id: 'orders', label: 'Mis Pedidos', icon: '📦' },
                            { id: 'history', label: 'Historial', icon: '📋' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-all ${
                                    activeTab === tab.id
                                        ? 'text-white'
                                        : ''
                                }`}
                                style={{
                                    background: activeTab === tab.id 
                                        ? theme.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)'
                                        : 'transparent',
                                    color: activeTab === tab.id
                                        ? '#ffffff'
                                        : isDarkMode 
                                            ? theme.text?.dark?.secondary || '#e0e0e0'
                                            : theme.text?.light?.secondary || '#3e3e3e'
                                }}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contenido de las tabs */}
                <div className="rounded-lg shadow-md p-6"
                    style={{ 
                        backgroundColor: isDarkMode 
                            ? theme.background?.dark?.card || '#1e1e1e' 
                            : theme.background?.light?.card || '#ffffff',
                        borderColor: isDarkMode 
                            ? theme.border?.dark?.main || '#3a3a3a' 
                            : theme.border?.light?.main || '#e0e0e0',
                        border: '1px solid'
                    }}>

                    {/* Tab: Mi Perfil */}
                    {activeTab === 'profile' && (
                        <div>
                            {/* Mensaje de error */}
                            {error && (
                                <div className="mb-6 p-4 rounded-lg border-l-4"
                                    style={{
                                        backgroundColor: isDarkMode ? '#fee' : '#fef2f2',
                                        borderColor: '#ef4444',
                                        color: '#dc2626'
                                    }}>
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold"
                                    style={{ 
                                        color: isDarkMode 
                                            ? theme.text?.dark?.primary || '#ffffff' 
                                            : theme.text?.light?.primary || '#252525'
                                    }}>
                                    Información Personal
                                </h2>
                                <button
                                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-md font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    style={{ 
                                        background: theme.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)',
                                        color: '#ffffff'
                                    }}
                                >
                                    {loading && (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    {isEditing ? 'Guardar Cambios' : 'Editar Perfil'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nombre */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                : theme.text?.light?.secondary || '#3e3e3e'
                                        }}>
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={userData.firstName}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                        style={{ 
                                            backgroundColor: isDarkMode 
                                                ? theme.background?.dark?.input || '#2a2a2a' 
                                                : theme.background?.light?.input || '#f9f9f9',
                                            borderColor: isDarkMode 
                                                ? theme.border?.dark?.main || '#3a3a3a' 
                                                : theme.border?.light?.main || '#e0e0e0',
                                            color: isDarkMode 
                                                ? theme.text?.dark?.primary || '#ffffff' 
                                                : theme.text?.light?.primary || '#252525',
                                            opacity: !isEditing ? 0.6 : 1
                                        }}
                                    />
                                </div>

                                {/* Apellido */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                : theme.text?.light?.secondary || '#3e3e3e'
                                        }}>
                                        Apellido
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={userData.lastName}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                        style={{ 
                                            backgroundColor: isDarkMode 
                                                ? theme.background?.dark?.input || '#2a2a2a' 
                                                : theme.background?.light?.input || '#f9f9f9',
                                            borderColor: isDarkMode 
                                                ? theme.border?.dark?.main || '#3a3a3a' 
                                                : theme.border?.light?.main || '#e0e0e0',
                                            color: isDarkMode 
                                                ? theme.text?.dark?.primary || '#ffffff' 
                                                : theme.text?.light?.primary || '#252525',
                                            opacity: !isEditing ? 0.6 : 1
                                        }}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                : theme.text?.light?.secondary || '#3e3e3e'
                                        }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={userData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                        style={{ 
                                            backgroundColor: isDarkMode 
                                                ? theme.background?.dark?.input || '#2a2a2a' 
                                                : theme.background?.light?.input || '#f9f9f9',
                                            borderColor: isDarkMode 
                                                ? theme.border?.dark?.main || '#3a3a3a' 
                                                : theme.border?.light?.main || '#e0e0e0',
                                            color: isDarkMode 
                                                ? theme.text?.dark?.primary || '#ffffff' 
                                                : theme.text?.light?.primary || '#252525',
                                            opacity: !isEditing ? 0.6 : 1
                                        }}
                                    />
                                </div>

                                {/* Teléfono */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                : theme.text?.light?.secondary || '#3e3e3e'
                                        }}>
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={userData.phone}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                        style={{ 
                                            backgroundColor: isDarkMode 
                                                ? theme.background?.dark?.input || '#2a2a2a' 
                                                : theme.background?.light?.input || '#f9f9f9',
                                            borderColor: isDarkMode 
                                                ? theme.border?.dark?.main || '#3a3a3a' 
                                                : theme.border?.light?.main || '#e0e0e0',
                                            color: isDarkMode 
                                                ? theme.text?.dark?.primary || '#ffffff' 
                                                : theme.text?.light?.primary || '#252525',
                                            opacity: !isEditing ? 0.6 : 1
                                        }}
                                    />
                                </div>

                                        
                                {/* País */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                : theme.text?.light?.secondary || '#3e3e3e'
                                        }}>
                                        País
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={userData.country}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                        style={{ 
                                            backgroundColor: isDarkMode 
                                                ? theme.background?.dark?.input || '#2a2a2a' 
                                                : theme.background?.light?.input || '#f9f9f9',
                                            borderColor: isDarkMode 
                                                ? theme.border?.dark?.main || '#3a3a3a' 
                                                : theme.border?.light?.main || '#e0e0e0',
                                            color: isDarkMode 
                                                ? theme.text?.dark?.primary || '#ffffff' 
                                                : theme.text?.light?.primary || '#252525',
                                            opacity: !isEditing ? 0.6 : 1
                                        }}
                                    />
                                </div>

                                {/* Estado/Provincia */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                : theme.text?.light?.secondary || '#3e3e3e'
                                        }}>
                                        Provincia
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={userData.state}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                        style={{ 
                                            backgroundColor: isDarkMode 
                                                ? theme.background?.dark?.input || '#2a2a2a' 
                                                : theme.background?.light?.input || '#f9f9f9',
                                            borderColor: isDarkMode 
                                                ? theme.border?.dark?.main || '#3a3a3a' 
                                                : theme.border?.light?.main || '#e0e0e0',
                                            color: isDarkMode 
                                                ? theme.text?.dark?.primary || '#ffffff' 
                                                : theme.text?.light?.primary || '#252525',
                                            opacity: !isEditing ? 0.6 : 1
                                        }}
                                    />
                                </div>
                                
                                {/* Dirección */}
                                <div className="md:col-span-2">
                                    <label className="block mb-2 text-sm font-medium"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                : theme.text?.light?.secondary || '#3e3e3e'
                                        }}>
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={userData.address}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                        style={{ 
                                            backgroundColor: isDarkMode 
                                                ? theme.background?.dark?.input || '#2a2a2a' 
                                                : theme.background?.light?.input || '#f9f9f9',
                                            borderColor: isDarkMode 
                                                ? theme.border?.dark?.main || '#3a3a3a' 
                                                : theme.border?.light?.main || '#e0e0e0',
                                            color: isDarkMode 
                                                ? theme.text?.dark?.primary || '#ffffff' 
                                                : theme.text?.light?.primary || '#252525',
                                            opacity: !isEditing ? 0.6 : 1
                                        }}
                                    />
                                </div>

                                {/* Ciudad */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                : theme.text?.light?.secondary || '#3e3e3e'
                                        }}>
                                        Ciudad
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={userData.city}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                        style={{ 
                                            backgroundColor: isDarkMode 
                                                ? theme.background?.dark?.input || '#2a2a2a' 
                                                : theme.background?.light?.input || '#f9f9f9',
                                            borderColor: isDarkMode 
                                                ? theme.border?.dark?.main || '#3a3a3a' 
                                                : theme.border?.light?.main || '#e0e0e0',
                                            color: isDarkMode 
                                                ? theme.text?.dark?.primary || '#ffffff' 
                                                : theme.text?.light?.primary || '#252525',
                                            opacity: !isEditing ? 0.6 : 1
                                        }}
                                    />
                                </div>

                                {/* Código Postal */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                : theme.text?.light?.secondary || '#3e3e3e'
                                        }}>
                                        Código Postal
                                    </label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={userData.postalCode}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                        style={{ 
                                            backgroundColor: isDarkMode 
                                                ? theme.background?.dark?.input || '#2a2a2a' 
                                                : theme.background?.light?.input || '#f9f9f9',
                                            borderColor: isDarkMode 
                                                ? theme.border?.dark?.main || '#3a3a3a' 
                                                : theme.border?.light?.main || '#e0e0e0',
                                            color: isDarkMode 
                                                ? theme.text?.dark?.primary || '#ffffff' 
                                                : theme.text?.light?.primary || '#252525',
                                            opacity: !isEditing ? 0.6 : 1
                                        }}
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="mt-6 flex gap-4">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 rounded-md font-medium transition-all border hover:opacity-80"
                                        style={{ 
                                            borderColor: isDarkMode 
                                                ? theme.border?.dark?.main || '#3a3a3a' 
                                                : theme.border?.light?.main || '#e0e0e0',
                                            backgroundColor: 'transparent',
                                            color: isDarkMode 
                                                ? theme.text?.dark?.primary || '#ffffff' 
                                                : theme.text?.light?.primary || '#252525'
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Mis Pedidos */}
                    {activeTab === 'orders' && (
                        <div>
                            <h2 className="text-xl font-bold mb-6"
                                style={{ 
                                    color: isDarkMode 
                                        ? theme.text?.dark?.primary || '#ffffff' 
                                        : theme.text?.light?.primary || '#252525'
                                }}>
                                Pedidos Recientes
                            </h2>

                            {ordersLoading ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-t-2 border-r-2 rounded-full animate-spin mx-auto mb-4"
                                        style={{ borderColor: isDarkMode ? theme.primary?.dark?.main || '#7a2639' : theme.primary?.light?.main || '#9a334d' }}>
                                    </div>
                                    <p style={{ color: isDarkMode ? theme.text?.dark?.secondary || '#e0e0e0' : theme.text?.light?.secondary || '#3e3e3e' }}>
                                        Cargando pedidos...
                                    </p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-8 border rounded-lg"
                                    style={{ 
                                        borderColor: isDarkMode 
                                            ? theme.border?.dark?.light || '#9a334d30' 
                                            : theme.border?.light?.light || '#9a334d20'
                                    }}>
                                    <p style={{ 
                                        color: isDarkMode 
                                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                                            : theme.text?.light?.secondary || '#3e3e3e'
                                    }}>
                                        No tienes pedidos aún
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.filter(order => order.status !== 'completed').map((order) => {
                                        const currentStepIndex = getCurrentStepIndex(order.status);
                                        const isExpanded = expandedOrder === order.id;
                                        
                                        return (
                                            <div key={order.id} className="border rounded-lg overflow-hidden transition-all duration-300"
                                                style={{ 
                                                    borderColor: isDarkMode 
                                                        ? theme.border?.dark?.light || '#9a334d30' 
                                                        : theme.border?.light?.light || '#9a334d20'
                                                }}>
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="font-semibold"
                                                                style={{ 
                                                                    color: isDarkMode 
                                                                        ? theme.text?.dark?.primary || '#ffffff' 
                                                                        : theme.text?.light?.primary || '#252525'
                                                                }}>
                                                                Pedido #{order.id}
                                                            </h3>
                                                            <p className="text-sm"
                                                                style={{ 
                                                                    color: isDarkMode 
                                                                        ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                                        : theme.text?.light?.secondary || '#3e3e3e'
                                                                }}>
                                                                {new Date(order.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                                                style={{ backgroundColor: getStatusColor(order.status) }}>
                                                                {getStatusText(order.status)}
                                                            </div>
                                                            <p className="text-lg font-bold mt-2"
                                                                style={{ 
                                                                    color: isDarkMode 
                                                                        ? theme.text?.dark?.primary || '#ffffff' 
                                                                        : theme.text?.light?.primary || '#252525'
                                                                }}>
                                                                ${parseFloat(order.total_price).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-2 mb-3">
                                                        {order.sales_items && order.sales_items.slice(0, 2).map((item, index) => (
                                                            <div key={index} className="flex justify-between text-sm">
                                                                <span style={{ 
                                                                    color: isDarkMode 
                                                                        ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                                        : theme.text?.light?.secondary || '#3e3e3e'
                                                                }}>
                                                                    {item.product_name} x{item.quantity}
                                                                </span>
                                                                <span style={{ 
                                                                    color: isDarkMode 
                                                                        ? theme.text?.dark?.primary || '#ffffff' 
                                                                        : theme.text?.light?.primary || '#252525'
                                                                }}>
                                                                    ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {order.sales_items && order.sales_items.length > 2 && (
                                                            <p className="text-xs"
                                                                style={{ 
                                                                    color: isDarkMode 
                                                                        ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                                        : theme.text?.light?.secondary || '#3e3e3e'
                                                                }}>
                                                                +{order.sales_items.length - 2} producto(s) más
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Botón de expandir */}
                                                    <button
                                                        onClick={() => toggleOrderExpanded(order.id)}
                                                        className="w-full py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2"
                                                        style={{ 
                                                            backgroundColor: isDarkMode 
                                                                ? theme.background?.dark?.elevated || '#2a2a2a' 
                                                                : theme.background?.light?.elevated || '#f5f5f5',
                                                            color: isDarkMode 
                                                                ? theme.text?.dark?.primary || '#ffffff' 
                                                                : theme.text?.light?.primary || '#252525'
                                                        }}
                                                    >
                                                        {isExpanded ? '▲ Ocultar detalles' : '▼ Ver seguimiento del pedido'}
                                                    </button>
                                                </div>

                                                {/* Contenido expandible */}
                                                {isExpanded && (
                                                    <div className="px-4 pb-4 pt-2 border-t"
                                                        style={{ 
                                                            borderColor: isDarkMode 
                                                                ? theme.border?.dark?.light || '#9a334d30' 
                                                                : theme.border?.light?.light || '#9a334d20',
                                                            backgroundColor: isDarkMode 
                                                                ? 'rgba(154, 51, 77, 0.05)' 
                                                                : 'rgba(154, 51, 77, 0.03)'
                                                        }}
                                                    >
                                                        <h4 className="text-sm font-semibold mb-4"
                                                            style={{ 
                                                                color: isDarkMode 
                                                                    ? theme.text?.dark?.primary || '#ffffff' 
                                                                    : theme.text?.light?.primary || '#252525'
                                                            }}>
                                                            📍 Seguimiento del Pedido
                                                        </h4>

                                                        {order.status !== 'cancelled' ? (
                                                            <div className="space-y-3">
                                                                {timelineSteps.map((step, index) => {
                                                                    const isCompleted = index < currentStepIndex;
                                                                    const isCurrent = index === currentStepIndex;
                                                                    const isPending = index > currentStepIndex;

                                                                    return (
                                                                        <div key={step.status} className="flex gap-3">
                                                                            {/* Icono y línea */}
                                                                            <div className="flex flex-col items-center">
                                                                                <div 
                                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                                                                                        isCurrent ? 'ring-4 ring-opacity-30' : ''
                                                                                    }`}
                                                                                    style={{ 
                                                                                        backgroundColor: isCompleted || isCurrent 
                                                                                            ? getStatusColor(step.status)
                                                                                            : isDarkMode ? '#3a3a3a' : '#e0e0e0',
                                                                                        ringColor: isCurrent ? getStatusColor(step.status) : 'transparent'
                                                                                    }}
                                                                                >
                                                                                    {isCompleted ? '✓' : index + 1}
                                                                                </div>
                                                                                {index < timelineSteps.length - 1 && (
                                                                                    <div 
                                                                                        className="w-0.5 h-12 transition-all duration-300"
                                                                                        style={{ 
                                                                                            backgroundColor: isCompleted 
                                                                                                ? getStatusColor(step.status)
                                                                                                : isDarkMode ? '#3a3a3a' : '#e0e0e0'
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </div>

                                                                            {/* Contenido */}
                                                                            <div className="flex-1 pb-8">
                                                                                <h5 className={`font-semibold ${isCurrent ? 'text-base' : 'text-sm'}`}
                                                                                    style={{ 
                                                                                        color: isCompleted || isCurrent
                                                                                            ? (isDarkMode ? theme.text?.dark?.primary : theme.text?.light?.primary)
                                                                                            : (isDarkMode ? theme.text?.dark?.secondary : theme.text?.light?.secondary)
                                                                                    }}>
                                                                                    {step.label}
                                                                                    {isCurrent && (
                                                                                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                                                                                            style={{ 
                                                                                                backgroundColor: getStatusColor(step.status),
                                                                                                color: 'white'
                                                                                            }}>
                                                                                            Actual
                                                                                        </span>
                                                                                    )}
                                                                                </h5>
                                                                                <p className="text-xs mt-1"
                                                                                    style={{ 
                                                                                        color: isDarkMode 
                                                                                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                                                            : theme.text?.light?.secondary || '#3e3e3e'
                                                                                    }}>
                                                                                    {step.description}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-4">
                                                                <div className="text-3xl mb-2">❌</div>
                                                                <p className="font-semibold"
                                                                    style={{ 
                                                                        color: isDarkMode 
                                                                            ? theme.text?.dark?.primary || '#ffffff' 
                                                                            : theme.text?.light?.primary || '#252525'
                                                                    }}>
                                                                    Pedido Cancelado
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Todos los items */}
                                                        {order.sales_items && order.sales_items.length > 0 && (
                                                            <div className="mt-4 pt-4 border-t"
                                                                style={{ 
                                                                    borderColor: isDarkMode 
                                                                        ? theme.border?.dark?.light || '#9a334d30' 
                                                                        : theme.border?.light?.light || '#9a334d20'
                                                                }}>
                                                                <h5 className="text-sm font-semibold mb-2"
                                                                    style={{ 
                                                                        color: isDarkMode 
                                                                            ? theme.text?.dark?.primary || '#ffffff' 
                                                                            : theme.text?.light?.primary || '#252525'
                                                                    }}>
                                                                    📦 Productos del pedido
                                                                </h5>
                                                                <div className="space-y-2">
                                                                    {order.sales_items.map((item, index) => (
                                                                        <div key={index} className="flex justify-between text-sm">
                                                                            <span style={{ 
                                                                                color: isDarkMode 
                                                                                    ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                                                    : theme.text?.light?.secondary || '#3e3e3e'
                                                                            }}>
                                                                                {item.product_name} x{item.quantity}
                                                                            </span>
                                                                            <span style={{ 
                                                                                color: isDarkMode 
                                                                                    ? theme.text?.dark?.primary || '#ffffff' 
                                                                                    : theme.text?.light?.primary || '#252525'
                                                                            }}>
                                                                                ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Historial */}
                    {activeTab === 'history' && (
                        <div>
                            <h2 className="text-xl font-bold mb-6"
                                style={{ 
                                    color: isDarkMode 
                                        ? theme.text?.dark?.primary || '#ffffff' 
                                        : theme.text?.light?.primary || '#252525'
                                }}>
                                Historial de Compras
                            </h2>

                            {ordersLoading ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-t-2 border-r-2 rounded-full animate-spin mx-auto mb-4"
                                        style={{ borderColor: isDarkMode ? theme.primary?.dark?.main || '#7a2639' : theme.primary?.light?.main || '#9a334d' }}>
                                    </div>
                                    <p style={{ color: isDarkMode ? theme.text?.dark?.secondary || '#e0e0e0' : theme.text?.light?.secondary || '#3e3e3e' }}>
                                        Cargando pedidos...
                                    </p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-8 border rounded-lg"
                                    style={{ 
                                        borderColor: isDarkMode 
                                            ? theme.border?.dark?.light || '#9a334d30' 
                                            : theme.border?.light?.light || '#9a334d20'
                                    }}>
                                    <p style={{ 
                                        color: isDarkMode 
                                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                                            : theme.text?.light?.secondary || '#3e3e3e'
                                    }}>
                                        No tienes pedidos aún
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => {
                                        const currentStepIndex = getCurrentStepIndex(order.status);
                                        const isExpanded = expandedOrder === order.id;
                                        
                                        return (
                                            <div key={order.id} className="border rounded-lg overflow-hidden transition-all duration-300"
                                                style={{ 
                                                    borderColor: isDarkMode 
                                                        ? theme.border?.dark?.light || '#9a334d30' 
                                                        : theme.border?.light?.light || '#9a334d20'
                                                }}>
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="font-semibold"
                                                                style={{ 
                                                                    color: isDarkMode 
                                                                        ? theme.text?.dark?.primary || '#ffffff' 
                                                                        : theme.text?.light?.primary || '#252525'
                                                                }}>
                                                                Pedido #{order.id}
                                                            </h3>
                                                            <p className="text-sm"
                                                                style={{ 
                                                                    color: isDarkMode 
                                                                        ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                                        : theme.text?.light?.secondary || '#3e3e3e'
                                                                }}>
                                                                {new Date(order.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                                                style={{ backgroundColor: getStatusColor(order.status) }}>
                                                                {getStatusText(order.status)}
                                                            </div>
                                                            <p className="text-lg font-bold mt-2"
                                                                style={{ 
                                                                    color: isDarkMode 
                                                                        ? theme.text?.dark?.primary || '#ffffff' 
                                                                        : theme.text?.light?.primary || '#252525'
                                                                }}>
                                                                ${parseFloat(order.total_price).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-2 mb-3">
                                                        {order.sales_items && order.sales_items.slice(0, 2).map((item, index) => (
                                                            <div key={index} className="flex justify-between text-sm">
                                                                <span style={{ 
                                                                    color: isDarkMode 
                                                                        ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                                        : theme.text?.light?.secondary || '#3e3e3e'
                                                                }}>
                                                                    {item.product_name} x{item.quantity}
                                                                </span>
                                                                <span style={{ 
                                                                    color: isDarkMode 
                                                                        ? theme.text?.dark?.primary || '#ffffff' 
                                                                        : theme.text?.light?.primary || '#252525'
                                                                }}>
                                                                    ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {order.sales_items && order.sales_items.length > 2 && (
                                                            <p className="text-xs"
                                                                style={{ 
                                                                    color: isDarkMode 
                                                                        ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                                        : theme.text?.light?.secondary || '#3e3e3e'
                                                                }}>
                                                                +{order.sales_items.length - 2} producto(s) más
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Botón de expandir */}
                                                    <button
                                                        onClick={() => toggleOrderExpanded(order.id)}
                                                        className="w-full py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2"
                                                        style={{ 
                                                            backgroundColor: isDarkMode 
                                                                ? theme.background?.dark?.elevated || '#2a2a2a' 
                                                                : theme.background?.light?.elevated || '#f5f5f5',
                                                            color: isDarkMode 
                                                                ? theme.text?.dark?.primary || '#ffffff' 
                                                                : theme.text?.light?.primary || '#252525'
                                                        }}
                                                    >
                                                        {isExpanded ? '▲ Ocultar detalles' : '▼ Ver seguimiento del pedido'}
                                                    </button>
                                                </div>

                                                {/* Contenido expandible */}
                                                {isExpanded && (
                                                    <div className="px-4 pb-4 pt-2 border-t"
                                                        style={{ 
                                                            borderColor: isDarkMode 
                                                                ? theme.border?.dark?.light || '#9a334d30' 
                                                                : theme.border?.light?.light || '#9a334d20',
                                                            backgroundColor: isDarkMode 
                                                                ? 'rgba(154, 51, 77, 0.05)' 
                                                                : 'rgba(154, 51, 77, 0.03)'
                                                        }}
                                                    >
                                                        <h4 className="text-sm font-semibold mb-4"
                                                            style={{ 
                                                                color: isDarkMode 
                                                                    ? theme.text?.dark?.primary || '#ffffff' 
                                                                    : theme.text?.light?.primary || '#252525'
                                                            }}>
                                                            📍 Seguimiento del Pedido
                                                        </h4>

                                                        {order.status !== 'cancelled' ? (
                                                            <div className="space-y-3">
                                                                {timelineSteps.map((step, index) => {
                                                                    const isCompleted = index < currentStepIndex;
                                                                    const isCurrent = index === currentStepIndex;
                                                                    const isPending = index > currentStepIndex;

                                                                    return (
                                                                        <div key={step.status} className="flex gap-3">
                                                                            {/* Icono y línea */}
                                                                            <div className="flex flex-col items-center">
                                                                                <div 
                                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                                                                                        isCurrent ? 'ring-4 ring-opacity-30' : ''
                                                                                    }`}
                                                                                    style={{ 
                                                                                        backgroundColor: isCompleted || isCurrent 
                                                                                            ? getStatusColor(step.status)
                                                                                            : isDarkMode ? '#3a3a3a' : '#e0e0e0',
                                                                                        ringColor: isCurrent ? getStatusColor(step.status) : 'transparent'
                                                                                    }}
                                                                                >
                                                                                    {isCompleted ? '✓' : index + 1}
                                                                                </div>
                                                                                {index < timelineSteps.length - 1 && (
                                                                                    <div 
                                                                                        className="w-0.5 h-12 transition-all duration-300"
                                                                                        style={{ 
                                                                                            backgroundColor: isCompleted 
                                                                                                ? getStatusColor(step.status)
                                                                                                : isDarkMode ? '#3a3a3a' : '#e0e0e0'
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </div>

                                                                            {/* Contenido */}
                                                                            <div className="flex-1 pb-8">
                                                                                <h5 className={`font-semibold ${isCurrent ? 'text-base' : 'text-sm'}`}
                                                                                    style={{ 
                                                                                        color: isCompleted || isCurrent
                                                                                            ? (isDarkMode ? theme.text?.dark?.primary : theme.text?.light?.primary)
                                                                                            : (isDarkMode ? theme.text?.dark?.secondary : theme.text?.light?.secondary)
                                                                                    }}>
                                                                                    {step.label}
                                                                                    {isCurrent && (
                                                                                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                                                                                            style={{ 
                                                                                                backgroundColor: getStatusColor(step.status),
                                                                                                color: 'white'
                                                                                            }}>
                                                                                            Actual
                                                                                        </span>
                                                                                    )}
                                                                                </h5>
                                                                                <p className="text-xs mt-1"
                                                                                    style={{ 
                                                                                        color: isDarkMode 
                                                                                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                                                            : theme.text?.light?.secondary || '#3e3e3e'
                                                                                    }}>
                                                                                    {step.description}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-4">
                                                                <div className="text-3xl mb-2">❌</div>
                                                                <p className="font-semibold"
                                                                    style={{ 
                                                                        color: isDarkMode 
                                                                            ? theme.text?.dark?.primary || '#ffffff' 
                                                                            : theme.text?.light?.primary || '#252525'
                                                                    }}>
                                                                    Pedido Cancelado
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Todos los items */}
                                                        {order.sales_items && order.sales_items.length > 0 && (
                                                            <div className="mt-4 pt-4 border-t"
                                                                style={{ 
                                                                    borderColor: isDarkMode 
                                                                        ? theme.border?.dark?.light || '#9a334d30' 
                                                                        : theme.border?.light?.light || '#9a334d20'
                                                                }}>
                                                                <h5 className="text-sm font-semibold mb-2"
                                                                    style={{ 
                                                                        color: isDarkMode 
                                                                            ? theme.text?.dark?.primary || '#ffffff' 
                                                                            : theme.text?.light?.primary || '#252525'
                                                                    }}>
                                                                    📦 Productos del pedido
                                                                </h5>
                                                                <div className="space-y-2">
                                                                    {order.sales_items.map((item, index) => (
                                                                        <div key={index} className="flex justify-between text-sm">
                                                                            <span style={{ 
                                                                                color: isDarkMode 
                                                                                    ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                                                    : theme.text?.light?.secondary || '#3e3e3e'
                                                                            }}>
                                                                                {item.product_name} x{item.quantity}
                                                                            </span>
                                                                            <span style={{ 
                                                                                color: isDarkMode 
                                                                                    ? theme.text?.dark?.primary || '#ffffff' 
                                                                                    : theme.text?.light?.primary || '#252525'
                                                                            }}>
                                                                                ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Botón volver a pedir para completados */}
                                                                {order.status === 'completed' && (
                                                                    <button
                                                                        className="mt-4 text-sm font-medium transition-all hover:opacity-80"
                                                                        style={{ 
                                                                            color: isDarkMode 
                                                                                ? theme.primary?.dark?.main || '#7a2639' 
                                                                                : theme.primary?.light?.main || '#9a334d'
                                                                        }}
                                                                    >
                                                                        🔄 Volver a pedir
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Estadísticas */}
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 rounded-lg"
                                    style={{ 
                                        backgroundColor: isDarkMode 
                                            ? theme.background?.dark?.elevated || '#252525' 
                                            : theme.background?.light?.elevated || '#f5f0e8'
                                    }}>
                                    <div className="text-2xl font-bold"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.primary?.dark?.main || '#7a2639' 
                                                : theme.primary?.light?.main || '#9a334d'
                                        }}>
                                        {orders.length}
                                    </div>
                                    <div className="text-sm"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                : theme.text?.light?.secondary || '#3e3e3e'
                                        }}>
                                        Total de pedidos
                                    </div>
                                </div>
                                
                                <div className="text-center p-4 rounded-lg"
                                    style={{ 
                                        backgroundColor: isDarkMode 
                                            ? theme.background?.dark?.elevated || '#252525' 
                                            : theme.background?.light?.elevated || '#f5f0e8'
                                    }}>
                                    <div className="text-2xl font-bold"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.primary?.dark?.main || '#7a2639' 
                                                : theme.primary?.light?.main || '#9a334d'
                                        }}>
                                        ${orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0).toFixed(0)}
                                    </div>
                                    <div className="text-sm"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                : theme.text?.light?.secondary || '#3e3e3e'
                                        }}>
                                        Total gastado
                                    </div>
                                </div>
                                
                                <div className="text-center p-4 rounded-lg"
                                    style={{ 
                                        backgroundColor: isDarkMode 
                                            ? theme.background?.dark?.elevated || '#252525' 
                                            : theme.background?.light?.elevated || '#f5f0e8'
                                    }}>
                                    <div className="text-2xl font-bold"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.primary?.dark?.main || '#7a2639' 
                                                : theme.primary?.light?.main || '#9a334d'
                                        }}>
                                        ${orders.length > 0 ? (orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0) / orders.length).toFixed(0) : '0'}
                                    </div>
                                    <div className="text-sm"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                : theme.text?.light?.secondary || '#3e3e3e'
                                        }}>
                                        Promedio por pedido
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Alert Component */}
            {showAlert && (
                <Alert
                    type={alertConfig.type}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    onClose={() => setShowAlert(false)}
                />
            )}
        </div>
    );
};

export default ClientProfilePage;