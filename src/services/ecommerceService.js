import useApiMethods from '@/hooks/useApiMethods';
import { setAuthTokenIntoCookie } from '@/services/auth';

const useEcommerceService = () => {
    const { getMethod, postMethod, putMethod, patchMethod, deleteMethod } = useApiMethods();

    const ecommerceService = {
        // Obtener productos con filtros y paginación
        getAllProducts: async (filters = {}) => {
            try {
                const queryParams = new URLSearchParams();
                
                // Agregar filtros como query parameters
                if (filters.category) queryParams.append('category', filters.category);
                if (filters.subcategory) queryParams.append('subcategory', filters.subcategory);
                if (filters.supplier) queryParams.append('supplier', filters.supplier);
                if (filters.search) queryParams.append('search', filters.search);
                if (filters.min_price) queryParams.append('min_price', filters.min_price);
                if (filters.max_price) queryParams.append('max_price', filters.max_price);
                if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
                if (filters.page) queryParams.append('page', filters.page);
                if (filters.page_size) queryParams.append('page_size', filters.page_size);

                const url = queryParams.toString() 
                    ? `/ecommerce/products/?${queryParams.toString()}`
                    : '/ecommerce/products/';
                    
                const response = await getMethod(url, {}, false);
                return response;
            } catch (error) {
                console.error('Error al obtener productos:', error);
                throw error;
            }
        },

        getConfigEcommerce: async () => {
            try {
                const response = await getMethod('/config/', {}, false);
                return response;
            } catch (error) {
                console.error('Error al obtener configuración de ecommerce:', error);
                throw error;
            }
        },

        // Obtener un producto por ID
        getProductById: async (id) => {
            try {
                const response = await getMethod(`/ecommerce/products/${id}/`, {}, false);
                return response;
            } catch (error) {
                console.error('Error al obtener producto:', error);
                throw error;
            }
        },

        // Obtener todas las categorías
        getCategories: async () => {
            try {
                const response = await getMethod('/ecommerce/categories/', {}, false);
                return response;
            } catch (error) {
                console.error('Error al obtener categorías:', error);
                throw error;
            }
        },

        // Obtener todas las subcategorías
        getSubcategories: async () => {
            try {
                const response = await getMethod('/ecommerce/subcategories/', {}, false);
                return response;
            } catch (error) {
                console.error('Error al obtener subcategorías:', error);
                throw error;
            }
        },

        // PROVEEDORES - Asumo que tienes endpoints similares para suppliers
        getSuppliers: async () => {
            try {
                const response = await getMethod('/ecommerce/suppliers/', {}, false); // Ajustar según tu backend
                const suppliersArray = Array.isArray(response) ? response : 
                (response && response.results) ? response.results :
                (response && response.data) ? response.data : [];
                return suppliersArray;
            } catch (error) {
                console.error('Error al obtener proveedores:', error);
                throw error;
            }
        },
        
        // Actualizar datos del perfil del cliente (actualización parcial)
        updateCustomerProfile: async (updateData) => {
            try {
                const response = await patchMethod('/ecommerce/customers/me/', updateData, true);
                return response;
            } catch (error) {
                console.error('Error al actualizar perfil del cliente:', error);
                throw error;
            }
        },

        createUserForCustomerAndLogIn: async (userData, customerData = {}) => {
            try {
                // 1. Registrar al cliente (crea User + Customer, o vincula si ya existe)
                const registrationData = {
                    email: userData.email,
                    password: userData.password,
                    confirm_password: userData.password,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    phone: customerData?.phone || '',
                    address: customerData?.address || '',
                    city: customerData?.city || '',
                    state: customerData?.state || '',
                    postal_code: customerData?.postal_code || '',
                    country: customerData?.country || 'Argentina'
                };
                
                const registerResponse = await postMethod('/ecommerce/register/', registrationData, false);
                
                // 2. Hacer login automático
                const loginResponse = await postMethod('/auth/login/', { 
                    email: userData.email, 
                    password: userData.password, 
                    ecommerce: true 
                }, false);
                
                // 3. Guardar tokens de autenticación
                const { access, refresh } = loginResponse;
                setAuthTokenIntoCookie(access, refresh);
                
                // 4. Si el cliente tenía compras previas, informar al usuario
                const message = registerResponse.linked_to_existing 
                    ? 'Cuenta creada y vinculada exitosamente. Hemos vinculado tus compras previas.'
                    : 'Cuenta creada exitosamente.';
                
                return {
                    user_id: registerResponse.user_id,
                    customer_id: registerResponse.customer_id,
                    user: registerResponse.user,
                    customer: registerResponse.customer,
                    tokens: { access, refresh },
                    linked_to_existing: registerResponse.linked_to_existing,
                    message: message
                };
            } catch (error) {
                console.error('Error al crear usuario y hacer login:', error);
                throw error;
            }
        },

        createCustomer: async (customerData) => {
            try {
                const response = await postMethod('/crm/customers/', customerData, {}, true); // Con autenticación
                return response;
            } catch (error) {
                console.error('Error al crear cliente:', error);
                throw error;
            }
        },

        // Crear carrito de compra
        createCart: async (customerId) => {
            try {
                const response = await postMethod('/ecommerce/carts/', { customer_id: customerId }, {}, true);
                return response;
            } catch (error) {
                console.error('Error al crear carrito:', error);
                throw error;
            }   
        },

        // Agregar item al carrito
        addItemToCart: async (cartId, productId, quantity) => {
            try {
                const response = await postMethod(`/ecommerce/carts/${cartId}/items/`, {
                    product_id: productId,
                    quantity: quantity
                }, {}, true);
                return response;
            } catch (error) {
                console.error('Error al agregar item al carrito:', error);
                throw error;
            }
        },

        // Función completa para checkout - crear customer, carrito y transferir items
        completeCheckout: async (formData, cartItems, paymentMethodId = null) => {
            try {

                const customer = await getMethod('/ecommerce/customers/me/', {}, true);
                const cart = await postMethod('/ecommerce/carts/', { customer_id: customer.id }, {}, true);

                // 3. Agregar todos los items del localStorage al carrito del backend
                for (const item of cartItems) {
                    await postMethod(`/ecommerce/carts/${cart.id}/items/`, {
                        product_id: item.id,
                        quantity: item.quantity
                    }, {}, true);
                }

                // 4. Hacer checkout del carrito (convertir a orden de venta)
                const checkoutData = {
                    payment_method_id: paymentMethodId || null,
                    delivery_date: new Date().toISOString().split('T')[0],
                    deliver_to: formData.address || `${formData.city}, ${formData.state}`,
                    shipping_cost: 0,
                    taxes: 0,
                    discount: 0,
                    notes: formData.notes || ''
                };
                
                const salesOrder = await postMethod(`/ecommerce/carts/${cart.id}/checkout/`, checkoutData, {}, true);
                
                return {
                    customer,
                    cart,
                    salesOrder
                };
                
            } catch (error) {
                console.error('Error en el proceso completo de checkout:', error);
                throw error;
            }
        },

        // Obtener carrito del usuario actual
        getCart: async (customerId) => {
            try {
                const response = await getMethod(`/ecommerce/carts/?customer_id=${customerId}`, {}, true);
                return response;
            } catch (error) {
                console.error('Error al obtener carrito:', error);
                throw error;
            }
        },

        // Verificar si un email existe y qué tipo de usuario es
        checkUserByEmail: async (email) => {
            try {
                const response = await getMethod(`/check-email/?email=${encodeURIComponent(email)}`, {}, false);
                return response;
            } catch (error) {
                console.error('Error al verificar email:', error);
                throw error;
            }
        },

        // Verificar si existe un customer con este email (con o sin usuario)
        checkCustomerByEmail: async (email) => {
            try {
                // Este endpoint podría implementarse en el backend si se necesita
                // Por ahora usamos checkUserByEmail que ya existe
                const response = await getMethod(`/check-email/?email=${encodeURIComponent(email)}`, {}, false);
                return response;
            } catch (error) {
                console.error('Error al verificar email:', error);
                throw error;
            }
        },

        // Login de usuario existente
        loginUser: async (email, password) => {
            try {
                const loginResponse = await postMethod('/auth/login/', { 
                    email, 
                    password, 
                    ecommerce: true 
                }, false);
                
                // Guardar tokens de autenticación
                const { access, refresh } = loginResponse;
                setAuthTokenIntoCookie(access, refresh);
                
                return {
                    user_id: loginResponse.user_id,
                    user_name: loginResponse.user_name,
                    tokens: { access, refresh }
                };
            } catch (error) {
                console.error('Error al hacer login:', error);
                throw error;
            }
        },

        // Obtener datos del cliente autenticado
        getCustomerData: async () => {
            try {
                const response = await getMethod('/ecommerce/customers/me/', {}, true);
                return response;
            } catch (error) {
                console.error('Error al obtener datos del cliente:', error);
                throw error;
            }
        },


        // Actualizar datos completos del perfil del cliente
        updateFullCustomerProfile: async (profileData) => {
            try {
                const response = await putMethod('/ecommerce/customers/me/', profileData, true);
                return response;
            } catch (error) {
                console.error('Error al actualizar perfil completo del cliente:', error);
                throw error;
            }
        },

        updateCustomerData: async (customerId, updateData) => {
            try {
                const response = await patchMethod(`/crm/customers/${customerId}/`, updateData, true);
                return response;
            } catch (error) {
                console.error('Error al actualizar datos del cliente:', error);
                throw error;
            }
        },

        // Obtener los pedidos del cliente autenticado
        getMyOrders: async () => {
            try {
                const response = await getMethod('/billing/sales-orders/my-orders/', {}, true);
                return response;
            } catch (error) {
                console.error('Error al obtener pedidos del cliente:', error);
                throw error;
            }
        },

        // Métodos de pago activos de la tienda (público, sin credenciales)
        getStorePaymentMethods: async () => {
            try {
                const response = await getMethod('/ecommerce/store/payment-methods/', {}, false);
                return Array.isArray(response) ? response : response?.results || [];
            } catch (error) {
                console.error('Error al obtener métodos de pago:', error);
                throw error;
            }
        },

        // Crear preferencia de Checkout Pro en Mercado Pago (flujo redirect)
        createMercadoPagoPreference: async (orderId, baseUrl = '') => {
            try {
                const response = await postMethod('/ecommerce/payment/mp/create-preference/', {
                    order_id: orderId,
                    base_url: baseUrl,
                }, true);
                return response;
            } catch (error) {
                console.error('Error al crear preferencia de MP:', error);
                throw error;
            }
        },

        // Consultar el estado de una transacción de MP por payment_id
        getMpPaymentStatus: async (paymentId) => {
            try {
                const response = await getMethod(`/ecommerce/payment/mp/status/${paymentId}/`, {}, true);
                return response;
            } catch (error) {
                console.error('Error al consultar estado del pago:', error);
                throw error;
            }
        },

        // Eliminar una orden draft que falló en el pago (no deja rastro en el sistema)
        cancelEcommerceOrder: async (orderId) => {
            try {
                await deleteMethod(`/ecommerce/orders/${orderId}/cancel/`, true);
            } catch (error) {
                console.error('Error al cancelar orden de pago fallido:', error);
            }
        },

        // Validar si hay stock disponible para un producto y cantidad dada
        validateStockProduct: async (productId, quantity) => {
            try {
                const response = await getMethod(
                    `/validate-stock-product/?product_id=${productId}&quantity=${quantity}`,
                    {},
                    false
                );
                return response;
            } catch (error) {
                console.error('Error al validar stock del producto:', error);
                throw error;
            }
        },

        // Procesar pago con tarjeta via Bricks (token generado por el SDK de MP)
        processMercadoPagoCard: async (orderId, brickFormData) => {
            try {
                const response = await postMethod('/ecommerce/payment/mp/process-card/', {
                    order_id: orderId,
                    token: brickFormData.token,
                    payment_method_id: brickFormData.payment_method_id,
                    installments: brickFormData.installments,
                    issuer_id: brickFormData.issuer_id,
                    payer_email: brickFormData.payer?.email || '',
                }, true);
                return response;
            } catch (error) {
                console.error('Error al procesar pago con tarjeta:', error);
                throw error;
            }
        },
    };

  return ecommerceService;
};

export default useEcommerceService;