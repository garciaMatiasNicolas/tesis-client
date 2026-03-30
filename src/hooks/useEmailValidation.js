import { useState, useCallback, useRef } from 'react';
import useApiMethods from './useApiMethods';

/**
 * Hook para validar email en tiempo real
 * @param {number} delay - Retraso en ms para el debounce (default: 800ms)
 */
const useEmailValidation = (delay = 800) => {
    const { getMethod } = useApiMethods();
    const timeoutRef = useRef(null);
    const [emailStatus, setEmailStatus] = useState({
        isValidating: false,
        isAvailable: null,
        error: null
    });

    // Función para validar email
    const validateEmailAsync = useCallback(async (email) => {
        // Validar formato básico primero
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setEmailStatus({
                isValidating: false,
                isAvailable: null,
                error: email ? 'El formato del email no es válido' : null
            });
            return;
        }

        setEmailStatus(prev => ({ ...prev, isValidating: true, error: null }));

        try {
            // Verificar disponibilidad en el backend
            const response = await getMethod(`/check-email/?email=${encodeURIComponent(email)}`, {}, false);
            
            setEmailStatus({
                isValidating: false,
                isAvailable: response.available,
                error: response.available ? null : 'Este email ya está en uso'
            });
        } catch (error) {
            console.error('Error validando email:', error);
            
            // Manejar diferentes tipos de errores
            let errorMessage = 'Error al validar el email';
            if (error.response?.status === 404) {
                errorMessage = 'Servicio de validación no disponible';
            } else if (error.response?.status === 400) {
                errorMessage = error.response.data?.error || 'Error en la solicitud';
            } else if (!error.response) {
                errorMessage = 'Error de conexión con el servidor';
            }
            
            setEmailStatus({
                isValidating: false,
                isAvailable: null,
                error: errorMessage
            });
        }
    }, [getMethod]);

    // Función con debounce manual
    const validateEmail = useCallback((email) => {
        // Cancelar timeout anterior
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Si el email está vacío, limpiar estado
        if (!email) {
            setEmailStatus({
                isValidating: false,
                isAvailable: null,
                error: null
            });
            return;
        }

        // Configurar nuevo timeout
        timeoutRef.current = setTimeout(() => {
            validateEmailAsync(email);
        }, delay);

    }, [validateEmailAsync, delay]);

    const resetValidation = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setEmailStatus({
            isValidating: false,
            isAvailable: null,
            error: null
        });
    }, []);

    return {
        emailStatus,
        validateEmail,
        resetValidation
    };
};

export default useEmailValidation;