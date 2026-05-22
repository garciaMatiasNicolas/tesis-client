"use client";
import { useState, useEffect } from 'react';
import SideBar from '@/components/ui/SideBar';
import StatCard from '@/components/admin/StatCard';
import SalesChart from '@/components/admin/SalesChart';
import TopProductsTable from '@/components/admin/TopProductsTable';
import StockAlertsTable from '@/components/admin/StockAlertsTable';
import useApiMethods from '@/hooks/useApiMethods';
import statsService from '@/services/statsService';

// ─── Date preset helpers ────────────────────────────────────────────────────

const PRESETS = [
    { key: 'this_month',    label: 'Este mes' },
    { key: 'last_month',    label: 'Mes anterior' },
    { key: 'last_3_months', label: 'Últimos 3 meses' },
    { key: 'this_year',     label: 'Este año' },
    { key: 'custom',        label: 'Personalizado' },
];

const pad = (n) => n.toString().padStart(2, '0');
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function getPresetRange(preset) {
    const today = new Date();
    switch (preset) {
        case 'this_month':
            return { from: fmtDate(new Date(today.getFullYear(), today.getMonth(), 1)), to: fmtDate(today) };
        case 'last_month': {
            const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const to   = new Date(today.getFullYear(), today.getMonth(), 0);
            return { from: fmtDate(from), to: fmtDate(to) };
        }
        case 'last_3_months':
            return { from: fmtDate(new Date(today.getFullYear(), today.getMonth() - 3, 1)), to: fmtDate(today) };
        case 'this_year':
            return { from: fmtDate(new Date(today.getFullYear(), 0, 1)), to: fmtDate(today) };
        default:
            return null;
    }
}

// ─── Icons ──────────────────────────────────────────────────────────────────

const ICONS = {
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
    ),
};

// ─── Component ───────────────────────────────────────────────────────────────

const StatsPage = () => {
    const initialRange = getPresetRange('this_month');

    // ── Date filter state
    const [selectedPreset,  setSelectedPreset]  = useState('this_month');
    const [customFrom,      setCustomFrom]      = useState('');
    const [customTo,        setCustomTo]        = useState('');
    const [activeDateFrom,  setActiveDateFrom]  = useState(initialRange.from);
    const [activeDateTo,    setActiveDateTo]    = useState(initialRange.to);

    // ── Comparison mode
    const [comparisonMode, setComparisonMode] = useState('previous_period');

    // ── Group filter state
    const [filterOptions,   setFilterOptions]   = useState({ categories: [], subcategories: [], products: [], suppliers: [] });
    const [selCategory,     setSelCategory]     = useState('');
    const [selSubcategory,  setSelSubcategory]  = useState('');
    const [selProduct,      setSelProduct]      = useState('');
    const [selSupplier,     setSelSupplier]     = useState('');

    // ── Data state
    const [stats,          setStats]          = useState(null);
    const [salesByChannel, setSalesByChannel] = useState([]);
    const [orderStatus,    setOrderStatus]    = useState([]);
    const [loading,        setLoading]        = useState(true);

    const apiMethods = useApiMethods();

    // Initialize service once
    useEffect(() => {
        if (apiMethods) {
            statsService.initialize(apiMethods);
            loadFilterOptions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reload KPIs whenever dates, group filter, or comparison mode change
    useEffect(() => {
        if (apiMethods) {
            statsService.initialize(apiMethods);
            loadAllStats();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeDateFrom, activeDateTo, selCategory, selSubcategory, selProduct, selSupplier, comparisonMode]);

    // Reload subcategories when category changes
    useEffect(() => {
        setSelSubcategory('');
        setSelProduct('');
        if (statsService.apiMethods) loadFilterOptions(selCategory, '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selCategory]);

    // Reload products when subcategory changes
    useEffect(() => {
        setSelProduct('');
        if (statsService.apiMethods) loadFilterOptions(selCategory, selSubcategory);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selSubcategory]);

    const groupFilter = {
        categoryId:    selCategory    || null,
        subcategoryId: selSubcategory || null,
        productId:     selProduct     || null,
        supplierId:    selSupplier    || null,
    };

    const loadFilterOptions = async (catId = selCategory, subId = selSubcategory) => {
        try {
            const opts = await statsService.getFilterOptions(catId || null, subId || null);
            setFilterOptions(opts);
        } catch (e) {
            console.error('Error loading filter options:', e);
        }
    };

    const loadAllStats = async () => {
        try {
            setLoading(true);
            const [overview, channelData, statusData] = await Promise.all([
                statsService.getStatsOverview(activeDateFrom, activeDateTo, groupFilter, comparisonMode),
                statsService.getSalesByChannel(activeDateFrom, activeDateTo, groupFilter),
                statsService.getOrderStatusSummary(activeDateFrom, activeDateTo, groupFilter),
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

    // ── Date preset handlers
    const handlePresetChange = (preset) => {
        setSelectedPreset(preset);
        if (preset !== 'custom') {
            const range = getPresetRange(preset);
            setActiveDateFrom(range.from);
            setActiveDateTo(range.to);
        }
    };

    const applyCustomDates = () => {
        if (customFrom && customTo && customFrom <= customTo) {
            setActiveDateFrom(customFrom);
            setActiveDateTo(customTo);
        }
    };

    // ── Clear all group filters
    const clearGroupFilter = () => {
        setSelCategory('');
        setSelSubcategory('');
        setSelProduct('');
        setSelSupplier('');
    };

    const hasGroupFilter = selCategory || selSubcategory || selProduct || selSupplier;

    // ── Period label for subtitles
    const periodLabel = (() => {
        if (selectedPreset !== 'custom') {
            return PRESETS.find(p => p.key === selectedPreset)?.label ?? '';
        }
        if (activeDateFrom && activeDateTo) {
            const fmt = (s) => { const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };
            return `${fmt(activeDateFrom)} – ${fmt(activeDateTo)}`;
        }
        return 'Período personalizado';
    })();

    const comparisonLabel = comparisonMode === 'same_period_last_year'
        ? 'mismo período año anterior'
        : 'período anterior';

    // ── Loading skeleton
    if (loading && !stats) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <SideBar
                    onProfile={() => window.location.href = '/profile'}
                    onSupport={() => alert('Funcionalidad en desarrollo')}
                    onLogout={() => alert('Funcionalidad en desarrollo')}
                />
                <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-12 bg-gray-100 rounded mb-3"></div>
                        <div className="h-10 bg-gray-100 rounded mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-gray-200 rounded" />)}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <SideBar
                onProfile={() => window.location.href = '/profile'}
                onSupport={() => alert('Funcionalidad en desarrollo')}
                onLogout={() => alert('Funcionalidad en desarrollo')}
            />
            <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">

                {/* Header */}
                <div className="mb-5">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard de Estadísticas</h1>
                    <p className="text-gray-500 mt-1 text-sm">Resumen ejecutivo de tu negocio</p>
                </div>

                {/* ── Date filter bar ────────────────────────────────────── */}
                <div className="bg-white rounded-lg shadow-sm px-4 py-3 mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">Período</span>
                    {PRESETS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => handlePresetChange(key)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                selectedPreset === key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {label}
                        </button>
                    ))}

                    {selectedPreset === 'custom' && (
                        <div className="flex items-center gap-2 ml-2 flex-wrap">
                            <input type="date" value={customFrom}
                                onChange={e => setCustomFrom(e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-400 text-sm">hasta</span>
                            <input type="date" value={customTo} min={customFrom}
                                onChange={e => setCustomTo(e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button onClick={applyCustomDates}
                                disabled={!customFrom || !customTo || customFrom > customTo}
                                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Aplicar
                            </button>
                        </div>
                    )}

                    {/* Comparison mode toggle */}
                    <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setComparisonMode('previous_period')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                comparisonMode === 'previous_period'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Período anterior
                        </button>
                        <button
                            onClick={() => setComparisonMode('same_period_last_year')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                comparisonMode === 'same_period_last_year'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Mismo período año ant.
                        </button>
                    </div>
                </div>

                {/* ── Group filter bar ───────────────────────────────────── */}
                <div className="bg-white rounded-lg shadow-sm px-4 py-3 mb-6 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Filtrar por</span>

                    {/* Supplier — independent */}
                    <select
                        value={selSupplier}
                        onChange={e => { setSelSupplier(e.target.value); clearGroupFilter(); setSelSupplier(e.target.value); }}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todos los proveedores</option>
                        {filterOptions.suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>

                    <span className="text-gray-300 text-sm">|</span>

                    {/* Category */}
                    <select
                        value={selCategory}
                        onChange={e => { setSelSupplier(''); setSelCategory(e.target.value); }}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todas las categorías</option>
                        {filterOptions.categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {/* Subcategory — only useful once a category is selected */}
                    <select
                        value={selSubcategory}
                        onChange={e => setSelSubcategory(e.target.value)}
                        disabled={!selCategory}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                    >
                        <option value="">Todas las subcategorías</option>
                        {filterOptions.subcategories.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>

                    {/* Product */}
                    <select
                        value={selProduct}
                        onChange={e => setSelProduct(e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todos los productos</option>
                        {filterOptions.products.map(p => (
                            <option key={p.id} value={p.id}>{p.description} ({p.sku})</option>
                        ))}
                    </select>

                    {hasGroupFilter && (
                        <button
                            onClick={clearGroupFilter}
                            className="ml-1 text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                            × Limpiar filtros
                        </button>
                    )}

                    {loading && (
                        <span className="ml-auto text-xs text-gray-400 animate-pulse">Actualizando…</span>
                    )}
                </div>

                {/* ── KPI Cards ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Ventas Totales"
                        value={stats?.total_sales?.formatted || '$0'}
                        subtitle={periodLabel}
                        icon={ICONS.sales}
                        trend={stats?.total_sales?.trend || 'neutral'}
                        trendValue={`${stats?.total_sales?.trend_value || '0%'} vs ${comparisonLabel}`}
                        color="green"
                    />
                    <StatCard
                        title="Órdenes de Venta"
                        value={stats?.total_orders?.value?.toString() || '0'}
                        subtitle={periodLabel}
                        icon={ICONS.orders}
                        trend={stats?.total_orders?.trend || 'neutral'}
                        trendValue={`${stats?.total_orders?.trend_value || '0%'} vs ${comparisonLabel}`}
                        color="blue"
                    />
                    <StatCard
                        title="Compras Totales"
                        value={stats?.total_purchases?.formatted || '$0'}
                        subtitle={periodLabel}
                        icon={ICONS.purchases}
                        trend={stats?.total_purchases?.trend || 'neutral'}
                        trendValue={`${stats?.total_purchases?.trend_value || '0%'} vs ${comparisonLabel}`}
                        color="purple"
                    />
                    <StatCard
                        title="Nuevos Clientes"
                        value={stats?.total_customers?.value?.toString() || '0'}
                        subtitle={periodLabel}
                        icon={ICONS.customers}
                        trend={stats?.total_customers?.trend || 'neutral'}
                        trendValue={`${stats?.total_customers?.trend_value || '+0 nuevos registros'} vs ${comparisonLabel}`}
                        color="indigo"
                    />
                    <StatCard
                        title="Valor Inventario"
                        value={stats?.inventory_value?.formatted || '$0'}
                        subtitle="Stock actual"
                        icon={ICONS.inventory}
                        trend="neutral"
                        trendValue="Al día de hoy"
                        color="blue"
                    />
                    <StatCard
                        title="Stock Bajo"
                        value={stats?.low_stock_products?.value?.toString() || '0'}
                        subtitle="Productos bajo mínimo"
                        icon={ICONS.alert}
                        trend={stats?.low_stock_products?.trend || 'neutral'}
                        trendValue={stats?.low_stock_products?.trend_value || 'Todo OK'}
                        color="red"
                    />
                </div>

                {/* Tables */}
                <div className="mb-8">
                    <TopProductsTable dateFrom={activeDateFrom} dateTo={activeDateTo} groupFilter={groupFilter} />
                </div>
                <div className="mb-8">
                    <StockAlertsTable />
                </div>

                {/* ── Channel / Status / Activity row ──────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Sales by channel */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-0.5">Ventas por Canal</h3>
                        <p className="text-xs text-gray-400 mb-4">{periodLabel}</p>
                        <div className="space-y-4">
                            {salesByChannel.length > 0 ? salesByChannel.map((channel, i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between text-sm mb-1.5">
                                        <span className="text-gray-600">{channel.channel}</span>
                                        <span className="font-semibold text-gray-900">{channel.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-green-600' : 'bg-purple-600'}`}
                                            style={{ width: `${channel.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )) : <p className="text-sm text-gray-400">Sin datos para este período</p>}
                        </div>
                    </div>

                    {/* Order status */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-0.5">Estado de Órdenes</h3>
                        <p className="text-xs text-gray-400 mb-4">{periodLabel}</p>
                        <div className="space-y-3">
                            {orderStatus.length > 0 ? (
                                orderStatus
                                    .filter(s => ['pending', 'processing', 'completed'].includes(s.status))
                                    .map((s, i) => {
                                        const colorMap = { pending: 'bg-yellow-500', processing: 'bg-blue-500', completed: 'bg-green-500' };
                                        return (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${colorMap[s.status] || 'bg-gray-400'}`} />
                                                    <span className="text-sm text-gray-700">{s.status_display}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{s.count}</span>
                                            </div>
                                        );
                                    })
                            ) : <p className="text-sm text-gray-400">Sin datos para este período</p>}
                        </div>
                    </div>

                    {/* Recent activity (static placeholder) */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                                <div>
                                    <p className="text-sm text-gray-900">Nueva venta completada</p>
                                    <p className="text-xs text-gray-400">Hace 5 minutos</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                                <div>
                                    <p className="text-sm text-gray-900">Orden de compra recibida</p>
                                    <p className="text-xs text-gray-400">Hace 1 hora</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                                <div>
                                    <p className="text-sm text-gray-900">Alerta de stock bajo</p>
                                    <p className="text-xs text-gray-400">Hace 2 horas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales Chart — connected to date filter */}
                <div className="mb-8">
                    <SalesChart dateFrom={activeDateFrom} dateTo={activeDateTo} />
                </div>

            </main>
        </div>
    );
};

export default StatsPage;
