"use client";
import { useState, useEffect } from 'react';
import useApiMethods from '@/hooks/useApiMethods';
import statsService from '@/services/statsService';

const StockAlertsTable = () => {
    const [stockAlerts, setStockAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiMethods = useApiMethods();

    useEffect(() => {
        if (apiMethods) {
            statsService.initialize(apiMethods);
            loadStockAlerts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Solo ejecutar una vez al montar

    const loadStockAlerts = async () => {
        try {
            setLoading(true);
            setError(null);
            const alerts = await statsService.getStockAlerts(5);
            setStockAlerts(alerts);
        } catch (err) {
            console.error('Error loading stock alerts:', err);
            setError('Error al cargar alertas de stock');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            critical: {
                bg: 'bg-red-100',
                text: 'text-red-700',
                label: 'Crítico'
            },
            warning: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                label: 'Advertencia'
            },
            low: {
                bg: 'bg-orange-100',
                text: 'text-orange-700',
                label: 'Bajo'
            }
        };

        const badge = badges[status];
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const getStockPercentage = (current, safety) => {
        return (current / safety) * 100;
    };

    const getLocationIcon = (type) => {
        if (type === 'warehouse') {
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            );
        }
        return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Alertas de Stock</h3>
                        <p className="text-sm text-gray-500 mt-1">Productos por debajo del stock de seguridad</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                        Ver Todo
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                SKU
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Producto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ubicación
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acción
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {stockAlerts.length > 0 ? (
                            stockAlerts.map((alert) => {
                                const percentage = getStockPercentage(alert.current_stock, alert.safety_stock);
                                return (
                                    <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono text-gray-900">{alert.sku}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900 font-medium">{alert.description}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                {getLocationIcon(alert.location_type)}
                                                <span>{alert.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-semibold text-gray-900">{Math.round(alert.current_stock)}</span>
                                                    <span className="text-gray-500">/ {Math.round(alert.safety_stock)}</span>
                                                </div>
                                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${
                                                            alert.status === 'critical' 
                                                                ? 'bg-red-600' 
                                                                : alert.status === 'warning' 
                                                                ? 'bg-yellow-500' 
                                                                : 'bg-orange-500'
                                                        }`}
                                                        style={{ width: `${Math.min(getStockPercentage(alert.current_stock, alert.safety_stock), 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {getStatusBadge(alert.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                                Reabastecer
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center">
                                    <p className="text-gray-500">✓ No hay productos con stock bajo</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockAlertsTable;
