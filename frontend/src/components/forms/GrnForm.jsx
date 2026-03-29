import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';

const GrnForm = ({ onSuccess, onCancel }) => {
    const queryClient = useQueryClient();

    // Fetch pending purchase orders
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['purchase-orders'],
        queryFn: () => api.get('/purchases/orders').then(res => res.data.data)
    });

    const pendingOrders = orders.filter(o => o.status !== 'received' && o.status !== 'cancelled');

    const [formData, setFormData] = useState({
        purchase_order_id: '',
        received_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const mutation = useMutation({
        mutationFn: (grnData) => api.post('/purchases/grn', grnData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-data'] });
            onSuccess();
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (isLoading) {
        return <div className="p-6 flex justify-center"><Loader2 className="animate-spin text-primary-500" /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Purchase Order *</label>
                    <select required name="purchase_order_id" value={formData.purchase_order_id} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white outline-none">
                        <option value="">-- Choose Pending PO --</option>
                        {pendingOrders.map(po => (
                            <option key={po.id} value={po.id}>
                                {po.order_number} ({po.supplier_name}) - ${Number(po.total_amount).toFixed(2)}
                            </option>
                        ))}
                    </select>
                    {pendingOrders.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">No pending purchase orders found.</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Received *</label>
                    <input required type="date" name="received_date" value={formData.received_date} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white outline-none" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Receiving Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="All items received in good condition..." />
                </div>

                <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm flex gap-2">
                    <div className="font-semibold text-lg leading-none">ℹ</div>
                    <div>Saving this GRN will automatically increase inventory stock levels for all items in the selected Purchase Order and mark the PO as Received.</div>
                </div>
            </div>

            {/* Error Message */}
            {mutation.isError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                    {mutation.error.response?.data?.message || 'Failed to process GRN. Please try again.'}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={mutation.isPending || pendingOrders.length === 0} className="flex-1 px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg transition-colors flex justify-center items-center disabled:opacity-50">
                    {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Reception'}
                </button>
            </div>
        </form>
    );
};

export default GrnForm;
