"use client";
import React, { useState, useEffect } from "react";
import { FaTimes, FaComment, FaCommentDots, FaSave, FaCalendarAlt, FaUser, FaEdit, FaTrash, FaSpinner } from "react-icons/fa";
import crmService from "@/services/crmService";
import { formatDateTime, formatDateLong } from "@/utils/formatData";

export default function CustomerDetailModal({ 
    isOpen, 
    onClose, 
    customer,
    onContactAdded,
    readOnly = false
}) {
    const [newComment, setNewComment] = useState('');
    const [contactMedium, setContactMedium] = useState('whatsapp');
    const [contactHistory, setContactHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);

    // Opciones de medio de contacto
    const contactMediums = [
        { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
        { value: 'email', label: 'Email', icon: '📧' },
        { value: 'phone', label: 'Llamada', icon: '📞' },
        { value: 'sms', label: 'SMS', icon: '💬' },
        { value: 'in_person', label: 'Presencial', icon: '🤝' },
        { value: 'other', label: 'Otro', icon: '📝' }
    ];

    // Cargar historial de contactos cuando se abre el modal
    useEffect(() => {
        if (isOpen && customer) {
            loadContactHistory();
        }
    }, [isOpen, customer]);

    // Cargar historial de contactos
    const loadContactHistory = async () => {
        if (!customer) return;
        
        try {
            setLoading(true);
            const response = await crmService.getContactHistory(customer.id);
            if (response && response.contact_history) {
                setContactHistory(response.contact_history);
            } else if (customer.contact_history) {
                setContactHistory(customer.contact_history);
            }
        } catch (error) {
            // Fallback a datos locales
            if (customer.contact_history) {
                setContactHistory(customer.contact_history);
            }
        } finally {
            setLoading(false);
        }
    };

    // Agregar nuevo contacto
    const handleAddContact = async () => {
        if (!newComment.trim() || !customer) return;

        try {
            setIsSubmitting(true);
            const contactData = {
                comment: newComment.trim(),
                medium: contactMedium
            };

            await crmService.addContact(customer.id, contactData);
            
            // Recargar historial
            await loadContactHistory();
            
            // Limpiar inputs
            setNewComment('');
            setContactMedium('whatsapp');
            
            // Notificar al componente padre
            if (onContactAdded) {
                onContactAdded();
            }
        } catch (error) {
            console.error('Error adding contact:', error);
            alert('Error al agregar el contacto. Por favor, intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Editar contacto
    const handleEditContact = async (contactIndex, newText) => {
        if (!newText.trim() || !customer) return;

        try {
            const contactData = {
                contact_index: contactIndex,
                comment: newText.trim()
            };

            await crmService.updateContact(customer.id, contactData);
            
            // Recargar historial
            await loadContactHistory();
            
            // Cerrar modo edición
            setEditingContact(null);
            
            // Notificar al componente padre
            if (onContactAdded) {
                onContactAdded();
            }
        } catch (error) {
            console.error('Error updating contact:', error);
            alert('Error al actualizar el contacto. Por favor, intenta nuevamente.');
        }
    };

    // Eliminar contacto
    const handleDeleteContact = async () => {
        if (!contactToDelete === null) return;

        try {
            await crmService.deleteContact(customer.id, contactToDelete);
            
            // Recargar historial
            await loadContactHistory();
            
            // Notificar al componente padre
            if (onContactAdded) {
                onContactAdded();
            }
            
            // Cerrar modal y limpiar
            setShowDeleteModal(false);
            setContactToDelete(null);
        } catch (error) {
            console.error('Error deleting contact:', error);
            alert('Error al eliminar el contacto. Por favor, intenta nuevamente.');
            setShowDeleteModal(false);
            setContactToDelete(null);
        }
    };

    // Abrir modal de confirmación
    const openDeleteModal = (contactIndex) => {
        setContactToDelete(contactIndex);
        setShowDeleteModal(true);
    };

    // Cancelar eliminación
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setContactToDelete(null);
    };

    if (!isOpen || !customer) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <FaUser className="text-[#18c29c]" />
                                Detalles del Cliente
                            </h3>
                            <p className="text-gray-600 mt-1">
                                {customer.display_name || customer.full_name || `${customer.first_name} ${customer.last_name}` || 'Sin nombre'}
                            </p>
                        </div>
                        {readOnly && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Modo solo lectura:</strong> Para mas Información, ve al módulo de CRM.
                                </p>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Información básica */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Información del Cliente</h4>
                            <div className="grid md:grid-cols-2 gap-3 text-sm">
                                {customer.email && (
                                    <div>
                                        <span className="text-gray-600">Email:</span>
                                        <p className="font-medium text-gray-900">{customer.email}</p>
                                    </div>
                                )}
                                {customer.phone && (
                                    <div>
                                        <span className="text-gray-600">Teléfono:</span>
                                        <p className="font-medium text-gray-900">{customer.phone}</p>
                                    </div>
                                )}
                                {customer.cuit && (
                                    <div>
                                        <span className="text-gray-600">CUIT:</span>
                                        <p className="font-medium text-gray-900 font-mono">{customer.cuit}</p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-600">Tipo:</span>
                                    <p className="font-medium text-gray-900">
                                        {customer.customer_type === 'person' ? 'Persona Física' : 'Empresa'}
                                    </p>
                                </div>
                                {customer.customer_type === 'person' && customer.date_of_birth && (
                                    <div>
                                        <span className="text-gray-600">Fecha de Nacimiento:</span>
                                        <p className="font-medium text-gray-900">
                                            {formatDateLong(customer.date_of_birth)}
                                        </p>
                                    </div>
                                )}
                                {(customer.address || customer.city) && (
                                    <div className="md:col-span-2">
                                        <span className="text-gray-600">Ubicación:</span>
                                        <div className="font-medium text-gray-900">
                                            {customer.address && <p>{customer.address}</p>}
                                            <p>
                                                {customer.city && `${customer.city}, `}
                                                {customer.state || customer.country}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comentario Principal */}
                        {customer.comments && (
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <FaComment className="text-blue-600" />
                                    <h4 className="font-semibold text-blue-900">Comentario Principal</h4>
                                </div>
                                <p className="text-sm text-blue-800">{customer.comments}</p>
                            </div>
                        )}

                        {/* Historial de Actividad */}
                        {(customer.last_purchase_date || customer.last_contact_date) && (
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <FaCalendarAlt className="text-green-600" />
                                    <h4 className="font-semibold text-green-900">Historial de Actividad</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    {customer.last_purchase_date && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-green-700">Última compra:</span>
                                            <span className="font-medium text-green-900">
                                                {formatDateTime(customer.last_purchase_date)}
                                            </span>
                                        </div>
                                    )}
                                    {customer.last_contact_date && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-green-700">Último contacto:</span>
                                            <span className="font-medium text-green-900">
                                                {formatDateTime(customer.last_contact_date)}
                                            </span>
                                        </div>
                                    )}
                                    {customer.total_spent !== undefined && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-green-700">Total gastado:</span>
                                            <span className="font-medium text-green-900">
                                                {new Intl.NumberFormat('es-AR', {
                                                    style: 'currency',
                                                    currency: 'ARS'
                                                }).format(customer.total_spent)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Historial de Contactos */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaCommentDots className="text-[#18c29c]" />
                                    <h4 className="font-semibold text-gray-900">Historial de Contactos</h4>
                                    <span className="ml-auto text-sm text-gray-500">
                                        {contactHistory.length} contacto(s)
                                    </span>
                                </div>                                
                                
                                {/* Agregar nuevo contacto */}
                                {!readOnly && (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <select
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-sm text-gray-900 bg-white"
                                                value={contactMedium}
                                                onChange={(e) => setContactMedium(e.target.value)}
                                                disabled={isSubmitting}
                                            >
                                                {contactMediums.map(medium => (
                                                    <option key={medium.value} value={medium.value}>
                                                        {medium.icon} {medium.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Agregar nuevo contacto..."
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-sm text-gray-900"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleAddContact();
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                            />
                                            <button
                                                onClick={handleAddContact}
                                                disabled={!newComment.trim() || isSubmitting}
                                                className="px-4 py-2 bg-[#18c29c] text-white rounded-lg hover:bg-[#15a884] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <FaSpinner className="animate-spin text-sm" />
                                                ) : (
                                                    <FaSave className="text-sm" />
                                                )}
                                                Agregar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Lista de contactos */}
                            <div className="p-4">
                                {loading ? (
                                    <div className="text-center py-8">
                                        <FaSpinner className="animate-spin mx-auto h-8 w-8 text-[#18c29c] mb-2" />
                                        <p className="text-sm text-gray-600">Cargando contactos...</p>
                                    </div>
                                ) : contactHistory.length > 0 ? (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {contactHistory.map((contact, index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                {editingContact === index ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            id={`textarea-${index}`}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18c29c] focus:border-transparent text-sm text-gray-900"
                                                            rows="3"
                                                            defaultValue={contact.comment}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    const textarea = document.getElementById(`textarea-${index}`);
                                                                    handleEditContact(index, textarea.value);
                                                                }}
                                                                className="px-3 py-1 bg-[#18c29c] text-white rounded text-sm hover:bg-[#15a884] transition-colors flex items-center gap-1"
                                                            >
                                                                <FaSave className="text-xs" />
                                                                Guardar
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingContact(null)}
                                                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors flex items-center gap-1"
                                                            >
                                                                <FaTimes className="text-xs" />
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="text-sm text-gray-900 flex-1">{contact.comment}</p>
                                                            {!readOnly && (
                                                                <div className="flex items-center gap-1 ml-2">
                                                                    <button
                                                                        onClick={() => setEditingContact(index)}
                                                                        className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                                                        title="Editar contacto"
                                                                    >
                                                                        <FaEdit className="text-xs" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => openDeleteModal(index)}
                                                                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                                        title="Eliminar contacto"
                                                                    >
                                                                        <FaTrash className="text-xs" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs text-gray-500 flex-wrap gap-2">
                                                            <div className="flex items-center gap-1">
                                                                <FaCalendarAlt className="text-gray-400" />
                                                                <span>{formatDateTime(contact.date)}</span>
                                                            </div>
                                                            {contact.medium && (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                                        {contactMediums.find(m => m.value === contact.medium)?.icon || '📝'}{' '}
                                                                        {contactMediums.find(m => m.value === contact.medium)?.label || contact.medium}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-1">
                                                                <FaUser className="text-gray-400" />
                                                                <span>{contact.user || 'Sistema'}</span>
                                                            </div>
                                                        </div>
                                                        {contact.edited_date && (
                                                            <div className="text-xs text-gray-400 mt-2 italic">
                                                                Editado: {formatDateTime(contact.edited_date)} por {contact.edited_by}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <FaComment className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                                        <p className="text-sm">No hay contactos registrados</p>
                                        <p className="text-xs mt-1">Agrega el primer contacto arriba</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <FaTrash className="text-red-600 text-lg" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Eliminar Contacto</h3>
                                    <p className="text-sm text-gray-600 mt-1">Esta acción no se puede deshacer</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                ¿Estás seguro de que deseas eliminar este contacto del historial?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={cancelDelete}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteContact}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
