import { useQuery } from '@tanstack/react-query';
import {
    DollarSign, ShoppingCart, Package, Users, TrendingUp,
    TrendingDown, AlertTriangle, Clock, Loader2
} from 'lucide-react';
import api from '../services/api';
import SalesChart from '../components/dashboard/SalesChart';
import RevenueChart from '../components/dashboard/RevenueChart';
import DigitalClock from '../components/dashboard/DigitalClock';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { isAuthenticated } = useAuth();

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
        Completed: 'bg-emerald-100 text-emerald-700',
        Processing: 'bg-blue-100 text-blue-700',
        Pending: 'bg-amber-100 text-amber-700',
    };

    const getStatStyle = (title) => {
        switch (title) {
            case 'Total Revenue': return { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-200' };
            case 'Total Sales': return { icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200' };
            case 'Products': return { icon: Package, color: 'text-violet-600', bg: 'bg-violet-50', border: 'hover:border-violet-200' };
            case 'Employees': return { icon: Users, color: 'text-amber-600', bg: 'bg-amber-50', border: 'hover:border-amber-200' };
            default: return { icon: Package, color: 'text-gray-600', bg: 'bg-gray-50', border: 'hover:border-gray-200' };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise Dashboard</h1>
                    <p className="text-sm text-gray-500 font-medium">Real-time business intelligence and operations.</p>
                </div>
                <DigitalClock />
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {statsLoading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                    ))
                ) : (
                    stats?.map((card) => {
                        const style = getStatStyle(card.title);
                        const Icon = style.icon;
                        return (
                            <div key={card.title} className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 ${style.border} group`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{card.title}</p>
                                        <h3 className="text-2xl font-black text-gray-900 mt-1 tabular-nums">
                                            {card.isCurrency && (card.currencySymbol || '$')}
                                            {card.value.toLocaleString()}
                                        </h3>
                                    </div>
                                    <div className={`p-3.5 ${style.bg} ${style.color} rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={24} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${card.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {card.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        {card.change}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">vs last month</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[400px]">
                    <SalesChart />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[400px]">
                    <RevenueChart />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stock Alerts */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Critical Stock</h3>
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {stats && stats.find(s => s.title === 'Critical Stock')?.details?.length > 0 ? (
                            stats.find(s => s.title === 'Critical Stock').details.map((item, i) => (
                                <div key={i} className="border-b border-gray-50 pb-3 last:border-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-800">{item.name}</span>
                                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                            {item.quantity} Left
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className="bg-red-500 h-full rounded-full"
                                            style={{ width: `${(item.quantity / item.min_stock_level) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-gray-400 text-sm">No alerts</div>
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {ordersLoading ? (
                                    <tr><td colSpan="4" className="p-6 text-center text-gray-400">Loading...</td></tr>
                                ) : (
                                    recentOrders?.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-blue-600">{order.order_number}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{order.customer_name || 'Guest'}</td>
                                            <td className="px-6 py-4 text-sm font-bold">${parseFloat(order.total_amount).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
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
