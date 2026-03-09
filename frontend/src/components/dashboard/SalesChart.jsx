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
                if (res.data.data.length > 0) return res.data.data;
                return getDefaultData();
            } catch (err) {
                return getDefaultData();
            }
        },
        refetchInterval: 60000,
    });

    const getDefaultData = () => [
        { name: 'Jan', sales: 4000, target: 2400 },
        { name: 'Feb', sales: 3000, target: 1398 },
        { name: 'Mar', sales: 9800, target: 9800 },
        { name: 'Apr', sales: 3908, target: 3908 },
        { name: 'May', sales: 4800, target: 4800 },
        { name: 'Jun', sales: 3800, target: 3800 },
        { name: 'Jul', sales: 4300, target: 4300 },
    ];

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
