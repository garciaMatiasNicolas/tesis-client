// Formatear precio
const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
    }).format(price);
};

// Función auxiliar para crear fecha sin problemas de zona horaria
const createLocalDate = (dateString) => {
    // Si la fecha incluye hora, usar Date normal
    if (dateString.includes('T') || dateString.includes(' ')) {
        return new Date(dateString);
    }
    // Si es solo fecha (YYYY-MM-DD), crear fecha local
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// Formatear fecha
const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return createLocalDate(dateString).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Formatear fecha con hora
const formatDateTime = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-AR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(dateString));
};

// Formatear fecha completa (mes en texto completo)
const formatDateLong = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(createLocalDate(dateString));
};

export { formatPrice, formatDate, formatDateTime, formatDateLong };