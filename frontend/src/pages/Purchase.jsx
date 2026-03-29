import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, ShoppingBag, Receipt, Loader2, AlertCircle, Plus, Search, FileText, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { exportToCSV } from '@/utils/exportUtils';
import Modal from '@/components/common/Modal';
import ActionButtons from '@/components/common/ActionButtons';
import SupplierForm from '@/components/forms/SupplierForm';
import GrnForm from '@/components/forms/GrnForm';

const Purchase = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['purchase-data'],
        queryFn: async () => {
            const [ordersRes, suppliersRes] = await Promise.all([
                api.get('/purchases/orders').catch(() => ({ data: { data: [] } })),
                api.get('/suppliers').catch(() => ({ data: { data: [] } }))
            ]);
            return {
                orders: ordersRes.data.data || [],
                suppliers: suppliersRes.data.data || [],
                grn: []
            };
        },
        refetchInterval: 30000,
    });

    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const deleteMutation = useMutation({
        mutationFn: ({ endpoint, id }) => api.delete(`${endpoint}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-data'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    });

    const purchaseData = data || { orders: [], suppliers: [], grn: [] };

    const getFilteredData = (list) => {
        if (!searchTerm) return list;
        return list.filter(item => {
            const str = JSON.stringify(item).toLowerCase();
            return str.includes(searchTerm.toLowerCase());
        });
    };

    const handleExport = () => {
        if (activeTab === 'orders') exportToCSV(purchaseData.orders, 'PurchaseOrders_Export');
        if (activeTab === 'suppliers') exportToCSV(purchaseData.suppliers, 'Suppliers_Export');
        if (activeTab === 'grn') exportToCSV(purchaseData.grn, 'GRN_Export');
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 md:gap-3">
                        <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
                        Procurement Hub
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Manage suppliers, purchase operations, and goods receiving.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={handleExport} className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 whitespace-nowrap bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-4 md:px-5 py-2.5 font-bold shadow-sm transition-all active:scale-95 text-sm md:text-base">
                        <Download size={18} /> <span className="hidden sm:inline">Export Current Ledger</span><span className="sm:hidden">Export</span>
                    </button>
                    <button
                        onClick={() => {
                            if (activeTab === 'orders') navigate('/purchases/new');
                            if (activeTab === 'suppliers') setIsSupplierModalOpen(true);
                            if (activeTab === 'grn') setIsGrnModalOpen(true);
                        }}
                        className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 whitespace-nowrap bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl px-4 md:px-5 py-2.5 font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95 text-sm md:text-base"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Create {activeTab === 'orders' ? 'Purchase Order' : activeTab === 'suppliers' ? 'Supplier' : 'GRN'}</span>
                        <span className="sm:hidden">New {activeTab === 'orders' ? 'PO' : activeTab === 'suppliers' ? 'Supplier' : 'GRN'}</span>
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm overflow-x-auto hide-scrollbar">
                <div className="flex items-center min-w-max">
                    <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 px-6 py-3 text-sm md:text-base font-black rounded-xl transition-all duration-300 ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'}`}>
                        <ShoppingBag size={18} /> Orders <span className="text-[10px] ml-1 bg-indigo-100/50 text-indigo-600 px-2 py-0.5 rounded-full">{purchaseData.orders.length}</span>
                    </button>
                    <button onClick={() => setActiveTab('suppliers')} className={`flex items-center gap-2 px-6 py-3 text-sm md:text-base font-black rounded-xl transition-all duration-300 ${activeTab === 'suppliers' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'}`}>
                        <Truck size={18} /> Suppliers <span className="text-[10px] ml-1 bg-indigo-100/50 text-indigo-600 px-2 py-0.5 rounded-full">{purchaseData.suppliers.length}</span>
                    </button>
                    <button onClick={() => setActiveTab('grn')} className={`flex items-center gap-2 px-6 py-3 text-sm md:text-base font-black rounded-xl transition-all duration-300 ${activeTab === 'grn' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'}`}>
                        <Receipt size={18} /> Goods Receiving <span className="text-[10px] ml-1 bg-indigo-100/50 text-indigo-600 px-2 py-0.5 rounded-full">{purchaseData.grn.length}</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full max-w-lg">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={`Search ${activeTab} dataset...`} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm md:text-base font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" />
                </div>
                <select className="w-full sm:w-auto bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm md:text-base font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer appearance-none">
                    <option>Filter: All Statuses</option>
                    <option>Filter: Ordered</option>
                    <option>Filter: Received</option>
                    <option>Filter: Cancelled</option>
                </select>
            </div>

            {/* Main Data Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] md:min-h-[500px] overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4">
                        <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-indigo-500 animate-spin" />
                        <p className="text-gray-500 font-bold text-sm md:text-base">Synchronizing procurement node...</p>
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
                            getFilteredData(purchaseData.orders).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100"><ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-gray-400" /></div>
                                    <h3 className="text-lg md:text-xl font-black text-gray-900">Empty Purchase Ledger</h3>
                                    <p className="text-gray-500 text-sm md:text-base font-medium">Create your first purchase order to populate this view.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-black border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 md:px-6 py-4">PO Reference</th>
                                            <th className="px-4 md:px-6 py-4">Supplier Entity</th>
                                            <th className="px-4 md:px-6 py-4">Gross Amount</th>
                                            <th className="px-4 md:px-6 py-4">Fulfillment Status</th>
                                            <th className="px-4 md:px-6 py-4">Expected Date</th>
                                            <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {getFilteredData(purchaseData.orders).map(order => (
                                            <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-4 md:px-6 py-4 font-black text-indigo-600 group-hover:text-indigo-700 text-sm md:text-base cursor-pointer">
                                                    {order.po_number}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-bold text-gray-800">
                                                    {order.supplier_name}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-black text-gray-900 bg-gray-50/50">
                                                    ${parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] md:text-xs font-black uppercase tracking-widest border ${order.status === 'Completed' || order.status === 'Received' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : order.status === 'Pending' || order.status === 'Ordered' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-bold text-gray-500">
                                                    {order.expected_date ? new Date(order.expected_date).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-right">
                                                    <ActionButtons
                                                        onEdit={() => navigate(`/purchases/${order.id}/edit`)}
                                                        onDelete={() => deleteMutation.mutate({ endpoint: '/purchases/orders', id: order.id })}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        )}

                        {activeTab === 'suppliers' && (
                            getFilteredData(purchaseData.suppliers).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100"><Truck className="w-8 h-8 md:w-10 md:h-10 text-gray-400" /></div>
                                    <h3 className="text-lg md:text-xl font-black text-gray-900">No Suppliers Found</h3>
                                    <p className="text-gray-500 text-sm md:text-base font-medium">Create your first supplier record to see it here.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left min-w-[700px]">
                                    <thead className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-black border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 md:px-6 py-4">Supplier Entity</th>
                                            <th className="px-4 md:px-6 py-4">Point of Contact</th>
                                            <th className="px-4 md:px-6 py-4">Email Channel</th>
                                            <th className="px-4 md:px-6 py-4">Voice Channel</th>
                                            <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {getFilteredData(purchaseData.suppliers).map(supplier => (
                                            <tr key={supplier.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-4 md:px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center font-black text-indigo-700 text-sm md:text-base shrink-0">
                                                            {supplier.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-gray-900 text-sm md:text-base">{supplier.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-medium text-gray-600">{supplier.contact_person || '-'}</td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-medium text-gray-600">{supplier.email || '-'}</td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-medium text-gray-600">{supplier.phone || '-'}</td>
                                                <td className="px-4 md:px-6 py-4 text-right">
                                                    <ActionButtons onDelete={() => deleteMutation.mutate({ endpoint: '/suppliers', id: supplier.id })} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        )}

                        {activeTab === 'grn' && (
                            getFilteredData(purchaseData.grn).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100"><FileText className="w-8 h-8 md:w-10 md:h-10 text-gray-400" /></div>
                                    <h3 className="text-lg md:text-xl font-black text-gray-900">Empty GRN Ledger</h3>
                                    <p className="text-gray-500 text-sm md:text-base font-medium">Create a Goods Receiving Note to populate ledger.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left min-w-[700px]">
                                    <thead className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-black border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 md:px-6 py-4">GRN Hash</th>
                                            <th className="px-4 md:px-6 py-4">PO Reference</th>
                                            <th className="px-4 md:px-6 py-4">Received Date</th>
                                            <th className="px-4 md:px-6 py-4">Collection Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {getFilteredData(purchaseData.grn).map(receipt => (
                                            <tr key={receipt.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-4 md:px-6 py-4 font-black text-indigo-600 group-hover:text-indigo-700 text-sm md:text-base cursor-pointer">
                                                    {receipt.grn_number}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-bold text-gray-800">
                                                    {receipt.po_number || '-'}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-bold text-gray-500">
                                                    {new Date(receipt.received_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] md:text-xs font-black uppercase tracking-widest border bg-emerald-50 text-emerald-700 border-emerald-100">Received</span>
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

            <Modal isOpen={isSupplierModalOpen} onClose={() => setIsSupplierModalOpen(false)} title="Initialize Supplier Node" maxWidth="max-w-2xl">
                <SupplierForm onSuccess={() => setIsSupplierModalOpen(false)} onCancel={() => setIsSupplierModalOpen(false)} />
            </Modal>

            <Modal isOpen={isGrnModalOpen} onClose={() => setIsGrnModalOpen(false)} title="Execute Goods Receiving (GRN)" maxWidth="max-w-xl">
                <GrnForm onSuccess={() => setIsGrnModalOpen(false)} onCancel={() => setIsGrnModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Purchase;
