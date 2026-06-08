"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { useCart } from '@/hooks/useCart';
import { useStore } from '@/hooks/useStore';
import StoreHeader from '@/components/modules/store/StoreHeader';
import ShoppingCart from '@/components/modules/store/ShoppingCart';
import UserCreateModal from '@/components/modules/store/UserCreateModal';
import UserLoginModal from '@/components/modules/store/UserLoginModal';
import PaymentGateway from '@/components/modules/store/PaymentGateway';
import useEcommerceService from '@/services/ecommerceService';
import { isAuthenticated } from '@/services/auth';
import { FaArrowLeft, FaLock } from 'react-icons/fa';
import { formatPrice } from '@/utils/formatData';
import Alert from '@/components/ui/Alert';


// ── Mapeo de status_detail de MP a mensajes legibles para el usuario ──────────
const MP_REJECTION_MESSAGES = {
    // Datos de tarjeta incorrectos
    cc_rejected_bad_filled_card_number: 'El número de tarjeta es incorrecto. Verificalo e intentá nuevamente.',
    cc_rejected_bad_filled_security_code: 'El código de seguridad (CVV) es incorrecto.',
    cc_rejected_bad_filled_date: 'La fecha de vencimiento es incorrecta.',
    cc_rejected_form_error: 'Revisá que el número de tarjeta, el CVV y la fecha de vencimiento estén correctos.',
    // Rechazos del banco
    cc_rejected_call_for_authorize: 'Tu banco requiere que autorices esta compra. Llamá al número del dorso de tu tarjeta y volvé a intentarlo.',
    cc_rejected_insufficient_amount: 'Tu tarjeta no tiene fondos suficientes para este pago.',
    cc_rejected_other_reason: 'Tu banco rechazó el pago. Verificá que tu tarjeta esté habilitada para compras online, o intentá con otra.',
    cc_rejected_blacklist: 'Tu tarjeta no está habilitada para este tipo de operación. Contactá a tu banco.',
    cc_rejected_max_attempts: 'Superaste el límite de intentos. Esperá unos minutos o usá otra tarjeta.',
    cc_rejected_card_disabled: 'Tu tarjeta está deshabilitada. Contactá a tu banco.',
    rejected_by_bank: 'Tu banco rechazó el pago. Contactá a tu banco para más información.',
    rejected_by_regulations: 'El pago fue rechazado por regulaciones. Intentá con otro medio de pago.',
};

const MP_PENDING_MESSAGES = {
    pending_contingency: 'Tu banco está procesando el pago. Esto puede demorar unos minutos — te notificaremos el resultado.',
    pending_review_manual: 'Tu pago está en revisión manual. Te notificaremos el resultado en las próximas horas.',
};

const getMpMessage = (statusDetail, type = 'rejected') => {
    const map = type === 'rejected' ? MP_REJECTION_MESSAGES : MP_PENDING_MESSAGES;
    return map[statusDetail] || (
        type === 'rejected'
            ? 'El pago fue rechazado. Intentá con otra tarjeta o contactá a tu banco.'
            : 'Tu pago está siendo procesado. Te notificaremos el resultado.'
    );
};

// ─────────────────────────────────────────────────────────────────────────────

const CheckoutPage = () => {
    const router = useRouter();
    const { isDarkMode, theme } = useTheme();
    const { cart, isCartLoaded, updateQuantity, removeFromCart, clearCart, getTotalPrice, getTotalCartItems } = useCart();
    const {
        createUserForCustomerAndLogIn,
        completeCheckout,
        cancelEcommerceOrder,
        getMpPaymentStatus,
        checkUserByEmail,
        loginUser,
        createCustomer,
        getCustomerData,
        getStorePaymentMethods,
        processMercadoPagoCard,
        createMercadoPagoPreference,
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
    const [showUserCreateModal, setShowUserCreateModal] = useState(false);
    const [showUserLoginModal, setShowUserLoginModal] = useState(false);
    const [user, setUser] = useState(null);
    const [existingUser, setExistingUser] = useState(null);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
    const [isLoadingUserData, setIsLoadingUserData] = useState(false);
    // Step del gateway de pago
    const [paymentStep, setPaymentStep] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState(null);
    const [paymentAlert, setPaymentAlert] = useState(null); // { type, title, message }
    const [orderPaymentType, setOrderPaymentType] = useState(null); // 'card'|'card_pending'|'bank_transfer'|'cash'|'whatsapp'
    const [mpBrickResetKey, setMpBrickResetKey] = useState(0); // incrementar para reinicializar el Brick tras fallo
    // Estado del polling para pagos pendientes (CONT / pending_contingency)
    const [pendingPaymentData, setPendingPaymentData] = useState(null); // { paymentId, orderId, detail }
    const [pollCount, setPollCount] = useState(0);

    const isViewOnly = storeConfig?.view_only ?? true;

    // Si el carrito está vacío, redirigir a la tienda
    useEffect(() => {
        if (!isCartLoaded) return;
        if (cart.length === 0 && !orderPlaced) {
            router.push('/store');
        }
    }, [cart, isCartLoaded, orderPlaced, router]);
    
    // Mantener el timestamp del carrito actualizado y verificar expiración periódicamente
    useEffect(() => {
        if (cart.length > 0 && !orderPlaced) {
            localStorage.setItem('cartTimestamp', Date.now().toString());
        }

        const checkExpiryInterval = setInterval(() => {
            const timestamp = localStorage.getItem('cartTimestamp');
            if (timestamp) {
                const twoHoursMs = 2 * 60 * 60 * 1000;
                if (Date.now() - parseInt(timestamp) > twoHoursMs) {
                    clearCart();
                    localStorage.removeItem('cartTimestamp');
                    router.push('/store');
                }
            }
        }, 60000);

        return () => clearInterval(checkExpiryInterval);
    }, [cart, orderPlaced, clearCart, router]);

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
                        postalCode: customerData.postal_code || '',
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
    
    // ── Polling: verificar estado de pagos pendientes (CONT / pending_review_manual) ──
    // Máximo 30 intentos × 10 s = 5 minutos. Si no resuelve en ese tiempo, redirige
    // al perfil con el estado "pendiente" y el webhook actualizará cuando MP confirme.
    useEffect(() => {
        if (!pendingPaymentData) return;

        const MAX_POLLS = 30;

        if (pollCount >= MAX_POLLS) {
            // Tiempo agotado: el webhook actualizará cuando MP responda
            setOrderPaymentType('card_pending');
            setOrderPlaced(true);
            setPendingPaymentData(null);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const result = await getMpPaymentStatus(pendingPaymentData.paymentId);
                const finalStatus = result?.status;

                if (finalStatus === 'approved') {
                    setOrderPaymentType('card');
                    setOrderPlaced(true);
                    setPendingPaymentData(null);
                } else if (finalStatus === 'rejected' || finalStatus === 'cancelled') {
                    // Cancelar la orden draft (el pago no prosperó)
                    await cancelEcommerceOrder(pendingPaymentData.orderId).catch(() => {});
                    setCreatedOrderId(null);
                    setMpBrickResetKey(k => k + 1);
                    setPendingPaymentData(null);
                    setPaymentAlert({
                        type: 'danger',
                        title: 'Pago rechazado',
                        message: 'Tu banco rechazó el pago luego de la revisión. Podés intentar nuevamente con otra tarjeta.',
                    });
                    setIsSubmitting(false);
                    // Volver al paso de pago para que pueda reintentar
                    setPaymentStep(true);
                } else {
                    // Sigue pendiente: incrementar contador y esperar siguiente ciclo
                    setPollCount(c => c + 1);
                }
            } catch {
                setPollCount(c => c + 1); // error de red: reintentar
            }
        }, 10000);

        return () => clearTimeout(timer);
    }, [pendingPaymentData, pollCount]);

    // Función para generar el mensaje de WhatsApp
    const generateWhatsAppMessage = () => {
        let message = `¡Hola! Me gustaría hacer un pedido desde la tienda ${storeConfig?.name || 'su tienda'}:\n\n`;
        
        // Agregar productos
        message += "*Productos:*\n";
        cart.forEach(item => {
            message += `- ${item.quantity}x ${item.description} - $${(item.price * item.quantity).toFixed(2)}\n`;
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
                const customerDataForRegistration = {
                    phone: formData.phone || '',
                    address: formData.address || '',
                    city: formData.city || '',
                    state: formData.state || '',
                    postal_code: formData.postalCode || '',
                    country: 'Argentina'
                };
                
                const userResult = await createUserForCustomerAndLogIn(userData, customerDataForRegistration);
                setUser(userResult);
            };

            setShowUserCreateModal(false);

            if (isViewOnly) {
                await processCompleteCheckout(null, 'whatsapp');
                setIsSubmitting(false);
            } else {
                goToPaymentStep();
            }
            
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
                if (isViewOnly) {
                    setIsSubmitting(true);
                    await processCompleteCheckout(null, 'whatsapp');
                    setIsSubmitting(false);
                } else {
                    goToPaymentStep();
                }
            }
            // Si existingUser.email está vacío, significa que vino del header, no hacer checkout
            
        } catch (error) {
            console.error('Error al hacer login:', error);
            throw error; // Permitir que el modal maneje el error
        }
    };

    // Ir al step de pago (se llama luego de validar el formulario y la auth)
    const goToPaymentStep = () => {
        setIsSubmitting(false);
        setPaymentStep(true);
    };

    // Finalizar el pedido para métodos sin tarjeta (efectivo, transferencia) o view_only (WhatsApp)
    const processCompleteCheckout = async (paymentMethodId = null, paymentType = 'whatsapp') => {
        try {
            const result = await completeCheckout(formData, cart, paymentMethodId);
            const orderId = result?.salesOrder?.id;
            if (orderId) setCreatedOrderId(orderId);

            if (paymentType === 'whatsapp' && storeConfig?.phone) {
                const whatsappNumber = storeConfig.phone.replace(/[^0-9]/g, '');
                const message = generateWhatsAppMessage();
                window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
            }

            setOrderPaymentType(paymentType);
            setOrderPlaced(true);
            clearCart();
            setTimeout(() => router.push('/store/profile'), 5000);
        } catch (error) {
            console.error('Error al procesar checkout:', error);
            setPaymentAlert({
                type: 'danger',
                title: 'Error al procesar el pedido',
                message: 'Ocurrió un error al registrar tu pedido. Por favor, inténtalo de nuevo.',
            });
        }
    };

    // Procesar pago con tarjeta via MP Bricks
    const handleCardPayment = async (brickFormData) => {
        setIsSubmitting(true);
        let attemptOrderId = null;
        try {
            // 1. Crear la orden si no existe aún para este intento
            let orderId = createdOrderId;
            if (!orderId) {
                const result = await completeCheckout(formData, cart);
                orderId = result?.salesOrder?.id;
                attemptOrderId = orderId;
                setCreatedOrderId(orderId);
            }
            // 2. Procesar el pago con el token generado por el Brick
            const paymentResult = await processMercadoPagoCard(orderId, brickFormData);

            if (paymentResult?.payment_status === 'approved') {
                setOrderPaymentType('card');
                setOrderPlaced(true);
                clearCart();
                setTimeout(() => router.push('/store/profile'), 5000);

            } else if (paymentResult?.payment_status === 'rejected') {
                // Eliminar la orden draft para que el siguiente intento empiece limpio
                await cancelEcommerceOrder(orderId);
                setCreatedOrderId(null);
                setMpBrickResetKey(k => k + 1);

                const detail = paymentResult?.status_detail || '';
                setPaymentAlert({
                    type: 'danger',
                    title: 'Pago rechazado',
                    message: getMpMessage(detail, 'rejected'),
                });
                setIsSubmitting(false);

            } else {
                // pending / in_process (ej: CONT = pending_contingency)
                // El pago está siendo procesado — NO cancelar la orden, el webhook la actualizará.
                // Activar el polling para mostrar el resultado cuando el banco responda.
                const detail = paymentResult?.status_detail || '';
                clearCart();
                setIsSubmitting(false);
                setPaymentAlert({
                    type: 'warning',
                    title: 'Pago en proceso',
                    message: getMpMessage(detail, 'pending'),
                    autoClose: false,
                });
                setPollCount(0);
                setPendingPaymentData({
                    paymentId: paymentResult.payment_id,
                    orderId,
                    detail,
                });
            }
        } catch (error) {
            // Eliminar la orden si fue creada en este intento
            const orderToCancel = attemptOrderId || createdOrderId;
            if (orderToCancel) {
                await cancelEcommerceOrder(orderToCancel).catch(() => {});
                setCreatedOrderId(null);
            }
            setMpBrickResetKey(k => k + 1); // reinicia el Brick para desbloquear el botón
            console.error('Error al procesar pago con tarjeta:', error);
            setPaymentAlert({
                type: 'danger',
                title: 'Error al procesar el pago',
                message: 'No se pudo conectar con la pasarela de pago. Verificá tu conexión e intentá nuevamente.',
            });
            setIsSubmitting(false);
        }
    };

    // Confirmar método sin tarjeta (efectivo / transferencia)
    const handleNonCardConfirm = async (method) => {
        setIsSubmitting(true);
        try {
            await processCompleteCheckout(method?.id || null, method?.provider || 'cash');
        } catch {
            setIsSubmitting(false);
        }
    };

    // Pago con cuenta de Mercado Pago — flujo redirect (Checkout Pro)
    const handleMpAccountPayment = async () => {
        setIsSubmitting(true);
        let attemptOrderId = null;
        try {
            let orderId = createdOrderId;
            if (!orderId) {
                const result = await completeCheckout(formData, cart);
                orderId = result?.salesOrder?.id;
                attemptOrderId = orderId;
                setCreatedOrderId(orderId);
            }
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const mpResult = await createMercadoPagoPreference(orderId, baseUrl);
            const initPoint = mpResult?.init_point;
            if (!initPoint) throw new Error('No se recibió el link de pago de Mercado Pago.');
            clearCart();
            window.location.href = initPoint;
        } catch (error) {
            if (attemptOrderId) {
                await cancelEcommerceOrder(attemptOrderId).catch(() => {});
                setCreatedOrderId(null);
            }
            setPaymentAlert({
                type: 'danger',
                title: 'Error al iniciar el pago',
                message: 'No se pudo conectar con Mercado Pago. Verificá tu conexión e intentá nuevamente.',
            });
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            if (isUserAuthenticated) {
                if (isViewOnly) {
                    setIsSubmitting(true);
                    await processCompleteCheckout(null, 'whatsapp');
                    setIsSubmitting(false);
                } else {
                    goToPaymentStep();
                }
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
    
    // ── Pantalla de verificación de pago (polling activo) ──
    if (pendingPaymentData) {
        const bgMain = isDarkMode ? theme.background?.dark?.main || '#121212' : theme.background?.light?.main || '#f8f5f0';
        const cardBg = isDarkMode ? theme.background?.dark?.card || '#1e1e1e' : theme.background?.light?.card || '#ffffff';
        const borderCol = isDarkMode ? theme.border?.dark?.main || '#3a3a3a' : theme.border?.light?.main || '#e0e0e0';
        const textPri = isDarkMode ? theme.text?.dark?.primary || '#ffffff' : theme.text?.light?.primary || '#252525';
        const textSec = isDarkMode ? theme.text?.dark?.secondary || '#e0e0e0' : theme.text?.light?.secondary || '#3e3e3e';
        const spinColor = theme.primary?.light?.main || '#9a334d';

        return (
            <div className="min-h-screen flex flex-col" style={{ backgroundColor: bgMain }}>
                <StoreHeader isDarkMode={isDarkMode} storeConfig={storeConfig} theme={theme} getTotalCartItems={() => 0} onLoginClick={handleLoginFromHeader} />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center p-8 rounded-xl shadow-lg"
                        style={{ backgroundColor: cardBg, border: `1px solid ${borderCol}` }}>
                        {/* Spinner animado */}
                        <div className="w-16 h-16 mx-auto mb-6 relative">
                            <div className="w-16 h-16 rounded-full border-4 border-gray-200 absolute inset-0" />
                            <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin absolute inset-0"
                                style={{ borderColor: `${spinColor} transparent transparent transparent` }} />
                        </div>
                        <h2 className="text-xl font-bold mb-2" style={{ color: textPri }}>
                            Verificando tu pago...
                        </h2>
                        <p className="text-sm mb-1" style={{ color: textSec }}>
                            {getMpMessage(pendingPaymentData.detail, 'pending')}
                        </p>
                        <p className="text-xs mb-6" style={{ color: textSec }}>
                            Consultando al banco cada 10 segundos · {Math.max(0, 30 - pollCount) * 10}s restantes
                        </p>
                        <button
                            onClick={() => {
                                setOrderPaymentType('card_pending');
                                setOrderPlaced(true);
                                setPendingPaymentData(null);
                            }}
                            className="text-sm underline hover:no-underline"
                            style={{ color: textSec }}>
                            No quiero esperar — ir a mis pedidos
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Mensajes de éxito según el tipo de pago
    const successMessages = {
        card:          { title: '¡Pago aprobado!',          body: 'Tu pago fue procesado exitosamente. El pedido está confirmado.' },
        card_pending:  { title: '¡Pedido recibido!',         body: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.' },
        bank_transfer: { title: '¡Pedido registrado!',       body: 'Una vez que confirmemos tu transferencia, actualizaremos el estado de tu pedido.' },
        cash:          { title: '¡Pedido confirmado!',       body: 'Abonarás en efectivo al momento de la entrega.' },
        whatsapp:      { title: '¡Pedido enviado!',          body: 'Tu pedido fue enviado a WhatsApp. Nos comunicaremos pronto para confirmarlo.' },
    };
    const successMsg = successMessages[orderPaymentType] || successMessages.whatsapp;

    // Si el pedido fue colocado con éxito
    if (orderPlaced) {
        const cardBg = isDarkMode ? theme.background?.dark?.card || '#1e1e1e' : theme.background?.light?.card || '#ffffff';
        const textPrimary = isDarkMode ? theme.text?.dark?.primary || '#ffffff' : theme.text?.light?.primary || '#252525';
        const textSecondary = isDarkMode ? theme.text?.dark?.secondary || '#e0e0e0' : theme.text?.light?.secondary || '#3e3e3e';
        const borderColor = isDarkMode ? theme.border?.dark?.main || '#3a3a3a' : theme.border?.light?.main || '#e0e0e0';
        const primaryGradient = theme.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)';

        return (
            <div className="min-h-screen flex flex-col transition-colors duration-300"
                style={{ backgroundColor: isDarkMode ? theme.background?.dark?.main || '#121212' : theme.background?.light?.main || '#f8f5f0' }}>
                <StoreHeader
                    isDarkMode={isDarkMode}
                    storeConfig={storeConfig}
                    theme={theme}
                    getTotalCartItems={() => 0}
                    onLoginClick={handleLoginFromHeader}
                />

                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center p-8 rounded-xl shadow-lg"
                        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>

                        {/* Ícono de éxito */}
                        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6"
                            style={{ background: primaryGradient }}>
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold mb-3" style={{ color: textPrimary }}>
                            {successMsg.title}
                        </h2>
                        <p className="text-sm mb-2" style={{ color: textSecondary }}>
                            {successMsg.body}
                        </p>
                        <p className="text-xs mb-8" style={{ color: textSecondary }}>
                            Serás redirigido a tus pedidos en 5 segundos…
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => router.push('/store/profile')}
                                className="w-full px-6 py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90"
                                style={{ background: primaryGradient }}>
                                Ver mis pedidos
                            </button>
                            <button
                                onClick={() => router.push('/store')}
                                className="w-full px-6 py-2 rounded-lg font-medium transition-all hover:opacity-70 border"
                                style={{ color: textSecondary, borderColor }}>
                                Seguir comprando
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    // Mientras se restaura el carrito desde localStorage mostrar spinner
    if (!isCartLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: isDarkMode ? theme.background?.dark?.main || '#121212' : theme.background?.light?.main || '#f8f5f0' }}>
                <div className="w-8 h-8 border-t-2 border-r-2 rounded-full animate-spin"
                    style={{ borderColor: isDarkMode ? theme.primary?.dark?.main || '#7a2639' : theme.primary?.light?.main || '#9a334d' }} />
            </div>
        );
    }

    if (cart.length === 0) {
        return null;
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
                    {/* Panel izquierdo: formulario O paso de pago */}
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

                        {/* ── PASO DE PAGO ─────────────────────────────────── */}
                        {paymentStep && !isViewOnly ? (
                            <div>
                                {/* Cabecera del paso */}
                                <div className="flex items-center gap-3 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentStep(false)}
                                        className="p-2 rounded-lg transition-colors hover:opacity-70"
                                        style={{
                                            color: isDarkMode ? theme.text?.dark?.muted : theme.text?.light?.muted,
                                            backgroundColor: isDarkMode ? '#ffffff10' : '#00000008',
                                        }}
                                    >
                                        <FaArrowLeft className="text-sm" />
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-bold"
                                            style={{ color: isDarkMode ? theme.text?.dark?.primary : theme.text?.light?.primary }}>
                                            Método de pago
                                        </h2>
                                        <p className="text-xs flex items-center gap-1 mt-0.5"
                                            style={{ color: isDarkMode ? theme.text?.dark?.muted : theme.text?.light?.muted }}>
                                            <FaLock className="text-emerald-500" /> Conexión segura
                                        </p>
                                    </div>
                                </div>

                                <PaymentGateway
                                    orderTotal={getTotalPrice()}
                                    customerEmail={formData.email}
                                    onCardPaymentSubmit={handleCardPayment}
                                    onNonCardConfirm={handleNonCardConfirm}
                                    onMpAccountPayment={handleMpAccountPayment}
                                    isProcessing={isSubmitting}
                                    isDarkMode={isDarkMode}
                                    theme={theme}
                                    getPaymentMethods={getStorePaymentMethods}
                                    brickResetKey={mpBrickResetKey}
                                />
                            </div>
                        ) : (
                        /* ── FORMULARIO DE DATOS ──────────────────────────── */
                        <div>
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
                                            autoComplete='off'
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
                                            autoComplete='off'
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
                                            autoComplete='off'
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
                                            autoComplete="off"
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
                                            autoComplete="off"
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
                                            autoComplete="off"
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
                                            autoComplete="off"
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
                                            autoComplete="off"
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
                                            autoComplete="off"
                                            placeholder="Instrucciones especiales para tu pedido..."
                                        />
                                    </div>
                                </div>
                                
                                {isViewOnly && (
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
                                        ) : 
                                        <div>
                                            <span>{isViewOnly ? 'Confirmar pedido' : 'Continuar al pago'}</span>
                                            {!isViewOnly && <FaLock className="inline-block ml-2 text-xs" />}
                                        </div>}
                                    </button>
                                </div>
                            </form>
                        </div>
                        )} {/* fin condicional paymentStep */}
                        </div> {/* fin card container */}
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
                                                <div className="text-sm text-right"
                                                    style={{ 
                                                        color: isDarkMode 
                                                            ? theme.text?.dark?.secondary || '#e0e0e0' 
                                                            : theme.text?.light?.secondary || '#3e3e3e'
                                                    }}>
                                                    {item.quantity} x {formatPrice(item.price)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="font-medium text-right"
                                            style={{ 
                                                color: isDarkMode 
                                                    ? theme.text?.dark?.primary || '#ffffff' 
                                                    : theme.text?.light?.primary || '#252525'
                                            }}>
                                            {formatPrice(item.price * item.quantity)}
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
                                    <span className="font-medium text-right"
                                        style={{ 
                                            color: isDarkMode 
                                                ? theme.text?.dark?.primary || '#ffffff' 
                                                : theme.text?.light?.primary || '#252525'
                                        }}>
                                        {formatPrice(getTotalPrice())}
                                    </span>
                                </div>
                                
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
                                    <span className="text-lg font-bold text-right"
                                        style={{ 
                                            background: theme.primary?.gradient || 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)', 
                                            WebkitBackgroundClip: 'text', 
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                        {formatPrice(getTotalPrice())}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Carrito de compras - Solo mostrar si no es view_only */}
            <ShoppingCart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cart}
                isCheckoutPage={true}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onClearCart={clearCart}
            />
        

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

            {/* Alert de errores de pago */}
            {paymentAlert && (
                <Alert
                    type={paymentAlert.type}
                    title={paymentAlert.title}
                    message={paymentAlert.message}
                    onClose={() => setPaymentAlert(null)}
                    autoClose={false}
                />
            )}

        </div>
    );
};

export default CheckoutPage;