"use client";

const StatCard = ({ title, value, subtitle, icon, trend, trendValue, color = "blue" }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        yellow: "bg-yellow-50 text-yellow-600",
        red: "bg-red-50 text-red-600",
        purple: "bg-purple-50 text-purple-600",
        indigo: "bg-indigo-50 text-indigo-600"
    };

    const trendColors = {
        up: "text-green-600",
        down: "text-red-600",
        neutral: "text-gray-600"
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
                    {subtitle && (
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                    {trend && trendValue && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trendColors[trend]}`}>
                            {trend === 'up' && <span>↑</span>}
                            {trend === 'down' && <span>↓</span>}
                            {trend === 'neutral' && <span>→</span>}
                            <span className="font-medium">{trendValue}</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
