import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';

const CustomerForm = ({ onSuccess, onCancel, initialData = null }) => {
    const queryClient = useQueryClient();
    const isEditing = !!initialData;

    const [formData, setFormData] = useState({
        name: initialData?.name || '', company_name: initialData?.company_name || '', phone: initialData?.phone || '', email: initialData?.email || '',
        address: initialData?.address || '', city: initialData?.city || '', country: initialData?.country || '', tax_number: initialData?.tax_number || '',
        credit_limit: initialData?.credit_limit || '0', notes: initialData?.notes || ''
    });

    const mutation = useMutation({
        mutationFn: (custData) => isEditing ? api.put(`/customers/${initialData.id}`, custData) : api.post('/customers', custData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['sales-data'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            onSuccess();
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({
            ...formData,
            credit_limit: Number(formData.credit_limit) || 0
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="John Doe or Acme Corp" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Optional" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="email@example.com" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="+1 234 567 8900" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax / VAT Number</label>
                    <input type="text" name="tax_number" value={formData.tax_number} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="e.g. US12345678" />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-4 border-t border-gray-100 pt-4 mt-2">
                    <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Billing Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1 sm:col-span-2">
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Street Address" />
                        </div>
                        <div>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="City / State" />
                        </div>
                        <div>
                            <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Country" />
                        </div>
                    </div>
                </div>

                <div className="col-span-1 border-t border-gray-100 pt-4 mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input type="number" step="100" name="credit_limit" value={formData.credit_limit} onChange={handleChange} className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="0.00" />
                    </div>
                </div>

                <div className="col-span-1 border-t border-gray-100 pt-4 mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                    <input type="text" name="notes" value={formData.notes} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Internal remarks..." />
                </div>
            </div>

            {/* Error Message */}
            {mutation.isError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                    {mutation.error.response?.data?.message || 'Failed to create customer. Please try again.'}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={mutation.isPending} className="flex-1 px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg transition-colors flex justify-center items-center">
                    {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : isEditing ? 'Update Customer' : 'Save Customer'}
                </button>
            </div>
        </form>
    );
};

export default CustomerForm;
