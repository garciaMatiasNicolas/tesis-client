class PaymentMethodsService {
    constructor() {
        this.apiMethods = null;
    }

    initialize(apiMethods) {
        this.apiMethods = apiMethods;
    }

    async getPaymentMethods(params = {}) {
        if (!this.apiMethods) throw new Error('PaymentMethodsService not initialized');
        try {
            const response = await this.apiMethods.getMethod('/ecommerce/payment-methods/', params);
            return response;
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            throw error;
        }
    }

    async getPaymentMethod(id) {
        if (!this.apiMethods) throw new Error('PaymentMethodsService not initialized');
        try {
            const response = await this.apiMethods.getMethod(`/ecommerce/payment-methods/${id}/`);
            return response;
        } catch (error) {
            console.error('Error fetching payment method:', error);
            throw error;
        }
    }

    async createPaymentMethod(data) {
        if (!this.apiMethods) throw new Error('PaymentMethodsService not initialized');
        try {
            const response = await this.apiMethods.postMethod('/ecommerce/payment-methods/', data);
            return response;
        } catch (error) {
            console.error('Error creating payment method:', error);
            throw error;
        }
    }

    async updatePaymentMethod(id, data) {
        if (!this.apiMethods) throw new Error('PaymentMethodsService not initialized');
        try {
            const response = await this.apiMethods.putMethod(`/ecommerce/payment-methods/${id}/`, data);
            return response;
        } catch (error) {
            console.error('Error updating payment method:', error);
            throw error;
        }
    }

    async patchPaymentMethod(id, data) {
        if (!this.apiMethods) throw new Error('PaymentMethodsService not initialized');
        try {
            const response = await this.apiMethods.patchMethod(`/ecommerce/payment-methods/${id}/`, data);
            return response;
        } catch (error) {
            console.error('Error patching payment method:', error);
            throw error;
        }
    }

    async deletePaymentMethod(id) {
        if (!this.apiMethods) throw new Error('PaymentMethodsService not initialized');
        try {
            await this.apiMethods.deleteMethod(`/ecommerce/payment-methods/${id}/`);
        } catch (error) {
            console.error('Error deleting payment method:', error);
            throw error;
        }
    }
}

const paymentMethodsService = new PaymentMethodsService();
export default paymentMethodsService;
