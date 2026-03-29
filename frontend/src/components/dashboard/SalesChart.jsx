import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const SalesChart = () => {
    const { data: chartData, isLoading } = useQuery({
        queryKey: ['sales-chart-data'],
        queryFn: async () => {
            try {
                const res = await api.get('/reports/sales-summary');
                if (res.data.data.length > 0) {
                    return res.data.data.map(item => {
                        const date = new Date(item.month || item.date);
                        return {
                            name: date.toLocaleString('default', { month: 'short' }) || 'Month',
                            sales: Number(item.revenue) || 0,
                            target: Number(item.revenue) * 0.8 || 0 // fake target for visuals
                        };
                    });
                }
                return getDefaultData();
            } catch (err) {
                return getDefaultData();
            }
        },
        refetchInterval: 60000,
    });

    const getDefaultData = () => [];

    if (isLoading) return <div className="h-full w-full flex items-center justify-center text-gray-400">Loading Chart...</div>;

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Sales Trends</h3>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} offset={10} />
                        <Tooltip />
                        <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;
