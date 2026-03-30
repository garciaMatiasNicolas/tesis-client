/**
 * Servicio para consumir la API de Georef (Argentina.gob.ar)
 * API oficial del gobierno argentino para obtener provincias, municipios y localidades
 * Documentación: https://datosgobar.github.io/georef-ar-api/
 */

const GEOREF_API_BASE = 'https://apis.datos.gob.ar/georef/api';

class GeorefService {
    /**
     * Obtener todas las provincias de Argentina
     * @returns {Promise<Array>} Array de provincias con id y nombre
     */
    async getProvincias() {
        try {
            const response = await fetch(`${GEOREF_API_BASE}/provincias?campos=id,nombre&max=24&orden=nombre`);
            
            if (!response.ok) {
                throw new Error('Error al obtener provincias');
            }
            
            const data = await response.json();
            return data.provincias || [];
        } catch (error) {
            console.error('Error fetching provincias:', error);
            // Fallback con provincias estáticas en caso de error
            return this.getFallbackProvincias();
        }
    }

    /**
     * Obtener municipios de una provincia específica
     * @param {string} provinciaId - ID de la provincia
     * @param {string} provincaNombre - Nombre de la provincia (alternativo)
     * @returns {Promise<Array>} Array de municipios
     */
    async getMunicipios(provinciaId = null, provinciaNombre = null) {
        try {
            let url = `${GEOREF_API_BASE}/municipios?campos=id,nombre&max=1000&orden=nombre`;
            
            if (provinciaId) {
                url += `&provincia=${provinciaId}`;
            } else if (provinciaNombre) {
                url += `&provincia=${encodeURIComponent(provinciaNombre)}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Error al obtener municipios');
            }
            
            const data = await response.json();
            return data.municipios || [];
        } catch (error) {
            console.error('Error fetching municipios:', error);
            return [];
        }
    }

    /**
     * Obtener localidades de una provincia específica
     * @param {string} provinciaId - ID de la provincia
     * @param {string} provinciaNombre - Nombre de la provincia (alternativo)
     * @returns {Promise<Array>} Array de localidades
     */
    async getLocalidades(provinciaId = null, provinciaNombre = null) {
        try {
            let url = `${GEOREF_API_BASE}/localidades?campos=id,nombre&max=5000&orden=nombre`;
            
            if (provinciaId) {
                url += `&provincia=${provinciaId}`;
            } else if (provinciaNombre) {
                url += `&provincia=${encodeURIComponent(provinciaNombre)}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Error al obtener localidades');
            }
            
            const data = await response.json();
            return data.localidades || [];
        } catch (error) {
            console.error('Error fetching localidades:', error);
            return [];
        }
    }

    /**
     * Buscar localidades por nombre (para búsqueda con autocompletado)
     * @param {string} query - Término de búsqueda
     * @param {string} provinciaId - ID de la provincia (opcional)
     * @returns {Promise<Array>} Array de localidades que coinciden
     */
    async searchLocalidades(query, provinciaId = null) {
        try {
            if (!query || query.length < 2) {
                return [];
            }

            let url = `${GEOREF_API_BASE}/localidades?nombre=${encodeURIComponent(query)}&campos=id,nombre,provincia.nombre&max=50`;
            
            if (provinciaId) {
                url += `&provincia=${provinciaId}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Error al buscar localidades');
            }
            
            const data = await response.json();
            return data.localidades || [];
        } catch (error) {
            console.error('Error searching localidades:', error);
            return [];
        }
    }

    /**
     * Normalizar dirección completa usando la API de Georef
     * @param {string} direccion - Dirección a normalizar
     * @param {string} provincia - Provincia
     * @returns {Promise<Object>} Dirección normalizada
     */
    async normalizarDireccion(direccion, provincia = null) {
        try {
            let url = `${GEOREF_API_BASE}/direcciones?direccion=${encodeURIComponent(direccion)}`;
            
            if (provincia) {
                url += `&provincia=${encodeURIComponent(provincia)}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Error al normalizar dirección');
            }
            
            const data = await response.json();
            return data.direcciones && data.direcciones.length > 0 ? data.direcciones[0] : null;
        } catch (error) {
            console.error('Error normalizando dirección:', error);
            return null;
        }
    }

    /**
     * Provincias de fallback en caso de que la API no esté disponible
     * @returns {Array} Array de provincias estáticas
     */
    getFallbackProvincias() {
        return [
            { id: '02', nombre: 'Buenos Aires' },
            { id: '06', nombre: 'Buenos Aires (Ciudad Autónoma)' },
            { id: '10', nombre: 'Catamarca' },
            { id: '14', nombre: 'Córdoba' },
            { id: '18', nombre: 'Corrientes' },
            { id: '22', nombre: 'Chaco' },
            { id: '26', nombre: 'Chubut' },
            { id: '30', nombre: 'Entre Ríos' },
            { id: '34', nombre: 'Formosa' },
            { id: '38', nombre: 'Jujuy' },
            { id: '42', nombre: 'La Pampa' },
            { id: '46', nombre: 'La Rioja' },
            { id: '50', nombre: 'Mendoza' },
            { id: '54', nombre: 'Misiones' },
            { id: '58', nombre: 'Neuquén' },
            { id: '62', nombre: 'Río Negro' },
            { id: '66', nombre: 'Salta' },
            { id: '70', nombre: 'San Juan' },
            { id: '74', nombre: 'San Luis' },
            { id: '78', nombre: 'Santa Cruz' },
            { id: '82', nombre: 'Santa Fe' },
            { id: '86', nombre: 'Santiago del Estero' },
            { id: '90', nombre: 'Tucumán' },
            { id: '94', nombre: 'Tierra del Fuego' }
        ];
    }
}

// Exportar instancia única del servicio
const georefService = new GeorefService();
export default georefService;
