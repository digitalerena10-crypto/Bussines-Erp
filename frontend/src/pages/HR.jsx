import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Calendar, CreditCard, Loader2, Plus, Search, CheckCircle, XCircle, Download, AlertCircle } from 'lucide-react';
import api from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { exportToCSV } from '@/utils/exportUtils';
import Modal from '@/components/common/Modal';
import ActionButtons from '@/components/common/ActionButtons';
import EmployeeForm from '@/components/forms/EmployeeForm';

const HR = () => {
    const [activeTab, setActiveTab] = useState('employees');
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();
    const { currencySymbol } = useSettings();

    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const { data: hrData, isLoading, error } = useQuery({
        queryKey: ['hr-data', activeTab],
        queryFn: async () => {
            let endpoint = '';
            if (activeTab === 'employees') endpoint = '/hr/employees';
            else if (activeTab === 'attendance') endpoint = '/hr/attendance';
            else if (activeTab === 'payroll') endpoint = '/hr/payroll';
            
            const response = await api.get(endpoint).catch(() => ({ data: { data: [] } }));
            return response.data.data || [];
        },
        refetchInterval: 30000,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/hr/employees/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hr-data'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    });

    const items = hrData || [];

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        return items.filter(item => {
            const str = JSON.stringify(item).toLowerCase();
            return str.includes(searchTerm.toLowerCase());
        });
    }, [items, searchTerm]);

    const handleExport = () => {
        if (filteredItems.length === 0) return;
        exportToCSV(filteredItems, `HR_${activeTab}_Export`);
    };

    const tabs = [
        { id: 'employees', name: 'Workforce', icon: Users },
        { id: 'attendance', name: 'Time & Attendance', icon: Calendar },
        { id: 'payroll', name: 'Payroll Register', icon: CreditCard },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 md:gap-3">
                        <Users className="w-6 h-6 md:w-8 md:h-8 text-fuchsia-600" />
                        Human Resources
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Manage workforce lifecycle, attendance logic, and global payroll.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={handleExport} className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 whitespace-nowrap bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-4 md:px-5 py-2.5 font-bold shadow-sm transition-all active:scale-95 text-sm md:text-base">
                        <Download size={18} /> <span className="hidden sm:inline">Export Dataset</span><span className="sm:hidden">Export</span>
                    </button>
                    {activeTab === 'employees' && (
                        <button
                            onClick={() => { setEditingEmployee(null); setIsEmployeeModalOpen(true); }}
                            className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 whitespace-nowrap bg-fuchsia-600 text-white hover:bg-fuchsia-700 rounded-xl px-4 md:px-5 py-2.5 font-bold shadow-md shadow-fuchsia-500/20 transition-all active:scale-95 text-sm md:text-base"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Onboard Employee</span>
                            <span className="sm:hidden">Onboard</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm overflow-x-auto hide-scrollbar">
                <div className="flex items-center min-w-max">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                            className={`flex items-center gap-2 px-6 py-3 text-sm md:text-base font-black rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'bg-fuchsia-50 text-fuchsia-700 shadow-sm border border-fuchsia-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'}`}
                        >
                            <tab.icon size={18} /> {tab.name}
                            {activeTab === tab.id && (
                                <span className="text-[10px] ml-1 bg-fuchsia-100/50 text-fuchsia-600 px-2 py-0.5 rounded-full">{items.length}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full max-w-lg">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={`Search ${activeTab} intelligence...`} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm md:text-base font-medium focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 outline-none transition-all shadow-sm" />
                </div>
                <select className="w-full sm:w-auto bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm md:text-base font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 shadow-sm cursor-pointer appearance-none">
                    <option>All Departments</option>
                    <option>Engineering</option>
                    <option>Marketing</option>
                    <option>Operations</option>
                    <option>Sales</option>
                </select>
            </div>

            {/* Main Data Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] md:min-h-[500px] overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4">
                        <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-fuchsia-500 animate-spin" />
                        <p className="text-gray-500 font-bold text-sm md:text-base">Aggregating HR metrics...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 max-w-md mx-auto text-center p-6 bg-red-50/50 rounded-2xl m-6 border border-red-100">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2"><AlertCircle className="w-6 h-6 md:w-8 md:h-8" /></div>
                        <h3 className="text-lg md:text-xl font-black text-red-900">System Offline</h3>
                        <p className="text-red-700/80 font-medium text-sm md:text-base">The HR service backend is currently unreachable.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto w-full pb-4">
                        {activeTab === 'employees' && (
                            filteredItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100"><Users className="w-8 h-8 md:w-10 md:h-10 text-gray-400" /></div>
                                    <h3 className="text-lg md:text-xl font-black text-gray-900">Empty Workforce Logic</h3>
                                    <p className="text-gray-500 text-sm md:text-base font-medium">No personnel units found in the current registry.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left min-w-[900px]">
                                    <thead className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-black border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 md:px-6 py-4">Personnel Profile</th>
                                            <th className="px-4 md:px-6 py-4">Designation Role</th>
                                            <th className="px-4 md:px-6 py-4">Division Unit</th>
                                            <th className="px-4 md:px-6 py-4">Induction Logic</th>
                                            <th className="px-4 md:px-6 py-4">Compensation</th>
                                            <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredItems.map(emp => (
                                            <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-4 md:px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-fuchsia-100 to-fuchsia-200 flex items-center justify-center font-black text-fuchsia-700 text-sm md:text-base shrink-0">
                                                            {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-sm md:text-base group-hover:text-fuchsia-700 transition-colors cursor-pointer">{emp.first_name} {emp.last_name}</div>
                                                            <div className="text-xs md:text-sm text-gray-500 font-medium">{emp.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-bold text-gray-800">
                                                    {emp.designation}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] md:text-xs font-black uppercase tracking-widest border bg-indigo-50 text-indigo-700 border-indigo-100">
                                                        {emp.department}
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-bold text-gray-500">
                                                    {emp.join_date ? new Date(emp.join_date).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-black text-gray-900 bg-gray-50/50">
                                                    {currencySymbol}{parseFloat(emp.salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-right">
                                                    <ActionButtons
                                                        onEdit={() => { setEditingEmployee(emp); setIsEmployeeModalOpen(true); }}
                                                        onDelete={() => deleteMutation.mutate(emp.id)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        )}

                        {activeTab === 'attendance' && (
                            filteredItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100"><Calendar className="w-8 h-8 md:w-10 md:h-10 text-gray-400" /></div>
                                    <h3 className="text-lg md:text-xl font-black text-gray-900">Empty Attendance Ledger</h3>
                                    <p className="text-gray-500 text-sm md:text-base font-medium">No active attendance logs found.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left min-w-[600px]">
                                    <thead className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-black border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 md:px-6 py-4">Log Timestamp</th>
                                            <th className="px-4 md:px-6 py-4">Personnel Protocol</th>
                                            <th className="px-4 md:px-6 py-4">Status Flag</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredItems.map(att => (
                                            <tr key={att.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-4 md:px-6 py-4 text-sm font-bold text-gray-500">
                                                    {att.date ? new Date(att.date).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 font-mono font-black text-gray-600 text-sm md:text-base">
                                                    #{att.employee_id}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] md:text-xs font-black uppercase tracking-widest border ${att.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                        {att.status === 'Present' ? <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                                        {att.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        )}

                        {activeTab === 'payroll' && (
                            filteredItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100"><CreditCard className="w-8 h-8 md:w-10 md:h-10 text-gray-400" /></div>
                                    <h3 className="text-lg md:text-xl font-black text-gray-900">Empty Payroll Register</h3>
                                    <p className="text-gray-500 text-sm md:text-base font-medium">No active payroll batches generated.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left min-w-[700px]">
                                    <thead className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-black border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 md:px-6 py-4">Disbursement Cycle</th>
                                            <th className="px-4 md:px-6 py-4">Personnel Protocol</th>
                                            <th className="px-4 md:px-6 py-4">Net Allocation</th>
                                            <th className="px-4 md:px-6 py-4">Status Flag</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredItems.map(pay => (
                                            <tr key={pay.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-bold text-gray-800">
                                                    {pay.month}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 font-mono font-black text-gray-600 text-sm md:text-base">
                                                    #{pay.employee_id}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-black text-emerald-600 bg-emerald-50/30">
                                                    {currencySymbol}{parseFloat(pay.net_salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] md:text-xs font-black uppercase tracking-widest border bg-blue-50 text-blue-700 border-blue-100">
                                                        <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> {pay.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        )}
                    </div>
                )}
            </div>

            <Modal isOpen={isEmployeeModalOpen} onClose={() => { setIsEmployeeModalOpen(false); setEditingEmployee(null); }} title={editingEmployee ? 'Update Personnel Profile' : 'Initialize Personnel Protocol'} maxWidth="max-w-3xl">
                <EmployeeForm
                    key={editingEmployee?.id || 'new'}
                    onSuccess={() => { setIsEmployeeModalOpen(false); setEditingEmployee(null); }}
                    onCancel={() => { setIsEmployeeModalOpen(false); setEditingEmployee(null); }}
                    initialData={editingEmployee}
                />
            </Modal>
        </div>
    );
};

export default HR;
