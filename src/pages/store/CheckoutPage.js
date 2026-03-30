"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { useCart } from '@/hooks/useCart';
import { useStore } from '@/hooks/useStore';
import StoreHeader from '@/components/store/StoreHeader';
import ShoppingCart from '@/components/store/ShoppingCart';
import UserCreateModal from '@/components/store/UserCreateModal';
import UserLoginModal from '@/components/store/UserLoginModal';
import useEcommerceService from '@/services/ecommerceService';
import useApiMethods from '@/hooks/useApiMethods';
import { isAuthenticated, removeAuthToken } from '@/services/auth';

const CheckoutPage = () => {
    const router = useRouter();
    const { isDarkMode, theme } = useTheme();
    const { cart, addToCart, updateQuantity, removeFromCart, clearCart, getTotalPrice, getTotalCartItems } = useCart();
    const { 
        createUserForCustomerAndLogIn, 
        completeCheckout, 
        checkUserByEmail, 
        loginUser,
        createCustomer,
        getCustomerData
    } = useEcommerceService();
    const { storeConfig } = useStore();
    //const { getMethod } = useApiMethods();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        notes: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showUserCreateModal, setShowUserCreateModal] = useState(false);
    const [showUserLoginModal, setShowUserLoginModal] = useState(false);
    const [user, setUser] = useState(null);
    const [existingUser, setExistingUser] = useState(null);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
    const [isLoadingUserData, setIsLoadingUserData] = useState(false);

    // Si el carrito está vacío, redirigir a la tienda
    useEffect(() => {
        if (cart.length === 0 && !orderPlaced) {
            router.push('/store');
        }
    }, [cart, orderPlaced, router]);
    
    // Detectar cuando el usuario intenta salir de la página
    useEffect(() => {
        // Guardar timestamp del carrito actual
        if (cart.length > 0 && !orderPlaced) {
            localStorage.setItem('cartTimestamp', Date.now().toString());
        }
        
        // Comprobar y eliminar carritos antiguos (más de 2 horas)
        const checkCartExpiry = () => {
            const timestamp = localStorage.getItem('cartTimestamp');
            if (timestamp) {
                const cartTime = parseInt(timestamp);
                const currentTime = Date.now();
                const twoHoursMs = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
                
                if (currentTime - cartTime > twoHoursMs) {
                    clearCart();
                    localStorage.removeItem('cartTimestamp');
                }
            }
        };
        
        checkCartExpiry();
        
        // Mostrar modal cuando el usuario intenta cerrar o recargar la página
        const handleBeforeUnload = (e) => {
            if (cart.length > 0 && !orderPlaced && !isSubmitting) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [cart, orderPlaced, isSubmitting, clearCart]);
    
    // Manejar navegación dentro de la app (botón atrás del navegador)
    useEffect(() => {
        const handleUserExit = () => {
            if (cart.length > 0 && !orderPlaced && !isSubmitting) {
                setShowExitModal(true);
            }
        };
        
        // Configurar intervalo para revisar si el carrito expiró
        const checkExpiryInterval = setInterval(() => {
            const timestamp = localStorage.getItem('cartTimestamp');
            if (timestamp) {
                const cartTime = parseInt(timestamp);
                const currentTime = Date.now();
                const twoHoursMs = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
                
                if (currentTime - cartTime > twoHoursMs) {
                    clearCart();
                    localStorage.removeItem('cartTimestamp');
                    alert('Tu carrito ha sido eliminado por inactividad (2 horas).');
                    router.push('/store');
                }
            }
        }, 60000); // Verificar cada minuto
        
        // Usar el evento popstate para detectar cuando el usuario usa el botón de retroceso
        const handlePopState = (event) => {
            if (cart.length > 0 && !orderPlaced && !isSubmitting) {
                event.preventDefault();
                handleUserExit();
                // Prevenir navegación agregando un nuevo estado que mantenga al usuario en la página actual
                window.history.pushState(null, "", window.location.pathname);
            }
        };
        
        // Asegurar que estamos en la parte superior del historial
        window.history.pushState(null, "", window.location.pathname);
        
        // Añadir listener para el evento popstate
        window.addEventListener('popstate', handlePopState);
        
        return () => {
            clearInterval(checkExpiryInterval);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [cart, router, orderPlaced, isSubmitting, clearCart]);

    // Verificar autenticación y cargar datos del cliente
    useEffect(() => {
        const loadUserData = async () => {
            try {
                setIsLoadingUserData(true);
                const auth = await isAuthenticated();
                
                if (auth) {
                    // Usuario autenticado, obtener datos del cliente
                    const customerData = await getCustomerData();
                    
                    // Autocompletar formulario con datos del cliente
                    setFormData({
                        firstName: customerData.first_name || '',
                        lastName: customerData.last_name || '',
                        email: customerData.email || '',
                        phone: customerData.phone || '',
                        address: customerData.address || '',
                        city: customerData.city || '',
                        state: customerData.state || '',
                        postalCode: customerData.zip_code || '',
                        notes: ''
                    });
                    
                    setIsUserAuthenticated(true);
                    setUser(customerData);
                } else {
                    setIsUserAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                //console.error('Error al cargar datos del usuario:', error);
                setIsUserAuthenticated(false);
                setUser(null);
            } finally {
                setIsLoadingUserData(false);
            }
        };

        loadUserData();
    }, []);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Si el usuario está autenticado, solo permitir editar las notas
        if (isUserAuthenticated && name !== 'notes') {
            return; // No permitir cambios en otros campos
        }
        
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Limpiar error al editar
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };
    
    const validateForm = () => {
        const errors = {};
        
        if (!formData.firstName.trim()) errors.firstName = 'El nombre es requerido';
        if (!formData.lastName.trim()) errors.lastName = 'El apellido es requerido';
        if (!formData.email.trim()) {
            errors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'El email no es válido';
        }
        if (!formData.phone.trim()) errors.phone = 'El teléfono es requerido';
        
        if (!formData.address.trim()) errors.address = 'La dirección es requerida';
        if (!formData.city.trim()) errors.city = 'La ciudad es requerida';
        if (!formData.postalCode.trim()) errors.postalCode = 'El código postal es requerido';
        if (!formData.state.trim()) errors.state = 'La provincia/estado es requerido';
    
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    // Función para generar el mensaje de WhatsApp
    const generateWhatsAppMessage = () => {
        let message = `¡Hola! Me gustaría hacer un pedido desde ${storeConfig?.name || 'su tienda'}:\n\n`;
        
        // Agregar productos
        message += "*Productos:*\n";
        cart.forEach(item => {
            message += `- ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}\n`;
        });
        
        // Agregar total
        message += `\n*Total: $${getTotalPrice().toFixed(2)}*\n\n`;
        
        // Agregar datos del cliente
        message += "*Datos de contacto:*\n";
        message += `Nombre: ${formData.firstName} ${formData.lastName}\n`;
        message += `Email: ${formData.email}\n`;
        message += `Teléfono: ${formData.phone}\n`;
        
        if (formData.notes) {
            message += `\n*Notas:*\n${formData.notes}\n`;
        }
        
        return encodeURIComponent(message);
    };
    
    const handleExit = () => {
        setShowExitModal(false);
        router.push('/store');
    };
    
    const handleContinueShopping = () => {
        setShowExitModal(false);
    };

    const handleLoginFromHeader = () => {
        // Limpiar estados del formulario y mostrar modal de login
        setExistingUser({ email: '' });
        setShowUserLoginModal(true);
    };

    const onUserCreated = async (userData) => {
        try {
            setIsSubmitting(true); // Activar loading después de crear usuario

            // Si hay un usuario existente (logueado pero no cliente), solo crear el perfil de cliente
            if (user) {
                const customerData = {
                    user: user.id,
                    customer_type: 'person',
                    first_name: userData.first_name || formData.firstName,
                    last_name: userData.last_name || formData.lastName,
                    email: userData.email || formData.email,
                    phone: formData.phone || '',
                    address: formData.address || '',
                    city: formData.city || '',
                    state: formData.state || '',
                    country: 'Argentina',
                    postal_code: formData.postalCode || ''
                };

                await createCustomer(customerData);
            } else {
                // Si no hay usuario, crear usuario y perfil de cliente
                const userResult = await createUserForCustomerAndLogIn(userData);
                setUser(userResult);
            }

            setShowUserCreateModal(false);
            
            // Después de crear el usuario/cliente, procesar el checkout automáticamente
            await processCompleteCheckout();
            
        } catch (error) {
            setIsSubmitting(false); // Desactivar loading en caso de error
            throw error; // Permitir que el modal maneje el error
        }
    };

    const onUserLogin = async (loginData) => {
        try {
            const result = await loginUser(loginData.email, loginData.password);
            
            // Actualizar el estado del usuario
            setUser({
                id: result.user_id,
                name: result.user_name,
                email: loginData.email
            });
            
            // Cerrar el modal
            setShowUserLoginModal(false);
            
            // Solo procesar checkout si el login viene del formulario de checkout
            // (existingUser tendrá email del formulario)
            if (existingUser && existingUser.email && existingUser.email !== '') {
                setIsSubmitting(true);
                await processCompleteCheckout();
            }
            // Si existingUser.email está vacío, significa que vino del header, no hacer checkout
            
        } catch (error) {
            console.error('Error al hacer login:', error);
            throw error; // Permitir que el modal maneje el error
        }
    };

    const processCompleteCheckout = async () => {
        try {
            
            if (storeConfig?.view_only) {
                // Para tiendas view_only, generar mensaje de WhatsApp
                const whatsappNumber = storeConfig.contact_phone || '';
                const message = generateWhatsAppMessage();
                
                setOrderPlaced(true);
                clearCart();
                
                // Redirigir a WhatsApp
                window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
                
                setTimeout(() => {
                    router.push('/store');
                }, 1500);
                
            } else {
                // Para tiendas con checkout completo, usar el backend
                const result = await completeCheckout(formData, cart);
                
                setOrderPlaced(true);
                clearCart();
                
                setTimeout(() => {
                    router.push('/store');
                }, 3000);
            }
            
        } catch (error) {
            console.error('Error al procesar checkout:', error);
            alert('Error al procesar el pedido. Por favor, inténtalo de nuevo.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            if (isUserAuthenticated) {
                // Usuario autenticado -> procesar checkout directamente
                setIsSubmitting(true);
                await processCompleteCheckout();
                return;
            }

            // Usuario no logueado, verificar si el email existe
            const emailCheckResponse = await checkUserByEmail(formData.email);
            
            if (!emailCheckResponse.exists) {
                // Email no existe -> mostrar modal para crear usuario
                setExistingUser(null);
                setShowUserCreateModal(true);
            } else {
                // Email existe -> mostrar modal para login
                setExistingUser({ email: formData.email });
                setShowUserLoginModal(true);
            }
            
        } catch (error) {
            console.error('Error en el proceso de checkout:', error);
            alert('Error al procesar el pedido. Por favor, inténtalo de nuevo.');
        }
    };
    
    // Si el pedido fue colocado con éxito
    if (orderPlaced) {
        return (
            <div className="min-h-screen flex flex-col transition-colors duration-300"
                style={{ 
                    backgroundColor: isDarkMode 
                        ? theme.background?.dark?.main || '#121212' 
                        : theme.background?.light?.main || '#f8f5f0',
                    color: isDarkMode 
                        ? theme.text?.dark?.primary || '#ffffff' 
                        : theme.text?.light?.primary || '#252525'
                }}>
                <StoreHeader 
                    isDarkMode={isDarkMode}
                    storeConfig={storeConfig}
                    theme={theme}
                    getTotalCartItems={() => 0}
                    onLoginClick={handleLoginFromHeader}
                />
                
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center p-8 rounded-lg shadow-lg"
                        style={{ 
                            backgroundColor: isDarkMode 
                                ? theme.background?.dark?.card || '#1e1e1e' 
                                : theme.background?.light?.card || '#ffffff',
                            borderColor: isDarkMode 
                                ? theme.border?.dark?.main || '#3a3a3a' 
                                : theme.border?.light?.main || '#e0e0e0',
                            border: '1px solid'
                        }}>
                        <div className="mx-auto w-16 h-16 rounded-full mb-4 flex items-center justify-center"
                            style={{ background: theme.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)' }}>
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2"
                            style={{ 
                                color: isDarkMode 
                                    ? theme.text?.dark?.primary || '#ffffff' 
                                    : theme.text?.light?.primary || '#252525'
                            }}>
                            ¡Pedido realizado con éxito!
                        </h2>
                        <p className="mb-6"
                            style={{ 
                                color: isDarkMode 
                                    ? theme.text?.dark?.secondary || '#e0e0e0' 
                                    : theme.text?.light?.secondary || '#3e3e3e'
                            }}>
                            {storeConfig?.view_only 
                                ? 'Tu pedido ha sido enviado a WhatsApp. Te contactaremos pronto.' 
                                : 'Hemos recibido tu pedido. Te contactaremos para confirmar los detalles.'}
                        </p>
                        <button 
                            onClick={() => router.push('/store')}
                            className="px-6 py-2 rounded-md text-white font-medium transition-all hover:shadow-lg"
                            style={{ background: theme.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)' }}>
                            Volver a la tienda
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    if (cart.length === 0) {
       return(
        <div>Carrito vacio</div>
       )
    }
    
    // Mostrar loading mientras se cargan los datos del usuario
    if (isLoadingUserData) {
        return (
            <div className="min-h-screen flex flex-col transition-colors duration-300"
                style={{ 
                    backgroundColor: isDarkMode 
                        ? theme.background?.dark?.main || '#121212' 
                        : theme.background?.light?.main || '#f8f5f0',
                }}>
                <StoreHeader 
                    isDarkMode={isDarkMode}
                    storeConfig={storeConfig}
                    theme={theme}
                    setIsCartOpen={setIsCartOpen}
                    getTotalCartItems={getTotalCartItems}
                    onLoginClick={handleLoginFromHeader}
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-t-2 border-r-2 rounded-full animate-spin mx-auto mb-4"
                            style={{ borderColor: isDarkMode ? theme.primary?.dark?.main || '#7a2639' : theme.primary?.light?.main || '#9a334d' }}>
                        </div>
                        <p style={{ color: isDarkMode ? theme.text?.dark?.secondary || '#e0e0e0' : theme.text?.light?.secondary || '#3e3e3e' }}>
                            Cargando datos del usuario...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300"
            style={{ 
                backgroundColor: isDarkMode 
                    ? theme.background?.dark?.main || '#121212' 
                    : theme.background?.light?.main || '#f8f5f0',
                color: isDarkMode 
                    ? theme.text?.dark?.primary || '#ffffff' 
                    : theme.text?.light?.primary || '#252525'
            }}>
            <StoreHeader 
                isDarkMode={isDarkMode}
                storeConfig={storeConfig}
                theme={theme}
                setIsCartOpen={setIsCartOpen}
                getTotalCartItems={getTotalCartItems}
                onLoginClick={handleLoginFromHeader}
            />
            
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    {/* Formulario de datos del cliente - 3 columnas en desktop */}
                    <div className="md:col-span-3">
                        <div className="p-6 rounded-lg shadow-md"
                            style={{ 
                                backgroundColor: isDarkMode 
                                    ? theme.background?.dark?.card || '#1e1e1e' 
                                    : theme.background?.light?.card || '#ffffff',
                                borderColor: isDarkMode 
                                    ? theme.border?.dark?.main || '#3a3a3a' 
                                    : theme.border?.light?.main || '#e0e0e0',
                                border: '1px solid'
                            }}>
                            <h2 className="text-2xl font-bold mb-6"
                                style={{ 
                                    color: isDarkMode 
                                        ? theme.text?.dark?.primary || '#ffffff' 
                                        : theme.text?.light?.primary || '#252525'
                                }}>
                                Información de Cliente
                            </h2>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Nombre */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium"
                                            style={{ 
                                                color: isDarkMode 
                                                    ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                    : theme.text?.light?.secondary || '#3e3e3e'
                                            }}>
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            disabled={isUserAuthenticated}
                                            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                            style={{ 
                                                backgroundColor: isDarkMode 
                                                    ? theme.background?.dark?.input || '#2a2a2a' 
                                                    : theme.background?.light?.input || '#f9f9f9',
                                                borderColor: formErrors.firstName 
                                                    ? '#e53e3e' 
                                                    : isDarkMode 
                                                        ? theme.border?.dark?.main || '#3a3a3a' 
                                                        : theme.border?.light?.main || '#e0e0e0',
                                                color: isDarkMode 
                                                    ? theme.text?.dark?.primary || '#ffffff' 
                                                    : theme.text?.light?.primary || '#252525',
                                                outline: 'none',
                                                opacity: isUserAuthenticated ? 0.6 : 1,
                                            }}
                                        />
                                        {formErrors.firstName && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
                                        )}
                                    </div>
                                    
                                    {/* Apellido */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium"
                                            style={{ 
                                                color: isDarkMode 
                                                    ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                    : theme.text?.light?.secondary || '#3e3e3e'
                                            }}>
                                            Apellido *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            disabled={isUserAuthenticated}
                                            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                            style={{ 
                                                backgroundColor: isDarkMode 
                                                    ? theme.background?.dark?.input || '#2a2a2a' 
                                                    : theme.background?.light?.input || '#f9f9f9',
                                                borderColor: formErrors.lastName 
                                                    ? '#e53e3e' 
                                                    : isDarkMode 
                                                        ? theme.border?.dark?.main || '#3a3a3a' 
                                                        : theme.border?.light?.main || '#e0e0e0',
                                                color: isDarkMode 
                                                    ? theme.text?.dark?.primary || '#ffffff' 
                                                    : theme.text?.light?.primary || '#252525',
                                                outline: 'none',
                                                opacity: isUserAuthenticated ? 0.6 : 1,
                                            }}
                                        />
                                        {formErrors.lastName && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
                                        )}
                                    </div>
                                    
                                    {/* Email */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium"
                                            style={{ 
                                                color: isDarkMode 
                                                    ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                    : theme.text?.light?.secondary || '#3e3e3e'
                                            }}>
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={isUserAuthenticated}
                                            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                            style={{ 
                                                backgroundColor: isDarkMode 
                                                    ? theme.background?.dark?.input || '#2a2a2a' 
                                                    : theme.background?.light?.input || '#f9f9f9',
                                                borderColor: formErrors.email 
                                                    ? '#e53e3e' 
                                                    : isDarkMode 
                                                        ? theme.border?.dark?.main || '#3a3a3a' 
                                                        : theme.border?.light?.main || '#e0e0e0',
                                                color: isDarkMode 
                                                    ? theme.text?.dark?.primary || '#ffffff' 
                                                    : theme.text?.light?.primary || '#252525',
                                                outline: 'none',
                                                opacity: isUserAuthenticated ? 0.6 : 1,
                                            }}
                                        />
                                        {formErrors.email && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                                        )}
                                    </div>
                                    
                                    {/* Teléfono */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium"
                                            style={{ 
                                                color: isDarkMode 
                                                    ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                    : theme.text?.light?.secondary || '#3e3e3e'
                                            }}>
                                            Teléfono *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            disabled={isUserAuthenticated}
                                            placeholder="Ej. 3456789012"
                                            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                            style={{ 
                                                backgroundColor: isDarkMode 
                                                    ? theme.background?.dark?.input || '#2a2a2a' 
                                                    : theme.background?.light?.input || '#f9f9f9',
                                                borderColor: formErrors.phone 
                                                    ? '#e53e3e' 
                                                    : isDarkMode 
                                                        ? theme.border?.dark?.main || '#3a3a3a' 
                                                        : theme.border?.light?.main || '#e0e0e0',
                                                color: isDarkMode 
                                                    ? theme.text?.dark?.primary || '#ffffff' 
                                                    : theme.text?.light?.primary || '#252525',
                                                outline: 'none',
                                                opacity: isUserAuthenticated ? 0.6 : 1,
                                            }}
                                        />
                                        {formErrors.phone && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                                        )}
                                    </div>
                                    
                                    {/* Campos de dirección solo si no es view_only */}
                                    {!storeConfig?.view_only && (
                                        <>
                                            {/* Dirección */}
                                            <div className="sm:col-span-2">
                                                <label className="block mb-2 text-sm font-medium"
                                                    style={{ 
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                            : theme.text?.light?.secondary || '#3e3e3e'
                                                    }}>
                                                    Dirección *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    disabled={isUserAuthenticated}
                                                    className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                                    style={{ 
                                                        backgroundColor: isDarkMode 
                                                            ? theme.background?.dark?.input || '#2a2a2a' 
                                                            : theme.background?.light?.input || '#f9f9f9',
                                                        borderColor: formErrors.address 
                                                            ? '#e53e3e' 
                                                            : isDarkMode 
                                                                ? theme.border?.dark?.main || '#3a3a3a' 
                                                                : theme.border?.light?.main || '#e0e0e0',
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.primary || '#ffffff' 
                                                            : theme.text?.light?.primary || '#252525',
                                                        outline: 'none',
                                                        opacity: isUserAuthenticated ? 0.6 : 1,
                                                    }}
                                                />
                                                {formErrors.address && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
                                                )}
                                            </div>

                                            {/* Provincia */}
                                            <div>
                                                <label className="block mb-2 text-sm font-medium"
                                                    style={{ 
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                            : theme.text?.light?.secondary || '#3e3e3e'
                                                    }}>
                                                    Provincia *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                    disabled={isUserAuthenticated}
                                                    className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                                    style={{ 
                                                        backgroundColor: isDarkMode 
                                                            ? theme.background?.dark?.input || '#2a2a2a' 
                                                            : theme.background?.light?.input || '#f9f9f9',
                                                        borderColor: formErrors.state 
                                                            ? '#e53e3e' 
                                                            : isDarkMode 
                                                                ? theme.border?.dark?.main || '#3a3a3a' 
                                                                : theme.border?.light?.main || '#e0e0e0',
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.primary || '#ffffff' 
                                                            : theme.text?.light?.primary || '#252525',
                                                        outline: 'none',
                                                        opacity: isUserAuthenticated ? 0.6 : 1,
                                                    }}
                                                />
                                                {formErrors.state && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.state}</p>
                                                )}
                                            </div>
                                            
                                            {/* Ciudad */}
                                            <div>
                                                <label className="block mb-2 text-sm font-medium"
                                                    style={{ 
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                            : theme.text?.light?.secondary || '#3e3e3e'
                                                    }}>
                                                    Ciudad *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    disabled={isUserAuthenticated}
                                                    className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                                    style={{ 
                                                        backgroundColor: isDarkMode 
                                                            ? theme.background?.dark?.input || '#2a2a2a' 
                                                            : theme.background?.light?.input || '#f9f9f9',
                                                        borderColor: formErrors.city 
                                                            ? '#e53e3e' 
                                                            : isDarkMode 
                                                                ? theme.border?.dark?.main || '#3a3a3a' 
                                                                : theme.border?.light?.main || '#e0e0e0',
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.primary || '#ffffff' 
                                                            : theme.text?.light?.primary || '#252525',
                                                        outline: 'none',
                                                        opacity: isUserAuthenticated ? 0.6 : 1,
                                                    }}
                                                />
                                                {formErrors.city && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>
                                                )}
                                            </div>
                                            
                                            {/* Código postal */}
                                            <div>
                                                <label className="block mb-2 text-sm font-medium"
                                                    style={{ 
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                            : theme.text?.light?.secondary || '#3e3e3e'
                                                    }}>
                                                    Código Postal *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="postalCode"
                                                    value={formData.postalCode}
                                                    onChange={handleInputChange}
                                                    disabled={isUserAuthenticated}
                                                    className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 transition-all"
                                                    style={{ 
                                                        backgroundColor: isDarkMode 
                                                            ? theme.background?.dark?.input || '#2a2a2a' 
                                                            : theme.background?.light?.input || '#f9f9f9',
                                                        borderColor: formErrors.postalCode 
                                                            ? '#e53e3e' 
                                                            : isDarkMode 
                                                                ? theme.border?.dark?.main || '#3a3a3a' 
                                                                : theme.border?.light?.main || '#e0e0e0',
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.primary || '#ffffff' 
                                                            : theme.text?.light?.primary || '#252525',
                                                        outline: 'none',
                                                        opacity: isUserAuthenticated ? 0.6 : 1,
                                                    }}
                                                />
                                                {formErrors.postalCode && (
                                                    <p className="mt-1 text-sm text-red-500">{formErrors.postalCode}</p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* Notas adicionales - span completo */}
                                    <div className="sm:col-span-2">
                                        <label className="block mb-2 text-sm font-medium"
                                            style={{ 
                                                color: isDarkMode 
                                                    ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                    : theme.text?.light?.secondary || '#3e3e3e'
                                            }}>
                                            Notas adicionales
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows={4}
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
                                                outline: 'none',
                                            }}
                                            placeholder="Instrucciones especiales para tu pedido..."
                                        />
                                    </div>
                                </div>
                                
                                {/* Solo para view_only: Nota WhatsApp */}
                                {storeConfig?.view_only && (
                                    <div className="mt-6 p-4 rounded-md"
                                        style={{ 
                                            backgroundColor: isDarkMode 
                                                ? `${theme.background?.dark?.elevated || '#252525'}40` 
                                                : `${theme.background?.light?.elevated || '#f5f0e8'}80`,
                                            borderLeft: `4px solid ${isDarkMode 
                                                ? theme.accent?.dark?.main || '#7a2639' 
                                                : theme.accent?.light?.main || '#9a334d'}`,
                                        }}>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="currentColor" style={{
                                                color: isDarkMode 
                                                    ? theme.accent?.dark?.main || '#7a2639' 
                                                    : theme.accent?.light?.main || '#9a334d'
                                            }} viewBox="0 0 24 24">
                                                <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.798.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375c-.99-1.576-1.516-3.391-1.516-5.26 0-5.445 4.455-9.885 9.942-9.885 2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99-.004 5.444-4.46 9.885-9.935 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411"/>
                                            </svg>
                                            <span className="font-medium"
                                                style={{ 
                                                    color: isDarkMode 
                                                        ? theme.accent?.dark?.main || '#7a2639' 
                                                        : theme.accent?.light?.main || '#9a334d'
                                                }}>
                                                Pedido por WhatsApp
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm"
                                            style={{ 
                                                color: isDarkMode 
                                                    ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                    : theme.text?.light?.secondary || '#3e3e3e'
                                            }}>
                                            Al finalizar tu pedido, serás redirigido a WhatsApp para comunicarte directamente con el vendedor.
                                        </p>
                                    </div>
                                )}

                                {/* Mensaje para usuario autenticado */}
                                {isUserAuthenticated && (
                                    <div className="mt-6 p-4 rounded-md"
                                        style={{ 
                                            backgroundColor: isDarkMode 
                                                ? `${theme.background?.dark?.elevated || '#252525'}40` 
                                                : `${theme.background?.light?.elevated || '#f5f0e8'}80`,
                                            borderLeft: `4px solid ${isDarkMode 
                                                ? theme.primary?.dark?.main || '#7a2639' 
                                                : theme.primary?.light?.main || '#9a334d'}`,
                                        }}>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="currentColor" style={{
                                                color: isDarkMode 
                                                    ? theme.primary?.dark?.main || '#7a2639' 
                                                    : theme.primary?.light?.main || '#9a334d'
                                            }} viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                            </svg>
                                            <span className="font-medium"
                                                style={{ 
                                                    color: isDarkMode 
                                                        ? theme.primary?.dark?.main || '#7a2639' 
                                                        : theme.primary?.light?.main || '#9a334d'
                                                }}>
                                                Usuario autenticado
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm"
                                            style={{ 
                                                color: isDarkMode 
                                                    ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                    : theme.text?.light?.secondary || '#3e3e3e'
                                            }}>
                                            Los datos de contacto se han autocompletado con tu información de perfil. Para editarlos, ve a la sección de perfil.
                                        </p>
                                    </div>
                                )}
                                
                                {/* Botón de enviar - Alineado a la derecha */}
                                <div className="mt-8 flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 rounded-md text-white font-medium transition-all hover:shadow-lg"
                                        style={{ 
                                            background: theme.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)',
                                            opacity: isSubmitting ? 0.7 : 1,
                                            cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center">
                                                <div className="w-5 h-5 border-t-2 border-white border-r-2 rounded-full animate-spin mr-2"></div>
                                                Procesando...
                                            </div>
                                        ) : storeConfig?.view_only ? 'Solicitar por WhatsApp' : 'Finalizar Pedido'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    {/* Resumen del pedido - 2 columnas en desktop */}
                    <div className="md:col-span-2">
                        <div className="sticky top-24 p-6 rounded-lg shadow-md"
                            style={{ 
                                backgroundColor: isDarkMode 
                                    ? theme.background?.dark?.card || '#1e1e1e' 
                                    : theme.background?.light?.card || '#ffffff',
                                borderColor: isDarkMode 
                                    ? theme.border?.dark?.main || '#3a3a3a' 
                                    : theme.border?.light?.main || '#e0e0e0',
                                border: '1px solid'
                            }}>
                            <h2 className="text-2xl font-bold mb-6"
                                style={{ 
                                    color: isDarkMode 
                                        ? theme.text?.dark?.primary || '#ffffff' 
                                        : theme.text?.light?.primary || '#252525'
                                }}>
                                Resumen del Pedido
                            </h2>
                            
                            {/* Lista de productos en el carrito */}
                            <div className="space-y-4 mb-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center pb-4 border-b"
                                        style={{ 
                                            borderBottomColor: isDarkMode 
                                                ? theme.border?.dark?.light || '#9a334d30' 
                                                : theme.border?.light?.light || '#9a334d20'
                                        }}>
                                        <div className="flex gap-3">
                                            {/* Imagen miniatura si existe */}
                                            {item.image && (
                                                <div className="w-12 h-12 rounded-md overflow-hidden border"
                                                    style={{ 
                                                        borderColor: isDarkMode 
                                                            ? theme.border?.dark?.light || '#9a334d30' 
                                                            : theme.border?.light?.light || '#9a334d20'
                                                    }}>
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name}
                                                        className="w-full h-full object-cover" 
                                                        onError={(e) => {
                                                            e.target.src = "https://placehold.co/100x100?text=No+Image";
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            
                                            <div>
                                                <h3 className="font-medium"
                                                    style={{ 
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.primary || '#ffffff' 
                                                            : theme.text?.light?.primary || '#252525'
                                                    }}>
                                                    {item.name}
                                                </h3>
                                                <div className="text-sm"
                                                    style={{ 
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                            : theme.text?.light?.secondary || '#3e3e3e'
                                                    }}>
                                                    {item.quantity} x ${item.price.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="font-medium"
                                            style={{ 
                                                color: isDarkMode 
                                                    ? theme.text?.dark?.primary || '#ffffff' 
                                                    : theme.text?.light?.primary || '#252525'
                                            }}>
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Total del pedido */}
                            <div className="pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                : theme.text?.light?.secondary || '#3e3e3e'
                                        }}>
                                        Subtotal
                                    </span>
                                    <span className="font-medium"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.primary || '#ffffff' 
                                                : theme.text?.light?.primary || '#252525'
                                        }}>
                                        ${getTotalPrice().toFixed(2)}
                                    </span>
                                </div>
                                
                                {/* Descuentos o costos adicionales - ejemplo */}
                                {/*
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-green-600">
                                        Descuento
                                    </span>
                                    <span className="font-medium text-green-600">
                                        -$10.00
                                    </span>
                                </div>
                                */}
                                
                                {/* Total */}
                                <div className="flex justify-between items-center pt-4 border-t mt-4"
                                    style={{ 
                                        borderTopColor: isDarkMode 
                                            ? theme.border?.dark?.main || '#3a3a3a' 
                                            : theme.border?.light?.main || '#e0e0e0'
                                    }}>
                                    <span className="text-lg font-bold"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.primary || '#ffffff' 
                                                : theme.text?.light?.primary || '#252525'
                                        }}>
                                        Total
                                    </span>
                                    <span className="text-lg font-bold"
                                        style={{ 
                                            background: theme.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)', 
                                            WebkitBackgroundClip: 'text', 
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                        ${getTotalPrice().toFixed(2)}
                                    </span>
                                </div>
                                
                                {/* Nota sobre seguridad */}
                                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-center"
                                    style={{ 
                                        color: isDarkMode 
                                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                                            : theme.text?.light?.secondary || '#3e3e3e'
                                    }}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>
                                        {storeConfig?.view_only 
                                            ? 'Tus datos están protegidos' 
                                            : 'Pago seguro garantizado'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Carrito de compras - Solo mostrar si no es view_only */}
            {!storeConfig?.view_only && (
                <ShoppingCart
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    cartItems={cart}
                    isCheckoutPage={true}
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeFromCart}
                    onClearCart={clearCart}
                />
            )}
            
            {/* Modal de salida */}
            {showExitModal && (
                <div className="fixed inset-0 z-50 overflow-hidden transition-all duration-300 ease-in-out">
                    {/* Overlay */}
                    <div 
                        className="fixed inset-0 backdrop-blur-md bg-black bg-opacity-60 transition-all duration-300"
                        onClick={handleContinueShopping}
                    ></div>
                    
                    {/* Modal */}
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-lg backdrop-blur-md shadow-xl transform transition-all duration-300 animate-fade-in "
                        style={{
                            backgroundColor: isDarkMode 
                                ? theme?.background?.dark?.card || '#1e1e1e' 
                                : theme?.background?.light?.card || '#ffffff',
                            borderColor: isDarkMode 
                                ? theme?.border?.dark?.main || '#3a3a3a' 
                                : theme?.border?.light?.main || '#e0e0e0',
                            border: '1px solid'
                        }}
                    >
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 rounded-full mb-4 flex items-center justify-center"
                                style={{ 
                                    backgroundColor: isDarkMode 
                                        ? theme?.warning?.dark || '#ffc107' 
                                        : theme?.warning?.light || '#ffc107',
                                    opacity: 0.2
                                }}
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    style={{ 
                                        color: isDarkMode 
                                            ? theme?.warning?.dark || '#131212ff' 
                                            : theme?.warning?.light || '#000000ff'
                                    }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold mb-2"
                                style={{ 
                                    color: isDarkMode 
                                        ? theme?.text?.dark?.primary || '#ffffff' 
                                        : theme?.text?.light?.primary || '#252525'
                                }}
                            >
                                ¿Deseas abandonar tu compra?
                            </h3>
                            <p className="mb-6"
                                style={{ 
                                    color: isDarkMode 
                                        ? theme?.text?.dark?.secondary || '#e0e0e0' 
                                        : theme?.text?.light?.secondary || '#3e3e3e'
                                }}
                            >
                                Tu carrito permanecerá guardado durante 2 horas. Después de ese tiempo, los productos serán eliminados automáticamente.
                            </p>
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleContinueShopping}
                                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-all border hover:opacity-80"
                                    style={{ 
                                        borderColor: isDarkMode 
                                            ? theme?.border?.dark?.main || '#3a3a3a' 
                                            : theme?.border?.light?.main || '#e0e0e0',
                                        backgroundColor: isDarkMode 
                                            ? theme?.background?.dark?.card || '#1e1e1e' 
                                            : theme?.background?.light?.card || '#ffffff',
                                        color: isDarkMode 
                                            ? theme?.text?.dark?.primary || '#ffffff' 
                                            : theme?.text?.light?.primary || '#252525'
                                    }}
                                >
                                    Continuar Comprando
                                </button>
                                <button
                                    onClick={handleExit}
                                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-all hover:opacity-80"
                                    style={{ 
                                        background: theme?.primary?.gradient ,
                                        color: '#ffffff'
                                    }}
                                >
                                    Salir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de creación de usuario */}
            {showUserCreateModal && (
                <UserCreateModal
                    isOpen={showUserCreateModal}
                    onClose={() => setShowUserCreateModal(false)}
                    onCreateUser={onUserCreated}
                    customerData={formData}
                    isDarkMode={isDarkMode}
                    theme={theme}
                    existingUser={existingUser}
                />
            )}

            {/* Modal de login de usuario */}
            {showUserLoginModal && (
                <UserLoginModal
                    isOpen={showUserLoginModal}
                    onClose={() => setShowUserLoginModal(false)}
                    onLogin={onUserLogin}
                    customerEmail={formData.email}
                    isDarkMode={isDarkMode}
                    theme={theme}
                />
            )}


        </div>
    );
};

export default CheckoutPage;