"use client";
import { useState, useEffect } from 'react';
import useApiMethods from '@/hooks/useApiMethods';
import statsService from '@/services/statsService';

const SalesChart = ({ dateFrom = null, dateTo = null }) => {
    const [period, setPeriod] = useState('month');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hovered, setHovered] = useState(null);
    const apiMethods = useApiMethods();

    useEffect(() => {
        if (apiMethods) statsService.initialize(apiMethods);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (statsService.apiMethods) loadChartData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period, dateFrom, dateTo]);

    const loadChartData = async () => {
        try {
            setLoading(true);
            setError(null);
            const chartData = await statsService.getSalesChart(period, dateFrom, dateTo);
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

    const W = 900;
    const H = 200;
    const pad = { top: 24, right: 24, bottom: 36, left: 60 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    const maxSales = data.length > 0 ? Math.max(...data.map(d => d.sales), 1) : 1;

    const yFmt = (v) => {
        if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
        if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
        return `$${v}`;
    };

    const pts = data.map((d, i) => ({
        x: data.length === 1 ? pad.left + chartW / 2 : pad.left + (i / (data.length - 1)) * chartW,
        y: pad.top + chartH - (d.sales / maxSales) * chartH,
        ...d,
    }));

    const linePath = pts.reduce((acc, p, i) => {
        if (i === 0) return `M ${p.x},${p.y}`;
        const prev = pts[i - 1];
        const cx = (prev.x + p.x) / 2;
        return `${acc} C ${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
    }, '');

    const areaPath = pts.length > 0
        ? `${linePath} L ${pts[pts.length - 1].x},${pad.top + chartH} L ${pts[0].x},${pad.top + chartH} Z`
        : '';

    const yTicks = [0, 0.25, 0.5, 0.75, 1];

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Ventas</h3>
                    <p className="text-sm text-gray-500">Evolución de ventas y órdenes</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPeriod('month')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            period === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Semanal
                    </button>
                    <button
                        onClick={() => setPeriod('year')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            period === 'year' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Anual
                    </button>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                    Sin datos para el período seleccionado
                </div>
            ) : (
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    className="w-full h-64"
                    onMouseLeave={() => setHovered(null)}
                >
                    <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines + Y labels */}
                    {yTicks.map((t) => {
                        const y = pad.top + chartH - t * chartH;
                        return (
                            <g key={t}>
                                <line
                                    x1={pad.left} y1={y} x2={pad.left + chartW} y2={y}
                                    stroke="#f0f0f0" strokeWidth="1"
                                />
                                <text
                                    x={pad.left - 6} y={y + 4}
                                    textAnchor="end" fontSize="10" fill="#9ca3af"
                                >
                                    {yFmt(maxSales * t)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Area fill */}
                    {areaPath && (
                        <path d={areaPath} fill="url(#areaGrad)" />
                    )}

                    {/* Line */}
                    {linePath && (
                        <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    )}

                    {/* Points + tooltips */}
                    {pts.map((p, i) => {
                        const isHov = hovered === i;
                        const ttW = 110;
                        const ttH = 44;
                        const ttX = Math.min(Math.max(p.x - ttW / 2, pad.left), pad.left + chartW - ttW);
                        const ttY = p.y - ttH - 10;
                        const showBelow = ttY < pad.top;
                        const ttYFinal = showBelow ? p.y + 14 : ttY;

                        return (
                            <g key={i} onMouseEnter={() => setHovered(i)} style={{ cursor: 'default' }}>
                                {/* Invisible large hit area */}
                                <circle cx={p.x} cy={p.y} r={18} fill="transparent" />

                                {/* Vertical rule on hover */}
                                {isHov && (
                                    <line
                                        x1={p.x} y1={pad.top} x2={p.x} y2={pad.top + chartH}
                                        stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"
                                    />
                                )}

                                {/* Dot */}
                                <circle
                                    cx={p.x} cy={p.y}
                                    r={isHov ? 5 : 3.5}
                                    fill="#3b82f6"
                                    stroke="white"
                                    strokeWidth="2"
                                    style={{ transition: 'r 0.15s' }}
                                />

                                {/* Tooltip */}
                                {isHov && (
                                    <g>
                                        <rect
                                            x={ttX} y={ttYFinal}
                                            width={ttW} height={ttH}
                                            rx="6" fill="#111827"
                                        />
                                        <text x={ttX + ttW / 2} y={ttYFinal + 16} textAnchor="middle" fontSize="11" fill="white" fontWeight="600">
                                            {yFmt(p.sales)}
                                        </text>
                                        <text x={ttX + ttW / 2} y={ttYFinal + 31} textAnchor="middle" fontSize="10" fill="#9ca3af">
                                            {p.orders} órdenes
                                        </text>
                                    </g>
                                )}

                                {/* X-axis label */}
                                <text
                                    x={p.x} y={pad.top + chartH + 18}
                                    textAnchor="middle" fontSize="9" fill="#6b7280"
                                >
                                    {p.day}
                                </text>
                            </g>
                        );
                    })}

                    {/* Axes */}
                    <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + chartH} stroke="#e5e7eb" strokeWidth="1" />
                    <line x1={pad.left} y1={pad.top + chartH} x2={pad.left + chartW} y2={pad.top + chartH} stroke="#e5e7eb" strokeWidth="1" />
                </svg>
            )}

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" /></svg>
                    <span className="text-gray-600">Ventas totales</span>
                </div>
            </div>
        </div>
    );
};

export default SalesChart;
