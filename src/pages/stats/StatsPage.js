"use client";
import { useState, useEffect } from 'react';
import SideBar from '@/components/ui/SideBar';
import StatCard from '@/components/admin/StatCard';
import SalesChart from '@/components/admin/SalesChart';
import TopProductsTable from '@/components/admin/TopProductsTable';
import StockAlertsTable from '@/components/admin/StockAlertsTable';
import useApiMethods from '@/hooks/useApiMethods';
import statsService from '@/services/statsService';

const StatsPage = () => {
    const [stats, setStats] = useState(null);
    const [salesByChannel, setSalesByChannel] = useState([]);
    const [orderStatus, setOrderStatus] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiMethods = useApiMethods();

    useEffect(() => {
        if (apiMethods) {
            statsService.initialize(apiMethods);
            loadAllStats();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Solo ejecutar una vez al montar

    const loadAllStats = async () => {
        try {
            setLoading(true);
            const [overview, channelData, statusData] = await Promise.all([
                statsService.getStatsOverview(),
                statsService.getSalesByChannel(),
                statsService.getOrderStatusSummary()
            ]);
            
            setStats(overview);
            setSalesByChannel(channelData);
            setOrderStatus(statusData);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Iconos SVG para las cards
    const icons = {
        sales: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
        orders: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
        purchases: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        customers: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        inventory: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
        alert: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        )
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <SideBar
                    onProfile={() => window.location.href = "/profile"}
                    onSupport={() => alert("Funcionalidad en desarrollo")}
                    onLogout={() => alert("Funcionalidad en desarrollo")}
                />
                <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">                    
            <SideBar
                onProfile={() => window.location.href = "/profile"}
                onSupport={() => alert("Funcionalidad en desarrollo")}
                onLogout={() => alert("Funcionalidad en desarrollo")}
            />
            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard de Estadísticas</h1>
                    <p className="text-gray-600 mt-2">Resumen ejecutivo de tu negocio</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Ventas Totales"
                        value={stats?.total_sales?.formatted || '$0'}
                        subtitle="Este mes"
                        icon={icons.sales}
                        trend={stats?.total_sales?.trend || 'neutral'}
                        trendValue={`${stats?.total_sales?.trend_value || '0%'} vs mes anterior`}
                        color="green"
                    />
                    <StatCard
                        title="Órdenes de Venta"
                        value={stats?.total_orders?.value?.toString() || '0'}
                        subtitle="Órdenes de venta"
                        icon={icons.orders}
                        trend={stats?.total_orders?.trend || 'neutral'}
                        trendValue={stats?.total_orders?.trend_value || '0%'}
                        color="blue"
                    />
                    <StatCard
                        title="Compras Totales"
                        value={stats?.total_purchases?.formatted || '$0'}
                        subtitle="Este mes"
                        icon={icons.purchases}
                        trend={stats?.total_purchases?.trend || 'neutral'}
                        trendValue={stats?.total_purchases?.trend_value || '0%'}
                        color="purple"
                    />
                    <StatCard
                        title="Clientes"
                        value={stats?.total_customers?.value?.toString() || '0'}
                        subtitle="Clientes activos"
                        icon={icons.customers}
                        trend={stats?.total_customers?.trend || 'neutral'}
                        trendValue={stats?.total_customers?.trend_value || '+0 nuevos'}
                        color="indigo"
                    />
                    <StatCard
                        title="Valor Inventario"
                        value={stats?.inventory_value?.formatted || '$0'}
                        subtitle="Valor en stock"
                        icon={icons.inventory}
                        trend="neutral"
                        trendValue="Actualizado"
                        color="blue"
                    />
                    <StatCard
                        title="Stock Bajo"
                        value={stats?.low_stock_products?.value?.toString() || '0'}
                        subtitle="Productos bajo mínimo"
                        icon={icons.alert}
                        trend={stats?.low_stock_products?.trend || 'neutral'}
                        trendValue={stats?.low_stock_products?.trend_value || 'Todo OK'}
                        color="red"
                    />
                </div>

                {/* Sales Chart */}
                <div className="mb-8">
                    <SalesChart />
                </div>

                {/* Tables Grid */}
                <div className=" mb-8">
                    <TopProductsTable />
                </div>
                 <div className=" mb-8">

                    <StockAlertsTable />
                 </div>

                {/* Additional Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Sales by Channel */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Canal</h3>
                        <div className="space-y-4">
                            {salesByChannel.length > 0 ? (
                                salesByChannel.map((channel, index) => (
                                    <div key={index}>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-600">{channel.channel}</span>
                                            <span className="font-semibold text-gray-900">{channel.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full ${
                                                    index === 0 ? 'bg-blue-600' : 
                                                    index === 1 ? 'bg-green-600' : 
                                                    'bg-purple-600'
                                                }`}
                                                style={{ width: `${channel.percentage}%` }} 
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No hay datos disponibles</p>
                            )}
                        </div>
                    </div>

                    {/* Order Status */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Órdenes</h3>
                        <div className="space-y-3">
                            {orderStatus.length > 0 ? (
                                orderStatus
                                    .filter(s => ['pending', 'processing', 'completed'].includes(s.status))
                                    .map((status, index) => {
                                        const colorMap = {
                                            pending: 'bg-yellow-500',
                                            processing: 'bg-blue-500',
                                            completed: 'bg-green-500'
                                        };
                                        return (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${colorMap[status.status] || 'bg-gray-500'}`} />
                                                    <span className="text-sm text-gray-700">{status.status_display}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{status.count}</span>
                                            </div>
                                        );
                                    })
                            ) : (
                                <p className="text-sm text-gray-500">No hay datos disponibles</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">Nueva venta completada</p>
                                    <p className="text-xs text-gray-500">Hace 5 minutos</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">Orden de compra recibida</p>
                                    <p className="text-xs text-gray-500">Hace 1 hora</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">Alerta de stock bajo</p>
                                    <p className="text-xs text-gray-500">Hace 2 horas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default StatsPage;