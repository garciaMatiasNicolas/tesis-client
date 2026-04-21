"use client";
import { useState, useEffect } from 'react';
import useApiMethods from '@/hooks/useApiMethods';
import statsService from '@/services/statsService';

const TopProductsTable = () => {
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiMethods = useApiMethods();

    useEffect(() => {
        if (apiMethods) {
            statsService.initialize(apiMethods);
            loadTopProducts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Solo ejecutar una vez al montar

    const loadTopProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const products = await statsService.getTopProducts(6);
            setTopProducts(products);
        } catch (err) {
            console.error('Error loading top products:', err);
            setError('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const getTrendIcon = (trend) => {
        if (trend === 'up') return <span className="text-green-600">↑</span>;
        if (trend === 'down') return <span className="text-red-600">↓</span>;
        return <span className="text-gray-600">→</span>;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
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
                <h3 className="text-lg font-semibold text-gray-900">Productos Más Vendidos</h3>
                <p className="text-sm text-gray-500 mt-1">Top 6 productos por ingresos del último mes</p>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                SKU
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Producto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Categoría
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Unidades
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ingresos
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tendencia
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {topProducts.length > 0 ? (
                            topProducts.map((product, index) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono text-gray-900">{product.sku}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-900 font-medium">{product.description}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="text-sm text-gray-900 font-semibold">{product.units_sold}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="text-sm text-gray-900 font-semibold">
                                            ${product.revenue.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-lg">
                                        {getTrendIcon(product.trend)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center">
                                    <p className="text-gray-500">No hay productos vendidos en este período</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopProductsTable;
