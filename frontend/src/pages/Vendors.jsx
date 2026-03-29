import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Package, DollarSign, Star, Plus, Search, Download, Loader2, AlertCircle } from 'lucide-react';
import api from '@/services/api';
import { exportToCSV } from '@/utils/exportUtils';
import Modal from '@/components/common/Modal';
import SupplierForm from '@/components/forms/SupplierForm';

// Extracted Components
import VendorsTable from '@/components/vendors/VendorsTable';
import VendorProfileDrawer from '@/components/vendors/VendorProfileDrawer';

const Vendors = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    const { data: suppliers = [], isLoading, error } = useQuery({
        queryKey: ['suppliers'],
        queryFn: () => api.get('/suppliers').then(res => res.data.data || []),
    });

    const { data: purchaseOrders = [] } = useQuery({
        queryKey: ['purchase-orders'],
        queryFn: () => api.get('/purchases/orders').then(res => res.data.data || []),
    });

    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => api.get('/products').then(res => res.data.data || []),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/suppliers/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        }
    });

    const filtered = suppliers.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 md:gap-3">
                        <Truck className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
                        Vendor Network
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Manage suppliers, procurement vectors, and supply chain logistics.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={() => exportToCSV(suppliers, 'Vendors_Export')} className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 whitespace-nowrap bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-4 md:px-5 py-2.5 font-bold shadow-sm transition-all active:scale-95 text-sm md:text-base">
                        <Download size={18} /> <span className="hidden sm:inline">Export Index</span><span className="sm:hidden">Export</span>
                    </button>
                    <button onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }} className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 whitespace-nowrap bg-orange-600 text-white hover:bg-orange-700 rounded-xl px-4 md:px-5 py-2.5 font-bold shadow-md shadow-orange-500/20 transition-all active:scale-95 text-sm md:text-base">
                        <Plus size={18} /> <span className="hidden sm:inline">Add Vendor Node</span><span className="sm:hidden">Add Vendor</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <div className="card bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 md:mb-1.5">Network Size</p>
                            <h3 className="text-xl md:text-3xl font-black text-gray-900 leading-none">{suppliers.length}</h3>
                        </div>
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border border-orange-100 bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
                            <Truck className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                    </div>
                </div>
                <div className="card bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 md:mb-1.5">Purchase Orders</p>
                            <h3 className="text-xl md:text-3xl font-black text-gray-900 leading-none">{purchaseOrders.length}</h3>
                        </div>
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                            <Package className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                    </div>
                </div>
                <div className="card bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 md:mb-1.5">Total Spent</p>
                            <h3 className="text-xl md:text-3xl font-black text-gray-900 leading-none tracking-tight">
                                ${purchaseOrders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0).toLocaleString(undefined, { notation: "compact", compactDisplay: "short" })}
                            </h3>
                        </div>
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                            <DollarSign className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                    </div>
                </div>
                <div className="card bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 md:mb-1.5">Supplied SKUs</p>
                            <h3 className="text-xl md:text-3xl font-black text-gray-900 leading-none">{products.filter(p => p.supplier_id).length}</h3>
                        </div>
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border border-violet-100 bg-violet-50 text-violet-600 flex items-center justify-center shadow-sm">
                            <Star className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <input
                    type="text"
                    placeholder="Search vendor matrix by name or ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 md:pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm md:text-base font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
                />
            </div>

            {/* Vendor Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] md:min-h-[500px] overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4">
                        <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-orange-500 animate-spin" />
                        <p className="text-gray-500 font-bold text-sm md:text-base">Establishing network link...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 max-w-md mx-auto text-center p-6 bg-red-50/50 rounded-2xl m-6 border border-red-100">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2">
                            <AlertCircle className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-red-900">Database Offline</h3>
                        <p className="text-red-700/80 font-medium text-sm md:text-base">Failed to fetch vendor records from master node.</p>
                    </div>
                ) : (
                    <VendorsTable
                        suppliers={filtered}
                        purchaseOrders={purchaseOrders}
                        products={products}
                        onEdit={(supplier) => { setEditingSupplier(supplier); setIsModalOpen(true); }}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onViewProfile={setSelectedSupplier}
                    />
                )}
            </div>

            {/* Vendor Profile Drawer */}
            <VendorProfileDrawer
                supplier={selectedSupplier}
                purchaseOrders={purchaseOrders}
                products={products}
                onClose={() => setSelectedSupplier(null)}
            />

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingSupplier(null); }} title={editingSupplier ? 'Update Vendor Protocol' : 'Initialize Vendor Node'} maxWidth="max-w-2xl">
                <SupplierForm
                    key={editingSupplier?.id || 'new'}
                    onSuccess={() => { setIsModalOpen(false); setEditingSupplier(null); }}
                    onCancel={() => { setIsModalOpen(false); setEditingSupplier(null); }}
                    initialData={editingSupplier}
                />
            </Modal>
        </div>
    );
};

export default Vendors;
