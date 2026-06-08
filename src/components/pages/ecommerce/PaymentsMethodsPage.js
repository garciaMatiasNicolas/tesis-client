"use client";
import React, { useState, useEffect } from 'react';
import {
    FaPlus,
    FaCreditCard,
    FaCheckCircle,
    FaFlask,
    FaSpinner,
    FaExclamationTriangle,
    FaMoneyBillWave,
} from 'react-icons/fa';
import SideBar from '@/components/ui/SideBar';
import Alert from '@/components/ui/Alert';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import PaymentMethodCard from '@/components/modules/ecommerce/PaymentMethodCard';
import PaymentMethodFormModal from '@/components/modules/ecommerce/PaymentMethodFormModal';
import useApiMethods from '@/hooks/useApiMethods';
import paymentMethodsService from '@/services/paymentMethodsService';

function StatCard({ icon: Icon, label, value, color = 'text-[#18c29c]', bg = 'bg-[#18c29c]/10' }) {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
                <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center`}>
                    <Icon className={`${color} text-xl`} />
                </div>
            </div>
        </div>
    );
}

export default function PaymentsMethodsPage() {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [methodToDelete, setMethodToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [alert, setAlert] = useState(null);

    const apiMethods = useApiMethods();

    useEffect(() => {
        if (apiMethods && !isInitialized) {
            paymentMethodsService.initialize(apiMethods);
            setIsInitialized(true);
        }
    }, [apiMethods, isInitialized]);

    useEffect(() => {
        const loadMethods = async () => {
            if (!isInitialized) return;
            try {
                setLoading(true);
                setError(null);
                const response = await paymentMethodsService.getPaymentMethods();
                const list = Array.isArray(response)
                    ? response
                    : response?.results || [];
                setPaymentMethods(list);
            } catch (err) {
                console.error('Error loading payment methods:', err);
                setError('Error al cargar los métodos de pago. Por favor, intenta nuevamente.');
            } finally {
                setLoading(false);
            }
        };
        loadMethods();
    }, [isInitialized]);

    const showAlertMsg = (message, type = 'success') => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 5000);
    };

    const handleCreate = () => {
        setEditingMethod(null);
        setShowModal(true);
    };

    const handleEdit = (method) => {
        setEditingMethod(method);
        setShowModal(true);
    };

    const handleModalSubmit = async (formData) => {
        try {
            setModalLoading(true);
            if (editingMethod) {
                const updated = await paymentMethodsService.updatePaymentMethod(editingMethod.id, formData);
                setPaymentMethods((prev) =>
                    prev.map((m) => (m.id === editingMethod.id ? updated : m))
                );
                showAlertMsg('Método de pago actualizado exitosamente');
            } else {
                const created = await paymentMethodsService.createPaymentMethod(formData);
                setPaymentMethods((prev) => [created, ...prev]);
                showAlertMsg('Método de pago agregado exitosamente');
            }
            setShowModal(false);
            setEditingMethod(null);
        } catch (err) {
            console.error('Error saving payment method:', err);
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                'Error al guardar el método de pago. Verifica los datos e intenta nuevamente.';
            showAlertMsg(msg, 'danger');
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingMethod(null);
    };

    const handleDeleteClick = (method) => {
        setMethodToDelete(method);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!methodToDelete) return;
        try {
            setIsDeleting(true);
            await paymentMethodsService.deletePaymentMethod(methodToDelete.id);
            setPaymentMethods((prev) => prev.filter((m) => m.id !== methodToDelete.id));
            showAlertMsg('Método de pago eliminado exitosamente');
            setShowDeleteModal(false);
            setMethodToDelete(null);
        } catch (err) {
            console.error('Error deleting payment method:', err);
            showAlertMsg('Error al eliminar el método de pago', 'danger');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleActive = async (method) => {
        try {
            const updated = await paymentMethodsService.patchPaymentMethod(method.id, {
                is_active: !method.is_active,
            });
            setPaymentMethods((prev) =>
                prev.map((m) => (m.id === method.id ? updated : m))
            );
            showAlertMsg(
                updated.is_active
                    ? `"${method.name}" activado exitosamente`
                    : `"${method.name}" desactivado exitosamente`
            );
        } catch (err) {
            console.error('Error toggling payment method:', err);
            showAlertMsg('Error al actualizar el estado del método de pago', 'danger');
        }
    };

    const totalMethods = paymentMethods.length;
    const activeMethods = paymentMethods.filter((m) => m.is_active).length;
    const testMethods = paymentMethods.filter((m) => m.is_test_mode).length;
    const unconfiguredMethods = paymentMethods.filter(
        (m) => m.provider === 'mercadopago' && !m.public_key
    ).length;

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <SideBar
                onProfile={() => (window.location.href = '/profile')}
                onSupport={() => window.alert('Soporte')}
                onLogout={() => window.alert('Cerrar sesión')}
            />

            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                {alert && (
                    <div className="mb-4">
                        <Alert
                            message={alert.message}
                            type={alert.type}
                            onClose={() => setAlert(null)}
                        />
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Métodos de Pago</h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            Gestiona las pasarelas y formas de pago disponibles en tu tienda
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 bg-[#18c29c] text-white px-4 py-2 rounded-lg hover:bg-[#15a884] transition-colors text-sm font-medium flex-shrink-0"
                    >
                        <FaPlus className="text-sm" />
                        Agregar método
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        icon={FaCreditCard}
                        label="Total de métodos"
                        value={totalMethods}
                        color="text-gray-700"
                        bg="bg-gray-100"
                    />
                    <StatCard
                        icon={FaCheckCircle}
                        label="Métodos activos"
                        value={activeMethods}
                        color="text-[#18c29c]"
                        bg="bg-[#18c29c]/10"
                    />
                    <StatCard
                        icon={FaFlask}
                        label="En modo prueba"
                        value={testMethods}
                        color="text-amber-600"
                        bg="bg-amber-50"
                    />
                    <StatCard
                        icon={FaExclamationTriangle}
                        label="Sin credenciales"
                        value={unconfiguredMethods}
                        color="text-red-500"
                        bg="bg-red-50"
                    />
                </div>

                {/* Contenido */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <FaSpinner className="animate-spin text-4xl text-[#18c29c]" />
                        <span className="ml-3 text-lg text-gray-500">Cargando métodos de pago...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                        <strong className="font-semibold">Error: </strong>
                        <span>{error}</span>
                    </div>
                ) : paymentMethods.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaMoneyBillWave className="text-gray-400 text-2xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Sin métodos de pago configurados
                        </h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                            Agrega tu primera pasarela de pago para que los clientes puedan comprar en tu tienda.
                        </p>
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 bg-[#18c29c] text-white px-5 py-2.5 rounded-lg hover:bg-[#15a884] transition-colors text-sm font-medium"
                        >
                            <FaPlus />
                            Agregar primer método
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {paymentMethods.map((method) => (
                            <PaymentMethodCard
                                key={method.id}
                                method={method}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                onToggleActive={handleToggleActive}
                            />
                        ))}
                    </div>
                )}
            </main>

            <PaymentMethodFormModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSubmit={handleModalSubmit}
                loading={modalLoading}
                paymentMethod={editingMethod}
            />

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setMethodToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                itemName={methodToDelete?.name || ''}
                itemType="método de pago"
                isDeleting={isDeleting}
            />
        </div>
    );
}
