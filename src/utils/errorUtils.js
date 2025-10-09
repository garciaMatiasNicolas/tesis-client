import { useState, useCallback } from 'react';

/**
 * Utilidades para manejar errores de Django REST Framework
 */

/**
 * Extrae todos los errores de una respuesta de Django
 * @param {Object} errorResponse - La respuesta de error del backend
 * @returns {Object} - Objeto con errores por campo y errores generales
 */
export const extractDjangoErrors = (errorResponse) => {
    const result = {
        fieldErrors: {},
        generalErrors: [],
        hasErrors: false
    };

    if (!errorResponse?.data) {
        return result;
    }

    const data = errorResponse.data;

    // Extraer errores por campo
    Object.keys(data).forEach(field => {
        if (field !== 'non_field_errors' && Array.isArray(data[field])) {
            result.fieldErrors[field] = data[field];
            result.hasErrors = true;
        } else if (field !== 'non_field_errors' && typeof data[field] === 'string') {
            result.fieldErrors[field] = [data[field]];
            result.hasErrors = true;
        }
    });

    // Extraer errores generales (non_field_errors)
    if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
        result.generalErrors = data.non_field_errors;
        result.hasErrors = true;
    }

    // Extraer otros tipos de errores comunes
    if (data.detail) {
        result.generalErrors.push(data.detail);
        result.hasErrors = true;
    }

    if (data.error) {
        result.generalErrors.push(data.error);
        result.hasErrors = true;
    }

    if (data.message) {
        result.generalErrors.push(data.message);
        result.hasErrors = true;
    }

    return result;
};

/**
 * Convierte errores de Django en un formato más legible
 * @param {Object} errorResponse - La respuesta de error del backend
 * @returns {string} - Mensaje de error formateado
 */
export const formatDjangoErrorMessage = (errorResponse) => {
    const errors = extractDjangoErrors(errorResponse);
    
    if (!errors.hasErrors) {
        return 'Error desconocido en el servidor';
    }

    const messages = [];

    // Agregar errores generales primero
    if (errors.generalErrors.length > 0) {
        messages.push(...errors.generalErrors);
    }

    // Agregar errores por campo
    Object.keys(errors.fieldErrors).forEach(field => {
        const fieldName = getFieldDisplayName(field);
        const fieldErrors = errors.fieldErrors[field];
        fieldErrors.forEach(error => {
            messages.push(`${fieldName}: ${error}`);
        });
    });

    return messages.join('\n');
};

/**
 * Convierte nombres de campo técnicos en nombres más legibles
 * @param {string} fieldName - Nombre técnico del campo
 * @returns {string} - Nombre legible del campo
 */
const getFieldDisplayName = (fieldName) => {
    const fieldNames = {
        email: 'Email',
        first_name: 'Nombre',
        last_name: 'Apellido',
        password: 'Contraseña',
        dni: 'DNI',
        cuil: 'CUIL',
        phone: 'Teléfono',
        birth: 'Fecha de nacimiento',
        date_joined: 'Fecha de ingreso',
        position: 'Puesto',
        store: 'Tienda',
        branch: 'Sucursal',
        address: 'Dirección',
        city: 'Ciudad',
        state: 'Estado/Provincia',
        country: 'País',
        postal_code: 'Código postal',
        profile_photo: 'Foto de perfil'
    };

    return fieldNames[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
};

/**
 * Valida si un error de respuesta es de validación de Django
 * @param {Object} error - Error de axios
 * @returns {boolean} - True si es un error de validación
 */
export const isDjangoValidationError = (error) => {
    return error?.response?.status === 400 && error?.response?.data;
};

/**
 * Hook personalizado para manejar errores de formularios
 */
export const useFormErrors = () => {
    const [formErrors, setFormErrors] = useState({});

    const setFieldError = useCallback((field, error) => {
        setFormErrors(prev => ({
            ...prev,
            [field]: error
        }));
    }, []);

    const clearFieldError = useCallback((field) => {
        setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const setErrors = useCallback((errors) => {
        if (typeof errors === 'object' && errors !== null) {
            setFormErrors(errors);
        }
    }, []);

    const clearAllErrors = useCallback(() => {
        setFormErrors({});
    }, []);

    const hasError = useCallback((field) => {
        return formErrors[field] && formErrors[field].length > 0;
    }, [formErrors]);

    const getError = useCallback((field) => {
        return formErrors[field] && formErrors[field].length > 0 
            ? formErrors[field][0] 
            : null;
    }, [formErrors]);

    return {
        formErrors,
        setFieldError,
        clearFieldError,
        setErrors,
        clearAllErrors,
        hasError,
        getError
    };
};