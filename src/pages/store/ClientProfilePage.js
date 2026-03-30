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
    const { getCustomerData, updateCustomerProfile } = useEcommerceService();
    const { getMethod } = useApiMethods();

    // Estados
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [error, setErrors] = useState(null);
    const [loading, setLoading] = useState(true);
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

    // Datos mockeados para pedidos
    const [orders] = useState([
        {
            id: 'ORD-001',
            date: '2024-10-20',
            status: 'completed',
            total: 2500.00,
            items: [
                { name: 'Vino Malbec Premium', quantity: 2, price: 1200.00 },
                { name: 'Queso Brie', quantity: 1, price: 550.00 }
            ]
        },
        {
            id: 'ORD-002',
            date: '2024-10-18',
            status: 'shipped',
            total: 1800.00,
            items: [
                { name: 'Aceitunas Gourmet', quantity: 3, price: 600.00 }
            ]
        },
        {
            id: 'ORD-003',
            date: '2024-10-15',
            status: 'processing',
            total: 3200.00,
            items: [
                { name: 'Caja de Vinos Selectos', quantity: 1, price: 3200.00 }
            ]
        }
    ]);

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
        };
        checkAuth();
    }, [router]);
 
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
            case 'shipped':
                return '#3b82f6';
            case 'processing':
                return '#f59e0b';
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
            case 'shipped':
                return 'Enviado';
            case 'processing':
                return 'Procesando';
            case 'cancelled':
                return 'Cancelado';
            default:
                return status;
        }
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

                            <div className="space-y-4">
                                {orders.filter(order => order.status !== 'completed').map((order) => (
                                    <div key={order.id} className="border rounded-lg p-4"
                                        style={{ 
                                            borderColor: isDarkMode 
                                                ? theme.border?.dark?.light || '#9a334d30' 
                                                : theme.border?.light?.light || '#9a334d20'
                                        }}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold"
                                                    style={{ 
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.primary || '#ffffff' 
                                                            : theme.text?.light?.primary || '#252525'
                                                    }}>
                                                    Pedido {order.id}
                                                </h3>
                                                <p className="text-sm"
                                                    style={{ 
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                            : theme.text?.light?.secondary || '#3e3e3e'
                                                    }}>
                                                    {new Date(order.date).toLocaleDateString()}
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
                                                    ${order.total.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span style={{ 
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                            : theme.text?.light?.secondary || '#3e3e3e'
                                                    }}>
                                                        {item.name} x{item.quantity}
                                                    </span>
                                                    <span style={{ 
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.primary || '#ffffff' 
                                                            : theme.text?.light?.primary || '#252525'
                                                    }}>
                                                        ${item.price.toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
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

                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className="border rounded-lg p-4"
                                        style={{ 
                                            borderColor: isDarkMode 
                                                ? theme.border?.dark?.light || '#9a334d30' 
                                                : theme.border?.light?.light || '#9a334d20'
                                        }}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold"
                                                    style={{ 
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.primary || '#ffffff' 
                                                            : theme.text?.light?.primary || '#252525'
                                                    }}>
                                                    Pedido {order.id}
                                                </h3>
                                                <p className="text-sm"
                                                    style={{ 
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                            : theme.text?.light?.secondary || '#3e3e3e'
                                                    }}>
                                                    {new Date(order.date).toLocaleDateString()}
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
                                                    ${order.total.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span style={{ 
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                            : theme.text?.light?.secondary || '#3e3e3e'
                                                    }}>
                                                        {item.name} x{item.quantity}
                                                    </span>
                                                    <span style={{ 
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.primary || '#ffffff' 
                                                            : theme.text?.light?.primary || '#252525'
                                                    }}>
                                                        ${item.price.toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {order.status === 'completed' && (
                                            <div className="mt-4 pt-4 border-t"
                                                style={{ 
                                                    borderColor: isDarkMode 
                                                        ? theme.border?.dark?.light || '#9a334d30' 
                                                        : theme.border?.light?.light || '#9a334d20'
                                                }}>
                                                <button
                                                    className="text-sm font-medium transition-all hover:opacity-80"
                                                    style={{ 
                                                        color: isDarkMode 
                                                            ? theme.primary?.dark?.main || '#7a2639' 
                                                            : theme.primary?.light?.main || '#9a334d'
                                                    }}
                                                >
                                                    Volver a pedir
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

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
                                        ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(0)}
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
                                        ${(orders.reduce((sum, order) => sum + order.total, 0) / orders.length).toFixed(0)}
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