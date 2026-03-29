import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Users, Receipt, Loader2, AlertCircle, Plus, Search, FileText, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { exportToCSV } from '@/utils/exportUtils';
import { generateInvoicePDF } from '@/utils/generateInvoicePDF';
import Modal from '@/components/common/Modal';
import ActionButtons from '@/components/common/ActionButtons';
import CustomerForm from '@/components/forms/CustomerForm';

const Sales = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['sales-data'],
        queryFn: async () => {
            const [ordersRes, customersRes, invoicesRes] = await Promise.all([
                api.get('/sales/orders').catch(() => ({ data: { data: [] } })),
                api.get('/customers').catch(() => ({ data: { data: [] } })),
                api.get('/sales/invoices').catch(() => ({ data: { data: [] } }))
            ]);
            return {
                orders: ordersRes.data.data || [],
                customers: customersRes.data.data || [],
                invoices: invoicesRes.data.data || []
            };
        },
        refetchInterval: 30000,
    });

    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const deleteMutation = useMutation({
        mutationFn: ({ endpoint, id }) => api.delete(`${endpoint}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales-data'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    });

    const handleExport = () => {
        if (!data) return;
        if (activeTab === 'orders') exportToCSV(data.orders, 'SalesOrders_Export');
        if (activeTab === 'customers') exportToCSV(data.customers, 'Customers_Export');
        if (activeTab === 'invoices') exportToCSV(data.invoices, 'Invoices_Export');
    };

    const salesData = data || { orders: [], customers: [], invoices: [] };

    const getFilteredData = (list) => {
        if (!searchTerm) return list;
        return list.filter(item => {
            const str = JSON.stringify(item).toLowerCase();
            return str.includes(searchTerm.toLowerCase());
        });
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 md:gap-3">
                        <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-primary-600" />
                        Sales Hub
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Manage global sales orders, client billing, and revenue streams.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={handleExport} className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 whitespace-nowrap bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-4 md:px-5 py-2.5 font-bold shadow-sm transition-all active:scale-95 text-sm md:text-base">
                        <Download size={18} /> <span className="hidden sm:inline">Export Current Ledger</span><span className="sm:hidden">Export</span>
                    </button>
                    <button
                        onClick={() => {
                            if (activeTab === 'orders') navigate('/sales/new');
                            if (activeTab === 'customers') { setEditingCustomer(null); setIsCustomerModalOpen(true); }
                            if (activeTab === 'invoices') navigate('/invoices/new');
                        }}
                        className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 whitespace-nowrap bg-primary-600 text-white hover:bg-primary-700 rounded-xl px-4 md:px-5 py-2.5 font-bold shadow-md shadow-primary-500/20 transition-all active:scale-95 text-sm md:text-base"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Create {activeTab === 'orders' ? 'Sales Order' : activeTab === 'customers' ? 'Client' : 'Invoice'}</span>
                        <span className="sm:hidden">New {activeTab === 'orders' ? 'Order' : activeTab === 'customers' ? 'Client' : 'Invoice'}</span>
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm overflow-x-auto hide-scrollbar">
                <div className="flex items-center min-w-max">
                    <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 px-6 py-3 text-sm md:text-base font-black rounded-xl transition-all duration-300 ${activeTab === 'orders' ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'}`}>
                        <ShoppingCart size={18} /> Orders <span className="text-[10px] ml-1 bg-primary-100/50 text-primary-600 px-2 py-0.5 rounded-full">{salesData.orders.length}</span>
                    </button>
                    <button onClick={() => setActiveTab('customers')} className={`flex items-center gap-2 px-6 py-3 text-sm md:text-base font-black rounded-xl transition-all duration-300 ${activeTab === 'customers' ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'}`}>
                        <Users size={18} /> Clients <span className="text-[10px] ml-1 bg-primary-100/50 text-primary-600 px-2 py-0.5 rounded-full">{salesData.customers.length}</span>
                    </button>
                    <button onClick={() => setActiveTab('invoices')} className={`flex items-center gap-2 px-6 py-3 text-sm md:text-base font-black rounded-xl transition-all duration-300 ${activeTab === 'invoices' ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'}`}>
                        <Receipt size={18} /> Invoices <span className="text-[10px] ml-1 bg-primary-100/50 text-primary-600 px-2 py-0.5 rounded-full">{salesData.invoices.length}</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full max-w-lg">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={`Search ${activeTab} dataset...`} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm md:text-base font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm" />
                </div>
                <select className="w-full sm:w-auto bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm md:text-base font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm cursor-pointer appearance-none">
                    <option>Filter: All Statuses</option>
                    <option>Filter: Pending</option>
                    <option>Filter: Completed</option>
                    <option>Filter: Cancelled</option>
                </select>
            </div>

            {/* Main Data Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] md:min-h-[500px] overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4">
                        <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-primary-500 animate-spin" />
                        <p className="text-gray-500 font-bold text-sm md:text-base">Synchronizing sales node...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 max-w-md mx-auto text-center p-6 bg-red-50/50 rounded-2xl m-6 border border-red-100">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2"><AlertCircle className="w-6 h-6 md:w-8 md:h-8" /></div>
                        <h3 className="text-lg md:text-xl font-black text-red-900">Connection Terminated</h3>
                        <p className="text-red-700/80 font-medium text-sm md:text-base">The client cannot connect to the backend database server.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto w-full pb-4">
                        {activeTab === 'orders' && (
                            getFilteredData(salesData.orders).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100"><ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-gray-400" /></div>
                                    <h3 className="text-lg md:text-xl font-black text-gray-900">Empty Sales Ledger</h3>
                                    <p className="text-gray-500 text-sm md:text-base font-medium">Create your first sales order to populate this view.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-black border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 md:px-6 py-4">Transaction Reference</th>
                                            <th className="px-4 md:px-6 py-4">Client Entity</th>
                                            <th className="px-4 md:px-6 py-4">Gross Amount</th>
                                            <th className="px-4 md:px-6 py-4">Fulfillment Status</th>
                                            <th className="px-4 md:px-6 py-4">Timestamp</th>
                                            <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {getFilteredData(salesData.orders).map(order => (
                                            <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-4 md:px-6 py-4 font-black text-primary-600 group-hover:text-primary-700 text-sm md:text-base cursor-pointer">
                                                    {order.order_number}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-bold text-gray-800">
                                                    {order.customer_name || 'Walk-in Client'}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-black text-gray-900 bg-gray-50/50">
                                                    ${parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] md:text-xs font-black uppercase tracking-widest border ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : order.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-bold text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-right">
                                                    <ActionButtons
                                                        onEdit={() => navigate(`/sales/${order.id}/edit`)}
                                                        onDelete={() => deleteMutation.mutate({ endpoint: '/sales/orders', id: order.id })}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        )}

                        {activeTab === 'customers' && (
                            getFilteredData(salesData.customers).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100"><Users className="w-8 h-8 md:w-10 md:h-10 text-gray-400" /></div>
                                    <h3 className="text-lg md:text-xl font-black text-gray-900">No Clients Found</h3>
                                    <p className="text-gray-500 text-sm md:text-base font-medium">Create your first client record to see it here.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left min-w-[700px]">
                                    <thead className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-black border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 md:px-6 py-4">Entity Profile</th>
                                            <th className="px-4 md:px-6 py-4">Email Channel</th>
                                            <th className="px-4 md:px-6 py-4">Voice Channel</th>
                                            <th className="px-4 md:px-6 py-4">Origin Branch</th>
                                            <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {getFilteredData(salesData.customers).map(customer => (
                                            <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-4 md:px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center font-black text-primary-700 text-sm md:text-base shrink-0">
                                                            {customer.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-gray-900 text-sm md:text-base">{customer.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-medium text-gray-600">{customer.email || '-'}</td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-medium text-gray-600">{customer.phone || '-'}</td>
                                                <td className="px-4 md:px-6 py-4 text-sm font-bold text-gray-500">
                                                    <span className="bg-gray-100 px-2.5 py-1 rounded uppercase tracking-widest text-[10px]">{customer.branch_name || 'GLOBAL'}</span>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-right">
                                                    <ActionButtons
                                                        onEdit={() => { setEditingCustomer(customer); setIsCustomerModalOpen(true); }}
                                                        onDelete={() => deleteMutation.mutate({ endpoint: '/customers', id: customer.id })}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        )}

                        {activeTab === 'invoices' && (
                            getFilteredData(salesData.invoices).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100"><FileText className="w-8 h-8 md:w-10 md:h-10 text-gray-400" /></div>
                                    <h3 className="text-lg md:text-xl font-black text-gray-900">Empty Invoice Ledger</h3>
                                    <p className="text-gray-500 text-sm md:text-base font-medium">Generate an invoice from a sales order to populate ledger.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left min-w-[750px]">
                                    <thead className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-black border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 md:px-6 py-4">Invoice Hash</th>
                                            <th className="px-4 md:px-6 py-4">Target Entity</th>
                                            <th className="px-4 md:px-6 py-4">Total Settled</th>
                                            <th className="px-4 md:px-6 py-4">Collection Status</th>
                                            <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {getFilteredData(salesData.invoices).map(invoice => (
                                            <tr key={invoice.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-4 md:px-6 py-4 font-black text-primary-600 text-sm md:text-base cursor-pointer group-hover:text-primary-700">
                                                    {invoice.invoice_number}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-bold text-gray-800">
                                                    {invoice.customer_name}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-black text-gray-900 bg-gray-50/50">
                                                    ${parseFloat(invoice.grand_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] md:text-xs font-black uppercase tracking-widest border ${invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : invoice.status === 'Unpaid' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                                        {invoice.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-right flex items-center justify-end gap-2 h-full">
                                                    <button
                                                        onClick={() => generateInvoicePDF(invoice)}
                                                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 active:bg-primary-100 rounded-xl transition-all h-full"
                                                        title="Download PDF Ledger"
                                                    >
                                                        <FileText size={20} />
                                                    </button>
                                                    <ActionButtons onDelete={() => deleteMutation.mutate({ endpoint: '/invoices', id: invoice.id })} />
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

            <Modal isOpen={isCustomerModalOpen} onClose={() => { setIsCustomerModalOpen(false); setEditingCustomer(null); }} title={editingCustomer ? 'Modify Client Record' : 'Initialize Client Node'} maxWidth="max-w-2xl">
                <CustomerForm
                    key={editingCustomer?.id || 'new'}
                    onSuccess={() => { setIsCustomerModalOpen(false); setEditingCustomer(null); }}
                    onCancel={() => { setIsCustomerModalOpen(false); setEditingCustomer(null); }}
                    initialData={editingCustomer}
                />
            </Modal>
        </div>
    );
};

export default Sales;
