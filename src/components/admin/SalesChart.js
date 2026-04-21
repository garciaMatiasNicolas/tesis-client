"use client";
import { useState, useEffect } from 'react';
import useApiMethods from '@/hooks/useApiMethods';
import statsService from '@/services/statsService';

const SalesChart = () => {
    const [period, setPeriod] = useState('week');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiMethods = useApiMethods();

    useEffect(() => {
        if (apiMethods) {
            statsService.initialize(apiMethods);
            loadChartData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period]); // Solo recargar cuando cambia el período

    const loadChartData = async () => {
        try {
            setLoading(true);
            setError(null);
            const chartData = await statsService.getSalesChart(period);
            setData(chartData);
        } catch (err) {
            console.error('Error loading chart data:', err);
            setError('Error al cargar datos del gráfico');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
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

    const maxSales = data.length > 0 ? Math.max(...data.map(d => d.sales)) : 1;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Ventas</h3>
                    <p className="text-sm text-gray-500">Evolución de ventas y órdenes</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPeriod('week')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            period === 'week'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Semana
                    </button>
                    <button
                        onClick={() => setPeriod('month')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            period === 'month'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Mes
                    </button>
                    <button
                        onClick={() => setPeriod('year')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            period === 'year'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Año
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-64">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500 w-16">
                    <span>${(maxSales / 1000).toFixed(0)}k</span>
                    <span>${(maxSales * 0.75 / 1000).toFixed(0)}k</span>
                    <span>${(maxSales * 0.5 / 1000).toFixed(0)}k</span>
                    <span>${(maxSales * 0.25 / 1000).toFixed(0)}k</span>
                    <span>$0</span>
                </div>

                {/* Chart area */}
                <div className="absolute left-16 right-0 top-0 bottom-8 flex items-end justify-between gap-2 border-l border-b border-gray-200">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-full border-t border-gray-100" />
                        ))}
                    </div>

                    {/* Bars */}
                    {data.map((item, index) => {
                        const heightPercent = (item.sales / maxSales) * 100;
                        return (
                            <div
                                key={index}
                                className="flex-1 flex flex-col items-center group cursor-pointer"
                            >
                                <div className="relative w-full px-1">
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                                            <div className="font-semibold">${item.sales.toLocaleString()}</div>
                                            <div className="text-gray-300">{item.orders} órdenes</div>
                                        </div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                    </div>
                                    
                                    {/* Bar */}
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-300 hover:from-blue-700 hover:to-blue-500"
                                        style={{ height: `${heightPercent}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* X-axis labels */}
                <div className="absolute left-16 right-0 bottom-0 flex justify-between gap-2 text-xs text-gray-600 pt-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex-1 text-center">
                            {item.day}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-600" />
                    <span className="text-gray-600">Ventas totales</span>
                </div>
            </div>
        </div>
    );
};

export default SalesChart;
