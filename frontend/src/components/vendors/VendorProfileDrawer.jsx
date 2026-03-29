import { X, Mail, Phone, MapPin, TrendingUp, DollarSign } from 'lucide-react';

const VendorProfileDrawer = ({ supplier, purchaseOrders, products, onClose }) => {
    if (!supplier) return null;

    const orders = purchaseOrders.filter(o => o.supplier_id == supplier.id);
    const totalPurchased = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    const suppliedProducts = products.filter(p => p.supplier_id == supplier.id).length;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
            <div className="w-full max-w-md md:max-w-lg bg-white shadow-2xl h-full overflow-y-auto animate-slideInRight flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-lg z-10">
                    <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">Vendor Profile</h2>
                    <button onClick={onClose} className="p-2 bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors active:scale-95">
                        <X size={20} />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-4 md:p-6 space-y-6 md:space-y-8 flex-1">
                    {/* Profile Header */}
                    <div className="text-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl md:text-4xl font-black mx-auto shadow-xl shadow-orange-500/30 mb-4 border-4 border-white transform hover:scale-105 transition-transform duration-300">
                            {supplier.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">{supplier.name}</h3>
                        <p className="text-sm font-bold text-gray-500 mt-1">{supplier.email || 'No email'}</p>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 md:p-5 space-y-3 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
                        <h4 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest relative z-10">Contact Snapshot</h4>
                        <div className="space-y-3 mt-3 relative z-10">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 shrink-0"><Mail size={16} /></div>
                                <span className="font-bold text-gray-700 truncate">{supplier.email || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 shrink-0"><Phone size={16} /></div>
                                <span className="font-bold text-gray-700">{supplier.phone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 shrink-0"><MapPin size={16} /></div>
                                <span className="font-bold text-gray-700">{supplier.address || 'No address on file'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Performance Insights */}
                    <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-4 md:p-5 border border-orange-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 text-orange-200"><TrendingUp size={48} className="opacity-50" /></div>
                        <h4 className="text-[10px] sm:text-xs font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10"><TrendingUp size={14} /> Performance</h4>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="bg-white/60 p-3 rounded-xl border border-orange-50">
                                <p className="text-xl md:text-2xl font-black text-gray-900">{orders.length}</p>
                                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Purchase Orders</p>
                            </div>
                            <div className="bg-white/60 p-3 rounded-xl border border-orange-50">
                                <p className="text-xl md:text-2xl font-black text-gray-900">${totalPurchased.toLocaleString(undefined, { notation: "compact", compactDisplay: "short" })}</p>
                                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Total Purchased</p>
                            </div>
                            <div className="bg-white/60 p-3 rounded-xl border border-orange-50">
                                <p className="text-xl md:text-2xl font-black text-gray-900">{suppliedProducts}</p>
                                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Products Supplied</p>
                            </div>
                            <div className="bg-white/60 p-3 rounded-xl border border-orange-50">
                                <p className="text-xl md:text-2xl font-black text-emerald-600">A+</p>
                                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Vendor Rating</p>
                            </div>
                        </div>
                    </div>

                    {/* Purchase History */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">Order Ledger</h4>
                            <span className="text-xs font-bold bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg border border-orange-100">
                                {orders.length} Records
                            </span>
                        </div>
                        
                        {orders.length === 0 ? (
                            <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50">
                                <p className="text-sm font-bold text-gray-400">No purchase orders yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map(order => (
                                    <div key={order.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                        <div>
                                            <p className="font-black text-sm text-gray-900 group-hover:text-orange-600 transition-colors">{order.order_number}</p>
                                            <p className="text-xs font-bold text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-1.5">
                                            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><DollarSign size={12} strokeWidth={3} /></div>
                                            <p className="font-black text-base text-gray-900">{parseFloat(order.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorProfileDrawer;
