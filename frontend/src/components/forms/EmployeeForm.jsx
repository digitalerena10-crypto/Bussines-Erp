import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';

const EmployeeForm = ({ onSuccess, onCancel, initialData = null }) => {
    const queryClient = useQueryClient();
    const isEditing = !!initialData;

    const [formData, setFormData] = useState({
        first_name: initialData?.first_name || '', last_name: initialData?.last_name || '', email: initialData?.email || '',
        designation: initialData?.designation || '', department: initialData?.department || 'Engineering',
        salary: initialData?.salary || '', join_date: initialData?.join_date || new Date().toISOString().split('T')[0]
    });

    const mutation = useMutation({
        mutationFn: (empData) => isEditing ? api.put(`/hr/employees/${initialData.id}`, empData) : api.post('/hr/employees', empData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['hr-data'] });
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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="John" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input required type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Doe" />
                </div>

                <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="john.doe@company.com" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select required name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white outline-none">
                        <option value="Engineering">Engineering</option>
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation / Role *</label>
                    <input required type="text" name="designation" value={formData.designation} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Software Engineer" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary (Annual) *</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                        <input required type="number" step="0.01" name="salary" value={formData.salary} onChange={handleChange} className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="75000" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Join Date *</label>
                    <input required type="date" name="join_date" value={formData.join_date} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white outline-none" />
                </div>
            </div>

            {mutation.isError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                    {mutation.error.response?.data?.message || 'Failed to create employee.'}
                </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={mutation.isPending} className="flex-1 px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg transition-colors flex justify-center items-center">
                    {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : isEditing ? 'Update Employee' : 'Save Employee'}
                </button>
            </div>
        </form>
    );
};

export default EmployeeForm;
