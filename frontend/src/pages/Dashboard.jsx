import { useQuery } from '@tanstack/react-query';
import {
    DollarSign, ShoppingCart, Package, Users, TrendingUp,
    TrendingDown, AlertTriangle, Loader2
} from 'lucide-react';
import api from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import SalesChart from '@/components/dashboard/SalesChart';
import RevenueChart from '@/components/dashboard/RevenueChart';
import DigitalClock from '@/components/dashboard/DigitalClock';
import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
    const { isAuthenticated } = useAuth();
    const { currencySymbol } = useSettings();

    // Real-time data fetching
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        enabled: isAuthenticated,
        queryFn: async () => {
            const res = await api.get('/reports/dashboard-stats');
            return res.data.data;
        },
        refetchInterval: 10000,
    });

    const { data: recentOrders, isLoading: ordersLoading } = useQuery({
        queryKey: ['recent-orders'],
        enabled: isAuthenticated,
        queryFn: async () => {
            const res = await api.get('/sales/orders');
            return res.data.data.slice(0, 5);
        },
        refetchInterval: 10000,
    });

    const statusColors = {
        Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        Processing: 'bg-blue-100 text-blue-700 border-blue-200',
        Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    };

    const getStatStyle = (title) => {
        switch (title) {
            case 'Total Revenue': return { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-200' };
            case 'Total Sales': return { icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200' };
            case 'Products': return { icon: Package, color: 'text-violet-600', bg: 'bg-violet-50', border: 'hover:border-violet-200' };
            case 'Employees': return { icon: Users, color: 'text-orange-600', bg: 'bg-orange-50', border: 'hover:border-orange-200' };
            default: return { icon: Package, color: 'text-gray-600', bg: 'bg-gray-50', border: 'hover:border-gray-200' };
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Enterprise Dashboard</h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Real-time business intelligence and operations matrix.</p>
                </div>
                <div className="w-full md:w-auto">
                    <DigitalClock />
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {statsLoading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex flex-col justify-between">
                            <div className="flex justify-between">
                                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                                <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
                            </div>
                            <div className="w-24 h-8 bg-gray-200 rounded mt-4"></div>
                        </div>
                    ))
                ) : (
                    stats?.map((card) => {
                        const style = getStatStyle(card.title);
                        const Icon = style.icon;
                        return (
                            <div key={card.title} className={`bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ${style.border} group`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest">{card.title}</p>
                                        <h3 className="text-xl md:text-3xl font-black text-gray-900 mt-1 tabular-nums tracking-tight">
                                            {card.isCurrency && currencySymbol}
                                            {card.value.toLocaleString(undefined, { notation: card.isCurrency ? "compact" : "standard", compactDisplay: "short" })}
                                        </h3>
                                    </div>
                                    <div className={`p-2.5 md:p-3.5 ${style.bg} ${style.color} rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className={`flex items-center gap-1 px-2 py-0.5 md:py-1 rounded font-black text-[10px] md:text-xs uppercase border ${card.trend === 'up' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : card.trend === 'down' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                        {card.trend === 'up' ? <TrendingUp size={12} strokeWidth={3} /> : card.trend === 'down' ? <TrendingDown size={12} strokeWidth={3} /> : null}
                                        {card.change}
                                    </div>
                                    <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-tighter hidden sm:inline">vs last period</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm h-[350px] md:h-[450px]">
                    <SalesChart />
                </div>
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm h-[350px] md:h-[450px]">
                    <RevenueChart />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stock Alerts */}
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h3 className="text-base md:text-lg font-black text-gray-900 tracking-tight">Critical Stock</h3>
                        <div className="p-2 bg-red-50 text-red-600 border border-red-100 rounded-xl shadow-sm">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {statsLoading ? (
                            <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin text-gray-300 w-8 h-8"/></div>
                        ) : stats && stats.find(s => s.title === 'Critical Stock')?.details?.length > 0 ? (
                            stats.find(s => s.title === 'Critical Stock').details.map((item, i) => (
                                <div key={i} className="border-b border-gray-50 pb-3 last:border-0 hover:bg-gray-50/50 p-2 rounded-lg transition-colors">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-sm font-bold text-gray-800 truncate pr-2">{item.name}</span>
                                        <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded tracking-wider uppercase whitespace-nowrap whitespace-nowrap flex-shrink-0">
                                            {item.quantity} Left
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-red-500 h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min((item.quantity / (item.min_stock_level || 1)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                <Package className="w-10 h-10 text-gray-300 mb-2" />
                                <p className="text-sm font-bold text-gray-500">Inventory levels stable</p>
                                <p className="text-xs text-gray-400 mt-1">No critical alerts detected.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 md:p-6 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0">
                        <h3 className="text-base md:text-lg font-black text-gray-900 tracking-tight">Recent Transactions</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap min-w-[500px]">
                            <thead className="bg-gray-50/80 text-gray-500 text-[10px] md:text-xs font-black uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 md:px-6 py-3 md:py-4">Transaction ID</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4">Entity</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4">Net Amount</th>
                                    <th className="px-4 md:px-6 py-3 md:py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {ordersLoading ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center">
                                            <Loader2 className="animate-spin text-gray-300 w-8 h-8 mx-auto"/>
                                            <p className="mt-2 text-sm text-gray-400 font-bold">Fetching ledger...</p>
                                        </td>
                                    </tr>
                                ) : (
                                    recentOrders?.length > 0 ? recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-4 md:px-6 py-3 md:py-4 text-sm font-black text-primary-600 cursor-pointer group-hover:text-primary-700">
                                                {order.order_number}
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 text-sm font-bold text-gray-700">
                                                {order.customer_name || 'Walk-in Client'}
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 text-sm font-black text-gray-900">
                                                {currencySymbol}{parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4">
                                                <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase border tracking-wider ${statusColors[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="p-12 text-center bg-gray-50/30">
                                                <ShoppingCart className="mx-auto text-gray-300 mb-3" size={40} />
                                                <h4 className="text-gray-500 font-bold">No transactions found</h4>
                                                <p className="text-gray-400 text-sm mt-1">Initialize sales matrix to see data.</p>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
