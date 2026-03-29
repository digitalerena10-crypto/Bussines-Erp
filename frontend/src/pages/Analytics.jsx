import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Users, Loader2, PieChart, Activity } from 'lucide-react';
import api from '../services/api';

const Analytics = () => {
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => api.get('/reports/dashboard-stats').then(res => res.data.data),
    });

    const { data: salesOrders = [] } = useQuery({
        queryKey: ['sales-orders'],
        queryFn: () => api.get('/sales/orders').then(res => res.data.data || []),
    });

    const { data: purchaseOrders = [] } = useQuery({
        queryKey: ['purchase-orders'],
        queryFn: () => api.get('/purchases/orders').then(res => res.data.data || []),
    });

    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => api.get('/products').then(res => res.data.data || []),
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => api.get('/customers').then(res => res.data.data || []),
    });

    const analytics = useMemo(() => {
        const totalRevenue = salesOrders.filter(o => o.status === 'Completed').reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
        const totalCost = purchaseOrders.filter(o => ['Completed', 'Received'].includes(o.status)).reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
        const grossProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0;

        // Monthly breakdown (simple mock)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const monthlyData = months.slice(0, currentMonth + 1).map((month, i) => ({
            month,
            revenue: Math.round(totalRevenue * (0.6 + Math.random() * 0.8) / (currentMonth + 1)),
            cost: Math.round(totalCost * (0.5 + Math.random() * 0.7) / (currentMonth + 1)),
        }));

        // Top customers
        const customerSpending = customers.map(c => ({
            ...c,
            spent: salesOrders.filter(o => o.customer_id == c.id).reduce((s, o) => s + parseFloat(o.total_amount || 0), 0)
        })).sort((a, b) => b.spent - a.spent);

        // Category breakdown
        const categoryMap = {};
        products.forEach(p => {
            const cat = p.category_name || 'Uncategorized';
            categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });

        return { totalRevenue, totalCost, grossProfit, profitMargin, monthlyData, customerSpending, categoryMap };
    }, [salesOrders, purchaseOrders, products, customers]);

    const maxRevenue = Math.max(...analytics.monthlyData.map(d => d.revenue), 1);

    if (statsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 md:gap-3">
                        <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
                        Business Analytics
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Comprehensive performance insights and financial metrics.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={DollarSign} label="Total Revenue" value={`$${analytics.totalRevenue.toLocaleString()}`} change="+12.5%" trend="up" color="emerald" />
                <KPICard icon={ShoppingCart} label="Total Cost" value={`$${analytics.totalCost.toLocaleString()}`} change="+8.2%" trend="up" color="blue" />
                <KPICard icon={TrendingUp} label="Gross Profit" value={`$${analytics.grossProfit.toLocaleString()}`} change={`${analytics.profitMargin}%`} trend={analytics.grossProfit >= 0 ? "up" : "down"} color="violet" />
                <KPICard icon={Users} label="Total Customers" value={customers.length.toString()} change="+3" trend="up" color="amber" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Bar Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Monthly Revenue</h3>
                            <p className="text-xs text-gray-400 mt-1">Revenue vs Cost comparison</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary-500" /> Revenue</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-400" /> Cost</div>
                        </div>
                    </div>
                    <div className="flex items-end gap-2 h-64">
                        {analytics.monthlyData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: '220px' }}>
                                    <div
                                        className="flex-1 max-w-[20px] bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-md transition-all duration-700 hover:opacity-80"
                                        style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
                                        title={`Revenue: $${d.revenue.toLocaleString()}`}
                                    />
                                    <div
                                        className="flex-1 max-w-[20px] bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-md transition-all duration-700 hover:opacity-80"
                                        style={{ height: `${(d.cost / maxRevenue) * 100}%`, minHeight: '4px' }}
                                        title={`Cost: $${d.cost.toLocaleString()}`}
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Profit & Loss Summary */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Profit & Loss</h3>
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Revenue</span>
                                <span className="font-bold text-emerald-600">${analytics.totalRevenue.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Cost of Goods</span>
                                <span className="font-bold text-orange-600">${analytics.totalCost.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-orange-500 h-full rounded-full" style={{ width: analytics.totalRevenue > 0 ? `${(analytics.totalCost / analytics.totalRevenue) * 100}%` : '0%' }} />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-700">Gross Profit</span>
                                <span className={`text-lg font-black ${analytics.grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    ${analytics.grossProfit.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-400">Profit Margin</span>
                                <span className={`text-sm font-bold ${analytics.grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {analytics.profitMargin}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Customers */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-primary-500" /> Top Customers
                    </h3>
                    {analytics.customerSpending.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No customer data available.</p>
                    ) : (
                        <div className="space-y-3">
                            {analytics.customerSpending.slice(0, 5).map((c, i) => (
                                <div key={c.id} className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-600' : 'bg-gray-300'}`}>
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                            <div className="bg-primary-500 h-full rounded-full transition-all" style={{ width: `${analytics.customerSpending[0]?.spent > 0 ? (c.spent / analytics.customerSpending[0].spent) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                    <span className="font-bold text-sm text-gray-900">${c.spent.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <PieChart size={20} className="text-violet-500" /> Product Categories
                    </h3>
                    {Object.keys(analytics.categoryMap).length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No product data available.</p>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(analytics.categoryMap).map(([cat, count], i) => {
                                const total = products.length;
                                const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
                                const colors = ['bg-primary-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-orange-500'];
                                return (
                                    <div key={cat} className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700">{cat}</span>
                                            <span className="text-xs font-bold text-gray-400">{count} products ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div className={`${colors[i % colors.length]} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-2xl">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                    <Activity className="w-6 h-6 text-primary-400" /> Key Performance Indicators
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Order Value</p>
                        <p className="text-2xl font-black mt-1">
                            ${salesOrders.length > 0 ? Math.round(analytics.totalRevenue / salesOrders.length).toLocaleString() : '0'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Orders per Customer</p>
                        <p className="text-2xl font-black mt-1">
                            {customers.length > 0 ? (salesOrders.length / customers.length).toFixed(1) : '0'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Count</p>
                        <p className="text-2xl font-black mt-1">{products.length}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion Rate</p>
                        <p className="text-2xl font-black mt-1">
                            {salesOrders.length > 0 ? Math.round((salesOrders.filter(o => o.status === 'Completed').length / salesOrders.length) * 100) : 0}%
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ icon: Icon, label, value, change, trend, color }) => {
    const colorMap = {
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'hover:border-emerald-200' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'hover:border-blue-200' },
        violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'hover:border-violet-200' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'hover:border-amber-200' },
    };
    const c = colorMap[color] || colorMap.blue;

    return (
        <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all ${c.border} group`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1 tabular-nums">{value}</h3>
                </div>
                <div className={`p-3.5 ${c.bg} ${c.text} rounded-2xl group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
                <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {change}
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">vs last month</span>
            </div>
        </div>
    );
};

export default Analytics;
