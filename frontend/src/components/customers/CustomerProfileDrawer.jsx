import { X, Mail, Phone, MapPin } from 'lucide-react';

const CustomerProfileDrawer = ({ customer, salesOrders, onClose }) => {
    if (!customer) return null;

    const orders = salesOrders.filter(o => o.customer_id == customer.id);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
            <div className="w-full max-w-md md:max-w-lg bg-white shadow-2xl h-full overflow-y-auto animate-slideInRight flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-lg z-10">
                    <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">Customer Profile</h2>
                    <button onClick={onClose} className="p-2 bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors active:scale-95">
                        <X size={20} />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-4 md:p-6 space-y-6 md:space-y-8 flex-1">
                    {/* Profile Header */}
                    <div className="text-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl md:text-4xl font-black mx-auto shadow-xl shadow-primary-500/30 mb-4 border-4 border-white transform hover:scale-105 transition-transform duration-300">
                            {customer.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">{customer.name}</h3>
                        <p className="text-sm font-bold text-gray-500 mt-1">{customer.email || 'No email'}</p>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 md:p-5 space-y-3 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
                        <h4 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest relative z-10">Contact Snapshot</h4>
                        <div className="space-y-3 mt-3 relative z-10">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 shrink-0"><Mail size={16} /></div>
                                <span className="font-bold text-gray-700 truncate">{customer.email || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 shrink-0"><Phone size={16} /></div>
                                <span className="font-bold text-gray-700">{customer.phone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 shrink-0"><MapPin size={16} /></div>
                                <span className="font-bold text-gray-700">{customer.address || 'No address on file'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Purchase History */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">Order Ledger</h4>
                            <span className="text-xs font-bold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-lg border border-primary-100">
                                {orders.length} Records
                            </span>
                        </div>
                        
                        {orders.length === 0 ? (
                            <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50">
                                <p className="text-sm font-bold text-gray-400">No purchases yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map(order => (
                                    <div key={order.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                        <div>
                                            <p className="font-black text-sm text-gray-900 group-hover:text-primary-600 transition-colors">{order.order_number}</p>
                                            <p className="text-xs font-bold text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-base text-gray-900">${parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                            <span className={`inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes Section */}
                    <div>
                        <h4 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-3">CRM Notes</h4>
                        <textarea placeholder="Add internal notes about this client..." rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none shadow-inner" />
                        <div className="mt-3 flex justify-end">
                            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-gray-800 transition-colors">
                                Save Notes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfileDrawer;
