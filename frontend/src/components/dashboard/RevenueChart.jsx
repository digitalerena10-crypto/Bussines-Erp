import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const RevenueChart = () => {
    const { data: chartData, isLoading } = useQuery({
        queryKey: ['revenue-chart-data'],
        queryFn: async () => {
            try {
                const res = await api.get('/reports/sales-summary');
                if (res.data.data.length > 0) {
                    return res.data.data.map(item => {
                        const date = new Date(item.month || item.date);
                        return {
                            name: date.toLocaleString('default', { month: 'short' }) || 'Month',
                            revenue: Number(item.revenue) || 0,
                            expenses: Number(item.revenue) * 0.6 || 0 // simulated expenses
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
            <h3 className="text-sm font-bold text-gray-700 mb-4">Financial Flow</h3>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ fill: '#f9fafb' }} />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;
